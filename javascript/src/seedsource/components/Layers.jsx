import React from 'react'
import {get} from "io"
import config from 'seedsource/config'
import { morph } from 'utils'


class Layers extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            results: true,
            variables: true,
            seedzones: false,
            layers: false
        }
    }

    componentDidMount() {
        let request = get(config.mbtileserverRoot + 'services')
            .then(response => response.json())
            .then(json => {
                let tileSets = json.map(service => {
                    let url = service.url
                    return {
                        name: url.substring(url.lastIndexOf('/') + 1),
                        type: "vector",
                        urlTemplate: url + "/tiles/{z}/{x}/{y}.pbf",
                        zIndex: 1,
                        displayed: false,
                        style: {color: "turquoise"}
                    }
                })
                this.props.onLoadTiles(tileSets)
            })
            .catch(err => console.log(err))
    }

    render() {
        let { onToggleLayer, layers } = this.props
        let state = this.state

        let categories = {
            results: {name: "Results", urlIdentifier: "{serviceId}", awayMessage: "Run the tool to view results"},
            variables: {name: "Variables", urlIdentifier: "{region}_{modelTime}", awayMessage: "Select a region and climate scenario to view variables"},
            seedZones : {name: "Seed Zones", urlIdentifier: "seedzones", awayMessage: "No Seed Zones available"},
            layers: {name: "Layers", urlIdentifier: "layers", awayMessage: "No Layers Available"}
        }

        let layerList = (urlIdentifier) => layers.filter(layer => layer.urlTemplate.includes(urlIdentifier))
            .map(layer => {
                return (
                    <li className="layer-list" key={layer.name}>
                        <input
                            className="is-checkradio"
                            type="checkbox"
                            value={layer.name}
                            checked={layer.displayed}
                        /><label onClick={() => onToggleLayer(layer.name)}>{layer.name}</label>
                    </li>
                )
            })

        let sections = Object.keys(categories).map(key => {
            return (
                <li key={key}>
                    <a onClick={ () => this.setState({[key]: !state[key]})}>
                        <h4 className="title">
                            {state[key] ?
                                <span className="icon-chevron-bottom-12"></span> :
                                <span className="icon-chevron-top-12"></span>
                            }
                            &nbsp; {categories[key].name}
                        </h4>
                    </a>
                    {/*Display? If yes but list is empty then show awayMessage*/}
                    {state[key] ? <ul>{ layerList(categories[key].urlIdentifier).length ? layerList(categories[key].urlIdentifier) : categories[key].awayMessage }</ul> : null }
                </li>
            )
        })

        return (
            <div className={"layers-tab"}>
                <div className="menu">
                    <ul className="menu-list">
                        {sections}
                    </ul>
                </div>
            </div>
        )
    }
}

export default Layers