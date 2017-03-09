(function ($) {
 
  // After page reload (without Ajax).
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

  /* 
    Without page reload (with Ajax and Exposed Filters). 
    Map must be displayed as Node in a Block or anyway out of the View.
  */
  $(document).on('change', '#edit-field-bpcountry-tid', function(){
    
    var countryPre = $('#edit-field-bpcountry-tid :selected').text().toLowerCase();
    var country = countryPre.replace(/\s/g, '-');
    var id = $('#edit-field-bpcountry-tid :selected').val();

    if (id != 'All') {
      L.custom.mapEventTarget(country);
    }

  });
  
})(jQuery);