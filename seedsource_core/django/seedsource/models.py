import uuid as uuid
from django.conf import settings
from django.db import models
from django.contrib.gis.db import models as gis_models


class RunConfiguration(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, db_index=True)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)
    title = models.CharField(max_length=256)
    configuration = models.TextField()

    class Meta:
        index_together = [['owner', 'created'], ['owner', 'title']]


class ZoneSource(models.Model):
    name = models.CharField(max_length=100)
    order = models.IntegerField(default=0)


class SeedZone(gis_models.Model):
    source = models.CharField(max_length=100)
    zone_source = models.ForeignKey('ZoneSource', null=True, on_delete=models.CASCADE)
    name = models.CharField(max_length=256)
    species = models.CharField(max_length=10)
    zone_id = models.CharField(max_length=100, null=True)
    zone_uid = models.CharField(max_length=50, unique=True, null=True)
    polygon = gis_models.GeometryField(srid=4326)


class TransferLimit(models.Model):
    variable = models.CharField(max_length=10)
    time_period = models.CharField(max_length=10)
    zone = models.ForeignKey(SeedZone, on_delete=models.CASCADE)
    low = models.IntegerField(null=True)  # Stored in feet
    high = models.IntegerField(null=True)  # Stored in feet
    transfer = models.FloatField()
    avg_transfer = models.FloatField(default=0)
    center = models.FloatField()
    label = models.CharField(max_length=100, null=True)
    elevation = models.ForeignKey('ncdjango.Service', null=True, on_delete=models.CASCADE)


class Region(gis_models.Model):
    name = models.CharField(max_length=20)
    polygons = gis_models.MultiPolygonField(srid=4326)

