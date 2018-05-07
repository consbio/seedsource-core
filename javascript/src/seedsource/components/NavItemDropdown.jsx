import React from 'react'
import PropTypes from 'prop-types'

class NavItemDropdown extends React.Component {
    constructor(props) {
        super(props)
        this.state = {active: false}

        this.handleBodyClick = this.handleBodyClick.bind(this)
    }

    handleBodyClick(e) {
        if (e.target !== this.item) {
            this.setState({active: false})
        }
    }

    componentDidMount() {
        window.document.body.addEventListener('click', this.handleBodyClick)
    }

    componentWillUnmount() {
        window.document.body.removeEventListener('click', this.handleBodyClick)
    }

    render() {
        let { active } = this.state
        let isActive = active ? 'is-active ' : ''
        let { title, right = false, className = '', children } = this.props

        return (
            <div className={isActive + ' navbar-item has-dropdown ' + className}>
                <a
                    className="navbar-link"
                    onClick={e => this.setState({active: !active})}
                    ref={input => { this.item = input }}
                >
                    {title}
                </a>
                <div className={(right ? 'is-right ' : '') + 'navbar-dropdown'}>
                    {children}
                </div>
            </div>
        )
    }
}

NavItemDropdown.propTypes = {
    title: PropTypes.string.isRequired,
    right: PropTypes.bool,
    className: PropTypes.string
}

export default NavItemDropdown
