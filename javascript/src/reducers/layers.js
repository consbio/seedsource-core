import {morph} from '../utils'
import {ADD_VARIABLE, REMOVE_VARIABLE} from "../actions/variables"
import {TOGGLE_VISIBILITY} from "../actions/map"
import {FINISH_JOB} from "../actions/job"
import {TOGGLE_LAYER} from '../actions/layers'
import {RECEIVE_ZONES} from "../actions/zones";
import config from '../../../../javascript/src/seedsource/config'

const defaultLayer = {
    name: null,
    type: null,
    urlTemplate: null,
    zIndex: 1,
    displayed: false
}

const defaultState = config.seedzones.sort((a,b) => a.name.localeCompare(b.name))

export default (state = defaultState, action) => {
        let index = null
        switch(action.type) {
            case TOGGLE_VISIBILITY:
                if (state.filter(layer => layer.displayed === true).length) {
                    return state.map(layer => morph(layer, {displayed: false}))
                } else {
                    return state.map(layer => morph(layer, {displayed: true}))
                }

            case ADD_VARIABLE:
                return [...state, morph(defaultLayer, {
                    name: action.variable,
                    type: "raster",
                    urlTemplate: "{region}_{modelTime}Y_{name}"})]

            case REMOVE_VARIABLE:
                index = state.findIndex(layer => layer.name === action.variable)
                return state.slice(0, index).concat(state.slice(index+1))

            case TOGGLE_LAYER:
                index = state.findIndex(layer => layer.name === action.name)
                return state.slice(0, index).concat([morph(state[index], {displayed: !state[index].displayed}), ...state.slice(index+1)])

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
