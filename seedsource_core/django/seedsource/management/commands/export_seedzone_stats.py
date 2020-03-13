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
from django.core.management import BaseCommand, CommandError
from django.contrib.gis.db.models.functions import Area
from rasterio.features import rasterize
from seedsource_core.django.seedsource.management.constants import VARIABLES
from seedsource_core.django.seedsource.management.utils import (
    get_region_for_zone,
    calculate_pixel_area,
)
from seedsource_core.django.seedsource.management.dataset import (
    ElevationDataset,
    ClimateDatasets,
)
from seedsource_core.django.seedsource.management.statswriter import StatsWriters
from seedsource_core.django.seedsource.management.zoneconfig import ZoneConfig
from seedsource_core.django.seedsource.models import SeedZone, Region, ZoneSource


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

        parser.add_argument(
            "--seed",
            dest="seed",
            default=None,
            help="Seed for random number generator, to reproduce previous random samples",
            type=int,
        )

    def _write_sample(self, output_directory, variable, id, zone_id, data, low, high):
        sample = data.copy()
        numpy.random.shuffle(sample)
        sample = sample[:1000]

        filename = "{}_{}_{}.txt".format(id, low, high)

        with open(
            os.path.join(output_directory, "{}_samples".format(variable), filename), "w"
        ) as f:
            f.write(",".join(str(x) for x in sample))
            f.write(os.linesep)

    def handle(self, output_directory, zoneset, variables, seed, *args, **kwargs):
        output_directory = output_directory[0]

        if zoneset is None or zoneset.strip() == "":
            sources = ZoneSource.objects.all().order_by("name")
            if len(sources) == 0:
                raise CommandError("No zonesets available to analyze")

        else:
            sources = ZoneSource.objects.filter(name__in=zoneset.split(",")).order_by(
                "name"
            )
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
        if seed is None:
            seed = int(time.time())
            print("Using random seed: {}".format(seed))

        numpy.random.seed(seed)

        ### Create output directories
        if not os.path.exists(output_directory):
            os.makedirs(output_directory)

        for variable in variables:
            sample_dir = os.path.join(output_directory, "{}_samples".format(variable))
            if not os.path.exists(sample_dir):
                os.makedirs(sample_dir)

        with StatsWriters(output_directory, variables) as writer:
            for source in sources:
                zones = (
                    source.seedzone_set.annotate(area_meters=Area("polygon"))
                    .all()
                    .order_by("zone_id")
                )

                with ZoneConfig(
                    source.name
                ) as config, ElevationDataset() as elevation_ds, ClimateDatasets(
                    period="1961_1990", variables=variables
                ) as climate:
                    for zone in Bar(
                        "Processing {} zones".format(source.name),
                        max=source.seedzone_set.count(),
                    ).iter(zones):

                        # calculate area of zone polygon in acres
                        poly_acres = round(zone.area_meters.sq_m * 0.000247105, 1)
                        zone_xmin, zone_ymin, zone_xmax, zone_ymax = zone.polygon.extent
                        zone_ctr_x = round(((zone_xmax - zone_xmin) / 2) + zone_xmin, 5)
                        zone_ctr_y = round(((zone_ymax - zone_ymin) / 2) + zone_ymin, 5)

                        region = get_region_for_zone(zone)
                        elevation_ds.load_region(region.name)
                        climate.load_region(region.name)

                        window, coords = elevation_ds.get_read_window(
                            zone.polygon.extent
                        )
                        transform = coords.affine

                        elevation = elevation_ds.data[window]

                        # calculate pixel area based on UTM centered on window
                        pixel_area = round(
                            calculate_pixel_area(
                                transform, elevation.shape[1], elevation.shape[0]
                            )
                            * 0.000247105,
                            1,
                        )

                        zone_mask = rasterize(
                            (json.loads(zone.polygon.geojson),),
                            out_shape=elevation.shape,
                            transform=transform,
                            fill=1,  # mask is True OUTSIDE the zone
                            default_value=0,
                            dtype=numpy.dtype("uint8"),
                        ).astype("bool")

                        nodata_mask = elevation == elevation_ds.nodata_value
                        mask = nodata_mask | zone_mask

                        # extract all data not masked out as nodata or outside zone
                        # convert to feet
                        elevation = elevation[~mask] / 0.3048

                        # if there are no pixels in the mask, skip this zone
                        if elevation.size == 0:
                            continue

                        min_elevation = max(math.floor(numpy.nanmin(elevation)), 0)
                        max_elevation = math.ceil(numpy.nanmax(elevation))

                        bands = list(
                            config.get_elevation_bands(
                                zone, min_elevation, max_elevation
                            )
                        )

                        for variable, ds in climate.items():
                            # extract data with same shape as elevation above
                            data = ds.data[window][~mask]

                            for band in bands:
                                low, high = band[:2]
                                band_mask = (elevation >= low) & (elevation <= high)

                                if not numpy.any(band_mask):
                                    continue

                                # extract data within elevation range
                                band_data = data[band_mask]

                                # then apply variable's nodata mask
                                band_data = band_data[band_data != ds.nodata_value]

                                if not band_data.size:
                                    continue

                                writer.write_row(
                                    variable,
                                    zone.zone_uid,
                                    band,
                                    band_data,
                                    source=zone.source,
                                    species=zone.species.upper()
                                    if zone.species != "generic"
                                    else zone.species,
                                    zone=zone.zone_id,
                                    zone_poly_acres=poly_acres,
                                    zone_pixels=elevation.size,
                                    zone_acres=elevation.size * pixel_area,
                                    zone_band_acres=band_data.size * pixel_area,
                                    zone_ctr_x=zone_ctr_x,
                                    zone_ctr_y=zone_ctr_y,
                                    zone_xmin=round(zone_xmin, 5),
                                    zone_ymin=round(zone_ymin, 5),
                                    zone_xmax=round(zone_xmax, 5),
                                    zone_ymax=round(zone_ymax, 5),
                                )

                                self._write_sample(
                                    output_directory,
                                    variable,
                                    zone.zone_uid,
                                    zone.zone_id,
                                    band_data,
                                    low,
                                    high,
                                )
