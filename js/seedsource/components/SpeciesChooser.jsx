import React from 'react'
import PropTypes from 'prop-types'
import { species as speciesList } from '../../config'

const SpeciesChooser = ({ method, species, onSpeciesChange }) => {
    if (method !== 'seedzone') {
        return null
    }

    return (
        <div>
            <h5 className="title is-5 is-marginless">Select a species</h5>
            <div className="select">
                <select
                    value={species}
                    onChange={e => {
                        e.preventDefault()
                        onSpeciesChange(e.target.value)
                    }}
                >
                    <option value="generic">Generic</option>

                    {speciesList.map(item => (
                        <option value={item.name} key={item.name}>{item.label}</option>
                    ))}
                </select>
            </div>
        </div>
    )
}

SpeciesChooser.propTypes = {
    method: PropTypes.string.isRequired,
    species: PropTypes.string.isRequired,
    onSpeciesChange: PropTypes.func.isRequired
}
    
export default SpeciesChooser
