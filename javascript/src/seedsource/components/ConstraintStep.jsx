import React from 'react'
import PropTypes from 'prop-types'
import ConstraintChooser from 'seedsource/components/ConstraintChooser'
import ConfigurationStep from 'seedsource/containers/ConfigurationStep'
import config from 'seedsource/config'

const { constraints: constraintsConfig } = config

const ConstraintStep = ({ number, constraints, onChange }) => {
    let table = null

    if (constraints.length) {
        table = (
            <table className="table is-fullwidth">
                <thead className="is-size-7">
                    <tr>
                        <th></th>
                        <th>Name</th>
                        <th>Value</th>
                        <th>Range (+/-)</th>
                    </tr>
                </thead>
                <tbody>
                    {constraints.map(({ type, values }, i) => {
                        let ConstraintTag = constraintsConfig.objects[type].component
                        return <ConstraintTag index={i} values={values} key={type + '_' + i} />
                    })}
                </tbody>
            </table>
        )
    }

    return (
        <ConfigurationStep
            title="Apply constraints"
            number={number}
            name="constraints"
            active={true}
            className="constraint-step"
        >
            {table}
            <ConstraintChooser onAdd={onChange} />
        </ConfigurationStep>
    )
}

ConstraintStep.shouldRender = () => true

ConstraintStep.propTypes = {
    number: PropTypes.number.isRequired,
    active: PropTypes.bool,
    constraints: PropTypes.array,
    onChange: PropTypes.func.isRequired
}

export default ConstraintStep
