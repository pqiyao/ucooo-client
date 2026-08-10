'use strict'

const assert = require('assert')

const storage = {
	languageType: 1,
	appChannel: 'official'
}
const navigationCalls = []

global.getApp = function() { return {} }
global.uni = {
	getStorageSync(key) { return storage[key] },
	setStorageSync(key, value) { storage[key] = value },
	removeStorageSync(key) { delete storage[key] },
	getLocale() { return 'zh-CN' },
	navigateTo(options) {
		navigationCalls.push('navigateTo')
		options.fail(new Error('page stack full'))
	},
	redirectTo(options) {
		navigationCalls.push('redirectTo')
		options.fail(new Error('redirect unavailable'))
	},
	reLaunch(options) {
		navigationCalls.push('reLaunch')
		if (typeof options.success === 'function') options.success()
	},
	showLoading() {},
	hideLoading() {},
	showToast() {},
	request() {
		throw new Error('request is not used by this test')
	},
	$on() {}
}
global.plus = {
	runtime: {
		appid: '__UNI__200F612',
		version: '1.0.2',
		versionCode: 102,
		channel: 'official',
		getProperty(appid, callback) {
			callback({ version: '1.0.2', versionCode: 102 })
		}
	}
}

const appUpdate = require('../common/appUpdate.js')

function release(versionCode) {
	return {
		has_update: true,
		release_id: 25,
		target_version_name: '1.3.0',
		target_version_code: versionCode,
		update_mode: 'force',
		download_strategy: 'browser',
		download_url: 'https://example.com/ucooo.apk',
		can_ignore: false,
		remind_after_seconds: 86400,
		policy_revision: 1
	}
}

async function run() {
	const presented = await appUpdate.presentRequired(release(130))
	assert.strictEqual(presented, true)
	await new Promise(resolve => setTimeout(resolve, 180))
	assert.deepStrictEqual(navigationCalls, ['navigateTo', 'redirectTo', 'reLaunch'])
	console.log('ok 1 - forced update navigation falls back through redirect and relaunch')

	appUpdate.onDialogClosed()
	navigationCalls.length = 0
	const olderPresented = await appUpdate.presentRequired(release(100))
	assert.strictEqual(olderPresented, false)
	await new Promise(resolve => setTimeout(resolve, 140))
	assert.deepStrictEqual(navigationCalls, [])
	console.log('ok 2 - a non-newer 426 payload cannot force an old release')
	console.log('2/2 APP update runtime tests passed')
}

run().catch(error => {
	console.error(error)
	process.exitCode = 1
})
