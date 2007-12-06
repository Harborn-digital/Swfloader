/**
 * Import the ExternalInterface class
 *
 * @since Mon Oct 08 2007
 **/
import flash.external.*;

/**
 * WMGoogleMap is the ActionScript 2 class for Google Maps in Flash
 *
 * Changelog
 * ------------
 * 
 * Niels Nijens - Thu Dec 06 2007
 * ----------------------------------
 * - Added printMapWith(); to print the map with other content from the page
 * 
 * Niels Nijens - Tue Nov 20 2007
 * ----------------------------------
 * - Added autofocus to loadKML();
 * - Improved the print functionality
 * 
 * Niels Nijens - Mon Nov 19 2007
 * ----------------------------------
 * - Added functionality to style the infoWindow
 * - Improved the print functionality
 * 
 * Niels Nijens - Fri Nov 16 2007
 * ----------------------------------
 * - Added addControl();, removeControl(); and toggleControls(); to the API
 * - Made printMap(); use toggleControls(); to not have the controls on the print
 * 
 * Niels Nijens - Tue Nov 13 2007
 * ----------------------------------
 * - Added focusLayer(); to focus on the geometryobjects in a layer (very useful for showing KML files)
 * - Added printMap(); to print the Google Map
 * 
 * Niels Nijens - Mon Oct 15 2007
 * ----------------------------------
 * - Added comments
 * - Added load handlers
 * - Fixed showLayer(); and hideLayer();
 * 
 * Niels Nijens - Fri Oct 12 2007
 * ----------------------------------
 * - Fixed KML loading
 * - refactored some functions
 * - Added load init Event for Javascript
 * 
 * Niels Nijens - Mon Oct 08 2007
 * ----------------------------------
 * - Added KML loading
 * - Renamed class to WMGoogleMap and added it to the AS class library
 * - Added Javascript interface
 *
 * Known bugs
 * ------------
 * - focusLayer(); seems to not work right with the satellite view (zooms in to far)
 *
 * To do
 * ------------
 * - Upgrade to ActionScript 3 (not possible until the AS3 GMap Component is released)
 * - Remove _root calls from event functions
 *
 * @since Tue Oct 02 2007
 * @author Niels Nijens (niels@connectholland.nl)
 * @version ActionScript 2
 * @package windmill.net
 **/
class windmill.net.WMGoogleMap {
	
	/**
	 * The variables imported from Javascript
	 *
	 * @since Thu Oct 11 2007
	 * @var Object
	 **/
	var flashVars:Object;
	
	/**
	 * The Google map container
	 *
	 * @since initial
	 * @var MovieClip
	 **/
	var gMap:MovieClip;
	
	/**
	 * An Array with references to the KML layers
	 *
	 * @since Mon Oct 08 2007
	 * @var Object
	 **/
	var KMLLayer:Object;
	
	
	var KMLAutoFocus:Boolean = false;
	
	/**
	 * Reference to the loading message
	 *
	 * @since Mon Oct 15 2007
	 * @var MovieClip
	 **/
	var loadFeedback:MovieClip;
	
	/**
	 * Object with style information for points
	 *
	 * @since Mon Oct 15 2007
	 * @var Object
	 **/
	var pointStyle:Object;
	
	/**
	 * Object with active controls
	 *
	 * @since Tue Nov 13 2007
	 * @var Object
	 **/
	var mapControls:Object;
	
	/**
	 * Object with set infoWindow style
	 *
	 * @since Mon Nov 19 2007
	 * @var Object
	 **/
	var infoWindowStyle:Object;
	
	
	var printDelayInterval;
	
	/**
	 * WMGoogleMap
	 *
	 * Creates a new instance of WMGoogleMap
	 *
	 * @since initial
	 * @return WMGoogleMap
	 **/
	function WMGoogleMap() {
		this.initSecurity();
		this.initMap();
		
		this.KMLLayer = new Object();
		this.mapControls = new Object();
		
		this.prepareStage();
		this.initAPI();
		this.initCenter();
		this.addControlsAndSettings();
	}
	
	/**
	 * initSecurity
	 *
	 * Add domains to the security sandbox
	 *
	 * @since Fri Oct 12 2007
	 * @return void
	 **/
	function initSecurity() {
		System.security.allowDomain("afcomponents.com");
		System.security.allowDomain("google.com");
	}
	
