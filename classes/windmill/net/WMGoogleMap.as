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
	
	function initSecurity() {
		System.security.allowDomain("afcomponents.com");
		System.security.allowDomain("google.com");
	}
	
	function initMap() {
		this.gMap = _root.attachMovie("GMap", "GoogleMap", _root.getNextHighestDepth() );
		this.gMap.addEventListener("MAP_LOAD_COMPLETE", loadHandler);
		this.gMap.addEventListener("MAP_POSITION_CHANGED", mapPositionHandler);
	}
	
	function loadHandler(event) {
		ExternalInterface.call("SWFCall", _root.swfname, "mapLoaded");
	}
	
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
			ExternalInterface.addCallback("addPoint", this, this.addPoint);
			
			// ADD Loaded call
			//ExternalInterface.call("SWFCall", _root.swfname, "mapLoaded");
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
		this.gMap.addControl(this.gMap.GNavigatorControl() );
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
	 * @return void
	 **/
	function loadKML(id, url) {
		this.KMLLayer[id] = gMap.addKMLLayer({path: url});
		this.KMLLayer[id].show();
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
		if (this.KMLLayer[id] != undefined) {
			this.KMLLayer[id].show();
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
		if (this.KMLLayer[id] != undefined) {
			this.KMLLayer[id].hide();
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
		if (layer != undefined) {
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
	 * @return void
	 **/
	function addPoint(id, point) {
		var layer = this.getLayer(id);
		if (!layer) {
			layer = this.gMap.addLayer({name: id});
			this.KMLLayer[id] = layer.id;
		}
		
		var point = layer.addPoint(point);
		point.addEventListener("GEOMETRY_ON_RELEASE", this.showPointWindow);
		return true;
	}
	
	/**
	 * showPointWindow
	 *
	 * Shows the info window when a point is clicked
	 *
	 * @since Mon Oct 08 2007
	 * @param Event event
	 * @return void
	 **/
	function showPointWindow(event) {
		event.target.openInfoWindow({title: event.target.name, content: event.target.description});
	}
}