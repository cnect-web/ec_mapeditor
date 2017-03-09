L.custom = 
{
    map:null,
    features: [],
    layers: [],
    pinLayers: null,
    checkboxes:null,
    //source JSON URL
    baseSourceURL: "good-practices-json/",    
    countriesMapping:[
        {isoCode: 'BE', name: 'belgium', drupalid: '74023'},
        {isoCode: 'BG', name: 'bulgaria', drupalid: '74025'},
        {isoCode: 'CZ', name: 'czech republic', drupalid: '74028'},
        {isoCode: 'DK', name: 'denmark', drupalid: '74029'},
        {isoCode: 'DE', name: 'germany', drupalid: '74033'},
        {isoCode: 'EE', name: 'estonia', drupalid: '74030'},
        {isoCode: 'IE', name: 'ireland', drupalid: '74037'},
        {isoCode: 'EL', name: 'greece', drupalid: '74034'},
        {isoCode: 'ES', name: 'spain', drupalid: '74056'},
        {isoCode: 'FR', name: 'france', drupalid: '74032'},
        {isoCode: 'HR', name: 'croatia', drupalid: '74026'},
        {isoCode: 'IT', name: 'italy', drupalid: '74038'},
        {isoCode: 'CY', name: 'cyprus', drupalid: '74027'},
        {isoCode: 'LV', name: 'latvia', drupalid: '74039'},
        {isoCode: 'LT', name: 'lithuania', drupalid: '74041'},
        {isoCode: 'LU', name: 'luxembourg', drupalid: '74042'},
        {isoCode: 'HU', name: 'hungary', drupalid: '74035'},
        {isoCode: 'MT', name: 'malta', drupalid: '74043'},
        {isoCode: 'NL', name: 'netherlands', drupalid: '74046'},
        {isoCode: 'AT', name: 'austria', drupalid: '74021'},
        {isoCode: 'PL', name: 'poland', drupalid: '74048'},
        {isoCode: 'PT', name: 'portugal', drupalid: '74049'},
        {isoCode: 'RO', name: 'romania', drupalid: '74050'},
        {isoCode: 'SI', name: 'slovenia', drupalid: '74055'},
        {isoCode: 'SK', name: 'slovakia', drupalid: '74054'},
        {isoCode: 'FI', name: 'finland', drupalid: '74031'},
        {isoCode: 'SE', name: 'sweden', drupalid: '74057'},
        {isoCode: 'UK', name: 'united-kingdom', drupalid: '74060'}
    ],
    //Categories 
    typeCategories: [ {"name":"winner", "color":"pink", label: "Award winners"}, {"name":"submitted", "color":"turquoise", label: "Award winners"}, {"name":"not-submitted", "color":"blue", label: "Award winners"}],
    countryNutsLayer: null,
    //Layer with the EU28 countries
    countriesEU28: L.wt.countries([{"level":0,"countries":["EU28"]}], {
        insets :false,
        style: function( feature ) {
            return {
                color: "#0065B1",
                dashArray: 0,
                fillColor: "#C8E9F2",
                fillOpacity: 0.9,
                opacity: 1,
                smoothFactor: 1.5,
                weight: 1
            }
        },onEachFeature: function(feature, layer) { L.custom.onEachNutsFeature(feature, layer)},
        label: true
    }),
    //Layer with the countries that have borders with EU28
    countriesOutsideEU28: L.wt.countries([{"level":0,"countries":["CH","NO","RU","MK","AL","ME","RS","BA","TR","UA","BY","MA","LI"]}],{
        insets :false,
        style: function( feature ) {
            return {
                color: "#0065B1",
                dashArray: 0,
                fillColor: "#C8E9F2",
                fillOpacity: 0.9,
                opacity: 1,
                smoothFactor: 1.5,
                weight: 1
            }
        },label: false
    }),
    init: function(obj, params){ 
        var self = this;
        this.mapDomNode = $wt["map"].onRemove();
        //Create map
        this.map = L.map(obj, {
            "center": [48, 9], 
            "zoom": 4, 
            "minZoom": 3,
            "maxZoom": 10,
            "dragging": true,
            "touchZoom": true,
            "scrollWheelZoom": true
        }).on("zoomend", function(e) {self.handleMapZoom(e)});

        //Add layers to the map: default (OSM), Gray background, EU28Countries
        L.wt.tileLayer().addTo(this.map);
        L.wt.tileLayer("graybg").addTo(this.map);
        this.countriesEU28.addTo(this.map);
        this.country_code = this.getCountryInfo(this.country,2,1);
    },
    //Trigger actions after map as zoomed
    handleMapZoom: function(e) { 
        if(e.target._zoom > 8 && !this.map.hasLayer(this.countriesOutsideEU28)){
            this.map.removeLayer(this.countriesEU28);
            this.countriesOutsideEU28.addTo(this.map);
        }else if(e.target._zoom <= 8 && this.map.hasLayer(this.countriesOutsideEU28)){
            this.map.removeLayer(this.countriesOutsideEU28);
            this.countriesEU28.addTo(this.map);
        }
        //Bring Nuts layer to top in case it's active
        if(this.countryNutsLayer != null)
            this.countryNutsLayer.bringToFront();
    },    
    //Get country name, iso code or drupal id based in list above
    getCountryInfo: function(value, inType, outType){
        for (var i in this.countriesMapping){
            var country = this.countriesMapping[i];
            if(country.isoCode == value && inType == 1)
                return outType == 1 ? country.isoCode : outType == 2 ? country.name : country.drupalid;
            if(country.name == value && inType == 2)
                return outType == 1 ? country.isoCode : outType == 2 ? country.name : country.drupalid;
            if(country.drupalid == value && inType == 3)
                return outType == 1 ? country.isoCode : outType == 2 ? country.name : country.drupalid;
        }
    },
    getData:function(country_id){
        var self = this;        
        var req = new XMLHttpRequest();
        var country = this.getCountryInfo(country_id,1,2);   
        var url = this.baseSourceURL + country;
        req.open('GET', url, true);
        req.onreadystatechange = function (aEvt) {
            if (req.readyState == 4){
                if(req.status == 200){
                    var json = JSON.parse(req.responseText);
                    self.addMarkersFromJson(json);
                } else{
                    //handle error
                }
            }
        };
        req.send(null);

        //To upadate page put here
    },
    addMarkersFromJson: function(json){
        var countryDataFeatures = json.features;
        var catFeatures = [];
        for(var j = 0; j < countryDataFeatures.length; j++){
            catFeatures[catFeatures.length] = countryDataFeatures[j];
        }
        var options = { 
            cluster: {
                radius: 120, // default 120
                small: 45,   // default 40
                medium: 55,  // default 50
                large: 65    // default 60
            },
            color:"blue",
            onEachFeature: function(feature,layer){
                layer.bindInfo("<h3>" + feature.properties.name + "</h3><p>" + feature.properties.description + "</p>");
            }
        }; 

        var data = {"type":"FeatureCollection","features":catFeatures};
        if (this.pinLayers != null) 
            this.map.removeLayer(this.pinLayers);
        this.pinLayers = L.wt.markers(data,options);
        this.pinLayers.addTo(this.map);
    },    
    //Check which country should zoom and load
    onEachNutsFeature:function(feature, layer){
        var self = this;
        layer.on("click", function(e){
            var element = document.getElementById('edit-field-bpcountry-tid');
            element.value = self.getCountryInfo(layer.feature.properties.CNTR_ID, 1, 3);
            L.custom.zoomToFeature(e.target);
            Drupal.behaviors.ecmapeditor.triggerAjaxMapToView();
        });
    },
    zoomToFeature:function(layer){
        if(!layer)
            return;

        // Resolve the bug for not displaying dom tom of France
        if(layer.feature.properties.CNTR_ID == "FR"){
            var currentZoom =  this.map.getZoom();
            this.map.setView([47,3], 6);
        }else{
            this.map.fitBounds(layer.getBounds());
        }

        if(this.countryNutsLayer != null)
            this.map.removeLayer(this.countryNutsLayer)

        this.countryNutsLayer = L.wt.countries([{"level":2,"countries":[layer.feature.properties.CNTR_ID]}],{
            insets :false,
            style: function(feature){
                return {
                    color: "#0065B1",
                    dashArray: 0,
                    fillColor: "#C8E9F2",
                    fillOpacity: 0,
                    opacity: 1,
                    smoothFactor: 1.5,
                    weight: 3
                }
            }
        }).addTo(this.map);
        this.getData(layer.feature.properties.CNTR_ID);
    },
    mapEventTarget: function(country_name){
       var country_code = this.getCountryInfo(country_name,2,1);
       var self = this;
       L.custom.map.eachLayer( function (e){
           if (e.feature){
               if (e.feature.properties.STAT_LEVL_ == 0 && e.feature.properties.CNTR_ID == country_code)
                   self.zoomToFeature(e)
           }
       });
   }
}

