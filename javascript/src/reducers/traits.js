import { ADD_TRAIT, REMOVE_TRAIT, SET_TRAIT_VALUE } from '../actions/traits'
import { SELECT_SPECIES } from '../actions/species'
import { SELECT_METHOD } from '../actions/variables'
import config from 'seedsource/config'
import { morph } from '../utils'

export default (state = [], action) => {
    switch(action.type) {
        case ADD_TRAIT:
            return [...state, {name: action.trait, value: null}]
        case REMOVE_TRAIT:
            return state.slice(0, action.index).concat(state.slice(action.index+1))
        case SET_TRAIT_VALUE:
            return state
                .slice(0, action.index)
                .concat([morph(state[action.index], {value: action.value}), ...state.slice(action.index+1)])
        case SELECT_SPECIES:
            return state.filter(t =>
                config.functions
                    .filter(f => f.species.includes(action.species)).map(f => f.name)
                    .includes(t)
            )
        case SELECT_METHOD:
            return []
        default:
            return state
    }
}
