import resync from '../resync'
import {
    requestVariableLegend, receiveVariableLegend, requestResultsLegend, receiveResultsLegend
} from '../actions/legends'
import { getServiceName } from '../utils'

const variableLegendSelect = ({ activeVariables, runConfiguration }) => {
    let { objective, climate, region } = runConfiguration

    return {
        activeVariables,
        objective,
        climate: objective === 'seedlots' ? climate.site : climate.seedlot,
        region
    }
}

const resultsLegendSelect = ({ job, legends }) => {
    return {
        serviceId: job.serviceId,
        hasLegend: legends.results.legend !== null
    }
}

export default store => {
    // Variable legend
    resync(store, variableLegendSelect, ({ activeVariables, objective, region }, io, dispatch) => {
        if (activeVariables.length > 0) {
            dispatch(requestVariableLegend())
            let { climate } = store.getState().runConfiguration
            let serviceName = getServiceName(activeVariables[0], objective, climate, region)

            let url = '/arcgis/rest/services/' + serviceName + '/MapServer/legend'

            return io.get(url).then(response => response.json()).then(json => dispatch(receiveVariableLegend(json)))
        }
    })

    // Results legend
    resync(store, resultsLegendSelect, ({ serviceId, hasLegend }, io, dispatch) => {
        if (serviceId !== null && !hasLegend) {
            dispatch(requestResultsLegend())

            let url = '/arcgis/rest/services/' + serviceId + '/MapServer/legend'

            return io.get(url).then(response => response.json()).then(json => dispatch(receiveResultsLegend(json)))
        }
    })
}
