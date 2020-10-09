import React from 'react'
import PropTypes from 'prop-types'
import ConfigurationStep from 'seedsource/containers/ConfigurationStep'
import PointChooser from 'seedsource/containers/PointChooser'
import AddUserSite from 'seedsource/components/AddUserSite'
import UserSites from 'seedsource/containers/UserSites'

const LocationStep = ({objective, number, elevation, mode, setMapMode, addUserSite}) => {
    const flag = window.waffle.flag_is_active('map-seedlots')

    if (elevation !== null) {
        elevation = (
            <div>
                <div><strong>Elevation:</strong> {Math.round(elevation.ft)} ft ({Math.round(elevation.m)} m)</div>
            </div>
        )
    }

    return (
        <ConfigurationStep
            title={objective === 'seedlots' ? 'Select planting site location' : 'Select seedlot location'}
            number={number}
            name="location"
            active={true}
        >
            {
                flag ? (
                    <>
                        <div className="columns">
                            <div className="column is-narrow" style={{width: '185px'}}>
                                <h4 className="title is-6" style={{marginBottom: '0'}}>Location</h4>
                                <div className="is-size-7 is-italic">
                                    Locate your{" "}
                                    {objective === 'sites' ? 'seedlot (its climatic center)' : 'planting site'}{" "}
                                    by using the map or entering coordinates.
                                </div>
                            </div>
                            <div className="column">
                                <PointChooser />
                                {elevation}
                            </div>
                        </div>
                        <div className="columns">
                            <div className="column is-narrow" style={{width: '185px'}}>
                                <h4 className="title is-6" style={{marginBottom: '0'}}>
                                    Map {objective === 'seedlots' ? 'Planting Sites' : 'Seedlots'}
                                </h4>
                                <div className="is-size-7 is-italic">
                                    Optional. Plot {objective === 'seedlots' ? 'planting sites' : 'seedlots'} on the
                                    map for comparison.
                                </div>
                            </div>
                            <div className="column">
                                {
                                    mode === 'add_sites' ? (
                                        <AddUserSite
                                          onClose={() => {
                                              setMapMode('normal')
                                          }}
                                          onAddUserSite={addUserSite}
                                        />
                                    ) : (
                                        <button
                                            className="button is-primary"
                                            type="button"
                                            onClick={() => {
                                                setMapMode('add_sites')
                                            }}
                                        >
                                            Add {objective === 'seedlots' ? 'Seedlots' : 'Planting Sites'}
                                        </button>
                                    )
                                }
                            </div>
                        </div>
                        <UserSites />
                    </>
                ) : (
                    <>
                        <div className="is-size-7">
                            <div>
                                <em>
                                    Locate your{" "}
                                    {objective === 'sites' ? 'seedlot (its climatic center' : 'planting site'}
                                </em>
                            </div>
                            <div><em>Use the map or enter coordinates</em></div>
                        </div>

                        <div>&nbsp;</div>

                        <PointChooser />
                        {elevation !== null ? <div>&nbsp;</div> : null}
                        {elevation}
                    </>
                )
            }
        </ConfigurationStep>
    )
}

LocationStep.shouldRender = () => true

LocationStep.propTypes = {
    active: PropTypes.bool.isRequired,
    point: PropTypes.object,
    objective: PropTypes.string.isRequired,
    elevation: PropTypes.object,
    number: PropTypes.number.isRequired,
    setMapMode: PropTypes.func.isRequired
}

export default LocationStep
