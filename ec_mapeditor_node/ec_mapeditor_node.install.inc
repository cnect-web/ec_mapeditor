<?php
/**
 * @file
 * Define helper functions for install file.
 */

/**
 * Creates the node map layer bundle.
 */
function _ec_mapeditor_node_create_layer() {
  $bundle = new stdClass();
  $bundle->type = 'node_layer';
  $bundle->label = t('Node layer');
  $bundle->is_new = TRUE;
  $bundle->description = t("Map layer from geo data stored in nodes");
  $controller = new EcMapeditorLayerTypeController('map_layer_type');
  $controller->save($bundle);
}

/**
 * Changes map layer field.
 *
 * Adds node layer as target bundles.
 */
function _ec_mapeditor_node_change_map_layers_field() {
  $field_info = field_read_field('map_layers');

  // Adds node layer as target bundles.
  $field_info['settings']['handler_settings']['target_bundles']['node_layer'] = 'node_layer';
  field_update_field($field_info);
}
