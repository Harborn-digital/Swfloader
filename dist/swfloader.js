var SWFLoader=Class.create({initialize:function(){this.swfobjects={},this.deeplinkListener=null,this.requiredVersion={major:9,minor:0,rev:115},this.expressInstallVersion={major:6,minor:0,rev:65},this.expressInstallSize={width:215,height:138},window.SWFCall=this.SWFCall.bind(this),window.SWFError=this.SWFError.bind(this),window.SWFLogStart=this.SWFLogStart.bind(this),window.SWFLogEnd=this.SWFLogEnd.bind(this),window.SWFDebug=this.SWFDebug.bind(this),window.SWFDeeplink=this.SWFDeeplink.bind(this),this.initUnload()},load:function(element,swfname,swffile,width,height,bgcolor,swfvars){swfobject=this.getSWFObject(element,swfname,swffile,width,height,bgcolor,swfvars),this.loadSWFObject(element,swfobject)},loadSWFObject:function(element,swfobject){swfName=swfobject.getAttribute("swfname"),swfWidth=swfobject.getAttribute("width"),swfHeight=swfobject.getAttribute("height"),this.checkDeeplinking(swfobject),this.checkPlayerVersion()?this.addSWFObject.bind(this).defer(element,swfobject):this.checkExpressInstallVersion()&&this.checkExpressInstallSize(swfWidth,swfHeight)?(installObject=this.getSWFObject(element,swfName,"expressinstall.swf",swfWidth,swfHeight,"transparent",{SWFContainer:element,MMredirectURL:escape(window.location),MMdoctitle:document.title}),this.addSWFObject.bind(this).defer(element,installObject)):this.addAlternateContent(element,swfWidth,swfHeight)},checkPlayerVersion:function(){return installedVersion=this.getPlayerVersion(),this.getVersionInt(installedVersion)>=this.getVersionInt(this.requiredVersion)?!0:!1},checkExpressInstallVersion:function(){return installedVersion=this.getPlayerVersion(),this.getVersionInt(installedVersion)>=this.getVersionInt(this.expressInstallVersion)?!0:!1},checkExpressInstallSize:function(width,height){return width>=this.expressInstallSize.width&&height>=this.expressInstallSize.height?!0:!1},getPlayerVersion:function(){if(!this.installedVersion){if(this.installedVersion={major:0,minor:0,rev:0},navigator.plugins&&navigator.mimeTypes.length?version=this.getPlayerVersionFF():version=this.getPlayerVersionIE(),!version)return!1;var i=0;for(property in this.installedVersion)this.installedVersion[property]=null!=version[i]?parseInt(version[i]):0,i++}return this.installedVersion},getVersionInt:function(version){return version.major*Math.pow(1e3,2)+1e3*version.minor+version.rev},getPlayerVersionFF:function(){var flashplayer=navigator.plugins["Shockwave Flash"];if(flashplayer&&flashplayer.description){var version=flashplayer.description.replace(/([a-zA-Z]|\s)+/,"").replace(/(\s+r|\s+b[0-9]+)/,".").split(".");return""==version[2]&&(version[2]="0"),version}return!1},getPlayerVersionIE:function(){try{return flashplayer=new ActiveXObject("ShockwaveFlash.ShockwaveFlash"),flashplayer.AllowScriptAccess="always",flashplayer.GetVariable("$version").split(" ")[1].split(",")}catch(e){return!1}},getSWFObject:function(element,swfname,swffile,width,height,bgcolor,swfvars){return swfobject=new SWFObject(swfname,swffile,width,height,bgcolor.replace(/#/g,""),swfvars),swfobject},addSWFObject:function(element,swfobject){swfname=swfobject.getAttribute("swfname"),this.swfobjects[swfname]={},this.swfobjects[swfname].element=$(element),this.swfobjects[swfname].object=swfobject,this.swfobjects[swfname].object.write(element)},addAlternateContent:function(element,width,height,bgcolor){if($(element)){var noflashelements=$(element).select(".noflash");return noflashelements.length>0?(noflashelements.invoke("show").invoke("fire","swfloader:shown-noflashelement",{swfloader:this}),!0):($(element).setStyle({width:width,height:height,textAlign:"center"}),$(element).innerHTML="<a class='swfloadergetflash' href='https://get.adobe.com/flashplayer/?no_redirect' target='_blank'><img src='data:image/gif;base64,R0lGODlhWAAfANUAAAAAAOvw9Jq0xF2Hof8fH09PT6+vr9fh6DMzM/9fX5mZmf+ZmXNzc//JyczMzP9HR3uesxkZGUxMTP96eu/v7//v78jIyP+3t2tra7jL1hAQEP88PP///4+Pj2ePp7+/v5CtvuHp7j09Pf+Pj//Z2YODg6S8yv8zM8PS3GZmZgkJCf+np3GWrSIiIoaluf9TU/X4+ePj40RERF1dXc3a4v9sbP8nJ67D0N/f3/+/v/+vr//f3wAAAAAAAAAAAAAAACH5BAAHAP8ALAAAAABYAB8AAAb/QI5jSCwaj8ikcslsIjlCqHRKrVqv2Kx2e3VEueCweIx1KLzktHoNQ91uAeF5Ta9rA4KB68Y6yNFiFwtSCxMTDVIVhSRQK4aMJIYTFyMJO3ZSKB4CcRwufmaAUB84Wi8bUgQXKw8JHCQnCysbKxwPI7MNFxsXFyQ5OhWYHJo0U59/Uh0pH6IcH1MVGwm1HARSJw0Jg68nthcchhcPw1QhAyFSMAcQoHNCKVMOHRQfLQpSKzULNVDXUIZsTHlA4hYrErt6CSvHIoOUGx4guEgXCgoDQDg6GOjAocAUahW8WZNi6B+UB+MS1Hig68SjcjdcSBEAIZ2UihxkPJPxIQUD/wb1OEqx8eCBDUQmHxzEVgElhxUvxpWT0gcKDQ8wqOAsUMqjTigKoEG58ALKiAkjOSxAtaAshxHknFaSOpUGBKomDvi5+c5Big4MOBj4KzgwlH1QGqAiUDTBwgkbpgl7sOHBiwoXiD7gZgeEQw4BXIgeIO/d1NNbYAzoNIU0X2eoY1NBAcKKayg4ZeuewgKF7dKwd6NGwUIKhAHIkQOHYkGCcwUWDEtRIL35jBjRmTOYgcBCDOclLFqY0hyKBCkzDDiXoOC7hPBVYHgwxuFA8S7vFGhQAF1BBCotaMDcfoH5B1YECpQQg34KiCACBwhOMYMKBnCAQIEI7tfffiIgUP+FC7VBsUcZ+f134BQxaIBAeM5NZ6KBJ3IAAIT4SKHBDA9aoAKEFsDIAYwzShEaBFnVhxWJaPjoIwcliMBAjioYxqACM5j4438G/BchFClaIKCFDHg45YL/hQkFRB6YUCQHEHyGX5IARBCBAUuuGMOOHFiAgAYLquAcAlYqECcCFW7JwZMcaDCeBQCMp4CfEvQYJwAxnGkCFTRpgZOSVsooJwAVQoHADDByOoWhAUagwgxQBGkqohy8oQ5Na74Z45XTtQDFDBJUCmapgXZqaJBZtnqrgV6eeQMUxLlQq624ghVnBE8aZoAGDMj5ILAunqqBnCV42Gqlrk7LAIwqVBpHEwge9AZGbsKVc8ANKNj0rmnx5oukvvy+ScG/AAcs8MAEF2zwwQgnTLAZQjjh8MMQR6xEjT/yZ/HFGGes8cYcd+zxxxlDEQQAOw==' border='0'/></a>",$(element).fire("swfloader:loaded-getflashplayer",{swfloader:this}),!0)}return!1},addAlternateContentCallback:function(element,width,height){this.addAlternateContent(element,width,height)},unload:function(swfname){this.processUnload.bind(this).defer(swfname)},processUnload:function(swfname){divElement=this.getDivByName(swfname),divElement&&(divElement.removeChild(divElement.getElementsByTagName("embed")[0]),this.swfobjects[swfname]=void 0)},getSWFObjectByName:function(swfname){return this.swfobjects[swfname]?this.swfobjects[swfname].object:!1},getDivByName:function(swfname){return this.swfobjects[swfname]?this.swfobjects[swfname].element:!1},SWFCall:function(){if(flashVars=$A(arguments),swfname=flashVars.shift(),methodName=flashVars.shift(),methodVars=flashVars,swfobject=this.getSWFObjectByName(swfname),swfobject){if(callbackFunction=swfobject.getCallbackByMethod(methodName),"function"==typeof callbackFunction.callback)return callbackFunction.callback.apply(swfobject,methodVars);if("function"==typeof swfobject[methodName])return swfobject[methodName].apply(swfobject,methodVars);this.SWFError("Method "+methodName+" doesn't exist in object "+swfname+".")}else this.SWFError("Object with name "+swfname+" doesn't exist.")},SWFLogStart:function(debugInfo){console&&(console.log("loading ("+debugInfo.id+"): "+debugInfo.url),console.time("response time ("+debugInfo.id+")"))},SWFLogEnd:function(debugInfo){console&&(console.timeEnd("response time ("+debugInfo.id+")"),console.log(debugInfo))},SWFError:function(message,log){return $("consolewindow")?(log||(message="ERROR: "+message),void($("consolewindow").innerHTML+=message+"<br/>")):console?void(log?console.log(message):console.error("ERROR: "+message)):void 0},SWFDebug:function(level){var args=$A(arguments);if(args.shift(),"undefined"==typeof console||"function"!=typeof console.error||"function"!=typeof console.warn||"function"!=typeof console.log)throw Error(args);switch(level){case 1:console.error.apply(console,args);break;case 2:console.warn.apply(console,args);break;default:console.log.apply(console,args)}},checkDeeplinking:function(swfobject){var swfvars=swfobject.getVariables();1==swfvars.deeplinking&&(swfobject.deeplinking=!0,null==this.deeplinkListener&&(this.deeplinkListener=new PeriodicalExecuter(this.broadcastDeeplink.bind(this),.05)))},SWFDeeplink:function(link,title){document.location.hash="#"+link,""!=title&&(document.title=title)},broadcastDeeplink:function(){var deeplink=document.location.hash.replace(/#/g,"");if(""!=deeplink&&this.broadcastedDeeplink!=deeplink){this.broadcastedDeeplink=deeplink;for(var swfname in this.swfobjects)this.swfobjects[swfname].object.deeplinking&&this.swfobjects[swfname].object.setDeeplink(deeplink)}},initUnload:function(){!window.opera&&document.all&&(__flash_unloadHandler=function(){},__flash_savedUnloadHandler=function(){})},cleanupSWFObjects:function(){if(!window.opera&&document.all){var objects=document.getElementsByTagName("object");for(i=0;i<objects.length;i++){objects[i].style.display="none";for(var x in objects[i])"function"==typeof objects[i][x]&&(objects[i][x]=function(){})}}}}),SWFObject=Class.create({initialize:function(swfname,swffile,width,height,bgcolor,swfvars){this.deeplinking=!1,this.registeredCallbacks={},this.initAttributes({swffile:swffile,swfname:swfname,width:width,height:height}),this.initParams({quality:"high",menu:"false",scale:"noscale",AllowScriptAccess:"always",bgcolor:this.getColor(bgcolor),wmode:this.getWMode(bgcolor)}),this.initVariables(swfvars),this.addFlashConfigVars()},initAttributes:function(attributes){this.attributes={};for(property in attributes)attributes[property]&&this.setAttribute(property,attributes[property])},initParams:function(params){this.params={};for(property in params)params[property]&&this.addParam(property,params[property])},initVariables:function(variables){this.variables={};for(property in variables)variables[property]&&this.addVariable(property,variables[property])},addFlashConfigVars:function(){this.addVariable("swfname",this.getAttribute("swffile").substr(this.getAttribute("swffile").lastIndexOf("/")+1,this.getAttribute("swffile").lastIndexOf(".swf")-(this.getAttribute("swffile").lastIndexOf("/")+1))),this.addVariable("swfpath",this.getAttribute("swffile").substr(0,this.getAttribute("swffile").lastIndexOf("/")+1))},getColor:function(bgcolor){return"transparent"==bgcolor?!1:bgcolor},getWMode:function(bgcolor){return"transparent"!=bgcolor?!1:bgcolor},setAttribute:function(name,value){this.attributes[name]=value},getAttribute:function(name){return this.attributes[name]},addParam:function(name,value){this.params[name]=value},getParams:function(){return this.params},addVariable:function(name,value){this.variables[name]=value},getVariables:function(){return this.variables},getVariablePairs:function(){variables=this.getVariables(),variablePairs=new Array;for(property in variables)variablePairs.push(property+"="+variables[property]);return variablePairs},getSWFHTML:function(){return navigator.plugins&&navigator.mimeTypes&&navigator.mimeTypes.length?(this.addVariable("MMplayerType","PlugIn"),SWFNode=this.getSWFHTMLEmbed()):(this.addVariable("MMplayerType","ActiveX"),SWFNode=this.getSWFHTMLObject()),SWFNode},getSWFHTMLEmbed:function(){return SWFNode="<embed type='application/x-shockwave-flash' src='"+this.getAttribute("swffile")+"'",SWFNode+=" width='"+this.getAttribute("width")+"' height='"+this.getAttribute("height")+"'",SWFNode+=" id='"+this.getAttribute("swfname")+"' name='"+this.getAttribute("swfname")+"' ",SWFNode+=this.getParamHTML(!0),SWFNode+=this.getVariableHTML(!0),SWFNode+="/>",SWFNode},getSWFHTMLObject:function(){return SWFNode="<object id='"+this.getAttribute("swfname")+"' classid='clsid:D27CDB6E-AE6D-11cf-96B8-444553540000'",SWFNode+=" width='"+this.getAttribute("width")+"' height='"+this.getAttribute("height")+"'>",SWFNode+="<param name='movie' value='"+this.getAttribute("swffile")+"'/>",SWFNode+=this.getParamHTML(!1),SWFNode+=this.getVariableHTML(!1),SWFNode+="</object>",SWFNode},getParamHTML:function(embed){paramHTML="",params=this.getParams();for(var property in params)embed?paramHTML+=property+"='"+params[property]+"' ":paramHTML+='<param name="'+property+'" value="'+params[property]+'" />';return paramHTML},getVariableHTML:function(embed){return variableHTML="",variablestring=this.getVariablePairs().join("&"),variablestring.length>0&&(embed?variableHTML+="flashvars='"+variablestring+"'":variableHTML+="<param name='flashvars' value='"+variablestring+"'/>"),variableHTML},write:function(element){return $(element)?($(element).innerHTML=this.getSWFHTML(),!0):!1},methodExists:function(methodName){return element=$(this.getAttribute("swfname")),element&&"function"==typeof element[methodName]?!0:!1},registerCallback:function(methodName,callbackFunction){this.registeredCallbacks[methodName]={},this.registeredCallbacks[methodName].callback=callbackFunction},getCallbackByMethod:function(methodName){return void 0!=this.registeredCallbacks[methodName]?this.registeredCallbacks[methodName]:!1},getContainer:function(){return swfloader.getDivByName(this.getAttribute("swfname"))},setDeeplink:function(link){this.methodExists("setDeeplink")?$(this.getAttribute("swfname")).setDeeplink(link):this.setDeeplink.bind(this).delay(.05,link)}}),swfloader=new SWFLoader;