from django.contrib.gis.geos import Polygon
from django.contrib.gis.db.models.functions import Area, Intersection

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
    return (
        regions.annotate(overlap=Area(Intersection("polygons", extent)))
        .order_by("-overlap")
        .first()
    )

