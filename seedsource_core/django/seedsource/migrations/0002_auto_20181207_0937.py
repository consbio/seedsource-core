# -*- coding: utf-8 -*-
# Generated by Django 1.11.15 on 2018-12-07 17:37
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('seedsource', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='ZoneSource',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
            ],
        ),
        migrations.RemoveField(
            model_name='seedzone',
            name='bands_fn',
        ),
        migrations.AddField(
            model_name='seedzone',
            name='zone_source',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='seedsource.ZoneSource'),
        ),
    ]
