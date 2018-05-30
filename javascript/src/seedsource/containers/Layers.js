import { connect } from 'react-redux'
import Layers from 'seedsource/components/Layers'

const mapStateToProps = ({ activeVariable, lastRun }) => {
    return { activeVariable, lastRun }
}

let layers = connect(mapStateToProps)(Layers)

layers.shouldRender = () => true

export default layers