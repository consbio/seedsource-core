/**
 * This component ensures that the Leaflet map state reflects the redux application state, and dispatches map-related
 * events via redux.
 */

import React from 'react'
import { connect } from 'react-redux'
import L from 'leaflet'
import { topojson } from 'leaflet-omnivore'
import { Lethargy } from 'lethargy'
import 'leaflet-basemaps'
import 'leaflet-geonames/L.Control.Geonames'
import 'leaflet-zoombox/L.Control.ZoomBox'
import 'leaflet-range/L.Control.Range'

import * as io from '../../io'
import { getLayerUrl } from '../../utils'
import { variables as allVariables, timeLabels, regions, regionsBoundariesUrl } from '../../config'
import { setMapOpacity, setBasemap, setZoom, setMapCenter } from '../../actions/map'
import { toggleLayer } from '../../actions/layers'
import { setPopupLocation, resetPopupLocation } from '../../actions/popup'
import { setPoint } from '../../actions/point'
import { isClose } from '../../utils'
import '../../leaflet-controls'
import 'leaflet.vectorgrid'
import config from 'seedsource/config'


/* This is a workaround for a webpack-leaflet incompatibility (https://github.com/PaulLeCam/react-leaflet/issues/255)w */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});


class Map extends React.Component {
    constructor(props) {
        super(props)

        this.map = null
        this.regionsBoundaries = null
        this.clickedRegion = null
        this.showPreview = false
        this.resultRegion = props.resultRegion
        this.pointMarker = null
        this.legend = null
        this.zoneLayer = null
        this.zoneElevationLayer = null
        this.zoneElevationBand = ''
        this.currentZone = null
        this.opacityControl = null
        this.visibilityButton = null
        this.boundaryName = null
        this.popup = null
        this.mapIsMoving = false
        this.shpConstraintLayers = []
        this.shpConstraintData = []
        this.displayedRasterLayers = []
        this.displayedVectorLayers = []
        this.simple = props.simple || false
    }

