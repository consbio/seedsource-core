import React from 'react'

class Layers extends React.Component {
    render() {
        let { names, activeVariables, onToggleVariable, onToggleVisibility, showResults } = this.props
        let variableLayers = names.map(name => {
                                                    return <li key={name}><input
                                                                type="checkbox"
                                                                value={name}
                                                                onChange={() => onToggleVariable(name)}
                                                                checked={activeVariables.includes(name) ? true : false}
                                                            />
                                                                {name}
                                                            </li>
                                                })

        return (
            <div>
                <ul>
                    <li><b>Results</b></li>
                    <li><input type="checkbox"
                               onChange={() => onToggleVisibility()}
                               checked={showResults ? true : false}
                        />
                        Last Run
                    </li>
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
                    { variableLayers }
                </ul>
            </div>
        )
    }
}

export default Layers