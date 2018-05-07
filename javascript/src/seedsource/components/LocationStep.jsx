import React from 'react'
import PropTypes from 'prop-types'
import ConfigurationStep from 'seedsource/containers/ConfigurationStep'
import PointChooser from 'seedsource/containers/PointChooser'

let getObjectiveLabel = objective => (
    objective === 'seedlots' ? 'Select planting site location' : 'Select seedlot location'
)

class LocationStep extends React.Component {
    render() {
        let { objective, number, point, elevation, active } = this.props

        if (elevation !== null) {
            elevation = (
                <div>
                    <div><strong>Elevation:</strong> {Math.round(elevation.ft)} ft ({Math.round(elevation.m)} m)</div>
                </div>
            )
        }

        if (!active) {
            if (point !== null) {
                return (
                    <ConfigurationStep
                        title={getObjectiveLabel(objective)}
                        number={number}
                        name="location"
                        active={false}
                    >
                        <div><strong>Point:</strong> {point.y.toFixed(4)}, {point.x.toFixed(4)}</div>
                        {elevation}
                    </ConfigurationStep>
                )
            }
            else {
                return (
                    <ConfigurationStep
                        title={getObjectiveLabel(objective)}
                        number={number}
                        name="location"
                        active={false}
                    >
                        <div><em>Click to select a point.</em></div>
                    </ConfigurationStep>
                )
            }
        }

        let instruction = 'Locate your planting site'
        if (objective === 'sites') {
            instruction = 'Locate your seedlot (its climatic center)'
        }

        return (
            <ConfigurationStep title={getObjectiveLabel(objective)} number={number} name="location" active={true}>
                <div className="is-size-7">
                    <div><em>{instruction}</em></div>
                    <div><em>Use the map or enter coordinates</em></div>
                </div>

                <div>&nbsp;</div>

                <PointChooser />
                {elevation !== null ? <div>&nbsp;</div> : null}
                {elevation}
            </ConfigurationStep>
        )
    }
}

LocationStep.shouldRender = () => true

LocationStep.propTypes = {
    active: PropTypes.bool.isRequired,
    point: PropTypes.object,
    objective: PropTypes.string.isRequired,
    elevation: PropTypes.object,
    number: PropTypes.number.isRequired
}

export default LocationStep
