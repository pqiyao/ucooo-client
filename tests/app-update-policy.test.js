'use strict'

const assert = require('assert')
const policy = require('../common/appUpdatePolicy.js')

function release(overrides) {
	return policy.normalizeRelease(Object.assign({
		has_update: true,
		release_id: 25,
		target_version_name: '1.3.0',
		target_version_code: 130,
		update_mode: 'optional',
		download_strategy: 'store',
		download_url: 'https://example.com/app',
		can_ignore: true,
		remind_after_seconds: 86400,
		policy_revision: 1
	}, overrides || {}))
}

const tests = [
	['rejects insecure update URLs', () => assert.strictEqual(release({ download_url: 'http://example.com/app.apk' }), null)],
	['presents a newer optional release', () => assert.strictEqual(policy.shouldPresent(release(), { currentVersionCode: 100, now: 1000 }).present, true)],
	['does not present a non-newer release', () => assert.strictEqual(policy.shouldPresent(release(), { currentVersionCode: 130, now: 1000 }).reason, 'not_newer')],
	['honors a matching snooze decision', () => assert.strictEqual(policy.shouldPresent(release(), { currentVersionCode: 100, now: 1000, snoozed: { release_id: 25, version_code: 130, policy_revision: 1, until: 2000 } }).reason, 'snoozed')],
	['honors a matching ignore decision', () => assert.strictEqual(policy.shouldPresent(release(), { currentVersionCode: 100, now: 1000, ignored: { release_id: 25, version_code: 130, policy_revision: 1 } }).reason, 'ignored')],
	['a policy revision invalidates an old ignore decision', () => assert.strictEqual(policy.shouldPresent(release({ policy_revision: 2 }), { currentVersionCode: 100, now: 1000, ignored: { release_id: 25, version_code: 130, policy_revision: 1 } }).present, true)],
	['a forced release overrides local decisions', () => assert.strictEqual(policy.shouldPresent(release({ update_mode: 'force' }), { currentVersionCode: 100, now: 1000, ignored: { release_id: 25, version_code: 130, policy_revision: 1 } }).reason, 'force')],
	['manual checks override optional local decisions', () => assert.strictEqual(policy.shouldPresent(release(), { currentVersionCode: 100, manual: true, now: 1000, ignored: { release_id: 25, version_code: 130, policy_revision: 1 } }).reason, 'manual')],
	['schedules the first check of a launch', () => assert.strictEqual(policy.shouldScheduleCheck({ checkedThisLaunch: false }), true)],
	['does not retry a recent failed check immediately', () => assert.strictEqual(policy.shouldScheduleCheck({ checkedThisLaunch: true, lastAttemptAt: 1000, now: 120000, failureInterval: 120000 }), false)],
	['retries a failed check after the backoff', () => assert.strictEqual(policy.shouldScheduleCheck({ checkedThisLaunch: true, lastAttemptAt: 1000, now: 121000, failureInterval: 120000 }), true)],
	['does not repeat a recent successful check', () => assert.strictEqual(policy.shouldScheduleCheck({ checkedThisLaunch: true, lastAttemptAt: 1000, lastCheckAt: 1000, now: 2000 }), false)],
	['rechecks after the successful-check interval', () => assert.strictEqual(policy.shouldScheduleCheck({ checkedThisLaunch: true, lastAttemptAt: 1000, lastCheckAt: 1000, now: 21601000 }), true)],
	['does not schedule while a dialog or request is active', () => {
		assert.strictEqual(policy.shouldScheduleCheck({ checkedThisLaunch: false, popupVisible: true }), false)
		assert.strictEqual(policy.shouldScheduleCheck({ checkedThisLaunch: false, checking: true }), false)
	}]
]

let passed = 0
tests.forEach(([name, test]) => {
	test()
	passed += 1
	process.stdout.write(`ok ${passed} - ${name}\n`)
})
process.stdout.write(`${passed}/${tests.length} app update policy tests passed\n`)
