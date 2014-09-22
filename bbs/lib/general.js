function getcookie(name){
	var strcookie=document.cookie;
	var arrcookie=strcookie.split("; ");
	for(var i=0;i<arrcookie.length;i++){
		var arr=arrcookie[i].split("=");
		if(arr[0]==name)return arr[1];
	}
	return "";
}
function delcookie(name){
	var exp = new Date();
	exp.setTime(exp.getTime() - 1);
	var cval=getcookie(name);
	if(cval!=null) document.cookie= name + "="+cval+";expires="+exp.toGMTString();
}
function ajaxWithCallback(url,post,callback){
	var r=new XMLHttpRequest();
	r.open("POST", url , true);
	r.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	r.send(post);
	r.onreadystatechange=function(){
		if(r.readyState==4&&r.status==200){
			callback(r.responseText);
		}
	}
}
/*
function getInfo(xml){
	return xml.documentElement.getElementsByTagName("info");
}
function getUC(xml,child){
	return xml.getElementsByTagName(child)[0].firstChild.nodeValue;
}
*/
function formatstamp(stamp){
	stamp=parseInt(stamp);
	var d=new Date();
	var s=d.getTime()/1000 -stamp;
	if(s<60) return s+"秒前";
	if(s<3600) return Math.floor(s/60)+"分钟前";
	if(s<3600*24) return Math.floor(s/3600)+"小时前";
	if(s<3600*24*30) return Math.floor(s/3600/24)+"天前";
	d=new Date(stamp*1000);
	return d.getFullYear()+"-"+heal((d.getMonth()+1),2)+"-"+heal(d.getDate(),2);
}
function heal(s,n){
	s=s.toString();
	while(s.length<n){
		s="0"+s;
	}
	return s;
}
function getsParam(){
	var gets=[];
	var s=self.location.href;
	var ps=s.slice(s.indexOf("?")+1).split("&");
	for(var i=0;i<ps.length;i++){
		var temp=ps[i].split("=");
		gets[temp[0]]=temp[1];
	}
	return gets;
}
