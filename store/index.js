import Vue from 'vue'

import Vuex from 'vuex'
Vue.use(Vuex)
import GoEasy from 'goeasy'
import push from '@/common/push.js'
import chatService from '@/common/chatService.js'
import util from '@/common/util.js'
const store = new Vuex.Store({
	state: {
		token: uni.getStorageSync('token') || '',
		user: uni.getStorageSync('user') || {},
		unreadTotal:uni.getStorageSync('unreadTotal') || '',//消息未读总数
		xieyi:uni.getStorageSync('xieyi') || '',//版权协议
	},
	mutations: {
		//设置版权
		setxieyi(state, xieyi) {
			state.xieyi = xieyi
			uni.setStorageSync('xieyi', xieyi)
		},
		//设置消息未读数
		setUnreadTotal(state, unreadTotal) {
			state.unreadTotal = unreadTotal
			uni.setStorageSync('unreadTotal', unreadTotal)
		},
		//设置用户信息
		setuser(state, user) {
			const previousId = String(state.user && (state.user.user_id || state.user.id) || '')
			const nextId = String(user && (user.user_id || user.id) || '')
			if (previousId && nextId && previousId !== nextId) {
				chatService.setGoEasyIdentity('')
				uni.removeStorageSync('imProviderEpoch')
				uni.setStorageSync('imAccountChanged', '1')
			}
			state.user = user
			uni.setStorageSync('user', user)
		},
		//设置token
		settoken(state, token) {
			state.token = token
			uni.setStorageSync('token', token)
		},
		//退出登录
		userout(state) {
			state.token = ''
			state.user = ''
			chatService.setGoEasyIdentity('')
			uni.removeStorageSync('imProviderEpoch')
			uni.removeStorageSync('user');
			uni.removeStorageSync('token');
			uni.reLaunch({
				url: '/pages/login/login'
			})
		}
	},
		actions: {
		/**
		 * 创建链接
		 * 
		 */
		imConnect({
			commit,
			state
		}) {
			const vm = this._vm
			if (vm.$imConnectPromise) return vm.$imConnectPromise
			const updateUnreadBadge = (unreadTotal) => {
				commit('setUnreadTotal', unreadTotal)
				util.syncTabBarUnreadBadge(unreadTotal)
				if (vm.GoEasy && typeof vm.GoEasy.setBadge === 'function') {
					vm.GoEasy.setBadge({
						badge: unreadTotal
					})
				}
			}
			const refreshUnread = () => {
				chatService.request('chat/conversations', { limit: 1 }).then(data => {
					updateUnreadBadge(Number(data.unreadTotal || 0))
				}).catch(() => {})
			}
			const startConnect = () => {
				if (chatService.usesSelfBackend()) {
					if (vm.$selfUnreadTotalHandler) {
						uni.$off('selfChatUnreadTotal', vm.$selfUnreadTotalHandler)
					}
					vm.$selfUnreadTotalHandler = unreadTotal => updateUnreadBadge(Number(unreadTotal || 0))
					uni.$on('selfChatUnreadTotal', vm.$selfUnreadTotalHandler)
					if (vm.$conversationPageVisibilityHandler) {
						uni.$off('selfChatConversationPageVisibility', vm.$conversationPageVisibilityHandler)
					}
					vm.$conversationPageVisibilityHandler = visible => {
						vm.$conversationPageVisible = visible === true
					}
					uni.$on('selfChatConversationPageVisibility', vm.$conversationPageVisibilityHandler)
					if (vm.$selfRefreshUnread) {
						uni.$off('selfChatConversationRefresh', vm.$selfRefreshUnread)
					}
					vm.$selfRefreshUnread = () => {
						if (vm.$conversationPageVisible) return
						if (vm.$selfUnreadTimer) clearTimeout(vm.$selfUnreadTimer)
						vm.$selfUnreadTimer = setTimeout(refreshUnread, 200)
					}
					uni.$on('selfChatConversationRefresh', vm.$selfRefreshUnread)
				}
				chatService.connect({
					goeasy: vm.$goeasy,
					socket: vm.$socket,
					push,
					user: state.user,
					onUnread: updateUnreadBadge
				})
			}
			const reconnectAfterAccountChange = () => {
				if (uni.getStorageSync('imAccountChanged') !== '1') return Promise.resolve()
				uni.removeStorageSync('imAccountChanged')
				if (vm.$socket && typeof vm.$socket.safeClose === 'function') vm.$socket.safeClose()
				if (vm.$goeasy && typeof vm.$goeasy.disconnect === 'function') vm.$goeasy.disconnect({})
				return new Promise(resolve => setTimeout(resolve, 250))
			}
			vm.$imConnectPromise = chatService.request('index/get_global_config', {
				installation_id: chatService.getInstallationId()
			}).then(data => {
				chatService.setProvider(data && data.im_realtime_provider ? data.im_realtime_provider : 'goeasy')
				chatService.setGoEasyIdentity(data && data.goeasy_user_id ? data.goeasy_user_id : '')
				chatService.setGoEasyOtp(data && data.goeasy_otp ? data.goeasy_otp : '')
				uni.setStorageSync('imProviderEpoch', Number(data && data.im_realtime_provider_epoch || 1))
				if (vm.initGoEasy && data && data.goeasy_ready && data.goeasy_client_host && data.goeasy_client_appkey) {
					vm.initGoEasy({
						host: data.goeasy_client_host,
						appkey: data.goeasy_client_appkey
					})
				} else if (vm.initGoEasy) {
					vm.initGoEasy({})
				}
			}).catch(error => {
				console.error('IM provider config failed; keep last confirmed provider and identity', error)
			}).then(reconnectAfterAccountChange).then(startConnect).then(result => {
				vm.$imConnectPromise = null
				return result
			}, error => {
				vm.$imConnectPromise = null
				throw error
			})
			return vm.$imConnectPromise
		},
		/**
		 * 前台恢复时重新读取服务端通道状态。消息仍由自建 API 读写，
		 * 这里只负责让已经打开的客户端跟随后台的通道切换。
		 */
		imRefreshProvider({ state, dispatch }) {
			const vm = this._vm
			if (!state.token || !state.user || !(state.user.user_id || state.user.id)) {
				return Promise.resolve(null)
			}
			if (vm.$imConnectPromise) {
				return vm.$imConnectPromise
			}
			if (vm.$imRefreshPromise) {
				return vm.$imRefreshPromise
			}
			const oldProvider = chatService.getProvider()
			const oldEpoch = Number(uni.getStorageSync('imProviderEpoch') || 0)
			const oldGoEasySignature = String(vm.$goeasy && vm.$goeasy.signature || '')
			vm.$imRefreshPromise = chatService.request('index/get_global_config', {
				installation_id: chatService.getInstallationId()
			}).then(data => {
				const provider = data && data.im_realtime_provider ? data.im_realtime_provider : 'goeasy'
				const identity = data && data.goeasy_user_id ? data.goeasy_user_id : ''
				const otp = data && data.goeasy_otp ? data.goeasy_otp : ''
				const epoch = Number(data && data.im_realtime_provider_epoch || 1)
				const state = data && data.im_realtime_provider_state ? data.im_realtime_provider_state : 'active'
				const goEasyOptions = vm.initGoEasy && data && data.goeasy_ready && data.goeasy_client_host && data.goeasy_client_appkey ? {
					host: data.goeasy_client_host,
					appkey: data.goeasy_client_appkey
				} : null
				const goEasySignature = goEasyOptions ? String(goEasyOptions.host) + '|' + String(goEasyOptions.appkey) : ''
				const changed = provider !== oldProvider || epoch !== oldEpoch || identity !== (uni.getStorageSync('goeasyUserId') || '') || goEasySignature !== oldGoEasySignature
				chatService.setProvider(provider)
				chatService.setGoEasyIdentity(identity)
				chatService.setGoEasyOtp(otp)
				uni.setStorageSync('imProviderEpoch', epoch)
				if (!changed && goEasyOptions) {
					vm.initGoEasy({
						host: goEasyOptions.host,
						appkey: goEasyOptions.appkey
					})
				}
				if (!changed) {
					uni.$emit('imForegroundResume', { provider, epoch, state, changed: false })
					return data
				}
				if (['self', 'hybrid'].indexOf(oldProvider) !== -1 && vm.$socket && typeof vm.$socket.safeClose === 'function') {
					vm.$socket.safeClose()
				}
				if (['goeasy', 'hybrid'].indexOf(oldProvider) !== -1 && vm.$goeasy && typeof vm.$goeasy.disconnect === 'function') {
					vm.$goeasy.disconnect({})
				}
				if (goEasyOptions) {
					vm.initGoEasy(goEasyOptions)
				} else if (vm.initGoEasy) {
					vm.initGoEasy({})
				}
				return new Promise(resolve => setTimeout(() => {
					dispatch('imConnect').then(() => {
						uni.$emit('imForegroundResume', { provider, epoch, state, changed: true })
						resolve(data)
					}).catch(() => {
						uni.$emit('imForegroundResume', { provider, epoch, state, changed: true })
						resolve(data)
					})
				}, 250))
			}).catch(error => {
				console.error('IM provider refresh failed', error)
				return null
			}).then(result => {
				vm.$imRefreshPromise = null
				return result
			})
			return vm.$imRefreshPromise
		},
		/**
		 * 退出登录
		 * 
		 */
		async userout({
			commit
		}, options = {}) {
			if (!options.skipPushUnbind) {
				await push.unbindPushClientId()
			}
			commit('userout')
			const vm = this._vm
			if (chatService.usesSelfBackend()) {
				if (vm.$selfUnreadTotalHandler) {
					uni.$off('selfChatUnreadTotal', vm.$selfUnreadTotalHandler)
					vm.$selfUnreadTotalHandler = null
				}
				if (vm.$conversationPageVisibilityHandler) {
					uni.$off('selfChatConversationPageVisibility', vm.$conversationPageVisibilityHandler)
					vm.$conversationPageVisibilityHandler = null
				}
				vm.$conversationPageVisible = false
				if (vm.$selfRefreshUnread) {
					uni.$off('selfChatConversationRefresh', vm.$selfRefreshUnread)
					vm.$selfRefreshUnread = null
				}
				if (vm.$selfUnreadTimer) {
					clearTimeout(vm.$selfUnreadTimer)
					vm.$selfUnreadTimer = null
				}
			}
			if (chatService.shouldConnectSelfWebSocket() && vm.$socket) {
				vm.$socket.safeClose()
			}
			if (chatService.shouldUseGoEasyRealtime() && vm.$goeasy) {
				vm.$goeasy.disconnect({
					onSuccess: function() {
					},
					onFailed: function(error) {
						console.error('Failed to disconnect GoEasy, code:' + error.code + ',error:' + error.content)
					}
				})
			}
			chatService.setGoEasyIdentity('')
			uni.removeStorageSync('imProviderEpoch')
			uni.removeStorageSync('imAccountChanged')
		},
	}
})
export default store
