import React from 'react'

const ConstraintChooserItem = ({ constraints, selections, onSelect }) => {
    let selection = selections[0]
    selections = selections.slice(1)

    let node = <div className='select is-fullwidth'>
        <select
            value={selection || ''}
            onChange={e => {
                let selection = e.target.value || null
                let constraint = constraints.find(item => item.name === selection)

                if (selection === null) {
                    onSelect([null])
                }
                else if (constraint.type === 'category') {
                    onSelect([selection, null])
                }
                else {
                    onSelect([selection])
                }
            }}
        >
            <option value="">Select...</option>
            {constraints.map(constraint => {
                let { name, label } = constraint
                return <option key={name} value={name}>{label}</option>
            })}
        </select>
    </div>

    if (selections.length > 0 ) {
        let constraint = constraints.find(item => item.name === selection)

        return <React.Fragment>
            {node}
            <div className="constraint-arrow"></div>
            <ConstraintChooserItem
                selections={selections}
                constraints={constraint.items}
                onSelect={selections => onSelect([selection, ...selections])}
            />
        </React.Fragment>
    }
    else {
        return node
    }
}

export default ConstraintChooserItem
