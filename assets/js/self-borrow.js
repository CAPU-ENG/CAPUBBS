$(document).ready(function() {
	/*
	$('#captcha_1').keypress(function(e){
		if (e.keyCode==13)
			confirmborrowfrom();
	});
	$('#captcha_2').keypress(function(e){
		if (e.keyCode==13)
			makenewborrow();
	});
	$('#captcha_3').keypress(function(e){
		if (e.keyCode==13)
			makenewlend();
	});
	$('#captcha_4').keypress(function(e){
		if (e.keyCode==13)
			confirmlendto();
	});
	*/
	$('.processorBox li').click(function(){
		var i = $(this).index();
		var j=i+1;
		setTimeout(function() {
			window.parent.setSize($('#step'+j).height()+400);
		}, 300);
		$('.processorBox li').removeClass('current').eq(i).addClass('current');
		$('.step').fadeOut(300).eq(i).fadeIn(500);
	});
	$('#nextBtn1').click(function(){
		setTimeout(function() {
			window.parent.setSize($('#step2').height()+400);
		}, 300);
		$('.processorBox li').removeClass('current').eq(1).addClass('current');
		$('.step').fadeOut(300).eq(1).fadeIn(500);
	});
	$('#nextBtn2').click(function(){
		setTimeout(function() {
			window.parent.setSize($('#step3').height()+400);
		}, 300);
		$('.processorBox li').removeClass('current').eq(2).addClass('current');
		$('.step').fadeOut(300).eq(2).fadeIn(500);
	});
});

