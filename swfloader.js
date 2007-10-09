/**
 * SWFLoader is the javascript loader class for flash embedding
 * Launches the expressinstall when the user doesn't have the required flash version installed
 *
 * This class can also load a Javascript / Actionscript Connection (not yet)
 *
 * Changelog
 * ---------
 *
 * Niels Nijens Fri Sep 21 2007
 * -----------------------------
 * - Added addFlashConfigVars(); for WMFlashConfig
 *
 * Niels Nijens Mon Sep 17 2007
 * -----------------------------
 * - Added size check for the expressinstall
 * - Added addAlternateContentCallback();
 *
 * Niels Nijens Fri Sep 14 2007
 * -----------------------------
 * - Added workaround (onunload) for IE video streaming bug in Flash Player
 * - Added default alternate content
 *
 * To do
 * ---------
 * - Add Javascript / Flash Gateway code
 * - Add Error handler to handle errors from within Flash
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
		this.requiredVersion = {"major" : 9, "minor" : 0, "rev" : 28};
		this.expressInstallVersion = {"major" : 6, "minor" : 0, "rev" : 65};
		this.expressInstallSize = {"width" : 215, "height" : 138};
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
	 * @param string bgcolor -- transparent also works
	 * @param boolean wmode
	 * @param object swfvars
	 * @return void
	 **/
	load: function(element, swfname, swffile, width, height, bgcolor, swfvars) {
		if (this.checkPlayerVersion() ) {
			this.addSWF(element, swfname, swffile, width, height, bgcolor, swfvars);
		}
		else if (this.checkExpressInstallVersion() && this.checkExpressInstallSize(width, height) ) {
			this.addSWF(element, swfname, "/lib/swfloader/expressinstall.swf", width, height, bgcolor, {"SWFContainer" : element, "MMredirectURL" : escape(window.location), "MMdoctitle" : document.title});
		}
		else {
			this.addAlternateContent(element, width, height, bgcolor);
		}
	},
	
	/**
	 * loadSWFObject
	 *
	 * Adds a SWF file to the document when flash is available
	 * Otherwise adds alternate content to the element
	 * (This function should be used for extends of SWFObject, for example WmMediaPlayer)
	 *
	 * @since initial
	 * @param string element
	 * @param object swfobject
	 * @return void
	 **/
	loadSWFObject: function(element, swfobject) {
		if (this.checkPlayerVersion() ) {
			this.addSWFObject(element, swfobject);
		}
		else {
			this.addAlternateContent(element, width, height, bgcolor);
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
			this.installedVersion = {"major" : 0, "minor" : 0, "rev" : 0}
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
			return flashplayer.description.replace(/([a-zA-Z]|\s)+/, "").replace(/(\s+r|\s+b[0-9]+)/, ".").split(".");
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
	 * addSWF
	 *
	 * Adds a SWF to the swfobjects list and writes the SWFObject to the document
	 *
	 * @since initial
	 * @param string element
	 * @param string swfname
	 * @param string swffile
	 * @param integer width
	 * @param integer height
	 * @param string bgcolor
	 * @param boolean wmode
	 * @param object swfvars
	 * @return void
	 **/
	addSWF: function(element, swfname, swffile, width, height, bgcolor, swfvars) {
		swfobject = new SWFObject(swfname, swffile, width, height, bgcolor.replace("/#/", ""), swfvars);
		this.addSWFObject(element, swfobject);
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
			Element.setStyle(element, {"width" : width, "height" : height, "background-color" : bgcolor, "text-align" : "center"});
			$(element).innerHTML = "<a href='http://www.adobe.com/go/flashplayer' target='_blank'><img src='/lib/swfloader/images/getflashplayer.gif' border='0'/></a>";
			return true;
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
		console.log("test");
		this.addAlternateContent(element, width, height);
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
			window.attachEvent("onunload", this.cleanupSWFObjects);
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
 * Niels Nijens Tue Sep 18 2007
 * -----------------------------
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
		this.initAttributes({"swffile" : swffile, "swfname" : swfname, "width" : width, "height" : height});
		this.initParams({"quality" : "high", "menu" : "false", "AllowScriptAccess" : "always", "bgcolor" : this.getColor(bgcolor), "wmode" : this.getWMode(bgcolor)});
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
		this.addVariable("swfname", this.getAttribute("swffile").substr(this.getAttribute("swffile").lastIndexOf("/") + 1, this.getAttribute("swffile").length - (this.getAttribute("swffile").lastIndexOf("/") + 5) ) );
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
	}
}

var swfloader = new SWFLoader();