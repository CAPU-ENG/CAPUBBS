<?php
require_once __DIR__.'/../../config.php';
require_once __DIR__.'/../../lib.php';

function mainfunc($posts,$debug=false){
    // New direct-function-call path
    if (!$debug) {
        $route_key = _jiekoufunc_resolve_route_key($posts);
        $routing = _jiekoufunc_get_api_routing();
        $mode = isset($routing[$route_key]) ? $routing[$route_key] : 'new';
        if ($mode === 'new') {
            $con = dbconnect_mysqli();
            require_once __DIR__.'/../../api/dispatch.php';
            $posts['ip'] = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '';
            $posts['token'] = isset($_COOKIE['token']) ? $_COOKIE['token'] : '';
            return jiekoufunc_dispatch($con, $posts);
        }
    }
    // Old HTTP cURL path (unchanged)
    $ip=$_SERVER["REMOTE_ADDR"];
    @$token=$_COOKIE['token'];
    $url='https://'.CAPUBBS_HOST.'/api/jiekouapi.php'."?ip=$ip&token=$token";
    if($debug) $url=$url."&debug=yes";
    $rawstr= http($url,"POST",$posts);
    if($debug) return $rawstr;
    @$xml=simplexml_load_string($rawstr, null, LIBXML_NOCDATA);
    return json_decode(json_encode($xml->xpath("info")),true);
}
function getuser() {
    $res=mainfunc(array("ask"=>"getuser"));
    $res=$res[0];
    $username="";
    $username=$res['username'];
    if ($username==null) $username="";
    if ($username=="" && @$_COOKIE['token']) {
        date_default_timezone_set("Asia/Shanghai");
        $time=time()-999999;
        $date=date("D, d M Y H:i:s",$time)." GMT";
        header('Set-cookie: token=invalid; expires='.$date.'; path=/'."\n",false);
    }
    return array("username"=>$username,"rights"=>$res['rights']);
}
function userhref($username){
    if($username)
    return "<a class='author' href='../user?name=".rawurlencode($username)."' target='_blank'>$username</a>";
}
function userhrefbig($username){
    if($username)
    return "<a class='authorbig' href='../user?name=".rawurlencode($username)."' target='_blank'>$username</a>";
}
function athref($username){
    if($username)
    return "<a class='author' href='../user?name=".rawurlencode($username)."' target='_blank'>@$username</a>";
    return "";
}
function href($link,$name){
    return "<a href='$link' class='link' target='_blank'>$name</a>";
}
function formatstamp($stamp){
    $target=intval($stamp);
    $now=time();
    $s=$now-$target;
    #if($s<60) return "不到1分钟前";
    #if($s<3600) return intval($s/60)."分钟前";
    #if($s<3600*24) return intval($s/3600)."小时前";
    #if($s<3600*24*7) return intval($s/3600/24)."天前";
    date_default_timezone_set('Asia/Shanghai');
    return date("Y-m-d H:i:s",$stamp);
}
function formattime($time){
    date_default_timezone_set('Asia/Shanghai');
    return formatstamp(strtotime($time));
}
function http($url, $method, $postfields) {
    $ci = curl_init();
    curl_setopt($ci, CURLOPT_URL, $url);
    curl_setopt($ci, CURLOPT_CONNECTTIMEOUT, 30); // 连接超时
    curl_setopt($ci, CURLOPT_TIMEOUT, 30); // 执行超时
    curl_setopt($ci, CURLOPT_RETURNTRANSFER, true); // 文件流的形式返回，而不是直接输出
    curl_setopt($ci, CURLOPT_ENCODING, "gzip");
    curl_setopt($ci, CURLOPT_HEADER, FALSE);
    curl_setopt($ci, CURLOPT_POST, true); // post
    curl_setopt($ci, CURLOPT_POSTFIELDS, $postfields); // post数据 可为数组、连接字串
    curl_setopt($ci, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ci, CURLOPT_SSL_VERIFYHOST, false);
    $response = curl_exec($ci);
    curl_close($ci);
    return $response;
}
function translateicon($icon){
    //if(strstr($icon,".")!="") return $icon;
    //return "/bbsimg/i/$icon.gif";
    if (is_numeric($icon) || is_numeric(substr($icon,1))) return "/bbsimg/i/$icon.gif";
    return $icon;
}
function heal($i){
    $str=strval($i);
    if(strlen($str)==1){
        return '0'.$str;
    }
    return $str;
}
function transfloornum($floornum){
    switch($floornum){
        case 1: return "楼主";
        default: return $floornum."楼";
    }
}
function translateforquote($raw,$ishtml){
    #$html=htmlspecialchars_decode($raw);
    $html=$raw;
    if(!$ishtml) $html=htmlspecialchars_decode($html);
    $html=str_replace(chr(10)."<br>", "<br>",$html);
    $html=str_replace(chr(10), "<br>",$html);
    $html=str_replace(chr(13), "<br>",$html);
    if(!$ishtml) $html=str_replace(" ", "&nbsp;",$html);
    $html=preg_replace("#(\\[img])(.+?)(\\[/img])#", "<img src='$2'>", $html);
    $quoteend="";
    $html=preg_replace("#(\\[quote=)(.+?)(])([\\s\\S]+?)(\\[/quote])#", $quoteend,$html);
    $html=preg_replace("#(\\[size=)(.+?)(])([\\s\\S]+?)(\\[/size])#", "<font size='$2'>$4</font>", $html);
    $html=preg_replace("#(\\[font=)(.+?)(])([\\s\\S]+?)(\\[/font])#", "<font face='$2'>$4</font>", $html);
    $html=preg_replace("#(\\[color=)(.+?)(])([\\s\\S]+?)(\\[/color])#", "<font color='$2'>$4</font>", $html);
    #$html=preg_replace("#(\\[color=)(.+?)(])([\\s\\S]+?)#", "<font color='$2'>$4</font>", $html);
    $html=preg_replace("#(\\[at])(.+?)(\\[/at])#", athref("$2"), $html);
    $html=preg_replace("#(\\[url])(.+?)(\\[/url])#", href("$2","$2"), $html);
    $html=preg_replace("#(\\[url=)(.+?)(])([\\s\\S]+?)(\\[/url])#", href("$2","$4"), $html);
    $html=preg_replace("#(\\[b])(.+?)(\\[/b])#", "<b>$2</b>", $html);
    $html=preg_replace("#(\\[i])(.+?)(\\[/i])#", "<i>$2</i>", $html);
    return $html;
}
function translate_bbcode($html) {
    $html=preg_replace("#(\\[img])(.+?)(\\[/img])#", "<img src='$2'>", $html);
    $html=preg_replace_callback("#(\\[quote=)(.+?)(])([\\s\\S]+?)(\\[/quote])#", function($m){
        return "<div class='quotel'><div class='quoter'>引用自 ".userhref($m[2])." ：<br>".$m[4]."<br></div><br></div>";
    }, $html);
    $html=preg_replace("#(\\[size=)(.+?)(])([\\s\\S]+?)(\\[/size])#", "<font size='$2'>$4</font>", $html);
    $html=preg_replace("#(\\[font=)(.+?)(])([\\s\\S]+?)(\\[/font])#", "<font face='$2'>$4</font>", $html);
    $html=preg_replace("#(\\[color=)(.+?)(])([\\s\\S]+?)(\\[/color])#", "<font color='$2'>$4</font>", $html);
    $html=preg_replace("#(\\[color=)(.+?)(])([\\s\\S]+?)#", "<font color='$2'>$4</font>", $html);
    $html=preg_replace_callback("#(\\[at])(.+?)(\\[/at])#", function($m){
        return athref($m[2]);
    }, $html);
    $html=preg_replace("#(\\[url])(.+?)(\\[/url])#", href("$2","$2"), $html);
    $html=preg_replace("#(\\[url=)(.+?)(])([\\s\\S]+?)(\\[/url])#", href("$2","$4"), $html);
    $html=preg_replace("#(\\[b])(.+?)(\\[/b])#", "<b>$2</b>", $html);
    $html=preg_replace("#(\\[i])(.+?)(\\[/i])#", "<i>$2</i>", $html);
    return $html;
}

