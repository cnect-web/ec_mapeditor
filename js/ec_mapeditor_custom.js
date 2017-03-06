(function ($) {

  $(document).ready(function() {
    var countryPre = $('#edit-field-bpcountry-tid :selected').text().toLowerCase();
    var country = countryPre.replace(/\s/g, '-');
    var id = $('#edit-field-bpcountry-tid :selected').val();

    setTimeout(function() { 
      L.custom.mapEventTarget(country); 
    }, 500);

    if (id != 'All') {
      L.custom.mapEventTarget(country);
    }
  });
  
})(jQuery);