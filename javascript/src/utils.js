import config from 'seedsource/config'


/* A shortcut for Object.assign({}, obj, props) */
export const morph = (obj, props = {}) => Object.assign({}, obj, props)

export const getLayerUrl = (layer, serviceId, objective, climate, region) => {
    let generateModelTimeString = (objective, climate) => {
        let modelTimeString = ''
        let selectedClimate = objective === 'seedlots' ? climate.site : climate.seedlot
        let {time, model} = selectedClimate

        if (time === '1961_1990' || time === '1981_2010') {
            modelTimeString += time
        }
        else {
            modelTimeString += model + '_' + time
        }
        return modelTimeString
    }
    let modelTime = generateModelTimeString(objective, climate)
    let varsObj = { serviceId, region, modelTime }
    let newrl = layer.urlTemplate

    for (let key in varsObj) {
        newrl = newrl.replace(`{${key}}`, varsObj[key])
    }

    return newrl
}

export const getServiceName = (variable, objective, climate, region) => {
    let serviceName = region + '_'

    // Show site climate when looking for seedlots, and seedlot climate when looking for sites
    let selectedClimate = objective === 'seedlots' ? climate.site : climate.seedlot
    let { time, model } = selectedClimate

    if (time === '1961_1990' || time === '1981_2010') {
        serviceName += time
    }
    else {
        serviceName += model + '_' + time
    }

    return serviceName + 'Y_' + variable
}

export const getCookies = () => {
    let cookies = {}

    document.cookie.split(';').forEach(item => {
        let [name, value] = item.trim().split('=')
        cookies[name] = decodeURIComponent(value)
    })

    return cookies
}

export const isClose = (a, b) => {
    return Math.abs(a - b) <= Math.max(1e-3 * Math.max(Math.abs(a), Math.abs(b)), 0.0)
}

export const text = (key, def) => {
    if (config.text !== undefined && config.text.hasOwnProperty(key)) {
        return config.text[key]
    }
    return def
}

export const formatYear = year => {
    const labels = {
        '1961_1990': '1961 - 1990',
        '1981_2010': '1981 - 2010',
        2025: '2011 - 2040',
        2055: '2041 - 2070',
        2085: '2071 - 2100'
    }

    return labels[year]
}

export const formatModel = model => {
    const labels = {
        rcp45: 'RCP 4.5',
        rcp85: 'RCP 8.5'
    }

    return labels[model]
}

export const formatClimate = (year, model) => {
    let label = formatYear(year)
    if (year !== '1961_1990' && year !== '1981_2010') {
        label += ' ' + formatModel(model)
    }
    return label
}
