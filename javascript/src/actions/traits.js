export const ADD_TRAIT = 'ADD_TRAIT'
export const REMOVE_TRAIT = 'REMOVE_TRAIT'
export const SET_TRAIT_VALUE = 'SET_TRAIT_VALUE'

export const addTrait = trait => {
    return {
        type: ADD_TRAIT,
        trait
    }
}

export const removeTrait = index => {
    return {
        type: REMOVE_TRAIT,
        index
    }
}

export const setTraitValue = (index, value) => {
    return {
        type: SET_TRAIT_VALUE,
        index,
        value
    }
}
