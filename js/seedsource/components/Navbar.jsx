import React from 'react'
import { staticResource } from '../../utils'
import config from 'seedsource/config'
import Menu from 'seedsource/components/Menu'

class Navbar extends React.Component {
    constructor(props) {
        super(props)
        this.state = {isActive: false}
    }

    render() {
        let isActive = this.state.isActive ? 'is-active' : ''

        return (
            <nav className='navbar is-dark' role='navigation' aria-label='main navigation'>
                <div className='navbar-brand'>
                    <div className='navbar-item'>
                        <img src={staticResource('images/logo.png')} className='image is-24x24 margin-right-5' alt={config.title} />
                        <span className='is-size-4 is-size-5-mobile has-text-weight-bold'>{config.title}</span>
                    </div>
                    <div
                        className={isActive + ' navbar-burger is-light'}
                        onClick={e => {
                            this.setState({isActive: !this.state.isActive})
                        }}
                    >
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
                <div className={isActive + ' navbar-menu is-size-7-desktop is-size-6-widescreen is-size-6-touch'}>
                    <div className='navbar-end'>
                        <Menu />
                        <a className='navbar-item'>Sign In</a>
                    </div>
                </div>
            </nav>
        )
    }
}

export default Navbar
