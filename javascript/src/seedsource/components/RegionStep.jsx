import React from 'react'
import PropTypes from 'prop-types'
import ConfigurationStep from 'seedsource/containers/ConfigurationStep'
import RegionButton from 'seedsource/containers/RegionButton'
import { regions } from '../../config'

const RegionStep = ({ number, region, regionMethod, onChange }) => {
    let buttons = (
        <div className="tabs is-toggle is-small">
            <ul>
                <RegionButton name="auto">Automatic</RegionButton>
                <RegionButton name="custom">Custom</RegionButton>
            </ul>
        </div>
    )

    if (regionMethod === 'auto') {
        let regionLabel = region !== null ? regions.find(r => r.name == region).label : 'N/A'
        return (
            <ConfigurationStep title="Select region" number={number} name="region" active={true}>
                {buttons}
                <strong>Region:</strong> {regionLabel}
            </ConfigurationStep>
        )
    } else {
        return (
            <ConfigurationStep title="Select region" number={number} name="region" active={true}>
                {buttons}
                <div style={{marginTop:'3px'}}>
                    <div className="align-middle is-inline-block"><strong>Region: </strong></div>
                    <div className="select align-middle is-inline-block">
                        <select
                            value={region ? region : regions[0].name}
                            onChange={e => {
                                e.preventDefault()
                                onChange(e.target.value)
                            }}>
                            {regions.map(r => (
                                <option value={r.name} key={r.name}>{r.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </ConfigurationStep>
        )
    }
}

RegionStep.propTypes = {
    number: PropTypes.number.isRequired,
    active: PropTypes.bool.isRequired,
    region: PropTypes.string,
    regionMethod: PropTypes.string.isRequired,
}

export default RegionStep
