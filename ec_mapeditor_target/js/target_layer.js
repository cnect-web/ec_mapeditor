/**
 * @file
 * Provides custom functionality as input for load.js.
 *
 * Sets up map data and settings that are activated in map.js. Depends on
 * map_layer.js.
 */

if (typeof Drupal.settings.target_layers !== 'undefined') {

  // Create layers to control array if none.
  if (typeof layers_to_control == 'undefined') {
    var layers_to_control = [];
  }

  // Create layers to enable array if none.
  if (typeof layers_to_enable == 'undefined') {
    var layers_to_enable = [];
  }

  var target_layers = Drupal.settings.target_layers;
  var arrayLength = target_layers.length;
  for (var i = 0; i < arrayLength; i++) {
    var id = target_layers[i].id;
    var options = {};
    // Collects the layers that are marked "enabled" to be activated in
    // map.js.
    if (typeof target_layers[i].layer_settings.control.enabled != 'undefined') {
      if (target_layers[i].layer_settings.control.enabled == '1') {
        layers_to_enable.push({"label": target_layers[i].label, "layer": id});
      }
    }

    // Adds all layers to the layercontrol.
    if (typeof target_layers[i].layer_settings.control.show_in_control != 'undefined') {
      if (target_layers[i].layer_settings.control.show_in_control == '1') {
        layers_to_control.push({"label": target_layers[i].label, "layer": id});
      }
    }
  }
}
