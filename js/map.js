/**
 * @file
 * Provides custom functionality as input for Webtools' load.js.
 */

L.custom = {

  init: function (obj, params) {

    // Sets variables from Drupal JS settings.
    var settings = Drupal.settings.settings;
    if (typeof Drupal.settings.mapeditor_map != 'undefined') {
      var mapeditor_map = Drupal.settings.mapeditor_map;
    }

    var default_settings = {
      "center": [settings.center.lat, settings.center.lon],
      "zoom": settings.zoom.initialZoom,
      "minZoom": settings.zoom.minZoom,
      "maxZoom": settings.zoom.maxZoom,
      "dragging": settings.dragging,
      "touchZoom": settings.touchZoom,
      "scrollWheelZoom": settings.scrollWheelZoom
    };

    // Defines map height.
    obj.style.minHeight = settings.height.height + 'px';

    var map = L.map(obj, default_settings);

    // Creates the tile layer in the map.
    var options = [];

    // Hide Show disclaimer of the map.
    if (settings.show_disclaimer == '0') {
      document.getElementById('leaflet-disclaimer').style.display = 'none';
    }

    var tiles = L.wt.tileLayer(settings.tiles.tiles, options).addTo(map);

    // Defines custom Icon.
    var defaultIcon = L.Icon.extend({
      options: {
        iconUrl: '//europa.eu/webtools/services/map/images/marker-icon-' + settings.icon.icon + '.png',
        shadowUrl: '//europa.eu/webtools/services/map/images//marker-shadow.png',
        iconSize: [25, 41],
        shadowSize: [41, 41],
        iconAnchor: [20, 41],
        shadowAnchor: [20, 40],
        popupAnchor: [-3, -76]
      }
    });

    // Enables layers, layer and panel control when they are defined.
    // Cycles through list of layers waiting to be enabled.
    if (typeof layers_to_enable != 'undefined') {
      var arrayLength = layers_to_enable.length;
      for (var i = 0; i < arrayLength; i++) {

        // @todo check possible issue addlayer vs addto
        layers_to_enable[i].layer.addTo(map);
      }
    }

    // Bounds map to markers, if set and if there is a group.
    if (settings.center.fitbounds == true) {
      // Node and CSV layers are bound as a group.
      if (typeof group != 'undefined') {

        map.fitBounds(group.getBounds(), {padding: [30, 30]}).setZoom(settings.zoom.initialZoom);

        // Bound markers when clicking on Home icon.
        document.getElementsByClassName('leaflet-home')[0].onclick = function () {
          document.getElementsByClassName('leaflet-close')[0].click();
        };
        // Bound markers when clicking on Popup Close icon.
        document.getElementsByClassName('leaflet-close')[0].addEventListener("click", function (e) {
            map.fitBounds(group.getBounds(), {padding: [30, 30]}).setZoom(settings.zoom.initialZoom);
        }, false);
      }

      // Fits map to bounds of url layers (different from other layers). URL
      // layers are bound individually.
      if (typeof wt_bounds_group != 'undefined') {
        var arrayLength = wt_bounds_group.length;
        for (var i = 0; i < arrayLength; i++) {
          wt_bounds_group[i].fitBounds().setZoom(settings.zoom.initialZoom);
        }
      }
    }

    // Adds layers panel to sidebar when there are layers.
    if (typeof layers_panel != 'undefined') {
      layers_panel.addTo(map);
    }

    // Processes the next component.
    $wt._queue("next");
  }
};
