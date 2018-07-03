import React from 'react'
import PropTypes from 'prop-types'
import ConfigurationStep from 'seedsource/containers/ConfigurationStep'
import ElevationConstraint from 'seedsource/containers/ElevationConstraint'
import PhotoperiodConstraint from 'seedsource/containers/PhotoperiodConstraint'
import LatitudeConstraint from 'seedsource/containers/LatitudeConstraint'
import LongitudeConstraint from 'seedsource/containers/LongitudeConstraint'
import DistanceConstraint from 'seedsource/containers/DistanceConstraint'
import ShapefileConstraint from 'seedsource/containers/ShapefileConstraint'

const constraintOptions = [
    {
        type: 'elevation',
        label: 'Elevation',
        maxInstances: 1
    },
    {
        type: 'photoperiod',
        label: 'Photoperiod',
        maxInstances: 1
    },
    {
        type: 'latitude',
        label: 'Latitude',
        maxInstances: 1
    },
    {
        type: 'longitude',
        label: 'Longitude',
        maxInstances: 1
    },
    {
        type: 'distance',
        label: 'Distance',
        maxInstances: 1
    },
    {
        type: 'shapefile',
        label: 'Shapefile',
        maxInstances: 0
    }
]

const constraintMap = {
    elevation: ElevationConstraint,
    photoperiod: PhotoperiodConstraint,
    latitude: LatitudeConstraint,
    longitude: LongitudeConstraint,
    distance: DistanceConstraint,
    shapefile: ShapefileConstraint
}

const ConstraintStep = ({ number, constraints, onChange }) => {
    let table = null

    if (constraints.length) {
        table = (
            <table className="table is-fullwidth">
                <thead className="is-size-7">
                    <tr>
                        <th></th>
                        <th>Name</th>
                        <th>Value</th>
                        <th>Range (+/-)</th>
                    </tr>
                </thead>
                <tbody>
                    {constraints.map(({ type, values }, i) => {
                        let ConstraintTag = constraintMap[type]
                        return <ConstraintTag index={i} values={values} key={type + '_' + i} />
                    })}
                </tbody>
            </table>
        )
    }

    return (
        <ConfigurationStep title="Apply constraints" number={number} name="constraints" active={true}>
            {table}
            <div className="select is-fullwidth">
                <select
                    value=""
                    onChange={e => {
                        e.preventDefault()
                        onChange(e.target.value)
                    }}
                >
                    <option value="none">Add a constraint...</option>
                    {
                        constraintOptions
                            .filter(constraint => {
                                if (constraint.maxInstances === 0) {
                                    return true
                                }
                                else {
                                    const count = constraints.filter(c => c.type === constraint.type).length
                                    return count < constraint.maxInstances
                                }
                            })
                            .map(constraint => {
                                return <option value={constraint.type} key={constraint.type}>{constraint.label}</option>
                            })
                    }
                </select>
            </div>
        </ConfigurationStep>
    )
}

ConstraintStep.shouldRender = () => true

ConstraintStep.propTypes = {
    number: PropTypes.number.isRequired,
    active: PropTypes.bool,
    constraints: PropTypes.array,
    onChange: PropTypes.func.isRequired
}

export default ConstraintStep
