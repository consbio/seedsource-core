import React from 'react'
import PropTypes from 'prop-types'
import Constraint from 'seedsource/containers/Constraint'
import EditableLabel from 'seedsource/components/EditableLabel'

const ElevationConstraint = ({ index, value, range, unit, onRangeChange }) => {
    let unitLabel = unit === 'metric' ? 'm' : 'ft'

    return (
        <Constraint index={index} value={value} unit={unitLabel} title="Elevation">
            <EditableLabel value={range} onChange={range => onRangeChange(index, range, unit)}>
                &nbsp;{unitLabel}
            </EditableLabel>
        </Constraint>
    )
}

ElevationConstraint.propTypes = {
    index: PropTypes.number.isRequired,
    range: PropTypes.number,
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    unit: PropTypes.string.isRequired,
    onRangeChange: PropTypes.func.isRequired
}

export default ElevationConstraint
