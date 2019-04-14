

//popup可获取bg直接进行交互
//popup负责视图

var flags={me:false, xpath:false, mdict:false};




//更新开关状态的显示
function updateSwitchState(switch_id, new_state){
	element = document.getElementById(switch_id);
	if(!element)
		return ;
	if(new_state){
		element.innerHTML = 'on';
		element.className  = 'span mon' ;
	}else{
		element.innerHTML = 'off'
		element.className  = 'span moff';
	}
}

function switchHandler(key){
	if(flags.hasOwnProperty(key)){
		flags[key]=!flags[key];
		//调用background, 记录用户设置变更
		var bg = chrome.extension.getBackgroundPage();
		if(key != 'me'){
			//var goon=false;
			//先检查插件是否开启，若插件已关闭，则提示先开启插件
			chrome.storage.local.get({me:false}, function(items) {
				if(items.me){
					//goon=true;
					//console.debug('已设置goon=true');
					
					bg.flagChangedHandler(key, flags[key]);
					updateSwitchState(key, flags[key]);
				}else{
					chrome.notifications.create(null, {
						type: 'basic',
						iconUrl: 'micon.png',
						title: '[pop]通知',
						message: "请先开启插件",//items.me="+items.me,
					});
					//return ;//退不出整个函数,使用标志
				}
			});/*
			//可能读取是异步的
			if(!goon){//goon的值未变
				console.debug('不继续');
				return;
			}*/
			return;
		}else{
			if(!flags[key]){//若直接关闭插件，则同时关闭其它功能
				for(var k in flags){
					flags[k] = false;
					bg.flagChangedHandler(k, flags[k]);
					updateSwitchState(k, flags[k]);
				}
			}else{//否则开启插件按钮
				bg.flagChangedHandler(key, flags[key]);
				updateSwitchState(key, flags[key]);
			}
		}
	}
}


//每次点开插件图标都会执行, 从文件读取配置恢复视图，默认false
function initPopup(){
	chrome.storage.local.get({me:false, xpath: false, mdict:false}, function(items) {
		flags = items;
		for(var key in items){
			//恢复视图
			updateSwitchState(key, items[key]);
			//绑定事件
			switchbt = document.getElementById(key);
			if(switchbt != null){
				switchbt.onclick=switchHandler.bind(this, key);
			}
		}
	});
}

initPopup();
