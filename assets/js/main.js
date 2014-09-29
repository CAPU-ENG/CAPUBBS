$(document).ready(function() {
        $('#slider').nivoSlider({
                pauseTime: 4000,
                keyboardNav: false,
                captionOpacity: 0.6
        });
        $("#calendar").eventCalendar({
                eventsjson: '/assets/api/getCalendar.php',
                eventsLimit: 4,
                jsonDateFormat: 'human',
                showDescription: true
	});
	$('#qrcode_wechat,#qrcode_android,#qrcode_ios').miniTip({
                className: 'green',
		showAnimateProperties: {'top': '-=20'},
                hideAnimateProperties: {'top': '+=20'},
                position: 'top',
                onLoad: function(element, minitip) {
                      $(element).animate({'opacity': 0.35}, '350');
                },
                onHide: function(element, minitip) {
                        $(element).animate({'opacity': 1}, '250');
                }
        });
});

function inform_checkbox() {
	if ($('#add_inform_checkbox').prop("checked"))
		$('#inform_url').attr("Readonly",true);
	else $('#inform_url').attr("Readonly",false);
}

function saveimg() {
	var json="[";
	$(".imgs").each(function(index2){
		if (index2!=0) json=json+",";
		json=json+"{";
		var y=0;
		$(this).children().each(function(index) {
			if (index==1) json=json+"\"img\"";
			else if (index==3) json=json+",\"imgthumb\"";
			else if (index==5) json=json+",\"title\"";
			else return;
			json=json+":\""+$(this).text()+"\"";
		});
		json=json+",\"id\":\""+index2+"\"";
		json=json+"}";
	});
	json=json+"]";

	$.post("/assets/api/main.php",{
		ask:"saveimg",
		json:json
		},function(data) {
			var x=parseInt(data);
			if (x==-18) {alert("超时或权限不足！请重新登录尝试一次。");window.parent.showlogin();return;}
			else if (x==0) {alert("修改成功！");window.location.reload();}
			else alert("未知错误，错误代码 "+x+" 请重试或与我们联系以寻求解决方案。");
		}
	);
}

function add_inform() {
	var inform_title=$('#inform_title').val();
	var inform_url=$('#inform_url').val();
	if (inform_title=="") {
		alert("标题不能为空");
		$('#inform_title').focus();
		return;
	}
	if ($('#add_inform_checkbox').prop("checked") || inform_url=="") inform_url="javascript:void(0)";
	/*
	if (inform_title.match(/[\"\']/)!=null) {
                alert("标题中不得含有 ' \" ");
                $('#inform_title').focus();
                return;
        }
	*/
	$.post("/assets/api/main.php",{
		ask:"addinform",
		title:inform_title,
		url:inform_url
		},function(data) {
			var x=parseInt(data);
			if (x==-18) {alert("超时或权限不足！请重新登录尝试一次。");window.parent.showlogin();return;}
			else if (x==0) {alert("发表成功！");window.location.reload();}
			else alert("未知错误，错误代码 "+x+" 请重试或与我们联系>以寻求解决方案。");
	});
}

function opencalendar() {
	loadcalendar();
	$('#calendar_dialog').modal();
}

function select_inform() {
        var id=$('#inform_id').val();
        var inform_title=$('#inform_select_title');
        var inform_url=$('#inform_select_url');
        var inform_time=$('#inform_select_time');
        var inform_timestamp=$('#inform_select_timestamp');
        if (id=="") {
                inform_title.html("");
                inform_url.html("");
                inform_time.html("");
                inform_timestamp.html("");
                return;
        }
        var i=parseInt(id);
        var get_title=$('#inform_'+i).text();
        var get_url=$('#inform_'+i).attr("href");
        var get_time=$('#time_'+i).text();
        var get_timestamp=$('#timestamp_'+i).text();
        inform_title.html(get_title);
        inform_url.html(get_url);
        inform_time.html(get_time);
        inform_timestamp.html(get_timestamp);
}

function del_inform() {
	var select_time=$('#inform_select_timestamp').text();
	var select_title=$('#inform_select_title').text();
	if (select_time=="") return;
	if (confirm("你选择的公告是：\n"+select_title+"\n你确定要删除该公告么？删除是不可逆操作！"))
	{
		$.post("/assets/api/main.php",{
			ask:"delinform",
			time:select_time
			},function(data) {
				var x=parseInt(data);
                        	if (x==-18) {alert("超时或权限不足！请重新登录尝试一次。");window.parent.showlogin();return;}
				else if (x==0) {alert("删除成功！");window.location.reload();}
				else alert("未知错误，错误代码 "+x+" 请重试或与我们联系>以寻求解决方案。");
		});
	}
}

