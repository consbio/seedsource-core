import React from 'react'
import EditableLabel from 'seedsource/components/EditableLabel'

export default ({ trait, traitConfig, onRemove, onTransferChange }) => {
    let { name, value } = trait
    let { customTransfer } = traitConfig
    let transfer = trait.transfer === null ? traitConfig.transfer : trait.transfer

    return <tr>
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
        <td>
            <strong>{name}</strong>
        </td>
        <td>
            {value !== null ? value : '--'}
        </td>
        <td>
            {
                customTransfer ?
                <EditableLabel value={transfer} onChange={value => onTransferChange(value)}/> : transfer
            }
        </td>
    </tr>
}
