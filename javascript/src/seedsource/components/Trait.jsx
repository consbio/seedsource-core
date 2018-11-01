import React from 'react'
import EditableLabel from 'seedsource/components/EditableLabel'
import ReactTooltip from "react-tooltip"

export default ({ trait, traitConfig, onRemove, onTransferChange }) => {
    let { name, value } = trait
    let { customTransfer, label, units = null, description = null } = traitConfig
    let transfer = trait.transfer === null ? traitConfig.transfer : trait.transfer

    return <tr data-tip data-for={name + "_Tooltip"}>
        <td>
            <a
                type="button"
                className="delete"
                onClick={e => {
                    e.stopPropagation()
                    onRemove()
                }}
            ></a>
        </td>
        <td className="trait-label">
            <strong>{label}</strong>
        </td>
        <td>
            {value !== null ? value.toFixed(2) : '--'} {units}
        </td>
        <td>
            {
                customTransfer ?
                <EditableLabel value={transfer} onChange={value => onTransferChange(value)}/> : transfer
            } {units}

            <ReactTooltip id={name + "_Tooltip"} className="variable-tooltip" place="right" effect="solid">
                <h5 className="title is-5 margin-bottom-5">{label}</h5>
                {description !== null ? <div className="is-size-7 has-text-grey-lighter">{description}</div> : null}
                <div>
                    <span className="tooltip-label">Value at point:</span>
                    <strong>{value !== null ? value.toFixed(2) : '--'} {units}</strong>
                </div>
                <div>
                    <span className="tooltip-label">Transfer limit (+/-):</span>
                    <strong>{transfer} {units}</strong>
                </div>
            </ReactTooltip>
        </td>
    </tr>
}
