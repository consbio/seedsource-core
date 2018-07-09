from django.core.management.base import BaseCommand
from django.conf import settings
import os


class Command(BaseCommand):
    help = "Create index of mbvector tiles by scanning directory structure of tiles folder"

    def handle(self, *args, **options):
        outputIndex = []
        for dirName, subdirList, fileList in os.walk(os.path.join(settings.BASE_DIR, "tiles")):
            for tileset in fileList:
                print('\t%s' % tileset)
                outputIndex.append({
                    'name': f'{dirName}/{tileset}',
                    'type': 'vector',
                    'urlTemplate': f'services/{dirName}/{tileset}' + "/tiles/{z}/{x}/{y}.png",
                    'zIndex': 1,
                    'displayed': False
                })

        print(str(outputIndex))