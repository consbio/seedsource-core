from django.core.management import BaseCommand
from seedsource_core.django.seedsource.models import SeedZone
import subprocess
import os
from django.conf import settings


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
        errors = []

        self._create_folder(tiles_dir + "/temp")
        self._create_folder(tiles_dir + "/seedzones")

        for sz in SeedZone.objects.all():
            name = sz.name.replace("/", "-")

            self._write_out("loading " + name)

            with open(tiles_dir + "/temp/geojson", "w") as f:
                f.write(sz.polygon.json)

            self._write_out("processing..")

            process = subprocess.Popen([
                    'tippecanoe',
                    '-o',
                    f'seedzones/{name}.mbtiles',
                    '-f',
                    '-zg',
                    '--drop-densest-as-needed',
                    'temp/geojson'],
                cwd=tiles_dir)

            exit_code = process.wait()

            if exit_code == 0:
                self.stdout.write(self.style.SUCCESS("Success\n"))
            else:
                errors.append(name)
                self.stdout.write(self.style.ERROR("Error\n"))

        self._write_out("Done\n")
        if errors:
            self._write_out("There were errors with the following:\n")
            self.stdout.write(self.style.ERROR("\n".join(errors)))

        os.remove(tiles_dir + "/temp/geojson")
        os.rmdir(tiles_dir + "/temp")