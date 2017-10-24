import React from 'react'
import PropTypes from 'prop-types'
import ModalCard from 'seedsource/components/ModalCard'
import { post } from '../../io'

class SignupModal extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            emailText: null, passwordText: null, confirmText: null, loading: false, error: null, emailError: false
        }
    }

    show() {
        this.reset()
        this.modal.show()

        setTimeout(() => { this.emailInput.focus() }, 1)
    }

    hide() {
        this.modal.hide()
        this.reset()
    }

    reset() {
        this.setState({
            emailText: null, passwordText: null, confirmText: null, loading: false, error: null, emailError: false
        })
    }

    submit() {
        let { emailText, passwordText, confirmText } = this.state
        let { onSignup } = this.props

        if (passwordText !== confirmText) {
            this.setState({error: "Passwords don't match"})
            return
        }

        if (emailText && passwordText) {
            this.setState({loading: true, error: null, emailError: false})

            post('/accounts/create-account/', {email: emailText, password: passwordText}).then(response => {
                let { status } = response

                if (status === 400) {
                    return response.json()
                }

                if (status < 200 || status >= 300) {
                    throw new Error('Sorry, there was an unexpected error while creating your account.')
                }

                onSignup(emailText)
                this.hide()
            }).then(json => {
                if (json) {
                    if (json.email) {
                        this.setState({emailError: true})
                        throw new Error(json.email)
                    }

                    throw new Error('Sorry, there was an unexpected error while creating your account.')
                }
            }).catch(err => {
                console.log(err)
                this.setState({loading: false, error: err.message})
            })
        }
    }

    render() {
        let { emailText, passwordText, confirmText, loading, error, emailError } = this.state

        let errorNode = null
        if (error !== null) {
            errorNode = <article className="message is-danger">
                <div className="message-body">{error}</div>
            </article>
        }

        return <ModalCard ref={input => { this.modal = input }} title="Create Account">
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
                            className={(emailError ? 'is-danger' : '') + ' input'}
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
                            className={(loading ? 'is-loading ' : '') + 'button is-fullwidth is-primary'}
                            onClick={() => this.submit()}
                            disabled={loading}
                        >
                            Create Account
                        </button>
                    </div>
                </div>
            </form>
        </ModalCard>
    }
}

SignupModal.propTypes = {
    onSignup: PropTypes.func.isRequired
}

export default SignupModal
