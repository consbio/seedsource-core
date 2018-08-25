import logo from '../../images/logo.png'
import {morph} from "../utils"
import ElevationConstraint from 'seedsource/containers/ElevationConstraint'
import PhotoperiodConstraint from 'seedsource/containers/PhotoperiodConstraint'
import LatitudeConstraint from 'seedsource/containers/LatitudeConstraint'
import LongitudeConstraint from 'seedsource/containers/LongitudeConstraint'
import DistanceConstraint from 'seedsource/containers/DistanceConstraint'
import ShapefileConstraint from 'seedsource/containers/ShapefileConstraint'
import SpeciesConstraint from 'seedsource/containers/SpeciesConstraint'

const serializeSpeciesConstraint = ({ climate }, { species }) => {
    let { time, model } = climate.site
    let climateFragment

    if (time === '1961_1990' || time === '1981_2010') {
        climateFragment = `p${time}_800m`
    }
    else {
        climateFragment = `15gcm_${model}_${time}`
    }

    return {
        service: `${species}_${climateFragment}_pa`
    }
}

const config = {
    logo,
    labels: [],
    functions: null,
    species: [],
    text: {},
    constraints: {
        objects: {
            elevation: {
                component: ElevationConstraint,
                values: {range: 0},
                serialize: (configuration, values) => {
                    let { elevation } = configuration.point
                    let { range } = values

                    return {min: elevation - range, max: elevation + range}
                }
            },
            photoperiod: {
                component: PhotoperiodConstraint,
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
                values: {range: 0},
                serialize: (configuration, { range }) => {
                    let { y } = configuration.point
                    return {min: y - range, max: y + range}
                }
            },
            longitude: {
                component: LongitudeConstraint,
                values: {range: 0},
                serialize: (configuration, { range }) => {
                    let { x } = configuration.point
                    return {min: x - range, max: x + range}
                }
            },
            distance: {
                component: DistanceConstraint,
                values: {range: 0},
                serialize: (configuration, { range }) => {
                    let { x, y } = configuration.point
                    return { lat: y, lon: x, distance: range}
                }
            },
            shapefile: {
                component: ShapefileConstraint,
                values: {
                    geoJSON: null,
                    filename: null
                },
                serialize: (_, { geoJSON }) => {
                    return { geoJSON }
                }
            },
            pico: {
                component: SpeciesConstraint,
                values: {
                    species: 'pico'
                },
                serialize: serializeSpeciesConstraint
            },
            pisi: {
                component: SpeciesConstraint,
                values: {
                    species: 'pisi'
                },
                serialize: serializeSpeciesConstraint
            },
            psme: {
                component: SpeciesConstraint,
                values: {
                    species: 'psme'
                },
                serialize: serializeSpeciesConstraint
            },
            pipo: {
                component: SpeciesConstraint,
                values: {
                    species: 'pipo'
                },
                serialize: serializeSpeciesConstraint
            },
            pien: {
                component: SpeciesConstraint,
                values: {
                    species: 'pien'
                },
                serialize: serializeSpeciesConstraint
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
            },
            {
                name: 'species',
                label: 'Species',
                type: 'category',
                items: [
                    {
                        name: 'pico',
                        label: 'Lodgepole Pine',
                        type: 'constraint'
                    },
                    {
                        name: 'pisi',
                        label: 'Sitka Spruce',
                        type: 'constraint'
                    },
                    {
                        name: 'psme',
                        label: 'Douglas-fir',
                        type: 'constraint'
                    },
                    {
                        name: 'pipo',
                        label: 'Ponderosa Pine',
                        type: 'constraint'
                    },
                    {
                        name: 'pien',
                        label: 'Engelmann Spruce',
                        type: 'constraint'
                    }
                ]
            }
        ]
    }
}

export default Object.assign(window.SS_CONFIG, config)
