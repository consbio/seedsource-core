import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import shp from 'shpjs'
import { updateConstraintValues } from '../../actions/constraints'
import { setError } from '../../actions/error'


class Upload extends React.Component {
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
            files = event.dataTransfer.files
        } else if (event.target) {
            files = event.target.files
        }

        let zipFile
        let shpFile
        let prjFile
        for (let i = 0; i < files.length; i += 1) {
            const file = files[i]
            if (file.name.match(/\.zip/i)) {
                zipFile = file
                break
            } else if (file.name.match(/\.shp$/i)) {
                shpFile = file
            } else if (file.name.match(/\.prj$/i)) {
                prjFile = file
            }
        }

        if (zipFile) {
            const reader = new FileReader()
            reader.onerror = (e => {
                this.setState({isLoading: false})
                this.props.sendError('Error', 'Could not read the zip file.', e.message)
                return
            })
            reader.onload = (e => {
                shp(e.target.result)
                    .then((geojson) => {
                        this.setState({isLoading: false})
                        this.props.onFileUpload(this.props.index, geojson, zipFile.filename)
                        return
                    })
                    .catch((error) => {
                        this.setState({isLoading: false})
                        this.props.sendError('Error', 'Could not read the zip file.', error.message)
                        return
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
                    let parsedShp = shp.parseShp(results[0].shp, results[1].prj)
                    let geojson = shp.combine([parsedShp, []])
                    this.setState({isLoading: false})
                    if (results[1].warning) {
                        this.props.sendError('Warning', results[1].warning)
                    }
                    this.props.onFileUpload(this.props.index, geojson, results[0].name)
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
                </div> : "" }
            </div>
        )
    }
}

Upload.propTypes = {
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


export default connect(null, mapDispatchToProps)(Upload)


