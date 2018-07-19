import React from 'react'
import PropTypes from 'prop-types'
import ConfigurationStep from 'seedsource/containers/ConfigurationStep'
import MethodButton from 'seedsource/containers/MethodButton'
import SpeciesChooser from 'seedsource/containers/SpeciesChooser'
import SeedZoneChooser from 'seedsource/containers/SeedZoneChooser'

const TransferStep = ({ number, active, objective, method, center, onCenterChange }) => {
    if (!active) {
        let label

        if (method === 'seedzone') {
            label = 'Transfer limits based on seed zone, climatic center based on the selected location'

            if (center === 'zone') {
                label = 'Transfer limits and climatic center based on seed zone'
            }
        }
        else {
            label = 'Custom transfer limits, climatic center based on the selected location'
        }

        return (
            <ConfigurationStep title="Select transfer limit method" number={number} name="transfer" active={false}>
                <div>{label}</div>
            </ConfigurationStep>
        )
    }

    let centerNode = null

    if (method === 'seedzone' && objective === 'sites') {
        centerNode = (
            <div>
                <div className="is-size-7"><em>Which should be used as the climatic center?</em></div>
                <div className="control">
                    <div>
                        <label className="radio">
                            <input
                                type="radio"
                                checked={center === 'point'}
                                onChange={() => onCenterChange('point')}
                            />
                            The value at the selected location
                        </label>
                    </div>
                    <div>
                        <label className="radio">
                            <input
                                type="radio"
                                checked={center === 'zone'}
                                onChange={() => onCenterChange('zone')}
                            />
                            The climatic center of the zone
                        </label>
                    </div>
                </div>
                <div>&nbsp;</div>
            </div>
        )
    }

    return (
        <ConfigurationStep title="Select transfer limit method" number={number} name="transfer" active={true}>
            <div className="tabs is-toggle is-small">
                <ul>
                    <MethodButton name="custom">Custom</MethodButton>
                    <MethodButton name="seedzone">Zone</MethodButton>
                    <MethodButton name="function">Function</MethodButton>
                </ul>
            </div>
            {centerNode}
            { method !== 'custom' ? <SpeciesChooser generic={method !== 'function'} /> : null }
            <div style={{height: '10px'}}></div>
            { method === 'seedzone' ? <SeedZoneChooser /> : null }
        </ConfigurationStep>
    )
}

TransferStep.shouldRender = () => true

TransferStep.propTypes = {
    active: PropTypes.bool.isRequired,
    objective: PropTypes.string.isRequired,
    method: PropTypes.string.isRequired,
    center: PropTypes.string.isRequired,
    onCenterChange: PropTypes.func.isRequired
}

export default TransferStep
