/**
 * SWFLoader is the javascript loader class for flash embedding
 * Launches the expressinstall when the user doesn't have the required flash version installed
 *
 * This class also handles communication between the Flash movie and the JavaScript class
 *
 * Changelog
 * ---------
 *
 * Niels Nijens - Mon Nov 10 2008
 * --------------------------------
 * - Added Debug interface for the new Debug class
 *
 * Niels Nijens - Thu Nov 06 2008
 * --------------------------------
 * - Added deeplinking
 *
 * Niels Nijens - Mon May 19 2008
 * --------------------------------
 * - Fixed version retrieval for Flash Player 10 beta
 *
 * Niels Nijens - Tue Apr 01 2008
 * --------------------------------
 * - Changed required version from 9.0.47 to 9.0.115 due to some flash functionalities not working
 *
 * Niels Nijens - Mon Mar 10 2008
 * --------------------------------
 * - Changed required version from 9.0.28 to 9.0.47 due to components bug
 *
 * Niels Nijens - Fri Nov 16 2007
 * --------------------------------
 * - Changed SWFCall(); so it will run registered callback functions
 *
 * Niels Nijens - Mon Oct 22 2007
 * --------------------------------
 * - Added unload function
 * - Added timeout function to unload SWFObjects
 *
 * Niels Nijens - Mon Oct 22 2007
 * --------------------------------
 * - Made load() and loadSWFObject() the same, loadSWFObject() missed the expressinstall functionality
 * - Fixed bgcolor error
 *
 * Niels Nijens - Mon Oct 15 2007
 * --------------------------------
 * - Made SWFError(); able to call from Flash
 * - Added arguments to function calls from Flash (thanks to Giso)
 *
 * Niels Nijens - Fri Sep 21 2007
 * --------------------------------
 * - Added addFlashConfigVars(); for WMFlashConfig
 *
 * Niels Nijens - Mon Sep 17 2007
 * --------------------------------
 * - Added size check for the expressinstall
 * - Added addAlternateContentCallback();
 *
 * Niels Nijens - Fri Sep 14 2007
 * --------------------------------
 * - Added workaround (onunload) for IE video streaming bug in Flash Player
 * - Added default alternate content
 *
 * To do
 * ---------
 * -
 *
 * @since Thu Sep 13 2007
 * @author Niels Nijens (niels@connectholland.nl)
 **/
