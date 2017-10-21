import React from 'react'
import PropTypes from 'prop-types'

class Dropdown extends React.Component {
    constructor(props) {
        super(props)
        this.state = {active: false}

        this.handleBodyClick = this.handleBodyClick.bind(this)
    }

    handleBodyClick(e) {
        if (e.target !== this.button && !this.button.contains(e.target)) {
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
        let isActive = this.state.active ? 'is-active' : ''
        let { title, up=false, disabled=false, className='', children } = this.props

        return (
            <div className={(up ? 'is-up ' : '') + isActive + ' dropdown ' + className}>
                <div className="dropdown-trigger">
                    <button className="button" disabled={disabled} ref={input => { this.button = input }}
                            onClick={e => {
                                this.setState({active: !active})
                            }}
                    >
                        <span>{title}</span>
                        <span className="icon is-small">
                            <i className={up ? 'icon-chevron-top-12' : 'icon-chevron-bottom-12'}></i>
                        </span>
                    </button>
                </div>
                <div className="dropdown-menu">
                    <div className="dropdown-content">
                        {children}
                    </div>
                </div>
            </div>
        )
    }
}

Dropdown.propTypes = {
    title: PropTypes.string.isRequired,
    up: PropTypes.bool,
    disabled: PropTypes.bool,
    className: PropTypes.string
}

export default Dropdown
