
//xPathScript.js 开启xpath的依赖，需在commonInject.js 后注入


//Xpath
//需要处理的标签添加到tags
var tags=["button","span","img","input",'div','label','a','form'];
var hot=null;	//当前鼠标所指的标签
var xkey_id=27;	//获取xpath的快捷键：Tab 9  `~ 192	alt 18
var xkey_name='Escape';
var hover_flag = -1;	//-1：w未绑定，0：绑定但短路，1：绑定且工作



// 注意js要添加到body后面 
function addXpathPanel() {
	var tag="<mdiv id='mtarget' draggable='true' title='按住拖动' style='padding:0;margin:0;border-radius:10px;background-color:orange;width:30%;height:33px;line-height:32px;position:fixed;top:300px;left:500px;opacity:0.6;z-index:99;'>\
					<mspan style='color:blue;margin-left:5px;font-size:15px;font-weight:bold;'>xpath:</mspan>\
					<input id='xpath_panel' type='text' style='width:75%;height:30px;padding:0px 0px 0px 5px;margin:0;'/>\
			</mdiv> ";
	//beforeBegin、 afterBegin、beforeEnd、afterEnd
	document.getElementsByTagName('body')[0].insertAdjacentHTML("afterBegin",tag);
	//绑定被拖动时的操作
	document.getElementById('mtarget').ondragstart=function(ev){       //在被拖动的元素的dragstart事件中取得坐标便宜
		var ev=ev || window.event;        //将被拖标签的id 和ev.clientX-this.offsetLeft和ev.clientY-this.offsetTop,并保存在dataTransfer对象中
		ev.dataTransfer.setData("text",'mtarget'+";"+(ev.clientX-this.offsetLeft)+";"+(ev.clientY-this.offsetTop));
	}
};


//移除xpath显示板
function removeXpathPanel(){
	var t = document.getElementById('mtarget');
	if(t!=null)
		document.getElementsByTagName('body')[0].removeChild(t);	
}


//获取标签的xpath
function getXpath(element) {
    if (element.id !== "") {//判断id属性，如果这个元素有id，则显 示//*[@id="xPath"]  形式内容
        return '//*[@id=\"' + element.id + '\"]';
    }
    //这里需要需要主要字符串转译问题，可参考js 动态生成html时字符串和变量转译（注意引号的作用）
    if (element == document.body) {//递归到body处，结束递归
        return '/html/' + element.tagName.toLowerCase();
    }
    var ix = 1,//在nodelist中的位置，且每次点击初始化
         siblings = element.parentNode.childNodes;//同级的子元素

    for (var i = 0, l = siblings.length; i < l; i++) {
        var sibling = siblings[i];
        //如果这个元素是siblings数组中的元素，则执行递归操作
        if (sibling == element) {
            return arguments.callee(element.parentNode) + '/' + element.tagName.toLowerCase() + '[' + (ix) + ']';
            //如果不符合，判断是否是element元素，并且是否是相同元素，如果是相同的就开始累加
        } else if (sibling.nodeType == 1 && sibling.tagName == element.tagName) {
            ix++;
        }
    }
};


//对鼠标所指的元素进行处理
function check_region(element, recolor){
	if(hover_flag == 1){
		//思路：对于本标签，若鼠标落在本标签的下层标签上，则不处理本标签
		magicColor='#CDC0B0';
		children = element.getElementsByTagName("*");	//获取本标签的所有下层标签
		
		mouse_pos = getMousePos(event);	//获取鼠标坐标
		mouse_x = mouse_pos[0];
		mouse_y = mouse_pos[1];
		
		//self_rect = element.getBoundingClientRect();	
		
		//检查鼠标是否落在下层标签内，若鼠标在子标签内，本标签恢复原色
		for(var i= 0,L = children.length; i < L; i++){
			child_rect = children[i].getBoundingClientRect();	//标签相对于浏览器窗口（viewport）左上角的位置
			if ((mouse_x > child_rect.left && mouse_x < child_rect.right) && (mouse_y > child_rect.top && mouse_y < child_rect.bottom)){
				element.style.backgroundColor = recolor;
				return;
			}
		}
		
		//情况1鼠标不在本标签的任一个下层标签内则本标签变色
		//情况2无子标签,则本标签变色
		element.style.backgroundColor=magicColor;
		//将本标签的xpath显示到xpath_panel
		hot = getXpath(element).toString();
		//hot = element;
		//document.getElementById('xpath_panel').value=hot;
		//鼠标进入标签内要进行的操作：
	}
}


