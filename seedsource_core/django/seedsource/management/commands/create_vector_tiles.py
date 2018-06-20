from django.core.management import BaseCommand
from seedsource_core.django.seedsource.models import SeedZone
import subprocess
import os


class Command(BaseCommand):
    help = 'Facilitates converting of vector data into vector tiles.'

    def _write_out(self, output):
        self.stdout.write('\033[0;33m' + output + '\033[0m')

    def handle(self, *args, **options):
        errors = []
        for sz in SeedZone.objects.all():
            formatted_name = sz.name\
                .replace(" ", "_")\
                .replace("(", "[")\
                .replace(")", "]")\
                .replace("/", "-")\
                .replace("&", "and")\
                .lower()

            self._write_out("loading " + formatted_name)
            with open("geojson", "w") as f:
                f.write(sz.polygon.json)

            self._write_out("processing..")
            process = subprocess.Popen(''.join([
                "cd .. && tippecanoe -o tiles/seedzones/",
                formatted_name,
                ".mbtiles -f -zg --drop-densest-as-needed source/geojson"
                ]), shell=True)
            exit_code = process.wait()
            if exit_code == 0:
                self.stdout.write(self.style.SUCCESS("Success\n"))
            else:
                errors.append(formatted_name)
                self.stdout.write(self.style.ERROR("Error\n"))

        self._write_out("Done\n")
        if errors:
            self._write_out("There were errors with the following:\n")
            self.stdout.write(self.style.ERROR("\n".join(errors)))