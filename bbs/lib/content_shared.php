<?php
/**
 * Shared helpers for bbs/content/index.php and bbs/content/utils/activity.php.
 * Compatible with PHP 5.6 and PHP 8.
 */

function generateattach_html($name, $size, $id, $count) {
    $extension = substr($name, strrpos($name, ".") + 1);
    $supportedExt = explode(" ", "bmp csv gif html jpg jpeg key mov mp3 mp4 numbers pages pdf png rtf tiff txt zip ipa ipsw doc docx ppt pptx xls avi wmv mkv mts");
    $imgsrc = "file";
    if (in_array($extension, $supportedExt)) {
        $imgsrc = $extension;
    }
    $imgsrc = "../assets/fileicons/" . $imgsrc . ".png";
    $s  = '<div class="attachdark" onclick="attachdl(' . $id . ')">';
    $s .= '<img src="' . $imgsrc . '" class="fileicon">';
    $s .= '<div class="fileinfo"><span class="filename">' . $name . '<br></span>';
    $s .= '<span class="sub">' . format_size($size) . '<br>';
    $s .= '免费';
    if ($count == 0) {
        $s .= "（暂时无人下载）";
    } else {
        $s .= "（下载次数：" . $count . "）";
    }
    $s .= "</span>";
    $s .= '</div></div>';
    return $s;
}

function format_size($size) {
    if ($size < 1024) return $size . "字节";
    if ($size < 1024 * 1024) return round($size / 1024, 1) . "KB";
    if ($size < 1024 * 1024 * 1024) return round($size / 1024 / 1024, 1) . "MB";
    return round($size / 1024 / 1024 / 1024, 1) . "GB";
}

function packjump($p, $text, $bid, $tid, $see_lz) {
    $lz = "";
    if ($see_lz != "") {
        $lz = "&see_lz=1";
    }
    if ($text == "plain") return "<span class='page'>$p</span>";
    return "<a class='page' href='../content/?p=$p&bid=$bid&tid=$tid$lz'>$text</a>";
}

function echo_page_control($page, $pages, $bid, $tid, $see_lz) {
    if ($page > 1) {
        echo packjump(1, "首页", $bid, $tid, $see_lz);
        echo packjump($page - 1, "上一页", $bid, $tid, $see_lz);
    }
    $start = $page - 4;
    if ($start < 1) $start = 1;
    $end = $start + 9;
    if ($end > $pages) $end = $pages;
    for ($i = $start; $i <= $end; $i++) {
        echo packjump($i, $i == $page ? "plain" : $i, $bid, $tid, $see_lz);
    }
    if ($page < $pages) {
        echo packjump($page + 1, "下一页", $bid, $tid, $see_lz);
        echo packjump($pages, "尾页", $bid, $tid, $see_lz);
    }

    echo "&nbsp;跳转到：<select onchange='jump(this.value);'>";
    $a = array();
    $counter = 0;
    for ($i = $page; $i > 0; ) {
        $counter++;
        array_unshift($a, $i);
        if ($counter < 50) $i--;
        else if ($counter < 100) $i -= 10;
        else if ($counter < 150) $i -= 100;
        else if ($counter < 200) $i -= 1000;
        else break;
    }
    if ($a[0] != 1) array_unshift($a, 1);
    $counter = 0;
    for ($i = $page + 1; $i <= $pages; ) {
        $counter++;
        array_push($a, $i);
        if ($counter < 50) $i++;
        else if ($counter < 100) $i += 10;
        else if ($counter < 150) $i += 100;
        else if ($counter < 200) $i += 1000;
        else break;
    }
    if ($a[count($a) - 1] != $pages) array_push($a, $pages);
    for ($i = 0; $i < count($a); $i++) {
        if ($a[$i] == $page) {
            echo "<option value='" . $a[$i] . "' selected='true'>" . $a[$i] . "</option>\n";
        } else {
            echo "<option value='" . $a[$i] . "'>" . $a[$i] . "</option>\n";
        }
    }
    echo "</select>";
}
