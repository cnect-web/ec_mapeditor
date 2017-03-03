(function ($) {

  $(document).ready(function() {
    var country = $('#edit-field-bpcountry-tid :selected').text().toLowerCase();
    var id = $('#edit-field-bpcountry-tid :selected').val();

    setTimeout(function() { 
      L.custom.mapEventTarget(country); 
    }, 500);

    if (id != 'All') {
      L.custom.mapEventTarget(country);
    }
  });
  
})(jQuery);