	/**
	 * initMap
	 *
	 * Create an instance of the Google Maps Component
	 * Add event handlers
	 *
	 * @since Fri Oct 12 2007
	 * @return void
	 **/
	function initMap() {
		this.gMap = _root.attachMovie("GMap", "GoogleMap", _root.getNextHighestDepth() );
		this.gMap.addEventListener("MAP_POSITION_CHANGED", this.mapPositionHandler);
	}
	
	/**
	 * mapPositionHandler
	 *
	 * Updates layers after MAP_POSITION_CHANGED
	 *
	 * @since Fri Oct 12 2007
	 * @param Object event
	 * @return void
	 **/
	function mapPositionHandler(event) {
		var layers = this.gMap.getLayers();
		for (var i = 0; i < layers.length; i++) {
			layers[i].updatePosition();
		}
	}
	
	/**
	 * prepareStage
	 *
	 * Sizes the Google map to the stage and adds a listener for Stage resizing
	 *
	 * @since initial
	 * @return void
	 **/
	function prepareStage() {
		Stage.align = "TL";
		Stage.scaleMode = "noScale";
		this.gMap.setSize(Stage.width, Stage.height);
		Stage.addListener(this);
	}
	
	/**
	 * initAPI
	 *
	 * Initializes the Javascript interface
	 *
	 * @since Mon Oct 08 2007
	 * @return void
	 **/
	function initAPI() {
		if (ExternalInterface.available) {
			ExternalInterface.addCallback("setCenter", this, this.setCenter);
			ExternalInterface.addCallback("loadKML", this, this.loadKML);
			ExternalInterface.addCallback("removeLayer", this, this.removeLayer);
			ExternalInterface.addCallback("focusLayer", this, this.focusLayer);
			ExternalInterface.addCallback("setPointStyle", this, this.setPointStyle);
			ExternalInterface.addCallback("addPoint", this, this.addPoint);
			ExternalInterface.addCallback("closeInfoWindow", this, this.closeInfoWindow);
			ExternalInterface.addCallback("printMap", this, this.printMap);
			ExternalInterface.addCallback("printMapWith", this, this.printMapWith);
			ExternalInterface.addCallback("addControl", this, this.addControl);
			ExternalInterface.addCallback("removeControl", this, this.removeControl);
			ExternalInterface.addCallback("toggleControls", this, this.toggleControls);
			ExternalInterface.addCallback("setInfoWindowStyle", this, this.setInfoWindowStyle);
		}
	}
	
	/**
	 * initCenter
	 *
	 * Sets the Google map to the starting center
	 *
	 * @since Mon Oct 08 2007
	 * @return void
	 **/
	function initCenter() {
		if (_root.gLat == undefined && _root.gLng == undefined) {
			_root.gLat = 52.301761;
			_root.gLng = 5.41626;
		}
		if (_root.gZoom == undefined) {
			_root.gZoom = 7;
		}
		this.gMap.setCenter({lat: _root.gLat, lng: _root.gLng}, _root.gZoom);
	}
	
	/**
	 * addControlsAndSettings
	 *
	 * Adds the controls to the Google map
	 *
	 * @since initial
	 * @return void
	 **/
	function addControlsAndSettings() {
		this.gMap.animatePan = true;
		this.gMap.animateZoom = true;
		this.addControl("zoom", {display: "compact"});
		this.addControl("position");
	}
	
	/**
	 * onResize
	 *
	 * onResize handler for the Stage
	 *
	 * @since initial
	 * @return void
	 **/
	function onResize() {
		this.gMap.setSize(Stage.width, Stage.height);
	}
	
	/**
	 * setCenter
	 *
	 * Centers the Google Map on location
	 *
	 * @since initial
	 * @param Object location
	 * @param Number zoom
	 * @return void
	 **/
	function setCenter(location, zoom) {
		this.gMap.setCenter(location, zoom);
	}
	
	/**
	 * loadKML
	 *
	 * Loads a KML file onto the Google map
	 *
	 * @since Mon Oct 08 2007
	 * @param String id
	 * @param String url
	 * @param String message
	 * @param Boolean autofocus
	 * @return void
	 **/
	function loadKML(id, url, message, autofocus) {
		this.KMLAutoFocus = autofocus;
		this.loadEvent(message);
		this.gMap.addEventListener("MAP_ERROR", this.loadKMLError);
		var layer = this.gMap.addKMLLayer({path: url, infoWindowStyle: this.getInfoWindowStyle() });
		layer.addEventListener("KML_LOAD_COMPLETE", this.loadKMLComplete);
		layer.show();
		
		this.KMLLayer[id] = layer.id;
	}
	
