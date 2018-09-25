import { connect } from 'react-redux'
import SpeciesConstraint from 'seedsource/components/SpeciesConstraint'
import { removeConstraint } from '../../actions/constraints'

const mapStateToProps = ({ runConfiguration }, { index }) => {
    let { climate, constraints, objective } = runConfiguration
    let { time, model } = (objective === 'seedlots' ? climate.seedlot : climate.site)
    let constraint = constraints[index]
    let { species, label } = constraint.values

    return {
        year: time,
        model,
        species,
        label
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
