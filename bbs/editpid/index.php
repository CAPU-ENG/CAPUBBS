<html>
<head>
<meta charset="utf-8">
<title>CAPUBBS - 编辑帖子</title>
<?php
    include("../lib/mainfunc.php");
    $bid=$_GET['bid'];
    $tid=$_GET['tid'];
    $pid=$_GET['pid'];
    $result=mainfunc(array(
    "ask"=>"editpreview",
    "bid"=>$bid,
    "tid"=>$tid,
    "pid"=>$pid));
    if($result[0]['code']!=0){
        die($result[0]['msg']);
    }
    $user=$result[1];
    $pidinfo=$result[2];
?>
<script type="text/javascript" src="../lib/general.js"></script>
<script src="../lib/jquery.min.js"></script>
<link rel="stylesheet" href="../lib/general.css">
<link rel="shortcut icon" href="/assets/images/capu.jpg">
<style type="text/css">
body{
    background-color: #ABC9B6;
    background-image: url("/assets/images/static/bg.jpg");
    background-position: center top;
    background-repeat: no-repeat;
    margin: 0;
}
div.content{
    box-shadow: 0px 0px 12px rgba(0,0,0,0.41);
    width: 1030px;
    margin-left: auto;
    margin-right: auto;
    background-color: #f4f4f4;
    min-height: 100%;
}
.tabletop{
    height: 60px;
    background-image: url("bgtitle.jpg");
    background-size: 100% 100%;
}
.quotel{
    background-color: #F9F9F9;
    background-image: url("quotel.png");
    background-repeat: no-repeat;
    background-position: left top;
    background-size: 30px 30px;
    padding-left: 50px;
    color: #666666;
    font-size: 14px;
}
.quoter{
    background-image: url("quoter.png");
    background-repeat: no-repeat;
    background-position: right bottom;
    background-size: 30px 30px;
    padding-right: 50px;
}

.title{
    margin-left: 170px;
    line-height: 60px;
    font-size: 21px;
    color: white;
    background-color: transparent;
    outline: none;
    border: none;
    width: 500px;
}
div.editor{
    width: 800px;
    margin-left: auto;
    margin-right: auto;
    height: auto; 
    margin-top: 30px;
    padding-bottom: 100px;
}
div#edi_content{
    width: 782px;
    min-height: 380px;
    max-height: 540px;
    overflow: auto;
    background-color: white;
    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;
    box-shadow: 0px 0px 9px rgba(0,0,0,0.47) inset;
    padding: 10px;
    outline:none;
}
input#ip_title {
    width:100%;
    height: 24px;
    border-radius: 10px;
    outline: none;
    padding-left: 10px;
    margin-bottom: 10px
}
div#edi_bar{
    width: 800px;
}
div#edi_submit{
    background-image: url("bt_reply.png");
    background-size: 100%,100%;
    background-repeat: no-repeat;
    width: 100px;
    height: 40px;
    color: white;
    font-size: 15px;
    text-align: center;
    line-height: 20px;
    padding-top: 5px;
    float: left;
    cursor: pointer;
}
div#edi_attach{
    background-image: -webkit-linear-gradient(#76caff 0%, #1d9eff 100%);
    background-color: #1d9eff;
    background-size: 100%,100%;
    background-repeat: no-repeat;
    width: 100px;
    height: 24px;
    color: white;
    border-radius: 10px;
    font-size: 15px;
    text-align: center;
    line-height: 20px;
    padding-top: 5px;
    float: right;
    cursor: pointer;
    -webkit-transition: background-image 0.2s,background-color 0.2s;
}
div#edi_attach:hover{
    background-image: -webkit-linear-gradient(#98ecff 0%, #3fafff 100%);
    background-color: #3fafff;
}
#progress{
    margin-left: 30px;
    margin-top: 10px;
    width: 200px;
    visibility: hidden;
}
div.attachs{
    margin-top: 20px;
    border-radius: 10px;
    overflow: hidden;
    width:100%;
    border: 3px dashed white;   
}
div.attach{
    overflow: hidden;
    float: left;
    margin: 20px;
    position: relative;
    padding: 10px;
    border-radius: 14px;
    -webkit-transition: background-color 0.2s;
}
div.attach:hover{
    background-color: white;
}
div.attach a{
    text-decoration: none;
    color: #6d90ee; 
}
div.attach a:hover{
    text-decoration: underline;
}
img.fileicon{
    height: 60px;
    float: left;
}
div.fileinfo{
    float: left;
    padding-top: 5px;
    padding-left: 10px;
}
span.filename{
    line-height: 18px;
    font-size: 13px;
}
span.sub{
    color: #777777;
    font-size: 12px;
    line-height: 16px;
}
#overlay{
     visibility: hidden;
     position: fixed;
     left: 0px;
     top: 0px;
     width:100%;
     height:100%;
     text-align:center;
     z-index: 1000; 
     background-color:#333;
     filter: alpha(opacity=80); /*ie支持的半透明，下面两名为ff支持的*/
     -moz-opacity: 0.8;
     opacity:.80;
}
/*外层的显示区*/
#overlay div {
     width:400px;
     margin: 100px auto;
     background-color: #FFFFFF;
     border:1px solid #000;
     padding:20px;
     text-align:center;
     border-radius: 10px;
}
span.tip{
    font-size: 10px;
}