	/**
	 * loadEvent
	 *
	 * Adds a loading message
	 *
	 * @since Mon Oct 15 2007
	 * @param String message
	 * @return void
	 **/
	function loadEvent(message) {
		if (!this.loadFeedback) {
			this.loadFeedback = _root.attachMovie("loading", "loadFeedback", _root.getNextHighestDepth() );
			this.loadFeedback._x = Stage.width / 2;
			this.loadFeedback._y = Stage.height / 2;
		}
		if (message != "" && message != undefined) {
			this.loadFeedback.message.text = message;
		}
		this.loadFeedback._visible = true;
	}
	
	/**
	 * loadKMLComplete
	 *
	 * Removes the loading feedback after KML_LOAD_COMPLETE
	 *
	 * @since Fri Nov 02 2007 (previously known as loadKMLHandler)
	 * @param Object event
	 * @return void
	 * @todo remove the _root calls
	 **/
	function loadKMLComplete(event) {
		_root.loadFeedback._visible = false;
		
		var gObjects = event.target.getGeometryObjects();
		for (var i = 0; i < gObjects.length; i++) {
			if (gObjects[i].type == "GLine") {
				gObjects[i].enabled = false;
			}
		}
		
		if (_root.map.KMLAutoFocus) {
			var KMLLayers = _root.map.KMLLayer;
			for (var layerName in KMLLayers) {
				if (KMLLayers[layerName] == event.target.id) {
					_root.map.focusLayer(layerName);
				}
			}
			
			_root.map.KMLAutoFocus = false;
		}
	}
	
	/**
	 * loadKMLError
	 *
	 * Shows an error message as loading feedback after MAP_ERROR
	 *
	 * @since Fri Nov 02 2007
	 * @param Object event
	 * @return void
	 **/
	function loadKMLError(event) {
		_root.loadFeedback.message.text = "Error";
		ExternalInterface.call("SWFError", event.message);
	}
	
	/**
	 * showKML
	 *
	 * Makes the KML Layer with id visible
	 *
	 * @since Mon Oct 08 2007
	 * @param String id
	 * @return void
	 **/
	function showLayer(id) {
		var layer = this.getLayer(id);
		if (layer) {
			layer.show();
		}
	}
	
	/**
	 * hideKML
	 *
	 * Hides the KML Layer with id
	 *
	 * @since Mon Oct 08 2007
	 * @param String id
	 * @return void
	 **/
	function hideLayer(id) {
		var layer = this.getLayer(id);
		if (layer) {
			layer.hide();
		}
	}
	
	/**
	 * removeLayer
	 *
	 * Removes a layer from the Google map
	 *
	 * @since Mon Oct 08 2007
	 * @param String id
	 * @return void
	 **/
	function removeLayer(id) {
		var layer = this.getLayer(id);
		if (layer) {
			layer.clear();
		}
	}
	
	/**
	 * focusLayer
	 *
	 * Focuses on a layer with id from the Google map
	 * All the Geometry objects will be in the view
	 *
	 * @since Tue Nov 13 2007
	 * @param String id
	 * @return void
	 **/
	function focusLayer(id) {
		var layer = this.getLayer(id);
		if (layer) {
			var maxlat:Number = Number.NEGATIVE_INFINITY;
			var minlat:Number = Number.POSITIVE_INFINITY;
			var maxlon:Number = Number.NEGATIVE_INFINITY;
			var minlon:Number = Number.POSITIVE_INFINITY;
			
			var gObjects:Array = layer.getGeometryObjects();
			for (var i:Number = 0; i < gObjects.length; i++) {
				maxlat = Math.max(maxlat, gObjects[i].lat);
				minlat = Math.min(minlat, gObjects[i].lat);
				maxlon = Math.max(maxlon, gObjects[i].lng);
				minlon = Math.min(minlon, gObjects[i].lng);
			}
			
			var targetBounds = this.gMap.GBounds(minlon, maxlat, maxlon, minlat);
			this.gMap.setBounds(targetBounds);
			
			// setBounds method tries to fit the view horizontaly or vertically
			// if you want the full view -> uncomment these lines
			var actualBounds = this.gMap.getBounds();
			if (actualBounds.left > targetBounds.left || actualBounds.right < targetBounds.left || actualBounds.bottom > targetBounds.bottom || actualBounds.top < targetBounds.top) {
				this.gMap.zoomOut();
			}
		}
	}
	
