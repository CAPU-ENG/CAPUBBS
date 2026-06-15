<?php
    include("../../lib/mainfunc.php");
    include_once "../../../config.php";
    date_default_timezone_set('Asia/Shanghai');
    $users=getuser();
    $username=$users['username'];
?>
<html>
<head>
<meta charset="utf-8">
<meta name="apple-itunes-app" content="app-id=826386033">
<title>报名帖发布</title>
<script type="text/javascript" src="../../lib/general.js"></script>
<script src="../../lib/jquery.min.js"></script>
<link rel="stylesheet" href="../../lib/general.css">
<link rel="stylesheet" href="../../main/style.css">
<link rel="shortcut icon" href="/assets/images/capu.jpg">
</head>
<body>
<div class="header">
<br>

<div class="user">
<?php
$nowurl=$_SERVER["PHP_SELF"]. "?".$_SERVER["QUERY_STRING"];
$nowurl=urlencode($nowurl);
if($username!=""){
    $userinfo=mainfunc(array("view"=>$username));
    $userinfo=$userinfo[0];
    $msg=intval($userinfo['newmsg']);
    $icon=translateicon($userinfo['icon']);
    $star=intval($userinfo['star']);
    echo("<img src='$icon' class='usericon'></img>");
    echo("<div class='userinfo'>");
    echo("<a href='/bbs/user/?name=$username' target='_blank'>$username</a>");
    echo("&nbsp;等级：$star");

    echo("<script type='text/javascript'>");
    echo("var score=".$userinfo['score'].";");
    echo("var star=".$star.";");
    echo("</script>");

    if($msg==0){
        echo("&nbsp;<a href='/bbs/home' target='_blank'>个人中心</a>");
    }else{
        echo("<br><a href='/bbs/home?pos=message' target='_blank'>您有 $msg 条未读消息</a>");
    }
    echo("<br><a href='/bbs/logout?from=$nowurl'>注销</a>");
    echo("</div>");
}else{
    echo("<script type='text/javascript'>var score=-1;</script>");
    echo("<span class='guest'>欢迎您，游客！<a href='/bbs/login?from=$nowurl'>登录</a> 或者 <a href='/bbs/register'>注册</a></span>");
}
?>

</div>

</div>
<br>
<?php
    if ($username!="") {
?>
        <div class="editor" id="editor">
            <div id="activity_info">
                <div style="margin-bottom:10px;">
                    <strong>报名问卷设置</strong>
                    <button type="button" onclick="addQuestion()" style="margin-left:10px;">+ 添加问题</button>
                </div>
                <div id="question-list">
                </div>
            </div>
            <div>
                选择版块：
                <select name="bid" id="fm_bid" style="min-width:180px;">
                    <option value="1">车协工作区</option>
                    <option value="2">行者足音</option>
                    <option value="3">车友宝典</option>
                    <option value="4">纯净水</option>
                    <option value="5">考察与社会</option>
                    <option value="6">五湖四海</option>
                    <option value="7">一技之长</option>
                    <option value="9">竞赛竞技</option>
                    <option value="28">网站维护</option>
                </select>
            </div>
            <br>
            <input type="text" class="title" placeholder="帖子标题" id="raw_title">
            <div id="edi_bar"></div>
            <div id="edi_content" onfocus="editorFocus();" onblur="editorBlur();"></div>
            <br>
            <progress max="100" value="20" id="progress"></progress>
            <div id="edi_attach" onclick="attach();">添加附件</div>
            <input type="file" id="file" style="display:none;" onchange="fileselected();">
            选择签名档：
            <input type="radio" name="sign" value="0">不使用
            <input type="radio" name="sign" value="1" checked>1
            <input type="radio" name="sign" value="2">2
            <input type="radio" name="sign" value="3">3

            <div id="edi_submit" onclick="doreply();">发表帖子</div>
            <br><br><br>
            <span id="attachtip" style="display:none;">本帖包含的附件：</span>
            <div class="attachs" id="attachs">
            
            </div>
            <span id="unusedattachtip" style="display:none;">您曾上传但未使用的附件：（可直接链接到本贴）<img src="/bbs/main/waiting.gif" width="15px" id="waitinggif" style="visibility:hidden;"></span>
            <div class="attachs" id="unusedattachs">
            
            </div>
        </div>
<?php
    }
        else 
            echo '
        <div class="editip" id="editip">
        <span class="editip">您需要&nbsp;<a href="../../login?from='.$nowurl.'">登录</a>&nbsp;后才能发表主题；没有账号？&nbsp;<a href="/bbs/register">现在注册</a>&nbsp;</span>
        </div>
