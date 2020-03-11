import errno
import json
import math
import os
import time
from collections import defaultdict
from csv import DictWriter

import numpy
from progress.bar import Bar
from django.conf import settings
from django.contrib.gis.geos import Polygon
from django.contrib.gis.db.models.functions import Area, Intersection, MakeValid
from django.core.management import BaseCommand, CommandError
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
    "AHM",
    "CMD",
    "DD5",
    "DD_0",
    "EMT",
    "Eref",
    "EXT",
    "FFP",
    "MAP",
    "MAT",
    "MCMT",
    "MSP",
    "MWMT",
    "PAS",
    "SHM",
    "TD",
)

VARIABLE_NAME = "{}_1961_1990Y_{}"

HEADER = [
    "samples",
    "zone_file",
    "zone",
    "zone_acres",
    "zone_band_pixels",
    "band_low",
    "band_high",
    "band_label",
    "median",
    "mean",
    "min",
    "max",
    "transfer",
    "center",
    "p1",
    "p5",
    "p95",
    "p99",
    "p5_95_transfer",
    "p5_95_center",
    "p1_99_transfer",
    "p1_99_center",
]


class Command(BaseCommand):
    help = "Export seed zone statistics and sample data"

    def add_arguments(self, parser):
        parser.add_argument("output_directory", nargs=1, type=str)

        parser.add_argument(
            "--zones",
            dest="zoneset",
            default=None,
            help="Comma delimited list of zones sets to analyze. (default is to analyze all available zone sets)",
        )
        parser.add_argument(
            "--variables",
            dest="variables",
            default=None,
            help="Comma delimited list of variables analyze. (default is to analyze all available variables)",
        )

    def _get_elevation(self, region_name):
        elevation_service = Service.objects.get(name="{}_dem".format(region_name))
        dataset_path = os.path.join(
            settings.NC_SERVICE_DATA_ROOT, elevation_service.data_path,
        )

        elevation_variable = elevation_service.variable_set.first()

        ds = Dataset(dataset_path)
        coords = SpatialCoordinateVariables.from_dataset(
            ds,
            x_name=elevation_variable.x_dimension,
            y_name=elevation_variable.y_dimension,
            projection=Proj(elevation_service.projection),
        )

        variable = ds.variables[elevation_variable.name]
        variable.set_auto_mask(False)
        nodata = variable._FillValue

        return variable, coords, nodata

    def _get_variable(self, region_name, variable_name):
        variable_service = Service.objects.get(
            name=VARIABLE_NAME.format(region_name, variable_name)
        )
        dataset_path = os.path.join(
            settings.NC_SERVICE_DATA_ROOT, variable_service.data_path,
        )

        ds = Dataset(dataset_path)
        variable = ds.variables[variable_name]
        variable.set_auto_mask(False)

        nodata = variable._FillValue

        return variable, nodata

    def _get_read_window(self, coords, extent):
        # Calculate indexes to slice based on extent
        bbox = BBox(extent)
        x_slice = slice(*coords.x.indices_for_range(bbox.xmin, bbox.xmax))
        y_slice = slice(*coords.y.indices_for_range(bbox.ymin, bbox.ymax))

        if x_slice.stop - x_slice.start < 1:
            x_slice = slice(x_slice.start, x_slice.start + 1)
        if y_slice.stop - y_slice.start < 1:
            y_slice = slice(y_slice.start, y_slice.start + 1)

        # get transform object for the slices
        transform = coords.slice_by_window(Window(y_slice, x_slice)).affine

        return (y_slice, x_slice), transform

    def _write_row(self, writer, variable, zone_file, zone_id, data, band, acres):
        data = data[data != numpy.nan]

        min_value = data.min()
        max_value = data.max()
        transfer = (max_value - min_value) / 2.0
        center = max_value - transfer

        p1, p5, p50, p95, p99 = numpy.percentile(data, [1, 5, 50, 95, 99])

        p5_95_transfer = (p95 - p5) / 2.0
        p5_95_center = p95 - p5_95_transfer

        p1_99_transfer = (p99 - p1) / 2.0
        p1_99_center = p99 - p1_99_transfer

        low, high = band[:2]
        label = None
        if len(band) > 2:
            label = band[2]

        results = {
            "samples": os.path.join(
                "{}_samples".format(variable),
                "{}_zone_{}_{}_{}.txt".format(zone_file, zone_id, low, high),
            ),
            "zone_file": zone_file,
            "zone": zone_id,
            "zone_acres": acres,
            "zone_band_pixels": len(data),
            "band_low": low,
            "band_high": high,
            "band_label": label,
            "median": p50,
            "mean": data.mean(),
            "min": min_value,
            "max": max_value,
            "transfer": transfer,
            "center": center,
            "p1": p1,
            "p5": p5,
            "p95": p95,
            "p99": p99,
            "p5_95_transfer": p5_95_transfer,
            "p5_95_center": p5_95_center,
            "p1_99_transfer": p1_99_transfer,
            "p1_99_center": p1_99_center,
        }

        writer.writerow(results)

    def _write_sample(
        self, output_directory, variable, zone_file, zone_id, data, low, high
    ):
        sample = data.copy()
        numpy.random.shuffle(sample)
        sample = sample[:1000]

        filename = "{}_zone_{}_{}_{}.txt".format(zone_file, zone_id, low, high).replace(
            "/", "_"
        )

        with open(
            os.path.join(output_directory, "{}_samples".format(variable), filename), "w"
        ) as f:
            f.write(",".join(str(x) for x in sample))
            f.write(os.linesep)

    def handle(self, output_directory, zoneset, variables, *args, **kwargs):
        output_directory = output_directory[0]

        if not os.path.exists(output_directory):
            os.makedirs(output_directory)

        if zoneset is None or zoneset.strip() == "":
            sources = ZoneSource.objects.all()
            if len(sources) == 0:
                raise CommandError("No zonesets available to analyze")

        else:
            sources = ZoneSource.objects.filter(name__in=zoneset.split(","))
            if len(sources) == 0:
                raise CommandError(
                    "No zonesets available to analyze that match --zones values"
                )

        if variables is None:
            variables = VARIABLES

        else:
            variables = [v for v in variables.split(",") if v in set(VARIABLES)]
            if len(variables) == 0:
                raise CommandError(
                    "No variables available to analyze that match --variables values"
                )

        ### Initialize random seed
        seed = input("Enter random seed (leave blank to auto-generate): ")
        if seed:
            seed = int(seed)
        else:
            seed = int(time.time())

        print("Using random seed: {}".format(seed))
        numpy.random.seed(seed)

        ### Open all output files
        fps = {}
        writers = {}
        for variable in variables:
            sample_dir = os.path.join(output_directory, "{}_samples".format(variable))
            if not os.path.exists(sample_dir):
                os.makedirs(sample_dir)

            fp = open(os.path.join(output_directory, "{}.csv".format(variable)), "w")
            fps[variable] = fp

            writer = DictWriter(fp, fieldnames=HEADER,)
            writer.writeheader()
            writers[variable] = writer

        last_region = None
        for source in sources:
            zones = source.seedzone_set.annotate(area_meters=Area("polygon")).all()

            with ZoneConfig(source.name) as config:
                # for zone in source.seedzone_set.all():
                for zone in Bar(
                    "Processing {} zones".format(source.name),
                    max=source.seedzone_set.count(),
                ).iter(zones):

                    acres = round(zone.area_meters.sq_m * 0.000247105, 1)

                    extent = Polygon.from_bbox(zone.polygon.extent)
                    regions = Region.objects.filter(polygons__intersects=extent)

                    if len(regions) == 1:
                        region = regions.first()
                    else:
                        # calculate amount of overlap
                        region = (
                            regions.annotate(
                                overlap=Area(Intersection("polygons", extent))
                            )
                            .order_by("-overlap")
                            .first()
                        )
                        # print("region", region.name)

                    if region != last_region:
                        last_region = region

                        elevation_var, coords, nodata = self._get_elevation(region.name)
                        variable_vars = {
                            variable: self._get_variable(region.name, variable)
                            for variable in variables
                        }

                    idx, transform = self._get_read_window(coords, zone.polygon.extent)

                    # Convert elevation from meters to feet
                    clipped_elevation = elevation_var[idx] / 0.3048

                    zone_mask = rasterize(
                        (json.loads(zone.polygon.geojson),),
                        out_shape=clipped_elevation.shape,
                        transform=transform,
                        fill=1,  # mask is True OUTSIDE the zone
                        default_value=0,
                        dtype=numpy.dtype("uint8"),
                    ).astype("bool")

                    nodata_mask = clipped_elevation == nodata
                    mask = nodata_mask | zone_mask

                    # extract all data not masked out as nodata or outside zone
                    masked_dem = clipped_elevation[~mask]

                    min_elevation = max(math.floor(numpy.nanmin(masked_dem)), 0)
                    max_elevation = math.ceil(numpy.nanmax(masked_dem))

                    bands = list(
                        config.get_elevation_bands(zone, min_elevation, max_elevation)
                    )

                    for variable in variables:
                        # extract data within mask and flatten to 1D
                        var_data, var_nodata = variable_vars[variable]

                        # extract data with same shape as masked_dem above
                        clipped_data = var_data[idx][~mask]

                        for band in bands:
                            low, high = band[:2]

                            band_mask = (masked_dem >= low) & (masked_dem <= high)

                            if not numpy.any(band_mask):
                                continue

                            # extract data within elevation range
                            masked_data = clipped_data[band_mask]

                            # then apply variable's nodata mask
                            masked_data = masked_data[masked_data != var_nodata]

                            if not len(masked_data):
                                continue

                            self._write_row(
                                writers[variable],
                                variable,
                                zone.name,
                                zone.zone_id,
                                masked_data,
                                band,
                                acres,
                            )

                            # results[variable].append(result)

                            sample_dir = os.path.join(
                                output_directory, "{}_samples".format(variable)
                            )

                            self._write_sample(
                                output_directory,
                                variable,
                                zone.name,
                                zone.zone_id,
                                masked_data,
                                low,
                                high,
                            )

        for variable in variables:
            fps[variable].close()
