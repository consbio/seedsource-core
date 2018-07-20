import React from 'react'
import ConfigurationStep from 'seedsource/containers/ConfigurationStep'
import Traits from 'seedsource/containers/Traits'

const TraitStep = ({ number }) => (
    <ConfigurationStep title="Select traits" number={number} active={true}>
        <Traits />
    </ConfigurationStep>
)

TraitStep.shouldRender = ({ runConfiguration }) => runConfiguration.method === 'function'

export default TraitStep
