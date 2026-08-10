var app = getApp();
// 正式
// var path = "/api/";
// var img_url = "/"
// var uploadpath="/"
// var socket="wss://api.example.com/ws"


// var img_url = "http://localhost:9501/";          // 如果图片由后端提供，可能需要调整路径
// var uploadpath = "http://localhost:9501/api/";   // 上传接口可能也是 /api 下
// var socket = "ws://localhost:9501/ws";            // WebSocket 地址（注意协议 ws 而非 wss）


// APP has no browser origin/reverse-proxy context, so it must use an absolute host.
// Set APP_SERVER_HOST to the official HTTPS API domain before packaging APP builds.
// H5 keeps relative URLs so the deployed nginx/local dev proxy can continue to work.
var APP_SERVER_HOST = "https://ucooo.tech";
var serverHost = normalizeHost(APP_SERVER_HOST || getConfiguredServerHost());
var socket = socketFromHost(serverHost);

// #ifdef H5
serverHost = "";
if (typeof window !== "undefined" && window.location && window.location.host) {
	var wsProtocol = window.location.protocol === "https:" ? "wss://" : "ws://";
	socket = wsProtocol + window.location.host + "/ws";
}
// #endif

var path = serverHost ? serverHost + "/api/" : "/api/";
var img_url = serverHost ? serverHost + "/" : "";
var uploadpath = serverHost ? serverHost + "/api/" : "/api/";
var versionName = '1.3.3';
var version = 106;
var appId = '__UNI__200F612';
var packageName = 'uni.app.UNI200F612';
var appChannel = 'official';
var appType = detectAppType(); // 1=安卓 2=ios
// 商用默认使用 GoEasy 做实时通道；消息读写仍走自建后端。
var imProvider = 'goeasy'; // goeasy=GoEasy主通道, self=自建备用, hybrid=双通道灰度
function socketFromHost(host) {
	if (!host) return "";
	return host.replace(/^https:\/\//, "wss://").replace(/^http:\/\//, "ws://") + "/ws";
}
function getConfiguredServerHost() {
	var host = "";
	if (typeof uni !== "undefined" && uni.getStorageSync) {
		try {
			host = uni.getStorageSync("serverHost") || uni.getStorageSync("appServerHost") || "";
		} catch (e) {}
	}
	return host;
}
function normalizeHost(host) {
	host = String(host || "").replace(/\/+$/, "");
	if (host && !/^https?:\/\//i.test(host)) {
		host = "https://" + host;
	}
	return host;
}
function detectAppType() {
	if (typeof uni !== "undefined" && uni.getSystemInfoSync) {
		try {
			var systemInfo = uni.getSystemInfoSync() || {};
			var osName = String(systemInfo.osName || systemInfo.platform || "").toLowerCase();
			if (osName.indexOf("ios") >= 0) return 2;
		} catch (e) {}
	}
	// #ifdef APP-PLUS
	if (typeof plus !== "undefined" && plus.os && String(plus.os.name || "").toLowerCase().indexOf("ios") >= 0) {
		return 2;
	}
	// #endif
	return 1;
}
function paths() {
	return path; 
}
module.exports = {
	path: path,
	img_url:img_url,
	version: version,
	versionName: versionName,
	appId: appId,
	packageName: packageName,
	appChannel: appChannel,
	appType: appType,
	paths: paths,
	uploadpath:uploadpath,
	socket:socket,
	imProvider: imProvider
}
