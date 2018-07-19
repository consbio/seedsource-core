import React from 'react'
import ConfigurationStep from 'seedsource/containers/ConfigurationStep'

const TraitStep = ({ number }) => (
    <ConfigurationStep title="Select traits" number={number} active={true}>

    </ConfigurationStep>
)

TraitStep.shouldRender = ({ runConfiguration }) => runConfiguration.method === 'function'

export default TraitStep
