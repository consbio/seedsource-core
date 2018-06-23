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
                                                    disabled={(layer.urlTemplate === "seedZone") ? true : false}
                                                />
                                                {layer.name}
                                            </p>
                                })
        let [resultsLayer, seedZoneLayers, variableLayers] = ["{serviceId}", "tiles", "{region}_{modelTime}"]
            .map(layer => layerList(layer))

        // TODO: make seedzone div and others a dropdown style folder
        return (
            <div className={"layers-tab"}>
                <p>Use this section to toggle layers on the map.
                {layers.filter(layer => layer.type === "raster").length ? null :
                    " (You probably want to configure the map in the Tool tab before using this section)"}</p>
                {resultsLayer.length ? <div><h4 className="title">Results</h4>{resultsLayer}<br/></div> : null }
                {variableLayers.length ? <div><h4 className="title">Variables</h4>{variableLayers}</div> : null }
                {<div><h4 className="title">Seed Zones</h4>{seedZoneLayers}<br/></div>}
            </div>
        )
    }
}

export default Layers