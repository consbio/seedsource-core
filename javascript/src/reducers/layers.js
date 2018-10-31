import { morph } from '../utils'
import { REMOVE_VARIABLE, SET_VARIABLES_REGION } from '../actions/variables'
import { FINISH_JOB, START_JOB } from '../actions/job'
import { TOGGLE_LAYER, LOAD_TILES } from '../actions/layers'
import config from 'seedsource/config'
import { variables as allVariables } from '../config'

let labels = []
if (config.labels) {
    labels = config.labels
} else {
    console.log("No project labels loaded. Layer names and styling may be ugly.")
}


const defaultLayer = {
    name: null,
    label: null,
    type: null,
    urlTemplate: null,
    zIndex: 1,
    displayed: false,
    style: null
}

export default (state = [], action) => {
        let index = null
        switch(action.type) {
            case LOAD_TILES:
                if (!action.tiles.length) {
                    return state
                }
                let newState = action.tiles.map(tileset => {
                    let serviceInfo = labels.find(label => label.serviceName === tileset.name)
                    if (serviceInfo !== undefined) {
                        return morph(tileset, {
                            name: serviceInfo.serviceName,
                            label: serviceInfo.label,
                            style: serviceInfo.style
                        })
                    }
                    else {
                        return morph(tileset, {label: tileset.name})
                    }
                })

                let unused = labels.filter(label => newState.findIndex(item => item.name === label.serviceName) < 0)
                if (unused.length) {
                    console.log("The following hard-coded layer labels/styles were not used:\n",
                        unused.map(i => i.label).join("\n"))
                }
                return newState

            case REMOVE_VARIABLE:
                return state.map (layer => {
                    if (layer.name === action.variable) {
                        return morph(layer, {displayed: false})
                    } else {
                        return layer
                    }
                })

            case SET_VARIABLES_REGION:
                if (action.region === null) {
                    return state.filter(layer => !layer.urlTemplate.includes("{region}_{modelTime}"))
                } else {
                    let checkVariableLayers = state.find(layer => layer.urlTemplate.includes("{region}_{modelTime}"))
                    if (checkVariableLayers) {
                        return state
                    } else {
                        let layersToAdd = allVariables.map(variable => morph(defaultLayer, {
                        name: variable.name,
                        label: variable.label,
                        type: "raster",
                        urlTemplate: "{region}_{modelTime}Y_" + variable.name
                    }))
                        return [...state, ...layersToAdd]
                    }
                }

            case TOGGLE_LAYER:
                index = state.findIndex(layer => layer.name === action.name)
                return state
                        .slice(0, index)
                        .concat([morph(state[index], {displayed: !state[index].displayed}), ...state.slice(index+1)])
            
            case START_JOB:
                index = state.findIndex(layer => layer.name === 'results')
                if (index < 0) {
                    return state
                }
                else {
                    return state.slice(0, index).concat(state.slice(index+1))
                }

            case FINISH_JOB:
                let lastRun = state.find(layer => layer.name === 'results')
                if (lastRun) {
                    return state
                } else {
                    return  [
                        {
                            name: 'results',
                            label: 'Last Run',
                            type: 'raster',
                            urlTemplate: '{serviceId}',
                            zIndex: 2,
                            displayed: true
                        },
                        ...state
                    ]
                }

            default:
                return state
        }
}
