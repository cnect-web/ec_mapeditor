<?php

/**
 * @file
 * Extension of the Views Plugin Style for Mapeditor Map.
 *
 * Adapted for the Leaflet Views module.
 */

class ec_mapeditor_views_plugin_style extends views_plugin_style {
  /**
   * @param $view
   * @param $display
   * @param null $options
   */
  public function init(&$view, &$display, $options = NULL ) {
    parent::init($view, $display, $options);
    $this->entity_type = $this->options['entity_type'];
    $this->entity_info = entity_get_info($this->entity_type);
    // Fallback for views that do not have entity_type set, for example
    // because the view was created before this option got introduced.
    if (empty($this->entity_type)) {
      $info = $this->getEntityInfoByTable($view->base_table);
      if (!empty($info)) {
        $this->entity_type = $info['entity type'];
        $this->entity_info = $info;
      }
    }
  }

  /**
   * Gets entity information based on the entity table passed in.
   *
   * @param string $table
   *   Table name.
   *
   * @return array
   *   Returns the entity_info array.
   */
  function getEntityInfoByTable($table) {
    $info = entity_get_info();
    foreach($info as $entity_type => &$entity_info) {
      if($entity_info['base table'] == $table) {
        $entity_info['entity type'] = $entity_type;
        return $entity_info;
      }
    }
    return array();
  }

  /**
   * Sets default options.
   */
  public function option_definition() {
    $options = parent::option_definition();

    $options['entity_type'] = array('default' => '');
    $options['data_source'] = array('default' => '');
    $options['name_field'] = array('default' => '');
    $options['description_field'] = array('default' => '');
    $options['view_mode'] = array('default' => 'full');
    $options['map'] = array('default' => '');
    $options['height'] = array('default' => '400');
    $options['hide_empty'] = array('default' => '');
    $options['popup']['contains'] = array(
      'show' => array('default' => ''),
      'text' => array('default' => ''),
    );
    $options['zoom']['contains'] = array(
      'initialZoom' => array('default' => ''),
      'minZoom' => array('default' => 0),
      'maxZoom' => array('default' => 18),
      'scrollWheelZoom' => array('default' => 1),
    );
    $options['icon']['contains'] = array(
      'iconType' => array('default' => 'marker'),
      'iconUrl' => array('default' => ''),
      'shadowUrl' => array('default' => ''),
      'iconSize' => array(
        'contains' => array(
          'x' => array('default' => ''),
          'y' => array('default' => ''),
        )),
      'iconAnchor' => array(
        'contains' => array(
          'x' => array('default' => ''),
          'y' => array('default' => ''),
        )),
      'shadowAnchor' => array(
        'contains' => array(
          'x' => array('default' => ''),
          'y' => array('default' => ''),
        )),
      'popupAnchor' => array(
        'contains' => array(
          'x' => array('default' => ''),
          'y' => array('default' => ''),
        )),
      'html' => array('default' => ''),
      'iconImageStyle' => array('default' => ''),
      'htmlClass' => array('default' => ''),
    );
    $options['vector_display']['contains'] = array(
      'stroke_override' => array('default' => 0),
      'stroke' => array('default' => 1),
      'color' => array('default' => ''),
      'weight' => array('default' => ''),
      'opacity' => array('default' => ''),
      'dashArray' => array('default' => ''),
      'fill' => array('default' => 1),
      'fillColor' => array('default' => ''),
      'fillOpacity' => array('default' => ''),
      'clickable' => array('default' => 1),
    );

    return $options;
  }

