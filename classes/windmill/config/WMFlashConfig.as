/**
 * WMFlashConfig is the base config / content loader
 * (for QA-proof flash movies)
 *
 * Changelog
 * ---------
 * 
 * Niels Nijens Tue Sep 18 2007
 * ----------------------------
 * - 
 *
 * To Do
 * ---------
 * - Add setVariable
 * 
 * @since Tue Sep 18 2007
 * @author Niels Nijens (niels@connectholland.nl)
 * @package windmill.config
 **/
package windmill.config {
	import flash.display.Loader;
    import flash.display.LoaderInfo;
	import flash.display.Sprite;
	import flash.events.*;
	import flash.net.*;
	import windmill.config.*;
	
	public class WMFlashConfig extends Sprite {
		
		/**
		 * swfname
		 *
		 * The name of the SWF
		 * 
		 * @since initial
		 * @access protected
		 * @var String
		 **/
		protected var swfname:String;
		
		/**
		 * swfpath
		 *
		 * The path to the SWF location
		 * 
		 * @since initial
		 * @access protected
		 * @var String
		 **/
		protected var swfpath:String;
		
		/**
		 * XMLloader
		 *
		 * The loader that loads the XML
		 * 
		 * @since initial
		 * @access protected
		 * @var URLLoader
		 **/
		protected var XMLloader:URLLoader;
		
		/**
		 * xml
		 *
		 * The XML document
		 * 
		 * @since initial
		 * @access protected
		 * @var XML
		 **/
		protected var xml:XML;
		
		/**
		 * WMFlashConfig
		 *
		 * Creates a new instance of WMFlashConfig
		 *
		 * @since initial
		 * @access public
		 * @param Object flashVars
		 * @return WMFlashConfig
		 **/
		public function WMFlashConfig(flashVars:Object) {
			this.swfname = flashVars.swfname;
			this.swfpath = flashVars.swfpath;
		}
		
		/**
		 * load
		 *
		 * Loads the config
		 *
		 * @since initial
		 * @access public
		 * @return void
		 **/
		public function load() {
			this.loadXML();
		}
		
		/**
		 * loadXML
		 *
		 * Loads the config XML file
		 *
		 * @since initial
		 * @access protected
		 * @return void
		 **/
		protected function loadXML() {
			this.XMLloader = new URLLoader();
			this.XMLloader.addEventListener(Event.COMPLETE, this.onLoadedXML);
			this.XMLloader.load(new URLRequest(this.swfpath + this.swfname + ".xml" + this.noCache() ) );
		}
		
		/**
		 * noCache
		 *
		 * Returns a random string to prevent caching of the XML
		 *
		 * @since initial
		 * @access protected
		 * @return String
		 **/
		protected function noCache() {
			return "?" + Math.random();
		}
		
		/**
		 * onLoadedXML
		 *
		 * Parses the XML string into the XML object and dispatches the READY Event
		 *
		 * @since initial
		 * @access protected
		 * @param Event event
		 * @return void
		 **/
		protected function onLoadedXML(event:Event) {
			this.xml = new XML(event.target.data);
			dispatchEvent(new WMFlashConfigEvent() );
		}
		
		/**
		 * getVariable
		 *
		 * Returns the variable(s) by path/name
		 * Returns false if the xml isn't loaded yet
		 *
		 * @since initial
		 * @access public
		 * @param String name
		 * @return mixed
		 **/
		public function getVariable(name:String) {
			if (this.xml) {
				var query:Array = name.split(".");
				var results = this.xml;
				
				for (var i = 0; i < query.length; i++) {
					results = results.child(query[i]);
				}
				
				return results;
			}
			return false;
		}
		
		/**
		 * setVariable
		 *
		 * Sets a config variable
		 *
		 * @since initial
		 * @access public
		 * @param String name
		 * @param String value
		 * @return void
		 **/
		public function setVariable(name:String, value:String) {
			
		}
	}
}