function savecalendar() {
	var json="[";
	$(".calendar_content").each(function(index1){
		if (index1!=0) json=json+",";
		json=json+"{";
		var y=0;
		$(this).children().each(function(index) {
			if (index==0) json=json+"\"time\"";
			else if (index==1) json=json+",\"title\"";
			else if (index==2) json=json+",\"content\"";
			else return;
			json=json+":\""+$(this).text()+"\"";
			y=1;
		});
		json=json+"}";
	});
	json=json+"]";
	var year=$('#year').val();
        var month=$('#month').val();
        var day=$('#day').val();
	$.post("/assets/api/main.php",{
		ask:"savecalendar",
		year:year,
		month:month,
		day:day,
		content:json
		},function(data) {
			var x=parseInt(data);
			if (x==-18) {alert("超时或权限不足！请重新登录尝试一次。");window.parent.showlogin();return;}
			else if (x==0)
				$('#alert_success').show();
			else alert("未知错误，错误代码 "+x+" 请重试或与我们联系以寻求解决方案。");
	});
}

function delitem(i) {
	$('#alert_error,#alert_success').hide();
	$('#calendar_item_'+i).remove();
}

function additem() {
	$('#alert_error,#alert_success').hide();
	var valid=true;
	var hour=$('#hour').val();
	var minute=$('#minute').val();
	var title=$('#calendar_title').val();
	var text=$('#calendar_content').val();

	if (title.length==0 || title.length>15 || text.length>30) valid=false;
	//if (title.match(/[\'\,\"\[\]\{\}]/)!=null || text.match(/[\'\,\"\[\]\{\}]/)!=null) valid=false;
	if (title.indexOf("\"")!=-1 || text.indexOf("\"")!=-1) valid=false;
	if (!valid)
	{
		$("#alert_error").show();
		$('#calendar_title').focus();
		return;
	}

	var i=Math.round(Math.random()*1000)+30;
	
	var txt="<tr class='calendar_content' id='calendar_item_"+i+"'><td>"+hour+":"+minute+"</td><td>"+title+"</td><td>"+text+"</td><td class='text-center'><a href='javascript:delitem("+i+");'><span class='glyphicon glyphicon-minus-sign'></span></a></td></tr>";
	$('#calendar_add').before(txt);
}

function closevideo(id) {
	if (id=="huige") {
		document.getElementById("huige_video").pause();
		$('#huige_dialog').modal('hide');
		return;
	}
	if (id=="chenai") {
		document.getElementById("chenai_video").pause();
		$('#chenai_dialog').modal('hide');
		return;
	}
	document.getElementById("video_"+id).pause();
	$('#video_dialog_'+id).modal('hide');
}

function loadcalendar() {
	$('#alert_error,#alert_success').hide();
	var table_title="<table class='table table-hover'><tr><th>时间</th><th>标题</th><th>描述</th><th>操作</th></tr>";
	var table_end="<tr id='calendar_add'><td><select id='hour'>";
        for (var i=0;i<=23;i++) {
            var z=""+i;if (i<10) z="0"+z;
	    table_end=table_end+"<option value="+z+">"+z+"</option>";
        }
        table_end=table_end+"</select> : <select id='minute'>";
        for (var i=0;i<=55;i=i+5) {
            var z=""+i;if (i<10) z="0"+z;
            table_end=table_end+"<option value="+z+">"+z+"</option>";
        }
        table_end=table_end+"</select></span></td> <td><input type='text' id='calendar_title'  maxlength='15'></input></td><td><input type='text'  id='calendar_content'  maxlength='30'></input></td><td class='text-center'><a href='javascript:additem();'><span class='glyphicon glyphicon-plus-sign'></span></a></td></tr></table>";
	 $('#calendar_list').html(table_title+table_end);	
	var year=$('#year').val();
	var month=$('#month').val();
	var day=$('#day').val();
	$.post("/assets/api/main.php",{
		ask:"loadcalendar",
		year:year,
		month:month,
		day:day
		},function(data) {
			if (data==null || data=="") return;
			var content=data.documentElement.getElementsByTagName("data");
			var txt="";
			for (var i=0;i<content.length;i++) {
				txt=txt+"<tr class='calendar_content' id='calendar_item_"+i+"'>";
				var time=content[i].getElementsByTagName("time");
				txt=txt+"<td>"+time[0].firstChild.nodeValue+"</td>";
				var title=content[i].getElementsByTagName("title");
				txt=txt+"<td>"+title[0].firstChild.nodeValue+"</td>";
				var con=content[i].getElementsByTagName("content");
				txt=txt+"<td>"+con[0].firstChild.nodeValue+"</td>";
				txt=txt+"<td class='text-center'><a href='javascript:delitem("+i+");'><span class='glyphicon glyphicon-minus-sign'></span></a></td></tr>";
			}
			$('#calendar_list').html(table_title+txt+table_end);
		},"xml"
	);
}
function moveup(id) {
	if (id==1) return;
	exchange($('#img'+id),$('#img'+(id-1)));		
}

