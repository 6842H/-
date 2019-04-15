

//放在webworker线程里执行


// 翻译API

var youdao_api_get="http://fanyi.youdao.com/translate?doctype=json&type=AUTO&i=";


//前台存在跨域问题，放在bg可解决
function setXMLHttp(callBack){
	var xmlhttp;
	//  IE7+, Firefox, Chrome, Opera, Safari 浏览器执行代码
	xmlhttp=new XMLHttpRequest();
	if(xmlhttp=="undefined")
		xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
	xmlhttp.onreadystatechange=function() {
		//while循环判断
		if (xmlhttp.readyState==4 && xmlhttp.status==200) {// (xmlhttp.readyState==1 && xmlhttp.status==0) || 
			try{
				var resstr =xmlhttp.responseText;
				var data = JSON.parse(resstr);
				src = '';
				tgt = '';
				if(data.hasOwnProperty("translateResult")){
					for(paragraph in data.translateResult){
						for(sentence in data.translateResult[paragraph]){
							src += data.translateResult[paragraph][sentence].src.toString();
							tgt += data.translateResult[paragraph][sentence].tgt.toString();
						}
						src += '<br/>';
						tgt += '<br/>';
					}
						
				}
				res = {cmd:'transOK',result:{"原文":src, "译文":tgt}};
				postMessage(res);
			}catch(err){
				postMessage({cmd:'err',result:{"message":err.message}});
			}
		}/*else{
			try{
				var res={cmd:'transFail', result:{"error": "网络异常/接口失效"}};
				postMessage(res);
			}catch(err){
				postMessage({cmd:'err',result:{"message":err.message}});
			}
		}*/
	}
	return xmlhttp;
	//post
	//xmlhttp.open("POST",url,false);
	//xmlhttp.setRequestHeader("User-Agent", ug);
	//xmlhttp.send("id=id&ad=ad");
	
	//get
	//xmlhttp.open("GET","/try/ajax/demo_get2.php?fname=Henry&lname=Ford",false);
	//xmlhttp.send();
}


//GET
function youDaoTransGet(keyword){
	if(keyword){
		xmlhttp = setXMLHttp();
		xmlhttp.open("GET", youdao_api_get+encodeURI(keyword), false);
		xmlhttp.send();
	}
}

onmessage = function(event){
	if(event.data.cmd=='trans'){
		youDaoTransGet(event.data.keyword);
	}
	
}