  /**
   * Build options form.
   *
   * @param $form
   * @param $form_state
   */
  public function options_form(&$form, &$form_state) {
    parent::options_form($form, $form_state);

    // Get list of fields in this view & flag available geodata fields:
    $handlers = $this->display->handler->get_handlers('field');

    $fields = array();
    $fields_data = array();
    foreach ($handlers as $field_id => $handler) {
      $fields[$field_id] = $handler->ui_name();

      if (!empty($handler->field_info['type']) && $handler->field_info['type'] == 'geofield') {
        $fields_data[$field_id] = $handler->ui_name();
      }
    }

    // Check whether we have a geofield we can work with:
    if (!count($fields_data)) {
      $form['error'] = array(
        '#markup' => t('Please add at least one geofield to the view'),
      );
      return;
    }

    // Get available entity types for selection.
    $default_type = empty($this->options['entity_type']) ? '' : $this->options['entity_type'];
    $entity_types = array('');
    foreach (entity_get_info() as $key => $info) {
      $entity_types[$key] = $info['label'];
      if ($this->view->base_table == $info['base table']) {
        // If this entity type matches the view base table, use it.
        $default_type = $key;
      }
    }

    // Entity type selection.
    $form['entity_type'] = array(
      '#type' => 'select',
      '#title' => t('Entity Type'),
      '#description' => t('Which type of entity is this view based on?'),
      '#options' => $entity_types,
      '#default_value' => $default_type,
      '#required' => TRUE,
    );

    // Only allow users to choose the entity type if it cannot be detected.
    if (!empty($default_type)) {
      $form['entity_type']['#access'] = FALSE;
    }

    // Map preset.
    $form['data_source'] = array(
      '#type' => 'select',
      '#title' => t('Data Source'),
      '#description' => t('Which field contains geodata?'),
      '#options' => $fields_data,
      '#default_value' => $this->options['data_source'],
      '#required' => TRUE,
    );

    // Name field.
    $form['name_field'] = array(
      '#type' => 'select',
      '#title' => t('Title Field'),
      '#description' => t('Choose the field which will appear as a title on tooltips.'),
      // '#options' => $fields,
      '#options' => array_merge(array('' => ''), $fields),
      '#default_value' => $this->options['name_field'],
    );

    $desc_options = array_merge(array(
      '' => '',
    ), $fields);

    // Add an option to render the entire entity using a view mode.
    if (isset($this->entity_type)) {
      $desc_options += array(
        '#rendered_entity' => '<' . t('!entity entity', array('!entity' => $this->entity_type)) . '>',
      );
    }

    $form['description_field'] = array(
      '#type' => 'select',
      '#title' => t('Description Content'),
      '#description' => t('Choose the field or rendering method which will appear as a description on tooltips or popups.'),
      '#required' => FALSE,
      '#options' => $desc_options,
      '#default_value' => $this->options['description_field'],
    );

    // Taken from openlayers_views_style_data::options_form().
    // Create view mode options:
    if (isset($this->entity_type)) {

      // Get the labels (human readable) of the view modes:
      $view_mode_options = array();
      foreach ($this->entity_info['view modes'] as $key => $view_mode) {
        $view_mode_options[$key] = $view_mode['label'];
      }

      // Output the form:
      $form['view_mode'] = array(
        '#type' => 'select',
        '#title' => t('View mode'),
        '#description' => t('View modes are ways of displaying entities.'),
        '#options' => $view_mode_options,
        '#default_value' => !empty($this->options['view_mode']) ? $this->options['view_mode'] : 'full',
        '#states' => array(
          'visible' => array(
            ':input[name="style_options[description_field]"]' => array('value' => '#rendered_entity'),
          ),
        ),
      );
    }

    // Choose a map preset:
    $map_options = array();
    /*foreach (leaflet_map_get_info() as $key => $map) {
      $map_options[$key] = t('@label', array('@label' => $map['label']));
    }*/

    /*$form['map'] = array(
      '#title' => t('Map'),
      '#type' => 'select',
      '#options' => $map_options,
      '#default_value' => $this->options['map'] ? $this->options['map'] : '',
      '#required' => TRUE,
    );*/

    $form['height'] = array(
      '#title' => t('Map height'),
      '#type' => 'textfield',
      '#field_suffix' => t('px'),
      '#size' => 4,
      '#default_value' => $this->options['height'],
      '#required' => FALSE,
    );

    $form['hide_empty'] = array(
      '#title' => t('Hide empty'),
      '#type' => 'checkbox',
      '#description' => t('Hide the Leaflet map if there are no results to display.'),
      '#default_value' => isset($this->options['hide_empty']) ? $this->options['hide_empty'] : TRUE,
    );
    /*
    $form['zoom'] = leaflet_form_elements('zoom', $this->options);
    $form['icon'] = leaflet_form_elements('icon', $this->options, array('path' => 'style_options', 'fields' => $fields));
    $form['vector_display'] = leaflet_form_elements('vector_display', $this->options, array('path' => 'style_options'));
    $form['tokens'] = leaflet_form_elements('tokens', $this->options, array('weight' => 998, 'entity_type' => $this->entity_type));*/
  }

  /**
   * Renders view.
   */
  public function render() {
      
    $settings = new MapSettings();
    $map = new MapBuild($settings->settings);

    $ec_mapeditor_js = base_path() . drupal_get_path('module', 'ec_mapeditor') . "/js/map.js?v=" . rand(0, 33333);
    $custom_js[] = $ec_mapeditor_js;
    $map->setMoreCustomJs($custom_js);
    $elements[0]['map'] = $map->build;
    
    return $elements;
  }
}