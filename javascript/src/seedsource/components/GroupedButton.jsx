import React from 'react'
import PropTypes from 'prop-types'

const GroupedButton = ({ active, children, onClick }) => {
    let className = active ? 'is-active' : ''

    return (
        <li className={active ? 'is-active' : ''}>
            <a href="#" onClick={e => {
                e.preventDefault()
                onClick()
            }}>{children}</a>
        </li>
    )
}

GroupedButton.propTypes = {
    active: PropTypes.bool.isRequired,
    children: PropTypes.node.isRequired,
    onClick: PropTypes.func.isRequired
}

export default GroupedButton
