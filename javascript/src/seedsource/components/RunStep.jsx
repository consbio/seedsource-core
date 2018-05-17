import React  from 'react'
import PropTypes from 'prop-types'
import ConfigurationStep from 'seedsource/containers/ConfigurationStep'
import SaveModal from 'seedsource/containers/SaveModal'
import Dropdown from 'seedsource/components/Dropdown'
import { reports } from '../../config'

const RunStep = props => {
    let {
        number, configuration, canRun, canSave, isLoggedIn, reportIsFetching, onRun, onSave, onExport, onExportTIF
    } = props

    return (
        <ConfigurationStep title="Map your Results" number={number} name="run" active={false}>
            <div>
                <h4></h4>
                <button
                    className="button is-primary is-large is-fullwidth"
                    disabled={!canRun}
                    onClick={e => {
                        onRun(configuration)
                    }}
                >
                    Run Tool
                </button>
            </div>
            <div className="margin-top-10">
                <div>
                    <button
                        className="button is-pulled-left"
                        disabled={!canSave}
                        onClick={e => {
                            e.preventDefault()
                            onSave(isLoggedIn)
                        }}
                    >
                        <span className="icon12 icon-save" aria-hidden="true"></span> Save Last Run
                    </button>
                    <Dropdown
                        className="is-pulled-right is-right is-hidden-mobile"
                        up={true}
                        title="Export As..."
                        disabled={!canSave || reportIsFetching}
                    >
                        {reports.map(r => (
                            <a key={r.name} className="dropdown-item" onClick={e => {
                                e.preventDefault()
                                onExport(r.name)
                            }}>{r.label}</a>
                        ))}
                        <a className="dropdown-item" onClick={e => {
                            e.preventDefault()
                            onExportTIF()
                        }}>GeoTIFF</a>
                    </Dropdown>
                </div>
                <div className="is-clearfix"></div>
            </div>
            <SaveModal />
        </ConfigurationStep>
    )
}

RunStep.propTypes = {
    number: PropTypes.number.isRequired,
    configuration: PropTypes.object.isRequired,
    canRun: PropTypes.bool.isRequired,
    canSave: PropTypes.bool.isRequired,
    isLoggedIn: PropTypes.bool.isRequired,
    reportIsFetching: PropTypes.bool.isRequired,
    onRun: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    onExport: PropTypes.func.isRequired,
    onExportTIF: PropTypes.func.isRequired
}

export default RunStep