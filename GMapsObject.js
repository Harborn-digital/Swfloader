/**
 * GMapsObject is the Flash Google Maps Object
 * Implements javascript communication with the Google Maps SWFObject
 *
 * Changelog
 * ---------
 *
 * Niels Nijens Mon Oct 22 2007
 * -----------------------------
 * -Changed function checks to this.methodExists();
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


	ajaxUpdate: function(response) {
		this.xml = response.firstChild;
		switch (this.xml.getAttribute("mode") ) {
			case "geocode":
				this.geoCodeRequest();
				break;
		}
	},


	geoCodeRequest: function() {
		this.geoButton.value = this.geoButtonValue;
		this.geoButton.disabled = false;
		var placemarks = this.getPlacemarks();

		this.geoCodeSelect(placemarks);
	},


	geoCodeSelect: function(placemarks) {
		for (i = 0; i < placemarks.length; i++) {
			coordinates = this.getNodeValue(placemarks[i].getElementsByTagName("coordinates")[0] );
			coordinates = coordinates.split(",");

			if (placemarks[i].getElementsByTagName("city").length > 0) {
				city = ", " + this.getNodeValue(placemarks[i].getElementsByTagName("city")[0] );
			}

			point = {"lng" : coordinates[0], "lat" : coordinates[1], "name" : this.getNodeValue(placemarks[i].getElementsByTagName("street")[0] ) + city};
			this.addPoint("search", point, "select");
			if (placemarks.length == 1) {
				this.setCenter({"lng" : coordinates[0], "lat" : coordinates[1]}, 8);
			}
		}
	},

	getPlacemarks: function() {
		return this.xml.getElementsByTagName("placemark");
	},

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


	setCenter: function(location, zoom) {
		if (this.methodExists("setCenter") ) {
			$(this.getAttribute("swfname") ).setCenter(location, zoom);
		}
		else {
			this.setCenter.applyWithTimeout(this, 100, location, zoom);
		}
	},


	loadKML: function(id, url) {
		if (this.methodExists("loadKML") ) {
			$(this.getAttribute("swfname") ).loadKML(id, url);
		}
		else {
			this.loadKML.applyWithTimeout(this, 100, id, url);
		}
	},


	removeLayer: function(id) {
		$(this.getAttribute("swfname") ).removeLayer(id);
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


	addPoint: function(id, point, mode) {
		$(this.getAttribute("swfname") ).addPoint(id, point, mode);
	},

	addPointToForm: function(point) {
		var placemark = this.getPlacemarkByCoords(point);
		if (typeof(this.callback) == "function") {
			this.callback(placemark);
		}
		else {
			//handle form in default way
		}
	},

	registerCallback: function(callback) {
		this.callback = callback;
	}
});