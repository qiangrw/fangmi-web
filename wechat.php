<?php

// header('Content-type:text/html; charset=UTF-8');
// header('Content-type:text/json; charset=UTF-8');

function httpGet($url) {
    $curl = curl_init();
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($curl, CURLOPT_TIMEOUT, 500);
    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, false);
    curl_setopt($curl, CURLOPT_URL, $url);

    $res = curl_exec($curl);
    curl_close($curl);

    return $res;
}

function getAccessTokenAndOpenId($appid, $secret, $code){
    $url = 'https://api.weixin.qq.com/sns/oauth2/access_token?appid='.$appid.'&secret='.$secret.'&code='.$code.'&grant_type=authorization_code';  
    $res = json_decode(httpGet($url));
    if ($res == null || !property_exists($res, "access_token")) {
        return null;
    }
    $access_token = $res->access_token;
    $openid = $res->openid;

    return array(
        "openid" => $openid,
        "access_token" => $access_token
    );
}

function getUserInfo($access_token, $openid){
    $url = 'https://api.weixin.qq.com/sns/userinfo?access_token='.$access_token.'&openid='.$openid.'&lang=zh_CN'; 
    $res = json_decode(httpGet($url));
    $openid = $res->openid;
    $nickname = $res->nickname;
    $headimgurl = $res->headimgurl;

    $uid = $openid;
    $uname = rawurlencode($nickname);
    $photo   = explode("/", $headimgurl)[4];

    return array(
        "uid" => $uid,
        "uname" => $uname,
        "photo" => $photo
    );
}

function saveUserInfo($domainName, $type, $uid, $uname, $photo){
    $url = $domainName."/html5/CI/index.php/user/add/".$type."/".$uid."/".$uname."/".$photo;
    httpGet($url);
}

function saveFriendInfo($domainName, $type, $uid1, $uid2){
    $url = $domainName."/html5/CI/index.php/friend/add/".$type."/".$uid1."/".$uid2;
    httpGet($url);
}

function saveCookie($uid){
    setcookie('BBDC_UID', $uid, time()+3600*24*7);
}

function gotoPlay($domainName, $openid, $access_token){
    $url = "Location: ".$domainName."/wechat.html?username=$openid&password=$access_token";
    header($url);
}

function checkStr($s){
    if (!isset($s) || $s == null || $s == "" || strlen($s) == 0){
        return false;
    }
    else{
        return true;
    }
}

$domainName = "http://h5.funmi.cn";
$type = "sb";
$appid = 'wx9405f71ba4f268ae';
$secret = '99e4f4a3c2daea6ea5cd015e810d26d5';

$code = $_GET["code"];
$state = $_GET["state"];
$shareUid = $state;

$data = array('message' => "Authorization Failed");
if (isset($code) && checkStr($code)){
    $res = getAccessTokenAndOpenId($appid, $secret, $code);
    if ($res != null) {
        $access_token = $res["access_token"];
        $openid = $res["openid"];
        $data["access_token"] = $access_token;
        $data["openid"] = $openid;
        $data["message"] = 'OK';
        gotoPlay($domainName, $openid, $access_token);
        
        /*$user = getUserInfo($access_token, $openid);
        $uid = $user["uid"];
        $uname = $user["uname"];
        $photo = $user["photo"];

        saveUserInfo($domainName, $type, $uid, $uname, $photo);
        if (checkStr($shareUid)){
            saveFriendInfo($domainName, $type, $uid, $shareUid);
        }
        saveCookie($uid);
        gotoPlay($domainName, $uid);*/
    }
} else {
    $data['message'] =  "Code can not be empty.";
}
echo var_dump($data);

?>