function exchange(x,y) {
	$('#img_error').hide();	
	for (var i=1;i<=5;i++) {
		var temp=x.children().eq(i).text();
		x.children().eq(i).text(y.children().eq(i).text());
		y.children().eq(i).text(temp);
	}
}

function movedown(id) {
	var mx=parseInt($(".imgs").last().attr("id").charAt(3));
	if (id==mx) return;
	exchange($('#img'+id),$('#img'+(id+1)));
}

function delimg(id) {
	$('#img_error').hide();	
	if (parseInt($(".imgs").last().attr("id").charAt(3))==1) return;
	var x=$(".imgs").eq(id-1);
	x.html("");
	x.removeAttr("class");
	x.removeAttr("id");
	x.nextAll().each(function(){
		var y=$(this);
		if (y.attr("id")==null) return;
		var n=parseInt(y.attr("id").charAt(3))-1;
		y.attr("id","img"+n);
		y.children().first().text("#"+n);
		var z=y.children().last();
		z.html("<a href='javascript:moveup("+n+")'><span class='glyphicon glyphicon-circle-arrow-up'></span></a>&nbsp;&nbsp;<a href='javascript:movedown("+n+")'><span class='glyphicon glyphicon-circle-arrow-down'></span></a>&nbsp;&nbsp;<a href='javascript:delimg("+n+")'><span class='glyphicon glyphicon-minus-sign'></span></a></td></tr>");
	});
	x.remove();
}

function addimg() {
	var inputimg=$("#inputimg").val();
	var inputimgthumb=$("#inputimgthumb").val();
	var inputimgtxt=$("#inputimgtxt").val();

	var l=$(".imgs").last();
	var lst=parseInt(l.attr("id").charAt(3))+1;
	if (lst==7) {$('#img_error').html("图片数已到上限");return;}

	$('#img_error').hide();
	var x=inputimg;if (x.length>25) x=x.substr(0,25)+"....";
	var y=inputimgthumb;if (y.length>25) y=y.substr(0,25)+"....";
	var html="<tr class='imgs' id='img"+lst+"'><td>#"+lst+"</td><td style='display:none'>"+inputimg+"</td><td>"+x+"</td><td style='display:none'>"+inputimgthumb+"</td><td>"+y+"</td><td>"+inputimgtxt+"</td><td><a href='javascript:moveup("+lst+")'><span class='glyphicon glyphicon-circle-arrow-up'></span></a>&nbsp;&nbsp;<a href='javascript:movedown("+lst+")'><span class='glyphicon glyphicon-circle-arrow-down'></span></a>&nbsp;&nbsp;<a href='javascript:delimg("+lst+")'><span class='glyphicon glyphicon-minus-sign'></span></a></td></tr>";
	l.after(html);
}

function check_valid() {
	var inputimg=$("#inputimg").val();
	var inputimgthumb=$("#inputimgthumb").val();
	var inputimgtxt=$("#inputimgtxt").val();	
	var img_error=$("#img_error");
	img_error.text("请稍后...");	img_error.show();

	/*
	if (inputimgtxt.match(/[\'\,\"\[\]\{\}]/)!=-1) {
		img_error.html("<strong>输入包含无效字符</strong> 不得含有如下七个字符：&nbsp;&nbsp;&nbsp;' \" [ ] { } ,");
		$('#inputimgtxt').focus();return;
	}
	*/
	if (inputimgtxt.indexOf("\"")!=-1) {
                img_error.html("<strong>输入包含无效字符</strong> 不得含有双引号");
                $('#inputimgtxt').focus();return;
        }
	if (inputimg.indexOf("\"")!=-1) {
                img_error.html("<strong>输入包含无效字符</strong> 不得含有双引号");
                $('#inputimg').focus();return;
        }
	if (inputimgthumb.indexOf("\"")!=-1) {
                img_error.html("<strong>输入包含无效字符</strong> 不得含有双引号");
                $('#inputimgthumb').focus();return;
        }

	if (inputimg=="") {img_error.html("<strong>图片地址不能为空</strong>");$('#inputimg').focus();return;}
	if (inputimgthumb=="") {img_error.html("<strong>缩略图地址不能为空</strong>");$('#inputimgthumb').focus();return;}
	var state=0;
	var valid1=0,valid2=0,valid3=0;
	valid1=1;
	/*
	var img=new Image();
	img.src=inputimg;	
	img.onload=function() {
		if (state==-1) return;
		valid1=1;
		if (valid2==1 && valid3==1) {state=-1;addimg();}
	}
	img.onerror=function() {
		valid1=-1;
		state=-1;
		img_error.text("图片加载出错");
		$("#inputimg").focus();
	}
	*/	

	var img2=new Image();
	var width=-1,height=-1;
	img2.src=inputimgthumb;	
	img2.onload=function() {
		if (state==-1) return;
		width=img2.width;
		height=img2.height;
		if (width<=310 || height/width<0.7485 || height/width>0.7515)
		{
			valid2=-1;
			state=-1;
			img_error.text("缩略图长宽不小于310且宽高比应接近4:3，当前"+width+"*"+height+" ("+(height/width)+")");
			$("#inputimgthumb").focus();
			return;
		}
		valid2=1;
		if (valid1==1 && valid3==1) {state=-1;addimg();}
	}
	img2.onerror=function() {
		valid2=-1;
		state=-1;
		img_error.text("缩略图出错");
		$("#inputimgthumb").focus();
	}

	$.post("/assets/api/main.php",{
		ask: "getfilesize",
		url: inputimgthumb
		},function(data) {
			if (state==-1) return;
			var x=parseInt(data);
			if (x>100*1024) {
				state=-1;
				img_error.text("缩略图大小应该不超过100kb，当前"+(x/1024)+"kb");
				$("#inputimgthumb").focus();
				return;
			}
			if (valid1==1 && valid2==1) {state=-1;addimg();}
		}
	);
}

