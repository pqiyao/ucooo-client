const assert = require('assert')
const language = require('../common/languagePreference.js')

const tests = [
	['normalizes legacy language codes', () => {
		assert.strictEqual(language.toLanguageIndex('zh-cn'), 1)
		assert.strictEqual(language.toLanguageIndex('en'), 2)
	}],
	['keeps traditional Chinese regions', () => {
		assert.strictEqual(language.indexFromLocale('zh-Hant'), 0)
		assert.strictEqual(language.indexFromLocale('zh-TW'), 0)
	}],
	['uses simplified Chinese for mainland locale', () => {
		assert.strictEqual(language.indexFromLocale('zh-CN'), 1)
	}],
	['maps supported device locales', () => {
		assert.strictEqual(language.indexFromLocale('en-US'), 2)
		assert.strictEqual(language.indexFromLocale('ko-KR'), 3)
		assert.strictEqual(language.indexFromLocale('ja-JP'), 4)
	}],
	['falls back to simplified Chinese for unknown locales', () => {
		assert.strictEqual(language.indexFromLocale(''), 1)
		assert.strictEqual(language.indexFromLocale('es-ES'), 1)
	}],
	['rejects invalid stored values', () => {
		assert.strictEqual(language.toLanguageIndex(9), null)
		assert.strictEqual(language.toLanguageIndex('invalid'), null)
	}],
	['returns a stable API language code', () => {
		assert.strictEqual(language.codeForIndex(0), 'zh-hk')
		assert.strictEqual(language.codeForIndex(6), 'fr')
		assert.strictEqual(language.codeForIndex('invalid'), 'zh-cn')
	}]
]

tests.forEach(([name, run], index) => {
	run()
	console.log(`ok ${index + 1} - ${name}`)
})

console.log(`${tests.length}/${tests.length} language preference tests passed`)
