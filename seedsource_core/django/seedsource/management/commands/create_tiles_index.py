from django.core.management.base import BaseCommand
from django.conf import settings
import os


class Command(BaseCommand):
    help = "Create index of mbvector tiles by scanning directory structure of tiles folder"

    def handle(self, *args, **options):
        outputIndex = []
        all_tile_dirs = [os.path.join(settings.BASE_DIR, "tiles/layers"), os.path.join(settings.BASE_DIR, "tiles/seedzones")]
        for tile_dir in all_tile_dirs:
            for dirName, subdirList, fileList in os.walk(tile_dir):
                for tileset in subdirList:
                    print('\t%s' % tileset)
                    outputIndex.append({
                        'name': tileset,
                        'type': 'vector',
                        'urlTemplate': f'services/{tileset}' + "/tiles/{z}/{x}/{y}.png",
                        'zIndex': 1,
                        'displayed': False
                    })

