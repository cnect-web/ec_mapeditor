L.custom = 
{
    map:null,
    features: [],
    layers: [],
    categoryLayers:[],
    checkboxes:null,
    //source JSON URL
    baseSourceURL: "http://s-cnect-w4y02.cnect.cec.eu.int/digital-agenda/platform/en/ec-mapeditor-data-",
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
        
        //Initialize sidebar
        this.createSidebar();
        this.initCheckbox();
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
    //Create side bar to add 
    createSidebar:function(){
        var categories = this.typeCategories;
        var checkboxArray = [];
        for(var i = 0; i < categories.length; i++){
            var options = { 
                cluster: true,
                color: categories[i].color,
                onEachFeature: function(feature,layer) {
                    layer.bindPopup( "<p><b>"+feature.properties.name+"</b></p>"+ feature.properties.description );
                }
            }; 

            if(!this.categoryLayers[categories[i].name]) 
                this.categoryLayers[categories[i].name] = L.wt.markers({"type":"FeatureCollection","features":[]},options).addTo(this.map);
        
            checkboxArray[checkboxArray.length] = {"label" : categories[i].name, "layer": this.categoryLayers[categories[i].name]};
        }

        var myLayerControl = [{ 
            "checkbox" : checkboxArray,
            "label" : "Broadband initiatives"
        }];
 
        // Adding your custom control 
        // Sidebar default (home, zoomin, zoomout, fullscreen and print) 2 others to activate (layers and more)
       this.sidebar =  L.wt.sidebar({
            "home":{
                "tooltip" : "Home"
            },"layers" : {
                "tooltip" : "List of layers", 
                "panel" : myLayerControl,
                "display": false
            },"zoomin" : {
                "tooltip" : "Click to zoom in"
            },"zoomout" : {
                "tooltip" : "Click to zoom out"
            },"fullscreen": {
                "tooltip" : "Fullscreen"
            },"print" : {
                "tooltip" : "Print"
            },
        }).addTo( this.map );
    },

    initCheckbox:function(){
        var self = this;
        this.checkboxes = [];
        var checkdiv = document.getElementsByClassName("leaflet-layers-markers")[0];

        for(var i = 0; i < checkdiv.children.length; i++){
            var elem = checkdiv.children[i];
            if(elem.childElementCount != 2) 
                return;

            if(elem.children[0].type == "checkbox"){                
                if(elem.children[1].nodeName == "LABEL"){
                    this.checkboxes[elem.children[1].innerHTML] = elem;
                    this.checkboxes[elem.children[1].innerHTML].children[0].onclick = function(e){
                        var label = e.target.labels[0].innerHTML;
                        if(!e.target.checked)
                            self.map.removeLayer(self.categoryLayers[label]);
                        else
                            self.categoryLayers[label].addTo(self.map);
                    };
                }
            }

        }
    },
    getCountry: function(NUTid){
        for (var country in this.countriesMapping){
            if(this.countriesMapping[country].isoCode == NUTid)
                return this.countriesMapping[country].name;
        }
    },
    getData:function(country_code){
        var self = this;
        var req = new XMLHttpRequest();
        var country = this.getCountry(country_code);
        var url = this.baseSourceURL + country_code;
        req.open('GET', url, true);
        req.onreadystatechange = function (aEvt) {
            if (req.readyState == 4){
                if(req.status == 200){
                    var json = JSON.parse(req.responseText);
                    self.addCategoryMarkersFromJson(json,country_code);
                } else{
                    var categories = self.typeCategories;
                    for(var i = 0; i < categories.length; i++){
                        if(self.categoryLayers[categories[i].name] && self.map.hasLayer(self.categoryLayers[categories[i].name])){
                            self.map.removeLayer(self.categoryLayers[categories[i].name]);
                            var data = {"type":"FeatureCollection","features":[]};
                            self.categoryLayers[categories[i].name] = L.wt.markers(data,null);

                            if( self.checkboxes[categories[i].name].children[0].checked )
                                self.categoryLayers[categories[i].name].addTo(self.map);
                        }
                    }
                }
            }
        };
        req.send(null);
    },
    addCategoryMarkersFromJson: function(json, country_code){
        var categories = this.typeCategories;
        var countryDataFeatures = json.features;
        var hasFeature = false;
        for(var i = 0; i < categories.length; i++){
            var catFeatures = [];
            for(var j = 0; j < countryDataFeatures.length; j++){
                if(countryDataFeatures[j].properties.category  && countryDataFeatures[j].properties.category == categories[i].name){
                    catFeatures[catFeatures.length] = countryDataFeatures[j];
                    hasFeature = true;
                }
            }
            var options = { 
                cluster: {
                    radius: 120, // default 120
                    small: 45,   // default 40
                    medium: 55,  // default 50
                    large: 65    // default 60
                },
                color:"" + categories[i].color,  // black blue (default) green orange pink red turquoise yellow
                onEachFeature: function(feature,layer){
                    layer.bindInfo("<h3>" + feature.properties.name + "</h3><p>" + feature.properties.description + "</p>");
                }
            }; 

            if(this.categoryLayers[categories[i].name] && this.map.hasLayer(this.categoryLayers[categories[i].name]))
               this.map.removeLayer(this.categoryLayers[categories[i].name]);

            var data = {"type":"FeatureCollection","features":catFeatures};
            this.categoryLayers[categories[i].name] = L.wt.markers(data,options);

            if( this.checkboxes[categories[i].name].children[0].checked )
                this.categoryLayers[categories[i].name].addTo(this.map);
        }
    },

    //Add click events to countries
    onEachNutsFeature:function(feature, layer){
        layer.on("click", function(e){ L.custom.zoomToFeature(e.target) })
        this.features[this.features.length] = feature;
        this.layers[this.layers.length] = layer;
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
    }
}