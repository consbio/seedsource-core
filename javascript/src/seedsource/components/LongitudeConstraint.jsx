import React from 'react'
import PropTypes from 'prop-types'
import Constraint from 'seedsource/containers/Constraint'
import EditableLabel from "seedsource/components/EditableLabel";

const LongitudeConstraint = ({ index, value, range, onRangeChange }) => (
    <Constraint index={index} value={value} unit="&deg;E" title="Longitude">
        <EditableLabel value={range} onChange={range => onRangeChange(index, range)}>
            <span>&nbsp;&deg;</span>
        </EditableLabel>
    </Constraint>
)

LongitudeConstraint.propTypes = {
    index: PropTypes.number.isRequired,
    value: PropTypes.string,
    range: PropTypes.string,
    onRangeChange: PropTypes.func.isRequired
}

export default LongitudeConstraint
