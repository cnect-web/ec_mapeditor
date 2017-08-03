<?php
/**
 * @file
 * Define helper functions for install file.
 */

/**
 * Defines and creates map layer field.
 *
 * Creates a map layer field which is a entity reference field, using inline
 * entity form as widget. It is a multivalue field and it displays 'map_layer'
 * as default view mode.
 */
function _ec_mapeditor_create_map_layer_field() {
  // Clear field definition cache so that the entityreference field type is
  // known to drupal during the enable hook. See
  // https://www.drupal.org/node/1783886 and https://www.drupal.org/node/906668
  _field_info_collate_types(TRUE);

  if (field_info_field('map_layers')) {
    watchdog('ec_mapeditor_layer', 'Field Map Countries not created because it exists already', array(), WATCHDOG_NOTICE, NULL);
  }
  else {
    $field_bases = array();
    $field_bases['map_layers'] = array(
      'active' => 1,
      'cardinality' => -1,
      'deleted' => 0,
      'entity_types' => array(),
      'field_name' => 'map_layers',
      'indexes' => array(
        'target_id' => array(
          0 => 'target_id',
        ),
      ),
      'locked' => 1,
      'module' => 'entityreference',
      'settings' => array(
        'handler' => 'base',
        'handler_settings' => array(
          'behaviors' => array(
            'views-select-list' => array(
              'status' => 0,
            ),
          ),
          'sort' => array(
            'type' => 'none',
          ),
          'target_bundles' => array(),
        ),
        'target_type' => 'map_layer',
      ),
      'translatable' => 0,
      'type' => 'entityreference',
    );
  }
  foreach ($field_bases as $field) {
    field_create_field($field);
  }

  // Defines the map country field for the country layer bundle. Creates
  // multiple line textarea field for CSV data.
  $field_instances = array();
  $field_instances['ec_mapeditor-mapeditor-map_layers'] = array(
    'bundle' => 'map',
    'deleted' => 0,
    'description' => '',
    'display' => array(
      'default' => array(
        'label' => 'hidden',
        'module' => 'entityreference',
        'settings' => array(
          'links' => 1,
          'use_content_language' => 1,
          'view_mode' => 'map_layer',
        ),
        'type' => 'entityreference_entity_view',
        'weight' => 0,
      ),
    ),
    'entity_type' => 'map',
    'field_name' => 'map_layers',
    'label' => 'Layers',
    'required' => 0,
    'settings' => array(
      'user_register_form' => FALSE,
    ),
    'widget' => array(
      'active' => 1,
      'module' => 'inline_entity_form',
      'settings' => array(
        'fields' => array(),
        'type_settings' => array(
          'allow_existing' => 0,
          'allow_new' => 1,
          'delete_references' => 0,
          'label_plural' => 'entities',
          'label_singular' => 'entity',
          'match_operator' => 'CONTAINS',
          'override_labels' => 0,
        ),
      ),
      'type' => 'inline_entity_form',
      'weight' => 1,
    ),
  );
  foreach ($field_instances as $instance) {
    field_create_instance($instance);
  }
}
