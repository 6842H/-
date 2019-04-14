
//默认会直接注入到网页的js
// ct可以与网页的dom交互，但不能调用页面的js，inject可与页面js交互
//ct与inject通信的方式
//window.postMessage(request.evals, '*');





//记录已加载的js避免重复加载
var loaded_js=[];
//必允许加载的js
var cmd_js=['openXpath.js', 'closeXpath.js','openMDict.js', 'closeMDict.js'];

/*加载JS，立即生效
function loadJS(url){
	var mlink = document.createElement('script');
	mlink.src = chrome.extension.getURL(url);
	var head = document.getElementsByTagName('head')[0];
	head.appendChild(mlink);
	console.debug(chrome.extension.getURL(url)+'注入完成');
}*/


function loadJSArr(urls){
	var head = document.getElementsByTagName('head')[0];
	for(var i in urls){
		if(cmd_js.includes(urls[i]) || !loaded_js.includes(urls[i])) {//不重复注入
			var mlink = document.createElement('script');
			mlink.src = chrome.extension.getURL(urls[i]);
			head.appendChild(mlink);
			loaded_js.push(urls[i]);//已加载js加入表
			console.debug(chrome.extension.getURL(urls[i])+'注入完成');
		}
	}
	return true;
}






chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
    // console.log(sender.tab ?"from a content script:" + sender.tab.url :"from the extension");
    if(request.cmd == 'loadjs') {
		if(loadJSArr(request.path)){
			//evalArr(request.evals);
			//通知injectjs要执行的函数
			//通过这种方式会出现inject执行函数时函数未定义的问题，解决办法：将要执行的函数放入js文件，动态注入js
			//ct与inject通信的方式
			//window.postMessage(request.evals, '*');
			sendResponse('ok');
		}else{
			sendResponse('done');
		}
	}else if(request.cmd == 'showDictPanel'){
		window.postMessage(request);
		console.debug('ct: 收到的翻译结果==', JSON.stringify(request), typeof request.result)
		sendResponse('ok');
	}
});



//本文件注入完成后发送信息给background
function initCT(){
	
	chrome.runtime.sendMessage({cmd: 'inited'}, function(response) {
		//bg收到ct加载成功后，返回要求ct往页面注入的js
		if(response.cmd == 'ok') {
			//loadJSArr(response.path);
			console.debug('ct: bg 已知ct完成注入')
			/*
			if(loadJSArr(response.path)){
				evalArr(response.evals);
				window.postMessage(response.evals, '*');
			}*/
		}else{
			console.debug('ct: bg 未知ct完成注入')
		}
	});
	
	//从inject发来的消息
	window.onmessage=function(event){
		//快捷键触发翻译，inject将消息发到ct后，ct再转发给bg，解决跨域问题
		if(event.data.cmd=='keyTrans'){
			chrome.runtime.sendMessage(event.data, function(response) {
				if(response.cmd == 'ok') {
					console.debug('ct: bg 已获取翻译请求')
				}else{
					console.debug('ct: bg 未获取翻译请求')
				}
			});
		}
	}
	
}

initCT();