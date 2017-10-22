import React from 'react'

class Modal extends React.Component {
    constructor(props) {
        super(props)
        this.state = {isActive: false}
    }

    show() {
        this.setState({isActive: true})
    }

    hide() {
        this.setState({isActive: false})

        let { onHide = null } = this.props
        if (onHide !== null) {
            onHide()
        }
    }

    render() {
        let { children, closeButton, active = false } = this.props
        let activeClass = (this.state.isActive || active) ? 'is-active' : ''

        let closeButtonNode = null
        if (closeButton !== false) {
            closeButtonNode = (
                <button className="modal-close is-large" aria-label="close" onClick={this.hide.bind(this)}></button>
            )
        }

        return (
            <div className={activeClass + ' modal'}>
                <div className="modal-background" onClick={this.hide.bind(this)}></div>
                {children}
                {closeButtonNode}
            </div>
        )
    }
}

export default Modal
