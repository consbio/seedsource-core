import { connect } from 'react-redux'
import VariableStep from 'seedsource/components/VariableStep'

const mapStateToProps = ({ runConfiguration }) => {
    let { variables } = runConfiguration

    return { variables }
}

export default connect(mapStateToProps)(VariableStep)
