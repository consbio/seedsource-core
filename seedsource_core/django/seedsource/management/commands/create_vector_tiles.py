from django.core.management import BaseCommand
from seedsource_core.django.seedsource.models import SeedZone
import subprocess

class Command(BaseCommand):
    help = 'Facilitates converting of vector data into vector tiles.'

    def handle(self, *args, **options):
        zones = []

        def write_out(output):
            self.stdout.write(output)

        write_out('\nLoading data..')
        for sz in SeedZone.objects.all():
            zones.append(sz.polygon.json)
            write_out(sz.name)

        with open("geojson", "w") as f:
            f.write('\n'.join(zones))

        write_out('\n\nData loaded\nLaunching process to write mbtiles..\n\n')
        subprocess.Popen("tippecanoe -o seedtiles.mbtiles -f -zg --drop-densest-as-needed geojson", shell=True)
