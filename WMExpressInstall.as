/**
 * WMExpressInstall is the Flash autoupdater for Windmill Flash applications
 *
 * @since Fri Sep 14 2007
 * @author Niels Nijens (niels@connectholland.nl)
 **/
class WMExpressInstall {
	
	/**
	 * The 
	 *
	 **/
	private var installContainer:MovieClip;
	
	/**
	 *
	 *
	 **/
	private var updateSWF:MovieClip;
	
	private var loadInterval;
	
	/**
	 *
	 *
	 **/
	function WMExpressInstall() {
		System.security.allowDomain("fpdownload.adobe.com");
		
	}
	
	/**
	 *
	 *
	 **/
	public function run() {
		this.loadUpdater();
	}
	
	/**
	 *
	 *
	 **/
	private function loadUpdater():Void {
		var _self = this;
		trace("loadUpdater");
		// hope that nothing is at a depth of 10000007, you can change this depth if needed, but you want
		// it to be on top of your content if you have any stuff on the first frame
		installContainer = _root.createEmptyMovieClip("WMExpressInstallContainer", 10000007);

		// register the callback so we know if they cancel or there is an error
		installContainer.installStatus = _self.onInstallStatus;
		updateSWF = installContainer.createEmptyMovieClip("updater", 1);
		
		// can't use movieClipLoader because it has to work in 6.0.65
		updateSWF.onEnterFrame = function() {
			trace("test");
			if (typeof updateSWF.startUpdate == 'function') {
				_self.runUpdater();
				this.onEnterFrame = null;
			}
		}

		var cacheBuster:Number = Math.random();
		updateSWF.loadMovie("http://fpdownload.adobe.com/pub/flashplayer/update/current/swf/autoUpdater.swf?"+ cacheBuster);
	}
	
	/**
	 *
	 *
	 **/
	private function runUpdater():Void {
		trace("runUpdater");
		this.updateSWF.redirectURL = "http://swfloader.rio/";
		this.updateSWF.MMplayerType = "ActiveX";
		this.updateSWF.MMdoctitle = "test";
		this.updateSWF.startUpdate();
	}
	
	/**
	 *
	 *
	 **/
	private function onInstallStatus(msg):Void {
		trace(msg);
		if (msg == "Download.Complete") {
			// Installation is complete. In most cases the browser window that this SWF 
			// is hosted in will be closed by the installer or manually by the end user
		} else if (msg == "Download.Cancelled") {
			// The end user chose "NO" when prompted to install the new player
			// by default no User Interface is presented in this case. It is left up to 
			// the developer to provide an alternate experience in this case

			// feel free to change this to whatever you want, js errors are sufficient for this example
			getURL("javascript:alert('This content requires a more recent version of the Adobe Flash Player.')");
		} else if (msg == "Download.Failed") {
			// The end user failed to download the installer due to a network failure
			// by default no User Interface is presented in this case. It is left up to 
			// the developer to provide an alternate experience in this case

			// feel free to change this to whatever you want, js errors are sufficient for this example
			getURL("javascript:alert('There was an error downloading the Flash Player update. Please try again later, or visit adobe.com/go/getflashplayer/ to download the latest version of the Flash plugin.')");
		}
	}
}