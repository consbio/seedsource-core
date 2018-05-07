import L from 'leaflet'

L.Control.Button = L.Control.extend({
    options: {
        position: 'topright',
        icon: ''
    },

    onAdd: function(map) {
        var container = L.DomUtil.create('div', 'leaflet-button leaflet-bar');
        var button = L.DomUtil.create('span', 'icon-' + this.options.icon + '-16', container);

        L.DomEvent
            .on(button, 'click', function(e) {
                this.fire('click', {target: this});
            }.bind(this))
            .on(button, 'mousedown mouseup click', L.DomEvent.stopPropagation);

        this._button = button;
        this._container = container;
        return this._container;
    },

    setIcon: function(icon) {
        this.options.icon = icon;
        this._button.setAttribute('class', 'icon-' + icon + '-16');
    },

    includes: L.Evented.prototype
});

L.control.button = function(options) {
    return new L.Control.Button(options);
}

L.Control.Legend = L.Control.extend({
    options: {
        position: 'bottomright',
        legends: []
    },

    onAdd: function(map) {
        this._container = L.DomUtil.create('div', 'leaflet-bar leaflet-legend');

        L.DomEvent.on(this._container, 'click', function(e) {
            e.stopPropagation();
        });

        this._rebuildLegends();

        return this._container;
    },

    _rebuildLegends: function() {
        L.DomUtil.empty(this._container);

        this.options.legends.forEach(function(legend) {
            var className = 'legend-item'

            if (legend.className) {
                className += ' ' + legend.className
            }

            var container = L.DomUtil.create('div', className, this._container);
            var label = L.DomUtil.create('h4', 'title is-5', container);
            label.innerHTML = legend.label;

            var table = L.DomUtil.create('table', null, container);
            var tbody  = L.DomUtil.create('tbody', null, table);

            legend.elements.forEach(function(item) {
                var tr = L.DomUtil.create('tr', null, tbody);
                var imageCell = L.DomUtil.create('td', null, tr);

                var image = L.DomUtil.create('img', null, imageCell);
                image.src = 'data:image/png;base64,' + item.imageData;

                var labelCell = L.DomUtil.create('td', null, tr);
                labelCell.innerHTML = item.label;
            }.bind(this));
        }.bind(this));
    },

    setLegends: function(legends) {
        this.options.legends = legends;

        this._rebuildLegends();
    }
});

L.control.legend = function(options) {
    return new L.Control.Legend(options);
}
