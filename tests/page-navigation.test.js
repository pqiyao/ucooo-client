const assert = require('assert')
const fs = require('fs')
const path = require('path')

function readPage(relativePath) {
	return fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8')
}

const discoverPage = readPage('pages/index/index.vue')
const dynamicPage = readPage('pages/work/work.vue')
const userPage = readPage('pages/user/user.vue')
const certificationPage = readPage('pages/perfect/perfect.vue')

const tests = [
	['discover tabs share one switch handler', () => {
		assert.match(discoverPage, /change\(index\)\s*\{\s*this\.switchDiscoverTab\(index\)/)
		assert.match(discoverPage, /swiperchange\(e\)\s*\{\s*this\.switchDiscoverTab\(e\.detail\.current\)/)
		assert.match(discoverPage, /girl_switch:\s*this\.swiperCurrent/)
	}],
	['dynamic tabs share one switch handler', () => {
		assert.match(dynamicPage, /change\(index\)\s*\{\s*this\.switchDynamicTab\(index\)/)
		assert.match(dynamicPage, /swiperchange\(e\)\s*\{\s*this\.switchDynamicTab\(e\.detail\.current\)/)
		assert.match(dynamicPage, /my_follow:\s*this\.swiperCurrent/)
	}],
	['public profile statistics navigate directly', () => {
		const routes = [
			'/pages/user/focus',
			'/pages/user/dongtai',
			'/pages/user/myzan'
		]
		routes.forEach(route => assert.ok(userPage.includes(`@tap="util.urlTo('${route}')"`)))
	}],
	['fans and visitors require VIP membership', () => {
		assert.ok(userPage.includes(`@tap="openVipFeature('/pages/user/focus?current=1')"`))
		assert.ok(userPage.includes(`@tap="openVipFeature('/pages/user/whome')"`))
		assert.match(userPage, /user\.is_vip\s*==\s*'one'\s*\|\|\s*Number\(user\.vip_type\)\s*>\s*0/)
		assert.match(userPage, /openVipFeature\(url\)[\s\S]*?this\.showVip\s*=\s*true/)
		assert.match(userPage, /goVip\(\)[\s\S]*?urlTo\('\/pages\/user\/myvip'\)/)
	}],
	['certification center opens the real video review flow', () => {
		assert.match(userPage, /e\s*==\s*1[\s\S]*?urlTo\('\/pages\/perfect\/perfect\?auth=1'\)/)
		assert.doesNotMatch(userPage, /如需认证请联系客服/)
		assert.match(certificationPage, /needFaceAuth\(\)\s*\{\s*return this\.authOnly \|\|/)
		assert.match(certificationPage, /value\s*==\s*110\s*&&\s*needFaceAuth/)
	}]
]

tests.forEach(([name, run], index) => {
	run()
	console.log(`ok ${index + 1} - ${name}`)
})

console.log(`${tests.length}/${tests.length} page navigation tests passed`)
