/**
 * WMFlashConfigEvent is the event being called when WMFlashConfig is done loading
 *
 * Changelog
 * ---------
 * 
 * Niels Nijens Tue Sep 18 2007
 * ----------------------------
 * - 
 * 
 * @since Tue Sep 18 2007
 * @author Niels Nijens (niels@connectholland.nl)
 * @package windmill.config
 **/
package windmill.config {
	import flash.events.Event;
	
	public class WMFlashConfigEvent extends flash.events.Event {
		
		/**
		 * READY
		 *
		 * Event constant
		 * 
		 * @since initial
		 * @var String constant
		 **/
		public static const READY:String = "ready";
		
		/**
		 * WMFlashConfigEvent
		 *
		 * Creates a new instance of WMFlashConfigEvent
		 *
		 * @since initial
		 * @return WMFlashConfigEvent
		 **/
		function WMFlashConfigEvent() {
			super(READY);
		}
	}
}