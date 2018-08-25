import { connect } from 'react-redux'
import SpeciesConstraint from 'seedsource/components/SpeciesConstraint'

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

export default connect(mapStateToProps, null)(SpeciesConstraint)
