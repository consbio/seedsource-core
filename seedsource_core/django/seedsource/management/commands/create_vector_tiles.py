from django.core.management import BaseCommand
from django.conf import settings
from seedsource_core.django.seedsource.models import SeedZone
from tempfile import mkdtemp
import os
import subprocess
import json
import shutil


class Command(BaseCommand):
    help = 'Facilitates converting of vector data into vector tiles.'

    def _write_out(self, output):
        self.stdout.write('\033[0;33m' + output + '\033[0m')

    def _create_folder(self, directory):
        if not os.path.exists(directory):
            os.makedirs(directory)

    def handle(self, *args, **options):
        tiles_dir = os.path.join(settings.BASE_DIR, "tiles")
        outputIndex = []
        errors = []
        sources = SeedZone.objects.values_list('source').distinct()

        self._create_folder(os.path.join(tiles_dir, "seedzones"))

        for source in sources:
            source = str(source).strip("'(,)'")
            zones = SeedZone.objects.filter(source=source)
            source = source.replace("/", "-").lower()
            tmp_dir = mkdtemp()

            self._write_out(f'Loading seedzones of source "{source}" ...')
            geojson = {
                'type': 'FeatureCollection',
                'features': [json.loads(sz.polygon.geojson) for sz in zones]
            }

            try:
                with open(os.path.join(tmp_dir, 'zones.json'), "w") as f:
                    f.write(json.dumps(geojson))

                self._write_out("Processing...")

                process = subprocess.run([
                    'tippecanoe',
                    '-o',
                    f'seedzones/{source}.mbtiles',
                    '-f',
                    f'--name={source}',
                    '--drop-densest-as-needed',
                    os.path.join(tmp_dir, 'zones.json')],
                    cwd=tiles_dir)

            finally:
                try:
                    shutil.rmtree(tmp_dir)
                except OSError:
                    print(f'Could not remove temp dir "{tmp_dir}" Garbage collector will clean later.')

            if process.returncode == 0:
                self.stdout.write(self.style.SUCCESS("Success\n"))
                outputIndex.append({
                    'name': source,
                    'type': 'vector',
                    'urlTemplate': f'http://localhost:3333/services/seedzones/{source}' + "/tiles/{z}/{x}/{y}.png",
                    'zIndex': 1,
                    'displayed': False
                })
            else:
                errors.append(source)
                self.stdout.write(self.style.ERROR("Error\n"))

        self._write_out("Creating index..")
        with open(os.path.join(tiles_dir, "index.js"), "w") as f:
            f.write("[\n")
            for i in outputIndex:
                f.write("  ")
                f.write(json.dumps(i))
                f.write(",\n")
            f.write("]")

        self._write_out("Done\n\nAn index of successful outputs can be found in the tiles folder in your project directory.")

        if errors:
            self._write_out("There were errors with the following:\n")
            self.stdout.write(self.style.ERROR("\n".join(errors)))