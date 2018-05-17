import React from 'react'
import PropTypes from 'prop-types'
import Constraint from 'seedsource/containers/Constraint'
import EditableLabel from 'seedsource/components/EditableLabel'

const DistanceConstraint = ({ index, value, range, unit, onRangeChange }) => {
    let unitLabel = unit === 'metric' ? 'km' : 'mi'

    return (
        <Constraint index={index} value={value} title="Distance">
            <EditableLabel value={range} onChange={range => onRangeChange(index, range, unit)}>
                &nbsp;{unitLabel}
            </EditableLabel>
        </Constraint>
    )
}

DistanceConstraint.propTypes = {
    index: PropTypes.number.isRequired,
    x: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    y: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    range: PropTypes.number,
    unit: PropTypes.string.isRequired,
    onRangeChange: PropTypes.func.isRequired
}

export default DistanceConstraint