export const SET_LATITUDE = 'SET_LATITUDE'
export const SET_LONGITUDE = 'SET_LONGITUDE'
export const SET_POINT = 'SET_POINT'
export const SET_ELEVATION = 'SET_ELEVATION'
export const ADD_USER_SITE = 'ADD_USER_SITE'
export const REMOVE_USER_SITE = 'REMOVE_USER_SITE'
export const SET_ACTIVE_USER_SITE = 'SET_ACTIVE_USER_SITE'

export const setLatitude = value => {
    return {
        type: SET_LATITUDE,
        value
    }
}

export const setLongitude = value => {
    return {
        type: SET_LONGITUDE,
        value
    }
}

export const setPoint = (lat, lon) => {
    return {
        type: SET_POINT,
        lat,
        lon
    }
}

export const setElevation = elevation => {
    return {
        type: SET_ELEVATION,
        elevation
    }
}

export const addUserSite = latlon => {
    return {
        type: ADD_USER_SITE,
        latlon
    }
}

export const removeUserSite = index => {
    return {
        type: REMOVE_USER_SITE,
        index
    }
}

export const setActiveUserSite = index => {
    return {
        type: SET_ACTIVE_USER_SITE,
        index
    }
}
