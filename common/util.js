var app = getApp();
var api = require('./api.js');
var languagePreference = require('./languagePreference.js');
// Keys that should persist even when clearing auth-related storage
const PERSISTENT_KEYS = [
	'languageType',
	'userManuallySelectedLanguage',
	'appChannel',
	'app_runtime_context',
	'app_update_ignored_release',
	'app_update_snoozed_release',
	'app_update_pending_release'
];
const LOGIN_PAGE = '/pages/login/login';
const TAB_ROUTES = [
	'/pages/index/swipe',
	'/pages/index/index',
	'/pages/work/work',
	'/pages/chatNew/chatNew',
	'/pages/user/user'
];
const AUTH_WHITE_LIST = [
	LOGIN_PAGE,
	'/pages/login/reg',
	'/pages/login/forget',
	'/pages/user/language',
	'/pages/user/yinshi/yinshi',
	'/pages/user/tiaokuan/tiaokuan',
	'/pages/system/app-update'
];
const REGISTER_FLOW_ROUTES = [
	'/pages/perfect/perfect'
];

function normalizeRoute(url) {
	var value = String(url || '').split('?')[0].split('#')[0];
	value = value.replace(/^\/+/, '');
	return value ? '/' + value : '';
}

function getCurrentRoutePath() {
	try {
		var pages = getCurrentPages && getCurrentPages();
		var current = pages && pages.length ? pages[pages.length - 1] : null;
		return normalizeRoute(current && current.route);
	} catch (e) {
		return '';
	}
}

function getStoredUser() {
	var user = uni.getStorageSync('user') || {};
	return user && typeof user === 'object' ? user : {};
}

function isPendingRegisterUser(user) {
	user = user || {};
	return user.is_register_temp == 1 || String(user.token || '').indexOf('reg_') === 0;
}

function hasPendingRegister() {
	var user = getStoredUser();
	return !!user.token && isPendingRegisterUser(user);
}

function hasLogin() {
	var user = getStoredUser();
	if (!user.token) {
		return false;
	}
	if (isPendingRegisterUser(user)) {
		return false;
	}
	if (!uni.getStorageSync('token')) {
		uni.setStorageSync('token', user.token);
	}
	return true;
}

function isAuthWhiteRoute(url) {
	var route = normalizeRoute(url || getCurrentRoutePath());
	return AUTH_WHITE_LIST.indexOf(route) > -1;
}

function isTabRoute(url) {
	return TAB_ROUTES.indexOf(normalizeRoute(url)) > -1;
}

function syncTabBarUnreadBadge(unreadTotal) {
	if (!isTabRoute(getCurrentRoutePath())) {
		return false;
	}
	var count = Math.max(0, Math.floor(Number(unreadTotal) || 0));
	var options = {
		index: 3,
		fail: function() {}
	};
	if (count > 0) {
		options.text = count > 99 ? '99+' : String(count);
		uni.setTabBarBadge(options);
	} else {
		uni.removeTabBarBadge(options);
	}
	return true;
}

function isRegisterFlowRoute(url) {
	return REGISTER_FLOW_ROUTES.indexOf(normalizeRoute(url)) > -1;
}

var authGuardInstalled = false;

function installAuthGuard() {
	if (authGuardInstalled || typeof uni === 'undefined' || typeof uni.addInterceptor !== 'function') {
		return;
	}
	authGuardInstalled = true;
	['navigateTo', 'redirectTo', 'reLaunch', 'switchTab'].forEach(function(name) {
		uni.addInterceptor(name, {
			invoke: function(args) {
				if (!args || !args.url) {
					return true;
				}
				return requireLogin(args.url);
			}
		});
	});
}

function joinApiPath(base, url) {
	var cleanBase = String(base || '');
	var cleanUrl = String(url || '');
	cleanBase = cleanBase.replace(/\/+$/, '');
	cleanUrl = cleanUrl.replace(/^\/+/, '').replace(/^api\/+/, '');
	return cleanBase + '/' + cleanUrl;
}

function buildRequestUrl(url) {
	return joinApiPath(api.path, url);
}

function buildUploadUrl(url) {
	return joinApiPath(api.uploadpath, url);
}

