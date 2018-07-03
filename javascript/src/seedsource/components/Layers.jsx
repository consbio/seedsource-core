import React from 'react'


class Layers extends React.Component {
    render() {
        let { onToggleLayer, layers } = this.props
        let layerList = (urlSegment) => layers.filter(layer => layer.urlTemplate.includes(urlSegment))
            .map(layer => {
                return (
                    <div key={layer.name}>
                        <input
                            type="checkbox"
                            value={layer.name}
                            onChange={() => onToggleLayer(layer.name)}
                            checked={layer.displayed}
                            disabled={(layer.urlTemplate === "seedZone") ? true : false}
                        />
                        {layer.name}
                    </div>
                )
            })
        let [resultsLayer, seedZoneLayers, variableLayers] = ["{serviceId}", "seedZone", "{region}_{modelTime}"]
            .map(layer => layerList(layer))

        return (
            <div className={"layers-tab"}>
                {layers.length ? null : <p>No layers available</p>}
                {resultsLayer.length ? <div><h4 className="title">Results</h4>{resultsLayer}<br/></div> : null }
                {seedZoneLayers.length ? <div><h4 className="title">Seed Zones</h4>{seedZoneLayers}<br/></div> : null }
                {variableLayers.length ? <div><h4 className="title">Variables</h4>{variableLayers}</div> : null }
            </div>
        )
    }
}

export default Layers