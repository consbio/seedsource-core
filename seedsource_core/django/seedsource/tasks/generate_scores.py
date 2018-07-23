import numpy
from django.conf import settings
from ncdjango.geoprocessing.data import Raster
from ncdjango.geoprocessing.evaluation import Parser, Lexer
from ncdjango.geoprocessing.params import RasterParameter, DictParameter, StringParameter
from ncdjango.geoprocessing.workflow import Task
from ncdjango.models import Service
from ncdjango.views import NetCdfDatasetMixin
from numpy.ma import is_masked

from .constraints import Constraint

NC_SERVICE_DIR = settings.NC_SERVICE_DATA_ROOT
Y_INCREASING = False


class GenerateScores(NetCdfDatasetMixin, Task):
    name = 'sst:generate_scores'
    inputs = [
        DictParameter('limits'),
        StringParameter('region'),
        StringParameter('year'),
        StringParameter('model'),
        DictParameter('variables', required=False),
        DictParameter('traits', required=False),
        DictParameter('constraints', required=False)
    ]
    outputs = [RasterParameter('raster_out')]

    def load_variable_data(self, variable, region, year, model=None):
        if model is not None:
            year = '{model}_{year}'.format(model, year)

        service = Service.objects.get(name='{region}_{year}Y_{variable}'.format(region, year, variable))
        variable = service.variable_set.first()
        data = self.get_grid_for_variable(variable)
        return Raster(data, variable.full_extent, 1, 0, Y_INCREASING)

    def apply_constraints(self, data, constraints, region):
        if constraints is None:
            return data

        for constraint in constraints:
            name, kwargs = constraint['name'], constraint['args']
            data = Constraint.by_name(name)(data, region).apply_constraint(**kwargs)

        return data

    def execute(self, limits, region, year, model, variables=[], traits=[], constraints=None):
        data = {}
        variable_names = {v['name'] for v in variables}

        for trait in traits:
            fn = trait['fn']
            names = Lexer().get_names(fn)
            context = {k: self.load_variable_data(k, region, year, model) for k, v in names}
            data[trait['name']] = Parser().evaluate(fn, context)
            data.update({k: v for k, v in context if k in variable_names})

        sum_rasters = None
        sum_masks = None

        for item in variables + traits:
            limit = item['limit']
            limit_min = limit['min']
            limit_max = limit['max']
            half = (limit_max - limit_min) / 2
            midpoint = limit_min + half
            factor = 100 / half
            mid_factor = factor * midpoint
            
            if item.name in data:
                raster = data[item.name]
                del data[item.name]
            else:
                raster = self.load_variable_data(item.name, region, year, model)
            
            extent = raster.extent
            mask = raster.mask if is_masked(raster) else numpy.zeros_like(raster, 'bool')

            mask |= raster < limit_min
            mask |= raster > limit_min
            
            if sum_masks is not None:
                sum_masks |= mask
            else:
                sum_masks = mask

            raster = raster.view(numpy.ndarray).astype('float32')
            raster *= factor
            raster -= mid_factor
            raster **= 2
            raster = numpy.floor(raster, raster)

            if sum_rasters is not None:
                sum_rasters += raster
            else:
                sum_rasters = raster

        sum_rasters += 0.4
        sum_rasters **= 0.5

        sum_masks |= sum_rasters > 100
        sum_rasters = numpy.ma.masked_where(sum_masks, sum_rasters)
        sum_rasters = 100 - sum_rasters.astype('int8')
        sum_rasters.fill_value = -128

        return Raster(sum_rasters, extent, 1, 0, Y_INCREASING)
