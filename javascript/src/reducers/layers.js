import { morph } from '../utils'
import {ADD_VARIABLE, REMOVE_VARIABLE, TOGGLE_VARIABLE} from "../actions/variables";
import {TOGGLE_VISIBILITY} from "../actions/map";
import {FINISH_JOB} from "../actions/job";


const defaultLayer = {
    name: null,
    type: null,
    url: null,
    opacity: 1,
    displayed: false
}

export default (state = [], action) => {
        let index = null
        let newState = state
        switch(action.type) {
            case ADD_VARIABLE:
                return [...state, morph(defaultLayer, {name: action.variable, type: "variable"})]
            case REMOVE_VARIABLE:
                index = state.findIndex(layer => layer.name === action.variable)
                console.log(state[index])
                return state.slice(0, index).concat(state.slice(index+1))
            case TOGGLE_VARIABLE:
                index = state.findIndex(layer => layer.name === action.variable)
                return state.slice(0, index)
                        .concat(morph(state[index], {displayed: !state[index].displayed}))
                        .concat(state.slice(index+1))
            case TOGGLE_VISIBILITY:
                index = state.findIndex(layer => layer.type === "lastRun")
                newState.splice(index, 1, morph(state[index], {displayed: !state[index].displayed}))
                return newState
            case FINISH_JOB:
                let lastRun = state.find(layer => layer.type === "lastRun")
                if (lastRun) {
                    return state
                } else {
                    return  [
                                {
                                    name: "Last Run",
                                    type: "lastRun",
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