	/**
	 * getLayer
	 *
	 * Returns the layer by id
	 *
	 * @since Tue Oct 09 2007
	 * @param String id
	 * @return Object
	 **/
	function getLayer(id) {
		var layerId = this.KMLLayer[id];
		var layers = this.gMap.getLayers();
		
		for (var i = 0; i < layers.length; i++) {
			if (layers[i].id == layerId) {
				return layers[i];
			}
		}
		return false;
	}
	
	/**
	 * addPoint
	 *
	 * Adds a Placemark on the Google map
	 *
	 * @since Mon Oct 08 2007
	 * @param String id
	 * @param Object point
	 * @return Boolean
	 **/
	function addPoint(id, point, mode) {
		var layer = this.getLayer(id);
		if (!layer) {
			layer = this.gMap.addLayer({name: id});
			this.KMLLayer[id] = layer.id;
		}
		
		point.icon = this.pointStyle.icon;
		point.iconAlign = "bottom-center";
		
		var point = layer.addPoint(point);
		point.attributes["layer"] = id;
		point.attributes["reference"] = this;
		point.attributes["style"] = this.pointStyle;
		
		this.addPointEvents(point, mode);
		
		return true;
	}
	
	/**
	 * addPointEvents
	 *
	 * Adds the events for mode to point
	 *
	 * @since Mon Oct 15 2007
	 * @param Object point
	 * @param String mode
	 * @return void
	 **/
	function addPointEvents(point, mode) {
		switch (mode) {
			case "select":
				point.addEventListener("GEOMETRY_ON_RELEASE", this.showSelect);
				break;
			default:
				point.addEventListener("GEOMETRY_ON_RELEASE", this.showPointWindow);
				break;
		}
	}
	
	/**
	 * showSelect
	 *
	 * Selects the clicked point
	 *
	 * @since Mon Oct 15 2007
	 * @param Object event
	 * @return void
	 **/
	function showSelect(event) {
		event.target.attributes["reference"].hideSelect(event);
		event.target.icon = event.target.attributes["style"].iconActive;
		event.target.attributes["reference"].showPointWindow(event);
		
		var point = new Array(event.target.name, event.target.lat, event.target.lng);
		ExternalInterface.call("SWFCall", _root.swfname, "addPointToForm", point);
	}
	
	/**
	 * hideSelect
	 *
	 * Removes all current selected points in a layer
	 *
	 * @since Mon Oct 15 2007
	 * @param Object event
	 * @return void
	 **/
	function hideSelect(event) {
		var layer = event.target.attributes["reference"].getLayer(event.target.attributes["layer"]);
		var points = layer.getGeometryObjects();
		for (var i = 0; i < points.length; i++) {
			if (points[i].icon != event.target.attributes["style"].icon) {
				points[i].icon = event.target.attributes["style"].icon;
			}
		}
	}
	
	/**
	 * setPointStyle
	 *
	 * Sets the style object for points
	 *
	 * @since Mon Oct 15 2007
	 * @param Object style
	 * @return void
	 **/
	function setPointStyle(style) {
		this.pointStyle = style;
	}
	
	/**
	 * getPointStyle
	 *
	 * Returns the style object for points
	 *
	 * @since Mon Oct 15 2007
	 * @return Object
	 **/
	function getPointStyle() {
		return this.pointStyle;
	}
	
	/**
	 * showPointWindow
	 *
	 * Shows the info window when a point is clicked
	 *
	 * @since Mon Oct 08 2007
	 * @param Object event
	 * @return void
	 **/
	function showPointWindow(event) {
		event.target.openInfoWindow({title: event.target.name, content: event.target.description});
	}
	
	/**
	 * closeInfoWindow
	 *
	 * Closes the active infowindow of a point
	 *
	 * @since Fri Nov 02 2007
	 * @return void
	 **/
	function closeInfoWindow() {
		this.gMap.closeInfoWindow();
	}
	
	/**
	 * addControl
	 *
	 * Adds a control to the Google Map
	 *
	 * @since Fri Nov 16 2007
	 * @param String type
	 * @param Object settings
	 * @return void
	 **/
	function addControl(type, settings) {
		var control = this.getControl(type);
		if (!control) {
			this.mapControls[type] = this.gMap.addControl(this.getControlObject(type, settings) );
		}
		else {
			control.show();
		}
	}
	
	/**
	 * removeControl
	 *
	 * Removes a control from the Google Map
	 *
	 * @since Fri Nov 16 2007
	 * @param String type
	 * @return void
	 **/
	function removeControl(type) {
		var control = this.getControl(type);
		if (control) {
			control.hide();
			this.mapControls[type] = undefined;
		}
	}
	
