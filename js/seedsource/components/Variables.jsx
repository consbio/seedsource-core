import React from 'react'
import PropTypes from 'prop-types'
import Variable from 'seedsource/containers/Variable'

const Variables = ({ variables, unusedVariables, edit, onChange }) => {
    let table = null

    if (variables.length > 0) {
        table = (
            <table className="table">
                <thead>
                    <tr>
                        <th></th>
                        <th>
                            <div className="modify-status">&nbsp;</div>
                            Name
                        </th>
                        <th>Center</th>
                        <th>Transfer limit (+/-)</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {variables.map((item, index) => (
                        <Variable variable={item} index={index} key={item.name} edit={edit} />
                    ))}
                </tbody>
            </table>
        )
    }
    return (
        <div className={"variables-list" + (edit ? " edit" : "")}>
            {table}

            <div className="select is-fullwidth">
                <select
                    className={'' + (edit ? '' : ' is-hidden')}
                    value=""
                    onChange={e => {
                        e.preventDefault()
                        onChange(e.target.value, variables)
                    }}
                >
                    <option value="none">Add a variable...</option>
                    {unusedVariables.map(item => (
                        <option value={item.name} key={item.name}>{item.name}: {item.label}</option>
                    ))}
                </select>
            </div>
        </div>
    )
}

Variables.propTypes = {
    variables: PropTypes.array.isRequired,
    unusedVariables: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired
}

export default Variables
