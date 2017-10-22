import React from 'react'
import PropTypes from 'prop-types'
import Modal from 'seedsource/components/Modal'

class ModalCard extends React.Component {
    show() {
        this.modal.show()
    }

    hide() {
        this.modal.hide()
    }

    render() {
        let { title, children, footer = null, active = false, onHide = null } = this.props

        return <Modal closeButton={false} ref={input => {this.modal = input}} active={active} onHide={onHide}>
            <div className="modal-card">
                <header className="modal-card-head">
                    <p className="modal-card-title">{title}</p>
                    <button className="delete" aria-label="close" onClick={() => this.modal.hide()}></button>
                </header>
                <section className="modal-card-body">
                    <div className="content">
                        {children}
                    </div>
                </section>
                <footer className="modal-card-foot">{footer}</footer>
            </div>
        </Modal>
    }
}

ModalCard.propTypes = {
    title: PropTypes.string.isRequired
}

export default ModalCard
