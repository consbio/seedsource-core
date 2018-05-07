import { connect } from 'react-redux'
import AccountMenu from 'seedsource/components/AccountMenu'
import { login, logout } from '../../actions/auth'
import { get } from '../../io'

const mapStateToProps = ({ auth }) => auth

const mapDispatchToProps = dispatch => {
    return {
        onLogin: email => {
            dispatch(login(email))
        },

        onLogout: () => {
            get('/accounts/logout/').then(() => {
                dispatch(logout())
            })
        },

        checkLogin: () => {
            get('/accounts/user-info/')
                .then(response => {
                    if (response.status < 200 || response.status >= 300) {
                        throw new Exception()
                    }

                    return response.json()
                })
                .then(json => dispatch(login(json.email)))
                .catch(() => dispatch(logout()))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(AccountMenu)
