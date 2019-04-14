


//键盘按键事件对：按键:响应函数
var key_dict = {"BackSpace":8,  "Tab":9,  "Clear":12,  "Enter":13,  "Shift_L":16,  "Control_L":17,  "Alt_L":18,  "Pause":19,  "Caps_Lock":20,  "Escape":27,  "space":32,  "Prior":33,  "Next":34,  "End":35,  "Home":36,  "Left":37,  "Up":38,  "Right":39,  "Down":40,  "Select":41,  "Print":42,  "Execute":43,  "Insert":45,  "Delete":46,  "Help":47,  "0":48,  "1":49,  "2":50,  "3":51,  "4":52,  "5":53,  "6":54,  "7":55,  "8":56,  "9":57,  "a":65,  "b":66,  "c":67,  "d":68,  "e":69,  "f":70,  "g":71,  "h":72,  "i":73,  "j":74,  "k":75,  "l":76,  "m":77,  "n":78,  "o":79,  "p":80,  "q":81,  "r":82,  "s":83,  "t":84,  "u":85,  "v":86,  "w":87,  "x":88,  "y":89,  "z":90,  "F1":112,  "F2":113,  "F3":114,  "F4":115,  "F5":116,  "F6":117,  "F7":118,  "F8":119,  "F9":120,  "F10":121,  "F11":122,  "F12":123}
//新增快捷键只需扩充该字典，按键：处理函数，然后重新调用addKeyMonitor()
//如{"Escape":xPathKeyHandler}
var key_handler={};//已设置的快捷键：响应方法


//停止事件的冒泡传递
function stopBubble(e) { 
	//如果提供了事件对象，则这是一个非IE浏览器 
	if ( e && e.stopPropagation ) 
		//因此它支持W3C的stopPropagation()方法 
		e.stopPropagation(); 
	else 
		//否则需要使用IE的方式来取消事件冒泡 
		window.event.cancelBubble = true; 
};


//阻止对被拖元素的默认处理方式
function stopPrevent(ev){
	var ev=ev || window.event;
	if(typeof ev.preventDefault=="function"){
		ev.preventDefault();
	}else{
		ev.returnValue=false;
	}
}


/*获取滚动条滚动的距离
function getScroll() {  
    if(window.pageYOffset != null) {  // ie9+ 高版本浏览器
        return [window.pageXOffset, window.pageYOffset];
    }
    else if(document.compatMode === "CSS1Compat") {    // 标准浏览器,来判断有没有声明DTD
        return [document.documentElement.scrollLeft, document.documentElement.scrollTop];
    }
	// 未声明 DTD
    return [document.body.scrollLeft, document.body.scrollTop];
}*/



//方案一： 鼠标和标签都用相对于浏览器窗口的坐标
//获取鼠标坐标
function getMousePos(event) {
    var e = event || window.event;
	var x = e.clientX;
	var y = e.clientY;
    return [x, y];
}


//方案二： 鼠标和标签都用绝对坐标
/*获取鼠标坐标
function getMousePos2(event) {
   var e = event || window.event;
   var scrollX = document.documentElement.scrollLeft || document.body.scrollLeft;
   var scrollY = document.documentElement.scrollTop || document.body.scrollTop;
   var x = e.pageX || e.clientX + scrollX;
   var y = e.pageY || e.clientY + scrollY;
   return [x, y];
}*/


//获取选中内容的坐标
function getSelectedXY(){
	var range = window.getSelection().getRangeAt(0);
	var rect = range.getBoundingClientRect();
	//var rect = range.getClientRects()[0];
	var x = rect.left, y = rect.top;
	return [x, y];
}



//键盘响应函数
function keyDownHandler(){
	var event = window.event;
	console.debug('event', event);
	for(var key in key_handler){
		if(event.keyCode == key_dict[key]){　//Tab9  `~192
			key_handler[key]();
			//e.preventDefault();
	　　}
	}
}


//添加键盘监听,按键名：响应函数
function addKeyMonitor(key=null, func=null){
	if(key && func){
		if(!(key in key_handler)){//不重复添加
			key_handler[key] = func;
			if(navigator.userAgent.indexOf("MSIE")>0){    
				//document.addEventListener('onkeydown', keyDownHandler, false);
				document.onkeydown=keyDownHandler.bind();
			}else{     //非IE      
				window.onkeydown=keyDownHandler;
				//window.addEventListener('onkeydown', keyDownHandler, false);
			}
		}
	}
	
}


//移除监听某个键盘
function removeKeyMonitor(key){
	if(key && key_handler.hasOwnProperty(key)){
		delete key_handler[key];
		addKeyMonitor();
	}
}


//让窗口接受拖拽
function dragHandler(){
	//阻止dragover的默认事件
	document.ondragover=function(ev){     
		stopPrevent(ev);
	}

	//阻止dragenter的默认事件
	document.ondragenter=function(ev){   
		stopPrevent(ev);
	}
	//console.debug(document.ondrop);
	if(!document.ondrop){
		console.debug('bind');
		document.ondrop=function(ev){
			stopPrevent(ev);
			//被拖动的标签drag方法里setDate时可以增加要传递的数据
			var drag_data=ev.dataTransfer.getData("Text").split(";");//从dataTransfer对象中取出数据，并将字符串分割成数组
			var target_id=drag_data[0];
				offset_x=drag_data[1],//取得横向偏移
				offset_y=drag_data[2];//取得纵向偏移
			//给拖动元素的left，top赋值,position=fixed
			target=document.getElementById(target_id);
			target.style.left=(ev.clientX-offset_x)+"px";
			target.style.top=(ev.clientY-offset_y)+"px";
		}
	}
}


//心跳检测func是否存在，直到func执行完成,检查间隔interval，func的参数params
//脚本注入时是异步注入，有时候会出现后注入脚本调用先注入脚本但是被调用对象不存在的情况，这种情况可能是由于后注入的脚本先注入完成
//func是字符串（函数名）
//用例：mustDo(openXpath,500);
function mustDo(func,interval=500, params=null){
	console.debug('check ',func);
	if(typeof window[func] != "undefined"){
		window[func](params);
	}else{
		setTimeout(function(){mustDo(func,interval,params)}, parseInt(interval));
	}
} 


//初始化本脚本
function initCJ(){
	dragHandler();
	window.addEventListener("message", function(e){
		console.debug('commonInject ：origin ==', e.origin);
		console.debug('commonInject ：data ==', e.data);
		//newEval(e.data);
		if(e.data.cmd=="showDictPanel"){
			addDictPanel(e.data.result);
		}
	}, false);
	console.debug('ct本地：ct已注入');
}

initCJ();