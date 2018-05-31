import { connect } from 'react-redux'
import Layers from 'seedsource/components/Layers'
import {toggleVariable} from "../../actions/variables";


const mapStateToProps = state => {
    let { activeVariable, lastRun, runConfiguration } = state
    let { variables } = runConfiguration
    let names = variables.map(item => item.name)
    return { activeVariable, lastRun, names }
}

const mapDispatchToProps = (dispatch, { name, index }) => {
    return {
        onToggle: () => {
            dispatch(toggleVariable(name))
        }
    }
}

let layers = connect(mapStateToProps, mapDispatchToProps)(Layers)

layers.shouldRender = () => true

export default layers