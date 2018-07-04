import React from 'react'
import PropTypes from 'prop-types'
import { species as speciesList } from '../../config'

const SpeciesChooser = ({ method, species, onSpeciesChange, zones, availableSpecies }) => {
    if (method !== 'seedzone') {
        return null
    }

    let availableSpeciesList = speciesList.filter(item => availableSpecies.includes(item.name))

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

                    {availableSpeciesList.map(item => (
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