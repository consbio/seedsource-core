import { morph } from './utils'
import config from 'seedsource/config'

let { apiRoot } = config

export const collapsibleSteps = false

const celsiusUnits = {
    metric: {
        label: '°C',
        convert: value => (value - 32) / 1.8,  // Convert to celsius
        convertTransfer: value => value / 1.8,  // Convert difference to celsuis
        precision: 1,
        transferPrecision: 2
    },
    imperial: {
        label: '°F',
        convert: value => value * 1.8 + 32,  // Convert to fahrenheit
        convertTransfer: value => value * 1.8, // Convert difference to fahrenheit
        precision: 1,
        transferPrecision: 2
    }
}

const mmUnits = {
    metric: {
        label: 'mm',
        convert: value => value * 25.4, // Convert to millimeters
        precision: 0,
        transferPrecision: 0
    },
    imperial: {
        label: 'in',
        convert: value => value / 25.4, // Convert to inches
        precision: 1,
        transferPrecision: 1
    }
}

const daysUnits = {
    metric: {
        label: 'days',
        convert: value => value,
        precision: 0,
        transferPrecision: 0
    },
    imperial: {
        label: 'days',
        convert: value => value,
        precision: 0,
        transferPrecision: 0
    }
}

const degreeDaysUnits = {
    metric: {
        label: 'dd',
        convert: value => value,
        precision: 0,
        transferPrecision: 0
    },
    imperial: {
        label: 'dd',
        convert: value => value,
        precision: 0,
        transferPrecision: 0
    }
}

const heatMoistureUnits = {
    metric: {
        label: '',
        convert: value => value,
        precision: 1,
        transferPrecision: 1
    },
    imperial: {
        label: '',
        convert: value => value,
        precision: 1,
        transferPrecision: 1
    }
}

export const variables = [
    {
        name: 'MAT',
        label: 'Mean annual temperature',
        multiplier: 10,
        units: celsiusUnits,
    },
    {
        name: 'MWMT',
        label: 'Mean warmest month temperature',
        multiplier: 10,
        units: celsiusUnits,
    },
    {
        name: 'MCMT',
        label: 'Mean coldest month temperature',
        multiplier: 10,
        units: celsiusUnits,
    },
    {
        name: 'TD',
        label: 'Temperature difference between MWMT and MCMT, or continentality',
        multiplier: 10,
        units: {
            metric: {
                label: '°C',
                convert: value => value / 1.8,  // Convert temp difference to C
                precision: 1,
                transferPrecision: 2
            },
            imperial: {
                label: '°F',
                convert: value => value * 1.8, // Convert temp difference to F
                precision: 1,
                transferPrecision: 2
            }
        }
    },
    {
        name: 'MAP',
        label: 'Mean annual precipitation',
        multiplier: 1,
        units: mmUnits
    },
    {
        name: 'MSP',
        label: 'Mean summer precipitation, May to September',
        multiplier: 1,
        units: mmUnits
    },
    {
        name: 'AHM',
        label: 'Annual heat-moisture index',
        multiplier: 10,
        units: heatMoistureUnits
    },
    {
        name: 'SHM',
        label: 'Summer heat-moisture index',
        multiplier: 10,
        units: heatMoistureUnits
    },
    {
        name: 'DD_0',
        label: 'Degree-days below 0°C',
        multiplier: 1,
        units: degreeDaysUnits
    },
    {
        name: 'DD5',
        label: 'Degree-days above 5°C',
        multiplier: 1,
        units: degreeDaysUnits
    },
    {
        name: 'FFP',
        label: 'Frost-free period',
        multiplier: 1,
        units: daysUnits
    },
    {
        name: 'PAS',
        label: 'Precipitation as snow, August to July',
        multiplier: 1,
        units: mmUnits
    },
    {
        name: 'EMT',
        label: 'Extreme minimum temperature over 30 years',
        multiplier: 10,
        units: celsiusUnits
    },
    {
        name: 'EXT',
        label: 'Extreme maximum temperature over 30 years',
        multiplier: 10,
        units: celsiusUnits
    },
    {
        name: 'Eref',
        label: 'Hargreaves reference evaporation',
        multiplier: 1,
        units: mmUnits
    },
    {
        name: 'CMD',
        label: 'Hargreaves climatic moisture deficit',
        multiplier: 1,
        units: mmUnits
    }
];

