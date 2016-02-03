


package windmill.media {
	import flash.display.Loader;
    import flash.display.LoaderInfo;
	import flash.display.Sprite;
	
	public class WMMediaPlayer extends Sprite {
		
		/**
		 * WmMediaPlayer
		 *
		 * Creates a new instance of WmMediaPlayer
		 *
		 * @since initial
		 * @access public
		 * @param Object flashVars
		 * @return WmMediaPlayer
		 **/
		public function WMMediaPlayer(swf, flashVars:Object) {
			this.swf = swf;
			this.prepareVariables(flashVars);
			this.prepareStage();
			this.createControls();
			this.createPlayer();
			this.loadMedia();
			this.contextMenu();
		}
	
		/**
		 * prepareVariables
		 *
		 * Sets the variables needed for WmMediaPlayer
		 *
		 * @since initial
		 * @access protected
		 * @param Object flashVars
		 * @return void
		 **/
		protected function prepareVariables(flashVars:Object) {
			this.setVariable("file", file);
			this.setVariable("delay", delay);
			this.setVariable("position", position);
			this.setVariable("volume", volume);
			this.setVariable("interfaceTemplate", template);
			this.setVariable("interfaceAlign", align);
		}
		
		/**
		 * setVariable
		 *
		 * Sets a variable with name and value
		 *
		 * @since initial
		 * @access protected
		 * @param String name
		 * @param Mixed value
		 * @return void
		 **/
		protected function setVariable(name:String, value) {
			if(value != null && value != undefined) {
				this[name] = value;
			}
		}
		
		/**
		 * prepareStage
		 *
		 * Gets the width and height and adds a listener for Stage resizing
		 *
		 * @since initial
		 * @access protected
		 * @return void
		 **/
		protected function prepareStage() {
			Stage.align = StageAlign.TOP_LEFT;
			Stage.scaleMode = StageScaleMode.NO_SCALE;
			this.width = Stage.stageWidth;
			this.height = Stage.stageHeight;
			
			Stage.addListener(Event.RESIZE, this.onResize);
		}
		
		/**
		 * createControls
		 *
		 * Creates the mediaplayer in the SWF file
		 *
		 * @since Thu Jan 25 2007
		 * @return void
		 **/
		function createControls() {
			var controlLoader:URLLoader = new URLLoader(new URLRequest(this.interfaceTemplate) );
			controlLoader.addEventListener(Event.COMPLETE, this.controlLoadInit);
			controlLoader.load();
			
			
			
			this.swf.createEmptyMovieClip("controlFrame", 2);
			
			var controlLoader:MovieClipLoader = new MovieClipLoader();
			controlLoader.addListener(this);
			controlLoader.loadClip("/lib/mediaplayer/templates/" + this.interfaceTemplate, this.swf.controlFrame);
		}
	
		/**
		 * onLoadInit
		 *
		 * URLLoader event handler
		 *
		 * @since Thu Jan 25 2007
		 * @param Event event
		 * @return void
		 **/
		function controlLoadInit(event:Event) {
			controlFrame = event.target;
			this.resizePlayer();
			this.resizeControls(controlFrame);
			this.setVolume(this.volume);
			
			controlFrame.progressBar.loaded._xscale = 0;
			controlFrame.progressBar.loaded.onPress = function() {
				_root.WmMediaPlayer.seekPosition(this._xmouse);
			}
			controlFrame.progressBar.loaded.useHandCursor = false;
			
			if (controlFrame.progressBarPointerDrag != false) {
				controlFrame.progressBar.pointer.drag = false;
				controlFrame.progressBar.pointer.onPress = function() {
					this.drag = true;
					startDrag(this, false, 0, 12, 291, 12);
				}
				controlFrame.progressBar.pointer.onRollOut = function() {
					if(this.drag) {
						stopDrag();
						_root.WmMediaPlayer.seekPosition(this._x);
						this.drag = false;
					}
				}
				controlFrame.progressBar.pointer.onRelease = function() {
					stopDrag();
					_root.WmMediaPlayer.seekPosition(this._x);
					this.drag = false;
				}
			}
			if (controlFrame.volumeControl instanceof MovieClip) {
				controlFrame.volumeControl.hitField.onPress = function() {
					_root.WmMediaPlayer.setVolumePosition(this._xmouse, this._parent._width - 12);
				}
				controlFrame.volumeControl.hitField.useHandCursor = false;
				controlFrame.volumeControl.pointer.onPress = function() {
					startDrag(this, false, 0, 12, this._parent._width - 12, 12);
				}
				controlFrame.volumeControl.pointer.onRelease = function() {
					stopDrag();
					_root.WmMediaPlayer.setVolumePosition(this._x, this._parent._width - 12);
				}
			}
			
			if(this.isPlaying() ) {
				controlFrame.playPause.gotoAndStop(2);
			} else {
				controlFrame.playPause.gotoAndStop(1);
			}
			
			if(this.interfaceAlign == "transparentoverlay") {
				controlFrame.background._alpha = 60;
			} else {
				controlFrame.background._alpha = 100;
			}
			
			this.resizeInterval = setInterval(this, "resizePlayer", 100);
		}
	
		/**
		 * setInterface
		 *
		 * Sets a new interfaceTemplate for the mediaplayer
		 *
		 * @since Tue Feb 13 2007
		 * @param String template
		 * @param String align
		 * @param String reload
		 * @return void
		 **/
		function setInterface(template, align, reload) {
			this.setVariable("interfaceTemplate", template);
			this.setVariable("interfaceAlign", align);
			if(reload == "true") {
				this.reloadInterface();
			}
		}
		
		/**
		 * reloadInterface
		 *
		 * Reloads the controlFrame
		 *
		 * @since Tue Feb 13 2007
		 * @return void
		 **/
		function reloadInterface() {
			this.createControls();
		}
		
		/**
		 * createPlayer
		 *
		 * Creates the mediaplayer in the SWF file
		 *
		 * @since initial
		 * @access protected
		 * @return void
		 **/
		protected function createPlayer() {
			this.playerFrame = this.createFLVPlayer();
			
			this.setVolume(this.volume);
			this.playerFrame.stop();
			
			this.bufferInterval = setInterval(this, "bufferUpdate", 1000);
		}
		
		/**
		 * createFLVPlayer
		 *
		 * Creates a FLVPlayback object in the SWF file
		 *
		 * @since initial
		 * @return FLVPlayback playerFrame
		 **/
		protected function createFLVPlayer() {
			var flvplayer = new FLVPlayback();
			flvplayer.name = "playerFrame";
			flvplayer.width = this.width;
			flvplayer.height = this.getPlayerHeight();
			flvplayer.autoRewind = false;
			flvplayer.load(this.file);
			
			playerFrame = this.swf.addChild(flvplayer);
			return playerFrame;
		}
		
		/**
		 * getPlayerHeight
		 *
		 * Returns the right player height for the interfaceAlign
		 *
		 * @since initial
		 * @access protected
		 * @return Number
		 **/
		protected function getPlayerHeight() {
			if (this.interfaceAlign == "overlay" || this.interfaceAlign == "transparentoverlay") {
				return this.height;
			} else if (this.swf.controlFrame.interfaceHeight != undefined) {
				// DIRECT CALLS DON'T WORK WITH AS3, FIX ME!
				return this.height - this.swf.controlFrame.interfaceHeight;
			} else {
				return this.height - this.swf.controlFrame._height;
			}
		}
	}
}