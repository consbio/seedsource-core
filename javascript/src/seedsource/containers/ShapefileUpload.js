import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import shp from 'shpjs'
import { updateConstraintValues } from '../../actions/constraints'
import { setError } from '../../actions/error'


class ShapefileUpload extends React.Component {
    constructor(props) {
        super(props)
        this.handleFileUpload = this.handleFileUpload.bind(this)
        this.state = {
            isLoading: false
        }
    }


    handleFileUpload(event) {
        this.setState({isLoading: true})
        let files
        if (event.dataTransfer && event.dataTransfer.files.length) {
            files = Object.values(event.dataTransfer.files)
        } else if (event.target) {
            files = Object.values(event.target.files)
        }


        if (files.length === 0) {
            return this.setState({isLoading: false})
        } else if (files.reduce((total, file) => {return total + file.size}, 0) > 2100000) {
            this.setState({isLoading: false})
            return this.props.sendError('Error', 'Cannot process shapefiles larger than 2MB')
        }

        let zipFile = files.find(file => file.name.match(/\.zip/i))
        let shpFile = files.find(file => file.name.match(/\.shp/i))
        let prjFile = files.find(file => file.name.match(/\.prj/i))

        if (zipFile) {
            const reader = new FileReader()
            reader.onerror = (e => {
                this.setState({isLoading: false})
                this.props.sendError('Error', 'Could not read the zip file.', e.message)
            })
            reader.onload = (e => {
                shp(e.target.result)
                    .then((geojson) => {
                        this.setState({isLoading: false})
                        this.props.onFileUpload(this.props.index, geojson, zipFile.name)
                    })
                    .catch((error) => {
                        this.setState({isLoading: false})
                        this.props.sendError('Error', 'Could not read the zip file.', error.message)
                    })
            })
            reader.readAsArrayBuffer(zipFile)
        } else if (shpFile) {
            const shpPromise = new Promise((resolve, reject) => {
                const reader = new FileReader()
                reader.onerror = (e) => {
                    reject(e)
                }
                reader.onload = (e) => {
                    resolve({
                        shp: e.target.result,
                        name: shpFile.name
                    })
                }
                reader.readAsArrayBuffer(shpFile)
            })
            const prjPromise = new Promise((resolve, reject) => {
                if (prjFile) {
                    const reader = new FileReader()
                    reader.onerror = (e) => {
                        reject(e)
                    }
                    reader.onload = (e) => {
                        resolve({
                            prj: e.target.result
                        })
                    }
                    reader.readAsArrayBuffer(prjFile)
                } else {
                    resolve({
                        prj: null,
                        warning: 'No projection file found. Assuming WGS84. If you see the wrong projection, try including the prj file.'
                    })
                }
            })
            Promise.all([shpPromise, prjPromise])
                .then(results => {
                    let [shpResult, prjResult] = results
                    let parsedShp = shp.parseShp(shpResult.shp, prjResult.prj)
                    let geojson = shp.combine([parsedShp, []])
                    this.setState({isLoading: false})
                    if (results[1].warning) {
                        this.props.sendError('Warning', prjResult.warning)
                    }
                    this.props.onFileUpload(this.props.index, geojson, shpResult.name)
                }).catch(error => {
                    this.setState({isLoading: false})
                    this.props.sendError('Error', "Shapefile not loaded", error.message)
                })
        } else {
            this.setState({isLoading: false})
            this.props.sendError('Error', 'File(s) not supported')
        }
    }

    render() {
        return (
            <div>
                <input type="file" onChange={this.handleFileUpload} multiple />
                {this.state.isLoading ?
                <div className="overlay">
                    <div className="progress-container">
                        Processing...
                        <progress></progress>
                    </div>
                </div> : null }
            </div>
        )
    }
}

ShapefileUpload.propTypes = {
    onFileUpload: PropTypes.func.isRequired,
    sendError: PropTypes.func.isRequired
}


const mapDispatchToProps = dispatch => {
    return {
        onFileUpload: (index, geoJSON, filename) => {
            dispatch(updateConstraintValues(index, { geoJSON, filename }))
        },
        sendError: (title, message, debugInfo = null) => {
            dispatch(setError(title, message, debugInfo))
        }
    }
}


export default connect(null, mapDispatchToProps)(ShapefileUpload)


