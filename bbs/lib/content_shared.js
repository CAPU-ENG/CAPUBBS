/**
 * Shared JS for bbs/content/index.php and bbs/content/utils/activity.php.
 * Requires these globals to be defined first: bid, tid, page, score, star.
 */

/* ---- page navigation ---- */
function jump(page) {
    window.location = "./?bid=" + bid + "&tid=" + tid + "&p=" + page;
}

function gotobbs(tbid) {
    window.location = "../main?bid=" + tbid;
}

function showmenu() {
    $('#popover').show();
}

function hidemenu() {
    $('#popover').hide();
}

function goback() {
    gotobbs(bid);
}

function seelz() {
    if (window.location.href.indexOf('see_lz') !== -1) {
        window.location = "./?bid=" + bid + "&tid=" + tid;
    } else {
        window.location = "./?bid=" + bid + "&tid=" + tid + "&see_lz=1";
    }
}

/* ---- LZL (楼中楼) ---- */
function togglereply(id) {
    $('#lzl' + id).toggle();
}

function toggleslide(id) {
    $('#writeboard' + id).toggle();
}

function showreply(id) {
    $('#lzl' + id + ',#writeboard' + id).show();
}

function hidereply(id) {
    $('#lzl' + id + ',#writeboard' + id).hide();
}

function insertlzlreply(id, author) {
    var wb = $('#textarea' + id);
    $('#writeboard' + id).show();
    wb.focus();
    wb.val("回复 @" + author + ": ");
}

function dolzlreply(id, fid, sender) {
    var text = $('#textarea' + id).val();
    sender.disabled = true;
    sender.innerHTML = "正在发布...";
    $.post("../postlzl/", {fid: fid, text: text}, function(text) {
        sender.disabled = false;
        sender.innerHTML = "发表";
        var result = JSON.parse(text);
        if (result['code'] == 0) {
            window.location.reload();
        } else {
            alert(result.msg);
        }
    });
}

function deletelzlreply(fid, id) {
    if (!confirm("您确定要删除这一回复？")) return;
    $.post("../deletelzl/", {fid: fid, id: id}, function(text) {
        var result = JSON.parse(text);
        if (result.code == 0) {
            window.location.reload();
        } else {
            alert(result.msg);
        }
    });
}

function deletepid(pid) {
    if (confirm("您确定要删除此楼层么？")) {
        $.post("../delete/", {
            ask: "delpid",
            bid: bid,
            tid: tid,
            pid: pid
        }, function(data) {
            var x = parseInt(data);
            if (x == 0) { window.location = window.location.href; }
            else { alert("错误：" + data); }
        });
    }
}

/* ---- attachments ---- */
function generateattach(filename, size, price, aid, useforappend) {
    var extension = filename.slice(filename.lastIndexOf(".") + 1);
    var supportedExt = "bmp csv gif html jpg jpeg key mov mp3 mp4 numbers pages pdf png rtf tiff txt zip ipa ipsw doc docx ppt pptx xls avi wmv mkv mts".split(" ");
    var imgsrc = "file";
    if (supportedExt.indexOf(extension) != -1) {
        imgsrc = extension;
    }
    imgsrc = "../assets/fileicons/" + imgsrc + ".png";
    var s = '<div class="attach">';
    s += '<img src="' + imgsrc + '" class="fileicon">';
    s += '<div class="fileinfo"><span class="filename">' + filename + '<br></span>';
    s += '<span class="sub">' + packSize(size) + '<br>';
    if (useforappend) {
        s += '<a href="javascript:appendattach(' + aid + ');">引用</a>&nbsp;&nbsp;';
        s += '<a href="javascript:delattach(' + aid + ');">彻底删除</a>';
    } else {
        s += '<a href="javascript:removeattach(' + aid + ');">删除</a>';
    }
    s += '</div></div>';
    return s;
}

function packSize(size) {
    if (size < 1024) return size + "字节";
    if (size < 1024 * 1024) return (size / 1024).toFixed(1) + "KB";
    if (size < 1024 * 1024 * 1024) return (size / 1024 / 1024).toFixed(1) + "MB";
    return (size / 1024 / 1024 / 1024).toFixed(1) + "GB";
}

function refreshAttach() {
    if (attachs.length == 0) {
        $('#attachtip,#attachs').hide();
    } else {
        $('#attachtip,#attachs').show();
    }
    if (unusedattachs.length == 0) {
        $('#unusedattachtip,#unusedattachs').hide();
    } else {
        $('#unusedattachtip,#unusedattachs').show();
    }
    var s = "";
    for (var i = 0; i < attachs.length; i++) {
        var a = attachs[i];
        s += generateattach(a['name'], a['size'], a['price'], a['id'], false);
    }
    document.getElementById("attachs").innerHTML = s;
    var s2 = "";
    for (var i = 0; i < unusedattachs.length; i++) {
        var a = unusedattachs[i];
        s2 += generateattach(a['name'], a['size'], a['price'], a['id'], true);
    }
    $('#unusedattachs').html(s2);
}