function getAppRequestHeaders() {
	var runtime = uni.getStorageSync('app_runtime_context') || {};
	return {
		'X-App-Platform': runtime.platform || (api.appType === 2 ? 'ios' : 'android'),
		'X-App-Version-Code': String(runtime.version_code || api.version || 0),
		'X-App-Channel': runtime.channel || api.appChannel || 'official'
	};
}

function normalizeImageUrl(url) {
	if (url === undefined || url === null || url === '') {
		return url;
	}
	if (typeof url !== 'string') {
		return url;
	}
	var value = url.trim();
	var suffix = '';
	var suffixIndex = value.search(/[?#]/);
	if (suffixIndex > -1) {
		suffix = value.slice(suffixIndex);
		value = value.slice(0, suffixIndex);
	}
	if (/^(data:image\/|blob:|file:)/i.test(value)) {
		return value + suffix;
	}
	value = value.replace(/^tupianyuming\/?/i, '/');
	value = value.replace(/^https?:\/\/img\.topsweeter\.com\/?/i, '/');
	value = value.replace(/^https?:\/\/(?:localhost|127\.0\.0\.1|0\.0\.0\.0)(?::\d+)?(?=\/(?:uploads|assets)\/)/i, '');
	if (/^\/?assets\/img\/avatar\.png$/i.test(value)) {
		return '/static/home/mei.png' + suffix;
	}
	if (/^https?:\/\//i.test(value)) {
		return value + suffix;
	}
	if (/^\/?static\//i.test(value)) {
		return '/' + value.replace(/^\/+/, '') + suffix;
	}
	if (/^\/?(uploads|assets)\//i.test(value)) {
		var assetPath = '/' + value.replace(/^\/+/, '');
		return api.img_url ? api.img_url.replace(/\/+$/, '') + assetPath + suffix : assetPath + suffix;
	}
	return api.img_url + value + suffix;
}

function normalizeImageData(data) {
	var imageKeys = {
		avatar: true,
		avatars: true,
		avatar_arr: true,
		image: true,
		images: true,
		image_attr: true,
		img: true,
		thumb: true,
		fullurl: true,
		video_png: true,
		auth_image: true,
		auth_file: true,
		from_user_avatar: true,
		to_user_avatar: true,
		dynamic_user_avatar: true,
		bg_home: true,
		open_image: true,
		live_weixin_img: true,
		default_avatar: true
	};
	function walk(value, key) {
		if (typeof value === 'string') {
			return imageKeys[key] ? normalizeImageUrl(value) : value;
		}
		if (Array.isArray(value)) {
			return value.map(function(item) {
				return walk(item, key);
			});
		}
		if (value && typeof value === 'object') {
			Object.keys(value).forEach(function(childKey) {
				value[childKey] = walk(value[childKey], childKey);
			});
		}
		return value;
	}
	return walk(data, '');
}

function clearStoragePreserve(keys = PERSISTENT_KEYS) {
  try {
    const backup = {};
    keys.forEach(k => {
      backup[k] = uni.getStorageSync(k);
    });
    uni.clearStorageSync();
    Object.keys(backup).forEach(k => {
      const v = backup[k];
      if (v !== undefined && v !== null && v !== '') {
        uni.setStorageSync(k, v);
      }
    });
  } catch (e) {
    // Fallback: if anything goes wrong, at least avoid crashing
    try { uni.clearStorageSync(); } catch(_) {}
  }
}


/**
 * request 普通请求
 */

/**
 * request 普通请求
 */
function request(url, data = {}, dataType = '', method = "POST") {
	var options = dataType && typeof dataType === 'object' ? dataType : {};
	var returnEnvelope = dataType && typeof dataType !== 'object'
		? true
		: Boolean(options.envelope);
	var requestMethod = options.method || method || 'POST';
	var silent = Boolean(options.silent);
	var timeout = Math.max(1000, Number(options.timeout || 10000));
	return new Promise(function(resolve, reject) {
		let languageType = languagePreference.codeForIndex(languagePreference.getLanguageIndex());
		uni.request({
			url: buildRequestUrl(url),
			data: data,
			method: requestMethod,
			timeout: timeout,
			header: Object.assign({
				'content-type': 'application/x-www-form-urlencoded',
				'Accept-Language': languageType, 
				'token': getStoredUser().token || ''
				
			}, getAppRequestHeaders()),
			success(res) {
				if (res.statusCode === 426 || (res.data && Number(res.data.code) === 426)) {
					uni.$emit('app-update-required', res.data && res.data.data ? res.data.data : {});
					reject(normalizeImageData(res.data || {}));
					return;
				}
				var body = res.data || {};
				if (body.code == 1) {
					if (returnEnvelope) {
						resolve(normalizeImageData(res.data));
					} else {
						resolve(normalizeImageData(res.data.data));
					}
				}else if(body.code == 4002){
					resolve(normalizeImageData(res.data));
				}else if(body.code == 4003){
					resolve(normalizeImageData(res.data));
				}else if(body.code == 101){
					resolve(normalizeImageData(res.data));
				}else if (body.code == 10001) {
					clearStoragePreserve(); 
					toLogin();
					reject(normalizeImageData(body));
				}else if(body.code==10005){
					resolve(res.data);
				}else if(body.code==0){
					if (!silent) showToast(body.msg);
					reject(normalizeImageData(res.data));
				}else if (body.msg) {
					if (!silent) showToast(body.msg);
					reject(normalizeImageData(res.data));
				} else {
					reject(normalizeImageData(res.data || {}));
				}
			},
			fail(err) {
				if (!silent) showToast('加载失败，请检查网络');
				reject(err);
			}
		})
	});
}

/**
 * 获取用户信息
 */
function getUserInfo(data = {}) {
	let that = this;
	return new Promise((resolve, reject) => {
		that.request(
			'/api/doctor/info', data, "POST"
		).then(res => {
			resolve(res);
		})
	});
}
function seeimg(list,index) {
	if(list[0].indexOf('http') == -1){
		for(let i = 0 ; i < list.length ; i++){
			list[i] = normalizeImageUrl(list[i]);
			if(i == list.length-1){
								uni.previewImage({
					current: index,
					urls: list
				})
			}
		}
	}else{
				uni.previewImage({
			current: index,
			urls: list
		})
	}
}
/**
 * 跳转到登录页面,并清空缓存
 */
function toLogin(e) {
	uni.hideLoading()
	clearStoragePreserve();
	if (normalizeRoute(e || getCurrentRoutePath()) === LOGIN_PAGE) {
		return;
	}
	uni.reLaunch({
		url: LOGIN_PAGE
	})
}
function requireLogin(url) {
	var route = normalizeRoute(url || getCurrentRoutePath());
	if (!route || isAuthWhiteRoute(route) || hasLogin() || (isRegisterFlowRoute(route) && hasPendingRegister())) {
		return true;
	}
	toLogin(route);
	return false;
}
/**
 * 消息提示框
 */
function showToast(msg = '') {
	uni.showToast({
		title: msg,
		duration: 2000,
		icon: 'none'
	});
}
/**
 *  弹出提示信息结束后执行方法
 */
function showMsg(msg, callback) {
	uni.showToast({
		title: msg,
		icon: 'none',
		duration: 2000,
		success: function() {
			setTimeout(callback, 2000);
		}
	})
}
/**
 *  页面跳转
 */
function urlTo(e) {
	if (!requireLogin(e)) {
		return;
	}
	if (isTabRoute(e)) {
		uni.switchTab({
			url: e
		})
		return;
	}
	uni.navigateTo({
		url: e
	})
}
/**
 *  微信订阅消息
 */
function subScribeMsg(e) {
  return new Promise((resolve, reject) => {
    uni.getSetting({
      withSubscriptions: true,
      success(res) {
                if (!res.subscriptionsSetting.mainSwitch) {
          uni.openSetting({
            success(res) {
                          }
          })
        } else {
          uni.requestSubscribeMessage({
            tmplIds: [e],
            success(res) {
                            resolve(res)
              if (res[e] == "accept") { // 用户点击确定后
                                // that.getSubMsg()
              } else {
                              }
            },
            fail(errMessage) {
              reject(errMessage)
                          },
            complete() {
              // if (that.ordercode == null) return that.getOrder(appoint);
              // if (that.ordercode != null) return that.getPayOrder(appoint);
              // that.startDisabled = false
            }
          })
        }
      },
    })
  })
}
 
/**
 *手机掩码
 */
function phoneMask(phone) {
	if (phone) {
		return phone.substring(0, 3) + '****' + phone.substring(7);
	}
}
/**
 * 验证手机号
 */
function checkPhone(phone) {
	let zz = /^1[3456789]\d{9}$/;
	return zz.test(phone);
}
/**
 * 验证姓名
 */
function checkName(name) {
	let zz = /^[\u4E00-\u9FA5\uf900-\ufa2d·s]{2,20}$/; //验证姓名正则
	return zz.test(name);
}
/*  
验证日期
*/
function checkDate(date) {
	let shengri_zz = /^\d{4}-\d{2}-\d{2}$/; //日期验证
	return shengri_zz.test(date);
}

/*  
格式化时间戳
*/
function timeChange(timestamp) {
	var date = new Date(timestamp * 1000); //时间戳为10位需*1000，时间戳为13位的话不需乘1000
	var Y = date.getFullYear() + '-';
	var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
	var D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + ' ';
	var h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
	var m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':';
	var s = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
	return Y + M + D + h + m + s;
}
/* 
 判断是否微信浏览
 */
function isWeiXin() {
	var ua = window.navigator.userAgent.toLowerCase();
	if (ua.match(/MicroMessenger/i) == 'micromessenger') {
		return true;
	} else {
		return false;
	}
}
/* 
		验证邮箱
	 */
function checkEmail(value) {
	return /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/.test(value)
}
/* 
		身份证验证
	 */
function checkIDCard(idNum) {
	if (!idNum) {
		return false
	}
	// alert(idNum);
	var errors = new Array( // eslint-disable-line
		"alert('验证通过');",
		"alert('身份证号码位数不对');",
		"alert('身份证含有非法字符');",
		"alert('身份证号码校验错误');",
		"alert('身份证地区非法');"
	)
	// 身份号码位数及格式检验
	var re
	var len = idNum.length
	// 身份证位数检验
	if (len != 15 && len != 18) { // eslint-disable-line
		return false
	} else if (len == 15) { // eslint-disable-line
		re = new RegExp(/^(\d{6})()?(\d{2})(\d{2})(\d{2})(\d{3})$/)
	} else {
		re = new RegExp(/^(\d{6})()?(\d{4})(\d{2})(\d{2})(\d{3})([0-9xX])$/)
	}
	var area = {
		11: '北京',
		12: '天津',
		13: '河北',
		14: '山西',
		15: '内蒙古',
		21: '辽宁',
		22: '吉林',
		23: '黑龙江',
		31: '上海',
		32: '江苏',
		33: '浙江',
		34: '安徽',
		35: '福建',
		36: '江西',
		37: '山东',
		41: '河南',
		42: '湖北',
		43: '湖南',
		44: '广东',
		45: '广西',
		46: '海南',
		50: '重庆',
		51: '四川',
		52: '贵州',
		53: '云南',
		54: '西藏',
		61: '陕西',
		62: '甘肃',
		63: '青海',
		64: '宁夏',
		65: '新疆',
		71: '台湾',
		81: '香港',
		82: '澳门',
		91: '国外'
	}
	var idcard_array = new Array() // eslint-disable-line
	idcard_array = idNum.split('') // eslint-disable-line
	// 地区检验
	if (area[parseInt(idNum.substr(0, 2))] == null) {
		return false
	}
	// 出生日期正确性检验
	var a = idNum.match(re)
	if (a != null) { // eslint-disable-line
		var flag
		var DD
		if (len == 15) { // eslint-disable-line
			DD = new Date('19' + a[3] + '/' + a[4] + '/' + a[5])
			flag = DD.getYear() == a[3] && (DD.getMonth() + 1) == a[4] && DD.getDate() == a[5] // eslint-disable-line
		} else if (len == 18) { // eslint-disable-line
			DD = new Date(a[3] + '/' + a[4] + '/' + a[5])
			flag = DD.getFullYear() == a[3] && (DD.getMonth() + 1) == a[4] && DD.getDate() == a[
				5] // eslint-disable-line
		}
		if (!flag) {
			// return false;
			return false
		}
		// 检验校验位
		if (len == 18) { // eslint-disable-line
			var S = (parseInt(idcard_array[0]) + parseInt(idcard_array[10])) * 7 +
				(parseInt(idcard_array[1]) +
					parseInt(idcard_array[11])) * 9 +
				(parseInt(idcard_array[2]) +
					parseInt(idcard_array[12])) * 10 +
				(parseInt(idcard_array[3]) +
					parseInt(idcard_array[13])) * 5 +
				(parseInt(idcard_array[4]) +
					parseInt(idcard_array[14])) * 8 +
				(parseInt(idcard_array[5]) +
					parseInt(idcard_array[15])) * 4 +
				(parseInt(idcard_array[6]) +
					parseInt(idcard_array[16])) * 2 +
				parseInt(idcard_array[7]) * 1 +
				parseInt(idcard_array[8]) * 6 +
				parseInt(idcard_array[9]) * 3
			var Y = S % 11
			var M = 'F'
			var JYM = '10X98765432'
			M = JYM.substr(Y, 1) // 判断校验位
			// 检测ID的校验位
			if (M == idcard_array[17]) { // eslint-disable-line
				return true
				// return "";
			} else {
				// return false;
				return false
			}
		}
	} else {
		// return false;
		return false
	}
	return true
}
/* 
 APP检查更新
 */
function getVersion(e) {
	var appUpdate = require('./appUpdate.js');
	return e == 1 ? appUpdate.manualCheck() : appUpdate.autoCheck();
}
/* 
 微信小程序版本更新
 */
function wxUpdate() {
		if (wx.canIUse('getUpdateManager')) {
		const updateManager = wx.getUpdateManager()
		updateManager.onCheckForUpdate(function(res) {
						// 请求完新版本信息的回调
			if (res.hasUpdate) {
				updateManager.onUpdateReady(function() { 
					wx.showModal({
						title: '更新提示',
						content: '新版本已经准备好，是否重启应用？',
						success: function(res) {
							if (res.confirm) {
								// 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
								updateManager.applyUpdate()
							}
						}
					})
				})
				updateManager.onUpdateFailed(function() {
					// 新的版本下载失败
					wx.showModal({
						title: '已经有新版本了哟~',
						content: '新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟~',
					})
				})
			}
		})
	} else {
		// 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
		wx.showModal({
			title: '提示',
			content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
		})
	}
}
/* 
 预览图片
 e:图片地址 可单张字符串或数组
 index:图片索引
 item:多数据数组情况下传 图片字段名
 */
function lookImg(e, index = 0, item) {
	let url;
	if (Array.isArray(e)) {
		url = e;
	} else {
		url = [e];
	}
	let urls = [];
	if (item) {
		url.map(i => {
			urls.push(i[item]);
		})
		url = urls;
	}
	uni.previewImage({
		urls: url.map(i => normalizeImageUrl(i)),
		current: normalizeImageUrl(url[index] || index)
	})
}
/* 
 腾讯逆解析 传经纬度获取地址
 */
function getDistrict(latitude, longitude) {
	return new Promise((resolve, reject) => {
		// let keys = 'VCIBZ-WKSCX-DY74A-TCM3S-GLX7S-IABIU'//测试key
		let keys = 'Z2WBZ-7BB33-PSF3E-32VEW-SZMGO-6UBKK'
		wx.request({
			url: `https://apis.map.qq.com/ws/geocoder/v1/?location=${latitude},${longitude}&key=${keys}`,
			header: {
				'Content-Type': 'application/json'
			},
			success: function(res) {
								resolve(res.data.result)
			}
		})
	})
}
/* 
 上传文件uploadFile
 */
function uploadFile(img) {
	uni.showLoading({
		title: '上传中'
	});
	let _this = this;
	const token = uni.getStorageSync('user').token;
	return new Promise(function(resolve, reject) {
		uni.uploadFile({
			url: buildUploadUrl('common/upload'),
			filePath: img,
			name: 'file',
			timeout: 30000,
			header: getAppRequestHeaders(),
			formData: {
				token: token
			},
			success: (uploadFileRes) => {
				let up = {};
				try {
					up = typeof uploadFileRes.data === 'string'
						? JSON.parse(uploadFileRes.data)
						: (uploadFileRes.data || {});
				} catch (error) {
					reject(error);
					return;
				}
				if (uploadFileRes.statusCode === 426 || Number(up.code) === 426) {
					uni.$emit('app-update-required', up.data || {});
					reject(up);
					return;
				}
				if (up.code == 1) {
					if (up.data && up.data.fullurl) {
						up.data.url = up.data.fullurl;
					}
					resolve(up.data);
					uni.hideLoading();
				} else {
					_this.showToast(up.msg);
					reject(up);
				}
			},
			fail: reject,
			complete: () => uni.hideLoading()
		});
	});
}
/* 
获取当前之后第几天的日期
 */
function getLaterDay(day) {
	var today = new Date();
	var targetday_milliseconds = today.getTime() + 1000 * 60 * 60 * 24 * day;
	today.setTime(targetday_milliseconds); //注意，这行是关键代码
	var tYear = today.getFullYear();
	var tMonth = today.getMonth();
	var tDate = today.getDate();
	tMonth = doHandleMonth(tMonth + 1);
	tDate = doHandleMonth(tDate);
	return tYear + '-' + tMonth + "-" + tDate;

	function doHandleMonth(month) {
		var m = month;
		if (month.toString().length == 1) {
			m = '0' + month;
		}
		return m;
	}
}
/* 
格式化秒时间戳 为00:00:00格式 
 */
function secChange(time) {
	let h = parseInt(time / 3600);
	let min = parseInt((time - h * 3600) / 60);
	let s = parseInt(time - h * 3600 - min * 60);
	h = (h < 9 ? '0' : '') + h;
	min = (min < 9 ? '0' : '') + min;
	s = (s < 9 ? '0' : '') + s;
	return h + ':' + min + ':' + s;
}
/* 
 返回上级页面 time延迟执行的时间
 */
function backTo(e = 1, time = 0) {
	setTimeout(function() {
		uni.navigateBack({
			delta: e
		})
	}, time);
}
/* 
 从本地选择图片
 */
function addImg(num = 1, type) {
	let sourceType;
	if (type == 1) {
		sourceType = ['album'];
	} else if (type == 2) {
		sourceType = ['camera'];
	} else {
		sourceType = ['album', 'camera'];
	}
	return new Promise((resolve, reject) => {
		uni.chooseImage({
			count: num, //默认9
			sourceType: sourceType, //从相册选择
			success: function(res) {
				if (num == 1) {
					resolve(res.tempFilePaths[0]);
				} else {
					resolve(res.tempFilePaths);
				}
			}
		});
	})
}
/* 
 从本地选择视频
 */
function addVideo() {
	return new Promise((resolve, reject) => {
		uni.chooseVideo({
			success: function(res) {
				resolve(res.tempFilePath);
			}
		});
	})
}
/* 
 计算现在距未来某个节点的时间（倒计时）
 type:1时startTime为日期格式  2时startTime为秒级时间戳格式
 */
function getLiveTimeCount(startTime, type = 1) {
	if (type == 1) {
		let transedPreTime = startTime.replace(/-/g, '/'); //这里转化时间格式为以/分隔形式
		let preTime = new Date(transedPreTime).getTime();
	} else {
		let preTime = new Date(startTime * 1000).getTime();
	}
	let nowTime = new Date().getTime();
	let obj = null;
	if (preTime - nowTime > 0) {
		let time = (preTime - nowTime) / 1000;
		let day = parseInt(time / (60 * 60 * 24));
		let hou = parseInt(time % (60 * 60 * 24) / 3600);
		let min = parseInt(time % (60 * 60 * 24) % 3600 / 60);
		let sec = parseInt(time % (60 * 60 * 24) % 3600 % 60);
		obj = {
			day: day < 10 ? '0' + day : day,
			hou: hou < 10 ? '0' + hou : hou,
			min: min < 10 ? '0' + min : min,
			sec: sec < 10 ? '0' + sec : sec
		};
	}
	return obj; //倒计时计算后的时间  {日：时：分：秒}
}
/* 
 复制文本到剪切板
 */
function copy(e) {
	uni.setClipboardData({
		data: e,
		success: function() {}
	});
}
/* 
 拨打电话
 */
function dial(e) {
	uni.makePhoneCall({
		phoneNumber: e
	});
}
/*
根据身份证号验证男女
*/ 
function getGenderFromIdCard(idCard) {
    // 定义男女性别对应的数字编码
    var genderCode = idCard.substr(-2, 1);
    
    if (genderCode % 2 === 0) {
        return 0;//女
    } else {
        return 1;//男
    }
}
/* 
截取h5地址的某一参数值 
 */
function GetQueryString(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
	var r = window.location.search.substr(1).match(reg);
	if (r != null) return (decodeURIComponent(r[2]));
	return null;
}
/**
 * h5 跳转地图导航跳转地图app
 * 根据地图类型、位置获取不同的地图页面跳转链接
 * @param {*} mapType 地图类型
 * @param {*} location 经纬度 lat:纬度 lng:经度
 * @param {*} address 详细地址
 */
function getMapApp(mapType, lat, lng, address) {
	let url = '';
	switch (mapType) {
		case '腾讯地图':
			url = 'https://apis.map.qq.com/uri/v1/marker?marker=coord:' + lat + ',' + lng + ';addr:' +
				address + ';title:' + address + '&referer=keyfree';
			break;
		case '高德地图':
			url = 'https://uri.amap.com/marker?position=' + lng + ',' + lat + '&name=' + address +
				'&callnative=1';
			break;
		case '百度地图':
			url = 'http://api.map.baidu.com/marker?location=' + lat + ',' + lng + '&title=' + address + '&content=' +
				address + '&output=html&src=webapp.reformer.appname&coord_type=gcj02';
			break;
		default:
			break;
	}
	window.location.href = url;
}

/**
 * 打开第三方支付页（PayPal 等），兼容 H5 / APP。
 */
function openPayUrl(payUrl, orderSn = '') {
	const url = String(payUrl || '').trim();
	const paymentOrderSn = String(orderSn || '').trim();
	if (!url) {
		showToast('Payment URL missing');
		return false;
	}
	if (!/^https?:\/\//i.test(url)) {
		showToast('Invalid payment URL');
		return false;
	}
	// #ifdef APP-PLUS
	try {
		let webviewUrl = '/pages/user/pay-webview?url=' + encodeURIComponent(url);
		if (paymentOrderSn) {
			webviewUrl += '&order_sn=' + encodeURIComponent(paymentOrderSn);
		}
		uni.navigateTo({
			url: webviewUrl,
			fail: () => {
				if (typeof plus !== 'undefined' && plus.runtime && typeof plus.runtime.openURL === 'function') {
					plus.runtime.openURL(url);
					return;
				}
				showToast('Unable to open payment page');
			}
		});
		return true;
	} catch (e) {
		if (typeof plus !== 'undefined' && plus.runtime && typeof plus.runtime.openURL === 'function') {
			plus.runtime.openURL(url);
			return true;
		}
		showToast('Unable to open payment page');
		return false;
	}
	// #endif
	// #ifdef H5
	if (typeof window !== 'undefined' && window.location) {
		window.location.href = url;
		return true;
	}
	// #endif
	uni.setClipboardData({
		data: url,
		success: () => showToast('Payment link copied')
	});
	return false;
}

module.exports = {
	request,
	toLogin,
	requireLogin,
	hasLogin,
	hasPendingRegister,
	isPendingRegisterUser,
	isAuthWhiteRoute,
	isTabRoute,
	getCurrentRoutePath,
	syncTabBarUnreadBadge,
	installAuthGuard,
	showToast,
	showMsg,
	checkPhone,
	checkName,
	checkDate,
	urlTo,
	phoneMask,
	getUserInfo,
	timeChange,
	isWeiXin,
	checkEmail,
	checkIDCard,
	getVersion,
	wxUpdate,
	lookImg,
	getDistrict,
	uploadFile,
	getLaterDay,
	secChange,
	backTo,
	addImg,
	addVideo,
	getLiveTimeCount,
	copy,
	dial,
	GetQueryString,
	getMapApp,
	openPayUrl,
	api,
	buildRequestUrl,
	buildUploadUrl,
	getAppRequestHeaders,
	normalizeImageUrl,
	normalizeImageData,
	seeimg,
	getGenderFromIdCard,
	subScribeMsg
}
