import React from 'react'
import PropTypes from 'prop-types'
import ShapefileConstraint from './ShapefileConstraint'
import { formatClimate } from '../../utils'

const speciesLabels = {
    pico: 'Lodgepole Pine',
    pisi: 'Sitka Spruce',
    psme: 'Douglas-fir',
    pipo: 'Ponderosa Pine',
    pien: 'Engelmann Spruce'
}

const modelLabels = {
    rcp45: 'RCP 4.5',
    rcp85: 'RCP 8.5'
}

const SpeciesConstraint = ({ index, species, model, year, onRemove }) => {
    return (
        <tr className="constraint">
            <td>
                <a
                    className="delete"
                    onClick={e => {
                        e.stopPropagation()
                        onRemove(index)
                    }}
                ></a>
            </td>
            <td><strong>{speciesLabels[species]}</strong></td>
            <td colSpan="2">
                {formatClimate(year, model)}
            </td>
        </tr>
    )
}

ShapefileConstraint.propTypes = {
    index: PropTypes.number.isRequired,
    species: PropTypes.string.isRequired,
    model: PropTypes.string,
    year: PropTypes.string.isRequired,
    onRemove: PropTypes.func.isRequired
}

export default SpeciesConstraint
