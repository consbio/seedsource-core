import React from 'react'

export default class AddUserSite extends React.Component {
    constructor(props) {
        super(props)

        this.state = {lat: "", lon: ""}
    }

    render() {
        const { onClose, onAddUserSite } = this.props
        const {lat, lon} = this.state

        return (
            <>
                <div className="columns is-mobile" style={{marginBottom: '0'}}>
                    <label className="column is-narrow">
                        <div>Lat</div>
                        <input
                            className="input is-small"
                            type="text"
                            data-lpignore="true"
                            value={lat}
                            style={{width: '80px', textAlign: 'right'}}
                            onChange={e => this.setState({lat: e.target.value})}
                        />
                    </label>
                    <label className="column is-narrow">
                        <div>Lon</div>
                        <input
                            className="input is-small"
                            type="text"
                            data-lpignore="true"
                            value={lon}
                            style={{width: '80px', textAlign: 'right'}}
                            onChange={e => this.setState({lon: e.target.value})}
                        />
                    </label>
                </div>
                <div style={{textAlign: 'right', paddingRight: '15px'}}>
                    <button
                        className="button"
                        type="button"
                        onClick={() => {onClose()}}
                    >Cancel</button>
                    <button
                        className="button is-primary"
                        type="button"
                        style={{marginLeft: '10px'}}
                        disabled={!(parseFloat(lat) && parseFloat(lon))}
                        onClick={() => {
                            const latF = parseFloat(lat)
                            const lonF = parseFloat(lon)

                            if (latF && lonF) {
                                onAddUserSite(latF, lonF)
                            }
                        }}
                    >Add</button>
                </div>
            </>
        )
    }
}
