$(document).ready(function(){
	if (window.location.hash=="#summer")
		$('#type2').click();
	$('#number_info,#number_info_2').miniTip({
        	className: 'green',
        	showAnimateProperties: {'top': '-=10'},
        	hideAnimateProperties: {'top': '+=10'},
        	position: 'right',
        	onLoad: function(element, minitip) {
          	      $(element).animate({'opacity': 0.35}, '350');
        	},
        	onHide: function(element, minitip) {
                	$(element).animate({'opacity': 1}, '250');
        	}
  	});
});
function changecaptcha() {
	$('#img_captcha').attr("src","/assets/api/securimage/securimage_show.php?"+Math.random());
	$('#captcha').val("");
}
function changetype(x) {
	changecaptcha();
	$('#name,#contact,#number,#other').val("");
	$('#number_info,#number_info_2').hide();
	if (x=="join") {
		$('#number_info').show();
		$('#join_modal').html('<p>恭喜！您已经成为了北京大学自行车协会的一员！<br>您的入会信息已经通过短信发送到了您的手机上。<br>请凭该短信于<span style="color:red">周五下午</span>在<span style="color:red">三角地出摊地（农园西北角）</span><span id="dd">交10元钱入会费</span>并领取会员证与年刊。</p>');
	}
	else {
		$('#number_info_2').show();
		$('#join_modal').html('<p>恭喜！您已经成功报名了北京大学自行车协会的暑期远征！<br>您的报名信息已经通过短信发送到了您的手机上。<br>请凭该短信于<span style="color:red">周五下午</span>在<span style="color:red">三角地出摊地（农园西北角）</span><span id="dd">交20元钱报名费</span>并领取资料。</p>');
	}
}
function clicked() {
	$('#alert_name,#alert_phone,#alert_number,#alert,#alert_captcha').hide();
	if ($('#name').val()=="") {$('#alert_name').show();$('#name').focus();return false;}
	var phonenum=$('#contact').val();
       	if (phonenum.length!=11 || phonenum.substr(0,1)!="1" || isNaN(phonenum))
	{
		$('#alert_phone').show();$('#contact').focus();return;
	}
	var num=$('#number').val();
	var sex=0;
	if ($('#sex2').prop("checked")) sex=1;
	var type="join";
	if ($('#type2').prop("checked")) type="summer";
	var captcha=$('#captcha').val();
	if (captcha=="") {$('#alert_captcha').show();$('#captcha').focus();return;}

	$.post("/assets/api/main.php",{
		ask:"join",
		type:type,
		id:$('#id').val(),
		name:$('#name').val(),
		sex:sex,
		phone:phonenum,
		year:$('#year').val(),
		code:num,
		hint:$('#other').val(),
		captcha:captcha
		},function(data) {
			var x=parseInt(data);
			if (x==-44) {
				changecaptcha();
				$('#alert_captcha').show();
				$('#captcha').focus();
				return;
			}
			if (x==-15) {
				changecaptcha();
				alert('超时，请重新登录！');
				window.parent.showlogin();
				return;
			}
			if (x==-3)
			{
				changecaptcha();
				$('#alert_number').show();
				$('#number').focus();
				return;
			}
			if (x==-2 || x==-22)
			{
				changecaptcha();
				alert("操作过于频繁，请过半小时后再重试");
				return;
			}
			if (x==-1)
			{
				changecaptcha();
				alert("ID已经报名！");
				return;
			}
			if (x!=0)
			{
				changecaptcha();
				alert("数据库错误！错误代码："+x+" 请联系我们寻求处理方案");
				return;
			}
			if (num!="")
				$('#dd').hide();
			$('#confirm_dialog').modal();
	});
}
