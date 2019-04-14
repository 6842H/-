

//closeXpath.js关闭xpath显示功能，，需在commonInject.js 、xPathScript.js后注入
//mustDo放在inject里，因为ct不能操作页面的js，而inject可以，虽然ct是一定会注入到页面的，
//inject是否注入页面根据插件开关决定，所以调用mustDO需要先判断mustDo是否存在


if(typeof mustDo != "undefined" ){
	mustDo('closeXpath',500);
}else{
	console.debug('closeXpath: mustDo() undefined');
}







