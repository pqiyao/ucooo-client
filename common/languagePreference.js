var LANGUAGE_CODES = ['zh-hk', 'zh-cn', 'en', 'ko', 'ja', 'de', 'fr']
var DEFAULT_LANGUAGE_INDEX = 1
var MIGRATION_KEY = 'language_preference_v2'

function normalizeLocale(value) {
	return String(value || '').trim().toLowerCase().replace(/_/g, '-')
}

function toLanguageIndex(value) {
	if (value === undefined || value === null || value === '') return null
	var locale = normalizeLocale(value)
	var codeIndex = LANGUAGE_CODES.indexOf(locale)
	if (codeIndex >= 0) return codeIndex

	var numeric = Number(value)
	if (!Number.isInteger(numeric) || numeric < 0 || numeric >= LANGUAGE_CODES.length) return null
	return numeric
}

function indexFromLocale(value) {
	var locale = normalizeLocale(value)
	if (!locale) return DEFAULT_LANGUAGE_INDEX
	if (locale === 'zh-hk' || locale === 'zh-tw' || locale === 'zh-mo' || locale.indexOf('zh-hant') === 0) return 0
	if (locale.indexOf('zh') === 0) return 1
	if (locale.indexOf('ko') === 0) return 3
	if (locale.indexOf('ja') === 0) return 4
	if (locale.indexOf('de') === 0) return 5
	if (locale.indexOf('fr') === 0) return 6
	if (locale.indexOf('en') === 0) return 2
	return DEFAULT_LANGUAGE_INDEX
}

function getDeviceLocale() {
	try {
		if (typeof uni !== 'undefined' && typeof uni.getLocale === 'function') return uni.getLocale()
		if (typeof uni !== 'undefined' && typeof uni.getSystemInfoSync === 'function') {
			var info = uni.getSystemInfoSync() || {}
			return info.appLanguage || info.language || ''
		}
	} catch (error) {}
	return ''
}

function ensureLanguageIndex() {
	var stored = toLanguageIndex(uni.getStorageSync('languageType'))
	var deviceIndex = indexFromLocale(getDeviceLocale())
	var index = stored === null ? deviceIndex : stored
	var manuallySelected = uni.getStorageSync('userManuallySelectedLanguage') === true
	if (!manuallySelected && !uni.getStorageSync(MIGRATION_KEY) && stored === 2 && deviceIndex !== 2) {
		// 旧版本曾把定位失败默认成英文；只修正这类旧值，不覆盖手动选择。
		index = deviceIndex
	}
	uni.setStorageSync('languageType', index)
	uni.setStorageSync(MIGRATION_KEY, true)
	return index
}

function getLanguageIndex() {
	var stored = toLanguageIndex(uni.getStorageSync('languageType'))
	return stored === null ? DEFAULT_LANGUAGE_INDEX : stored
}

function setLanguageIndex(value, manual) {
	var index = toLanguageIndex(value)
	if (index === null) index = DEFAULT_LANGUAGE_INDEX
	uni.setStorageSync('languageType', index)
	if (manual) uni.setStorageSync('userManuallySelectedLanguage', true)
	return index
}

function codeForIndex(value) {
	var index = toLanguageIndex(value)
	return LANGUAGE_CODES[index === null ? DEFAULT_LANGUAGE_INDEX : index]
}

module.exports = {
	LANGUAGE_CODES: LANGUAGE_CODES,
	DEFAULT_LANGUAGE_INDEX: DEFAULT_LANGUAGE_INDEX,
	toLanguageIndex: toLanguageIndex,
	indexFromLocale: indexFromLocale,
	ensureLanguageIndex: ensureLanguageIndex,
	getLanguageIndex: getLanguageIndex,
	setLanguageIndex: setLanguageIndex,
	codeForIndex: codeForIndex
}
