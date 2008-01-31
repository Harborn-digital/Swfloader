/**
 * BitmapDataSaver is the ActionScript 2 class to save screenshots from flash
 *
 * Changelog
 * ------------
 * 
 * Niels Nijens - Tue Jan 29 2007
 * ----------------------------------
 * - 
 *
 * @since Tue Jan 29 2007
 * @author Niels Nijens (niels@connectholland.nl)
 * @version ActionScript 2
 * @package windmill.data
 **/

import flash.display.BitmapData;

import flash.external.*;

class windmill.data.BitmapDataSaver {	
	
	
	var bitmap:BitmapData;
	
	
	var width:Number;
	
	
	var height:Number;
	
	
	var depth:Number;
	
	
	var length:Number;
	
	
	var data:String;
	
	
	public function BitmapDataSaver(bitmap:BitmapData) {
		this.bitmap = bitmap;
		this.width = bitmap.width;
		this.height = bitmap.height;
		this.depth = 32;
		
		this.length = Math.ceil(this.width * this.height / 2) * 2;
		this.data = "";
		
		this.processtest();
	}
	
	private function processtest() {
		var pixelCount = this.width * this.height;
		
		var pixels = new Array();
		for (var i = 0; i < this.height; i++) {
			for (var j = 0; j < this.width; j++) {
				pixels.push(this.bitmap.getPixel(j, i) );
			}
		}
		
		this.data = pixels.join(",");
		ExternalInterface.call("SWFError", this.data, true);
	}
	
	
	private function process() {
		//The extracted pixels
		var pix1:Number;
		var pix2:Number;
		var pix3:Number;

		//The max value to consider in the local for loop
		var maxVal:Number = Math.min(2 * this.length, this.width * this.height);

		//Loop through the relevant pixels
		var oldBuff = '';
		var buff = '';
		var rle = false;
		var numRle = 0;
		
		/* Declared locally for faster access */
		var BASE64_CHARS:Array = [
			'A','B','C','D','E','F','G','H',
			'I','J','K','L','M','N','O','P',
			'Q','R','S','T','U','V','W','X',
			'Y','Z','a','b','c','d','e','f',
			'g','h','i','j','k','l','m','n',
			'o','p','q','r','s','t','u','v',
			'w','x','y','z','0','1','2','3',
			'4','5','6','7','8','9','+','/'
		];
		
		for (var i:Number = 0; i < maxVal; i+=3) {
			//The pixel to examine
			pix1 = this.bitmap.getPixel32(i % this.width, Math.floor(i / this.width));
			pix2 = this.bitmap.getPixel32((i + 1)% this.width, Math.floor((i + 1) / this.width));
			pix3 = this.bitmap.getPixel32((i + 2)% this.width, Math.floor((i + 2) / this.width));
			
			pix1 = ( (255 - (pix1 >> 24 & 0xff) ) << 24) | (pix1 & 0xffffff);
			pix2 = ( (255 - (pix2 >> 24 & 0xff) ) << 24) | (pix2 & 0xffffff);
			pix3 = ( (255 - (pix3 >> 24 & 0xff) ) << 24) | (pix3 & 0xffffff);
			
			buff = BASE64_CHARS[pix1 >> 26 & 0x3f] + 
					BASE64_CHARS[pix1 >> 20 & 0x3f] + 
					BASE64_CHARS[pix1 >> 14 & 0x3f] + 
					BASE64_CHARS[pix1 >> 8  & 0x3f] + 
					BASE64_CHARS[pix1 >> 2  & 0x3f] + 
					BASE64_CHARS[(pix1     & 0x3 )*16 + (pix2 >> 28 & 0xf)] + 
					BASE64_CHARS[pix2 >> 22 & 0x3f] + 
					BASE64_CHARS[pix2 >> 16 & 0x3f] + 
					BASE64_CHARS[pix2 >> 10 & 0x3f] + 
					BASE64_CHARS[pix2 >> 4  & 0x3f] + 
					BASE64_CHARS[(pix2        & 0xf)*4 + (pix3 >> 30 & 0x3)] + 
					BASE64_CHARS[pix3 >> 24 & 0x3f] + 
					BASE64_CHARS[pix3 >> 18 & 0x3f] + 
					BASE64_CHARS[pix3 >> 12 & 0x3f] + 
					BASE64_CHARS[pix3 >> 6  & 0x3f] + 
					BASE64_CHARS[pix3 & 0x3f];
			
			if (buff == oldBuff) {
				if (rle) {
					numRle++;
					if (numRle == 64) {
						this.data += "/#";
						numRle = 0;
					}
				}
				else {
					this.data += '#';
					rle = true;
					numRle = 0;
				}
			}
			else {
				if (rle) {
					this.data += BASE64_CHARS[numRle];
					rle = false;
				}
				this.data += buff;
			}
			oldBuff = buff;
		}
		
		if (rle) {
			this.data += BASE64_CHARS[numRle];
			rle = false;
		}
	}
	
	
	public function save(url, variables) {
		var service = new LoadVars();
		
		for (var property in variables) {
			service[property] = variables[property];
		}
		
		service.width   = this.width;
		service.height  = this.height;
		service.data = this.data;
		service.sendAndLoad(url, service, "POST");
	}
}







