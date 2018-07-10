import React from 'react'
import {get} from "io"
import config from 'seedsource/config'
import { morph } from 'utils'


class Layers extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            results: {name: "Results", urlIdentifier: "{serviceId}", awayMessage: "Run the tool to view results", display: true},
            variables: {name: "Variables", urlIdentifier: "{region}_{modelTime}", awayMessage: "Select variables in the Tool tab", display: true},
            seedZones : {name: "Seed Zones", urlIdentifier: "seedzones", awayMessage: "No Seed Zones available", display: false},
            layers: {name: "Layers", urlIdentifier: "layers", awayMessage: "No Layers Available", display: false}
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
                        urlTemplate: url + "/tiles/{z}/{x}/{y}.png",
                        zIndex: 1,
                        displayed: false
                    }
                })
                this.props.onLoadTiles(tileSets)
            })
            .catch(err => console.log(err))
    }

    render() {
        let { onToggleLayer, layers } = this.props
        let state = this.state

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

        let items = Object.keys(state).map(key => {
            return (
                <li key={key}>
                    <a onClick={ () => this.setState({[key]: morph(state[key], {display: !state[key].display})})}>
                        <h4 className="title">
                            {state[key].display ?
                                <span className="icon-chevron-bottom-12"></span> :
                                <span className="icon-chevron-top-12"></span>
                            }
                            &nbsp; {state[key].name}
                        </h4>
                    </a>
                    {/*Display? If yes but list is empty then show awayMessage*/}
                    {state[key].display ? <ul>{ layerList(state[key].urlIdentifier).length ? layerList(state[key].urlIdentifier) : state[key].awayMessage }</ul> : null }
                </li>
            )
        })

        return (
            <div className={"layers-tab"}>
                <div className="menu">
                    <ul className="menu-list">
                        {items}
                    </ul>
                </div>
            </div>
        )
    }
}

export default Layers