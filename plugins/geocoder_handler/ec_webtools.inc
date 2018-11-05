<?php

/**
 * @file
 * Plugin to provide a ec_webtools geocoder.
 */

/**
 * Plugins are described by creating a $plugin array which will be used
 * by the system that includes this file.
 */
$plugin = array(
  'title' => t("EC Webtools Geocoder"),
  'description' => t('Geocodes via EC Webtools geocoder'),
  'callback' => 'geocoder_ec_webtools',
  'field_types' => array('text', 'text_long', 'addressfield', 'location', 'text_with_summary', 'computed', 'taxonomy_term_reference'),
  'field_callback' => 'geocoder_ec_webtools_field',
  'settings_callback' => 'geocoder_ec_webtools_form',
  'terms_of_service' => 'https://webgate.ec.europa.eu/fpfis/wikis/pages/viewpage.action?pageId=107940012',
);

/**
 * Process Markup
 */
function geocoder_ec_webtools($address, $options = array()) {
  try {
    geophp_load();

    $query = array('address' => $address);

    // Build the URL.
    $url = url("http://europa.eu/webtools/rest/geocoding/", array(
      'query' => $query,
    ));

    // Send the request.
    $result = drupal_http_request($url);
    $delay_trigger = TRUE;

    if (isset($result->error)) {
      $args = array(
        '@code' => $result->code,
        '@error' => $result->error,
      );
      $msg = t('HTTP request to Webtools Geocoder API failed.\nCode: @code\nError: @error', $args);
      throw new Exception($msg, WATCHDOG_ERROR);
    }

    $data = json_decode($result->data);

    if ($data->addressesCount == 0) {
      $args = array('@status' => $data->status, '@address' => $address);
      $msg = t('Webtools Geocoder API returned zero results on @address status.\nStatus: @status', $args);
      throw new Exception($msg, WATCHDOG_NOTICE);
    }
    elseif (isset ($data->geocodingRequestsCollection[0]->responseMessage) && $data->geocodingRequestsCollection[0]->responseMessage != 'OK') {
      $args = array('@status' => $data->geocodingRequestsCollection[0]->responseMessage);
      $msg = t('Webtools Geocoder API returned bad status.\nStatus: @status', $args);
      throw new Exception($msg, WATCHDOG_WARNING);
    }

    $geometries = array();

    if (isset($data->geocodingRequestsCollection[0]->result->features[0]->geometry->coordinates)) {
      $item = $data->geocodingRequestsCollection[0]->result->features[0]->geometry->coordinates;
      $geom = new Point($item[0], $item[1]);
      $geometries[] = $geom;
    }

    if (empty($geometries)) {
      return;
    }

    // Check if we should return all results as a compound geometry
    if (isset($options['all_results'])) {
      if ($options['all_results']) {
        return geoPHP::geometryReduce($geometries);
      }
    }
    // The canonical geometry is the first result (best guess)
    $geometry = array_shift($geometries);

    // If there are any other geometries, these are auxiliary geometries that represent "alternatives"
    if (count($geometries)) {
      $geometry->data['geocoder_alternatives'] = $geometries;
    }

    return $geometry;

  } catch (Exception $e) {
    // Just rethrow the exception, the geocoder widget handles it.
    throw $e;
  }
}

function geocoder_ec_webtools_field($field, $field_item, $options = array()) {
  if ($field['type'] == 'text' || $field['type'] == 'text_long' || $field['type'] == 'text_with_summary' || $field['type'] == 'computed') {
    return geocoder_ec_webtools($field_item['value'], $options);
  }
  if ($field['type'] == 'addressfield' && module_exists('addressfield') && !addressfield_field_is_empty($field_item, $field)) {
    $address = geocoder_widget_parse_addressfield($field_item);
    return geocoder_ec_webtools($address, $options);
  }
  if ($field['type'] == 'location') {
    $address = geocoder_widget_parse_locationfield($field_item);
    return geocoder_ec_webtools($address, $options);
  }
  if ($field['type'] == 'taxonomy_term_reference') {
    $term = taxonomy_term_load($field_item['tid']);
    return geocoder_ec_webtools($term->name, $options);
  }
}

function geocoder_ec_webtools_form($default_values = array()) {
  $form = array();

  return $form;
}