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

    def handle(self, *args, **options):
        tiles_dir = os.path.join(settings.BASE_DIR, "tiles")
        seedzone_dir = os.path.join(tiles_dir, "seedzones")
        outputIndex = []
        errors = []
        sources = SeedZone.objects.values_list('source').distinct()

        if not os.path.exists(seedzone_dir):
            os.makedirs(seedzone_dir)

        for source in sources:
            zones = SeedZone.objects.filter(source=source[0])
            formatted_source = source[0].replace("/", "-").lower()
            tmp_dir = mkdtemp()

            try:
                self._write_out(f'Loading seedzones of source "{source[0]}" ...')
                geojson = {
                    'type': 'FeatureCollection',
                    'features': [json.loads(sz.polygon.geojson) for sz in zones]
                }

                with open(os.path.join(tmp_dir, 'zones.json'), "w") as f:
                    f.write(json.dumps(geojson))

                self._write_out("Processing...")

                process = subprocess.run([
                    'tippecanoe',
                    '-o',
                    f'seedzones/{formatted_source}.mbtiles',
                    '-f',
                    f'--name={formatted_source}',
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
                    'name': source[0],
                    'type': 'vector',
                    'urlTemplate': f'services/seedzones/{formatted_source}' + "/tiles/{z}/{x}/{y}.png",
                    'zIndex': 1,
                    'displayed': False
                    })
            else:
                errors.append(formatted_source)
                self.stdout.write(self.style.ERROR("Error\n"))

        self._write_out("Creating tilesIndex..")
        with open(os.path.join(tiles_dir, "tilesIndex.json"), "w") as f:
            f.write(json.dumps(outputIndex))

        self._write_out("Done\n\nAn index of successful outputs can be found in the tiles folder in your project directory.")

        if errors:
            self._write_out("There were errors with the following:\n")
            self.stdout.write(self.style.ERROR("\n".join(errors)))