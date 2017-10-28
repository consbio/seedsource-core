import React from 'react'
import PropTypes from 'prop-types'
import NavItemDropdown from 'seedsource/components/NavItemDropdown'
import SignupModal from 'seedsource/components/SignupModal'
import LoginModal from 'seedsource/components/LoginModal'
import ResetPasswordModal from 'seedsource/components/ResetPasswordModal'
import AccountSettingsModal from 'seedsource/components/AccountSettingsModal'

class AccountMenu extends React.Component {
    componentDidMount() {
        this.props.checkLogin()
    }

    render() {
        let { isLoggedIn, email, onLogin, onLogout } = this.props

        let dropdown = [
            <a className="navbar-item" onClick={() => this.accountModal.show()} key="signup">Create Account</a>,
            <a className="navbar-item" onClick={() => this.loginModal.show()} key="signin">Sign In</a>
        ]

        if (isLoggedIn) {
            dropdown = [
                <div className="navbar-item is-size-7 has-text-grey" key="email">{email}</div>,
                <a className="navbar-item" onClick={() => this.settingsModal.show()} key="settings">
                    Account Settings
                </a>,
                <a className="navbar-item" onClick={() => onLogout()} key="signout">Sign Out</a>,
            ]
        }

        return [
            <div className="has-text-dark is-size-6" key="modals">
                <SignupModal
                    ref={input => { this.accountModal = input }}
                    onSignup={email => onLogin(email)}
                />
                <LoginModal
                    ref={input => { this.loginModal = input }}
                    onLogin={email => onLogin(email)}
                    onResetPassword={() => {
                        this.loginModal.hide()
                        this.passwordModal.show()
                    }}
                />
                <ResetPasswordModal
                    ref={input => { this.passwordModal = input }}
                />
                <AccountSettingsModal
                    ref={input => { this.settingsModal = input }}
                    onChangeEmail={email => onLogin(email)}
                />
            </div>,
            <NavItemDropdown title="Account" right={true} key="menu">
                {dropdown}
            </NavItemDropdown>
        ]
    }
}

AccountMenu.propTypes = {
    isLoggedIn: PropTypes.bool.isRequired,
    email: PropTypes.string,
    onLogin: PropTypes.func.isRequired,
    onLogout: PropTypes.func.isRequired,
    checkLogin: PropTypes.func.isRequired
}

export default AccountMenu