function check_valid2() {
	var inputimg=$("#postimg_url").val();
	var inputimgthumb=$("#postimg_thumburl").val();
	var img_error=$("#postimg_error");
	img_error.text("请稍后...");img_error.show();
	
	if (inputimg=="") {img_error.html("<strong>图片地址不能为空</strong>");$('#postimg_url').focus();return;}
	if (inputimgthumb=="") {img_error.html("<strong>缩略图地址不能为空</strong>");$('#postimg_thumburl').focus();return;}
	var state=0;
	var valid1=0,valid2=0,valid3=0;

	valid1=1;
	/*
	var img=new Image();
	img.src=inputimg;	
	img.onload=function() {
		if (state==-1) return;
		valid1=1;
		if (valid2==1 && valid3==1) {state=-1;postimg_submit();}
	}
	img.onerror=function() {
		valid1=-1;
		state=-1;
		img_error.text("图片加载出错");
		$("#postimg_url").focus();
	}
	*/

	var img2=new Image();
	var width=-1,height=-1;
	img2.src=inputimgthumb;	
	img2.onload=function() {
		if (state==-1) return;
		width=img2.width;
		height=img2.height;
		if (width<=310 || height/width<0.7485 || height/width>0.7515)
		{
			valid2=-1;
			state=-1;
			img_error.text("缩略图宽应不小于310且长宽比应接近4:3，当前"+width+"*"+height+" ("+(height/width)+")");
			$("#postimg_thumburl").focus();
			
			return;
		}
		valid2=1;
		if (valid1==1 && valid3==1) {state=-1;postimg_submit();}
	}
	img2.onerror=function() {
		valid2=-1;
		state=-1;
		img_error.text("缩略图出错");
		$("#postimg_thumburl").focus();
	}

	$.post("/assets/api/main.php",{
		ask: "getfilesize",
		url: inputimgthumb
		},function(data) {
			if (state==-1) return;
			var x=parseInt(data);
			if (x>100*1024) {
				state=-1;
				img_error.text("缩略图大小应该不超过100kb，当前"+(x/1024)+"kb");
				$("#postimg_thumburl").focus();
				return;
			}
			if (valid1==1 && valid2==1) {state=-1;postimg_submit();}
		}
	);
}

function postimg_submit()
{
	var url=$('#postimg_url').val();
	var thumburl=$('#postimg_thumburl').val();
	var title=$('#postimg_title').val();

	$.post("/assets/api/main.php",{
		ask:"postimg",
		imgurl:url,
		imgthumburl:thumburl,
		text:title
		},function(data) {
			var x=parseInt(data);
			if (x==0) {
				$('#postimg_error').hide();
				alert("投稿成功！");
				$('#postimg_dialog').modal('hide');
				$('#postimg_url').val("");
				$('#postimg_thumburl').val("");
				$('#postimg_title').val("");
				return;
			}
			else if (x==-15) {
				alert("登录超时，请重新登录。");
				window.parent.showlogin();
				return;
			}
			$('#postimg_error').text("投稿错误，错误代码 "+x+" 请重试或与我们联系寻求解决方案。");
			return;
		}
	);
}