function makenewborrow() {
    $('#alert_phone,#alert_hint,#alert_height').hide();
    var phonenum=$('#contact').val();
    if (phonenum.length!=11 || phonenum.substring(0,1)!="1" || isNaN(phonenum)){
      $('#alert_phone').show();
      $('#contact').focus();
      return;
    }
    var username=$('#id').val();
    var sex="女";
    if ($('#sex2').attr("checked")) sex="男";
    var hint=$('#hint').val();
    var height=$('#height').val();
    if (height=="" || isNaN(height)) {
	$('#alert_height').show();
	$('#height').focus();
	return;
    }
    var length=$('#length').val();
    $.post("/assets/api/main.php",{
	ask: "newborrow",
	username: username,
	sex: sex,
	phone: phonenum,
	height: height,
	hint: hint,
	length: length,
	captcha: $('#captcha_2').val()
	},function(data) {
		var x=parseInt(data);
		if (x==-44) {
			changecaptcha('2');
			$('#alert_captcha_2').show();
			$('#captcha_2').focus();
			return;
		}
		if (x==-15) {
			alert("超时，请重新登录");
			window.parent.showlogin();
			return;
		}
		if (x==0) {
			$('#borrow_dialog').modal('hide');
			$('#confirm_dialog').modal();
			return;
		}
		alert('登记错误，错误代码 '+x+" \n请重试，或者与我们联系寻求解决方案");
	});
}
function borrowfrom() {
	if ($('#username').text()=="") {
		alert('请先注册或登录！');
		window.parent.showlogin();
		return;
	}
	var id=$("input[name='radio']:checked").val();
	if (id==null) {alert("请先选中一个信息");return;}
	
	var numberid=$('#number_'+id).text();
	var toid=$('#id_'+id).text();
	$('#borrowfrom_title').html("我要求车于 "+toid);
	$('#borrowfrom_id').html(numberid);
	changecaptcha('1');

	$('#borrowfrom_dialog').modal();
	$('#borrowfrom_phone').focus();
	$('#borrowfrom_phone').keypress(function(e) {
		if (e.keyCode==13) confirmborrowfrom();
	});
}
function newborrow() {
	if ($('#username').text()=="") {
		alert('请先注册或登录！');
		window.parent.showlogin();
		return;
	}
	changecaptcha('2');
	window.parent.setSize(900);
	$('#borrow_dialog').modal();

}
function confirmborrowfrom() {
	$('#alert_borrowfrom_phone').hide();
	var phone=$('#borrowfrom_phone').val();
	if (phone.length!=11 || isNaN(phone) || phone.substring(0,1)!="1") {
		$('#alert_borrowfrom_phone').show();
		$('#borrowfrom_phone').focus();
		return;
	}

	var toid=$('#borrowfrom_id').text();
	var fromid=$('#username').text();

	$.post("/assets/api/main.php",{
		ask: "borrowfrom",
		to: toid,
		from: fromid,
		phone: phone,
		captcha: $('#captcha_1').val()
		},function(data) {
			var x=parseInt(data);
			if (x==-44) {
				changecaptcha('1');
				$('#alert_captcha_1').show();
				$('#captcha_1').focus();
				return;
			}
			if (x==-15) {
				alert("超时，请重新登录");
				window.parent.showlogin();
				return;
			}
			if (x==-22) {
				alert("您短期内发送短信数目过多，请过半个小时后重试。");
				return;
			}
			if (x==0) {
				alert("登记成功！\n短信已发到对方手机，请静待线下联系");
				$('#lendto_dialog').modal('hide');
				return;
			}
			alert('登记错误，错误代码 '+x+" \n请重试，或者与我们联系寻求解决方案");
	});


}
function makenewlend() {
    $('#alert_phone,#alert_hint').hide();
    var username=$('#id').val();
    var phonenum=$('#contact').val();
    if (phonenum.length!=11 || phonenum.substring(0,1)!="1" || isNaN(phonenum)){
      $('#alert_phone').show();
      $('#contact').focus();
      return;
    }
    var sex="女";
    if ($('#sex2').attr("checked")) sex="男";
    var hint=$('#hint').val();
    /*
    if (hint.match(/[\"\']/)!=null) {
	$('#alert_hint').show();
	$('#hint').focus();
	return;
    }
    */
    var bike=$('#bike').val();
    var length=$('#length').val();
    var condition=$('#condition').val();

    $.post("/assets/api/main.php",{
	ask: "newlend",
	username: username,
	sex: sex,
	phone: phonenum,
	hint: hint,
	bike: bike,
	length: length,
	condition: condition,
	captcha: $('#captcha_3').val()
	},function(data) {
		var x=parseInt(data);
		if (x==-44) {
			changecaptcha('3');
			$('#alert_captcha_3').show();
			$('#captcha_3').focus();
			return;
		}
		if (x==-15) {
			alert("超时，请重新登录");
			window.parent.showlogin();
			return;
		}
		if (x==0) {
			$('#borrow_dialog').modal('hide');
			$('#confirm_dialog').modal();
			return;
		}
		alert('登记错误，错误代码 '+x+" \n请重试，或者与我们联系寻求解决方案");

	});
}
function newlend() {
	if ($('#username').text()=="") {
		alert('请先注册或登录！');
		window.parent.showlogin();
		return;
	}
	changecaptcha('3');
	$('#borrow_dialog').modal();
	window.parent.setSize(900);
}
function lendto() {
	if ($('#username').text()=="") {
		alert('请先注册或登录！');
		window.parent.showlogin();
		return;
	}
	var id=$("input[name='radio']:checked").val();
	if (id==null) {alert("请先选中一个信息");return;}
	
	var numberid=$('#number_'+id).text();
	var toid=$('#id_'+id).text();
	$('#lendto_title').html("我要借车给 "+toid);
	$('#lendto_id').html(numberid);

	changecaptcha('4');
	$('#lendto_dialog').modal();
	$('#lendto_phone').focus();
	$('#lendto_phone').keypress(function(e) {
		if (e.keyCode==13) $('#captcha_4').focus();
	});
}
function confirmlendto() {
	$('#alert_lendto_phone').hide();
	var phone=$('#lendto_phone').val();
	if (phone.length!=11 || isNaN(phone) || phone.substring(0,1)!="1") {
		$('#alert_lendto_phone').show();
		$('#lendto_phone').focus();
		return;
	}

	var toid=$('#lendto_id').text();
	var fromid=$('#username').text();

	$.post("/assets/api/main.php",{
		ask: "lendto",
		to: toid,
		from: fromid,
		phone: phone,
		captcha: $('#captcha_4').val()
		},function(data) {
			var x=parseInt(data);
			if (x==-44) {
				changecaptcha('4');
				$('#alert_captcha_4').show();
				$('#captcha_4').focus();
				return;
			}
			if (x==-15) {
				alert("超时，请重新登录");
				window.parent.showlogin();
				return;
			}
			if (x==-22) {
				alert("您短期内发送短信数目过多，请过半个小时后重试。");
				return;
			}
			if (x==0) {
				alert("登记成功！\n短信已发到对方手机，请静待线下联系");
				$('#lendto_dialog').modal('hide');
				return;
			}
			alert('登记错误，错误代码 '+x+" \n请重试，或者与我们联系寻求解决方案");
	});

}
function changecaptcha(x) {
	$('#img_captcha_'+x).attr("src","/assets/api/securimage/securimage_show.php?"+Math.random());
	$('#captcha_'+x).val("");
}
function resetchange(type) {
	$('.'+type+'_tr').each(function() {
		$(this).show();
		$(this).children().eq(5).children().first().val($(this).children().eq(6).text());
		$(this).children().eq(8).text("1");
	});	
}
function del(index,type) {
	$('#'+type+'show_'+index).text("0");
	$('#'+type+'_'+index).hide();
}
function savechange(type) {
	var json='{';
	$('.'+type+'_tr').each(function(index) {
		if (index!=0) json=json+",";
		var id=$(this).children().first().text().substr(1);
		json=json+'"'+id+'":';
		if ($('#'+type+'show_'+id).text()=="0") json=json+'"2"';
		else json=json+'"'+$(this).children().eq(5).children().first().val()+'"';
	});
	json=json+"}";
	$.post("/assets/api/main.php",{
		ask:"savelend",
		data: json
		},function(data) {
			var x=parseInt(data);
			if (x==-15) {
				alert("登录超时，请重新登录");
				window.parent.showlogin();
				return;
			}
			if (x!=0) {
				alert("未知错误，错误代码 "+x+" 请重试或反馈给我们以寻求解决办法。");
				return;
			}
			alert("保存成功！");
			window.location.reload();
		}
	);
}
