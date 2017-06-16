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
    foreach (entity_get_info() as $key => $info) {
      if ($view->base_table == $info['base table']){
        $this->entity_type = $key;
        $this->entity_info = $info;
        break;
      }
    }
  }

  /**
   * Sets default options.
   */
  public function option_definition() {
    $options = parent::option_definition();
    return $options;
  }

  /**
   * Build options form.
   *
   * @param $form
   * @param $form_state
   */
  public function option_form(&$form, &$form_state) {
    parent::options_form($form, $form_state);
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