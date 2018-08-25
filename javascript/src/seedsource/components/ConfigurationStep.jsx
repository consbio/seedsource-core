import React from 'react'
import PropTypes from 'prop-types'
import { collapsibleSteps } from '../../config'

const ConfigurationStep = ({ number, title, children, active, className, onClick }) => {
    if (collapsibleSteps) {
        return (
            <div
                className={`configuration-step ${className}` + (active ? " active" : "")}
                onClick={e => {
                    e.stopPropagation()
                    onClick()
                }}>
                <div className="gradient-top"></div>
                <h4><span className="badge">{ number }</span> { title }</h4>
                {children}
                <div className="gradient-bottom"></div>
            </div>
        )
    }
    else {
        return (
            <div className={`configuration-step no-collapse ${className}`}>
                <h4><span className="badge">{ number }</span> { title }</h4>
                <div className="step-content">
                    {children}
                </div>
            </div>
        )
    }
}

ConfigurationStep.propTypes = {
    active: PropTypes.bool.isRequired,
    number: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired
}

export default ConfigurationStep
