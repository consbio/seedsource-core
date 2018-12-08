import logo from '../../images/logo.png'
import {morph} from "../utils"
import ElevationConstraint from 'seedsource/containers/ElevationConstraint'
import PhotoperiodConstraint from 'seedsource/containers/PhotoperiodConstraint'
import LatitudeConstraint from 'seedsource/containers/LatitudeConstraint'
import LongitudeConstraint from 'seedsource/containers/LongitudeConstraint'
import DistanceConstraint from 'seedsource/containers/DistanceConstraint'
import ShapefileConstraint from 'seedsource/containers/ShapefileConstraint'

const config = {
    logo,
    labels: [],
    functions: [],
    species: [],
    text: {},
    constraints: {
        objects: {
            elevation: {
                component: ElevationConstraint,
                constraint: 'elevation',
                values: {range: 0},
                serialize: (configuration, values) => {
                    let { elevation } = configuration.point
                    let { range } = values

                    return {min: elevation - range, max: elevation + range}
                }
            },
            photoperiod: {
                component: PhotoperiodConstraint,
                constraint: 'photoperiod',
                values: {
                    hours: 0,
                    month: 1,
                    day: 1,
                    year: 1961
                },
                serialize: (configuration, values) => {
                    let { x, y } = configuration.point
                    return morph(values, {lon: x, lat: y})
                }
            },
            latitude: {
                component: LatitudeConstraint,
                constraint: 'latitude',
                values: {range: 0},
                serialize: (configuration, { range }) => {
                    let { y } = configuration.point
                    return {min: y - range, max: y + range}
                }
            },
            longitude: {
                component: LongitudeConstraint,
                constraint: 'longitude',
                values: {range: 0},
                serialize: (configuration, { range }) => {
                    let { x } = configuration.point
                    return {min: x - range, max: x + range}
                }
            },
            distance: {
                component: DistanceConstraint,
                constraint: 'distance',
                values: {range: 0},
                serialize: (configuration, { range }) => {
                    let { x, y } = configuration.point
                    return { lat: y, lon: x, distance: range}
                }
            },
            shapefile: {
                component: ShapefileConstraint,
                constraint: 'shapefile',
                values: {
                    geoJSON: null,
                    filename: null
                },
                serialize: (_, { geoJSON }) => {
                    return { geoJSON }
                }
            }
        },
        categories: [
            {
                name: 'geographic',
                label: 'Geographic',
                type: 'category',
                items: [
                    {
                        type: 'constraint',
                        name: 'elevation',
                        label: 'Elevation'
                    },
                    {
                        type: 'constraint',
                        name: 'photoperiod',
                        label: 'Photoperiod'
                    },
                    {
                        type: 'constraint',
                        name: 'latitude',
                        label: 'Latitude'
                    },
                    {
                        type: 'constraint',
                        name: 'longitude',
                        label: 'Longitude'
                    },
                    {
                        type: 'constraint',
                        name: 'distance',
                        label: 'Distance'
                    },
                    {
                        type: 'constraint',
                        name: 'shapefile',
                        label: 'Shapefile'
                    }
                ]
            }
        ]
    }
}

export default Object.assign(window.SS_CONFIG, config)
