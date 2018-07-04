import React from 'react'
import PropTypes from 'prop-types'

const getZoneLabel = zone => {
    if (zone === undefined) {
        return null
    }

    let label = zone.name

    if (zone.elevation_band) {
        label += ", " + zone.elevation_band[0] + "' - " + zone.elevation_band[1] + "'"
    }

    return label
}

const SeedZoneChooser = ({ method, selected, zones, pointIsValid, isFetchingZones, onZoneChange }) => {
    if (method !== 'seedzone') {
        return null
    }

    let noZoneLabel = pointIsValid ? 'No zones at this location...' : 'Select a location...'

    let content = (
        <div className="select">
            <select disabled>
                <option>{noZoneLabel}</option>
            </select>
        </div>
    )

    if (zones.length) {
        content = (
            <div className="select">
                <select
                    value={selected}
                    disabled={isFetchingZones}
                    onChange={e => {
                        e.preventDefault()
                        onZoneChange(e.target.value)
                    }}
                >
                    {zones.map(item => (
                        <option value={item.zone_uid} key={item.id}>{getZoneLabel(item)}</option>
                    ))}
                </select>
            </div>
        )
    }

    return (
        <div>
            <h5 className="title is-5 is-marginless">Select zone</h5>
            {content}
        </div>
    )
}

SeedZoneChooser.propTypes = {
    selected: PropTypes.string,
    method: PropTypes.string.isRequired,
    zones: PropTypes.array.isRequired,
    pointIsValid: PropTypes.bool.isRequired,
    species: PropTypes.string.isRequired,
    isFetchingZones: PropTypes.bool.isRequired,
    onZoneChange: PropTypes.func.isRequired
}

export default SeedZoneChooser
