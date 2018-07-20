import React from 'react'

export default ({ trait, traitConfig, onRemove }) => <tr>
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
        <strong>{trait.name}</strong>
    </td>
    <td>
        {trait.value !== null ? trait.value : '--'}
    </td>
    <td>
        {traitConfig.transfer}
    </td>
</tr>
