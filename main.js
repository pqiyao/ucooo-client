import App from './App'
import uView from 'uview-ui'
Vue.use(uView)
import store from './store'
Vue.prototype.$store = store
import socket from 'utils/websocket.js'
Vue.prototype.$socket = socket;
//goeasy 的im
import GoEasy from 'goeasy'
Vue.prototype.GoEasy = GoEasy
function createGoEasy(options) {
	const opts = options || {}
	if (!opts.host || !opts.appkey) return null
	return GoEasy.getInstance({
		host: opts.host,
		appkey: opts.appkey,
		allowNotification: false,
		modules: ['im']
	})
}

const goEasyHolder = {
	instance: null,
	signature: '',
	generation: 0,
	subscriptions: new Map(),
	IM_EVENT: GoEasy.IM_EVENT,
	IM_SCENE: GoEasy.IM_SCENE,
	im: {}
}
goEasyHolder.im.on = function(eventName, callback) {
	if (!eventName || typeof callback !== 'function') return
	if (!goEasyHolder.subscriptions.has(eventName)) {
		goEasyHolder.subscriptions.set(eventName, new Set())
	}
	const callbacks = goEasyHolder.subscriptions.get(eventName)
	if (callbacks.has(callback)) return
	callbacks.add(callback)
	const im = goEasyHolder.instance && goEasyHolder.instance.im
	if (im && typeof im.on === 'function') im.on(eventName, callback)
}
goEasyHolder.im.off = function(eventName, callback) {
	const callbacks = goEasyHolder.subscriptions.get(eventName)
	if (callbacks) {
		callbacks.delete(callback)
		if (!callbacks.size) goEasyHolder.subscriptions.delete(eventName)
	}
	const im = goEasyHolder.instance && goEasyHolder.instance.im
	if (im && typeof im.off === 'function') im.off(eventName, callback)
}
const imMethods = ['history', 'latestConversations', 'markMessageAsRead', 'recallMessage']
imMethods.forEach(method => {
	goEasyHolder.im[method] = function(...args) {
		const im = goEasyHolder.instance && goEasyHolder.instance.im
		if (im && typeof im[method] === 'function') {
			return im[method](...args)
		}
	}
})
;['connect', 'disconnect', 'setBadge', 'getConnectionStatus'].forEach(method => {
	goEasyHolder[method] = function(...args) {
		const instance = goEasyHolder.instance
		if (instance && typeof instance[method] === 'function') {
			if (method === 'disconnect') goEasyHolder.generation += 1
			return instance[method](...args)
		}
		const options = args[0] || {}
		if (options && typeof options.onFailed === 'function') {
			options.onFailed({ code: 503, content: 'GoEasy is not configured' })
		}
	}
})

Vue.prototype.$goeasy = goEasyHolder
Vue.prototype.initGoEasy = function(options) {
	const opts = options || {}
	const signature = String(opts.host || '') + '|' + String(opts.appkey || '')
	if (goEasyHolder.instance && goEasyHolder.signature === signature) return goEasyHolder
	const previous = goEasyHolder.instance
	const next = createGoEasy(opts)
	if (previous && previous.im && typeof previous.im.off === 'function') {
		goEasyHolder.subscriptions.forEach((callbacks, eventName) => {
			callbacks.forEach(callback => previous.im.off(eventName, callback))
		})
	}
	if (previous && typeof previous.disconnect === 'function') previous.disconnect({})
	goEasyHolder.instance = next
	goEasyHolder.signature = next ? signature : ''
	goEasyHolder.generation += 1
	if (next && next.im && typeof next.im.on === 'function') {
		goEasyHolder.subscriptions.forEach((callbacks, eventName) => {
			callbacks.forEach(callback => next.im.on(eventName, callback))
		})
	}
	return goEasyHolder
}

// #ifdef APP-PLUS
GoEasy.onClickNotification((payload) => {
	const body = payload && payload.message ? payload.message : payload
	const targetId = body && (body.from_id || body.sender_id || body.sid || body.senderId || body.userId || body.fromId)
	if (!targetId) {
		return
	}
	uni.navigateTo({
		url: '/pages/chatNew/chatpage?id=' + encodeURIComponent(targetId)
	})
})
// #endif

// 封装方法
import util from '@/common/util.js';
Vue.prototype.util = util;
util.installAuthGuard();
Vue.mixin({
  onShow() {
    util.requireLogin();
	util.syncTabBarUnreadBadge(store.state.unreadTotal);
  }
});
var api = require('common/api.js');
//自动拼接图片主域名
Vue.prototype.$getimgsrc = function(url){
	let urlk = url;
	let str = RegExp('http');
	let newUrl;
	//通过三元运算符进行判断该图片是否含有http域名，没有就拼接上去
	str.test(urlk) ? newUrl = urlk : newUrl = api.img_url + urlk;
	const urls = newUrl
	return urls
}
Vue.prototype.$getimgsrc = util.normalizeImageUrl
// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
  ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
export function createApp() {
  const app = createSSRApp(App)
  return {
    app
  }
}
// #endif
