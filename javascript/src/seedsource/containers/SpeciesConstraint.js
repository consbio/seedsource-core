import { connect } from 'react-redux'
import SpeciesConstraint from 'seedsource/components/SpeciesConstraint'
import { removeConstraint } from '../../actions/constraints'

const mapStateToProps = ({ runConfiguration }, { index }) => {
    let { climate, constraints, objective } = runConfiguration
    let { time, model } = (objective === 'seedlots' ? climate.seedlot : climate.site)
    let constraint = constraints[index]
    let { species, label, isRegion } = constraint.values

    const props = {
        species,
        label
    }

    if (!isRegion) {  // Region constrains don't vary by time or model
        props.year = time
        props.model = model
    }

    return props
}

const mapDispatchToProps = dispatch => {
    return {
        onRemove: index => {
            dispatch(removeConstraint(index))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SpeciesConstraint)
