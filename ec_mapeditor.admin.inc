<?php
/**
 * @file
 * Provides administration functionality for the map entity.
 */

/**
 * Add new map page callback.
 *
 * @return Map Form
 *   It creates new map entity.
 */
function ec_mapeditor_add_map() {
  $map = entity_create('map', array('type' => 'map'));
  drupal_set_title(t('Create map'));
  $output = drupal_get_form('map_form', $map);
  return $output;
}

/**
 * Handles map form submission.
 *
 * @param array $form
 *   Provides form values to update form_state.
 * @param array $form_state
 *   Form state of the entity that must be updated.
 */
function ec_mapeditor_form_submit($form, &$form_state) {
  $map = $form_state['map'];
  entity_form_submit_build_entity('map', $map, $form, $form_state);
  _ec_mapeditor_save_map($map);
  $map_uri = entity_uri('map', $map);
  $form_state['redirect'] = $map_uri['path'];
  drupal_set_message(t('Map %title saved.', array('%title' => entity_label('map', $map))));
}

/**
 * Handles map delete form submission.
 */
function ec_mapeditor_form_submit_delete($form, &$form_state) {
  $map = $form_state['map'];
  $map_uri = entity_uri('map', $map);
  $form_state['redirect'] = $map_uri['path'] . '/delete';
}

/**
 * Defines deletion confirmation form.
 *
 * @param array $form
 *   Provides form values to update form_state.
 * @param array $form_state
 *   Form state of the entity that must be updated.
 * @param object $map
 *   Map Entity object.
 *
 * @return The form array
 *   Form to delete the map.
 */
function ec_mapeditor_delete_form($form, &$form_state, $map) {
  $form_state['map'] = $map;

  // Always provide entity id in the same form key as in the entity edit form.
  $form['map_type_id'] = array(
    '#type' => 'value',
    '#value' => entity_id('map', $map),
  );
  $map_uri = entity_uri('map', $map);
  return confirm_form($form,
    t('Are you sure you want to delete map %title?', array('%title' => entity_label('map', $map))),
    $map_uri['path'],
    t('This action cannot be undone.'),
    t('Delete'),
    t('Cancel')
  );
}

/**
 * Handles deletion form submit.
 *
 * @param array $form
 *   Provides form values to update form_state.
 * @param array $form_state
 *   Form state of the entity that must be updated.
 */
function ec_mapeditor_delete_form_submit($form, &$form_state) {
  $map = $form_state['map'];
  _ec_mapeditor_delete_map($map);
  drupal_set_message(t('Map %title deleted.', array('%title' => entity_label('map', $map))));
  $form_state['redirect'] = 'admin/structure/maps';
}
