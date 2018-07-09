from django.core.management.base import BaseCommand
from django.conf import settings
from tempfile import mkdtemp
import json
import shutil
import subprocess
import os

class Command(BaseCommand):
    help = 'Import vector data to be served as mapbox vectortiles. Viewable on front-end in "Layers" tab.'

    def add_arguments(self, parser):
        parser.add_argument('shapefile', nargs=1, type=str)

    def _write_out(self, output):
        self.stdout.write('\033[0;33m' + output + '\033[0m')

    def handle(self, shapefile, *args, **options):
        tiles_dir = os.path.join(settings.BASE_DIR, "tiles")
        layers_dir = os.path.join(tiles_dir, "layers")
        shapefilepath = os.path.abspath(shapefile[0])
        shapefile = os.path.basename(shapefilepath)
        outputIndex = []

        if not os.path.exists(layers_dir):
            os.makedirs(layers_dir)

        tmp_dir = mkdtemp()

        try:
            self._write_out(f'Converting {shapefile} to EPSG:4326 GeoJSON for processing...')
            subprocess.run([
                'ogr2ogr',
                '-f',
                'GeoJSON',
                '-t_srs',
                'EPSG:4326',
                os.path.join(tmp_dir, 'output.json'),
                '/vsizip/' + shapefilepath
            ])

            self._write_out('Processing into mbtiles...')
            process2 = subprocess.run([
                'tippecanoe',
                '-o',
                f'layers/{shapefile}.mbtiles',
                '-f',
                f'--name={shapefile}',
                '--drop-densest-as-needed',
                os.path.join(tmp_dir, 'output.json')],
                cwd=tiles_dir)

        finally:
            try:
                shutil.rmtree(tmp_dir)
            except OSError:
                print(f'Could not remove temp dir "{tmp_dir}" Garbage collector will clean later.')

        if process2.returncode == 0:
            self.stdout.write(self.style.SUCCESS("Success\n"))
            outputIndex.append({
                'name': shapefile,
                'type': 'vector',
                'urlTemplate': f'services/seedzones/{shapefile}' + "/tiles/{z}/{x}/{y}.png",
                'zIndex': 1,
                'displayed': False
            })
            self._write_out("Creating shapeIndex..")
            with open(os.path.join(tiles_dir, "shapeIndex.json"), "w") as f:
                f.write(json.dumps(outputIndex))

            self._write_out(
                "Done\n\nAn index of successful outputs can be found in the tiles folder in your project directory.")

        else:
            self.stdout.write(self.style.ERROR("Error processing file\n"))