import React from 'react'

class Layers extends React.Component {

    render() {
        let {activeVariable, lastRun} = this.props
        return (
            <div>
                <ul>
                    <li><b>Results</b></li>
                    <li>Last run</li>
                    <br/>
                    <li><b>Seed zones</b></li>
                    <li>Atlantic Canada</li>
                    <br/>
                    <li>California</li>
                    <li>Historic (Washington & Oregon)</li>
                    <li>Ontario</li>
                    <li>Ontario (NeSMA)</li>
                    <li>Oregon</li>
                    <li>Region 9</li>
                    <li>Washington</li>
                    <br/>
                    <li><b>Variables</b></li>
                </ul>
            </div>
        )
    }
}

export default Layers
