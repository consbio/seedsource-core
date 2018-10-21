import { connect } from 'react-redux'
import config from 'seedsource/config'
import { addTrait } from '../../actions/traits'
import Traits from 'seedsource/components/Traits'
import { selectSpecies } from '../../actions/species'

const mapStateToProps = ({ runConfiguration }) => {
    let { traits, species } = runConfiguration
    let names = traits.map(item => item.name)
    let unusedTraits = config.functions
        .filter(item => item.species.includes(species))
        .filter(item => !names.includes(item.name))

    return { traits, unusedTraits, species }
}

const mapDispatchToProps = dispatch => {
    return {
        onChange: trait => dispatch(addTrait(trait)),
        onSpeciesChange: species => dispatch(selectSpecies(species))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Traits)
