/**
 * @file
 * Provides JavaScript for map form elements.
 */

(function ($) {

  /**
   * Provides a help text for the height field.
   *
   * Helps choosing the right height for a map.
   */
  Drupal.behaviors.dag_maxlength_title_field = {
    attach: function (context, settings) {

      var min_height = Drupal.settings.map_height_form.min_height;
      var label = Drupal.settings.map_height_form.label;
      var warning = Drupal.settings.map_height_form.warning;
      var displayed_label = label;
      var height_obj = $('input[name="height"]');

      $('#min-height-label').html(displayed_label);
      height_obj.keyup(function () {
        var height = $(this).val();
        if (height < min_height) {
          displayed_label = warning + ' ' + label;
        }
        else {
          displayed_label = label;
        }
        $('#min-height-label').html(displayed_label);
      });
    }
  }
})(jQuery);