var SWFLoader = Class.create();
SWFLoader.prototype = {

	/**
	 * initialize
	 *
	 * Initialize a new SWFLoader
	 *
	 * @since initial
	 * @return void
	 **/
	initialize: function() {
		this.swfobjects = {};
		this.deeplinkListener = null;
		this.requiredVersion = {"major" : 9, "minor" : 0, "rev" : 115};
		this.expressInstallVersion = {"major" : 6, "minor" : 0, "rev" : 65};
		this.expressInstallSize = {"width" : 215, "height" : 138};
		window.SWFCall = this.SWFCall.bind(this);
		window.SWFError = this.SWFError.bind(this);
		window.SWFLogStart = this.SWFLogStart.bind(this);
		window.SWFLogEnd = this.SWFLogEnd.bind(this);
		window.SWFDebug = this.SWFDebug.bind(this);
		window.SWFDeeplink = this.SWFDeeplink.bind(this);
		this.initUnload();
	},

	/**
	 * load
	 *
	 * Adds a SWF file to the document when flash is available
	 * Otherwise adds alternate content to the element
	 *
	 * @since initial
	 * @param string element
	 * @param string swfname
	 * @param string swffile
	 * @param integer width
	 * @param integer height
	 * @param string bgcolor - transparent also works
	 * @param boolean wmode
	 * @param object swfvars
	 * @return void
	 **/
	load: function(element, swfname, swffile, width, height, bgcolor, swfvars) {
		swfobject = this.getSWFObject(element, swfname, swffile, width, height, bgcolor, swfvars);
		this.loadSWFObject(element, swfobject);
	},

	/**
	 * loadSWFObject
	 *
	 * Adds a SWF file to the document when flash is available
	 * Otherwise adds alternate content to the element
	 * (This function should be used for extends of SWFObject, for example MPlayerObject)
	 *
	 * @since initial
	 * @param string element
	 * @param object swfobject
	 * @return void
	 **/
	loadSWFObject: function(element, swfobject) {
		swfName = swfobject.getAttribute("swfname");
		swfWidth = swfobject.getAttribute("width");
		swfHeight = swfobject.getAttribute("height");
		
		this.checkDeeplinking(swfobject);
		
		if (this.checkPlayerVersion() ) {
			this.addSWFObject.bind(this).defer(element, swfobject);
		}
		else if (this.checkExpressInstallVersion() && this.checkExpressInstallSize(swfWidth, swfHeight) ) {
			installObject = this.getSWFObject(element, swfName, "/lib/swfloader/expressinstall.swf", swfWidth, swfHeight, "transparent", {"SWFContainer" : element, "MMredirectURL" : escape(window.location), "MMdoctitle" : document.title});
			this.addSWFObject.bind(this).defer(element, installObject);
		}
		else {
			this.addAlternateContent(element, swfWidth, swfHeight);
		}
	},

	/**
	 * checkPlayerVersion
	 *
	 * Returns true if the required flash version is available
	 *
	 * @since initial
	 * @return boolean
	 **/
	checkPlayerVersion: function() {
		installedVersion = this.getPlayerVersion();
		if (this.getVersionInt(installedVersion) >= this.getVersionInt(this.requiredVersion) ) {
			return true;
		}
		return false;
	},

	/**
	 * checkPlayerVersion
	 *
	 * Returns true if the flash version required for the express install is available
	 *
	 * @since initial
	 * @return boolean
	 **/
	checkExpressInstallVersion: function() {
		installedVersion = this.getPlayerVersion();
		if (this.getVersionInt(installedVersion) >= this.getVersionInt(this.expressInstallVersion) ) {
			return true;
		}
		return false;
	},

	/**
	 * checkExpressInstallSize
	 *
	 * Returns true if width and height are equal or greater than the required size for the express install
	 *
	 * @since initial
	 * @param integer width
	 * @param integer height
	 * @return boolean
	 **/
	checkExpressInstallSize: function(width, height) {
		if (width >= this.expressInstallSize.width && height >= this.expressInstallSize.height) {
			return true;
		}
		return false;
	},

	/**
	 * getPlayerVersion
	 *
	 * Returns the installed version of flash
	 *
	 * @since initial
	 * @return object
	 **/
	getPlayerVersion: function() {
		if (!this.installedVersion) {
			this.installedVersion = {"major" : 0, "minor" : 0, "rev" : 0};
			if(navigator.plugins && navigator.mimeTypes.length) {
				version = this.getPlayerVersionFF();
			} else {
				version = this.getPlayerVersionIE();
			}
			if (version) {
				var i = 0;
				for (property in this.installedVersion) {
					this.installedVersion[property] = version[i] != null ? parseInt(version[i]) : 0;
					i++;
				}
			}
		}
		return this.installedVersion;
	},

	/**
	 * getVersionInt
	 *
	 * Returns an Integer of the version
	 *
	 * @since Fri Sep 14 2007
	 * @param object version
	 * @return integer
	 **/
	getVersionInt: function(version) {
		return (version.major * Math.pow(1000, 2) ) + (version.minor * 1000) + version.rev;
	},

	/**
	 * getPlayerVersionFF
	 *
	 * Returns the Flash version for FireFox and other browsers
	 * Returns false if Flash isn't available
	 *
	 * @since initial
	 * @return mixed
	 **/
	getPlayerVersionFF: function() {
		var flashplayer = navigator.plugins["Shockwave Flash"];
		if(flashplayer && flashplayer.description) {
			var version = flashplayer.description.replace(/([a-zA-Z]|\s)+/, "").replace(/(\s+r|\s+b[0-9]+)/, ".").split(".");
			if (version[2] == "") {
				version[2] = "0";
			}
			
			return version;
		}
		return false;
	},

	/**
	 * getPlayerVersionIE
	 *
	 * Returns the Flash version for Internet Exploder browsers
	 * Returns false if Flash isn't available
	 *
	 * @since initial
	 * @return mixed
	 **/
	getPlayerVersionIE: function() {
		try {
			flashplayer = new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
			flashplayer.AllowScriptAccess = "always";
			return flashplayer.GetVariable("$version").split(" ")[1].split(",");
		}
		catch(e) {
			return false;
		}
	},

	/**
	 * getSWFObject
	 *
	 * Adds a SWF to the swfobjects list and writes the SWFObject to the document
	 *
	 * @since Mon Oct 22 2007 (previously known as addSWF() )
	 * @param string element
	 * @param string swfname
	 * @param string swffile
	 * @param integer width
	 * @param integer height
	 * @param string bgcolor
	 * @param boolean wmode
	 * @param object swfvars
	 * @return SWFObject
	 **/
	getSWFObject: function(element, swfname, swffile, width, height, bgcolor, swfvars) {
		swfobject = new SWFObject(swfname, swffile, width, height, bgcolor.replace(/#/g, ""), swfvars);
		
		return swfobject;
	},

	/**
	 * addSWFObject
	 *
	 * Adds a SWF to the swfobjects list and writes the SWFObject to the document
	 *
	 * @since initial
	 * @param string element
	 * @param object swfobject
	 * @return void
	 **/
	addSWFObject: function(element, swfobject) {
		swfname = swfobject.getAttribute("swfname");
		this.swfobjects[swfname] = {};
		this.swfobjects[swfname]["element"] = $(element);
		this.swfobjects[swfname]["object"] = swfobject;
		this.swfobjects[swfname]["object"].write(element);
	},

	/**
	 * addAlternateContent
	 *
	 * Adds alternate content to the document where the Flash should have been
	 *
	 * @since initial
	 * @param string element
	 * @param integer width
	 * @param integer height
	 * @param string bgcolor
	 * @return void
	 **/
	addAlternateContent: function(element, width, height, bgcolor) {
		if ($(element) ) {
			var noflashelements = $(element).select(".noflash");
			if (noflashelements.length > 0) {
				noflashelements.invoke("show").invoke("fire", "swfloader:shown-noflashelement", {"swfloader": this} );
				return true;
			}
			else {
				$(element).setStyle( {"width": width, "height": height, "textAlign": "center"} );
				$(element).innerHTML = "<a class='swfloadergetflash' href='http://www.adobe.com/go/flashplayer' target='_blank'><img src='/lib/swfloader/images/getflashplayer.gif' border='0'/></a>";
				$(element).fire("swfloader:loaded-getflashplayer", {"swfloader": this} );
				return true;
			}
		}
		return false;
	},

	/**
	 * addAlternateContentCallback
	 *
	 * Callback function for when the autoupdate fails or has been canceled by the user
	 *
	 * @since Mon Sep 17 2007
	 * @param object swf
	 * @return void
	 **/
	addAlternateContentCallback: function(element, width, height) {
		this.addAlternateContent(element, width, height);
	},
	
	/**
	 * unload
	 *
	 * Unloads a SWFObject from the document
	 *
	 * @since Wed Oct 31 2007
	 * @param string swfname
	 * @return void
	 **/
	unload: function(swfname) {
		this.processUnload.bind(this).defer(swfname);
	},
	
	/**
	 * processUnload
	 *
	 * Unloads a SWFObject from the document
	 *
	 * @since Wed Oct 31 2007
	 * @param string swfname
	 * @return void
	 **/
	processUnload: function(swfname) {
		divElement = this.getDivByName(swfname);
		if (divElement) {
			divElement.removeChild(divElement.getElementsByTagName("embed")[0]);
			this.swfobjects[swfname] = undefined;
		}
	},
	
	/**
	 * getSWFObjectByName
	 *
	 * Returns the SWFObject with name swfname if it exists
	 * Otherwise returns false
	 *
	 * @since initial
	 * @param string swfname
	 * @return mixed
	 **/
	getSWFObjectByName: function(swfname) {
		if (this.swfobjects[swfname]) {
			return this.swfobjects[swfname]["object"];
		}
		else {
			return false;
		}
	},

	/**
	 * getDivByName
	 *
	 * Returns the div element with name swfname if it exists
	 * Otherwise returns false
	 *
	 * @since initial
	 * @param string swfname
	 * @return mixed
	 **/
	getDivByName: function(swfname) {
		if (this.swfobjects[swfname]) {
			return this.swfobjects[swfname]["element"];
		}
		else {
			return false;
		}
	},

	/**
	 * SWFCall
	 *
	 * Javascript interface for calls from SWFs
	 *
	 * @since Thu Oct 11 2007
	 * @return mixed
	 **/
	SWFCall: function() {
		flashVars = $A(arguments);
		
		swfname = flashVars.shift();
		methodName = flashVars.shift();
		methodVars = flashVars;
		
		swfobject = this.getSWFObjectByName(swfname);
		if (swfobject) {
			callbackFunction = swfobject.getCallbackByMethod(methodName);
			if (typeof(callbackFunction["callback"]) == "function") {
				return callbackFunction["callback"].apply(swfobject, methodVars);
			}
			else if (typeof(swfobject[methodName]) == "function") {
				return swfobject[methodName].apply(swfobject, methodVars);
			}
			else {
				this.SWFError("Method " + methodName + " doesn't exist in object " + swfname + ".");
			}
		}
		else {
			this.SWFError("Object with name " + swfname + " doesn't exist.");
		}
	},
	
	/**
	 * SWFLogStart
	 *
	 * Starts time log
	 * (For developers only)
	 *
	 * @since Thu Mar 20 2007
	 * @param object debugInfo
	 * @return void
	 **/
	SWFLogStart: function(debugInfo) {
		if (console) {
			console.log("loading (" + debugInfo.id + "): " + debugInfo.url);
			console.time("response time (" + debugInfo.id + ")");
		}
	},
	
	/**
	 * SWFLogEnd
	 *
	 * Ends time log
	 * (For developers only)
	 *
	 * @since Thu Mar 20 2007
	 * @param object debugInfo
	 * @return void
	 **/
	SWFLogEnd: function(debugInfo) {
		if (console) {
			console.timeEnd("response time (" + debugInfo.id + ")");
			console.log(debugInfo);
		}
	},
	
	/**
	 * SWFError
	 *
	 * Prints an error in the console
	 * (For developers only)
	 *
	 * @since Thu Oct 11 2007
	 * @param string message
	 * @param boolean log
	 * @return void
	 **/
	SWFError: function(message, log) {
		if ( $("consolewindow") ) {
			if (!log) {
				message = "ERROR: " + message;
			}
			
			$("consolewindow").innerHTML += message + "<br/>";
			
			return;
		}
		if (console) {
			if (log) {
				console.log(message);
			}
			else {
				console.error("ERROR: " + message);
			}
			
			return;
		}
	},
	
	/**
	 * SWFDebug
	 *
	 * Displays Debug messages from the SWF
	 *
	 * @since Mon Nov 10 2008
	 * @return void
	 **/
	SWFDebug: function(level) {
		var args = $A(arguments);
		args.shift();
		if (typeof(console) != "undefined" && typeof(console.error) == "function" && typeof(console.warn) == "function" && typeof(console.log) == "function") {
			switch (level) {
				case 1:
					console.error.apply(console, args);
					break;
				case 2:
					console.warn.apply(console, args);
					break;
				default:
					console.log.apply(console, args);
					break;
			}
		}
		else {
			throw Error(args);
		}
	},
	
	/**
	 * checkDeeplink
	 *
	 * Checks if deeplinking should be enabled for swfobject
	 *
	 * @since Thu Nov 06 2008
	 * @param SWFObject swfobject
	 * @return void
	 **/
	checkDeeplinking: function(swfobject) {
		var swfvars = swfobject.getVariables();
		if (swfvars["deeplinking"] == true) {
			swfobject.deeplinking = true;
			if (this.deeplinkListener == null) {
				this.deeplinkListener = new PeriodicalExecuter(this.broadcastDeeplink.bind(this), 0.05);
			}
		}
	},
	
	/**
	 * SWFDeeplink
	 *
	 * Deeplink functionality for flash websites
	 *
	 * @since Thu Nov 06 2008
	 * @param string link
	 * @param string title
	 * @return void
	 **/
	SWFDeeplink: function(link, title) {
		document.location.hash = "#" + link;
		if (title != "") {
			document.title = title;
		}
	},
	
	/**
	 * broadcastDeeplink
	 *
	 * Deeplink listener. Broadcasts the deeplink to the SWFObject's that have deeplinking enabled
	 *
	 * @since Thu Nov 06 2008
	 * @param string link
	 * @param string title
	 * @return void
	 **/
	broadcastDeeplink: function() {
		var deeplink = document.location.hash.replace(/#/g, "");
		if (deeplink != "" && this.broadcastedDeeplink != deeplink) {
			this.broadcastedDeeplink = deeplink;
			
			for (var swfname in this.swfobjects) {
				if (this.swfobjects[swfname]["object"].deeplinking) {
					this.swfobjects[swfname]["object"].setDeeplink(deeplink);
				}
			}
		}
	},
	
	/**
	 * initUnload
	 *
	 * Adds an onunload event to the document
	 * This is needed for an IE video streaming bug in Flash Player
	 *
	 * See: http://blog.deconcept.com/2006/07/28/swfobject-143-released/
	 *
	 * @since Fri Sep 14 2007
	 * @return void
	 **/
	initUnload: function() {
		if (!window.opera && document.all) {
			__flash_unloadHandler = function(){};
			__flash_savedUnloadHandler = function(){};
			
			//window.attachEvent("onunload", this.cleanupSWFObjects);
		}
	},

	/**
	 * cleanupSWFObjects
	 *
	 * Cleans up all the object elements
	 *
	 * @since Fri Sep 14 2007
	 * @return void
	 **/
	cleanupSWFObjects: function() {
		if (window.opera || !document.all) {
			return;
		}

		var objects = document.getElementsByTagName("object");
		for (i = 0; i < objects.length; i++) {
			objects[i].style.display = 'none';
			for (var x in objects[i]) {
				if (typeof objects[i][x] == 'function') {
					objects[i][x] = function() { };
				}
			}
		}
	}
}

/**
 * SWFObject
 *
 * Changelog
 * ---------
 *
 * Niels Nijens - Fri Nov 16 2007
 * -------------------------------
 * - Added registerCallback(); and getCallbackByMethod(); to override function calls from flash
 *
 * Niels Nijens - Mon Nov 05 2007
 * -------------------------------
 * - Added getContainer(); to get the SWFObject's parent div
 *
 * Niels Nijens - Mon Oct 22 2007
 * -------------------------------
 * - Added methodExists(); for flash function calls
 *
 * Niels Nijens - Tue Sep 18 2007
 * -------------------------------
 * - Added getColor and getWmode to combine them into one variable bgcolor
 *
 * @since Thu Sep 13 2007
 * @author Niels Nijens (niels@connectholland.nl)
 **/
var SWFObject = Class.create();
SWFObject.prototype = {

	/**
	 * initialize
	 *
	 * Initialize a new SWFObject
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
		this.deeplinking = false;
		this.registeredCallbacks = {};
		
		this.initAttributes({"swffile" : swffile, "swfname" : swfname, "width" : width, "height" : height});
		this.initParams({"quality" : "high", "menu" : "false", "scale" : "noscale", "AllowScriptAccess" : "always", "bgcolor" : this.getColor(bgcolor), "wmode" : this.getWMode(bgcolor)});
		this.initVariables(swfvars);
		this.addFlashConfigVars();
	},

	/**
	 * initAttributes
	 *
	 * Creates and Fills the attributes object with variables
	 * (Is used for basic variables like filepath and the name of the SWF)
	 *
	 * @since initial
	 * @param object attributes
	 * @return void
	 **/
	initAttributes: function(attributes) {
		this.attributes = {};

		for(property in attributes) {
			if (attributes[property]) {
				this.setAttribute(property, attributes[property]);
			}
		}
	},

	/**
	 * initParams
	 *
	 * Creates and Fills the params object with variables
	 * (Is used for basic variables like bgcolor and wmode)
	 *
	 * @since initial
	 * @param object params
	 * @return void
	 **/
	initParams: function(params) {
		this.params = {};

		for(property in params) {
			if (params[property]) {
				this.addParam(property, params[property]);
			}
		}
	},

	/**
	 * initVariables
	 *
	 * Creates and Fills the variables object with variables
	 * (Is used for variables to be send to flash)
	 *
	 * @since initial
	 * @param object variables
	 * @return void
	 **/
	initVariables: function(variables) {
		this.variables = {};

		for(property in variables) {
			if (variables[property]) {
				this.addVariable(property, variables[property]);
			}
		}
	},

	/**
	 * addFlashConfigVars
	 *
	 * Adds the variables required for WMFlashConfig
	 *
	 * @since Fri Sep 21 2007
	 * @return void
	 **/
	addFlashConfigVars: function() {
		this.addVariable("swfname", this.getAttribute("swffile").substr(this.getAttribute("swffile").lastIndexOf("/") + 1, this.getAttribute("swffile").lastIndexOf(".swf") - (this.getAttribute("swffile").lastIndexOf("/") + 1) ) );
		this.addVariable("swfpath", this.getAttribute("swffile").substr(0, this.getAttribute("swffile").lastIndexOf("/") + 1) );
	},

	/**
	 * getColor
	 *
	 * Returns the bgcolor
	 *
	 * @since Tue Sep 18 2007
	 * @param string bgcolor
	 * @return mixed
	 **/
	getColor: function(bgcolor) {
		if (bgcolor == "transparent") {
			return false;
		}
		return bgcolor;
	},

	/**
	 * getWMode
	 *
	 * Returns the wmode
	 *
	 * @since Tue Sep 18 2007
	 * @param string bgcolor
	 * @return mixed
	 **/
	getWMode: function(bgcolor) {
		if (bgcolor != "transparent") {
			return false;
		}
		return bgcolor;
	},

	/**
	 * setAttribute
	 *
	 * Adds a variable with name and value to the attributes object
	 *
	 * @since initial
	 * @param string name
	 * @param mixed value
	 * @return void
	 **/
	setAttribute: function(name, value){
		this.attributes[name] = value;
	},

	/**
	 * getAttribute
	 *
	 * Returns the value of an attribute by name
	 *
	 * @since initial
	 * @param string name
	 * @return mixed
	 **/
	getAttribute: function(name) {
		return this.attributes[name];
	},

	/**
	 * addParam
	 *
	 * Adds a variable with name and value to the params object
	 *
	 * @since initial
	 * @param string name
	 * @param mixed value
	 * @return void
	 **/
	addParam: function(name, value) {
		this.params[name] = value;
	},

	/**
	 * getParams
	 *
	 * Returns the params object
	 *
	 * @since initial
	 * @return object
	 **/
	getParams: function() {
		return this.params;
	},

	/**
	 * addVariable
	 *
	 * Adds a variable with name and value to the variables object
	 *
	 * @since initial
	 * @param string name
	 * @param mixed value
	 * @return void
	 **/
	addVariable: function(name, value){
		this.variables[name] = value;
	},

	/**
	 * getVariables
	 *
	 * Returns the variables object
	 *
	 * @since initial
	 * @return object
	 **/
	getVariables: function() {
		return this.variables;
	},

	/**
	 * getVariablePairs
	 *
	 * Returns the variables object as an array with strings
	 *
	 * @since initial
	 * @return array
	 **/
	getVariablePairs: function(){
		variables = this.getVariables();
		variablePairs = new Array();
		for(property in variables){
			variablePairs.push(property + "=" + variables[property]);
		}
		return variablePairs;
	},

	/**
	 * getSWFHTML
	 *
	 * Returns the HTML for the SWF
	 *
	 * @since initial
	 * @return string
	 **/
	getSWFHTML: function() {
		if (navigator.plugins && navigator.mimeTypes && navigator.mimeTypes.length) {
			this.addVariable("MMplayerType", "PlugIn");
			SWFNode = this.getSWFHTMLEmbed();
		} else {
			this.addVariable("MMplayerType", "ActiveX");
			SWFNode = this.getSWFHTMLObject();
		}
		return SWFNode;
	},

	/**
	 * getSWFHTMLEmbed
	 *
	 * Returns the HTML <embed> for the SWF
	 * (FireFox browsers)
	 *
	 * @since initial
	 * @return string
	 **/
	getSWFHTMLEmbed: function() {
		SWFNode = "<embed type='application/x-shockwave-flash' src='" + this.getAttribute("swffile") + "'";
		SWFNode += " width='" + this.getAttribute("width") + "' height='" + this.getAttribute("height") + "'";
		SWFNode += " id='" + this.getAttribute("swfname") + "' name='" + this.getAttribute("swfname") + "' ";
		SWFNode += this.getParamHTML(true);
		SWFNode += this.getVariableHTML(true);
		SWFNode += "/>";

		return SWFNode;
	},

	/**
	 * getSWFHTMLObject
	 *
	 * Returns the HTML <object> for the SWF
	 * (Internet Exploder browsers)
	 *
	 * @since initial
	 * @return string
	 **/
	getSWFHTMLObject: function() {
		SWFNode = "<object id='" + this.getAttribute("swfname") + "' classid='clsid:D27CDB6E-AE6D-11cf-96B8-444553540000'";
		SWFNode += " width='" + this.getAttribute("width") + "' height='" + this.getAttribute("height") + "'>";
		SWFNode += "<param name='movie' value='" + this.getAttribute("swffile") + "'/>";
		SWFNode += this.getParamHTML(false);
		SWFNode += this.getVariableHTML(false);
		SWFNode += "</object>";

		return SWFNode;
	},

	/**
	 * getParamHTML
	 *
	 * Returns the params as HTML string
	 *
	 * @since initial
	 * @param boolean embed
	 * @return string
	 **/
	getParamHTML: function(embed) {
		paramHTML = "";

		params = this.getParams();
		for(var property in params) {
			if (embed) {
				paramHTML += property + "='" + params[property] + "' ";
			}
			else {
				paramHTML += '<param name="'+ property +'" value="'+ params[property] +'" />';
			}
		}

		return paramHTML;
	},

	/**
	 * getVariableHTML
	 *
	 * Returns the variables as HTML string
	 *
	 * @since initial
	 * @param boolean embed
	 * @return string
	 **/
	getVariableHTML: function(embed) {
		variableHTML = "";

		variablestring = this.getVariablePairs().join("&");
		if (variablestring.length > 0) {
			if (embed) {
				variableHTML += "flashvars='" + variablestring + "'";
			}
			else {
				variableHTML += "<param name='flashvars' value='" + variablestring + "'/>";
			}
		}

		return variableHTML;
	},

	/**
	 * write
	 *
	 * Writes the SWF HTML to the document
	 * Returns true on success
	 *
	 * @since initial
	 * @return boolean
	 **/
	write: function(element) {
		if ($(element) ) {
			$(element).innerHTML = this.getSWFHTML();
			return true;
		}
		return false;
	},

	/**
	 * methodExists
	 *
	 * Returns if the method exists on the flash element
	 *
	 * @since Mon Oct 22 2007
	 * @param string methodName
	 * @return boolean
	 **/
	methodExists: function(methodName) {
		element = $(this.getAttribute("swfname") );
		if (element) {
			if (typeof(element[methodName]) == "function") {
				return true;
			}
		}
		return false;
	},
	
	/**
	 * registerCallback
	 *
	 * Registers a callback function to override the default function
	 *
	 * @since Fri Nov 16 2007
	 * @param string methodName
	 * @param function callbackFunction
	 * @return void
	 **/
	registerCallback: function(methodName, callbackFunction) {
		this.registeredCallbacks[methodName] = {};
		this.registeredCallbacks[methodName]["callback"] = callbackFunction;
	},
	
	/**
	 * getCallbackByMethod
	 *
	 * Returns the registered callback function
	 *
	 * @since Fri Nov 16 2007
	 * @param string methodName
	 * @return object
	 **/
	getCallbackByMethod: function(methodName) {
		if (this.registeredCallbacks[methodName] != undefined) {
			return this.registeredCallbacks[methodName];
		}
		return false;
	},
	
	/**
	 * getContainer
	 *
	 * Returns the parent (container) div of the SWFObject
	 *
	 * @since Mon Nov 05 2007
	 * @return mixed
	 **/
	getContainer: function() {
		return swfloader.getDivByName(this.getAttribute("swfname") );
	},
	
	/**
	 * setDeeplink
	 *
	 * Sets the deeplink
	 *
	 * @since Thu Nov 06 2008
	 * @param string link
	 * @return void
	 **/
	setDeeplink: function(link) {
		if (this.methodExists("setDeeplink") ) {
			$(this.getAttribute("swfname") ).setDeeplink(link);
		}
		else {
			this.setDeeplink.bind(this).delay(0.05, link);
		}
	}
}

var swfloader = new SWFLoader();
