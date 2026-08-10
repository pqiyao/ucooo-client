var api = require('./api.js')
var policy = require('./appUpdatePolicy.js')
var updateText = require('./appUpdateText.js')

var KEYS = {
	runtime: 'app_runtime_context',
	ignored: 'app_update_ignored_release',
	snoozed: 'app_update_snoozed_release',
	pending: 'app_update_pending_release'
}
var UPDATE_PAGE = '/pages/system/app-update'
var installed = false
var checkedThisLaunch = false
var scheduled = false
var checkingPromise = null
var popupVisible = false
var lastCheckAt = 0
var lastAttemptAt = 0
var runtimePromise = null
var retryTimer = null
var AUTO_CHECK_DELAY = 1400
var FAILED_CHECK_RETRY_INTERVAL = 120000
var SUCCESS_CHECK_INTERVAL = 21600000

function isNativeApp() {
	var nativeApp = false
	// #ifdef APP-PLUS
	nativeApp = true
	// #endif
	return nativeApp
}

function joinApiPath(base, path) {
	return String(base || '').replace(/\/+$/, '') + '/' + String(path || '').replace(/^\/+/, '').replace(/^api\/+/, '')
}

function normalizeChannel(value) {
	var channel = String(value || 'official').toLowerCase().trim()
	var aliases = {
		google: 'google_play',
		yyb: 'tencent',
		'360': 'qihoo_360'
	}
	return aliases[channel] || channel || 'official'
}

function fallbackClientInfo() {
	var language = updateText.getLanguageCode()
	var platform = api.appType === 2 ? 'ios' : 'android'
	return {
		app_id: api.appId,
		package_name: api.packageName,
		platform: platform,
		channel: normalizeChannel(uni.getStorageSync('appChannel') || api.appChannel || 'official'),
		version_name: api.versionName,
		version_code: Number(api.version || 0),
		locale: language
	}
}

function persistRuntimeInfo(info) {
	try {
		uni.setStorageSync(KEYS.runtime, info)
	} catch (error) {}
	return info
}

function getClientInfo(forceRefresh) {
	if (runtimePromise && !forceRefresh) return runtimePromise
	runtimePromise = new Promise(function(resolve) {
		var fallback = fallbackClientInfo()
		// #ifdef APP-PLUS
		if (typeof plus !== 'undefined' && plus.runtime && typeof plus.runtime.getProperty === 'function') {
			var settled = false
			var finish = function(info) {
				if (settled) return
				settled = true
				resolve(persistRuntimeInfo(info))
			}
			var timer = setTimeout(function() { finish(fallback) }, 1500)
			try {
				plus.runtime.getProperty(plus.runtime.appid, function(widgetInfo) {
					clearTimeout(timer)
					var packageName = fallback.package_name
					try {
						if (fallback.platform === 'android' && plus.android) {
							packageName = String(plus.android.runtimeMainActivity().getPackageName() || packageName)
						} else if (fallback.platform === 'ios' && plus.ios) {
							var bundle = plus.ios.importClass('NSBundle').mainBundle()
							packageName = String(bundle.bundleIdentifier() || packageName)
						}
					} catch (error) {}
					finish(Object.assign({}, fallback, {
						app_id: String(plus.runtime.appid || fallback.app_id),
						package_name: packageName,
						channel: normalizeChannel(plus.runtime.channel || fallback.channel),
						version_name: String((widgetInfo && widgetInfo.version) || plus.runtime.version || fallback.version_name),
						version_code: policy.toInteger((widgetInfo && widgetInfo.versionCode) || plus.runtime.versionCode || fallback.version_code, fallback.version_code)
					}))
				})
			} catch (error) {
				clearTimeout(timer)
				finish(fallback)
			}
			return
		}
		// #endif
		resolve(persistRuntimeInfo(fallback))
	})
	return runtimePromise
}

function requestRelease(client) {
	return new Promise(function(resolve, reject) {
		uni.request({
			url: joinApiPath(api.path, 'pub/app_update/check'),
			data: client,
			method: 'POST',
			timeout: 3500,
			header: {
				'content-type': 'application/x-www-form-urlencoded',
				'Accept-Language': client.locale,
				'X-App-Platform': client.platform,
				'X-App-Version-Code': String(client.version_code),
				'X-App-Channel': client.channel
			},
			success: function(response) {
				var body = response && response.data ? response.data : {}
				if (response.statusCode >= 200 && response.statusCode < 300 && Number(body.code) === 1) {
					resolve(body.data || {})
					return
				}
				reject(new Error(String(body.msg || 'APP update check failed')))
			},
			fail: reject
		})
	})
}

function presentRelease(release, client) {
	if (popupVisible) return false
	popupVisible = true
	var pending = {
		release: release,
		copy: updateText.getCopy(client.locale),
		current_version_code: client.version_code
	}
	uni.setStorageSync(KEYS.pending, pending)
	setTimeout(function() {
		var clearFailedPresentation = function() {
			popupVisible = false
			uni.removeStorageSync(KEYS.pending)
			if (release.update_mode === 'force') scheduleAutoCheck(FAILED_CHECK_RETRY_INTERVAL)
		}
		var relaunchForcedUpdate = function() {
			if (release.update_mode !== 'force' || typeof uni.reLaunch !== 'function') {
				clearFailedPresentation()
				return
			}
			uni.reLaunch({ url: UPDATE_PAGE, fail: clearFailedPresentation })
		}
		var redirectForcedUpdate = function() {
			if (release.update_mode !== 'force' || typeof uni.redirectTo !== 'function') {
				clearFailedPresentation()
				return
			}
			uni.redirectTo({ url: UPDATE_PAGE, fail: relaunchForcedUpdate })
		}
		uni.navigateTo({ url: UPDATE_PAGE, fail: redirectForcedUpdate })
	}, 120)
	return true
}

