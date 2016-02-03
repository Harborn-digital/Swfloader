/**
 * MPlayerObject is the Flash Mediaplayer Object
 * Implements javascript communication with the Mediaplayer SWFObject
 *
 * Changelog
 * ---------
 *
 * Niels Nijens - Mon Nov 05 2007
 * -------------------------------
 * - Copied from WmMediaPlayer.js
 * - Upgraded to ExternalInterface and SWFLoader / SWFObject
 *
 * @since Mon Nov 05 2007
 * @author Niels Nijens (niels@connectholland.nl)
 **/
var MPlayerObject = Class.extend(SWFObject, {
    
    /**
     * initialize
     *
     * Initialize a new GMapsObject
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
        this.fullscreen = false;
        this.initSettings(swfvars);
        this.__parent.initialize(swfname, swffile, width, height, bgcolor, swfvars);
    },
    
    /**
     * initVars
     *
     * Adds the variables to the flashVars Object
     *
     * @since initial
     * @param Object settings
     * @return void
     * @todo improve in next version update
     **/
    initSettings: function(settings) {
        this.settings = {};
        this.syncCall(settings);
        /*this.flashVars = {
            file : file,
            delay : delay,
            position : position,
            volume : volume,
            template : template,
            align :align
        }
        this.bgColor = "CCCCCC";*/
    },
    
    /**
     * setSetting
     *
     * Sets a variable with varName in the flashVars object
     *
     * @since Mon Nov 05 2007 (previously known as setFlashVar)
     * @param String varName
     * @param Mixed varValue
     * @return void
     **/
    setSetting: function(varName, varValue) {
        if(varValue != null) {
            this.settings[varName] = varValue;
        }
    },
    
    /**
     * setSize
     *
     * Sets the size of the player div
     *
     * @since initial
     * @return void
     **/
    setSize: function(width, height) {
        this.width = width;
        this.height = height;
        element = this.getContainer();
        if(element) {
            Element.setStyle(element.id, {width : this.width + "px", height : this.height + "px"});
        }
    },
    
    /**
     * setInterface
     *
     * Sets a different interface template
     *
     * @since initial
     * @return void
     **/
    setInterface: function(template, align, reload) {
        if (this.methodExists("setInterface") ) {
            this.setSetting("template", template);
            this.setSetting("align", align);
            $(this.getAttribute("swfname") ).setInterface(template, align, reload);
        }
        else {
            this.setInterface.applyWithTimeout(this, 100, template, align, reload);
        }
    },
    
    /**
     * addPlayButton
     *
     * Adds a play button in the middle of the mediaplayer
     *
     * @since Thu Jul 26 2007
     * @return void
     **/
    addPlayButton: function() {
        if (this.methodExists("addPlayButton") ) {
            $(this.getAttribute("swfname") ).addPlayButton();
        }
        else {
            this.addPlayButton.applyWithTimeout(this, 100);
        }
    },
    
    /**
     * loadMedia
     *
     * Loads a file into the mediaplayer
     *
     * @since initial
     * @param string file
     * @param boolean play
     * @return void
     **/
    loadMedia: function(file, play) {
        if (this.methodExists("loadMedia") ) {
            if (file != null) {
                $(this.getAttribute("swfname") ).loadMedia(file, play);
            }
        }
        else {
            this.loadMedia.applyWithTimeout(this, 100, file, play);
        }
    },
    
    /**
     * playMedia
     *
     * Plays the media loaded into the Mediaplayer
     *
     * @since unknown
     * @return void
     **/
    playMedia: function() {
        if (this.methodExists("playMedia") ) {
            $(this.getAttribute("swfname") ).playMedia();
        }
        else {
            this.playMedia.applyWithTimeout(this, 100);
        }
    },
    
    /**
     * pauseMedia
     *
     * Pauses the media loaded into the Mediaplayer
     *
     * @since unknown
     * @return void
     **/
    pauseMedia: function() {
        if (this.methodExists("pauseMedia") ) {
            $(this.getAttribute("swfname") ).pauseMedia();
        }
        else {
            this.pauseMedia.applyWithTimeout(this, 100);
        }
    },
    
    /**
     * stopMedia
     *
     * Stops the media loaded into the Mediaplayer
     *
     * @since unknown
     * @return void
     **/
    stopMedia: function() {
        if (this.methodExists("stopMedia") ) {
            $(this.getAttribute("swfname") ).stopMedia();
        }
        else {
            this.stopMedia.applyWithTimeout(this, 100);
        }
    },
    
    /**
     * setVolume
     *
     * Sets the audio volume
     *
     * @since unknown
     * @param integer volume
     * @return void
     **/
    setVolume:function(volume) {
        if (this.methodExists("setVolume") ) {
            $(this.getAttribute("swfname") ).setVolume(volume);
        }
        else {
            this.setVolume.applyWithTimeout(this, 100, volume);
        }
    },
    
    /**
     * getVolume
     *
     * Get the current the audio volume
     *
     * @since unknown
     * @return integer
     **/
    getVolume: function() {
        return this.settings['volume'];
    },
    
    /**
     * getPosition
     *
     * Get the current the position
     *
     * @since unknown
     * @return integer
     **/
    getPosition: function() {
        return this.settings['position'];
    },
    
    /**
     * toggleMute
     *
     * Toggles the audio on and off
     *
     * @since unknown
     * @return void
     **/
    toggleMute: function() {
        if (this.methodExists("toggleMute") ) {
            $(this.getAttribute("swfname") ).toggleMute();
        }
        else {
            this.toggleMute.applyWithTimeout(this, 100);
        }
    },
    
    /**
     * isPlaying
     *
     * Returns the ISPLAYING flag
     *
     * @since unknown
     * @return boolean
     **/
    isPlaying: function() {
        return this.settings['ISPLAYING'];
    },
    
    /**
     * isPaused
     *
     * Returns the ISPAUSED flag
     *
     * @since unknown
     * @return boolean
     **/
    isPaused: function() {
        return this.settings['ISPAUSED'];
    },
    
    /**
     * isStopped
     *
     * Returns the ISSTOPPED flag
     *
     * @since unknown
     * @return boolean
     **/
    isStopped: function() {
        return this.settings['ISSTOPPED'];
    },
    
    /**
     * isMuted
     *
     * Returns the ISMUTED flag
     *
     * @since unknown
     * @return boolean
     **/
    isMuted: function() {
        return this.settings['ISMUTED'];
    },
    
    /**
     * toggleScreen
     *
     * Toggles the fullscreen mode on and off
     *
     * @since unknown
     * @return void
     **/
    toggleScreen: function() {
        if (!this.fullscreen) {
            this.fullscreen = true;
            this.setSize(this.width * 2, this.height * 2);
            this.element.className = this.element.className + " pos_fullscreen";
        }
        else {
            this.fullscreen = false;
            this.setSize(this.width / 2, this.height / 2);
            this.element.className = this.element.className.replace(/pos_fullscreen/i, "");
        }
    },
    
    /**
     * syncCall
     *
     * Synchronizes the JS settings with the SWF settings
     *
     * @since unknown
     * @return void
     **/
    syncCall: function(syncObj) {
        for(property in syncObj) {
            this.settings[property] = syncObj[property];
        }
    },
    
    /**
     * write
     *
     * Writes the SWF HTML to the document
     * Returns true on success
     *
     * @since initial
     * @return void
     **/
    write: function(element) {
        this.__parent.write(element);
        this.setSize(this.width, this.height);
    }
});