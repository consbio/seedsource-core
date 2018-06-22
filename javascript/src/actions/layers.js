export const TOGGLE_LAYER = 'TOGGLE_LAYER'
export const TOGGLE_VECTOR_LAYER = 'TOGGLE_VECTOR_LAYER'

export const toggleLayer = (name) => {
    return {
        type: TOGGLE_LAYER,
        name
    }
}

export const toggleVectorLayer = (url) => {
    return {
        type: TOGGLE_VECTOR_LAYER,
        url
    }
}
