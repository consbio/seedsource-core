import { connect } from 'react-redux'
import { modifyVariable, resetTransfer, removeVariable } from '../../actions/variables'
import { toggleLayer } from '../../actions/layers'
import Variable from 'seedsource/components/Variable'
import { variables as allVariables } from '../../config'

const mapStateToProps = (state, { variable }) => {
    let { layers, runConfiguration } = state
    let active = !!layers.find(layer => layer.name === variable.name && layer.displayed === true)
    let { objective, unit, method, center } = runConfiguration
    let variableConfig = allVariables.find(item => item.name === variable.name)
    let { name, value, zoneCenter, transfer, avgTransfer, transferIsModified } = variable
    let { label, multiplier, units } = variableConfig

    transferIsModified = transferIsModified && method === 'seedzone'

    let convert = number => {
        if (number !== null) {
            number /= multiplier

            let { precision } = units.metric

            if (unit === 'imperial') {
                precision = units.imperial.precision
                number = units.imperial.convert(number)
            }

            return number.toFixed(precision)
        }

        return number
    }

    let convertTransfer = number => {
        if (number === null) {
            return '--'
        }

        number /= multiplier

        let { transferPrecision } = units.metric

        if (unit === 'imperial') {
            let { convertTransfer, convert } = units.imperial
            transferPrecision = units.imperial.transferPrecision

            if (convertTransfer) {
                return convertTransfer(number).toFixed(transferPrecision)
            }
            else if (convert !== null) {
                return convert(number).toFixed(transferPrecision)
            }
        }

        return number.toFixed(transferPrecision)
    }

    transfer = convertTransfer(transfer)
    avgTransfer = convertTransfer(avgTransfer)
    value = convert(value)
    zoneCenter = convert(zoneCenter)

    let centerValue = method === 'seedzone' && center === 'zone' && objective === 'sites' ? zoneCenter : value

    return {
        active,
        name,
        label,
        value,
        zoneCenter,
        transfer,
        avgTransfer,
        transferIsModified,
        unit,
        units,
        method,
        centerValue
    }
}

const mapDispatchToProps = (dispatch, { variable, index }) => {
    return {
        onTransferChange: (transfer, unit, units) => {
            let value = parseFloat(transfer)

            if (!isNaN(value)) {
                if (unit === 'imperial' && units !== null) {
                    if (units.metric.convertTransfer) {
                        value = units.metric.convertTransfer(value)
                    }
                    else if (units.metric.convert !== null) {
                        value = units.metric.convert(value)
                    }
                }

                let variableConfig = allVariables.find(item => item.name === variable.name)

                dispatch(modifyVariable(variable.name, value * variableConfig.multiplier))
            }
        },

        onResetTransfer: () => {
            dispatch(resetTransfer(variable.name))
        },

        onToggle: () => {
            dispatch(toggleLayer(variable.name))
        },

        onRemove: () => {
            dispatch(removeVariable(variable.name, index))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Variable)
