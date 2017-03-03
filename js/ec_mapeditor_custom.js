(function ($) {
  
  /*
    It seems work ...
  */
  /*$('#edit-field-bpcountry-tid').change(function() {
    var country = $('#edit-field-bpcountry-tid :selected').text().toLowerCase();
    var id = $('#edit-field-bpcountry-tid :selected').val();
    if (id != 'All') {
      L.custom.mapEventTarget(country);
    }
  });*/


  $(document).ready(function(){

    var country = $('#edit-field-bpcountry-tid :selected').text().toLowerCase();
    var id = $('#edit-field-bpcountry-tid :selected').val();

    setTimeout(function(){ L.custom.mapEventTarget(country); }, 500);

    if (id != 'All') {
      L.custom.mapEventTarget(country);
    }
  });

  /**
   ... Useful Function but maybe not necessary ...

  var id = getParameterByName('field_bpcountry_tid');
  function getParameterByName(name, url) {  
    if (!url) { url = window.location.href; }
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
    results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  }
  */

})(jQuery);