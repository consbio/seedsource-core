import { connect } from 'react-redux'
import LocationStep from 'seedsource/components/LocationStep'
import {setMapMode as _setMapMode} from '../../actions/map'
import { addUserSite as _addUserSite } from '../../actions/point'

const mapStateToProps = ({ runConfiguration, map }) => {
    const { mode } = map
    let { objective, point } = runConfiguration
    let { elevation } = point

    if (elevation !== null) {
        elevation = {ft: elevation / 0.3048, m: elevation}
    }

    return {objective, point, elevation, mode}
}

const mapDispatchToProps = dispatch => ({
    setMapMode: mode => dispatch(_setMapMode(mode)),
    addUserSite: (lat, lon) => dispatch(_addUserSite({lat, lon}))
})


let container = connect(mapStateToProps, mapDispatchToProps)(LocationStep)

container.shouldRender = () => true

export default container
