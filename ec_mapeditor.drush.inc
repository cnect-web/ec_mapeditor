<?php

/**
 * @file
 * Provides custom drush command to import data.
 */

/**
 * Implements hook_drush_command().
 */
function ec_mapeditor_drush_command() {
  $items['maps-import'] = array(
    'description' => 'Imports DSM predifined recordset of Maps.',
    'aliases' => array('ecmi'),
  );
  return $items;
}

/**
 * Maps-import (ecmi) drush command.
 */
function drush_ec_mapeditor_maps_import() {

  require_once 'ec_mapeditor_dsm.data.inc';

  $tables = _ec_mapeditor_dsm_set_data();
  $tables_to_check = array(
    'map',
    'map_layer',
    'field_data_map_countries',
    'field_data_map_country_list',
    'field_data_map_csv',
    'field_data_map_url',
    'field_data_map_layers',
    'field_revision_map_countries',
    'field_revision_map_country_list',
    'field_revision_map_csv',
    'field_revision_map_url',
    'field_revision_map_layers',
  );

  foreach ($tables_to_check as $table) {
    if (db_table_exists($table)) {
      $result = db_select($table, $table . '_alias')
        ->fields($table . '_alias')
        ->execute();
      $num_of_results = $result->rowCount();
      $checks[$table] = ($num_of_results == 0) ? 'ok' : 'Table not empty';
    }
    else {
      $checks[$table] = 'Table does not exists';
    }
  }

  $counts = array_count_values($checks);
  if ($counts['ok'] == count($tables_to_check)) {
    echo 'Importing...' . "\n";

    $query = db_insert('map')->fields(array(
      'mid',
      'type',
      'title',
      'uid',
      'created',
      'changed',
      'description',
      'settings',
    )
    );
    foreach ($tables['map'] as $record) {
      $query->values(preg_replace('/\n/', '', $record));
    }
    $query->execute();

    $query = db_insert('map_layer')->fields(array(
      'mlid',
      'type',
      'title',
      'uid',
      'created',
      'changed',
      'description',
      'settings',
    )
    );
    foreach ($tables['map_layer'] as $record) {
      $query->values(preg_replace('/\n/', '', $record));
    }
    $query->execute();

    $query = db_insert('field_data_map_countries')->fields(array(
      'entity_type',
      'bundle',
      'deleted',
      'entity_id',
      'revision_id',
      'language',
      'delta',
      'map_countries_value',
      'map_countries_format',
    )
    );
    foreach ($tables['field_data_map_countries'] as $record) {
      $query->values($record);
    }
    $query->execute();

    $query = db_insert('field_data_map_country_list')->fields(array(
      'entity_type',
      'bundle',
      'deleted',
      'entity_id',
      'revision_id',
      'language',
      'delta',
      'map_country_list_value',
      'map_country_list_format',
    )
    );
    foreach ($tables['field_data_map_country_list'] as $record) {
      $query->values(preg_replace('/\n/', '', $record));
    }
    $query->execute();

    $query = db_insert('field_data_map_csv')->fields(array(
      'entity_type',
      'bundle',
      'deleted',
      'entity_id',
      'revision_id',
      'language',
      'delta',
      'map_csv_value',
      'map_csv_format',
    )
    );
    foreach ($tables['field_data_map_csv'] as $record) {
      $query->values($record);
    }
    $query->execute();

    $query = db_insert('field_data_map_layers')->fields(array(
      'entity_type',
      'bundle',
      'deleted',
      'entity_id',
      'revision_id',
      'language',
      'delta',
      'map_layers_target_id',
    )
    );
    foreach ($tables['field_data_map_layers'] as $record) {
      $query->values($record);
    }
    $query->execute();

    $query = db_insert('field_data_map_url')->fields(array(
      'entity_type',
      'bundle',
      'deleted',
      'entity_id',
      'revision_id',
      'language',
      'delta',
      'map_url_url',
      'map_url_title',
      'map_url_attributes',
    )
    );
    foreach ($tables['field_data_map_url'] as $record) {
      $query->values($record);
    }
    $query->execute();

    $query = db_insert('field_revision_map_countries')->fields(array(
      'entity_type',
      'bundle',
      'deleted',
      'entity_id',
      'revision_id',
      'language',
      'delta',
      'map_countries_value',
      'map_countries_format',
    )
    );
    foreach ($tables['field_revision_map_countries'] as $record) {
      $query->values($record);
    }
    $query->execute();

    $query = db_insert('field_revision_map_country_list')->fields(array(
      'entity_type',
      'bundle',
      'deleted',
      'entity_id',
      'revision_id',
      'language',
      'delta',
      'map_country_list_value',
      'map_country_list_format',
    )
    );
    foreach ($tables['field_revision_map_country_list'] as $record) {
      $query->values(preg_replace('/\n/', '', $record));
    }
    $query->execute();

    $query = db_insert('field_revision_map_csv')->fields(array(
      'entity_type',
      'bundle',
      'deleted',
      'entity_id',
      'revision_id',
      'language',
      'delta',
      'map_csv_value',
      'map_csv_format',
    )
    );
    foreach ($tables['field_revision_map_csv'] as $record) {
      $query->values($record);
    }
    $query->execute();

    $query = db_insert('field_revision_map_layers')->fields(array(
      'entity_type',
      'bundle',
      'deleted',
      'entity_id',
      'revision_id',
      'language',
      'delta',
      'map_layers_target_id',
    )
    );
    foreach ($tables['field_revision_map_layers'] as $record) {
      $query->values($record);
    }
    $query->execute();

    $query = db_insert('field_revision_map_url')->fields(array(
      'entity_type',
      'bundle',
      'deleted',
      'entity_id',
      'revision_id',
      'language',
      'delta',
      'map_url_url',
      'map_url_title',
      'map_url_attributes',
    )
    );
    foreach ($tables['field_revision_map_url'] as $record) {
      $query->values($record);
    }
    $query->execute();

    echo 'Done!' . "\n";
  }
  else {
    echo 'Import failed. Check ALL tables have been created and are empty.' . "\n";
    print_r($checks);
  }
}