</style>
</head>
<body>
<div class="content">
    <div class="tabletop">
        <div class="title"><?php echo($pidinfo['title']);?></div>
    </div>
    <div class="editor" id="editor">
        <!-- 编辑帖子：<br><br> -->
        <?php
        if (intval($pidinfo['pid'])==1) echo '
        <input type="text" id="ip_title" value="'.$pidinfo['title'].'" placeholder="请输入标题"> ';
        else echo ' 
        <input type="hidden" id="ip_title" value="'.$pidinfo['title'].'" placeholder="请输入标题"> ';

        ?>
        <div id="edi_bar"></div>
        <div id="edi_content" onfocus="starttimer();" onblur="stoptimer();"><?php
            if($pidinfo['text']!="<br>") print $pidinfo['text'];
?></div><br>
        <progress max="100" value="20" id="progress"></progress>
        <div id="edi_attach" onclick="attach();">添加附件</div>
        <input type="file" id="file" style="display:none;" onchange="fileselected();">

        选择签名档：
        <?php
            for ($i=0;$i<=3;$i++) {
                echo '<input type="radio" name="sign" value="'.$i.'" ';
                if ($i==intval($pidinfo['sig'])) echo 'checked';
                echo '>';
                if ($i!=0) echo $i;
                else echo "不使用";
                echo '</input>';
            }

        ?>
        <div id="edi_submit" onclick="doreply();">保存更改</div>
        <br><br><br>
        <span id="attachtip" style="display:none;">本帖包含的附件：</span>
        <div class="attachs" id="attachs">
            
        </div>
        <span id="unusedattachtip" style="display:none;">您曾上传但未使用的附件：（可直接链接到本贴）<img src='waiting.gif' width="15px" id="waitinggif" style="visibility:hidden;"></span>
        <div class="attachs" id="unusedattachs">
            
        </div>
    </div>
</div>


    <form method="post" id="fm" action="action.php">
    <input type="hidden" name="bid" id="fm_bid" value="<?php echo($bid); ?>">
    <input type="hidden" name="tid" id="fm_tid" value="<?php echo($tid); ?>">
    <input type="hidden" name="pid" id="fm_pid" value="<?php echo($pid); ?>">
    <input type="hidden" name="icon" value="1" id="fm_icon">
    <input type="hidden" name="token" id="fm_token">
    <input type="hidden" name="title" id="fm_title">
    <input type="hidden" name="text" id="fm_text">
    <input type="hidden" name="sig" id="fm_sig">
    <input type="hidden" name="attachs" id="fm_attachs">
    </form>

<script type="text/javascript">
    // var star=<?php echo $user['star'];?>;
    // if(star<0){
    //  document.getElementById("edi_attach").style.visibility="hidden";
    // }
