export const TOGGLE_LAYER = 'TOGGLE_LAYER'

export const toggleLayer = (name) => {
    return {
        type: TOGGLE_LAYER,
        name
    }
}