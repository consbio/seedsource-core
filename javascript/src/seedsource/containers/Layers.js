import { connect } from 'react-redux'
import Layers from 'seedsource/components/Layers'
import {toggleLayer} from '../../actions/layers';


const mapStateToProps = state => {
    let { layers } = state

    return { layers }
}

const mapDispatchToProps = (dispatch) => {
    return {
        onToggleLayer: (name) => {
            dispatch(toggleLayer(name))
        }
    }
}

let layers = connect(mapStateToProps, mapDispatchToProps)(Layers)

layers.shouldRender = () => true

export default layers