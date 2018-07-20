export const ADD_TRAIT = 'ADD_TRAIT'
export const REMOVE_TRAIT = 'REMOVE_TRAIT'

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
