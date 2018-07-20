import { ADD_TRAIT, REMOVE_TRAIT } from '../actions/traits'
import { SELECT_SPECIES } from '../actions/species'
import { SELECT_METHOD } from '../actions/variables'
import config from 'seedsource/config'

export default (state = [], action) => {
    switch(action.type) {
        case ADD_TRAIT:
            return [...state, {name: action.trait, value: null}]
        case REMOVE_TRAIT:
            return state.slice(0, action.index).concat(state.slice(action.index+1))
        case SELECT_SPECIES:
            return state.filter(t =>
                config.functions
                    .filter(f => f.species.includes(action.species)).map(f => f.name)
                    .includes(action.species)
            )
        case SELECT_METHOD:
            return []
        default:
            return state
    }
}
