var GMapsObject=Class.extend(SWFObject,{initialize:function(swfname,swffile,width,height,bgcolor,swfvars){this.__parent.initialize(swfname,swffile,width,height,bgcolor,swfvars),this.mapLoaded=!1,ajaxEngine.registerRequest(swfname,"/index.php"),ajaxEngine.registerAjaxObject(swfname,this)},addFlashConfigVars:function(){this.addVariable("swfname",this.getAttribute("swfname")),this.addVariable("swfpath",this.getAttribute("swffile").substr(0,this.getAttribute("swffile").lastIndexOf("/")+1))},searchGeoCode:function(button,formField){this.geoButton=button,this.geoButtonValue=this.geoButton.value,this.geoButton.value="Zoeken...",this.geoButton.disabled=!0,this.geoFormField=formField,query=formField.value,this.removeLayer("search"),this.closeInfoWindow(),ajaxEngine.sendRequest(this.getAttribute("swfname"),{parameters:"ct=gmaps&mode=geocode&mapid="+this.getAttribute("swfname")+"&query="+query})},ajaxUpdate:function(response){switch(this.xml=response.firstChild,this.xml.getAttribute("mode")){case"geocode":this.geoCodeRequest()}},geoCodeRequest:function(){this.geoButton.value=this.geoButtonValue,this.geoButton.disabled=!1;var placemarks=this.getPlacemarks();this.geoCodeSelect(placemarks)},geoCodeSelect:function(placemarks){for(i=0;i<placemarks.length;i++)coordinates=this.getNodeValue(placemarks[i].getElementsByTagName("coordinates")[0]),coordinates=coordinates.split(","),city="",placemarks[i].getElementsByTagName("city").length>0&&(city=", "+this.getNodeValue(placemarks[i].getElementsByTagName("city")[0])),street="",placemarks[i].getElementsByTagName("street").length>0&&(street=this.getNodeValue(placemarks[i].getElementsByTagName("street")[0])),point={lng:coordinates[0],lat:coordinates[1],name:street+city},this.addPoint("search",point,"select");1==placemarks.length?this.setCenter({lng:coordinates[0],lat:coordinates[1]},8):this.focusLayer("search")},getPlacemarks:function(){return this.xml.getElementsByTagName("placemark")},getPlacemarkByCoords:function(coords){var placemarks=this.getPlacemarks(),placemarkobject={};for(i=0;i<placemarks.length;i++){var placemarkcoords=this.getNodeValue(placemarks[i].getElementsByTagName("coordinates")[0]).split(",");if(coords[2]==new Number(placemarkcoords[0])&&coords[1]==new Number(placemarkcoords[1]))for(j=0;j<placemarks[i].childNodes.length;j++)placemarkobject[placemarks[i].childNodes[j].nodeName]=this.getNodeValue(placemarks[i].childNodes[j])}return placemarkobject},getNodeValue:function(node){return node.textContent?node.textContent:node.text},setCenter:function(location,zoom){this.methodExists("setCenter")?$(this.getAttribute("swfname")).setCenter(location,zoom):this.setCenter.bind(this).delay(100,location,zoom)},loadKML:function(id,url,autofocus,save){this.methodExists("loadKML")?$(this.getAttribute("swfname")).loadKML(id,url,null,autofocus,save):this.loadKML.bind(this).delay(100,id,url,autofocus,save)},removeLayer:function(id){this.methodExists("removeLayer")?$(this.getAttribute("swfname")).removeLayer(id):this.removeLayer.bind(this).delay(100,id)},focusLayer:function(id){this.methodExists("focusLayer")?$(this.getAttribute("swfname")).focusLayer(id):this.focusLayer.bind(this).delay(100,id)},closeInfoWindow:function(){this.methodExists("closeInfoWindow")?$(this.getAttribute("swfname")).closeInfoWindow():this.closeInfoWindow.bind(this).delay(100)},setPointStyle:function(style){this.methodExists("setPointStyle")?$(this.getAttribute("swfname")).setPointStyle(style):this.setPointStyle.bind(this).delay(100,style)},addPoint:function(id,point,mode){this.methodExists("addPoint")?$(this.getAttribute("swfname")).addPoint(id,point,mode):this.addPoint.bind(this).delay(100,id,point,mode)},addPointToForm:function(point){var placemark=this.getPlacemarkByCoords(point);"function"==typeof this.callback&&this.callback(placemark)},addControl:function(type,settings){this.methodExists("addControl")?$(this.getAttribute("swfname")).addControl(type,settings):this.addControl.bind(this).delay(100,type,settings)},removeControl:function(type){this.methodExists("removeControl")?$(this.getAttribute("swfname")).removeControl(type):this.removeControl.bind(this).delay(100,type)},toggleControls:function(){this.methodExists("toggleControls")?$(this.getAttribute("swfname")).toggleControls():this.toggleControls.bind(this).delay(100)},setInfoWindowStyle:function(infoWindowStyle){this.methodExists("setInfoWindowStyle")?$(this.getAttribute("swfname")).setInfoWindowStyle(infoWindowStyle):this.setInfoWindowStyle.bind(this).delay(100,infoWindowStyle)},isLoading:function(){return this.methodExists("isLoading")?$(this.getAttribute("swfname")).isLoading():!0},printMap:function(id){this.methodExists("printMap")?$(this.getAttribute("swfname")).printMap(id):this.printMap.bind(this).delay(100,id)},printMapWith:function(id,content){this.methodExists("printMapWith")?$(this.getAttribute("swfname")).printMapWith(id,content):this.printMapWith.bind(this).delay(100,id,content)}});