export const species = [
    {
        name: 'psme',
        label: 'Douglas-fir'
    },
    {
        name: 'pico',
        label: 'Lodgepole pine'
    },
    {
        name: 'piba',
        label: 'Jack pine'
    },
    {
        name: 'pipo',
        label: 'Ponderosa pine'
    },
    {
        name: 'pima',
        label: 'Black spruce'
    },
    {
        name: 'thpl',
        label: 'Western red cedar'
    },
    {
        name: 'pimo',
        label: 'Western white pine'
    },
    {
        name: 'abam',
        label: 'Pacific silver fir',
    },
    {
        name: 'abco',
        label: 'White fir',
    },
    {
        name: 'abgr',
        label: 'Grand fir'
    },
    {
        name: 'abpr',
        label: 'Grand fir'
    },
    {
        name: 'absh',
        label: 'Shasta red fir'
    },
    {
        name: 'alru2',
        label: 'Red alder'
    },
    {
        name: 'cade27',
        label: 'Incense cedar'
    },
    {
        name: 'chla',
        label: 'Port orford cedar'
    },
    {
        name: 'chno',
        label: 'Alaska yellow cedar'
    },
    {
        name: 'laoc',
        label: 'Western larch'
    },
    {
        name: 'pial',
        label: 'Whitebark pine'
    },
    {
        name: 'pien',
        label: 'Engelmann spruce'
    },
    {
        name: 'pije',
        label: 'Jeffrey pine'
    },
    {
        name: 'pila',
        label: 'Sugar pine'
    },
    {
        name: 'tabr2',
        label: 'Pacific yew'
    },
    {
        name: 'tshe',
        label: 'Western red cedar'
    },
    {
        name: 'tsme',
        label: 'Mountain hemlock'
    }
]

export const constraints = {
    elevation: {
        values: {
            range: 0
        },
        serialize: (configuration, values) => {
            let { elevation } = configuration.point
            let { range } = values

            return {min: elevation - range, max: elevation + range}
        }
    },
    photoperiod: {
        values: {
            hours: 0,
            month: 1,
            day: 1,
            year: 1961
        },
        serialize: (configuration, values) => {
            let { x, y } = configuration.point
            return morph(values, {lon: x, lat: y})
        }
    },
    latitude: {
        values: {
            range: 0
        },
        serialize: (configuration, { range }) => {
            let { y } = configuration.point
            return {min: y - range, max: y + range}
        }
    },
    longitude: {
        values: {
            range: 0
        },
        serialize: (configuration, { range }) => {
            let { x } = configuration.point
            return {min: x - range, max: x + range}
        }
    },
    distance: {
        values: {
            range: 0
        },
        serialize: (configuration, { range }) => {
            let { x, y } = configuration.point
            return { lat: y, lon: x, distance: range}
        }
    },
    shapefile: {
        values: {
            geoJSON: null,
            filename: null
        },
        serialize: (configuration, { geoJSON }) => {
            return { geoJSON }
        }
    }
}

export const timeLabels = {
    '1961_1990': '1961 - 1990',
    '1981_2010': '1981 - 2010',
    '2025rcp45': '2025 RCP 4.5',
    '2025rcp85': '2025 RCP 8.5',
    '2055rcp45': '2055 RCP 4.5',
    '2055rcp85': '2055 RCP 8.5',
    '2085rcp45': '2085 RCP 4.5',
    '2085rcp85': '2085 RCP 8.5'
}

export const regions = [
    {
        name: 'ak2',
        label: 'Alaska'
    },
    {
        name: 'west2',
        label: 'Western US'
    },
    {
        name: 'nc1',
        label: 'North Central'
    },
    {
        name: 'uscentral1',
        label: 'Central US'
    },
    {
        name: 'ne1',
        label: 'North East'
    },
    {
        name: 'useast1',
        label: 'Eastern US'
    },
    {
        name: 'mexico1',
        label: 'Mexico'
    }
]

export const regionsBoundariesUrl = '/static/geometry/regions.topojson'

export const reports = [
    {
        name: 'pdf',
        label: 'PDF',
        url: `${apiRoot}create-pdf/`
    },
    {
        name: 'pptx',
        label: 'PPT',
        url: `${apiRoot}create-ppt/`
    }
]

