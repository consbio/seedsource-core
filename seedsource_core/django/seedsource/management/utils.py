from django.contrib.gis.geos import Polygon
from django.contrib.gis.db.models.functions import Area, Intersection
from rasterio.warp import transform as transform_coords

from seedsource_core.django.seedsource.models import Region


def get_region_for_zone(zone):
    """Returns the best region for the zone based on amount of overlap with the zone's bounding box.

    If the zone only falls within one region, that region is returned.

    Otherwise, this calculates the amount of overlap between the zone's bounding box and the region
    and returns the one with the highest amount of overlap, as an approximation of the region that
    contains most or all of the zone polygon.

    Parameters
    ----------
    extent : SeedZone instance

    Returns
    -------
    Region instance
    """
    extent = Polygon.from_bbox(zone.polygon.extent)
    regions = Region.objects.filter(polygons__intersects=extent)

    if len(regions) == 1:
        return regions.first()

    # calculate amount of overlap and return one with highest overlap with extent
    return regions.annotate(overlap=Area(Intersection("polygons", extent))).order_by("-overlap").first()


def calculate_pixel_area(transform, width, height):
    """Calculates an approximate pixel area based on finding the UTM zone that
    contains the center latitude / longitude of the window.

    Parameters
    ----------
    transform : Affine object
    width : int
        number of pixels in window
    height : int
        number of pixels in window

    Returns
    -------
    area of a pixel (in meters)
    """

    src_crs = "EPSG:4326"

    cell_x = transform.a
    cell_y = abs(transform.e)

    xmin = transform.c
    xmax = transform.c + ((width + 0) * cell_x)
    center_x = ((xmax - xmin) / 2) + xmin

    ymax = transform.f if transform.e < 0 else transform.f + cell_y * (height + 0)
    ymin = transform.f if transform.e > 0 else transform.f + transform.e * (height + 0)
    center_y = ((ymax - ymin) / 2) + ymin

    ### to use UTM
    # UTM zones start numbered at 1 at -180 degrees, in 6 degree bands
    zone = int(round((center_x - -180) / 6.0)) + 1
    dst_crs = "+proj=utm +zone={} +ellps=GRS80 +datum=NAD83 +units=m +no_defs".format(zone)

    ### to use a custom Albers
    # inset = (ymax - ymin) / 6.0
    # lat1 = ymin + inset
    # lat2 = ymax - inset
    # dst_crs = "+proj=aea +lat_1={:.1f} +lat_2={:.1f} +lat_0={:.1f} +lon_0={:.1f} +x_0=0 +y_0=0 +ellps=GRS80 +datum=NAD83 +units=m +no_defs".format(
    #     lat1, lat2, center_y, center_x
    # )

    xs = [center_x, center_x + cell_x]
    ys = [center_y, center_y + cell_y]
    (x1, x2), (y1, y2) = transform_coords(src_crs, dst_crs, xs, ys)
    area = abs(x1 - x2) * abs(y1 - y2)

    return area
