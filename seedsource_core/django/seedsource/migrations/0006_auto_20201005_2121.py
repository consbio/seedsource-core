# -*- coding: utf-8 -*-
# Generated by Django 1.11.29 on 2020-10-06 04:21
from __future__ import unicode_literals

import django.contrib.gis.db.models.fields
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('seedsource', '0005_transferlimit_elevation'),
    ]

    operations = [
        migrations.AlterField(
            model_name='region',
            name='polygons',
            field=django.contrib.gis.db.models.fields.MultiPolygonField(srid=4326),
        ),
    ]
