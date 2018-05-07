import React from 'react'
import PropTypes from 'prop-types'
import ModalCard from 'seedsource/components/ModalCard'

const months = [
    'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November',
    'December'
];

class SaveModal extends React.Component {
    constructor(props) {
        super(props)
        this.state = {overwrite: false, title: ''}
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.showModal && !this.props.showModal) {
            let today = new Date()
            let title = 'Saved run - ' + months[today.getMonth()] + ' ' + today.getDate() + ', ' + today.getFullYear()

            this.setState({overwrite: false, title: title})

            setTimeout(() => {
                this.titleInput.focus()
                this.titleInput.select()
            }, 1)
        }
    }

    render() {
        let { showModal, lastSave, runConfiguration, onHide, onSave, onUpdate } = this.props
        let body

        if (lastSave === null || this.state.overwrite) {
            body = (
                <form
                    onSubmit={e => {
                        e.preventDefault()

                        if (this.state.title) {
                            onSave(runConfiguration, this.state.title)
                        }
                    }}
                >
                    <label className="control-label">Title</label>
                    <input
                        type="text"
                        data-lpignore="true"
                        className="input"
                        value={this.state.title}
                        required
                        onChange={e => {
                            this.setState({title: e.target.value})
                        }}
                        ref={input => { this.titleInput = input }}
                    />
                    <div>&nbsp;</div>
                    <button className="button is-primary" type="submit">Save</button>
                </form>
            )
        }
        else {
            body = (
                <div>
                    <div>
                        Do you want to update the current configuration,
                        <strong>{lastSave.title}</strong>, or save as a new configuration?
                    </div>
                    <div>&nbsp;</div>
                    <div>
                        <button
                            className="button is-pulled-left"
                            onClick={() => {
                                this.setState({overwrite: true})
                            }}
                        >
                            Save as new
                        </button>

                        <button
                            className="button is-primary is-pulled-right"
                            onClick={() => {
                                onUpdate(runConfiguration, lastSave)
                            }}
                        >
                            Update current
                        </button>
                    </div>
                    <div style={{clear: 'both'}}></div>
                </div>
            )
        }

        return (
            <ModalCard title="Save Run Configuration" active={showModal} onHide={() => onHide()}>
                {body}
            </ModalCard>
        )
    }
}

SaveModal.propTypes = {
    showModal: PropTypes.bool.isRequired,
    lastSave: PropTypes.object,
    runConfiguration: PropTypes.object.isRequired,
    onHide: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    onUpdate: PropTypes.func.isRequired
}

export default SaveModal
