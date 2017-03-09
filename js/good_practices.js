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
        {ecwctid: '74023', isoCode: 'BE', name: 'belgium'},
        {ecwctid: '74025', isoCode: 'BG', name: 'bulgaria'},
        {ecwctid: '74028', isoCode: 'CZ', name: 'czech republic'},
        {ecwctid: '74029', isoCode: 'DK', name: 'denmark'},
        {ecwctid: '74033', isoCode: 'DE', name: 'germany'},
        {ecwctid: '74030', isoCode: 'EE', name: 'estonia'},
        {ecwctid: '74037', isoCode: 'IE', name: 'ireland'},
        {ecwctid: '74034', isoCode: 'EL', name: 'greece'},
        {ecwctid: '74056', isoCode: 'ES', name: 'spain'},
        {ecwctid: '74032', isoCode: 'FR', name: 'france'},
        {ecwctid: '74026', isoCode: 'HR', name: 'croatia'},
        {ecwctid: '74038', isoCode: 'IT', name: 'italy'},
        {ecwctid: '74027', isoCode: 'CY', name: 'cyprus'},
        {ecwctid: '74039', isoCode: 'LV', name: 'latvia'},
        {ecwctid: '74041', isoCode: 'LT', name: 'lithuania'},
        {ecwctid: '74042', isoCode: 'LU', name: 'luxembourg'},
        {ecwctid: '74035', isoCode: 'HU', name: 'hungary'},
        {ecwctid: '74043', isoCode: 'MT', name: 'malta'},
        {ecwctid: '74046', isoCode: 'NL', name: 'netherlands'},
        {ecwctid: '74021', isoCode: 'AT', name: 'austria'},
        {ecwctid: '74048', isoCode: 'PL', name: 'poland'},
        {ecwctid: '74049', isoCode: 'PT', name: 'portugal'},
        {ecwctid: '74050', isoCode: 'RO', name: 'romania'},
        {ecwctid: '74055', isoCode: 'SI', name: 'slovenia'},
        {ecwctid: '74054', isoCode: 'SK', name: 'slovakia'},
        {ecwctid: '74031', isoCode: 'FI', name: 'finland'},
        {ecwctid: '74057', isoCode: 'SE', name: 'sweden'},
        {ecwctid: '74060', isoCode: 'UK', name: 'united-kingdom'}
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
        this.country_code = this.getCountryInfo(this.country,2);
        
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
    //Get country name or iso code based in list above
    getCountryInfo: function(value, type){
        for (var country in this.countriesMapping){
            if(this.countriesMapping[country].isoCode == value && type == 1)
                return this.countriesMapping[country].name;
            if(this.countriesMapping[country].name == value && type == 2)
                return this.countriesMapping[country].isoCode;
        }
    },
    getData:function(country_id){
        var self = this;        
        var req = new XMLHttpRequest();
        var country = this.getCountryInfo(country_id,1);   
        var url = this.baseSourceURL + country;
        req.open('GET', url, true);
        req.onreadystatechange = function (aEvt) {
            if (req.readyState == 4){
                if(req.status == 200){
                    var json = JSON.parse(req.responseText);
                    console.log(json);
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
        var selcountries = [];
            selcountries['BE'] = '74023';
            selcountries['BG'] = '74025';
            selcountries['CZ'] = '74028';
            selcountries['DK'] = '74029';
            selcountries['DE'] = '74033';
            selcountries['EE'] = '74030';
            selcountries['IE'] = '74037';
            selcountries['EL'] = '74034';
            selcountries['ES'] = '74056';
            selcountries['FR'] = '74032';
            selcountries['HR'] = '74026';
            selcountries['IT'] = '74038';
            selcountries['CY'] = '74027';
            selcountries['LV'] = '74039';
            selcountries['LT'] = '74041';
            selcountries['LU'] = '74042';
            selcountries['HU'] = '74035';
            selcountries['MT'] = '74043';
            selcountries['NL'] = '74046';
            selcountries['AT'] = '74021';
            selcountries['PL'] = '74048';
            selcountries['PT'] = '74049';
            selcountries['RO'] = '74050';
            selcountries['SI'] = '74055';
            selcountries['SK'] = '74054';
            selcountries['FI'] = '74031';
            selcountries['SE'] = '74057';
            selcountries['UK'] = '74060';

        layer.on("click", function(e){
            var element = document.getElementById('edit-field-bpcountry-tid');
            element.value = selcountries[layer.feature.properties.CNTR_ID];
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
       var country_code = this.getCountryInfo(country_name,2);
       var self = this;
       L.custom.map.eachLayer( function (e){
           if (e.feature){
               if (e.feature.properties.STAT_LEVL_ == 0 && e.feature.properties.CNTR_ID == country_code)
                   self.zoomToFeature(e)
           }
       });
   }
}