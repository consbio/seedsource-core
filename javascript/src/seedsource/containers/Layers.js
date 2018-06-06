import { connect } from 'react-redux'
import Layers from 'seedsource/components/Layers'
import {toggleVariable} from '../../actions/variables';
import {toggleVisibility} from '../../actions/map'


const mapStateToProps = state => {
    let { layers } = state

    return { layers }
}

const mapDispatchToProps = (dispatch) => {
    return {
        onToggleVariable: (name) => {
            dispatch(toggleVariable(name))
        },
        onToggleVisibility: () => {
            dispatch(toggleVisibility())
        }
    }
}

let layers = connect(mapStateToProps, mapDispatchToProps)(Layers)

layers.shouldRender = () => true

export default layers