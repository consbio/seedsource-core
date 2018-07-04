import { connect } from 'react-redux'
import { selectZone } from '../../actions/zones'
import SeedZoneChooser from 'seedsource/components/SeedZoneChooser'

const mapStateToProps = ({ runConfiguration }) => {
    let { method, species, point, zones } = runConfiguration
    let { selected, matched, isFetchingZones } = zones

    let pointIsValid = point !== null && point.x !== null && point.y !== null && point.x !== "" && point.y !== ""

    return {
        zones: matched,
        species,
        selected,
        method,
        pointIsValid,
        isFetchingZones
    }
}

const mapDispatchToProps = dispatch => {
    return {
        onZoneChange: zone => {
            dispatch(selectZone(zone))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SeedZoneChooser)
