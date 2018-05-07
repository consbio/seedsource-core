import React from 'react'
import { PropTypes } from 'prop-types'

class PointChooser extends React.Component {
    constructor(props) {
        super(props)
        this.state = {latValue: null, lonValue: null}
    }

    render() {
        let {lat, lon, onBlur} = this.props

        return (
            <div className="point-chooser">
                <strong>Lat: </strong>
                <input
                    type="text"
                    data-lpignore="true"
                    className="input is-inline is-small"
                    value={this.state.latValue === null ? lat : this.state.latValue}
                    onChange={e => {
                        this.setState({latValue: e.target.value})
                    }}
                    onBlur={e => {
                        this.setState({latValue: null})

                        if (e.target.value !== lat) {
                            onBlur('lat', e.target.value)
                        }
                    }}
                    onKeyPress={e => {
                        if (e.key === 'Enter') {
                            e.target.blur()
                        }
                    }}
                />
                <strong>Lon: </strong>
                <input
                    type="text"
                    data-lpignore="true"
                    className="input is-inline is-small"
                    value={this.state.lonValue === null ? lon : this.state.lonValue}
                    onChange={e => {
                        this.setState({lonValue: e.target.value})
                    }}
                    onBlur={e => {
                        this.setState({lonValue: null})

                        if (e.target.value !== lon) {
                            onBlur('lon', e.target.value)
                        }
                    }}
                    onKeyPress={e => {
                        if (e.key === 'Enter') {
                            e.target.blur()
                        }
                    }}
                />
            </div>
        )
    }
}

PointChooser.propTypes = {
    lat: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    lon: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    onBlur: PropTypes.func.isRequired
}

export default PointChooser
