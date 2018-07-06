from django.core.management.base import BaseCommand
from django.conf import settings
from tempfile import mkdtemp
import shutil
import subprocess
import os

class Command(BaseCommand):
    help = 'Import shapefiles to be served as mb vectortiles. Viewable on front-end in "Layers" tab.'

    def add_arguments(self, parser):
        parser.add_argument('shapefile', nargs=1, type=str)

    def handle(self, shapefile, *args, **options):
        tiles_dir = os.path.join(settings.BASE_DIR, "tiles")
        layers_dir = os.path.join(tiles_dir, "layers")
        # shapefilepath = os.path.abspath(shapefile[0])
        shapefilepath = shapefile[0]
        shapefile = os.path.basename(shapefile[0])

        if not os.path.exists(layers_dir):
            os.makedirs(layers_dir)

        tmp_dir = mkdtemp()

        try:
            process1 = subprocess.run([
                'ogr2ogr',
                '-f',
                'GeoJSON',
                '-a_srs',
                'EPSG:4326',
                os.path.join(tmp_dir, 'output.json'),
                f'/vsizip/{shapefilepath}'])

            process2 = subprocess.run([
                'tippecanoe',
                '-o',
                f'layers/{shapefile}.mbtiles',
                '-f',
                f'--name={shapefile}',
                os.path.join(tmp_dir, 'output.json')],
                cwd=tiles_dir)

        finally:
            try:
                shutil.rmtree(tmp_dir)
            except OSError:
                print(f'Could not remove temp dir "{tmp_dir}" Garbage collector will clean later.')