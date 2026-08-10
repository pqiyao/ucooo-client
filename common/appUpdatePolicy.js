function toInteger(value, fallback) {
	var number = Number(value)
	return isFinite(number) ? Math.max(0, Math.floor(number)) : (fallback || 0)
}

function normalizeRelease(input) {
	var raw = input && typeof input === 'object' ? input : {}
	var targetVersionCode = toInteger(raw.target_version_code, 0)
	var releaseId = toInteger(raw.release_id, 0)
	var downloadUrl = String(raw.download_url || '').trim()
	if (!raw.has_update || !releaseId || !targetVersionCode || !/^https:\/\//i.test(downloadUrl)) {
		return null
	}

	var notes = Array.isArray(raw.release_notes) ? raw.release_notes : []
	notes = notes.map(function(item) {
		return String(item || '').replace(/\s+/g, ' ').trim()
	}).filter(Boolean).slice(0, 20)

	var updateMode = raw.update_mode === 'force' ? 'force' : 'optional'
	return {
		has_update: true,
		release_id: releaseId,
		target_version_name: String(raw.target_version_name || '').trim(),
		target_version_code: targetVersionCode,
		min_supported_version_code: toInteger(raw.min_supported_version_code, 0),
		update_mode: updateMode,
		title: String(raw.title || '').trim(),
		release_notes: notes,
		download_strategy: raw.download_strategy === 'browser' ? 'browser' : 'store',
		download_url: downloadUrl,
		can_ignore: updateMode !== 'force' && raw.can_ignore === true,
		remind_after_seconds: Math.max(3600, Math.min(2592000, toInteger(raw.remind_after_seconds, 86400))),
		policy_revision: Math.max(1, toInteger(raw.policy_revision, 1)),
		package_size: toInteger(raw.package_size, 0),
		sha256: String(raw.sha256 || '').toLowerCase().trim(),
		platform: String(raw.platform || '').trim(),
		channel: String(raw.channel || '').trim()
	}
}

function matchesDecision(decision, release) {
	if (!decision || typeof decision !== 'object') return false
	return toInteger(decision.release_id, 0) === release.release_id &&
		toInteger(decision.version_code, 0) === release.target_version_code &&
		toInteger(decision.policy_revision, 0) === release.policy_revision
}

function shouldPresent(release, options) {
	var opts = options || {}
	if (!release || release.target_version_code <= toInteger(opts.currentVersionCode, 0)) {
		return { present: false, reason: 'not_newer' }
	}
	if (release.update_mode === 'force') {
		return { present: true, reason: 'force' }
	}
	if (opts.manual) {
		return { present: true, reason: 'manual' }
	}
	if (release.can_ignore && matchesDecision(opts.ignored, release)) {
		return { present: false, reason: 'ignored' }
	}
	if (matchesDecision(opts.snoozed, release) && toInteger(opts.snoozed.until, 0) > toInteger(opts.now, Date.now())) {
		return { present: false, reason: 'snoozed' }
	}
	return { present: true, reason: 'available' }
}

function shouldScheduleCheck(options) {
	var opts = options || {}
	if (opts.popupVisible || opts.checking || opts.scheduled) return false
	if (!opts.checkedThisLaunch) return true

	var now = toInteger(opts.now, Date.now())
	var lastSuccessAt = toInteger(opts.lastCheckAt, 0)
	var lastAttemptAt = toInteger(opts.lastAttemptAt, 0)
	if (!lastAttemptAt) return true

	var successInterval = Math.max(60000, toInteger(opts.successInterval, 21600000))
	var failureInterval = Math.max(30000, toInteger(opts.failureInterval, 120000))
	var reference = lastSuccessAt || lastAttemptAt
	var interval = lastSuccessAt ? successInterval : failureInterval
	return now - reference >= interval
}

module.exports = {
	normalizeRelease: normalizeRelease,
	shouldPresent: shouldPresent,
	shouldScheduleCheck: shouldScheduleCheck,
	matchesDecision: matchesDecision,
	toInteger: toInteger
}