function attach() {
    $('#file').click();
}

function fileselected() {
    if ($('#file').val() != "") {
        showoverlay();
    }
}

function appendattach(id) {
    for (var i = 0; i < unusedattachs.length; i++) {
        if (unusedattachs[i]['id'] == id) {
            attachs.push(unusedattachs[i]);
            unusedattachs.splice(i, 1);
            break;
        }
    }
    refreshAttach();
}

function removeattach(id) {
    for (var i = 0; i < attachs.length; i++) {
        if (attachs[i]['id'] == id) {
            unusedattachs.push(attachs[i]);
            attachs.splice(i, 1);
            break;
        }
    }
    refreshAttach();
}

function delattach(id) {
    if (confirm("您确定要彻底删除此附件么？")) {
        $('#waitinggif').show();
        $.post("../delattach/", {id: id}, function(r) {
            var result = JSON.parse(r);
            if (result.code == 0) {
                for (var i = 0; i < unusedattachs.length; i++) {
                    if (unusedattachs[i]['id'] == id) {
                        unusedattachs.splice(i, 1);
                        break;
                    }
                }
                document.getElementById("waitinggif").style.visibility = "hidden";
                refreshAttach();
            } else {
                alert(result.msg);
            }
        });
    }
}

function showoverlay() {
    $('#overlay').show();
}

function attachdl(name, price, auth, id, free) {
    if (score == -1) {
        alert("请先登录或注册后下载附件！");
        return;
    }
    if (free) {
        reallyattachdl(id);
        return;
    }
    if (score < auth) {
        alert("您无权下载此附件，此附件要求积分不少于" + auth + "，而您拥有" + score + "个积分。加油攒积分吧！");
        return;
    }
    if (price != 0) {
        if (!confirm("您确定要以" + price + "积分（您拥有" + score + "个积分）的价格购买 " + name + " 么？购买后您将可以永久免费下载此附件。")) {
            return;
        }
    }
    reallyattachdl(id);
}

function reallyattachdl(id) {
    window.open("../download/?id=" + id, "_blank");
}

function priceok() {
    var price = parseInt(document.getElementById("price").value);
    var auth = parseInt(document.getElementById("auth").value);
    if (price < 0 || price > 200) {
        alert("请填写一个有效的售价（0-200）");
        return;
    }
    if (auth < 0) {
        alert("请填写一个有效的阅读权限（>0）");
        return;
    }
    document.getElementById("overlay").style.visibility = "hidden";
    var fileObj = document.getElementById("file").files[0];
    var FileController = "../attach/";
    var form = new FormData();
    var price = document.getElementById("price").value;
    var auth = document.getElementById("auth").value;
    form.append("auth", auth);
    form.append("price", price);
    form.append("file", fileObj);
    var xhr = new XMLHttpRequest();
    xhr.open("post", FileController, true);
    xhr.onload = function () {
        var prob = document.getElementById("progress");
        if (prob.style.visibility != "hidden") prob.style.visibility = "hidden";
        try {
            var result = JSON.parse(xhr.responseText);
            if (result.code == 0) {
                attachs.push({name: fileObj.name, size: fileObj.size, price: price, id: result.msg});
                refreshAttach();
            } else {
                alert("附件上传失败：" + result.msg + " code:" + result.code);
            }
        } catch (e) {
            alert("出bug了");
        }
    };
    function onprogress(evt) {
        var prob = document.getElementById("progress");
        if (prob.style.visibility != "visible") prob.style.visibility = "visible";
        prob.value = evt.loaded;
        prob.max = evt.total;
        prob.label = (evt.loaded / evt.total * 100).toFixed(1) + "%";
    }
    xhr.upload.addEventListener("progress", onprogress, false);
    xhr.send(form);
}

/* ---- messaging ---- */
var temptarget;

function sendMessageTo(target) {
    $('#msg_overlay').show();
    $('#msg_ta').focus();
    $('#msg_to').html(target);
    temptarget = target;
}

function msg_send() {
    $('#msg_sendbt,#msg_cancelbt').prop("disabled", true);
    $('#msg_sendbt').html("正在发送...");
    $.post("../message/", {target: temptarget, text: $('#msg_ta').val()},
        function (text) {
            var result = JSON.parse(text);
            if (result.code == 0) {
                alert("发送成功！");
                $('#msg_ta').val("");
                $("#msg_overlay").hide();
            } else {
                alert(result.msg);
            }
            $("#msg_sendbt,#msg_cancelbt").prop("disabled", false);
            $('#msg_sendbt').html("发送");
        });
}

