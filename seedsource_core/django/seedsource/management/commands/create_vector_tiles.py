from django.core.management import BaseCommand
from seedsource_core.django.seedsource.models import SeedZone
import subprocess
import os
from django.conf import settings
import json


class Command(BaseCommand):
    help = 'Facilitates converting of vector data into vector tiles.'

    def _write_out(self, output):
        self.stdout.write('\033[0;33m' + output + '\033[0m')

    def _create_folder(self, directory):
        try:
            if not os.path.exists(directory):
                os.makedirs(directory)
        except OSError:
            print('Error: Creating directory. ' + directory)

    def handle(self, *args, **options):
        tiles_dir = settings.BASE_DIR + "/tiles"
        outputIndex = []
        errors = []

        self._create_folder(tiles_dir + "/temp")
        self._create_folder(tiles_dir + "/seedzones")

        for sz in SeedZone.objects.all():
            name = sz.name.replace("/", "-")
            uid = sz.zone_uid

            self._write_out("loading " + name)

            check = [element['name'] for element in outputIndex if element['name'] == name]
            if check:
                self._write_out("repeat name, appending zone_uid to name: " + uid)
                name = f'{name}({uid})'
                self._write_out("loading " + name)

            with open(tiles_dir + "/temp/geojson", "w") as f:
                f.write(sz.polygon.json)

            self._write_out("processing..")

            process = subprocess.run([
                    'tippecanoe',
                    '-o',
                    f'seedzones/{uid}.mbtiles',
                    '-f',
                    f'--name={name}',
                    f'--layer={uid}',
                    '--drop-densest-as-needed',
                    'temp/geojson'],
                cwd=tiles_dir)

            if process.returncode == 0:
                self.stdout.write(self.style.SUCCESS("Success\n"))
                outputIndex.append({'name': name, 'type': 'vector', 'urlTemplate': f'http://localhost:3333/services/seedzones/{uid}' + "/tiles/{z}/{x}/{y}.png", 'zIndex': 1, 'displayed': False})
            else:
                errors.append(name)
                self.stdout.write(self.style.ERROR("Error\n"))

        self._write_out("Cleaning up temp files..")
        os.remove(tiles_dir + "/temp/geojson")
        os.rmdir(tiles_dir + "/temp")

        self._write_out("Creating index..")
        with open(tiles_dir + "/index.js", "w") as f:
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