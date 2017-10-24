import React from 'react'
import PropTypes from 'prop-types'
import ConfigurationStep from 'seedsource/containers/ConfigurationStep'
import ObjectiveButton from 'seedsource/containers/ObjectiveButton'

class ObjectiveStep extends React.Component {
    render() {
        let { number, active, objective } = this.props

        if (!active) {
            return (
                <ConfigurationStep title="Select objective" number={number} name="objective" active={false}>
                    <div>{objective === 'seedlots' ? 'Find seedlots' : 'Find planting sites'}</div>
                </ConfigurationStep>
            )
        }

        return (
            <ConfigurationStep title="Select objective" number={number} name="objective" active={true}>
                <div className="tabs is-toggle is-small">
                    <ul>
                        <ObjectiveButton name="seedlots">Find seedlots</ObjectiveButton>
                        <ObjectiveButton name="sites">Find planting sites</ObjectiveButton>
                    </ul>
                </div>
            </ConfigurationStep>
        )
    }
}

ObjectiveStep.shouldRender = () => true

ObjectiveStep.propTypes = {
    number: PropTypes.number.isRequired,
    active: PropTypes.bool.isRequired,
    objective: PropTypes.string.isRequired
}

export default ObjectiveStep