function translate($raw, $ishtml=true, $israw=false, $issign=false){
    $html=$raw;
    if (!$ishtml) {
        if (!$issign) { // 旧的正文
            $html=htmlspecialchars_decode($html);
        }
        if ($issign && $israw) { // 新的签名raw
            $html=htmlspecialchars($html);
        }
        $html=str_replace("\r\n", "\n",$html);
        $html=str_replace("\r", "\n",$html);
        $html=str_replace("\n", "<br>",$html);
        $html=str_replace(" ", "&nbsp;",$html);
    }
    $html = translate_bbcode($html);
    return $html;
}

/**
 * 将签名中的 [post=fid] 或 [post bid=X tid=Y pid=Z] 替换为对应帖子的渲染后内容。
 * 只在签名档调用，不在正文中处理。
 * 属性不依赖顺序，非法格式或帖子不存在时保持原文。
 */
function translate_post_tag($html, $con) {
    if (!$con) return $html;

    // [post=fid] — 无空格，不受 &nbsp; 转换影响
    $html = preg_replace_callback(
        "#\[post=(\d+)\]#",
        function($m) use ($con) {
            $fid = intval($m[1]);
            $stmt = "SELECT text, ishtml FROM posts WHERE fid=$fid LIMIT 1";
            $res = mysqli_query($con, $stmt);
            if (!$res || mysqli_num_rows($res) === 0) {
                return $m[0]; // 帖子不存在，保留原文
            }
            $row = mysqli_fetch_array($res, MYSQLI_ASSOC);
            return translate($row['text'], $row['ishtml'] === 'YES', false, false);
        },
        $html
    );

    // [post bid=X tid=Y pid=Z] — 属性顺序无关，非法则不转换
    $html = preg_replace_callback(
        "#\[post(?:\s|&nbsp;)+(.*?)\]#",
        function($m) use ($con) {
            // 仅在解析属性时临时还原 &nbsp;，失败时返回 $m[0] 保留原文字段
            $raw = str_replace('&nbsp;', ' ', $m[1]);
            preg_match_all('#\b(bid|tid|pid)=(\d+)\b#', $raw, $attrs, PREG_SET_ORDER);
            if (count($attrs) !== 3) {
                return $m[0]; // 属性数量不对，保留含 &nbsp; 的原文
            }
            $params = [];
            foreach ($attrs as $a) {
                if (isset($params[$a[1]])) {
                    return $m[0]; // 重复属性，保留原文
                }
                $params[$a[1]] = intval($a[2]);
            }
            if (!isset($params['bid']) || !isset($params['tid']) || !isset($params['pid'])) {
                return $m[0];
            }
            $bid = $params['bid'];
            $tid = $params['tid'];
            $pid = $params['pid'];

            $stmt = "SELECT text, ishtml FROM posts WHERE bid=$bid AND tid=$tid AND pid=$pid LIMIT 1";
            $res = mysqli_query($con, $stmt);
            if (!$res || mysqli_num_rows($res) === 0) {
                return $m[0]; // 帖子不存在，保留原文
            }
            $row = mysqli_fetch_array($res, MYSQLI_ASSOC);
            return translate($row['text'], $row['ishtml'] === 'YES', false, false);
        },
        $html
    );

    return $html;
}
?>
