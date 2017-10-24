import React from 'react'
import PropTypes from 'prop-types'
import ModalCard from 'seedsource/components/ModalCard'
import { post } from '../../io'

class LoginModal extends React.Component {
    constructor(props) {
        super(props)
        this.state = {emailText: null, passwordText: null, loading: false, error: null}
    }

    show() {
        this.reset()
        this.modal.show()

        setTimeout(() => {
            this.emailInput.focus()
        }, 1)
    }

    hide() {
        this.modal.hide()
        this.reset()
    }

    reset() {
        this.setState({emailText: null, passwordText: null, loading: false, error: null})
    }

    submit() {
        let { emailText, passwordText } = this.state
        let { onLogin } = this.props

        if (emailText && passwordText) {
            this.setState({loading: true, error: null})

            post('/accounts/login/', {email: emailText, password: passwordText}).then(response => {
                let { status } = response

                if (status >= 200 && status < 300) {
                    onLogin(emailText)
                    this.hide()
                }
                else {
                    throw new Error('Login failed.')
                }
            }).catch(err => {
                console.log(err)
                this.setState({loading: false, error: 'Login failed.'})
            })
        }
    }

    render() {
        let { emailText, passwordText, loading, error } = this.state
        let { onResetPassword } = this.props

        let errorNode = null
        if (error !== null) {
            errorNode = <article className="message is-danger">
                <div className="message-body">{error}</div>
            </article>
        }

        return <ModalCard ref={input => { this.modal = input }} title="Sign In">
            {errorNode}
            <form
                onSubmit={e => {
                    e.preventDefault()
                    this.submit()
                }}
            >
                <div className="field">
                    <div className="control">
                        <input
                            ref={input => { this.emailInput = input }}
                            className="input"
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
                        <input
                            className="input"
                            type="password"
                            placeholder="Password"
                            name="password"
                            value={passwordText || ''}
                            onChange={e => { this.setState({passwordText: e.target.value}) }}
                            disabled={loading}
                        />
                    </div>
                    <a className="is-pulled-right is-size-7 is-clearfix" onClick={() => onResetPassword()}>
                        Forgot your password?
                    </a>
                    <div className="is-clearfix"></div>
                </div>
                <div className="field">
                    <div className="control">
                        <button
                            className={(loading ? 'is-loading ' : '') + 'button is-fullwidth is-primary'}
                            onClick={() => this.submit()}
                            disabled={loading}
                        >
                            Sign In
                        </button>
                    </div>
                </div>
            </form>
        </ModalCard>
    }
}

LoginModal.propTypes = {
    onLogin: PropTypes.func.isRequired,
    onResetPassword: PropTypes.func.isRequired
}

export default LoginModal
