L.custom = 
{
    map:null,
    features: [],
    layers: [],
    categoryLayers:[],
    checkboxes:null,
    //source JSON URL
    baseSourceURL: "http://s-cnect-w4y02.cnect.cec.eu.int/digital-agenda/platform/en/ec-mapeditor-data-",
    //country: document.location.href.split("/")[document.location.href.split("/").length-1],
    country: "france",
    country_code: "",
    countriesMapping:[
        {isoCode: 'BE', name: 'belgium'},
        {isoCode: 'BG', name: 'bulgaria'},
        {isoCode: 'CZ', name: 'czech republic'},
        {isoCode: 'DK', name: 'denmark'},
        {isoCode: 'DE', name: 'germany'},
        {isoCode: 'EE', name: 'estonia'},
        {isoCode: 'IE', name: 'ireland'},
        {isoCode: 'EL', name: 'greece'},
        {isoCode: 'ES', name: 'spain'},
        {isoCode: 'FR', name: 'france'},
        {isoCode: 'HR', name: 'croatia'},
        {isoCode: 'IT', name: 'italy'},
        {isoCode: 'CY', name: 'cyprus'},
        {isoCode: 'LV', name: 'latvia'},
        {isoCode: 'LT', name: 'lithuania'},
        {isoCode: 'LU', name: 'luxembourg'},
        {isoCode: 'HU', name: 'hungary'},
        {isoCode: 'MT', name: 'malta'},
        {isoCode: 'NL', name: 'netherlands'},
        {isoCode: 'AT', name: 'austria'},
        {isoCode: 'PL', name: 'poland'},
        {isoCode: 'PT', name: 'portugal'},
        {isoCode: 'RO', name: 'romania'},
        {isoCode: 'SI', name: 'slovenia'},
        {isoCode: 'SK', name: 'slovakia'},
        {isoCode: 'FI', name: 'finland'},
        {isoCode: 'SE', name: 'sweden'},
        {isoCode: 'UK', name: 'united-kingdom'}
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
            if(this.countriesMapping[country].name.toLowerCase() == value.toLowerCase() && type == 2)
                return this.countriesMapping[country].isoCode;
        }
    },
    getData:function(){
        var self = this;        
        var req = new XMLHttpRequest();
        var url = this.baseSourceURL + this.country_code;
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
        L.wt.markers(data,options).addTo(this.map);
    },    
    //Check which country should zoom and load
    onEachNutsFeature:function(feature, layer){
        if (layer.feature.properties.NUTS_ID == this.country_code){
            this.zoomToFeature(layer)
        }
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
        this.getData();
    }
}