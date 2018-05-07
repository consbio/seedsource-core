import { LOGIN, LOGOUT } from '../actions/auth'
import { morph } from '../utils'

const defaultState = {
    isLoggedIn: false,
    email: null
}

export default (state = defaultState, action) => {
    switch (action.type) {
        case LOGIN:
            return morph(state, {isLoggedIn: true, email: action.email})
        
        case LOGOUT:
            return defaultState

        default:
            return state
    }
}