';
?>
<div class="footer">
</div>

<script type="text/javascript" src="../../lib/nic.js"></script>
<script type="text/javascript" src="../../lib/content_shared.js"></script>
<script type="text/javascript">
var myNicEditor = new nicEditor({fullPanel : true});
myNicEditor.setPanel('edi_bar');
myNicEditor.addInstance('edi_content');
var attachs=[];
var unusedattachs=[];
<?php
if ($username!="") {
    $result=mainfunc(array("ask"=>"unusedattachinfo"));
    for($i=1;$i< count($result);$i++){
        echo("unusedattachs.push({
        name:'".$result[$i]['name']."',
        size:'".$result[$i]['size']."',
        id:'".$result[$i]['id']."',
        });\n");
    }
}
?>
refreshAttach();

var questionCounter = 0;
var caseCounter = {};

function addQuestion() {
    var idx = questionCounter++;
    var html = '<div class="question-item" data-index="' + idx + '" style="border:1px solid #ccc; padding:10px; margin-bottom:10px; border-radius:4px;">';
    html += '<div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">';
    html += '  <select class="question-type" data-index="' + idx + '" onchange="onTypeChange(' + idx + ')">';
    html += '    <option value="6">填空题</option>';
    html += '    <option value="1">选择题</option>';
    html += '    <option value="3">多选题</option>';
    html += '  </select>';
    html += '  <input type="text" class="question-name" placeholder="问题名称" style="flex:1; min-width:120px;">';
    html += '  <input type="text" class="question-comment" placeholder="注释(选填)" style="flex:1; min-width:120px;">';
    html += '  <button type="button" onclick="removeQuestion(' + idx + ')" style="color:red;">删除</button>';
    html += '</div>';
    html += '<div style="margin-top:6px;">';
    html += '  <label><input type="checkbox" class="question-required" checked> 必填</label>';
    html += '  <label style="margin-left:15px;"><input type="checkbox" class="question-hiden"> 隐藏</label>';
    html += '</div>';
    html += '<div class="cases-container" id="cases-' + idx + '" style="display:none; margin-top:8px; padding-left:20px;">';
    html += '  <div class="cases-list" id="cases-list-' + idx + '"></div>';
    html += '  <button type="button" onclick="addCase(' + idx + ')">+ 添加选项</button>';
    html += '</div>';
    html += '</div>';
    $('#question-list').append(html);
}

function removeQuestion(index) {
    $('#question-list').find('.question-item[data-index="' + index + '"]').remove();
}

function onTypeChange(index) {
    var typeVal = parseInt($('#question-list').find('.question-item[data-index="' + index + '"] .question-type').val());
    var $casesContainer = $('#cases-' + index);
    if (typeVal === 1 || typeVal === 3) {
        $casesContainer.show();
        if ($casesContainer.find('.case-item').length === 0) {
            addCase(index);
        }
    } else {
        $casesContainer.hide();
    }
}

function addCase(questionIndex) {
    if (!caseCounter[questionIndex]) caseCounter[questionIndex] = 0;
    var idx = caseCounter[questionIndex]++;
    var html = '<div class="case-item" data-case-index="' + idx + '" style="margin-bottom:4px;">';
    html += '  选项名称：<input type="text" class="case-name" placeholder="选项名称">';
    html += '  <button type="button" onclick="removeCase(' + questionIndex + ',' + idx + ')" style="color:red; margin-left:6px;">删除</button>';
    html += '</div>';
    $('#cases-list-' + questionIndex).append(html);
}

