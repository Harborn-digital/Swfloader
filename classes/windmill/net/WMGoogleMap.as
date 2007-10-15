/**
 * Import the ExternalInterface class
 *
 * @since Mon Oct 08 2007
 **/
import flash.external.*;

/**
 * WMGoogleMap is the ActionScript 2 class for the Google maps in Flash
 *
 * Changelog
 * ---------
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
 * To do
 * ---------
 * -
 *
 *
 * @since Tue Oct 02 2007
 * @author Niels Nijens (niels@connectholland.nl)
 * @version AS2
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
	 * @var Array
	 **/
	var KMLLayer:Object;
	
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
		for (var i=0; i < layers.length; i++) {
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
			ExternalInterface.addCallback("setPointStyle", this, this.setPointStyle);
			ExternalInterface.addCallback("addPoint", this, this.addPoint);
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
		this.gMap.addControl(this.gMap.GZoomControl({display: "compact"}) );
		this.gMap.addControl(this.gMap.GPositionControl() );
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
	 * 
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
	 * @return void
	 **/
	function loadKML(id, url, message) {
		this.loadEvent(message);
		var layer = this.gMap.addKMLLayer({path: url});
		layer.addEventListener("KML_LOAD_COMPLETE", this.loadKMLHandler);
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
	 * loadKMLHandler
	 *
	 * Removes the loading feedback after KML_LOAD_COMPLETE
	 *
	 * @since Mon Oct 08 2007
	 * @param Object event
	 * @return void
	 **/
	function loadKMLHandler(event) {
		_root.loadFeedback._visible = false;
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
}