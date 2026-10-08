<?php
// Static page structure. Contact copy and temporary media are kept in JSON.
return array(
    'name' => '北京大学自行车协会',
    'slogan' => array('深入社会，融于自然', '挑战极限，超越自我'),
    'navigation' => array(
        array('href' => '/#about', 'title' => '关于'),
        array('href' => '/#annual', 'title' => '年刊'),
        array('href' => '/#videos', 'title' => '视频'),
        array('href' => '/#contact', 'title' => '联系'),
    ),
    'tabs' => array(
        array('id' => 'introduction', 'title' => '协会简介', 'file' => 'about.html'),
        array('id' => 'summer', 'title' => '暑期介绍', 'file' => 'summer.html'),
        array('id' => 'activities', 'title' => '日常活动', 'file' => 'activities.html'),
    ),
    // Featured yearbook; the full list stays at /annual/.
    'annual' => array(
        'year' => '2023',
        'title' => '行者',
        'cover' => 'https://chexie-1342390402.cos.ap-beijing.myqcloud.com/annual/2023/assets/cover.webp',
        'url' => '/annual/read.php?year=2023',
    ),
    'qrCodes' => array(
        array('id' => 'wechat', 'label' => '微信公众号', 'image' => 'qrcode-wechat.jpg', 'alt' => 'capu北大车协微信公众号二维码'),
        array('id' => 'android', 'label' => 'Android 客户端', 'image' => 'qrcode-android.png', 'alt' => 'CAPUBBS Android 客户端安装二维码'),
        array('id' => 'ios', 'label' => 'iOS 客户端', 'image' => 'qrcode-ios.png', 'alt' => 'CAPUBBS iOS 客户端安装二维码'),
    ),
    'registration' => '京ICP备14031425号',
);
