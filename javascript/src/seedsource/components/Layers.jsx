import React from 'react'

class Layers extends React.Component {
    render() {
        let { names, activeVariables, onToggleVariable, onToggleVisibility, showResults, lastRun, layers } = this.props

        let onToggleLayer = (name, type) => {
            if (type === "variable") {
                onToggleVariable(name)
            } else if (type === "lastRun") {
                onToggleVisibility()
            }
        }

        let layerList = (type) => layers.filter(layer => layer.type === type)
                .map(layer =>   {
                                    return <li  key={layer.name}>
                                                <input
                                                    type="checkbox"
                                                    value={layer.name}
                                                    onChange={() => onToggleLayer(layer.name, layer.type)}
                                                    checked={layer.displayed}
                                                />
                                                {layer.name}
                                            </li>
                                })


        return (
            <div>
                <ul>
                    <li><b>Results</b></li>
                    { layerList("lastRun") }
                    <br/>
                    <li><b>Seed zones</b></li>
                    <br/>
                    <li><b>Variables</b></li>
                    { layerList("variable") }
                </ul>
            </div>
        )
    }
}

export default Layers