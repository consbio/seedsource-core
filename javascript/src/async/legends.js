import resync from '../resync'
import {
    requestLayersLegend, receiveLayersLegend, resetLegends
} from '../actions/legends'
import { getLayerUrl } from '../utils'

// Possibly add: `legends`
const layerLegendSelect = ({ layers, runConfiguration, job }) => {
    let { objective, climate, region } = runConfiguration
    let { serviceId } = job

    // Possibly add: `hasLegend: legends.results.legend !== null`
    return {
        layers,
        objective,
        climate,
        region,
        serviceId
    }
}

export default store => {
    // Layers legend
    resync(store, layerLegendSelect, ({ layers, serviceId, objective, climate, region }, io, dispatch) => {
        if (layers.length) {
            let legendLayers = layers.filter(layer => layer.displayed === true && layer.urlTemplate !== "seedZone")
            dispatch(resetLegends())
            legendLayers.forEach(layer => {
                dispatch(requestLayersLegend())
                let newrl = getLayerUrl(layer, serviceId, objective, climate, region)
                let url = '/arcgis/rest/services/' + newrl + '/MapServer/legend'
                return io.get(url).then(response => response.json()).then(json => {
                    dispatch(receiveLayersLegend(json))
                })
            })
        }
    })
}