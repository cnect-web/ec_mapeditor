/**
 * @file
 * Javascript for DAE
 */

(function ($) {
  
  Drupal.behaviors.ecmapeditor = {};

  Drupal.behaviors.ecmapeditor.triggerAjaxMapToView = function(slector) {

    var filter = $('#edit-field-bpcountry-tid :selected').val();
    
    if (filter != 'All') {
      $('#views-exposed-form-best-practices-page select[name="field_bpcountry_tid"]').trigger('change');
      $('#views-exposed-form-best-practices-page button.form-submit').trigger('click');
      return false;
    }

  }


  Drupal.behaviors.triggerAjaxViewToMap = {

    attach: function(context, settings) {
      
      $(document).on('change', '#edit-field-bpcountry-tid', function(){
    
        var countryPre = $('#edit-field-bpcountry-tid :selected').text().toLowerCase();
        var country = countryPre.replace(/\s/g, '-');
        var id = $('#edit-field-bpcountry-tid :selected').val();

        if (id != 'All') {
          L.custom.mapEventTarget(country);
        }
      });
    }
  }

})(jQuery);
