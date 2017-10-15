import React  from 'react'
import PropTypes from 'prop-types'
import ConfigurationStep from 'seedsource/containers/ConfigurationStep'
import SaveModal from 'seedsource/containers/SaveModal'
import { reports } from '../config'

const RunStep = props => {
    let {
        number, configuration, canRun, canSave, isLoggedIn, reportIsFetching, onRun, onSave, onExport, onExportTIF
    } = props

    return (
        <ConfigurationStep title="Map your Results" number={number} name="run" active={false}>
            <div>
                <h4></h4>
                <a
                    className="button is-primary is-large is-fullwidth"
                    disabled={!canRun}
                    onClick={e => {
                        onRun(configuration)
                    }}
                >
                    Run Tool
                </a>
            </div>
            <div className="margin-top-10">
                <div>
                    <a
                        className="button is-pulled-left"
                        disabled={!canSave}
                        onClick={() => {
                            onSave(isLoggedIn)
                        }}
                    >
                        <span className="icon12 icon-save" aria-hidden="true"></span> Save Last Run
                    </a>
                    <a
                        className={(reportIsFetching ? "is-loading" : "") + "button is-pulled-right"}
                        disabled={!canSave || reportIsFetching}
                    >
                        Export As...
                    </a>
                    {/*<div className="dropup pull-right">*/}
                        {/*<button*/}
                            {/*className="btn btn-secondary dropdown-toggle"*/}
                            {/*type="button"*/}
                            {/*id="reportMenuButton"*/}
                            {/*data-toggle="dropdown"*/}
                            {/*aria-haspopup="true"*/}
                            {/*aria-expanded="false"*/}
                            {/*disabled={!canSave || reportIsFetching}*/}
                        {/*>*/}
                            {/*<span className="icon12 icon-file" aria-hidden="true"></span>*/}
                            {/*{reportIsFetching ? 'Please wait...' : 'Export As...'} &nbsp;*/}
                            {/*<b className="caret"></b>*/}
                        {/*</button>*/}
                        {/*<ul className="dropdown-menu dropdown-menu-right" aria-labelledby="reportMenuButton">*/}
                            {/*{reports.map(r => (*/}
                                {/*<li key={r.name}>*/}
                                {/*<a className="dropdown-item" href="#"*/}
                                   {/*onClick={e => {*/}
                                       {/*e.preventDefault()*/}
                                       {/*onExport(r.name)*/}
                                   {/*}}>{r.label}</a></li>))*/}
                            {/*}*/}
                            {/*<li>*/}
                                {/*<a className="dropdown-item" href="#" onClick={e => {*/}
                                    {/*e.preventDefault()*/}
                                    {/*onExportTIF()*/}
                                {/*}}>GeoTIFF</a>*/}
                            {/*</li>*/}
                        {/*</ul>*/}
                    {/*</div>*/}
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
