/**
 * GMapsObject is the Flash Google Maps Object
 * Implements javascript communication with the Google Maps SWFObject
 *
 * Changelog
 * ---------
 *
 * Niels Nijens - Tue Nov 20 2007
 * -------------------------------
 * - Added autofocus to loadKML();
 *
 * Niels Nijens - Mon Nov 19 2007
 * -------------------------------
 * - Added setInfoWindowStyle(); to style the infoWindow
 *
 * Niels Nijens - Fri Nov 16 2007
 * -------------------------------
 * - Added addControl();, removeControl(); and toggleControls();
 * - Added missing comments
 *
 * Niels Nijens - Tue Nov 13 2007
 * -------------------------------
 * - Added printMap();
 *
 * Niels Nijens - Mon Nov 12 2007
 * -------------------------------
 * - Added focusLayer();
 *
 * Niels Nijens - Mon Oct 22 2007
 * -------------------------------
 * - Changed function checks to methodExists();
 *
 * @since Tue Oct 09 2007
 * @author Niels Nijens (niels@connectholland.nl)
 **/
var GMapsObject = Class.extend(SWFObject, {
	
	/**
	 * initialize
	 *
	 * Initialize a new GMapsObject
	 *
	 * @since initial
	 * @param string swfname
	 * @param string swffile
	 * @param integer width
	 * @param integer height
	 * @param string bgcolor
	 * @param boolean wmode
	 * @param object swfvars
	 * @return void
	 **/
	initialize: function(swfname, swffile, width, height, bgcolor, swfvars) {
		this.__parent.initialize(swfname, swffile, width, height, bgcolor, swfvars);
		this.mapLoaded = false;
		
		ajaxEngine.registerRequest(swfname, "/index.php");
		ajaxEngine.registerAjaxObject(swfname, this);
	},
	
	/**
	 * addFlashConfigVars
	 *
	 * Adds the variables required for WMFlashConfig
	 *
	 * @since Thu Oct 11 2007
	 * @return void
	 **/
	addFlashConfigVars: function() {
		this.addVariable("swfname", this.getAttribute("swfname") );
		this.addVariable("swfpath", this.getAttribute("swffile").substr(0, this.getAttribute("swffile").lastIndexOf("/") + 1) );
	},
	
	/**
	 * searchGeoCode
	 *
	 * Sends a search AJAX request to the Google Maps module
	 *
	 * @since unknown
	 * @param DomNode button
	 * @param DomNode formField
	 * @return void
	 **/
	searchGeoCode: function(button, formField) {
		this.geoButton = button;
		this.geoButtonValue = this.geoButton.value;
		this.geoButton.value = "Zoeken...";
		this.geoButton.disabled = true;
		this.geoFormField = formField;
		query = formField.value;
		this.removeLayer("search");
		this.closeInfoWindow();
		ajaxEngine.sendRequest(this.getAttribute("swfname"), {parameters: "ct=gmaps&mode=geocode&mapid=" + this.getAttribute("swfname") + "&query=" + query});
	},
	
	/**
	 * ajaxUpdate
	 *
	 * Handles the AJAX response
	 *
	 * @since unknown
	 * @param XML response
	 * @return void
	 **/
	ajaxUpdate: function(response) {
		this.xml = response.firstChild;
		switch (this.xml.getAttribute("mode") ) {
			case "geocode":
				this.geoCodeRequest();
				break;
		}
	},
	
	/**
	 * geoCodeRequest
	 *
	 * Handles the AJAX response for the GeoCode request
	 *
	 * @since unknown
	 * @return void
	 **/
	geoCodeRequest: function() {
		this.geoButton.value = this.geoButtonValue;
		this.geoButton.disabled = false;
		var placemarks = this.getPlacemarks();
		
		this.geoCodeSelect(placemarks);
	},
	
	/**
	 * geoCodeSelect
	 *
	 * Adds the points to the Google Map to select one
	 *
	 * @since unknown
	 * @param array placemarks
	 * @return void
	 **/
	geoCodeSelect: function(placemarks) {
		for (i = 0; i < placemarks.length; i++) {
			coordinates = this.getNodeValue(placemarks[i].getElementsByTagName("coordinates")[0] );
			coordinates = coordinates.split(",");
			
			if (placemarks[i].getElementsByTagName("city").length > 0) {
				city = ", " + this.getNodeValue(placemarks[i].getElementsByTagName("city")[0] );
			}
			
			point = {"lng" : coordinates[0], "lat" : coordinates[1], "name" : this.getNodeValue(placemarks[i].getElementsByTagName("street")[0] ) + city};
			this.addPoint("search", point, "select");
		}
		if (placemarks.length == 1) {
			this.setCenter({"lng" : coordinates[0], "lat" : coordinates[1]}, 8);
		}
		else {
			this.focusLayer("search");
		}
	},
	
	/**
	 * getPlacemarks
	 *
	 * Returns all the placemarks in the XML
	 *
	 * @since unknown
	 * @return array
	 **/
	getPlacemarks: function() {
		return this.xml.getElementsByTagName("placemark");
	},
	
	/**
	 * getPlacemarkByCoords
	 *
	 * Returns a placemark with coords
	 *
	 * @since unknown
	 * @param array coords
	 * @return object
	 **/
	getPlacemarkByCoords: function(coords) {
		var placemarks = this.getPlacemarks();
		var placemarkobject = {};
		for (i=0; i < placemarks.length; i++) {
			var placemarkcoords = this.getNodeValue(placemarks[i].getElementsByTagName("coordinates")[0] ).split(",");
			if (coords[2] == new Number(placemarkcoords[0]) && coords[1] == new Number(placemarkcoords[1]) ) {
				for (j=0; j < placemarks[i].childNodes.length; j++) {
					placemarkobject[placemarks[i].childNodes[j].nodeName] = this.getNodeValue(placemarks[i].childNodes[j] );
				}
			}
		}
		return placemarkobject;
	},
	
	/**
	 * getNodeContent
	 *
	 * Returns the value of the node
	 *
	 * @since Tue Oct 09 2007
	 * @access public
	 * @param DomNode node
	 * @return string
	 **/
	getNodeValue: function(node) {
		if (node.textContent) {
			return node.textContent;
		}
		else {
			return node.text;
		}
	},
	
	/**
	 * setCenter
	 *
	 * Centers the Google Map on location
	 *
	 * @since unknown
	 * @param object location
	 * @param integer zoom
	 * @return void
	 **/
	setCenter: function(location, zoom) {
		if (this.methodExists("setCenter") ) {
			$(this.getAttribute("swfname") ).setCenter(location, zoom);
		}
		else {
			this.setCenter.applyWithTimeout(this, 100, location, zoom);
		}
	},
	
	/**
	 * loadKML
	 *
	 * Loads a KML file onto the Google Map
	 *
	 * @since unknown
	 * @param string id
	 * @param string url
	 * @param boolean autofocus
	 * @param boolean save
	 * @return void
	 **/
	loadKML: function(id, url, autofocus, save) {
		if (this.methodExists("loadKML") ) {
			$(this.getAttribute("swfname") ).loadKML(id, url, null, autofocus, save);
		}
		else {
			this.loadKML.applyWithTimeout(this, 100, id, url, autofocus, save);
		}
	},
	
	/**
	 * removeLayer
	 *
	 * Removes a layer with id from the Google Map
	 *
	 * @since unknown
	 * @param string id
	 * @return void
	 **/
	removeLayer: function(id) {
		if (this.methodExists("removeLayer") ) {
			$(this.getAttribute("swfname") ).removeLayer(id);
		}
		else {
			this.removeLayer.applyWithTimeout(this, 100, id);
		}
	},
	
	/**
	 * focusLayer
	 *
	 * Focuses on all the objects in the layer with id
	 *
	 * @since Mon Nov 12 2007
	 * @param string id
	 * @return void
	 **/
	focusLayer: function(id) {
		if (this.methodExists("focusLayer") ) {
			$(this.getAttribute("swfname") ).focusLayer(id);
		}
		else {
			this.focusLayer.applyWithTimeout(this, 100, id);
		}
	},
	
	/**
	 * closeInfoWindow
	 *
	 * Closes the active infowindow of a point
	 *
	 * @since Fri Nov 02 2007
	 * @access public
	 * @return void
	 **/
	closeInfoWindow: function() {
		if (this.methodExists("closeInfoWindow") ) {
			$(this.getAttribute("swfname") ).closeInfoWindow();
		}
		else {
			this.closeInfoWindow.applyWithTimeout(this, 100);
		}
	},
	
	/**
	 * setPointStyle
	 *
	 * Sets the style used for points
	 * Example: {"icon" : "icon.png", iconActive: "iconactive.png"}
	 *
	 * @since Mon Oct 15 2007
	 * @access public
	 * @param object style
	 * @return void
	 **/
	setPointStyle: function(style) {
		if (this.methodExists("setPointStyle") ) {
			$(this.getAttribute("swfname") ).setPointStyle(style);
		}
		else {
			this.setPointStyle.applyWithTimeout(this, 100, style);
		}
	},
	
	/**
	 * addPoint
	 *
	 * Adds a point to the Google Map
	 *
	 * @since unknown
	 * @param string id
	 * @param object point
	 * @param string mode
	 * @return void
	 **/
	addPoint: function(id, point, mode) {
		$(this.getAttribute("swfname") ).addPoint(id, point, mode);
	},
	
	/**
	 * addPointToForm
	 *
	 * Adds the information of the selected point to a form
	 *
	 * @since unknown
	 * @param object point
	 * @return void
	 * @todo change this (I don't like the way it is handled currently)
	 **/
	addPointToForm: function(point) {
		var placemark = this.getPlacemarkByCoords(point);
		if (typeof(this.callback) == "function") {
			this.callback(placemark);
		}
		else {
			//handle form in default way
		}
	},
	
	/**
	 * addControl
	 *
	 * Adds a control to the Google Map
	 *
	 * Possible control types are:
	 * - position (panning controls)
	 * - zoom (zoom controls)
	 * - view (satellite, street, hybid view selector)
	 * - navigator (mini map)
	 *
	 * @since Fri Nov 16 2007
	 * @access public
	 * @param string type
	 * @param object settings
	 * @return void
	 **/
	addControl: function(type, settings) {
		if (this.methodExists("addControl") ) {
			$(this.getAttribute("swfname") ).addControl(type, settings);
		}
		else {
			this.addControl.applyWithTimeout(this, 100, type, settings);
		}
	},
	
	/**
	 * removeControl
	 *
	 * Removes a control from the Google Map
	 *
	 * @since Fri Nov 16 2007
	 * @access public
	 * @param string type
	 * @param object settings
	 * @return void
	 **/
	removeControl: function(type) {
		if (this.methodExists("removeControl") ) {
			$(this.getAttribute("swfname") ).removeControl(type);
		}
		else {
			this.removeControl.applyWithTimeout(this, 100, type);
		}
	},
	
	/**
	 * toggleControls
	 *
	 * Toggles controls on and off
	 *
	 * @since Fri Nov 16 2007
	 * @access public
	 * @return void
	 **/
	toggleControls: function() {
		if (this.methodExists("toggleControls") ) {
			$(this.getAttribute("swfname") ).toggleControls();
		}
		else {
			this.toggleControls.applyWithTimeout(this, 100);
		}
	},
	
	/**
	 * setInfoWindowStyle
	 *
	 * Sets the infoWindowStyle
	 *
	 * @since Mon Nov 19 2007
	 * @param Object infoWindowStyle
	 * @return void
	 **/
	setInfoWindowStyle: function(infoWindowStyle) {
		if (this.methodExists("setInfoWindowStyle") ) {
			$(this.getAttribute("swfname") ).setInfoWindowStyle(infoWindowStyle);
		}
		else {
			this.setInfoWindowStyle.applyWithTimeout(this, 100, infoWindowStyle);
		}
	},
	
	/**
	 * isLoading
	 *
	 * Returns if the map is loading
	 *
	 * @since Thu Apr 10 2008
	 * @return boolean
	 **/
	isLoading: function() {
		if (this.methodExists("isLoading") ) {
			return $(this.getAttribute("swfname") ).isLoading();
		}
		return true;
	}
	
	/**
	 * printMap
	 *
	 * Prints the active Google Map view
	 *
	 * @since Tue Nov 13 2007
	 * @access public
	 * @param string id
	 * @return void
	 **/
	printMap: function(id) {
		if (this.methodExists("printMap") ) {
			$(this.getAttribute("swfname") ).printMap(id);
		}
		else {
			this.printMap.applyWithTimeout(this, 100, id);
		}
	},
	
	/**
	 * printMap
	 *
	 * Prints the active Google Map view with content
	 *
	 * @since Thu Dec 06 2007
	 * @access public
	 * @param string id
	 * @param string content
	 * @return void
	 **/
	printMapWith: function(id, content) {
		if (this.methodExists("printMapWith") ) {
			$(this.getAttribute("swfname") ).printMapWith(id, content);
		}
		else {
			this.printMapWith.applyWithTimeout(this, 100, id, content);
		}
	}
});