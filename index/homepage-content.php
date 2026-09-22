<?php
// Static page structure. Contact copy and temporary media are kept in JSON.
return array(
    'name' => '北京大学自行车协会',
    'tabs' => array(
        array('id' => 'introduction', 'title' => '协会简介', 'file' => 'about.html'),
        array('id' => 'summer', 'title' => '暑期介绍', 'file' => 'summer.html'),
        array('id' => 'activities', 'title' => '日常活动', 'file' => 'activities.html'),
    ),
    'qrCodes' => array(
        array('id' => 'wechat', 'label' => '微信公众号', 'image' => 'qrcode-wechat.jpg', 'alt' => 'capu北大车协微信公众号二维码'),
        array('id' => 'android', 'label' => 'Android 客户端', 'image' => 'qrcode-android.png', 'alt' => 'CAPUBBS Android 客户端安装二维码'),
        array('id' => 'ios', 'label' => 'iOS 客户端', 'image' => 'qrcode-ios.png', 'alt' => 'CAPUBBS iOS 客户端安装二维码'),
    ),
    'registration' => '京ICP备14031425号',
);