function check(options) {
	var opts = options || {}
	if (!isNativeApp()) {
		return Promise.resolve({ has_update: false, unsupported: true })
	}
	if (checkingPromise) return checkingPromise
	if (opts.manual) uni.showLoading({ title: '...', mask: true })
	lastAttemptAt = Date.now()

	checkingPromise = getClientInfo(Boolean(opts.forceRuntimeRefresh)).then(function(client) {
		client = Object.assign({}, client, {
			locale: updateText.getLanguageCode(),
			channel: normalizeChannel(uni.getStorageSync('appChannel') || client.channel || api.appChannel || 'official')
		})
		return requestRelease(client).then(function(rawRelease) {
			lastCheckAt = Date.now()
			if (retryTimer) {
				clearTimeout(retryTimer)
				retryTimer = null
				scheduled = false
			}
			var release = policy.normalizeRelease(rawRelease)
			if (!release) {
				if (opts.manual) uni.showToast({ title: updateText.getCopy(client.locale).latest, icon: 'none' })
				return { has_update: false, presented: false }
			}
			var decision = policy.shouldPresent(release, {
				currentVersionCode: client.version_code,
				manual: Boolean(opts.manual),
				ignored: uni.getStorageSync(KEYS.ignored),
				snoozed: uni.getStorageSync(KEYS.snoozed),
				now: Date.now()
			})
			var presented = decision.present ? presentRelease(release, client) : false
			return { has_update: true, release: release, presented: presented, reason: decision.reason }
		})
	}).catch(function(error) {
		if (opts.manual) {
			var copy = updateText.getCopy(updateText.getLanguageCode())
			uni.showToast({ title: copy.checkFailed, icon: 'none' })
		}
		throw error
	}).then(function(result) {
		if (opts.manual) uni.hideLoading()
		checkingPromise = null
		return result
	}, function(error) {
		if (opts.manual) uni.hideLoading()
		checkingPromise = null
		return Promise.reject(error)
	})

	return checkingPromise
}

function autoCheck() {
	return check({ manual: false }).catch(function() {
		scheduleAutoCheck(FAILED_CHECK_RETRY_INTERVAL)
		return { has_update: false, failed: true }
	})
}

function manualCheck() {
	return check({ manual: true, forceRuntimeRefresh: true })
}

function scheduleAutoCheck(delay) {
	if (scheduled || popupVisible) return
	scheduled = true
	var wait = Math.max(0, Number(delay === undefined ? AUTO_CHECK_DELAY : delay) || 0)
	if (retryTimer) clearTimeout(retryTimer)
	retryTimer = setTimeout(function() {
		retryTimer = null
		scheduled = false
		if (popupVisible) return
		checkedThisLaunch = true
		autoCheck()
	}, wait)
}

function onAppShow() {
	if (policy.shouldScheduleCheck({
		checkedThisLaunch: checkedThisLaunch,
		lastCheckAt: lastCheckAt,
		lastAttemptAt: lastAttemptAt,
		popupVisible: popupVisible,
		checking: Boolean(checkingPromise),
		scheduled: scheduled,
		now: Date.now(),
		successInterval: SUCCESS_CHECK_INTERVAL,
		failureInterval: FAILED_CHECK_RETRY_INTERVAL
	})) {
		scheduleAutoCheck()
	}
}

function decisionFor(release, extra) {
	return Object.assign({
		release_id: release.release_id,
		version_code: release.target_version_code,
		policy_revision: release.policy_revision
	}, extra || {})
}

function snooze(release) {
	uni.setStorageSync(KEYS.snoozed, decisionFor(release, {
		until: Date.now() + release.remind_after_seconds * 1000
	}))
}

function ignore(release) {
	if (!release.can_ignore || release.update_mode === 'force') return
	uni.setStorageSync(KEYS.ignored, decisionFor(release))
}

function openRelease(release) {
	return new Promise(function(resolve, reject) {
		var url = String(release && release.download_url || '').trim()
		if (!/^https:\/\//i.test(url)) {
			reject(new Error('Invalid update URL'))
			return
		}
		// #ifdef APP-PLUS
		try {
			var failed = false
			plus.runtime.openURL(url, function(error) {
				failed = true
				reject(error || new Error('Open URL failed'))
			})
			setTimeout(function() {
				if (!failed) resolve(true)
			}, 250)
			return
		} catch (error) {
			reject(error)
			return
		}
		// #endif
		// #ifdef H5
		if (typeof window !== 'undefined') {
			window.location.href = url
			resolve(true)
			return
		}
		// #endif
		reject(new Error('Update URL is not supported on this platform'))
	})
}

function onDialogClosed() {
	popupVisible = false
	uni.removeStorageSync(KEYS.pending)
}

function presentRequired(rawRelease) {
	if (!isNativeApp()) return Promise.resolve(false)
	return getClientInfo(false).then(function(client) {
		var release = policy.normalizeRelease(Object.assign({}, rawRelease || {}, { update_mode: 'force', has_update: true }))
		if (!release || release.target_version_code <= policy.toInteger(client.version_code, 0)) return false
		return presentRelease(release, client)
	})
}

function install() {
	if (installed) return
	installed = true
	uni.$on('app-update-required', presentRequired)
}

module.exports = {
	install: install,
	onAppShow: onAppShow,
	autoCheck: autoCheck,
	manualCheck: manualCheck,
	presentRequired: presentRequired,
	getClientInfo: getClientInfo,
	openRelease: openRelease,
	snooze: snooze,
	ignore: ignore,
	onDialogClosed: onDialogClosed,
	keys: KEYS
}
