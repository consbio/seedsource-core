import config from 'seedsource/config'


/* A shortcut for Object.assign({}, obj, props) */
export const morph = (obj, props = {}) => Object.assign({}, obj, props)

export const getLayerUrl = (layer, serviceId, objective, climate, region) => {
    let name = layer.name
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
    let varsObj = { serviceId, region, modelTime, name }
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