<?php
/**
 * @file
 * EC_mapeditor field formatter functions.
 */

/**
 * Helper function to standardize forms between views and field formatter.
 *
 * @return array
 * A fully loaded form element.
 */
function _ec_mapeditor_form_elements($group, $settings, $options = NULL) {
  $form_element = NULL;
  switch ($group) {

    case 'popup':
      $form_element = array(
        '#type' => 'container',
        '#weight' => 10,
      );
      $form_element['popin'] = array(
        '#title' => t('Use pop-in (show details in right side bar).'),
        '#type' => 'checkbox',
        '#default_value' => $settings[$group]['popin'],
      );
      break;

    case 'zoom':
      // Define zoom options.
      $zoom_options = array(
        0 => t('0 - Low/Far'),
        18 => t('18 - High/Close'),
      );
      for ($i = 1; $i < 18; $i++) {
        $zoom_options[$i] = $i;
      }
      ksort($zoom_options);

      $form_element = array(
        '#type' => 'container',
        '#weight' => 12,
      );
      $form_element['initialZoom'] = array(
        '#title' => t('Initial zoom level'),
        '#description' => t('The starting zoom level when this map is rendered.  Restricted by min and max zoom settings.'),
        '#type' => 'select',
        '#options' => $zoom_options,
        '#default_value' => isset($settings[$group]['initialZoom']) ? $settings[$group]['initialZoom'] : 2,
        '#element_validate' => array('_ec_mapeditor_validate_zoom'),
      );
      $form_element['minZoom'] = array(
        '#title' => t('Minimum zoom level'),
        '#description' => t('The minimum zoom level allowed. (How far away can you view from?)'),
        '#type' => 'select',
        '#options' => $zoom_options,
        '#default_value' => isset($settings[$group]['minZoom']) ? $settings[$group]['minZoom'] : 1,
        '#element_validate' => array('_ec_mapeditor_validate_zoom'),
      );
      $form_element['maxZoom'] = array(
        '#title' => t('Maximum zoom level'),
        '#description' => t('The maximum zoom level allowed. (How close in can you get?).'),
        '#type' => 'select',
        '#options' => $zoom_options,
        '#default_value' => isset($settings[$group]['maxZoom']) ? $settings[$group]['maxZoom'] : 14,
        '#element_validate' => array('_ec_mapeditor_validate_zoom'),
      );
      break;

    case 'icon':
      $form_element = array(
        '#type' => 'container',
        '#weight' => 14,
      );
      $form_element['icon'] = array(
        '#type' => 'select',
        '#title' => t('Icon'),
        '#default_value' => isset($settings[$group]['icon']) ? $settings[$group]['icon'] : 'blue',
        '#options' => _ec_mapeditor_layer_icons(),
      );
      break;

    case 'tile_layer':
      $form_element = array(
        '#type' => 'fieldset',
        '#title' => t('Map background'),
        '#weight' => 16,
      );
      $form_element['tile_layer'] = array(
        '#type' => 'select',
        '#title' => t('Tile layer'),
        '#default_value' => isset($settings[$group]['tile_layer']) ? $settings[$group]['tile_layer'] : 'osmec',
        '#options' => _ec_mapeditor_tiles(),
      );
      break;

    case 'height':
      $form_element = array(
        '#type' => 'container',
        '#weight' => 6,
      );
      $form_element['height'] = array(
        '#title' => t('Map height'),
        '#type' => 'textfield',
        '#field_suffix' => t('px'),
        '#size' => 4,
        '#default_value' => isset($settings[$group]['height']) ? $settings[$group]['height'] : '430',
        '#required' => FALSE,
        '#element_validate' => array('ec_mapeditor_validate_height'),
      );

      // Displays a warning under the title field for a low height.
      $form_element['height']['#suffix'] = "<div id='min-height-label' class='description'></div>";
      $form_element['height']['#attached']['js'][] = array(
        'data' => array(
          'ec_mapeditor' => array(
            'min_height' => 300,
            'label' => t('To ensure the map menu displays correctly, it is
            recommended to choose a height higher than 300px.'),
            'warning' => t('<strong>Attention. The entered height is lower than
            recommended</strong>.'),
          ),
        ),
        'type' => 'setting',
      );
      break;

    case 'center':
      $form_element = array(
        '#type' => 'fieldset',
        '#title' => t('Map center'),
        '#description' => t('Center of the map. E.g. latitude 50.84 and 4.36 longitude for Brussels. In case of visible markers the map will be centered automatically on them ignoring settings below.'),
        '#weight' => 8,
      );
      $form_element['lat'] = array(
        '#title' => t('Latitude'),
        '#type' => 'textfield',
        '#size' => 10,
        '#default_value' => isset($settings[$group]['lat']) ? $settings[$group]['lat'] : 50.84,
        '#required' => TRUE,
      );
      $form_element['lon'] = array(
        '#title' => t('Longitude'),
        '#type' => 'textfield',
        '#size' => 10,
        '#default_value' => isset($settings[$group]['lon']) ? $settings[$group]['lon'] : 4.36,
        '#required' => TRUE,
      );
      break;

    case 'clustering':
      $form_element = array(
        '#type' => 'container',
        '#weight' => 16,
      );
      $form_element['cluster_markers'] = array(
        '#type' => 'checkbox',
        '#title' => t('Cluster markers'),
        '#default_value' => isset($settings[$group]['cluster_markers']) ? $settings[$group]['cluster_markers'] : FALSE,
      );
      break;

    case 'attribution':
      $form_element = array(
        '#type' => 'container',
        '#weight' => 16,
      );
      $form_element['attributionControl'] = array(
        '#type' => 'checkbox',
        '#title' => t('Show attribution'),
        '#default_value' => isset($settings[$group]['attributionControl']) ? $settings[$group]['attributionControl'] : TRUE,
      );
      $form_element['attribution'] = array(
        '#type' => 'textfield',
        '#title' => t('Attribution text'),
        '#default_value' => isset($settings[$group]['attribution']) ? $settings[$group]['attribution'] : t('Map data by Eurostat and the European Commission'),
        '#size' => 72,
      );
      break;
  }

  return $form_element;
}