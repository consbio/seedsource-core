import { connect } from 'react-redux'
import ShapefileConstraint from 'seedsource/components/ShapefileConstraint'
import { removeConstraint } from '../../actions/constraints'


const mapDispatchToProps = dispatch => {
    return {
        onRemove: index => {
            dispatch(removeConstraint(index))
        }
    }
}

export default connect(null, mapDispatchToProps)(ShapefileConstraint)