import { morph } from '../utils'
import {ADD_VARIABLE} from "../actions/variables";


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
            default:
                return state
        }
}
