import React from 'react'
import PropTypes from 'prop-types'
import ConfigurationStep from 'seedsource/containers/ConfigurationStep'
import UnitButton from 'seedsource/containers/UnitButton'
import Variables from 'seedsource/containers/Variables'

const VariableStep = ({ number, active, variables }) => {
    if (!active) {
        let content = <div><em>Click to add variables</em></div>

        if (variables.length > 0) {
            content = <Variables edit={false} />
        }

        return (
            <ConfigurationStep title="Select climate variables" number={number} name="variables" active={false}>
                {content}
            </ConfigurationStep>
        )
    }

    return (
        <ConfigurationStep title="Select climate variables" number={number} name="variables" active={true}>
            <div className="margin-bottom-10">
                <strong>Units: </strong>
                <div className="tabs is-toggle is-inline-block is-small align-middle">
                    <ul>
                        <UnitButton name="metric">Metric</UnitButton>
                        <UnitButton name="imperial">Imperial</UnitButton>
                    </ul>
                </div>
            </div>

            <Variables edit={true} />
        </ConfigurationStep>
    )
}

VariableStep.shouldRender = ({ runConfiguration }) => runConfiguration.method !== 'function'

VariableStep.propTypes = {
    active: PropTypes.bool.isRequired,
    number: PropTypes.number.isRequired,
    variables: PropTypes.array.isRequired
}

export default VariableStep
