import React from 'react'
import PropTypes from 'prop-types'
import config from 'seedsource/config'

const { species: speciesList } = config

const SpeciesChooser = ({ method, species, generic=true, onSpeciesChange, zones, availableSpecies }) => {
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
                    { generic ? <option value="generic">Generic</option> : null }

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
    generic: PropTypes.bool,
    onSpeciesChange: PropTypes.func.isRequired
}
    
export default SpeciesChooser
