/**
 * @file
 * Javascript for DAE.
 */
if (typeof Drupal.settings.map !== 'undefined') {
  
  var settings = Drupal.settings.map;
  //alert(settings.countriesMapping[0].name);
  var countriesMappingItems = '{"countriesMapping":[';
  var countriesArrayLength = settings.countriesMapping.length;
  
  for (var i = 0; i < countriesArrayLength; i++) {
    
    var isoCode   = settings.countriesMapping[i].isoCode;
    var name      = settings.countriesMapping[i].name;
    var drupalId  = settings.countriesMapping[i].drupalId;
    
    countriesMappingItems += '{"isoCode":"' + isoCode + '","name":"' + name + '","drupalid":"' + drupalId + '"}';
    
    if (i < (countriesArrayLength-1)) {
      countriesMappingItems += ', ';
    } else {
      countriesMappingItems += ']}';
    }
  }

  var mapping = 'undefined';
  if (typeof mapping !== 'undefined') {
    mapping = JSON.parse(countriesMappingItems);
  }

  L.custom = {
    map:null,
    currentCountryID:null,
    features: [],
    layers: [],
    pinLayers: null,
    checkboxes:null,
    loadingData : false,
    // Source JSON URL.
    baseSourceURL: settings.url,
    countriesMapping: mapping.countriesMapping,
    countryNutsLayer: null,
    countriesEU28: L.wt.countries([{"level":0,"countries":["EU28"]}], {
      insets :false,
      style: function(feature) {
        return {
          color: "#0065B1",
          dashArray: 0,
          fillColor: "#C8E9F2",
          fillOpacity: 0.9,
          opacity: 1,
          smoothFactor: 1.5,
          weight: 1
        }
      },onEachFeature: function(feature, layer) { L.custom.onEachNutsFeature(feature, layer)
      },
      label: true
    }),
    // Layer with the countries that have borders with EU28.
    countriesOutsideEU28: L.wt.countries([{"level":0,"countries":["CH","NO","RU","MK","AL","ME","RS","BA","TR","UA","BY","MA","LI"]}],{
      insets :false,
      style: function(feature) {
        return {
          color: "#0065B1",
          dashArray: 0,
          fillColor: "#C8E9F2",
          fillOpacity: 0,
          opacity: 1,
          smoothFactor: 1.5,
          weight: 1
        }
      },label: false
    }),
    init: function(obj, params){
      var self = this;
      // Create map.
      this.map = L.map(obj, {
        "center": [48, 9],
        "zoom": 4,
        "minZoom": 3,
        "maxZoom": 10,
        "dragging": true,
        "touchZoom": true,
        "scrollWheelZoom": true
        // Handle layer visibility according to zoom level.
      }).on("zoomend", function(e) {self.handleMapZoom(e)
      })
      // This is added here so that the new points are only displayed after zooom and pan has ended when zooming to country.
        .on("moveend", this.getData);

      // Add layers to the map: default (OSM), Gray background, EU28Countries.
      L.wt.tileLayer().addTo(this.map);
      L.wt.tileLayer("graybg").addTo(this.map);
      this.countriesEU28.addTo(this.map);
    },
    // Trigger actions after map as zoomed.
    handleMapZoom: function(e) {
      // Depending on zoom level, switch between layers.
      if (e.target._zoom > 8 && this.map.hasLayer(this.countriesEU28)) {
        this.map.removeLayer(this.countriesEU28);
        this.countriesOutsideEU28.addTo(this.map);
      }
      else if (e.target._zoom <= 8 && this.map.hasLayer(this.countriesOutsideEU28)) {
        this.map.removeLayer(this.countriesOutsideEU28);
        this.countriesEU28.addTo(this.map);
      }
      // Bring Nuts layer to top in case it's active.
      if (this.countryNutsLayer != null) {
        this.countryNutsLayer.bringToFront();
      }
    },
    // Get country name, iso code or drupal id based in the list above.
    getCountryInfo: function(value, inType, outType){
      for (var i in this.countriesMapping) {
        var country = this.countriesMapping[i];
        if (country.isoCode == value && inType == 1) {
          return outType == 1 ? country.isoCode : outType == 2 ? country.name : country.drupalid;
        }
        if (country.name == value && inType == 2) {
          return outType == 1 ? country.isoCode : outType == 2 ? country.name : country.drupalid;
        }
        if (country.drupalid == value && inType == 3) {
          return outType == 1 ? country.isoCode : outType == 2 ? country.name : country.drupalid;
        }
      }
    },
    // Get data for country.
    getData:function(){
      var self = L.custom;
      var country_id = self.currentCountryID;
      if (self.loadingData) {
        var req = new XMLHttpRequest();
        var country = self.getCountryInfo(country_id,1,2);
        var url = self.baseSourceURL + country;
        req.open('GET', url, true);
        req.onreadystatechange = function (aEvt) {
          if (req.readyState == 4) {
            if (req.status == 200) {
              var json = JSON.parse(req.responseText);
              self.addMarkersFromJson(json);
              self.loadingData = false;
            }
          }
        };
        req.send(null);
      }
    },
    // Build feature object to add to the map.
    addMarkersFromJson: function(json){
      var countryDataFeatures = json.features;
      var catFeatures = [];
      for (var j = 0; j < countryDataFeatures.length; j++) {
        catFeatures[catFeatures.length] = countryDataFeatures[j];
      }
      var options = {
        cluster: {
          // Default 120.
          radius: 120,
          // Default 40.
          small: 45,
          // Default 50.
          medium: 55,
          // Default 60.
          large: 65
        },
        color:"blue",
        onEachFeature: function(feature,layer){
          layer.bindInfo("<h3>" + feature.properties.name + "</h3><p>" + feature.properties.description + "</p>");
        }
      };

      var data = {"type":"FeatureCollection","features":catFeatures};
      this.pinLayers = L.wt.markers(data,options);
      this.pinLayers.addTo(this.map);
    },
    // Check which country should zoom and load.
    onEachNutsFeature:function(feature, layer){
      var self = this;
      layer.on("click", function(e){
        //var element = document.getElementById('edit-field-bpcountry-tid');
        //element.value = self.getCountryInfo(layer.feature.properties.CNTR_ID, 1, 3);
        console.log(e.target);
        L.custom.zoomToFeature(e.target);  
        // Trigger Drupal ajax call.
        //Drupal.behaviors.ecmapeditor.triggerAjaxMapToView();
      });
    },
    // Zoom to country and add points.
    zoomToFeature:function(layer){
      var self = this;
      this.currentCountryID = layer.feature.properties.CNTR_ID;
      this.loadingData = true;
      if (!layer) {
        return;
      }
      if (this.pinLayers != null) {
        this.map.removeLayer(self.pinLayers);
      }
      // Resolve the bug for not displaying dom tom of France.
      if (layer.feature.properties.CNTR_ID == "FR") {
        var currentZoom = this.map.getZoom();
        this.map.setView([47,3], 5);
      }
      else {
        this.map.fitBounds(layer.getBounds());
      }

      if (this.countryNutsLayer != null) {
        this.map.removeLayer(this.countryNutsLayer)

        this.countryNutsLayer = L.wt.countries([{"level":0,"countries":[layer.feature.properties.CNTR_ID]}],{
          insets :false,
          style: function(feature){
            return {
              color: "#0065B1",
              dashArray: 0,
              fillColor: "#C8E9F2",
              fillOpacity: 0,
              opacity: 1,
              smoothFactor: 1.5,
              weight: 2.5
            }
          }
        }).addTo(this.map);
      }
    },
    mapEventTarget: function(country_name){
      if (!this.loadingData) {
        var country_code = this.getCountryInfo(country_name,2,1);
        var self = this;
        L.custom.countriesEU28.eachLayer(function (e){
          if (e.feature) {
            if (e.feature.properties.STAT_LEVL_ == 0 && e.feature.properties.CNTR_ID == country_code) {
              self.zoomToFeature(e)
            }
          }
        });
      }
    }
  }
}
