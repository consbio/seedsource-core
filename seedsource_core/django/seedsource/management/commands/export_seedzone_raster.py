import errno
import json
import math
import os
import time
from collections import defaultdict
import csv

from django.conf import settings
from django.core.management import BaseCommand, CommandError
from django.contrib.gis.db.models.functions import Area
import numpy
from netCDF4 import Dataset
from progress.bar import Bar
from pyproj import Proj
from rasterio.features import rasterize
from rasterio import windows
from trefoil.netcdf.crs import set_crs
from trefoil.utilities.window import Window

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


NODATA = 65535


class Command(BaseCommand):
    help = "Export seed zone / elevation band rasters within a region"

    def add_arguments(self, parser):
        parser.add_argument("output_directory", nargs=1, type=str)

        parser.add_argument("region_name", nargs=1, type=str)

        parser.add_argument(
            "--zones",
            dest="zoneset",
            default=None,
            help="Comma delimited list of zones sets to analyze. (default is to analyze all available zone sets)",
        )

    def handle(self, output_directory, region_name, zoneset, *args, **kwargs):
        output_directory = output_directory[0]
        region_name = region_name[0]

        if zoneset is None or zoneset.strip() == "":
            sources = ZoneSource.objects.all().order_by("name")
            if len(sources) == 0:
                raise CommandError("No zonesets available")

        else:
            sources = ZoneSource.objects.filter(name__in=zoneset.split(",")).order_by(
                "name"
            )
            if len(sources) == 0:
                raise CommandError(
                    "No zonesets available to analyze that match --zones values"
                )

        region = Region.objects.filter(name=region_name)
        if not region.exists():
            raise CommandError("Region {} is not available".format(region_name))

        region = region.first()

        ### Create output directories
        if not os.path.exists(output_directory):
            os.makedirs(output_directory)

        with ElevationDataset() as elevation_ds:
            elevation_ds.load_region(region.name)

            for source in sources:
                all_species = [
                    e["species"]
                    for e in source.seedzone_set.values("species").distinct()
                ]

                for species in all_species:
                    zones = source.seedzone_set.filter(species=species).order_by(
                        "zone_id"
                    )

                    out_index = 0
                    ids = []
                    out = numpy.empty(shape=elevation_ds.data.shape, dtype="uint16")
                    out.fill(NODATA)

                    with ZoneConfig(source.name) as config:
                        for zone in Bar(
                            "Processing {} - {} zones".format(source.name, species),
                            max=source.seedzone_set.count(),
                        ).iter(zones):

                            source_name = zone.source

                            window, coords = elevation_ds.get_read_window(
                                zone.polygon.extent
                            )
                            transform = coords.affine

                            elevation = elevation_ds.data[window]

                            zone_mask = rasterize(
                                (json.loads(zone.polygon.geojson),),
                                out_shape=elevation.shape,
                                transform=transform,
                                fill=1,  # mask is True OUTSIDE the zone
                                default_value=0,
                                dtype=numpy.dtype("uint8"),
                                all_touched=True,
                            ).astype("bool")

                            nodata_mask = elevation == elevation_ds.nodata_value
                            mask = nodata_mask | zone_mask

                            # Create a 2D array for extracting to new dataset, in feet
                            elevation = numpy.where(
                                ~mask, elevation / 0.3048, elevation_ds.nodata_value
                            )

                            # if there are no pixels in the mask, skip this zone
                            if elevation.size == 0:
                                continue

                            elevation_data = elevation[
                                elevation != elevation_ds.nodata_value
                            ]
                            min_elevation = max(math.floor(elevation_data.min()), 0)
                            max_elevation = math.ceil(elevation_data.max())

                            bands = list(
                                config.get_elevation_bands(
                                    zone, min_elevation, max_elevation
                                )
                            )

                            if not bands:
                                # min / max elevation outside defined bands
                                continue

                            for band in bands:
                                low, high = band[:2]
                                band_mask = (elevation >= low) & (elevation <= high)

                                if not numpy.any(band_mask):
                                    continue

                                # extract 2D version of elevation within the band
                                value = numpy.where(
                                    (elevation != elevation_ds.nodata_value)
                                    & band_mask,
                                    out_index,
                                    out[window],
                                )

                                out[window] = value
                                ids.append("{}_{}_{}".format(zone.zone_uid, low, high))

                                out_index += 1

                    if out_index > NODATA - 1:
                        raise ValueError("Too many zone / band combinations for uint16")

                    # Find the data window of the zones
                    data_window = (
                        windows.get_data_window(out, NODATA)
                        .round_offsets(op="floor")
                        .round_lengths(op="ceil")
                    )
                    out = out[data_window.toslices()]
                    data_coords = elevation_ds.coords.slice_by_window(
                        Window(*data_window.toslices())
                    )

                    filename = os.path.join(
                        output_directory, "{}_{}_zones.nc".format(source_name, species)
                    )

                    with Dataset(filename, "w", format="NETCDF4") as ds:
                        # create ID variable
                        ds.createDimension("id", len(ids))
                        id_var = ds.createVariable("id", str, dimensions=("id",))
                        id_var[:] = numpy.array(ids)

                        data_coords.add_to_dataset(ds, "longitude", "latitude")
                        data_var = ds.createVariable(
                            "zones",
                            "uint16",
                            dimensions=("latitude", "longitude"),
                            fill_value=NODATA,
                        )
                        data_var[:] = out
                        set_crs(ds, "zones", Proj({"init": "EPSG:4326"}))

                    with open(filename.replace(".nc", ".csv"), "w") as fp:
                        writer = csv.writer(fp)
                        writer.writerow(["value", "id"])
                        writer.writerows([[i, id] for i, id in enumerate(ids)])