</script>
<script type="text/javascript" src="../lib/nic.js"></script>
<script type="text/javascript">
var myNicEditor = new nicEditor({fullPanel : true});
myNicEditor.setPanel('edi_bar');
myNicEditor.addInstance('edi_content');
var attachs=[];
var unusedattachs=[];
<?php
$result=mainfunc(array("ask"=>"unusedattachinfo"));
for($i=1;$i< count($result);$i++){
    echo("unusedattachs.push({
    name:'".$result[$i]['name']."',
    size:'".$result[$i]['size']."',
    id:'".$result[$i]['id']."',
    });\n");
}
if($pidinfo['attachs']){
    $attachs=explode(" ",  $pidinfo['attachs']);
}else{
    $attachs=array();
}
foreach($attachs as $aid){
    $result=mainfunc(array("ask"=>"attachinfo","id"=>$aid));
    $result=$result[0];
    echo("attachs.push({
    name:'".$result['name']."',
    size:'".$result['size']."',
    id:'".$result['id']."',
    });\n");
}
?>
refreshAttach();
function refreshAttach(){
    if(attachs.length==0){
        //document.getElementById("attachtip").style.display="none";
        //document.getElementById("attachs").style.display="none";
        $('#attachtip,#attachs').hide();
    }else{
        //document.getElementById("attachtip").style.display="block";
        //document.getElementById("attachs").style.display="block";
        $('#attachtip,#attachs').show();
    }
    if(unusedattachs.length==0){
        //document.getElementById("unusedattachtip").style.display="none";
        //document.getElementById("unusedattachs").style.display="none";
        $('#unusedattachtip,#unusedattachs').hide();
    }else{
        //document.getElementById("unusedattachtip").style.display="block";
        //document.getElementById("unusedattachs").style.display="block";
        $('#unusedattachtip,#unusedattachs').show();
    }
    var s="";
    for(var i=0;i<attachs.length;i++){
        var a=attachs[i];
        s+=generateattach(a['name'],a['size'],a['id'],false);
    }
    //document.getElementById("attachs").innerHTML=s;
    $('#attachs').html(s);
    var s2="";
    for(var i=0;i<unusedattachs.length;i++){
        var a=unusedattachs[i];
        s2+=generateattach(a['name'],a['size'],a['id'],true);
    }
    //document.getElementById("unusedattachs").innerHTML=s2;
    $('#unusedattachs').html(s2);
}
function attach(){
    document.getElementById("file").click();
    //$('#file').click();
}
function fileselected(){
//  if(document.getElementById("file").value){
    if ($('#file').val()) {
        uploadFile();
    }
}
function appendattach(id){
    for(var i=0;i<unusedattachs.length;i++){
        if(unusedattachs[i]['id']==id){
            attachs.push(unusedattachs[i]);
            unusedattachs.splice(i,1);
            break;
        }
    }
    refreshAttach();
}
function removeattach(id){
    for(var i=0;i<attachs.length;i++){
        if(attachs[i]['id']==id){
            unusedattachs.push(attachs[i]);
            attachs.splice(i,1);
            break;
        }
    }
    refreshAttach();    
}
function generateattach(filename,size,aid,useforappend){
    var extension=filename.slice(filename.lastIndexOf(".")+1);
    var supportedExt="bmp csv gif html jpg jpeg key mov mp3 mp4 numbers pages pdf png rtf tiff txt zip ipa ipsw doc docx ppt pptx xls avi wmv mkv mts".split(" ");
    var imgsrc="file";
    if(supportedExt.indexOf(extension)!=-1){
        imgsrc=extension;
    }
    imgsrc="../assets/fileicons/"+imgsrc+".png";
    var s='<div class="attach">';
    s+='<img src="'+imgsrc+'" class="fileicon">';
    s+='<div class="fileinfo"><span class="filename">'+filename+'<br></span>';
    s+='<span class="sub">'+packSize(size)+'<br>';
    //s+='售价：'+price+"积分</span>";
    if(useforappend){
        s+='<a href="javascript:appendattach('+aid+');">引用</a>&nbsp;&nbsp;';
        s+='<a href="javascript:delattach('+aid+');">彻底删除</a>';
    }else{
        s+='<a href="javascript:removeattach('+aid+');">删除</a>';
    }
    s+='</div></div>';
    return s;
}
function delattach(id){
    if(confirm("您确定要彻底删除此附件么？")){
        //document.getElementById("waitinggif").style.visibility="visible";
        $('#waitinggif').show();
        //var r=new XMLHttpRequest();
        //r.open("GET", "../delattach/?id="+id , true);
        //r.send();
        //r.onreadystatechange=function(){
        //  if(r.readyState==4&&r.status==200){
        $.post("../delattach/",{id:id},function(r) {    
            //var result=JSON.parse(r.responseText);
            var result=JSON.parse(r);
            if(result.code==0){
                for(var i=0;i<unusedattachs.length;i++){
                    if(unusedattachs[i]['id']==id){
                        unusedattachs.splice(i,1);
                        break;
                    }
                }
                document.getElementById("waitinggif").style.visibility="hidden";
                refreshAttach();
            }else{
                alert(result.msg);
            }
        }); 
    }
}
function packSize(size){
    if(size<1024) return size+"字节";
    if(size<1024*1024) return (size/1024).toFixed(1)+"KB";
    if(size<1024*1024*1024) return (size/1024/1024).toFixed(1)+"MB";
    return (size/1024/1024/1024).toFixed(1)+"GB";
}
function uploadFile(){
        var fileObj=document.getElementById("file").files[0];
        var FileController = "../attach/";
        var form = new FormData();
        form.append("file", fileObj);
        var xhr = new XMLHttpRequest();
        xhr.open("post", FileController, true);
        xhr.onload = function () {
            var prob=document.getElementById("progress");
            if(prob.style.visibility!="hidden") prob.style.visibility="hidden";
            try{
                var result=JSON.parse(xhr.responseText);
                if(result.code==0){
                    attachs.push({name:fileObj.name,size:fileObj.size,id:result.msg});
                    refreshAttach();
                }else{
                    alert("附件上传失败："+result.msg+" code:"+result.code);
                }
            }catch(e){
                alert("出bug了");
            }
        };
        function onprogress(evt){
            var prob=document.getElementById("progress");
            if(prob.style.visibility!="visible") prob.style.visibility="visible";
            prob.value=evt.loaded;
            prob.max=evt.total;
            prob.label=(evt.loaded/evt.total*100).toFixed(1)+"%";
        }
        xhr.upload.addEventListener("progress", onprogress, false);
        xhr.send(form);
    }