	/**
	 * toggleControls
	 *
	 * Toggles the controls on and off
	 *
	 * @since Fri Nov 16 2007
	 * @param String type
	 * @return void
	 **/
	function toggleControls() {
		for (var type in this.mapControls) {
			if (this.mapControls[type].visibility == "on") {
				this.mapControls[type].hide();
			}
			else {
				this.mapControls[type].show();
			}
		}
	}
	
	/**
	 * getControl
	 *
	 * Returns if the control type has been added
	 *
	 * @since Fri Nov 16 2007
	 * @param String type
	 * @return mixed
	 **/
	function getControl(type) {
		if (this.mapControls[type] == undefined) {
			return false;
		}
		return this.mapControls[type];
	}
	
	/**
	 * getControlObject
	 *
	 * Returns a new control object with type
	 *
	 * @since Fri Nov 16 2007
	 * @param String type
	 * @param Object settings
	 * @return Object
	 **/
	function getControlObject(type, settings) {
		switch(type) {
			case "position":
				return this.gMap.GPositionControl(settings);
				break;
			case "zoom":
				return this.gMap.GZoomControl(settings);
				break;
			case "view":
				return this.gMap.GTypeControl(settings);
				break;
			case "navigator":
				return this.gMap.GNavigatorControl(settings);
				break;
		}
	}
	
	/**
	 * setInfoWindowStyle
	 *
	 * Sets the infoWindowStyle
	 *
	 * @since Mon Nov 19 2007
	 * @param Object infoWindowStyle
	 * @return void
	 **/
	function setInfoWindowStyle(infoWindowStyle) {
		this.infoWindowStyle = infoWindowStyle;
	}
	
	/**
	 * getInfoWindowStyle
	 *
	 * Returns the default or set infoWindowStyle
	 *
	 * @since Mon Nov 19 2007
	 * @return Object
	 **/
	function getInfoWindowStyle() {
		if (this.infoWindowStyle != undefined) {
			return this.infoWindowStyle;
		}
		return this.getDefaultInfoWindowStyle();
	}
	
	/**
	 * getDefaultInfoWindowStyle
	 *
	 * Returns the default infoWindowStyle
	 *
	 * @since Mon Nov 19 2007
	 * @return Object
	 **/
	function getDefaultInfoWindowStyle() {
		var infoWindowStyle:Object = new Object();
		
		var contentStyleSheet:TextField.StyleSheet = new TextField.StyleSheet();
		contentStyleSheet.setStyle("html", {fontFamily: "Arial", fontSize: 12});
		contentStyleSheet.setStyle("a", {fontFamily: "Arial", fontSize: 12, textDecoration: "underline", color: "#0000ff"});
		contentStyleSheet.setStyle("a:hover", {fontFamily: "Arial", fontSize: 12, textDecoration: "none", color: "#ff0000"});
		infoWindowStyle.contentStyle = contentStyleSheet;
		
		var titleStyleSheet:TextField.StyleSheet = new TextField.StyleSheet();
		titleStyleSheet.setStyle("html", {fontFamily: "Arial", fontSize: 14, fontWeight: "bold"});
		infoWindowStyle.titleStyle = titleStyleSheet;
		
		return infoWindowStyle;
	}
	
	/**
	 * printMap
	 *
	 * Prints the active view of the map
	 *
	 * @since Tue Nov 13 2007
	 * @param String id
	 * @return void
	 **/
	function printMap(id) {
		this.printPointList(id);
		this.printDelayInterval = setInterval(this, "startPrint", 1000);
	}
	
