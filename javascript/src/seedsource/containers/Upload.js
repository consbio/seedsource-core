import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import shp from 'shpjs'
import { updateConstraintValues } from '../../actions/constraints'
import { setError } from '../../actions/error'

class Upload extends React.Component {
    constructor(props) {
        super(props)

        // Would this be useful for reports?
        // this.state = {
        //     filename: '',
        //     uploadMessages: {},
        //     shapeType: ''
        // }

        this.handleFileUpload = this.handleFileUpload.bind(this)
        this.handleUploadFinish = this.handleUploadFinish.bind(this)
    }


    handleFileUpload(event) {
        event.stopPropagation()
        event.preventDefault()

        document.getElementById("loadShapefileModal").style.display = "inherit"

        let files

        if (event.dataTransfer && event.dataTransfer.files.length) {
            files = event.dataTransfer.files
        } else if (event.target) {
            files = event.target.files
        }

        let zipFile
        let shpFile
        const prjFiles = {}
        for (let i = 0; i < files.length; i += 1) {
            const file = files[i]
            if (file.name.match(/\.zip/i)) {
                zipFile = file
                break
            } else if (file.name.match(/\.shp$/i)) {
                shpFile = file
            } else if (file.name.match(/\.prj$/i)) {
                prjFiles[file.name.slice(0, -4)] = file
            }
        }
        if (zipFile) {
            const reader = new FileReader()
            reader.onload = (e) => {
                shp(e.target.result)
                    .then((geojson) => {
                        this.handleUploadFinish({
                            status: 'success',
                            // filename: zipFile.name,
                            geojson
                        })
                    })
                    .catch((errors) => {
                        this.handleUploadFinish({
                            status: 'error',
                            messages: { errors: ['Could not read the zipped shapefile.'] }
                        })
                    })
            }
            reader.readAsArrayBuffer(zipFile)
        } else if (shpFile) {
            const shpPromise = new Promise((resolve, reject) => {
                const reader = new FileReader()
                reader.onload = (e) => {
                    try {
                        resolve(e.target.result)
                    } catch (error) {
                        reject(new Error('Could not open the selected file.'))
                        this.props.sendError('Error', 'Could not open the .shp file.', error)
                    }
                }
                reader.readAsArrayBuffer(shpFile)
            })

            const prjFile = prjFiles[`${shpFile.name.slice(0, -4)}`]
            const prjPromise = new Promise((resolve) => {
                if (prjFile) {
                    const reader = new FileReader()
                    reader.onload = (e) => {
                        try {
                            resolve({
                                proj: e.target.result,
                                // warnings: []
                            })
                        } catch (error) {
                            resolve({
                                proj: null,
                                // warnings: ['Could not fetch the projection data.']
                            })
                            this.props.sendError('Warning', 'Could not process .prj file.', error)
                        }
                    }
                    reader.readAsText(prjFile)
                } else {
                    resolve({
                        proj: null,
                        // warnings: [
                        //     `No projection file found. Assume WGS84.
                        //     If you see the wrong projection, try including the prj file.`
                        // ]
                    })
                    this.props.sendError('Warning', 'No projection file found. Assume WGS84. If you see the wrong projection, try including the prj file.')
                }
            })

            const projectedShpPromise = new Promise((resolve, reject) =>
                Promise.all([shpPromise, prjPromise])
                    .then((results) => {
                        try {
                            let handleFinish = (finish) => {this.handleUploadFinish(finish)}
                            let parsedShp = shp.parseShp(results[0], results[1].proj)
                            resolve(
                                handleFinish({
                                    status: 'success',
                                    // filename: shpFile.name,
                                    geojson: shp.combine([parsedShp, []]),
                                    // messages: { warnings: results[1].warnings }
                                })
                            )
                        } catch (e) {
                            reject(new Error('Could not read the selected shapefile'))
                            this.props.sendError('Error', 'Could not read the selected shapefile')
                        }
                    })
                    .catch(error => reject(error)))
        } else {
            this.handleUploadFinish({
                status: 'error',
                // messages: { errors: ['The selected file is not supported.'] }
            })
            this.props.sendError('Error', 'The selected file is not supported')
        }
    }

    handleUploadFinish(results) {
        if (results.status === 'success') {
            if (results.geojson.features.length) {
                // this.setState({
                //     uploadMessages: results.messages || {},
                //     filename: results.filename,
                //     shapeType: sampleShape.geometry.type,
                // })
            } else {
                // this.setState({
                //     uploadMessages: { warning: ['There is no shape in the selected shapefile.'] }
                // })
                this.props.sendError('Helpful Hint', 'There is no shape in the selected shapefile.')
            }
            // this.setState({
            //     uploadMessages: results.messages || {},
            //     filename: results.filename
            // })
            document.getElementById("loadShapefileModal").style.display = "none"
            this.props.onFileUpload(this.props.index, results.geojson)
        } else {
            // this.setState({ uploadMessages: results.messages })
            // let messageArray = Object.keys(this.state.uploadMessages).map(key => { return this.state.uploadMessages[key] }).join(" ")
            this.props.sendError('Error with file(s)', null, null)
            document.getElementById("loadShapefileModal").style.display = "none"
            this.props.onFileUpload(this.props.index, {features: []})
        }
    }


    render() {
        return (
            <div>
                <input type="file" onChange={this.handleFileUpload} multiple />
                <div className="overlay" id="loadShapefileModal">
                    <div className="progress-container">
                        Processing...
                        <progress></progress>
                    </div>
                </div>
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
        onFileUpload: (index, geoJSON) => {
            dispatch(updateConstraintValues(index, { geoJSON }))
        },
        sendError: (title, message, debugInfo = null) => {
            dispatch(setError(title, message, debugInfo))
        }
    }
}


export default connect(null, mapDispatchToProps)(Upload)


