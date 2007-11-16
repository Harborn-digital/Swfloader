//-------------------- ricoAjaxEngine.js - rico ajax engine made suitable for prototype 1.5
AjaxEngine = Class.create();

AjaxEngine.prototype = {

   initialize: function() {
      this.ajaxElements = new Array();
      this.ajaxObjects  = new Array();
      this.requestURLS  = new Array();
      this.options = {};
   },

   registerAjaxElement: function( anId, anElement ) {
      if ( !anElement )
         anElement = $(anId);
      this.ajaxElements[anId] = anElement;
   },

   registerAjaxObject: function( anId, anObject ) {
      this.ajaxObjects[anId] = anObject;
   },

   registerRequest: function (requestLogicalName, requestURL) {
      this.requestURLS[requestLogicalName] = requestURL;
   },

   sendRequest: function(requestName, options) {
      // Allow for backwards Compatibility
      if ( arguments.length >= 2 )
       if (typeof arguments[1] == 'string')
         options = {parameters: this._createQueryString(arguments, 1)};
      this.sendRequestWithData(requestName, null, options);
   },

   sendRequestWithData: function(requestName, xmlDocument, options) {
      var requestURL = this.requestURLS[requestName];
      if ( requestURL == null )
         return;

      // Allow for backwards Compatibility
      if ( arguments.length >= 3 )
        if (typeof arguments[2] == 'string')
          options.parameters = this._createQueryString(arguments, 2);

      new Ajax.Request(requestURL, this._requestOptions(options,xmlDocument));
   },

   sendRequestAndUpdate: function(requestName,container,options) {
      // Allow for backwards Compatibility
      if ( arguments.length >= 3 )
        if (typeof arguments[2] == 'string')
          options.parameters = this._createQueryString(arguments, 2);

      this.sendRequestWithDataAndUpdate(requestName, null, container, options);
   },

   sendRequestWithDataAndUpdate: function(requestName,xmlDocument,container,options) {
      var requestURL = this.requestURLS[requestName];
      if ( requestURL == null )
         return;

      // Allow for backwards Compatibility
      if ( arguments.length >= 4 )
        if (typeof arguments[3] == 'string')
          options.parameters = this._createQueryString(arguments, 3);

      var updaterOptions = this._requestOptions(options,xmlDocument);

      new Ajax.Updater(container, requestURL, updaterOptions);
   },

   // Private -- not part of intended engine API --------------------------------------------------------------------

   _requestOptions: function(options,xmlDoc) {
      var sendMethod = 'post';
      (!options) ? options = {} : '';

      if (!options._RicoOptionsProcessed){
      // Check and keep any user onComplete functions
        if (options.onComplete)
             options.onRicoComplete = options.onComplete;
        // Fix onComplete
        if (options.overrideOnComplete)
          options.onComplete = options.overrideOnComplete;
        else
          options.onComplete = this._onRequestComplete.bind(this);
        options._RicoOptionsProcessed = true;
      }

     // Set the default options and extend with any user options
     this.options = {
                     parameters:     options.parameters,
                     postBody:       xmlDoc,
                     method:         sendMethod,
                     onComplete:     options.onComplete
                    };
     // Set any user options:
     Object.extend(this.options, options);
     return this.options;
   },

   _createQueryString: function( theArgs, offset ) {
      var queryString = ""
      for ( var i = offset ; i < theArgs.length ; i++ ) {
          if ( i != offset )
            queryString += "&";

          var anArg = theArgs[i];

          if ( anArg.name != undefined && anArg.value != undefined ) {
            queryString += anArg.name +  "=" + encodeURIComponent(anArg.value.replace("&amp;", "&") ) ;
          }
          else {
             var ePos  = anArg.indexOf('=');
             var argName  = anArg.substring( 0, ePos );
             var argValue = anArg.substring( ePos + 1 );
			 queryString += argName + "=" + encodeURIComponent(argValue.replace("&amp;", "&") );

          }
      }
      return queryString;
   },

   _onRequestComplete : function(request) {
      if(!request)
          return;
      // User can set an onFailure option - which will be called by prototype
      if (request.status != 200)
        return;

      var response = request.responseXML.getElementsByTagName("ajax-response");
      if (response == null || response.length != 1)
         return;
      this._processAjaxResponse( response[0].childNodes );

      // Check if user has set a onComplete function
      var onRicoComplete = this.options.onRicoComplete;
      if (onRicoComplete != null)
          onRicoComplete();
   },

   _processAjaxResponse: function( xmlResponseElements ) {
      for ( var i = 0 ; i < xmlResponseElements.length ; i++ ) {
         var responseElement = xmlResponseElements[i];

         // only process nodes of type element.....
         if ( responseElement.nodeType != 1 )
            continue;

         var responseType = responseElement.getAttribute("type");
         var responseId   = responseElement.getAttribute("id");

         if ( responseType == "object" )
            this._processAjaxObjectUpdate( this.ajaxObjects[ responseId ], responseElement );
         else if ( responseType == "element" )
            this._processAjaxElementUpdate( this.ajaxElements[ responseId ], responseElement );
         else
            alert('unrecognized AjaxResponse type : ' + responseType );
      }
   },

   getContentAsString: function( parentNode ) {
      return parentNode.xml != undefined ?
         this._getContentAsStringIE(parentNode) :
         this._getContentAsStringMozilla(parentNode);
   },

  _getContentAsStringIE: function(parentNode) {
     var contentStr = "";
     for ( var i = 0 ; i < parentNode.childNodes.length ; i++ ) {
         var n = parentNode.childNodes[i];
         if (n.nodeType == 4) {
             contentStr += n.nodeValue;
         }
         else {
           contentStr += n.xml;
       }
     }
     return contentStr;
  },

  _getContentAsStringMozilla: function(parentNode) {
     var xmlSerializer = new XMLSerializer();
     var contentStr = "";
     for ( var i = 0 ; i < parentNode.childNodes.length ; i++ ) {
          var n = parentNode.childNodes[i];
          if (n.nodeType == 4) { // CDATA node
              contentStr += n.nodeValue;
          }
          else {
            contentStr += xmlSerializer.serializeToString(n);
        }
     }
     return contentStr;
  },


   _processAjaxObjectUpdate: function( ajaxObject, responseElement ) {
      ajaxObject.ajaxUpdate( responseElement );
   },

   _processAjaxElementUpdate: function( ajaxElement, responseElement ) {
      ajaxElement.innerHTML = this.getContentAsString(responseElement);
   }

}

var ajaxEngine = new AjaxEngine();
