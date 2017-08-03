<?php

/**
 * @file
 * EC Mapeditor maps views integration.
 */

/**
 * Define ec mapeditor views style.
 *
 * Implements hook_views_plugins().
 */
function ec_mapeditor_views_views_plugins() {
  $plugins = array(
    'module' => 'ec_mapeditor_views',
    'style' => array(
      'leaflet' => array(
        'title' => t('EC Mapeditor Map'),
        'help' => t('Displays a view as an EC Mapedior'),
        'path' => drupal_get_path('module', 'ec_mapeditor_views'),
        'handler' => 'EcMapeditorViewsPluginStyle',
        'theme' => 'mapeditor-map',
        'uses fields' => TRUE,
        'uses row plugins' => FALSE,
        'uses options' => TRUE,
        'uses grouping' => FALSE,
        'type' => 'normal',
        'even empty' => TRUE,
      ),
    ),
  );

  return $plugins;
}
