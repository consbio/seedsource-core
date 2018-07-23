import resync from '../resync'
import { pointIsValid } from './utils'
import { getServiceName, morph } from "../utils"
import { setTraitValue } from '../actions/traits'
import config from 'seedsource/config'
import parser,  { getNames } from '../parser'
import { urlEncode } from "../io"

const { functions } = config

const valueSelect = ({ runConfiguration }) => {
    let { objective, point, climate, traits, region } = runConfiguration

    if (point) {
        point = {x: point.x, y: point.y}
    }


    return {
        objective,
        point,
        climate,
        traits,
        region
    }
}

export default store => {
    resync(store, valueSelect, (state, io, dispatch, previousState) => {
        let { objective, point, climate, traits, region } = state

        if (!(pointIsValid(point) && !!region)) {
            return
        }

        traits = traits.map((item, i) => Object.assign(item, {index: i}))

        // If the only change is adding traits, we only need to fetch values for new traits
        let traitsOnly = (
            JSON.stringify(morph(state, {traits: null})) === JSON.stringify(morph(previousState, {traits: null}))
        )
        if (traitsOnly) {
            traits = traits.filter(item => item.value === null)
        }

        traits.forEach((item, i) => {
            dispatch(setTraitValue(item.index, null))

            let config = functions.find(item => item.name === item.name)
            let variables = getNames(config.fn)
            Promise.all(variables.map(variable => {
                let serviceName = getServiceName(variable, objective, climate, region)
                let url = '/arcgis/rest/services/' + serviceName + '/MapServer/identify/?' + urlEncode({
                    f: 'json',
                    tolerance: 2,
                    imageDisplay: '1600,1031,96',
                    geometryType: 'esriGeometryPoint',
                    mapExtent: '0,0,0,0',
                    geometry: JSON.stringify(point)
                })
                return (
                    io
                        .get(url)
                        .then(response => response.json())
                        .then(json => [variable, json.results[0].attributes['Pixel value']])
                )
            })).then(values => {
                let context = {}
                values.forEach(([variable, value]) => context[variable] = value)
                dispatch(setTraitValue(i, parser(config.fn, context)))
            }).catch(() => dispatch(setTraitValue(i, null)))
        })
    })
}
