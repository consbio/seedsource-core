import React from 'react'
import PropTypes from 'prop-types'
import ModalCard from 'seedsource/components/ModalCard'
import { put } from '../../io'

class AccountSettingsModal extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            emailText: null, passwordText: null, confirmText: null, emailError: null, passwordError: null,
            loading: false
        }
    }

    show() {
        this.reset()
        this.modal.show()
    }

    hide() {
        this.modal.hide()
        this.reset()
    }

    reset() {
        this.setState({
            emailText: null, passwordText: null, confirmText: null, emailError: null, passwordError: null,
            loading: false
        })
    }

    submitEmail() {
        let { emailText } = this.state
        let { onChangeEmail } = this.props

        if ((emailText || '').trim()) {
            put('/accounts/change-email/', {email: emailText}).then(response => {
                let {status} = response

                if (status === 400) {
                    return response.json()
                }

                if (status < 200 || status >= 300) {
                    throw new Error('Sorry, there was an unexpected error changing your email address.')
                }

                onChangeEmail(emailText)
                this.hide()
            }).then(json => {
                if (json) {
                    if (json.email) {
                        throw new Error(json.email)
                    }

                    throw new Error('Sorry, there was an unexpected error changing your email address.')
                }
            }).catch(err => {
                console.log(err)
                this.setState({loading: false, emailError: err.message})
            })
        }
    }

    submitPassword() {
        let { passwordText, confirmText } = this.state

        if (passwordText !== confirmText) {
            this.setState({passwordError: "Passwords don't match"})
            return
        }

        if (passwordText) {
            put('/accounts/change-password/', {password: passwordText}).then(response => {
                let {status} = response

                if (status === 400) {
                    return response.json()
                }

                if (status < 200 || status >= 300) {
                    throw new Error('Sorry, there was an unexpected error changing your email address.')
                }

                this.hide()
            }).then(json => {
                if (json) {
                    if (json.password) {
                        throw new Error(json.password)
                    }

                    throw new Error('Sorry, there was an unexpected error changing your email address.')
                }
            }).catch(err => {
                console.log(err)
                this.setState({loading: false, passwordError: err.message})
            })
        }
    }

    render() {
        let { emailText, passwordText, confirmText, emailError, passwordError, loading } = this.state

        let emailErrorNode = null
        if (emailError !== null) {
            emailErrorNode = <article className="message is-danger">
                <div className="message-body">{emailError}</div>
            </article>
        }

        let passwordErrorNode = null
        if (passwordError !== null) {
            passwordErrorNode = <article className="message is-danger">
                <div className="message-body">{passwordError}</div>
            </article>
        }

        return <ModalCard ref={input => { this.modal = input }} title="Account Settings">
            <form
                onSubmit={e => {
                    e.preventDefault()
                    this.submitEmail()
                }}
            >
                {emailErrorNode}
                <div className="field">
                    <label className="label">Email address</label>
                    <div className="control">
                        <input
                            className={(emailError !== null ? 'is-danger' : '') + ' input'}
                            type="text"
                            placeholder="Email address"
                            name="username"
                            value={emailText || ''}
                            onChange={e => { this.setState({emailText: e.target.value}) }}
                            disabled={loading}
                        />
                    </div>
                </div>
                <div className="field">
                    <div className="control">
                        <button
                            className={(loading ? 'is-loading ' : '') + 'button is-primary'}
                            onClick={() => this.submitEmail()}
                            disabled={loading || !emailText}
                        >
                            Change email
                        </button>
                    </div>
                </div>
            </form>
            <div>&nbsp;</div>
            <form
                onSubmit={e => {
                    e.preventDefault()
                    this.submitPassword()
                }}
            >
                {passwordErrorNode}
                <div className="field">
                    <label className="label">Password</label>
                    <div className="control">
                        <input
                            className={(passwordError !== null ? 'is-danger' : '') + ' input'}
                            type="password"
                            placeholder="Password"
                            name="password"
                            value={passwordText || ''}
                            onChange={e => { this.setState({passwordText: e.target.value}) }}
                            disabled={loading}
                        />
                    </div>
                </div>
                <div className="field">
                    <div className="control">
                        <input
                            className="input"
                            type="password"
                            placeholder="Confirm password"
                            name="password"
                            value={confirmText || ''}
                            onChange={e => { this.setState({confirmText: e.target.value}) }}
                            disabled={loading}
                        />
                    </div>
                </div>
                <div className="field">
                    <div className="control">
                        <button
                            className={(loading ? 'is-loading ' : '') + 'button is-primary'}
                            onClick={() => this.submitPassword()}
                            disabled={loading || !passwordText || !confirmText}
                        >
                            Change password
                        </button>
                    </div>
                </div>
            </form>
        </ModalCard>
    }
}

AccountSettingsModal.propTypes = {
    onChangeEmail: PropTypes.func.isRequired
}

export default AccountSettingsModal
