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

    // Defines map height.
    obj.style.minHeight = settings.height.height + 'px';

    var map = L.map(obj, {
      "center": [mapeditor_map.center.lat, mapeditor_map.center.lon],
      "zoom": mapeditor_map.zoom.initialZoom,
      "minZoom": mapeditor_map.zoom.minZoom,
      "maxZoom": mapeditor_map.zoom.maxZoom
    });

    // Add markers to the map from View.
    if (typeof Drupal.settings.features != 'undefined') {

      var cluster_markers = false;
      if (settings.cluster_markers == 1) {
        cluster_markers = true;
      }

      var markersBindPopup = {
        onEachFeature: function(feature, layer) {
          if (feature.properties && feature.properties.popupContent) {
            if (mapeditor_map.popin) {
              layer.bindInfo(feature.properties.popupContent);
            }
            else {
              layer.bindPopup(feature.properties.popupContent);
            }
          }
        },
        color: settings.icon,
        cluster: cluster_markers
      };
      var marker = L.wt.markers(Drupal.settings.features, markersBindPopup).addTo(map);
    }

    // Creates the tile layer in the map.
    var options = [];

    var tiles = L.wt.tileLayer(settings.tiles.tiles, options).addTo(map);
    // Add tile_layer set in the into the view.
    var tile_layer = L.wt.tileLayer(mapeditor_map.map).addTo(map);

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

    // Bounds map to markers.
    if (typeof Drupal.settings.features != 'undefined') {
      marker.fitBounds(Drupal.settings.features);

      // Bound markers when clicking on Popup Close icon.
      document.getElementsByClassName('leaflet-close')[0].addEventListener("click", function(e) {
        if (typeof marker.fitBounds(Drupal.settings.features) != 'undefined') {
            marker.fitBounds(Drupal.settings.features);
        }
      }, false);

      // Bound markers when clicking on Home icon.
      document.getElementsByClassName('leaflet-home')[0].onclick = function () {
        document.getElementsByClassName('leaflet-close')[0].click();
      };
    }

    // Processes the next component.
    $wt._queue("next");
  }
};
