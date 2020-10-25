from django.conf import settings
from django.core.management import BaseCommand
from django.db import transaction
from seedsource_core.django.seedsource.models import SeedZone, ZoneSource

from ..utils import ZoneConfig

SEEDZONES_LOCATION = getattr(settings, 'SEEDZONES_LOCATION', 'data/seedzones')


class Command(BaseCommand):
    help = 'Loads polygon data from seed zone shape files into the database'

    def add_arguments(self, parser):
        parser.add_argument('zone_name', nargs='?', type=str)

    def handle(self, zone_name, *args, **options):
        with ZoneConfig(zone_name) as config:
            source = ZoneSource.objects.get_or_create(name=config.source)[0]

            if source.seedzone_set.all().exists():
                message = (
                    'WARNING: This will replace {} seed zone records and remove associated transfer limits. '
                    'Do you want to continue? [y/n]'.format(config.label)
                )
                if input(message).lower() not in {'y', 'yes'}:
                    return

            source.order = getattr(config.config, 'order', 0)
            source.save()

            self.stdout.write('Loading seed zones...')

            with transaction.atomic():
                source.seedzone_set.all().delete()
                for polygon, info in config.get_zones():
                    uid_suffix = 0
                    while True:
                        zone_uid = info['name'].format(zone_id=info['zone_id'])

                        if uid_suffix > 0:
                            zone_uid += '_{}'.format(uid_suffix)
                        if SeedZone.objects.filter(zone_uid=zone_uid).exists():
                            uid_suffix += 1
                            continue

                        SeedZone.objects.create(
                            zone_source=source,
                            name=info['label'],
                            species=info['species'],
                            zone_id=info['zone_id'],
                            zone_uid=zone_uid,
                            polygon=polygon
                        )
                        break
