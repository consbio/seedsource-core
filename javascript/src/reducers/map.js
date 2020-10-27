import { SET_MAP_OPACITY, SET_BASEMAP, SET_ZOOM, SET_MAP_CENTER, SET_MAP_MODE } from '../actions/map'
import { LOAD_CONFIGURATION } from '../actions/saves'
import { morph } from '../utils'

const defaultState = {
    opacity: 1,
    basemap: '//{s}.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    zoom: 4,
    center: [55.0, -112.0],
    mode: 'normal'
}

export default (state=defaultState, action) => {
    switch (action.type) {
        case SET_MAP_OPACITY:
            return morph(state, {opacity: action.opacity})

        case SET_BASEMAP:
            return morph(state, {basemap: action.basemap})

        case SET_ZOOM:
            return morph(state, {zoom: action.zoom})

        case SET_MAP_CENTER:
            return morph(state, {center: action.center})

        case LOAD_CONFIGURATION:
            let point = action.configuration.point
            return morph(state, {center: [point.y, point.x]})

        case SET_MAP_MODE:
            return {...state, mode: action.mode}

        default:
            return state
    }
}
