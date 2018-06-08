import React from 'react'


class Layers extends React.Component {
    render() {
        let { onToggleLayer, layers } = this.props

        let layerList = (urlSegment) => layers.filter(layer => layer.urlTemplate.includes(urlSegment))
                .map(layer =>   {
                                    return <li key={layer.name}>
                                                <input
                                                    type="checkbox"
                                                    value={layer.name}
                                                    onChange={() => onToggleLayer(layer.name)}
                                                    checked={layer.displayed}
                                                />
                                                {layer.name}
                                            </li>
                                })

        return (
            <div>
                <ul>
                    <li><b>Results</b></li>
                    { layerList("{serviceId}") }
                    <br/>
                    <li><b>Seed zones</b></li>
                    <br/>
                    <li><b>Variables</b></li>
                    { layerList("{region}_{modelTime}") }
                </ul>
            </div>
        )
    }
}

export default Layers