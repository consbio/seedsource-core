import { connect } from 'react-redux'
import Layers from 'seedsource/components/Layers'
import {toggleLayer, loadTiles} from '../../actions/layers';


const mapStateToProps = state => {
    let { layers } = state

    return { layers }
}

const mapDispatchToProps = (dispatch) => {
    return {
        onToggleLayer: (name) => {
            dispatch(toggleLayer(name))
        },

        onLoadTiles: (tiles) => {
            dispatch(loadTiles(tiles))
        }
    }
}

let layers = connect(mapStateToProps, mapDispatchToProps)(Layers)

layers.shouldRender = () => true

export default layers