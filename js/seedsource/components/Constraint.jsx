import React from 'react'
import PropTypes from 'prop-types'

const Constraint = ({ children, className, index, title, value, unit, onRemove }) => {
    return (
        <tr className={ 'constraint ' + className }>
            <td>
                <a
                    className="delete"
                    onClick={e => {
                        e.stopPropagation()
                        onRemove(index)
                    }}
                ></a>
            </td>
            <td><strong>{title}</strong></td>
            <td>{value} {isNaN(value) ? '' : unit}</td>
            <td>{children}</td>
        </tr>
    )
}

Constraint.propTypes = {
    index: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    unit: PropTypes.string,
    onRemove: PropTypes.func.isRequired
}

export default Constraint;