	/**
	 * printMapWith
	 *
	 * Prints the active view of the map with content
	 *
	 * @since Thu Dec 06 2007
	 * @param String id
	 * @param String content
	 * @return void
	 **/
	function printMapWith(id, content) {
		var printContentContainer = _root.createEmptyMovieClip("printContentContainer", _root.getNextHighestDepth() );
		printContentContainer._x = Stage.width + 10;
		printContentContainer._y = 0;
		
		var printContent = printContentContainer.createTextField("printContent", printContentContainer.getNextHighestDepth(), 0, 0, Stage.width, 100);
		printContent.condenseWhite = true;
		printContent.autoSize = true;
		printContent.html = true;
		printContent.selectable = false;
		
		var contentStyleSheet:TextField.StyleSheet = new TextField.StyleSheet();
		contentStyleSheet.setStyle("html", {fontFamily: "Arial", fontSize: 12});
		contentStyleSheet.setStyle("h2", {fontFamily: "Arial", fontSize: 14, fontWeight: "bold"});
		printContent.styleSheet = contentStyleSheet;
		
		// formatting
		var contentpieces = content.split("</li>");
		content = contentpieces.join("");
		contentpieces = content.split("<li>");
		
		printContent.htmlText = contentpieces[0].substr(0, contentpieces[0].lastIndexOf("<ol>") );
		
		for (var i = 1; i < contentpieces.length; i++) {
			var offsetY = printContentContainer._height;
			
			var printContent = printContentContainer.attachMovie("printContent", "printContent" + (i - 1), printContentContainer.getNextHighestDepth() );
			printContent._x = 0;
			printContent._y = offsetY;
			
			printContent.contentNumber.text = i + ".";
			printContent.content.condenseWhite = true;
			printContent.content.autoSize = true;
			printContent.content.html = true;
			printContent.content.htmlText = contentpieces[i];
		}
		
		this.printDelayInterval = setInterval(this, "startPrint", 1000);
	}
	
	/**
	 * startPrint
	 *
	 * Removes the controls and starts spooling to the printer
	 *
	 * @since Mon Nov 19 2007
	 * @return void
	 **/
	function startPrint() {
		clearInterval(this.printDelayInterval);
		
		this.toggleControls();
		
		var printjob:PrintJob = new PrintJob();
		if (printjob.start() ) {
			var pageCount:Number = 0;
			
			if (printjob.addPage(0, {xMin: 0, xMax: Stage.width, yMin: 0, yMax: Stage.height}, {printAsBitmap: true}) ) {
				pageCount++;
			}
			
			/*var printStart = 0;
			var printHeight = _root.printPointContainer._height;
			while (0 < printHeight) {
				if (printjob.addPage("printPointContainer", {xMin: 0, xMax: _root.printPointContainer._width, yMin: printStart, yMax: (printStart + 800)}, {printAsBitmap: true}) ) {
					printStart += 800;
					printHeight -= 800;
					pageCount++;
				}
			}*/
			
			var printStart = 0;
			var printHeight = _root.printContentContainer._height;
			while (0 < printHeight) {
				if (printjob.addPage("printContentContainer", {xMin: 0, xMax: _root.printContentContainer._width, yMin: printStart, yMax: (printStart + 800)}, {printAsBitmap: true}) ) {
					printStart += 800;
					printHeight -= 800;
					pageCount++;
				}
			}
			
			if (pageCount > 0) {
				printjob.send();
			}
		}
		
		this.toggleControls();
		delete printjob;
	}
	
	/**
	 * printPointList
	 *
	 * Adds the list with points and their descriptions outside of the stage for printing purposes
	 * Only one layer can be prepared to print (for now)
	 *
	 * @since Mon Nov 19 2007
	 * @param String id
	 * @return void
	 **/
	function printPointList(id) {
		var layer = this.getLayer(id);
		if (layer) {
			var pointContainer = _root.createEmptyMovieClip("printPointContainer", _root.getNextHighestDepth() );
			pointContainer._x = Stage.width + 10;
			pointContainer._y = 0;
			
			var j = 0;
			var gObjects:Array = layer.getGeometryObjects();
			for (var i = 0; i < gObjects.length; i++) {
				if (gObjects[i].type == "GPoint") {
					var printPoint = pointContainer.attachMovie("printPoint", "printPoint" + j, pointContainer.getNextHighestDepth() );
					printPoint._x = 0;
					printPoint._y = 100 * j;
					
					var iconLoader:MovieClipLoader = new MovieClipLoader();
					iconLoader.addListener(this);
					iconLoader.loadClip(gObjects[i].icon, printPoint.iconContainer);
					
					printPoint.title.styleSheet = gObjects[i].infoWindowStyle.titleStyle;
					printPoint.title.htmlText = gObjects[i].infoWindowStyle.title;
					printPoint.description.autoSize = true;
					printPoint.description.styleSheet = gObjects[i].infoWindowStyle.contentStyle;
					printPoint.description.htmlText = gObjects[i].infoWindowStyle.content;
					j++;
				}
			}
		}
	}
	
	/**
	 * onLoadInit
	 *
	 * Onload handler for loading print icons
	 *
	 * @since Tue Nov 20 2007
	 * @param MovieClip icon
	 * @return void
	 **/
	function onLoadInit(icon) {
		icon._x = (110 - icon._width) / 2;
		icon._y = 5;
	}
}