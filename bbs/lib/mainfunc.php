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
    // 新论坛保存的仅链接引用：[quote]…[/quote]<!--capubbs:quote {"customHref":…}-->
    $html=preg_replace_callback("#\\[quote]([\\s\\S]+?)\\[/quote]\\s*<!--capubbs:quote (\\{[\\s\\S]*?\\})-->#", function($m){
        $link=quote_metadata_link($m[2]);
        if($link==='') return $m[0];
        return "<div class='quotel'><div class='quoter'>引用自链接 <a href='".htmlspecialchars($link, ENT_QUOTES)."' class='link' target='_blank'>&gt;&gt;</a> ：<br>".$m[1]."<br></div><br></div>";
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

function quote_metadata_link($json){
    $metadata=json_decode($json, true);
    if(!is_array($metadata)) return '';
    foreach(array('customHref', 'href') as $key){
        if(!isset($metadata[$key]) || !is_string($metadata[$key])) continue;
        $link=trim($metadata[$key]);
        if(preg_match('#^(https?://|/(?!/))#i', $link)) return $link;
    }
    return '';
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
    $html = translate_cdn_urls($html);
    return $html;
}

// 正文专用：HTML 楼层里直接换行的文本（如 bid=1 tid=8280）需要把换行转成 <br>。
function translate_post($raw, $ishtml){
    if ($ishtml) $raw = html_text_newlines_to_br($raw);
    return translate($raw, $ishtml);
}

/**
 * 仅转换文本节点中的换行：标签内部、注释、script/style/pre/textarea 保持原样；
 * 块级标签之间的纯空白不转换；<br> 紧邻的一个换行视为同一次换行；
 * 含 doctype/html/head/body 的完整文档按手写源码处理，不转换。
 */
function html_text_newlines_to_br($html){
    if (strpos($html, "\n") === false && strpos($html, "\r") === false) return $html;
    if (preg_match('#<\s*(?:!doctype|html|head|body)\b#i', $html)) return $html;
    $html = str_replace(array("\r\n", "\r"), "\n", $html);
    $tokens = preg_split('#(<!--[\s\S]*?-->|<script\b[\s\S]*?</script\s*>|<style\b[\s\S]*?</style\s*>|<pre\b[\s\S]*?</pre\s*>|<textarea\b[\s\S]*?</textarea\s*>|</?[a-zA-Z][^>]*>)#i', $html, -1, PREG_SPLIT_DELIM_CAPTURE);
    for ($i = 0, $n = count($tokens); $i < $n; $i += 2) {
        $text = $tokens[$i];
        if (strpos($text, "\n") === false) continue;
        $prev = $i > 0 ? html_newline_tag_kind($tokens[$i - 1]) : 'edge';
        $next = $i + 1 < $n ? html_newline_tag_kind($tokens[$i + 1]) : 'edge';
        if (trim($text) === '') {
            if (in_array($prev, array('edge', 'close', 'raw'), true) || in_array($next, array('edge', 'open', 'raw'), true)) continue;
        } else {
            if (in_array($prev, array('open', 'close', 'raw'), true)) $text = preg_replace('#^[ \t]*\n#', '', $text);
            if (in_array($next, array('open', 'close', 'raw'), true)) $text = preg_replace('#\n[ \t]*\z#', '', $text);
        }
        if ($prev === 'br') $text = preg_replace('#^[ \t]*\n#', '', $text);
        if ($next === 'br') $text = preg_replace('#\n[ \t]*\z#', '', $text);
        $tokens[$i] = str_replace("\n", '<br>', $text);
    }
    return implode('', $tokens);
}

function html_newline_tag_kind($token){
    if (strncmp($token, '<!--', 4) === 0) return 'other';
    if (!preg_match('#^<(/?)([a-zA-Z][a-zA-Z0-9]*)#', $token, $m)) return 'other';
    $name = strtolower($m[2]);
    if ($name === 'br') return 'br';
    if (in_array($name, array('script', 'style', 'pre', 'textarea'), true)) return 'raw';
    static $blocks = array('address'=>1,'article'=>1,'aside'=>1,'blockquote'=>1,'caption'=>1,'center'=>1,'col'=>1,'colgroup'=>1,'dd'=>1,'details'=>1,'div'=>1,'dl'=>1,'dt'=>1,'fieldset'=>1,'figcaption'=>1,'figure'=>1,'footer'=>1,'form'=>1,'h1'=>1,'h2'=>1,'h3'=>1,'h4'=>1,'h5'=>1,'h6'=>1,'header'=>1,'hr'=>1,'li'=>1,'main'=>1,'nav'=>1,'ol'=>1,'p'=>1,'section'=>1,'summary'=>1,'table'=>1,'tbody'=>1,'td'=>1,'tfoot'=>1,'th'=>1,'thead'=>1,'tr'=>1,'ul'=>1);
    if (!isset($blocks[$name])) return 'other';
    return $m[1] === '/' ? 'close' : 'open';
}

/**
 * 将帖子 HTML 中内部图片路径重写为 CDN 地址。
 * - 已配置 CAPUBBS_CDN_URL 时生效，否则原样返回。
 * - 外部 URL (http/https) 不处理。
 * - 旧帖中的相对路径 (../images/ 和 images/) 同时规范化为根相对路径。
 */
function translate_cdn_urls($html) {
    if (!defined('CAPUBBS_CDN_URL') || CAPUBBS_CDN_URL === '') {
        return $html;
    }
    $cdn = rtrim(CAPUBBS_CDN_URL, '/');

    return preg_replace_callback(
        '#<img\s+([^>]*?)src=(["\'])(.*?)\2([^>]*)>#is',
        function($m) use ($cdn) {
            $src = $m[3];

            // 外部链接跳过
            if (preg_match('#^https?://#i', $src)) {
                return $m[0];
            }

            // 将已知的内部路径转为 CDN 绝对路径
            if (strpos($src, '/bbs/images/') === 0 || strpos($src, '/bbsimg/') === 0) {
                // 根相对路径 → CDN
                $src = $cdn . $src;
            } elseif (preg_match('#^(?:\.\./)+images/([^/\s]+)$#', $src, $mm)) {
                // ../images/xxx → CDN/bbs/images/xxx （同时修正旧帖相对路径）
                $src = $cdn . '/bbs/images/' . $mm[1];
            } elseif (preg_match('#^images/([^/\s]+)$#', $src, $mm)) {
                // images/xxx → CDN/bbs/images/xxx
                $src = $cdn . '/bbs/images/' . $mm[1];
            }

            return '<img ' . $m[1] . 'src="' . $src . '"' . $m[4] . '>';
        },
        $html
    );
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
