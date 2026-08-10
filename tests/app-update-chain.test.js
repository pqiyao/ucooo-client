const assert = require('assert')
const fs = require('fs')
const path = require('path')

const frontendRoot = path.resolve(__dirname, '..')

function read(relativePath) {
	return fs.readFileSync(path.resolve(frontendRoot, relativePath), 'utf8')
}

const app = read('App.vue')
const updateService = read('common/appUpdate.js')
const updatePage = read('pages/system/app-update.vue')

const tests = [
	['APP startup installs and schedules update checks', () => {
		assert.match(app, /appUpdate\.install\(\)/)
		assert.match(app, /appUpdate\.onAppShow\(\)/)
		assert.match(updateService, /function presentRequired\(rawRelease\)\s*\{\s*if \(!isNativeApp\(\)\) return Promise\.resolve\(false\)/)
	}],
	['client opens only HTTPS update URLs in the system browser', () => {
		assert.match(updateService, /\^https:\\\/\\\//)
		assert.match(updateService, /plus\.runtime\.openURL\(url/)
	}],
	['update page supports optional and forced flows', () => {
		assert.match(updatePage, /onBackPress\(event\)/)
		assert.match(updatePage, /if \(this\.isForce\) return true/)
		assert.match(updatePage, /appUpdate\.snooze\(this\.release\)/)
		assert.match(updatePage, /appUpdate\.ignore\(this\.release\)/)
		assert.match(updatePage, /@media screen and \(max-height: 600px\)/)
		assert.match(updatePage, /orientation: landscape/)
		assert.match(updatePage, /grid-template-columns:/)
	}],
	['failed checks retry and forced navigation has fallbacks', () => {
		assert.match(updateService, /FAILED_CHECK_RETRY_INTERVAL/)
		assert.match(updateService, /policy\.shouldScheduleCheck/)
		assert.match(updateService, /uni\.redirectTo/)
		assert.match(updateService, /uni\.reLaunch/)
	}]
]

tests.forEach(([name, run], index) => {
	run()
	console.log(`ok ${index + 1} - ${name}`)
})

console.log(`${tests.length}/${tests.length} APP update chain tests passed`)
