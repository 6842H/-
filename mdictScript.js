

//dictScript.js, 处理翻译

//result是一个字典, 项目：内容
var title_color = ['#FFF68F','#C0FF3E','#AFEEEE','#E0FFFF','#FFFFE0','#FFB5C5','#FFBBFF'];
var content_color = ['#D1EEEE','#F0FFFF','#FFFFF0','#DDA0DD','#FFFFE0','#E0FFFF','#FFF0F5']



//return Math.floor(Math.random()*10);  //可均衡获取0到9的随机整数。
//生成从minNum到maxNum的随机数,含端点
function getNumBetween(minNum,maxNum){ 
    switch(arguments.length){ 
        case 1: 
            return parseInt(Math.random()*minNum+1,10); 
        break; 
        case 2: 
            return parseInt(Math.random()*(maxNum-minNum+1)+minNum,10); 
        break; 
            default: 
                return 0; 
            break; 
    } 
}

//移除xpath显示板
function removeDictPanel(){
	var t = document.getElementById('mdict');
	if(t!=null)
		document.getElementsByTagName('body')[0].removeChild(t);	
}


function addDictPanel(result) {
	//样式可能受页面css影响，可以尽量定义全一些，避免继承页面的css
	var div_style="padding:30px 20px 30px 20px;height:auto;z-index:99;position:fixed;min-width:25%;max-width:60%";
	var title_style="text-align:left;font-size:16px;font-weight:bold;font-family:verdana;padding:5px 20px 5px 20px;";
	var content_style="text-align:left;font-size:14px;font-family:courier;padding:10px 60px 10px 60px;word-wrap:break-word;word-break:break-all;overflow:hidden;";
	//var dragbar_style="darggable:'true';font-size:16px;font-weight:bold;font-family:verdana;padding:5px 0px 5px 0px;text-align:center;background:#CDB38B;";
	var t_color=title_color[getNumBetween(0,title_color.length-1)];
	var c_color=content_color[getNumBetween(0,content_color.length-1)];
	
	//使用自定义的标签mdiv，避免受页面css影响【自定义标签样式异常】
	var div="<div id='mdict' draggable='true' title='按住拖动' style='"+div_style+"'</div> ";
	
	
	//插入主板beforeBegin、 afterBegin、beforeEnd、afterEnd
	document.getElementsByTagName('body')[0].insertAdjacentHTML("afterBegin",div);
	
	
	mdict = document.getElementById('mdict');
	
	//显示位置
	mouse_pos = getSelectedXY();//CJ
	mdict.style.left = (mouse_pos[0])+'px';
	mdict.style.top = (mouse_pos[1])+'px';
	
	
	if(mdict){
		//显示result
		titles = Object.keys(result);  
		L = titles.length;
		for(var i=0;i<L;i++){
			//新建标签
			var title = document.createElement("div");
			var content = document.createElement("div");
			//设置样式
			title.style = title_style;
			content.style = content_style;
			title.style.backgroundColor = t_color;
			content.style.backgroundColor = c_color;
			if(i==0){
				//加border-radius
				title.style.borderRadius='15px 15px 0px 0px';
			}else if(i==L-1){
				//加border-radius
				content.style.borderRadius='0px 0px 15px 15px';
			}
			//设置内容
			title.innerHTML = titles[i];
			content.innerHTML = result[titles[i]];
			//插入标签
			mdict.appendChild(title);
			mdict.appendChild(content);
		}
		/*
		var dragbar = document.createElement("div");
		dragbar.style=dragbar_style;
		dragbar.style.borderRadius='0px 0px 15px 15px';
		dragbar.innerHTML='拖动';
		mdict.appendChild(dragbar);*/
		
		//绑定显示板被拖动时的操作
		mdict.ondragstart=function(ev){       //在被拖动的元素的dragstart事件中取得坐标便宜
			var ev=ev || window.event;        //将被拖标签的id 和ev.clientX-this.offsetLeft和ev.clientY-this.offsetTop,并保存在dataTransfer对象中
			ev.dataTransfer.setData("text",'mdict'+";"+(ev.clientX-this.offsetLeft)+";"+(ev.clientY-this.offsetTop));
		}
	}
	mdict.addEventListener('mouseleave', removeDictPanel, false);
}


//获取选中文本
function getSelectedText(){
	var txt = window.getSelection?window.getSelection():document.selection.createRange().text;
	return txt.toString();
}


//dict快捷键的响应函数
function mDictKeyHandler(){
	//获取选中内容，发送给ct,再由ct发送给bg
	var txt = getSelectedText();
	console.debug('getSelectedText==', txt, typeof txt);
	//增加选取内容判断是否为空，避免无翻译需求时却按到快捷键而发生翻译请求
	if(txt && txt.trim().length!=0){
		window.postMessage({'cmd':'keyTrans','keyword':txt}, '*');
	}
}



function openMDict(){
	//只增加监听按键即可
	if(typeof addKeyMonitor != "undefined")  {
		addKeyMonitor("Control_L", mDictKeyHandler);
		console.debug('dict addKeyMonitor');
	}else{
		console.debug(' dict addKeyMonitor undefined');
	}
}


function closeMDict(){
	//移除监听按键
	if(typeof removeKeyMonitor != "undefined")  {
		removeKeyMonitor("Control_L");
		console.debug('dict removeKeyMonitor');
	}else{
		console.debug('dict removeKeyMonitor undefined');
	}
}









