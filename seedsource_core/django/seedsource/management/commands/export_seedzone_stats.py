import errno
import json
import math
import os
import time
from csv import DictWriter

import numpy
from django.conf import settings
from django.contrib.gis.geos import Polygon
from django.core.management import BaseCommand
from ncdjango.models import Service
from netCDF4 import Dataset
from pyproj import Proj
from rasterio.features import rasterize
from seedsource_core.django.seedsource.management.utils import ZoneConfig
from seedsource_core.django.seedsource.models import SeedZone, Region, ZoneSource
from trefoil.geometry.bbox import BBox
from trefoil.netcdf.variable import SpatialCoordinateVariables
from trefoil.utilities.window import Window

VARIABLES = (
    'AHM', 'CMD', 'DD5', 'DD_0', 'EMT', 'Eref', 'EXT', 'FFP', 'MAP', 'MAT', 'MCMT', 'MSP', 'MWMT', 'PAS', 'SHM', 'TD'
)


class Command(BaseCommand):
    help = 'Export seed zone statistics and sample data'

    def add_arguments(self, parser):
        parser.add_argument('output_directory', nargs=1, type=str)

    def _get_subsets(self, elevation, data, coords: SpatialCoordinateVariables, bbox):
        """ Returns subsets of elevation, data, and coords, clipped to the given bounds """

        x_slice = slice(*coords.x.indices_for_range(bbox.xmin, bbox.xmax))
        y_slice = slice(*coords.y.indices_for_range(bbox.ymin, bbox.ymax))

        if x_slice.stop - x_slice.start < 1:
            x_slice = slice(x_slice.start, x_slice.start + 1)
        if y_slice.stop - y_slice.start < 1:
            y_slice = slice(y_slice.start, y_slice.start + 1)

        return elevation[y_slice, x_slice], data[y_slice, x_slice], coords.slice_by_window(Window(y_slice, x_slice))

    def _write_row(self, writer, variable, zone_file, zone_id, masked_data, band):
        min_value = numpy.nanmin(masked_data)
        max_value = numpy.nanmax(masked_data)
        transfer = (max_value - min_value) / 2.0
        center = max_value - transfer

        nan_data = masked_data.astype(numpy.float32)
        nan_data[masked_data.mask] = numpy.nan
        p5 = numpy.nanpercentile(nan_data, 5)
        p95 = numpy.nanpercentile(nan_data, 95)
        p_transfer = (p95 - p5) / 2.0
        p_center = p95 - p_transfer

        low, high = band[:2]
        label = None
        if len(band) > 2:
            label = band[2]

        writer.writerow({
            'samples': os.path.join(
                '{}_samples'.format(variable), '{}_zone_{}_{}_{}.txt'.format(zone_file, zone_id, low, high)
            ),
            'zone_file': zone_file,
            'zone': zone_id,
            'band_low': low,
            'band_high': high,
            'band_label': label,
            'median': float(numpy.ma.median(masked_data)),
            'mean': numpy.nanmean(masked_data),
            'min': min_value,
            'max': max_value,
            'transfer': transfer,
            'center': center,
            'p5': p5,
            'p95': p95,
            'p_transfer': p_transfer,
            'p_center': p_center
        })

    def _write_sample(self, output_directory, variable, zone_file, zone_id, masked_data, low, high):
        sample = masked_data.compressed()  # Discard masked values
        numpy.random.shuffle(sample)
        sample = sample[:1000]

        filename = '{}_zone_{}_{}_{}.txt'.format(zone_file, zone_id, low, high).replace('/', '_')

        with open(os.path.join(output_directory, '{}_samples'.format(variable), filename), 'w') as f:
            f.write(','.join(str(x) for x in sample))
            f.write(os.linesep)

    def handle(self, output_directory, *args, **kwargs):
        output_directory = output_directory[0]

        seed = input('Enter random seed (leave blank to auto-generate): ')
        if not seed:
            seed = int(time.time())

        print('Using random seed: {}'.format(int(seed)))
        numpy.random.seed(seed)

        for variable in VARIABLES:
            print('Processing {}...'.format(variable))

            try:
                os.mkdir(os.path.join(output_directory, '{}_samples'.format(variable)))
            except OSError as ex:
                if ex.errno != errno.EEXIST:
                    raise

            with open(os.path.join(output_directory, '{}.csv'.format(variable)), 'w') as f_out:
                writer = DictWriter(
                    f_out, fieldnames=[
                        'samples', 'zone_file', 'zone', 'band_low', 'band_high', 'band_label', 'median', 'mean', 'min',
                        'max', 'transfer', 'center', 'p5', 'p95', 'p_transfer', 'p_center'
                    ])
                writer.writeheader()

                last_region = None

                for source in ZoneSource.objects.all():
                    with ZoneConfig(source.name) as config:
                        for zone in source.seedzone_set.all():
                            region = Region.objects.filter(
                                polygons__intersects=Polygon.from_bbox(zone.polygon.extent)
                            ).first()

                            if region != last_region:
                                last_region = region

                                print('Loading region {}'.format(region.name))

                                elevation_service = Service.objects.get(name='{}_dem'.format(region.name))
                                dataset_path = os.path.join(settings.NC_SERVICE_DATA_ROOT, elevation_service.data_path)

                                with Dataset(dataset_path) as ds:
                                    coords = SpatialCoordinateVariables.from_dataset(
                                        ds, x_name='lon', y_name='lat', projection=Proj(elevation_service.projection)
                                    )
                                    elevation = ds.variables['elevation'][:]

                                variable_service = Service.objects.get(
                                    name='{}_1961_1990Y_{}'.format(region.name, variable)
                                )
                                dataset_path = os.path.join(settings.NC_SERVICE_DATA_ROOT, variable_service.data_path)
                                with Dataset(dataset_path) as ds:
                                    data = ds.variables[variable][:]

                            clipped_elevation, clipped_data, clipped_coords = self._get_subsets(
                                elevation, data, coords, BBox(zone.polygon.extent)
                            )

                            zone_mask = rasterize(
                                ((json.loads(zone.polygon.geojson), 1),), out_shape=clipped_elevation.shape,
                                transform=clipped_coords.affine, fill=0, dtype=numpy.dtype('uint8')
                            )

                            masked_dem = numpy.ma.masked_where(zone_mask == 0, clipped_elevation)
                            min_elevation = max(math.floor(numpy.nanmin(masked_dem) / 0.3048), 0)
                            max_elevation = math.ceil(numpy.nanmax(masked_dem) / 0.3048)

                            bands = list(config.get_elevation_bands(zone, min_elevation, max_elevation))
                            if bands is None:
                                continue

                            for band in bands:
                                low, high = band[:2]

                                # Elevation bands are represented in feet
                                masked_data = numpy.ma.masked_where(
                                    (zone_mask == 0) | (clipped_elevation < low * 0.3048) |
                                    (clipped_elevation > high * 0.3048),
                                    clipped_data
                                )

                                self._write_row(writer, variable, zone.name, zone.zone_id, masked_data, band)
                                self._write_sample(output_directory, variable, zone.name, zone.zone_id, masked_data, low,
                                                   high)