function msg_cancel() {
    var text = $('#msg_ta').val();
    if (!text || confirm("您确定放弃编辑消息？")) {
        $('#msg_overlay').hide();
        $('#msg_ta').val("");
    }
}

/* ---- utilities ---- */

function URLdecode(str) {
    var ret = "";
    for (var i = 0; i < str.length; i++) {
        var chr = str.charAt(i);
        if (chr == "+") {
            ret += " ";
        } else if (chr == "%") {
            var asc = str.substring(i + 1, i + 3);
            if (parseInt("0x" + asc) > 0x7f) {
                ret += decodeURI("%" + str.substring(i + 1, i + 9));
                i += 8;
            } else {
                ret += String.fromCharCode(parseInt("0x" + asc));
                i += 2;
            }
        } else {
            ret += chr;
        }
    }
    return ret;
}

function insertHTML(html) {
    var dthis = document.getElementById("edi_content");
    var sel, range;
    if (window.getSelection) {
        dthis.focus();
        sel = window.getSelection();
        if (sel.getRangeAt && sel.rangeCount) {
            range = sel.getRangeAt(0);
            range.deleteContents();
            var el = document.createElement('div');
            el.innerHTML = html;
            var frag = document.createDocumentFragment(), node, lastNode;
            while ((node = el.firstChild)) {
                lastNode = frag.appendChild(node);
            }
            range.insertNode(frag);
            if (lastNode) {
                range = range.cloneRange();
                range.setStartAfter(lastNode);
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range);
            }
        }
    } else if (document.selection && document.selection.type != 'Control') {
        dthis.focus();
        ierange = document.selection.createRange();
        ierange.pasteHTML(html);
        dthis.focus();
    }
}

/* ---- reply ---- */
function doreply() {
    var token = getcookie("token");
    if (!token) {
        alert("尚未登录！请登陆后发帖！");
        return;
    }
    var content = $('#edi_content').html();
    content = content.replace(/&/g, "&amp;");
    if (content == "" || content == "<br>" || content == editorPlaceholder) {
        alert("请填写回复内容！");
        return;
    }
    if (content.length > 100000) {
        alert("内容字符数为" + content.length + "（超过10万字符），请检查是否粘贴了图片。");
        return;
    }
    var bts = document.getElementsByName("sign");
    var sig;
    for (var i = 0; i < bts.length; i++) {
        if (bts[i].checked) {
            sig = bts[i].value;
        }
    }
    var s = "";
    for (var i = 0; i < attachs.length; i++) {
        s += attachs[i]['id'] + " ";
    }
    if (s) s = s.slice(0, s.length - 1);

    $.post("../post/", {
        bid: $('#fm_bid').val(),
        tid: $('#fm_tid').val(),
        token: token,
        title: "Re: " + $('#page_title').text(),
        text: content,
        sig: sig,
        attachs: s
    }, function(data) {
        var x = parseInt(data);
        if (x == 0) { window.location.reload(); }
        else alert("错误：" + data);
    });
}

function quote(who, num) {
    // Try to get the selected text first
    var selectedText = '';
    if (window.getSelection) {
        selectedText = window.getSelection().toString().trim();
    } else if (document.selection && document.selection.type != "Control") {
        selectedText = document.selection.createRange().text.trim();
    }

    var what;
    if (selectedText) {
        what = selectedText;
    } else {
        var data = $("#floor" + num).html();

        $("#floor" + num)
            .find(".quotel")
            .each(function() {
                $(this).remove();
            });
        what = $("#floor" + num).html();
        $("#floor" + num).html(data);

        if (what.length >= 133) what = what.substr(0, 130) + "...";

        var temp = document.createElement("div");
        temp.innerHTML = what;
        var divs = temp.getElementsByTagName("div");
        for (var i = 0; i < divs.length; i++) {
            if (divs[i].className == "quotel") {
                divs[i].parentNode.removeChild(divs[i]);
            }
        }
        what = temp.innerHTML;
    }

    insertHTML("[quote=" + who + "]" + what + "[/quote]");
}

/* ---- editor placeholder ---- */
var editorPlaceholder = '<div style="color: rgb(118, 118, 118);">如需上传图片请使用右上角的"上传图片"功能，不要将图片直接粘贴在文本框中</div>';

function editorFocus() {
    if (myNicEditor.instanceById('edi_content').getContent() == editorPlaceholder) {
        myNicEditor.instanceById('edi_content').setContent('<br>');
    }
}

function editorBlur() {
    var newText = myNicEditor.instanceById('edi_content').getContent();
    if (newText == '' || newText == '<br>') {
        myNicEditor.instanceById('edi_content').setContent(editorPlaceholder);
    }
}
