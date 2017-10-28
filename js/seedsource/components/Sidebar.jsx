import React from 'react'
import PropTypes from 'prop-types'
import About from 'seedsource/components/About'
import RunConfiguration from 'seedsource/containers/RunConfiguration'
import SavedRuns from 'seedsource/containers/SavedRuns'

const Sidebar = ({ activeTab, onSelect }) => (
    <div className="sidebar-inner">
        <div className="tabs is-boxed is-fullwidth">
            <ul>
                <li className={activeTab === 'about' ? 'is-active' : null}>
                    <a onClick={() => onSelect('about')}>About
                    </a></li>
                <li className={activeTab === 'tool' ? 'is-active' : null}>
                    <a onClick={() => onSelect('tool')}>Tool</a>
                </li>
                <li className={activeTab === 'saves' ? 'is-active' : null}>
                    <a onClick={() => onSelect('saves')}>Saved Runs</a>
                </li>
                <li className={(activeTab === 'map' ? 'is-active' : null) + ' is-hidden-tablet'}>
                    <a onClick={() => onSelect('map')}>Map</a>
                </li>
            </ul>
        </div>
        <div className={'tab-content ' + (activeTab !== 'about' ? 'is-hidden' : '')}>
            <About />
        </div>
        <div className={'tab-content ' + (activeTab !== 'tool' ? 'is-hidden' : '')}>
            <RunConfiguration />
        </div>
        <div className={'tab-content ' + (activeTab !== 'saves' ? 'is-hidden' : '')}>
            <SavedRuns />
        </div>
    </div>
)

Sidebar.propTypes = {
    activeTab: PropTypes.string.isRequired,
    onSelect: PropTypes.func.isRequired
}

export default Sidebar
