
//background.js
//background和popup中无法直接访问页面DOM, 通过注入js的方式解决
//bg 无法使用前台的一些组件，console
// 动态执行JS代码
//chrome.tabs.executeScript(tabId, {code: 'document.body.style.backgroundColor="red"'});
// 动态执行JS文件
//chrome.tabs.executeScript(tabId, {file: 'some-script.js'});



//js脚本注入控制由bg负责，注入由ct执行
var flags={me:false, xpath:false, mdict:false};

//注意顺序
var flags_js_map_true={me:['commonInject.js'], xpath:['xpathScript.js','openXpath.js'], mdict:['mdictScript.js','openMDict.js']};
var flags_js_map_false={me:[], xpath:['closeXpath.js'], mdict:['closeMDict.js']};
var flag_weight=['me','xpath','mdict'];//加载脚本的优先顺序



// 翻译API
//var youdao_api_get="http://fanyi.youdao.com/translate?doctype=json&type=AUTO&i=";
//var youdao_api_post="http://fanyi.youdao.com/translate";
var dict_menu_id='';


function startWorker(jspath){
	if(typeof(Worker)!=="undefined"){
		if(typeof(w)=="undefined")
			w=new Worker(jspath);
		return w;
	}else{
		return null;
	}
}

function stopWorker(ww){
	ww.terminate();
}

//发送信息到content_script.js
function sendMessageToContentScript(message, callback)
{
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs)
    {
        chrome.tabs.sendMessage(tabs[0].id, message, function(response)
        {
            if(callback) callback(response);
        });
    });
}



//翻译
function newTransFunc(keyword){
	if(!keyword || keyword==''){
		console.debug("newTransFunc: 未选取内容");
		return;
	}
	worker = startWorker('ajaxWorker.js');
	msg = {'cmd':'trans', 'keyword':keyword};
	worker.postMessage(msg);
	worker.onmessage = function(event){
		//if(event.data.cmd=="transOK" || event.data.cmd == "transFail" ){
			console.debug('event.data.cmd==',event.data.cmd);
			tr = event.data.result;
			//发送给CT
			sendMessageToContentScript({cmd:'showDictPanel', result:tr}, function(response){
				/*chrome.notifications.create(null, {
						type: 'basic',
						iconUrl: 'micon.png',
						title: 'background收到ct回复',
						message: "翻译"+response,
				});*/
			});	
		//}
	}
	delete worker;
}



//flag更新后，保存flag的新值，值变更的响应由监听器负责
function flagChangedHandler(flag_name, new_value){
	if(flag_name){
		//先更新本地的配置，再同步到硬盘
		flags[flag_name] = new_value;
		
		//chrome.storage.local.set({flag_name: new_value}, function() {});//flag_name会被认为是新的自段
		
		switch(flag_name){
			case 'me':
				chrome.storage.local.set({me: new_value}, function() {});
				break;
			case 'xpath':
				chrome.storage.local.set({xpath: new_value}, function() {});
				break;
			case 'mdict':
				chrome.storage.local.set({mdict: new_value}, function() {});
				break;
		}
	}
}



