<?php
/**
 * @file
 * Define helper functions for install file.
 */

/**
 * Creates the tile map layer bundle.
 */
function _ec_mapeditor_tile_create_layer() {
  $bundle = new stdClass();
  $bundle->type = 'tile_layer';
  $bundle->label = t('Tile layer');
  $bundle->is_new = TRUE;
  $bundle->description = t("Map layer with tiles");
  $controller = new EcMapeditorLayerTypeController('map_layer_type');
  $controller->save($bundle);
}

/**
 * Changes map layer field.
 *
 * Adds tile layer as target bundles.
 */
function _ec_mapeditor_tile_change_map_layers_field() {
  $field_info = field_read_field('map_layers');

  // Adds tile layer as target bundles.
  $field_info['settings']['handler_settings']['target_bundles']['tile_layer'] = 'tile_layer';
  field_update_field($field_info);
}