//恢复原色
function recoverColor(element, recolor){
	if(hover_flag == 1 && element.style)
		element.style.backgroundColor=recolor;//.toString()
}



//处理hover事件
function initHoverHandler(){
	var i, j, L;
	for(i in tags){
		target = document.getElementsByTagName(tags[i]);
		L = target.length;
		for(j=0;j<L;j++){
			//if (target[j].id && target[j].id =='xpath_panel')
			//	continue;
			recolor=target[j].style.backgroundColor;
			//绑定的函数需要传参的话解绑会出问题,removeEventListener解绑后依然有hover效果
			//解决办法：设置flag
			target[j].addEventListener('mousemove', check_region.bind(this, target[j], recolor), false);
			target[j].addEventListener('mouseleave', recoverColor.bind(this, target[j], recolor), false);
			target[j].setAttribute("title","按"+xkey_name+"复制Xpath");
		}
	}
}


//添加hover
function addHover(){
	if(hover_flag == -1){//还未绑定操作
		hover_flag = 1;
		initHoverHandler();
	}else if(hover_flag == 0){
		hover_flag = 1;
	}
}


//移除hover
//移除事件监听时传入的参数要与添加事件监听时使用的参数相同
function removeHover(){
	hover_flag = 0;
	/*
	var i, j, L;
	for(i in tags){
		target = document.getElementsByTagName(tags[i]);
		L = target.length;
		for(j=0;j<L;j++){
			if (target[j].id && target[j].id =='xpath_panel'){
				continue;
			}
			target[j].removeEventListener('mousemove', check_region, false);
			target[j].removeEventListener('mouseleave', recoverColor, false);
			target[j].removeAttribute("title");
		}
	}
	*/
}


//Xpath快捷键的响应函数
function xPathKeyHandler(){
	t = document.getElementById('xpath_panel');
	if(t)
		t.value=hot;
}



function closeXpath(){
	console.debug('xpath closeXpath enter');
	//移除监听按键
	if(typeof removeKeyMonitor != "undefined")  {
		removeKeyMonitor("Escape");
		console.debug('xpath removeKeyMonitor');
	}else{
		console.debug('xpath removeKeyMonitor undefined');
	}
	
	//添加显示板
	if(typeof removeXpathPanel != "undefined") {
		removeXpathPanel();
		console.debug('xpath removeXpathPanel');
	}else{
		console.debug('xpath removeXpathPanel undefined');
	}
	//遍历标签绑定事件
	//对于有异步加载生成的的标签需要重新调用addHover();方法，或者可以设置一个定时器，每隔一段时间执行一次addHover();
	if(typeof removeHover != "undefined") {
		removeHover();
		console.debug('xpath removeHover');
	}else{
		console.debug('rxpath emoveHover undefined');
	}
	console.debug('xpath closeXpath outer');
}



function openXpath(){
	console.debug('openXpath enter');
	//监听按键
	if(typeof addKeyMonitor != "undefined")  {
		addKeyMonitor("Escape", xPathKeyHandler);
		console.debug('addKeyMonitor');
	}else{
		console.debug('addKeyMonitor undefined');
	}
	
	//遍历标签绑定事件
	//对于有异步加载生成的的标签需要重新调用addHover();方法，或者可以设置一个定时器，每隔一段时间执行一次addHover();
	if(typeof addHover != "undefined") {
		addHover();
		console.debug('addHover');
	}else{
		console.debug('addHover undefined');
	}
	
	//添加显示板
	if(typeof addXpathPanel != "undefined") {
		addXpathPanel();
		console.debug('addXpathPanel');
	}else{
		console.debug('addXpathPanel undefined');
	}
	console.debug('openXpath outer');
}











