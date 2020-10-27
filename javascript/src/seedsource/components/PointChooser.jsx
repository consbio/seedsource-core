import React from 'react'
import { PropTypes } from 'prop-types'

class PointChooser extends React.Component {
    constructor(props) {
        super(props)
        this.state = {latValue: null, lonValue: null}
    }

    render() {
        let {lat, lon, onBlur} = this.props
        const flag = window.waffle.flag_is_active('map-seedlots')

        return (
            <div
                className={`point-chooser ${flag ? 'columns is-mobile' : ''}`}
                style={flag ? {marginBottom: '0'} : null}
            >
                <label className={flag ? 'column is-narrow' : ''}>
                    {flag ? <div>Lat</div> : <strong>Lat: </strong>}
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
                </label>

                <label className={flag ? 'column is-narrow' : ''}>
                    {flag ? <div>Lon</div> : <strong>Lon: </strong>}
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
                </label>
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
