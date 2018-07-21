import { connect } from 'react-redux'
import SpeciesChooser from 'seedsource/components/SpeciesChooser'
import { selectSpecies } from '../../actions/species'
import config from 'seedsource/config'

const { species: speciesList, functions } = config

const mapStateToProps = ({ runConfiguration }) => {
    let { method, species, availableSpecies, zones } = runConfiguration

    if (method === 'function') {
        let functionSpecies
        if (functions.length === 1) {
            functionSpecies = functions[0].species
        }
        else {
            functionSpecies = functions.reduce((a, b) => [...a.species, ...b.species])
        }
        availableSpecies = speciesList.filter(item => functionSpecies.includes(item.name)).map(item => item.name)
    }

    return {method, species, zones, availableSpecies}
}

const mapDispatchToProps = dispatch => {
    return {
        onSpeciesChange: species => {
            dispatch(selectSpecies(species))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SpeciesChooser)
