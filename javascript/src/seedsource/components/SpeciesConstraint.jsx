import React from 'react'
import PropTypes from 'prop-types'
import ShapefileConstraint from './ShapefileConstraint'
import { formatClimate } from '../../utils'

const SpeciesConstraint = ({ index, label, model = null, year = null, onRemove }) => {
    return (
        <tr className="constraint">
            <td>
                <a
                    className="delete"
                    onClick={e => {
                        e.stopPropagation()
                        onRemove(index)
                    }}
                />
            </td>
            <td><strong>{label}</strong></td>
            <td colSpan="2">
                {year === null ? null : formatClimate(year, model)}
            </td>
        </tr>
    )
}

ShapefileConstraint.propTypes = {
    index: PropTypes.number.isRequired,
    species: PropTypes.string.isRequired,
    model: PropTypes.string,
    year: PropTypes.string,
    onRemove: PropTypes.func.isRequired
}

export default SpeciesConstraint