    // Initial map setup
    componentDidMount() {
        let lethargy = new Lethargy(7, 10, 0.05)  // Help minimize jumpy zoom with Apple mice and trackpads
        L.Map.ScrollWheelZoom.prototype._onWheelScroll = function(e) {
            L.DomEvent.stop(e)

            if (lethargy.check(e) === false) {
                return
            }

            let delta = L.DomEvent.getWheelDelta(e)
            if (delta <= -0.25) delta = -0.25
            if (delta >= 0.25) delta = 0.25

            this._delta += delta
            this._lastMousePos = this._map.mouseEventToContainerPoint(e)

            this._performZoom()
        }

        this.map = L.map(this.mapNode, {
            zoom: 4,
            center: [55.0, -112.0],
            minZoom: 3,
            maxZoom: 13,
            preferCanvas: true
        })

        this.map.on('moveend', event => {
            this.mapIsMoving = false
            setTimeout(function() {
                if (!this.mapIsMoving) {
                    this.props.onMapMove(this.map.getCenter())
                }
            }.bind(this), 1)
        })

        this.map.on('movestart', event => {
            this.mapIsMoving = true;
        })

        this.map.zoomControl.setPosition('topright')

        this.map.addControl(L.control.zoomBox({
            position: 'topright'
        }))

        if (!this.simple) {

            let geonamesControl = L.control.geonames({
                geonamesURL: 'https://secure.geonames.org/searchJSON',
                position: 'topright',
                username: 'seedsource',
                showMarker: false,
                showPopup: false
            })
            geonamesControl.on('select', ({geoname}) => {
                let latlng = {lat: parseFloat(geoname.lat), lng: parseFloat(geoname.lng)}
                this.map.setView(latlng);
                this.map.fire('click', {latlng})
            })
            this.map.addControl(geonamesControl)
        }

        let basemapControl = L.control.basemaps({
            basemaps: [
                L.tileLayer('//{s}.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
                    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
                    maxZoom: 16,
                    subdomains: ['server', 'services']
                }),
                L.tileLayer('//{s}.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
                    maxZoom: 16,
                    subdomains: ['server', 'services']
                }),
                L.tileLayer('//{s}.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}', {
                    attribution: 'Tiles &copy; Esri &mdash; Source: USGS, Esri, TANA, DeLorme, and NPS',
                    maxZoom: 13,
                    subdomains: ['server', 'services']
                }),
                L.tileLayer('//{s}.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
                    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
                    maxZoom: 16,
                    subdomains: ['server', 'services']
                }),
                L.tileLayer('//{s}.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
                    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
                    maxZoom: 16,
                    subdomains: ['server', 'services']
                })
            ],
            tileX: 0,
            tileY: 0,
            tileZ: 1,
            position: 'bottomleft'
        })
        this.map.addControl(basemapControl)
        if (this.simple) {
            basemapControl.remove()
        }

        this.map.on('baselayerchange', layer => {
            this.props.onBasemapChange(layer._url)
        })

        if (!this.simple) {

            this.map.on('popupclose', () => {
                this.props.onPopupClose()
            })

            this.map.on('click', e => {
                if (!e.latlng) {
                    return
                }

                this.updateBoundaryPreview(e.latlng)

                this.props.onPopupLocation(e.latlng.lat, e.latlng.lng)
            })
        }
        
        this.map.on('zoomend', () => {
            this.props.onZoomChange(this.map.getZoom())
        })

        this.regionsBoundaries = topojson(
            regionsBoundariesUrl,
            null,
            L.geoJson(null, {
                style: {
                    fillColor: 'transparent',
                    opacity: 0
                }
            })
        )

        this.map.addLayer(this.regionsBoundaries)

        if (this.simple) {
            if (this.props.zoom && this.props.center) {
                this.map.setView(this.props.center, this.props.zoom)
            }
        }
    }

    componentWillUnmount() {
        this.map = null
    }

    componentWillReceiveProps(nextProps) {
        if (this.resultRegion !== nextProps.resultRegion) {
            this.removeBoundaryFromMap(this.resultRegion)
            this.resultRegion = nextProps.resultRegion
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.regionMethod === 'auto' && prevProps.regionMethod !== 'auto' && this.popup) {
            let point = this.popup.point
            this.updateBoundaryPreview({lng: point.x, lat: point.y})
        }
    }

    updatePointMarker(point) {
        let pointIsValid = point !== null && point.x && point.y

        if (pointIsValid) {
            if (this.pointMarker === null) {
                this.pointMarker = L.marker([point.y, point.x]).addTo(this.map)
            }
            else {
                this.pointMarker.setLatLng([point.y, point.x])
            }
        } else if (this.pointMarker !== null) {
            this.map.removeLayer(this.pointMarker)
            this.pointMarker = null
        }
    }

    addBoundaryToMap(region, color, showFill = true) {
        let fillOpacity = showFill ? 0.3 : 0
        this.regionsBoundaries.setStyle(f =>
            f.properties.region === region ? {opacity: 1, fillColor: color, fillOpacity, color, weight: 2} : undefined
        )
    }

    removeBoundaryFromMap(region) {
        let style = {opacity: 0, fillColor: 'transparent', fillOpacity: 0}
        if (region) {
            this.regionsBoundaries.setStyle(f => f.properties.region === region ? style : undefined)
        } else {
            this.regionsBoundaries.setStyle(style)
        }
    }

    updateBoundaryPreview(point) {
        this.cancelBoundaryPreview()

        if (this.props.regionMethod === 'auto') {

            let regionUrl = config.apiRoot + 'regions/?' + io.urlEncode({
                point: point.lng + ',' + point.lat
            })

            this.showPreview = true

            io.get(regionUrl).then(response => response.json()).then(json => {
                let results = json.results
                let validRegions = results.map(region => region.name);

                let region = null
                if (validRegions.length) {
                    region = validRegions[0]
                }

                if (this.showPreview && this.boundaryName !== region) {
                    this.addBoundaryToMap(region, '#aaa')
                    this.clickedRegion = region
                }
            })
        }
    }

    cancelBoundaryPreview() {
        this.showPreview = false
        if (this.clickedRegion) {
            this.removeBoundaryFromMap(this.clickedRegion)
            this.clickedRegion = null
        }
    }

    updateBoundaryLayer(region) {
        if (this.props.regionMethod === 'custom') {
            this.cancelBoundaryPreview()
        }

        if (region !== null && region !== this.boundaryName) {
            this.boundaryName = region

            // Remove existing layer from viewer
            this.removeBoundaryFromMap()

            let regionObj = regions.find(r => r.name === region)
            this.addBoundaryToMap(regionObj.name, '#000066', false)
        } else if (region === null) {
            this.boundaryName = null
            this.removeBoundaryFromMap()

            if (this.showPreview && this.clickedRegion) {
                this.addBoundaryToMap(this.clickedRegion, '#aaa')
            }
        }

        if (this.resultRegion) {
            this.addBoundaryToMap(this.resultRegion, '#006600', false)
        }
    }

    updateOpacity(opacity) {
        if (!this.simple) {
            if (this.displayedRasterLayers.length) {
                if (this.opacityControl === null) {
                    this.opacityControl = L.control.range({iconClass: 'icon-contrast-16'})
                    this.map.addControl(this.opacityControl)

                    this.opacityControl.on('change input', e => {
                        this.props.onOpacityChange(e.value / 100)
                    })
                }
                this.opacityControl.setValue(Math.round(opacity * 100))
            } else if (this.opacityControl !== null) {
                this.map.removeControl(this.opacityControl)
                this.opacityControl = null
            }
        }

        this.displayedRasterLayers.forEach(layer => layer.setOpacity(opacity))
    }

    updateVisibilityButton(layers) {
        if (this.simple){
            return
        }

        let resultsLayer = layers.find(item => item.name === 'results')

        if (resultsLayer !== undefined) {
            let icon = resultsLayer.displayed ? 'eye-closed' : 'eye';

            if (this.visibilityButton === null) {
                this.visibilityButton = L.control.button({'icon': icon})
                this.visibilityButton.on('click', e => {
                    this.props.onToggleVisibility()
                })
                this.map.addControl(this.visibilityButton)
            } else if (this.visibilityButton.options.icon !== icon) {
                this.visibilityButton.setIcon(icon)
            }
        } else if (this.visibilityButton !== null) {
            this.map.removeControl(this.visibilityButton)
            this.visibilityButton = null
        }
    }

    updateLegends(legends, layers, unit) {
        if (this.simple){
            return
        }

        let mapLegends = legends.legends.map(legend => {
            let variable = allVariables.find(item => item.name === legend.layerName)
            if (variable) {
                let { units, multiplier } = variable
                let newLegend = legend.legend.map(item => {
                    let value = parseFloat(item.label)

                    if (!isNaN(value)) {
                        value /= multiplier

                        if (units !== null && unit == 'imperial') {
                            value = units.imperial.convert(value)
                        }

                        value = parseFloat(value.toFixed(2)) + ' ' + units[unit].label

                        return Object.assign({}, item, {label: value})
                    }
                    return item
                })

                return {
                    label: legend.layerName,
                    elements: newLegend
                }

            } else {
                return {
                    label: "Match",
                    elements: legend.legend
                }
            }
        })

        let legendOrder = layers.filter(layer => layer.displayed === true).map(layer => {
            return layer.name
        })

        let orderedMapLegends = legendOrder.map(name => mapLegends.find(el => el.label === name
            || (el.label === "Match" && name ==="results"))).filter(el => typeof el == 'object')

        if (orderedMapLegends.length) {
            if (this.legend === null) {
                this.legend = L.control.legend({legends: orderedMapLegends})
                this.map.addControl(this.legend)
            } else if (JSON.stringify(orderedMapLegends) !== JSON.stringify(this.legend.options.legends)) {
                this.legend.setLegends(orderedMapLegends)
            }
        } else if (this.legend !== null) {
            this.map.removeControl(this.legend)
            this.legend = null
        }
    }

    updateZoneLayer(method, zone, zoneConfig, geometry) {
        if (method === 'seedzone' && geometry !== null) {
            if (zone !== this.currentZone) {
                if (this.zoneLayer !== null) {
                    this.map.removeLayer(this.zoneLayer)
                    this.zoneLayer = null
                }
                if (this.zoneElevationLayer !== null) {
                    this.map.removeLayer(this.zoneElevationLayer)
                    this.zoneElevationLayer = null
                }
            }

            const elevationBand = `${zoneConfig.elevation_band[0]}-${zoneConfig.elevation_band[1]}`
            if (elevationBand !== this.zoneElevationBand && this.zoneElevationLayer !== null) {
                this.map.removeLayer(this.zoneElevationLayer)
                this.zoneElevationLayer = null
            }
            this.zoneElevationBand = elevationBand

            if (this.zoneLayer === null) {
                this.zoneLayer = L.geoJson(geometry, {style: () => {
                    return {color: '#0E630B', fill: false}
                }}).addTo(this.map)
            }

            this.currentZone = zone

            if (this.zoneElevationLayer === null && zoneConfig.elevation_service !== null) {
                this.zoneElevationLayer = L
                    .tileLayer(`/tiles/${zoneConfig.elevation_service}/{z}/{x}/{y}.png`, {zIndex: 1, opacity: .5})
                    .addTo(this.map)
            }
        } else if (this.zoneLayer !== null) {
            this.map.removeLayer(this.zoneLayer)
            this.zoneLayer = null
            this.currentZone = null
        }
    }

    updateShapefileLayer(constraints) {
        let data = constraints.map(c => c.values.geoJSON).filter(geojson => !!geojson)
        if (JSON.stringify(data) === JSON.stringify(this.shpConstraintData)) {
            return
        }

        // Create new layers for each feature, even if they already exist...
        let layers = data.map(geojson => L
            .geoJSON(geojson, {style: {fill: false, color: '#a50f15', weight: 1.5}})
            .addTo(this.map)
        )

        // ... then delete the old layers
        this.shpConstraintLayers.forEach(layer => this.map.removeLayer(layer))

        this.shpConstraintLayers = layers
        this.shpConstraintData = data
    }

    updatePopup(popup, unit) {
        let { point, elevation } = popup

        if (point !== null) {
            if (this.popup === null) {
                let container = L.DomUtil.create('div', 'map-info-popup')

                let location = L.DomUtil.create('div', '', container)

                let elevation = L.DomUtil.create('div', '', container)
                let elevationTitle = L.DomUtil.create('span', '', elevation)
                elevationTitle.innerHTML = 'Elevation: '
                let elevationLabel = L.DomUtil.create('strong', '', elevation)

                let values = L.DomUtil.create('div', '', container)

                L.DomUtil.create('div', '', container).innerHTML = '&nbsp;'

                let button = L.DomUtil.create('button', 'button is-primary is-fullwidth', container)
                button.innerHTML = 'Set Point'

                let popup = L.popup({
                    closeOnClick: false
                }).setLatLng([point.y, point.x]).setContent(container).openOn(this.map)

                L.DomEvent.on(button, 'click', () => {
                    this.cancelBoundaryPreview()
                    let { point } = this.popup
                    this.map.closePopup(popup)
                    this.props.onMapClick(point.y, point.x)
                })

                this.popup = {
                    popup,
                    location,
                    elevationLabel,
                    values,
                    point
                }
            }

            if (JSON.stringify(point) !== JSON.stringify(this.popup.point)) {
                this.popup.point = point
            }

            let latlng = this.popup.popup.getLatLng()
            if (latlng.lat !== point.y || latlng.lng !== point.x) {
                this.popup.popup.setLatLng([point.y, point.x])
            }

            let locationLabel = 'Lat: <strong>' + point.y.toFixed(2) +
                '</strong> Lon: <strong>' + point.x.toFixed(2) + '</strong>'
            if (locationLabel !== this.popup.location.innerHTML) {
                this.popup.location.innerHTML = locationLabel
            }

            let elevationLabel = 'N/A'
            if (elevation !== null) {
                elevationLabel = Math.round(elevation / 0.3048) + ' ft (' + Math.round(elevation) + ' m)'
            }
            if (elevationLabel !== this.popup.elevationLabel.innerHTML) {
                this.popup.elevationLabel.innerHTML = elevationLabel
            }

            let valueRows = popup.values.map(item => {
                let variableConfig = allVariables.find(variable => variable.name === item.name)
                let { multiplier, units } = variableConfig
                let value = 'N/A'
                let unitLabel = units.metric.label

                if (item.value !== null) {
                    value = item.value / multiplier

                    let { precision } = units.metric

                    if (unit === 'imperial') {
                        precision = units.imperial.precision
                        unitLabel = units.imperial.label
                        value = units.imperial.convert(value)
                    }

                    value = value.toFixed(precision)
                }

                return '<div><span>' + item.name + ': </span><strong>' + value + ' ' + unitLabel + '</strong></div>'
            })

            let values = valueRows.join('')

            if (values !== this.popup.values.innerHTML) {
                this.popup.values.innerHTML = values
            }
        } else if (this.popup) {
            this.cancelBoundaryPreview()
            this.map.closePopup(this.popup.popup)
            this.popup = null
        }
    }

    updateMapCenter(center) {
        if (this.mapIsMoving) {
            return
        }

        let mapCenter = this.map.getCenter()
        if (!isClose(center[0], mapCenter.lat) || !isClose(center[1], mapCenter.lng)) {
            this.map.setView(center)
        }
    }
  
    updateMapZoom(zoomLevel) {
        let mapZoomLevel = this.map.getZoom()

        if (zoomLevel != mapZoomLevel) {
            this.map.setZoom(zoomLevel)
        }
    }

    updateRasterLayers(layers) {
        let numLayersToAdd = layers.length - this.displayedRasterLayers.length
        let { objective, climate, region } = this.props
        let { serviceId } = this.props.job

        if (numLayersToAdd > 0) {
            this.displayedRasterLayers.push(...Array(numLayersToAdd).fill().map((_, index) => {
                let layer = layers[this.displayedRasterLayers.length+index]
                let url = getLayerUrl(layer, serviceId, objective, climate, region)
                return L.tileLayer(`/tiles/${url}/{z}/{x}/{y}.png`, {zIndex: 1, opacity: 1}).addTo(this.map)
            }))
        } else if (numLayersToAdd < 0) {
            this.displayedRasterLayers
                .splice(numLayersToAdd, Math.abs(numLayersToAdd))
                .forEach(layer => this.map.removeLayer(layer))
        }

        layers.forEach((layer, index) => {
            let url = `/tiles/${getLayerUrl(layer, serviceId, objective, climate, region)}/{z}/{x}/{y}.png`
            if (url !== this.displayedRasterLayers[index]._url) {
                this.displayedRasterLayers[index].setUrl(url)
                    .setZIndex(layers[index].zIndex)
            }
        })
    }

    updateVectorLayers(layers) {
        if (this.displayedVectorLayers.map(layer => layer._url).toString() === layers.map(layer => layer.urlTemplate).toString()) {
            return
        }

        let numLayersToAdd = layers.length - this.displayedVectorLayers.length

        if (numLayersToAdd > 0) {
            this.displayedVectorLayers.push(...Array(numLayersToAdd).fill().map((_, i) => {
                let layer = layers[this.displayedVectorLayers.length+i]
                return L.vectorGrid.protobuf(layer.urlTemplate, {
                    zIndex: 1, opacity: 1, vectorTileLayerStyles: layer.style
                }).addTo(this.map)
            }))
        } else {
            this.displayedVectorLayers
                .splice(numLayersToAdd, Math.abs(numLayersToAdd))
                .forEach(layer => this.map.removeLayer(layer))
        }

        layers.forEach((layer, index) => {
            let displayedLayer = this.displayedVectorLayers[index]
            if (displayedLayer.url !== layer.urlTemplate) {
                this.displayedVectorLayers[index].options.vectorTileLayerStyles.data = Object.assign({}, layer.style)
                this.displayedVectorLayers[index].setUrl(layer.urlTemplate)
            }
        })
    }

    updateLayers(layers) {
        let rasterLayers = layers.filter(layer => (layer.type === "raster") && (layer.displayed === true))
        let vectorLayers = layers.filter(layer => (layer.type === "vector") && (layer.displayed === true))
        this.updateRasterLayers(rasterLayers)
        this.updateVectorLayers(vectorLayers)
    }

    render() {
        let timeOverlay = null

        if (this.map !== null) {
            let {
                objective, point, climate, opacity, legends, popup, unit, method, zone, zoneConfig, geometry, center,
                region, shapefileConstraints, layers, zoom
            } = this.props

            this.updateLayers(layers)
            this.updatePointMarker(point)
            this.updateBoundaryLayer(region)
            this.updateVisibilityButton(layers)
            this.updateOpacity(opacity)
            this.updateLegends(legends, layers, unit)
            this.updateZoneLayer(method, zone, zoneConfig, geometry)
            this.updatePopup(popup, unit)
            this.updateMapCenter(center)
            this.updateMapZoom(zoom)
            this.updateShapefileLayer(shapefileConstraints)

            // Time overlay
            if (layers.find(layer => layer.urlTemplate.includes("{region}_{modelTime}") && layer.displayed === true)) {
                let selectedClimate = objective === 'seedlots' ? climate.site : climate.seedlot
                let { time, model } = selectedClimate
                let labelKey = time

                if (time !== '1961_1990' && time !== '1981_2010') {
                    labelKey += model
                }

                let label = timeLabels[labelKey]

                timeOverlay = <div className="time-overlay">
                    <span className="icon-clock-16"></span><span>&nbsp;</span>
                    Showing: {label}
                </div>
            }
        }

        return <div className="map-container">
            <div ref={input => {this.mapNode = input}} className="map-container"></div>
            {timeOverlay}
        </div>
    }
}

