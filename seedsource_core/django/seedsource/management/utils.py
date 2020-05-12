import importlib
import json
import os
import shutil
import tempfile
from zipfile import ZipFile

import fiona
from django.conf import settings

from django.contrib.gis.geos import MultiPolygon, Polygon, LinearRing, GEOSGeometry
from django.core.management import CommandError
from rasterio.warp import transform_geom

SEEDZONES_LOCATION = getattr(settings, 'SEEDZONES_LOCATION', 'data/seedzones')


class ZoneConfig:
    def __init__(self, name):
        self.name = name
        self.dir = None
        self.is_tmp = False
        self.config = None

    def __enter__(self):
        if os.path.exists(os.path.join(SEEDZONES_LOCATION, self.name)):
            self.dir = os.path.join(SEEDZONES_LOCATION, self.name)
            self.is_tmp = False
        elif os.path.exists(os.path.join(SEEDZONES_LOCATION, '{}.zip'.format(self.name))):
            self.is_tmp = True
            self.dir = tempfile.mkdtemp()
            try:
                with ZipFile(os.path.join(SEEDZONES_LOCATION, '{}.zip'.format(self.name))) as zf:
                    zf.extractall(self.dir)
            except:
                try:
                    shutil.rmtree(self.dir)
                except OSError:
                    pass
                raise
        else:
            raise CommandError('Could not find data for zone {}'.format(self.name))

        config_src_path = os.path.join(self.dir, 'config.py')
        if os.path.exists(config_src_path):
            spec = importlib.util.spec_from_file_location('{}.config'.format(self.name), config_src_path)
            config = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(config)

            self.config = config.Config()
            return self
        else:
            raise CommandError('Could not find `config.py` in zone directory')

    def __exit__(self, *args):
        if self.is_tmp:
            try:
                shutil.rmtree(self.dir)
            except OSError:
                pass

    @property
    def source(self):
        return self.config.source

    @property
    def label(self):
        return self.config.label

    def get_zones(self):
        for file in self.config.files:
            with fiona.open(os.path.join(self.dir, file)) as shp:
                for feature in shp:
                    geometry = GEOSGeometry(
                        json.dumps(transform_geom(shp.crs, {'init': 'EPSG:4326'}, feature['geometry']))
                    )

                    info = self.config.get_zone_info(feature, file)
                    if info is not None:
                        yield geometry, info

    def get_elevation_bands(self, zone, low, high):
        return self.config.get_elevation_bands(zone, low, high)
