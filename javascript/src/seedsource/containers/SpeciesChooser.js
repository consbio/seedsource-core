import { connect } from 'react-redux'
import SpeciesChooser from 'seedsource/components/SpeciesChooser'
import { selectSpecies } from '../../actions/species'

const mapStateToProps = ({ runConfiguration }) => {
    let { method, species, zones } = runConfiguration

    return {method, species, zones}
}

const mapDispatchToProps = dispatch => {
    return {
        onSpeciesChange: species => {
            dispatch(selectSpecies(species))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SpeciesChooser)
