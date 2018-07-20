import {morph} from '../utils'
import {ADD_VARIABLE, REMOVE_VARIABLE, SET_VARIABLES_REGION} from "../actions/variables"
import {TOGGLE_VISIBILITY} from "../actions/map"
import {FINISH_JOB, START_JOB} from "../actions/job"
import {TOGGLE_LAYER, LOAD_TILES} from '../actions/layers'
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
                let newState =  action.tiles.map(tileset => {
                    index = labels.findIndex(label => label.serviceName === tileset.name)
                    if (index !== -1 && index !== null) {
                        let correctLabel = labels.splice(index, 1)
                        return morph(tileset, {name: correctLabel[0].label, style: correctLabel[0].style})
                    } else {
                        return tileset
                    }
                })
                if (labels.length) {
                    console.log("The following hard-coded layer labels/styles were not used:\n",
                        labels.map(i => i.label).join("\n"))
                }
                return newState

            case TOGGLE_VISIBILITY:
                if (state.filter(layer => layer.displayed === true).length) {
                    return state.map(layer => morph(layer, {displayed: false}))
                } else {
                    return state.map(layer => morph(layer, {displayed: true}))
                }

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
                    return state.filter(layer => layer.urlTemplate !== "{region}_{modelTime}Y_{name}")
                } else {
                    let checkVariableLayers = state.find(layer => layer.urlTemplate === "{region}_{modelTime}Y_{name}")
                    if (checkVariableLayers) {
                        //TODO: possibly append a count or something to variable layers so a refresh will occur
                        return state
                    } else {
                        let layersToAdd = allVariables.map(variable => morph(defaultLayer, {
                        name: variable.name,
                        type: "raster",
                        urlTemplate: "{region}_{modelTime}Y_{name}"
                    }))
                        return [...state, ...layersToAdd]
                    }
                }

            case TOGGLE_LAYER:
                index = state.findIndex(layer => layer.name === action.name)
                return state.slice(0, index).concat([morph(state[index], {displayed: !state[index].displayed}), ...state.slice(index+1)])
            
            case START_JOB:
                index = state.findIndex(layer => layer.name === 'Last Run')
                if (index < 0) {
                    return state
                }
                else {
                    return state.slice(0, index).concat(state.slice(index+1))
                }

            case FINISH_JOB:
                let lastRun = state.find(layer => layer.name === "Last Run")
                if (lastRun) {
                    return state
                } else {
                    return  [
                                {
                                    name: "Last Run",
                                    type: "raster",
                                    urlTemplate: "{serviceId}",
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
