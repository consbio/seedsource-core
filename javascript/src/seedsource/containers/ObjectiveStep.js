import { connect } from 'react-redux'
import ObjectiveStep from 'seedsource/components/ObjectiveStep'

const mapStateToProps = ({ runConfiguration }) => {
    let { objective } = runConfiguration

    return {objective}
}

export default connect(mapStateToProps)(ObjectiveStep)
