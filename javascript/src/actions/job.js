import { executeGPTask } from '../io'
import { setError } from './error'
import { selectTab } from './tabs'
import { constraints as constraintsConfig } from '../config'
import config from 'seedsource/config'

const { functions } = config

export const START_JOB = 'START_JOB'
export const FAIL_JOB = 'FAIL_JOB'
export const RECEIVE_JOB_STATUS = 'RECEIVE_JOB_STATUS'
export const FINISH_JOB = 'FINISH_JOB'

export const startJob = configuration => {
    return {
        type: START_JOB,
        configuration
    }
}

export const failJob = () => {
    return {
        type: FAIL_JOB
    }
}

export const receiveJobStatus = json => {
    return {
        type: RECEIVE_JOB_STATUS,
        status: json.status,
        serviceId: json.status === 'success' ? JSON.parse(json.outputs).raster_out : null
    }
}

export const finishJob = configuration => {
    return {
        type: FINISH_JOB,
        configuration
    }
}

export const runJob = configuration => {
   return dispatch => {
       let { variables, traits, objective, climate, region, constraints } = configuration

       /* Run the tool against the seedlot climate when looking for seedlots, otherwise run against the
        * planting site climate.
        */
        let selectedClimate = objective === 'seedlots' ? climate.seedlot : climate.site

        let inputs = {
            region: region,
            year: selectedClimate.time,
            model: selectedClimate.model === null ? undefined : selectedClimate.model,
            variables: variables.map(item => {
                let { name, value, transfer } = item
                return {
                    name,
                    limit: {min: value-transfer, max: value+transfer}
                }
            }),
            traits: traits.map(item => {
                let { name, value, transfer: customTransfer } = item
                let traitConfig = functions.find(item => item.name === name)
                let { transfer: defaultTransfer, fn } = traitConfig
                let transfer = customTransfer === null ? defaultTransfer : customTransfer
                return {
                    name,
                    fn,
                    limit: {min: value-transfer, max: value+transfer}
                }
            }),
            constraints: constraints.map(({ type, values }) => {
                return {name: type, args: constraintsConfig[type].serialize(configuration, values)}
            }),
            region
        }

       dispatch(startJob(configuration))

       return executeGPTask('generate_scores', inputs, json => dispatch(receiveJobStatus(json))).then(() => {
           dispatch(finishJob(configuration))
           dispatch(selectTab('map'))
       }).catch(err => {
           console.log(err)

           let data = {action: 'runJob'}
           if (err.json !== undefined) {
               data.response = err.json
           }

           dispatch(failJob())
           dispatch(setError('Processing error', 'Sorry, processing failed.', JSON.stringify(data, null, 2)))
       })
   }
}
