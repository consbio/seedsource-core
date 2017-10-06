import os.path
import tempfile

import netCDF4
import numpy as np
import rasterio
from django.conf import settings
from ncdjango.geoprocessing.params import StringParameter
from ncdjango.geoprocessing.workflow import Task
from ncdjango.models import Service, Variable, SERVICE_DATA_ROOT


class WriteTIF(Task):
    name = 'write_tif'
    inputs = [
        StringParameter('service_id'),
    ]
    outputs = [StringParameter('filename')]

    def execute(self, service_id):
        svc = Service.objects.get(name=service_id)
        var = Variable.objects.get(service_id=svc.id)
        data_path = svc.data_path
        with netCDF4.Dataset(os.path.join(SERVICE_DATA_ROOT, data_path), 'r') as nc:
            data = nc.variables[var.name][:]

        height, width = data.shape
        ex = var.full_extent
        x_step = (ex.xmax - ex.xmin) / width
        y_step = (ex.ymax - ex.ymin) / height
        transform = [ex.xmin, x_step, 0, ex.ymax, 0, -y_step]
        dtype = np.int16
        nodata = data.fill_value

        fd, filename = tempfile.mkstemp(prefix=settings.DATASET_DOWNLOAD_DIR, suffix='.tif')
        os.close(fd)
        with rasterio.Env(GDAL_TIFF_INTERNAL_MASK=True) as env:
            with rasterio.open(filename, 'w', driver='GTiff',
              height=height, width=width,
              crs=var.projection, transform=transform,
              count=1, dtype=dtype, nodata=nodata) as dst:
                dst.write(np.array(data, dtype=dtype), 1)
                dst.write_mask(np.logical_not(data.mask))

        return os.path.basename(filename)
