import React from 'react'
import Trait from 'seedsource/containers/Trait'

export default ({ traits, unusedTraits, onChange }) => <React.Fragment>
    <table className="table is-fullwidth">
        <thead className="align-bottom is-size-7 has-text-weight-bold">
            <tr>
                <th></th>
                <th>Name</th>
                <th>Value</th>
                <th>Transfer Limit (+/-)</th>
            </tr>
        </thead>
        <tbody>
            {traits.map((trait, index) => <Trait key={trait.name} index={index} trait={trait} />)}
        </tbody>
    </table>
    <div className="select is-fullwidth">
        <select
            value=""
            onChange={e => {
                e.preventDefault()
                onChange(e.target.value)
            }}
        >
            <option value="none">Add a trait...</option>
            {unusedTraits.map(item => <option value={item.name} key={item.name}>{item.name}: {item.label}</option>)}
        </select>
    </div>
</React.Fragment>
