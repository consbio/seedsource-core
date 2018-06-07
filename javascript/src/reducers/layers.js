import {getServiceName, morph} from '../utils'
import {ADD_VARIABLE, REMOVE_VARIABLE, TOGGLE_VARIABLE} from "../actions/variables";
import {TOGGLE_VISIBILITY} from "../actions/map";
import {FINISH_JOB} from "../actions/job";
import {UPDATE_VARIABLE_URLS} from "../actions/layers";


const defaultLayer = {
    name: null,
    type: null,
    category: null,
    url: null,
    opacity: 1,
    displayed: false
}

export default (state = [], action) => {
        let index = null
        switch(action.type) {
            case UPDATE_VARIABLE_URLS:
                let newState = state
                let variableUrl = null
                return newState.map(layer => {
                    if (action.activeVariables.includes(layer.name)) {
                        variableUrl = '/tiles/' + getServiceName(layer.name, action.objective, action.climate, action.region) + '/{z}/{x}/{y}.png'
                        return morph(layer, {url: variableUrl})
                    } else {
                        return layer
                    }
                })
            case ADD_VARIABLE:
                return [...state, morph(defaultLayer, {name: action.variable, type: "raster", category: "variable"})]
            case REMOVE_VARIABLE:
                index = state.findIndex(layer => layer.name === action.variable)
                return state.slice(0, index).concat(state.slice(index+1))
            case TOGGLE_VARIABLE:
                index = state.findIndex(layer => layer.name === action.variable)
                return state.slice(0, index).concat([morph(state[index], {displayed: !state[index].displayed}), ...state.slice(index+1)])
            case TOGGLE_VISIBILITY:
                index = state.findIndex(layer => layer.category === "lastRun")
                return state.slice(0, index).concat([morph(state[index], {displayed: !state[index].displayed}), ...state.slice(index+1)])
            case FINISH_JOB:
                let lastRun = state.find(layer => layer.category === "lastRun")
                if (lastRun) {
                    return state
                } else {
                    return  [
                                {
                                    name: "Last Run",
                                    type: "raster",
                                    category: "lastRun",
                                    url: null,
                                    opacity: 1,
                                    displayed: true
                                },
                                ...state
                            ]
                }
            default:
                return state
        }
}