function removeCase(questionIndex, caseIndex) {
    $('#cases-list-' + questionIndex).find('.case-item[data-case-index="' + caseIndex + '"]').remove();
}

function validateOptions() {
    var items = $('#question-list .question-item');
    if (items.length === 0) {
        return '请至少添加一个问题';
    }
    var seen = {};
    for (var i = 0; i < items.length; i++) {
        var $item = $(items[i]);
        var type_id = parseInt($item.find('.question-type').val());
        var option_name = $item.find('.question-name').val().trim();
        if (option_name === '') {
            return '问题名称不能为空';
        }
        var key = type_id + '|' + option_name;
        if (seen[key]) {
            return '存在重复问题："' + option_name + '"';
        }
        seen[key] = true;
        if (type_id === 1 || type_id === 3) {
            var validCases = [];
            $item.find('.case-item').each(function() {
                var case_name = $(this).find('.case-name').val().trim();
                if (case_name !== '') validCases.push(case_name);
            });
            if (validCases.length < 2) {
                return '"' + option_name + '"的选项数量不能少于2个';
            }
        }
    }
    return null;
}

function collectOptions() {
    var options = [];
    $('#question-list .question-item').each(function() {
        var $item = $(this);
        var type_id = parseInt($item.find('.question-type').val());
        var option_name = $item.find('.question-name').val().trim();
        if (option_name === '') return;
        var option = {
            type_id: type_id,
            option_name: option_name,
            required: $item.find('.question-required').is(':checked') ? 1 : 0,
            comment: $item.find('.question-comment').val().trim()
        };
        if ($item.find('.question-hiden').is(':checked')) {
            option.hiden = 1;
        }
        if (type_id === 1 || type_id === 3) {
            var cases = [];
            $item.find('.case-item').each(function() {
                var case_name = $(this).find('.case-name').val().trim();
                if (case_name !== '') {
                    cases.push({case_name: case_name, comment: ''});
                }
            });
            if (cases.length > 0) {
                option.cases = cases;
            }
        }
        options.push(option);
    });
    return options;
}
function doreply(){
    if(document.getElementById("raw_title").value.length==0){
        alert("请填写帖子标题！");
        return;
    }
    var content=$('#edi_content').html();
    if(content=="<br>" || content=="<div></div>" || content == editorPlaceholder){
        alert("请填写帖子内容！");
        return;
    }
    var token=getcookie("token");
    if(!token){
        alert("尚未登录！");
        return;
    }
    if (content.length > 100000) {
        alert("内容字符数为"+content.length+"（超过10万字符），请检查是否粘贴了图片。");
        return;
    }
    content=content.replace(/&/g, "&amp;");
    var bts=document.getElementsByName("sign");
    var sig = "1";
    for(var i=0;i<bts.length;i++){
        if(bts[i].checked){
            sig=bts[i].value;
        }
    }
    var s="";
    for(var i=0;i<attachs.length;i++){
        s+=attachs[i]['id']+" ";
    }
    if(s) s=s.slice(0,s.length-1);
    var validateError = validateOptions();
    if (validateError !== null) {
        alert(validateError);
        return;
    }
    var options = collectOptions();
    $.post("/api/bbs/activity/create/",{
        bid:$('#fm_bid').val(),
        token:token,
        title:$('#raw_title').val(),
        text:content,
        sig:sig,
        attachs:s,
        options:JSON.stringify(options)
        },function(data) {
            if (data.code==0) {
                window.location="/bbs/content/?bid="+data.bid+"&tid="+data.tid;
            } else {
                alert("错误："+data.msg);
            }
        }
    );

}

myNicEditor.instanceById('edi_content').setContent(editorPlaceholder);

// 添加默认问题
addQuestion();
$('#question-list .question-item').last().find('.question-name').val('姓名');
addQuestion();
$('#question-list .question-item').last().find('.question-name').val('ID');

</script>
</body>

</html>
