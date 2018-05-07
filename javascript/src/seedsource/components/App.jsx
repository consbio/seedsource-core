import React from 'react'
import Navbar from 'seedsource/components/Navbar'
import Sidebar from 'seedsource/containers/Sidebar'
import Map from 'seedsource/containers/Map'
import ErrorModal from 'seedsource/containers/ErrorModal'

const App = () => (
    <div className="seedsource-app">
        <ErrorModal />
        <Navbar />

        <div className="columns is-gapless">
            <div className="column is-narrow sidebar">
                <Sidebar />
            </div>
            <div className="column map">
                <Map />
            </div>
        </div>
    </div>
)

export default App
