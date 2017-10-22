import React from 'react'
import PropTypes from 'prop-types'
import ModalCard from 'seedsource/components/ModalCard'

const ErrorModal = ({ show, title, message, debugInfo, onHide }) => {
    if (!show) {
        return null
    }

    let debug = null

    if (debugInfo !== null) {
        debug = (
            <div>
                <p>
                    If the problem persists, please <a href="https://github.com/consbio/seedsource/issues" target="_blank">
                    report an issue</a> and include the following information:
                </p>
                <pre  className="error-debug-info">{debugInfo}</pre>
            </div>
        )
    }

    return (
        <ModalCard title={title} onHide={() => onHide()} active={true}>
            <p>{message}</p>
            {debug}
        </ModalCard>
    )
}

ErrorModal.propTypes = {
    show: PropTypes.bool.isRequired,
    title: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    debugInfo: PropTypes.string,
    onHide: PropTypes.func.isRequired
}

export default ErrorModal
