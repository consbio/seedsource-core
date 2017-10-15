import React from 'react'
import PropTypes from 'prop-types'
import ObjectiveStep from 'seedsource/containers/ObjectiveStep'
import LocationStep from 'seedsource/containers/LocationStep'
import RegionStep from 'seedsource/containers/RegionStep'
import ClimateStep from 'seedsource/containers/ClimateStep'
import TransferStep from 'seedsource/containers/TransferStep'
import VariableStep from 'seedsource/containers/VariableStep'
import ConstraintStep from 'seedsource/containers/ConstraintStep'
import RunStep from 'seedsource/containers/RunStep'
import { collapsibleSteps } from '../../config'

let RunConfiguration = ({ state, objective, method, job, activeStep }) => {
    let overlay = null

    if (job.isRunning) {
        let label = <h4 className="title is-4">Calculating scores...</h4>

        if (job.queued) {
            label = (
                <div>
                    <h4 className="title is-4">Waiting for other jobs to finish...</h4>
                    <div>
                        Another job is currently running. Your job is queued and will run as soon as other jobs
                        are finished.
                    </div>
                </div>
            )
        }

        overlay = (
            <div className="overlay">
                <div className="progress-container">
                    {label}
                    <progress></progress>
                </div>
            </div>
        )
    }

    let steps = [
        {type: ObjectiveStep, key: 'objective'},
        {type: LocationStep, key: 'location'},
        {type: RegionStep, key: 'region'},
        {type: ClimateStep, key: 'climate'},
        {type: TransferStep, key: 'transfer'},
        {type: VariableStep, key: 'variables'},
        {type: ConstraintStep, key: 'constraints'},
        {type: RunStep, key: 'run'}
    ]

    return (
        <div>
            {overlay}

            {steps.filter(item => item.type.shouldRender(state)).map((item, i) => {
                return (
                    <item.type
                        number={i + 1}
                        title={item.title}
                        key={item.key}
                        active={activeStep === item.key || !collapsibleSteps}
                    />
                )
            })}
        </div>
    )
}

RunConfiguration.propTypes = {
    activeStep: PropTypes.string.isRequired,
    state: PropTypes.object.isRequired,
    objective: PropTypes.string.isRequired,
    method: PropTypes.string.isRequired,
    job: PropTypes.object.isRequired
}

export default RunConfiguration