function doreply(){
    var token=getcookie("token");
    if(!token){
        alert("尚未登录！");
        return;
    }
    var content=document.getElementById("edi_content").innerHTML;
    content=content.replace(/&/g, "&amp;");

    if (content.length > 100000) {
        alert("内容字符数为"+content.length+"（超过10万字符），请检查是否粘贴了图片。");
        return;
    }
    var bts=document.getElementsByName("sign");
    var sig;
    for(var i=0;i<bts.length;i++){
        if(bts[i].checked){
            sig=bts[i].value;
        }
    }
    document.getElementById("fm_sig").value=sig;

    var s="";
    for(var i=0;i<attachs.length;i++){
        s+=attachs[i]['id']+" ";
    }
    if(s) s=s.slice(0,s.length-1);
    //document.getElementById("fm").submit();
    var bbid=$('#fm_bid').val();
    var ttid=$('#fm_tid').val();
    var ppid=parseInt($('#fm_pid').val());
    var p=parseInt((ppid-1)/12)+1;
    $.post("action.php",{
        title:$('#ip_title').val(),
        text:content,
        token:token,
        icon:1,
        bid:bbid,
        tid:ttid,
        pid:ppid,
        sig:sig,
        attachs:s
        },function(x) {
            var data=parseInt(x.substr(0,1));
            if (data==0) {
                window.location=x.substr(1);
            }
            else alert(x.substr(1));
    });

}
function starttimer(){
    
}
function stoptimer(){
    
}

</script>
</body>
</html>