function action(key, value, show=true){
	var jspath=[];
	switch(key){
		case 'me':
			if(value){//开启me
				jspath = flags_js_map_true.me;
				if(show){
					chrome.notifications.create(null, {
						type: 'basic',
						iconUrl: 'micon.png',
						title: '[bg]通知',
						message: "插件已启用",
					});
				}
			}else{//关闭me
				jspath = flags_js_map_false.me;
				if(show){
					chrome.notifications.create(null, {
						type: 'basic',
						iconUrl: 'micon.png',
						title: '[bg]通知',
						message: "插件已停用",
					});
				}
			}break;
		case 'xpath':
			if(value){//开启xpath
				jspath = flags_js_map_true.xpath;
				if(show){
					chrome.notifications.create(null, {
						type: 'basic',
						iconUrl: 'micon.png',
						title: '[bg]通知',
						message: "XPath功能已开启",
					});
				}
			}else{//关闭xpath
				jspath = flags_js_map_false.xpath;
				if(show){
					chrome.notifications.create(null, {
						type: 'basic',
						iconUrl: 'micon.png',
						title: '[bg]通知',
						message: "XPath功能已关闭",
					});
				}
			}break;
		case 'mdict':
			if(value){//开启mdict
				//js也要注入！！
				jspath = flags_js_map_true.mdict;
				//添加菜单，由bg负责监听
				if(dict_menu_id==''){
					//要是能直接绑定快捷键就好了
					chrome.contextMenus.create({
						title: '翻译 [%s]', // %s表示选中的文字
						contexts: ['selection'], // 只有当选中文字时才会出现此右键菜单
						id: 'mdict',	//删除的时候用id
						onclick: function(params){
							// 注意不能使用location.href，因为location是属于background的window对象
							//chrome.tabs.create({url: 'https://www.baidu.com/s?ie=utf-8&wd=' + encodeURI(params.selectionText)});
							//使用有道接口发送get请求翻译选中内容
							newTransFunc(params.selectionText);
						}
					});
					dict_menu_id='mdict';
				}
				if(show){
					chrome.notifications.create(null, {
						type: 'basic',
						iconUrl: 'micon.png',
						title: '[bg]通知',
						message: "翻译功能已开启（快捷键左Alt）",
					});
				}
			}else{//关闭mdict
				jspath = flags_js_map_false.mdict
				if(dict_menu_id != ''){
					dict_menu_id='';
					chrome.contextMenus.remove('mdict',function(){
						if(show){
							chrome.notifications.create(null, {
								type: 'basic',
								iconUrl: 'micon.png',
								title: '[bg]通知',
								message: "翻译功能已关闭",
							});
						}
					});
				}
			}break;
	}
	//新版引入mustDo函数后可将要执行的函数名作为消息发送给ct，ct再发送给inject使用mustDo函数执行，不会再出现执行函数时该函数未定义的情况
	sendMessageToContentScript({cmd:'loadjs', path:jspath}, function(response){//, evals:evalt
		/*if(response == 'ok'){
			chrome.notifications.create(null, {
				type: 'basic',
				iconUrl: 'micon.png',
				title: 'bg收到ct回复',
				message: jspath.join('，')+'注入完成\tkey='+key+"\ttypeof key=="+(typeof key),
			});
		}*/
	});
}


function storageChangeHandler(changes, namespace){
	//按顺序加载
	for(var i in flag_weight){
		if(flag_weight[i] in changes){
			key = flag_weight[i];
			action(key, changes[key].newValue);
		}
	}
	/*可能加载无需出现undefined
	for(key in changes) {
		//变化的变量、变化后的值
		action(key, changes[key].newValue)
	}*/
}


function initBackgroud(){
	// 监听来自content-script的消息
	//页面每一次加载或刷新，ct都会被注入一次
	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
		//ct注入完成后background也“初始化”
		if(request.cmd == 'inited') {
			/*chrome.notifications.create(null, {
				type: 'basic',
				iconUrl: 'micon.png',
				title: 'bg收到ct回复',
				message: 'ct inited',
			});*/
			
			//从文件读取配置, 默认false
			chrome.storage.local.get({me:false, xpath: false, mdict:false}, function(items) {
				flags = items;
				//background初始化
				//按顺序加载
				//【新版使用mustDo函数后可忽略注入顺序】
				for(var i in flag_weight){
					if(flag_weight[i] in flags){
						key = flag_weight[i];
						action(key, flags[key], false);//判断配置变量状态并选择对应的操作
					}
				}/*
				for(var key in flags){
					action(key, flags[key], false);//判断配置变量状态并选择对应的操作
				}*/
			});
			//除了ct会自动注入页面（每一次打开都会注入），待ct注入完成后由ct负责js注入的工作（按需）
			//sendResponse({cmd:'inject', path:paths});//evals:evalt
		}else if(request.cmd == 'keyTrans'){
			//调用翻译
			newTransFunc(request.keyword);
		}
		sendResponse({cmd:'ok'});
	});
	chrome.storage.onChanged.addListener(storageChangeHandler);
}
initBackgroud();


/*
chrome.contextMenus.create({
    title: '开启Xpath', // %s表示选中的文字
    contexts: ['selection'], // 只有当选中文字时才会出现此右键菜单
    onclick: function(params)
    {
        // 注意不能使用location.href，因为location是属于background的window对象
        chrome.tabs.create({url: 'https://www.baidu.com/s?ie=utf-8&wd=' + encodeURI(params.selectionText)});
    }
});
*/












































