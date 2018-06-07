import {getServiceName, morph} from '../utils'
import {ADD_VARIABLE, REMOVE_VARIABLE, TOGGLE_VARIABLE} from "../actions/variables";
import {SET_MAP_OPACITY, TOGGLE_VISIBILITY} from "../actions/map";
import {FINISH_JOB} from "../actions/job";


const defaultLayer = {
    name: null,
    type: null,
    urlTemplate: null,
    opacity: 1,
    displayed: false
}

export default (state = [], action) => {
        let index = null
        switch(action.type) {
            case SET_MAP_OPACITY:
                return state.map(layer => morph(layer, {opacity: action.opacity}))
            case TOGGLE_VISIBILITY:
                if (state.filter(layer => layer.displayed === true).length === state.length) {
                    return state.map(layer => morph(layer, {displayed: true}))
                } else {
                    return state.map(layer => morph(layer, {displayed: false}))
                }
            case ADD_VARIABLE:
                return [...state, morph(defaultLayer, {
                    name: action.variable,
                    type: "raster",
                    urlTemplate: "/tiles/{region}_{modelTime}Y_{name}/{z}/{x}/{y}.png"})]
            case REMOVE_VARIABLE:
                index = state.findIndex(layer => layer.name === action.variable)
                return state.slice(0, index).concat(state.slice(index+1))
            case TOGGLE_VARIABLE:
                index = state.findIndex(layer => layer.name === action.variable)
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
                                    urlTemplate: "/tiles/{serviceId}/{z}/{x}/{y}.png",
                                    opacity: 2,
                                    displayed: true
                                },
                                ...state
                            ]
                }
            default:
                return state
        }
}
