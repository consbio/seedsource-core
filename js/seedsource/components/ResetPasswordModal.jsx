import React from 'react'
import ModalCard from 'seedsource/components/ModalCard'
import { post } from '../../io'

class ResetPasswordModal extends React.Component {
    constructor(props) {
        super(props)
        this.state = {emailText: null, submitted: false, loading: false, error: null}
    }

    show() {
        this.reset()
        this.modal.show()

        setTimeout(() => this.emailInput.focus(), 1)
    }

    hide() {
        this.modal.hide()
        this.reset()
    }

    reset() {
        this.setState({emailText: null, submitted: false, loading: false, error: null})
    }

    submit() {
        let { emailText } = this.state

        if ((emailText || '').trim()) {
            post('/accounts/lost-password/', {email: emailText}).then(response => {
                let { status } = response

                if (status === 400) {
                    return response.json()
                }

                if (status < 200 || status >= 300) {
                    throw new Error('Sorry, there was an error resetting your password.')
                }

                this.setState({ submitted: true, loading: false })
            }).then(json => {
                if (json) {
                    let {email} = json

                    if (email) {
                        throw new Error(email)
                    }
                }
            }).catch(err => {
                console.log(err)
                this.setState({loading: false, error: err.message})
            })
        }
    }

    render() {
        let { emailText, submitted, loading, error } = this.state
        let content

        if (submitted) {
            content = <article className="message is-success">
                <div className="message-body">
                    An email has been sent with a link to reset your password. If you don't receive this email, please
                    check your Spam folder.
                </div>
            </article>
        }
        else {
            let errorNode = null
            if (error !== null) {
                errorNode = <article className="message is-danger">
                    <div className="message-body">
                        {error}
                    </div>
                </article>
            }

            content = (
                <form
                    onSubmit={e => {
                        e.preventDefault()
                        this.submit()
                    }}
                >
                    <article className="message is-dark">
                        <div className="message-body">
                            Enter your email address to receive an email with a link to reset your password.
                        </div>
                    </article>
                    {errorNode}
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
                            <button
                                className={(loading ? 'is-loading ' : '') + 'button is-fullwidth is-primary'}
                                onClick={() => this.submit()}
                                disabled={loading || !(emailText || '').trim()}
                            >
                                Send link
                            </button>
                        </div>
                    </div>
                </form>
            )
        }

        return <ModalCard ref={input => { this.modal = input }} title="Reset Password">
            {content}
        </ModalCard>

    }
}

export default ResetPasswordModal