const mapStateToProps = state => {

    let { runConfiguration, map, job, legends, popup, lastRun, layers } = state
    let { opacity, center, zoom } = map
    let { objective, point, climate, unit, method, zones, region, regionMethod, constraints } = runConfiguration
    let { geometry, selected: zone, matched } = zones
    let resultRegion = lastRun ? lastRun.region : null
    let shapefileConstraints = constraints.filter(item => item.type === 'shapefile')

    let zoneConfig = matched.find(item => item.zone_uid === zone)

    return {
        objective, point, climate, opacity, job, legends, popup, unit, method, geometry, zone, zoneConfig, center,
        zoom, region, regionMethod, resultRegion, shapefileConstraints, layers
    }
}

const mapDispatchToProps = dispatch => {
    return {
        onBasemapChange: basemap => {
            dispatch(setBasemap(basemap))
        },

        onZoomChange: zoom => {
            dispatch(setZoom(zoom))
        },

        onOpacityChange: opacity => {
            dispatch(setMapOpacity(opacity))
        },

        onMapClick: (lat, lon) => {
            dispatch(setPoint(lat, lon))
        },

        onPopupLocation: (lat, lon) => {
            dispatch(setPopupLocation(lat, lon))
        },

        onPopupClose: () => {
            // Dispatching this event immediately causes state warnings
            setTimeout(() => dispatch(resetPopupLocation()), 1)
        },

        onToggleVisibility: () => {
            dispatch(toggleLayer('results'))
        },

        onMapMove: center => {
            dispatch(setMapCenter([center.lat, center.lng]))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Map)
