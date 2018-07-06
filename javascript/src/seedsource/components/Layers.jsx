import React from 'react'


class Layers extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            displayResults: true,
            displayVariables: true,
            displaySeedZones: false
        }
    }

    render() {
        let { onToggleLayer, layers } = this.props

        let layerList = (urlSegment) => layers.filter(layer => layer.urlTemplate.includes(urlSegment))
            .map(layer => {
                return (
                    <li className="layer-list" key={layer.name}>
                        <input
                            className="is-checkradio"
                            type="checkbox"
                            value={layer.name}
                            checked={layer.displayed}
                            disabled={(layer.urlTemplate === "seedZone") ? true : false}
                        /><label onClick={() => onToggleLayer(layer.name)}>{layer.name}</label>
                    </li>
                )
            })

        let [resultsLayer, variableLayers, seedZoneLayers] = ["{serviceId}", "{region}_{modelTime}", "tiles"]
            .map(layer => layerList(layer))

        return (
            <div className={"layers-tab"}>
                <div className="menu">
                    <ul className="menu-list">
                        <li>
                            <a onClick={ () => this.setState({displayResults: !this.state.displayResults})}>
                                <h4 className="title">
                                    {this.state.displayResults ?
                                        <span className="icon-chevron-bottom-12"></span> :
                                        <span className="icon-chevron-top-12"></span>
                                    }
                                    &nbsp; Results
                                </h4>
                            </a>
                            {this.state.displayResults ? <ul>{ resultsLayer.length ? resultsLayer : <p>Run the tool to view results</p> }</ul> : null }
                        </li>
                        <li>
                            <a onClick={ () => this.setState({displayVariables: !this.state.displayVariables})}>
                                <h4 className="title">
                                    {this.state.displayVariables ?
                                        <span className="icon-chevron-bottom-12"></span> :
                                        <span className="icon-chevron-top-12"></span>
                                    }
                                    &nbsp; Variables
                                </h4>
                            </a>
                            {this.state.displayVariables ? <ul>{ variableLayers.length ? variableLayers : <p>Select variables in the Tool tab</p> }</ul> : null}
                        </li>
                        <li>
                            <a onClick={ () => this.setState({displaySeedZones: !this.state.displaySeedZones})}>
                                <h4 className="title">
                                    {this.state.displaySeedZones ?
                                        <span className="icon-chevron-bottom-12"></span> :
                                        <span className="icon-chevron-top-12"></span>
                                    }
                                    &nbsp; Seed Zones
                                </h4>
                            </a>
                            {this.state.displaySeedZones ? <ul>{seedZoneLayers}</ul> : null}
                        </li>
                    </ul>
                </div>
            </div>
        )
    }
}

export default Layers