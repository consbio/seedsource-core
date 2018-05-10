import { connect } from 'react-redux'
import ShapefileConstraint from 'seedsource/components/ShapefileConstraint'
import { removeConstraint } from '../../actions/constraints'

const mapStateToProps = () => {
    return {}
}

const mapDispatchToProps = dispatch => {
    return {
        onRemove: index => {
            dispatch(removeConstraint(index))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ShapefileConstraint)