import React from 'react'


class Layers extends React.Component {
    render() {
        let { onToggleLayer, layers } = this.props
        let layerList = (urlSegment) => layers.filter(layer => layer.urlTemplate.includes(urlSegment))
                .map(layer =>   {
                                    return <p key={layer.name}>
                                                <input
                                                    type="checkbox"
                                                    value={layer.name}
                                                    onChange={() => onToggleLayer(layer.name)}
                                                    checked={layer.displayed}
                                                />
                                                {layer.name}
                                            </p>
                                })
        let [resultsLayer, seedZoneLayers, variableLayers] = ["{serviceId}", "fail", "{region}_{modelTime}"]
            .map(layer => layerList(layer))

        return (
            <div className={"layers-tab"}>
                {layers.length ? <p>Use this section to toggle layers on the map</p> :
                    <p>Configure the map in the Tool tab before visiting this section</p>}
                {resultsLayer.length ? <div><h4 className="title">Results</h4>{resultsLayer}<br/></div> : null }
                {seedZoneLayers.length ? <div><h4 className="title">Seed Zones</h4>{seedZoneLayers}<br/></div> : null }
                {variableLayers.length ? <div><h4 className="title">Variables</h4>{variableLayers}</div> : null }
            </div>
        )
    }
}

export default Layers