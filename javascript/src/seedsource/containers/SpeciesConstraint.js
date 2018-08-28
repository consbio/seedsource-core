import { connect } from 'react-redux'
import SpeciesConstraint from 'seedsource/components/SpeciesConstraint'
import { removeConstraint } from '../../actions/constraints'

const mapStateToProps = ({ runConfiguration }, { index }) => {
    let { climate, constraints } = runConfiguration
    let { time, model } = climate.site
    let constraint = constraints[index]
    let { species } = constraint.values

    return {
        year: time,
        model,
        species
    }
}

const mapDispatchToProps = dispatch => {
    return {
        onRemove: index => {
            dispatch(removeConstraint(index))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SpeciesConstraint)
