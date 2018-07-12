export const TOGGLE_LAYER = 'TOGGLE_LAYER'
export const LOAD_TILES = 'LOAD_TILES'

export const toggleLayer = (name) => {
    return {
        type: TOGGLE_LAYER,
        name
    }
}

export const loadTiles = (tiles) => {
    return {
        type: LOAD_TILES,
        tiles
    }
}