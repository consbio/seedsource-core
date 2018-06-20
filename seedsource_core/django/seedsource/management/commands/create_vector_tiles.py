from django.core.management import BaseCommand
from seedsource_core.django.seedsource.models import SeedZone
import subprocess
import os


class Command(BaseCommand):
    help = 'Facilitates converting of vector data into vector tiles.'

    def _create_folder(directory):
        try:
            if not os.path.exists(directory):
                os.makedirs(directory)
        except OSError:
            print('Error: Creating directory. ' + directory)

    def _write_out_yellow(output):
        self.stdout.write('\033[0;33m' + output + '\033[0m')

    def handle(self, *args, **options):
        self._create_folder("seedzones")

        for sz in SeedZone.objects.all():
            FormattedName = sz.name.replace(" ", "_").replace("(", "[").replace(")", "]").replace("/", "-")

            self._write_out_yellow("loading " + FormattedName)
            with open("geojson", "w") as f:
                f.write(sz.polygon.json)

            self._write_out_yellow("processing..")
            process = subprocess.Popen(''.join([
                "tippecanoe -o seedzones/",
                FormattedName,
                ".mbtiles -f -zg --drop-densest-as-needed geojson"
                ]), shell=True)
            ExitCode = process.wait()
            if ExitCode == 0:
                self.stdout.write(self.style.SUCCESS("Success\n"))
            else:
                self.stdout.write(self.style.ERROR("Error\n"))

        self._write_out_yellow("done")