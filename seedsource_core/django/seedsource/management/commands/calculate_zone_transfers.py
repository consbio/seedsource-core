import json
import math
import os
from statistics import mean

import numpy
from django.conf import settings
from django.contrib.gis.geos import Polygon
from django.core.management import BaseCommand
from django.db import transaction
from ncdjango.models import Service
from netCDF4 import Dataset
from pyproj import Proj
from rasterio.features import rasterize
from seedsource_core.django.seedsource.models import TransferLimit, Region, ZoneSource
from trefoil.geometry.bbox import BBox
from trefoil.netcdf.variable import SpatialCoordinateVariables

from ..utils import ZoneConfig

VARIABLES = (
    'MAT', 'MWMT', 'MCMT', 'TD', 'MAP', 'MSP', 'AHM', 'SHM', 'DD_0', 'DD5', 'FFP', 'PAS', 'EMT', 'EXT', 'Eref', 'CMD'
)


class Command(BaseCommand):
    help = 'Calculates default variable transfer limits for each available seed zone'

    def __init__(self, *args, **kwargs):
        self.transfers_by_source = {}

        super().__init__(*args, **kwargs)

    def add_arguments(self, parser):
        parser.add_argument('source_name', nargs='?', type=str, default='all', help='Accepts zone name or all')

    def _get_subsets(self, elevation, data, coords: SpatialCoordinateVariables, bbox):
        """ Returns subsets of elevation, data, and coords, clipped to the given bounds """

        x_slice = slice(*coords.x.indices_for_range(bbox.xmin, bbox.xmax))
        y_slice = slice(*coords.y.indices_for_range(bbox.ymin, bbox.ymax))

        return elevation[y_slice, x_slice], data[y_slice, x_slice], coords.slice_by_bbox(bbox)

    def _write_limit(self, variable, time_period, zone, masked_data, low=None, high=None, label=None):
        min_value = numpy.nanmin(masked_data)
        max_value = numpy.nanmax(masked_data)
        transfer = (max_value - min_value) / 2.0
        center = max_value - transfer

        if numpy.isnan(transfer) or hasattr(transfer, 'mask'):
            self.stdout.write('WARNING: Transfer limit is NaN for {}, zone {}, band {}-{}'.format(
                zone.zone_source.name, zone.zone_id, low, high
            ))
            return

        TransferLimit.objects.create(
            variable=variable, time_period=time_period, zone=zone, transfer=transfer, center=center, low=low,
            high=high, label=label
        )

        transfers_by_variable = self.transfers_by_source.get(zone.zone_source.name, {})
        transfers_by_variable[variable] = transfers_by_variable.get(variable, []) + [transfer]
        self.transfers_by_source[zone.zone_source.name] = transfers_by_variable

    def handle(self, source_name, *args, **options):
        if source_name == 'all':
            sources = ZoneSource.objects.all()
        else:
            sources = ZoneSource.objects.filter(name=source_name)

        if not sources.exists():
            self.stderr.write('Error: Zones for {} do not exist'.format(source_name))
            self.stderr.write('Choices are:\n\t- {}'.format('\n\t- '.join(s.name for s in ZoneSource.objects.all())))
            return

        message = 'WARNING: This will replace "{}" transfer limits. Do you want to continue? [y/n]'.format(source_name)
        if input(message).lower() not in {'y', 'yes'}:
            return

        self.transfers_by_source = {}

        with transaction.atomic():
            for source in sources:
                TransferLimit.objects.filter(zone__source=source).delete()

                last_region = None

                with ZoneConfig(source.name) as config:
                    zones = source.seedzone_set.all()
                    for time_period in ('1961_1990', '1981_2010'):
                        for variable in VARIABLES:
                            self.stdout.write('Processing {} for {}...'.format(variable, time_period))

                            for zone in zones:
                                self.stdout.write(zone.name)
                                region = Region.objects.filter(
                                    polygons__intersects=Polygon.from_bbox(zone.polygon.extent)
                                ).first()

                                if region is None:
                                    self.stderr.write('Could not find region for seed zone ' + zone.name)
                                    continue

                                if region != last_region:
                                    last_region = region

                                    self.stdout.write('Loading region {}'.format(region.name))

                                    elevation_service = Service.objects.get(name='{}_dem'.format(region.name))
                                    elevation_variable = elevation_service.variable_set.first()
                                    dataset_path = os.path.join(
                                        settings.NC_SERVICE_DATA_ROOT, elevation_service.data_path
                                    )

                                    with Dataset(dataset_path) as ds:
                                        coords = SpatialCoordinateVariables.from_dataset(
                                            ds, x_name=elevation_variable.x_dimension,
                                            y_name=elevation_variable.y_dimension,
                                            projection=Proj(elevation_service.projection)
                                        )
                                        elevation = ds.variables[elevation_variable.variable][:]

                                    variable_service = Service.objects.get(
                                        name='{}_{}Y_{}'.format(region.name, time_period, variable)
                                    )
                                    dataset_path = os.path.join(
                                        settings.NC_SERVICE_DATA_ROOT, variable_service.data_path
                                    )
                                    with Dataset(dataset_path) as ds:
                                        data = ds.variables[variable][:]

                                bbox = BBox(zone.polygon.extent)
                                try:
                                    clipped_elevation, clipped_data, clipped_coords = self._get_subsets(
                                        elevation, data, coords, bbox
                                    )

                                    zone_mask = rasterize(
                                        ((json.loads(zone.polygon.geojson), 1),), out_shape=clipped_elevation.shape,
                                        transform=clipped_coords.affine, fill=0, dtype=numpy.dtype('uint8')
                                    )

                                    # If all data are masked out, re-rasterize with `all-touched=True`
                                    if (zone_mask == 0).all():
                                        zone_mask = rasterize(
                                            ((json.loads(zone.polygon.geojson), 1),), out_shape=clipped_elevation.shape,
                                            transform=clipped_coords.affine, fill=0, dtype=numpy.dtype('uint8'),
                                            all_touched=True
                                        )
                                except (AssertionError, IndexError):  # trefoil throws exceptions for 1-cell slices
                                    x_start, x_end = coords.x.indices_for_range(bbox.xmin, bbox.xmax)
                                    if x_start == x_end:
                                        x_end += 1

                                    y_start, y_end = coords.y.indices_for_range(bbox.ymin, bbox.ymax)
                                    if y_start == y_end:
                                        y_end += 1

                                    clipped_elevation = elevation[y_start:y_end, x_start:x_end]
                                    clipped_data = elevation[y_start:y_end, x_start:x_end]

                                    zone_mask = numpy.ones(clipped_elevation.shape)

                                masked_dem = numpy.ma.masked_where(zone_mask == 0, clipped_elevation)

                                # If all data are masked out at this point, skip this zone (it's probably in the ocean)
                                if masked_dem.mask.all():
                                    continue

                                min_elevation = max(math.floor(numpy.nanmin(masked_dem) / 0.3048), 0)
                                max_elevation = math.ceil(numpy.nanmax(masked_dem) / 0.3048)
                                bands = list(config.get_elevation_bands(zone, min_elevation, max_elevation))

                                if not bands:
                                    self.stderr.write('WARNING: No elevation bands found for {}, zone {}'.format(
                                        zone.zone_source.name, zone.zone_id
                                    ))
                                    continue

                                for band in bands:
                                    low, high = band[:2]
                                    label = None
                                    if len(band) == 3:
                                        label = band[2]

                                    # Elevation bands are represented in feet
                                    masked_data = numpy.ma.masked_where(
                                        (zone_mask == 0) | (clipped_elevation < low * 0.3048) |
                                        (clipped_elevation > high * 0.3048),
                                        clipped_data
                                    )

                                    self._write_limit(variable, time_period, zone, masked_data, low, high, label)

            for source_name, transfers_by_variable in self.transfers_by_source.items():
                for variable, transfers in transfers_by_variable.items():
                    TransferLimit.objects.filter(
                        variable=variable, zone__zone_source__name=source_name
                    ).update(
                        avg_transfer=mean(transfers)
                    )
