import { morph } from '../utils'
import {ADD_VARIABLE, TOGGLE_VARIABLE} from "../actions/variables";


const defaultLayer = {
    name: null,
    type: null,
    url: null,
    opacity: 1,
    displayed: false
}

const defaultState = [{
    name: "Last Run",
    type: "lastRun",
    url: null,
    opacity: 1,
    displayed: false
}]


export default (state = defaultState, action) => {
        switch(action.type) {
            case ADD_VARIABLE:
                return [...state, morph(defaultLayer, {name: action.variable, type: "variable"})]
            case TOGGLE_VARIABLE:
                let index = state.findIndex(layer => layer.name === action.variable)
                let newState = state
                newState.splice(index, 1, morph(state[index], {displayed: !state[index].displayed}))
                return newState
            default:
                return state
        }
}
