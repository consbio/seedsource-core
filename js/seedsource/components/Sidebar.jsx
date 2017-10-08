import React from 'react'
import About from 'seedsource/components/About'

class Sidebar extends React.Component {
    constructor(props) {
        super(props)
        this.state = {activeTab: 'about'}
    }

    selectTab(tab) {
        this.setState({activeTab: tab})
    }

    render() {
        let { activeTab } = this.state

        return (
            <div className="sidebar-inner">
                <div className="tabs is-boxed is-fullwidth">
                    <ul>
                        <li className={activeTab === 'about' ? 'is-active' : null}>
                            <a onClick={() => this.selectTab('about')}>About
                            </a></li>
                        <li className={activeTab === 'tool' ? 'is-active' : null}>
                            <a onClick={() => this.selectTab('tool')}>Tool</a>
                        </li>
                        <li className={activeTab === 'saves' ? 'is-active' : null}>
                            <a onClick={() => this.selectTab('saves')}>Saved Runs</a>
                        </li>
                    </ul>
                </div>
                <div className={'tab-content ' + (activeTab !== 'about' ? 'is-hidden' : '')}>
                    <About />
                </div>
                <div className={'tab-content ' + (activeTab !== 'tool' ? 'is-hidden' : '')}></div>
                <div className={'tab-content ' + (activeTab !== 'saves' ? 'is-hidden' : '')}></div>
            </div>
        )
    }
}

export default Sidebar
