import React from 'react'
import Navbar from 'seedsource/components/Navbar'
import Sidebar from 'seedsource/components/Sidebar'
import Map from 'seedsource/containers/Map'

const App = () => (
    <div>
        <Navbar />

        <div className="columns is-gapless">
            <div className="column is-narrow sidebar">
                <Sidebar />
            </div>
            <div className="column">
                <Map />
            </div>
        </div>
    </div>
)

export default App
