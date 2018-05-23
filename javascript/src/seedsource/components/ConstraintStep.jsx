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
        label: 'Elevation'
    },
    {
        type: 'photoperiod',
        label: 'Photoperiod'
    },
    {
        type: 'latitude',
        label: 'Latitude'
    },
    {
        type: 'longitude',
        label: 'Longitude'
    },
    {
        type: 'distance',
        label: 'Distance'
    },
    {
        type: 'shapefile',
        label: 'Shapefile'
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
                        let tag = {type: constraintMap[type]}
                        return <tag.type index={i} values={values} key={type + '_' + i} />
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
                            .filter(constraint => !constraints.some(c => c.type === constraint.type))
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
