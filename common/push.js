import util from '@/common/util.js'

const CHAT_PAGE = '/pages/chatNew/chatpage'
const state = {
	installed: false,
	binding: false,
	lastBindKey: '',
	heartbeatTimer: null,
	bindRetryTimer: null,
	foregroundInstalled: false,
	recentForegroundKeys: {},
	pendingChatUserId: '',
	navigatingToChat: false
}

const DEFAULT_MESSAGE_TEXT = '你收到一条新消息'
const FOREGROUND_DEDUP_MS = 10000
const MAX_BIND_RETRIES = 8
const CHAT_NOTIFICATION_CHANNEL_ID = 'chat_messages_high'

function getLoginUser() {
	return uni.getStorageSync('user') || {}
}

function getLoginToken(user) {
	if (util.isPendingRegisterUser && util.isPendingRegisterUser(user)) {
		return ''
	}
	return (user && user.token) || uni.getStorageSync('token') || ''
}

function normalizeClientId(clientId) {
	const value = String(clientId || '').trim()
	if (!value || value === 'null' || value === 'undefined') {
		return ''
	}
	return value
}

function detectPlatform(systemInfo = {}) {
	let osName = String(systemInfo.osName || systemInfo.platform || '').toLowerCase()
	// #ifdef APP-PLUS
	if (typeof plus !== 'undefined' && plus.os && plus.os.name) {
		osName = String(plus.os.name || '').toLowerCase()
	}
	// #endif
	if (osName.indexOf('ios') >= 0) return 'ios'
	if (osName.indexOf('android') >= 0) return 'android'
	return osName || 'unknown'
}

function normalizePayload(message) {
	let payload = message && (message.payload || message.data || message)
	if (typeof payload === 'string') {
		try {
			payload = JSON.parse(payload)
		} catch (e) {
			payload = {}
		}
	}
	return payload || {}
}

function textValue(value) {
	const text = String(value || '').replace(/\s+/g, ' ').trim()
	return text
}

function limitText(value, maxLength) {
	const text = textValue(value)
	if (!text) {
		return ''
	}
	if (text.length <= maxLength) {
		return text
	}
	return text.slice(0, Math.max(maxLength - 3, 0)) + '...'
}

function getMessageSenderId(message) {
	return String(
		(message && (message.from_id || message.sender_id || message.senderId || message.sid || message.userId)) || ''
	).trim()
}

function getMessageContent(message) {
	if (!message) {
		return DEFAULT_MESSAGE_TEXT
	}
	const type = message.message_type || message.type || ''
	const payload = normalizePayload(message.payload ? message : { payload: message.payload || message })
	if (type === 'text') {
		return limitText(message.content || payload.text, 50) || DEFAULT_MESSAGE_TEXT
	}
	if (type === 'image') return '[图片]'
	if (type === 'video') return '[视频]'
	if (type === 'gift' || type === 'liwu') return '[礼物]'
	if (type === 'tips') return limitText(message.content || payload.tipsText, 50) || '[通知]'
	return limitText(message.content || payload.text, 50) || DEFAULT_MESSAGE_TEXT
}

function findConversation(userId) {
	const id = String(userId || '')
	const list = uni.getStorageSync('conversationsList') || []
	if (!Array.isArray(list)) {
		return {}
	}
	return list.find(item => String(item.userId || item.peer_id || item.id || '') === id) || {}
}

function getMessageTitle(message) {
	const senderId = getMessageSenderId(message)
	const conversation = findConversation(senderId)
	const name = conversation.userName ||
		conversation.name ||
		(conversation.data && (conversation.data.nickname || conversation.data.name)) ||
		message.nickname ||
		message.senderName ||
		message.from_nickname ||
		message.title ||
		'新消息'
	return limitText(name, 32) || '新消息'
}

function currentRoute() {
	const pages = typeof getCurrentPages === 'function' ? getCurrentPages() : []
	const page = pages && pages.length ? pages[pages.length - 1] : null
	return page && page.route ? '/' + page.route : ''
}

function currentChatUserId() {
	const pages = typeof getCurrentPages === 'function' ? getCurrentPages() : []
	const page = pages && pages.length ? pages[pages.length - 1] : null
	if (!page || page.route !== 'pages/chatNew/chatpage') {
		return ''
	}
	const options = page.options || (page.$page && page.$page.options) || {}
	return String(options.id || '').trim()
}

function isCurrentChat(message) {
	const senderId = getMessageSenderId(message)
	const chatUserId = currentChatUserId()
	return senderId && chatUserId && senderId === chatUserId
}

function openChatFromPayload(message) {
	const payload = normalizePayload(message)
	const chatUserId = payload.chat_user_id || payload.from_id || payload.sender_id || payload.sid || payload.userId
	if (!chatUserId) {
		return
	}
	navigateToChat(chatUserId)
}

function openChatFromMessage(message) {
	const senderId = getMessageSenderId(message)
	if (!senderId) {
		return
	}
	navigateToChat(senderId)
}

function navigateToChat(userId, retry = 0) {
	const targetId = String(userId || '').trim()
	if (!targetId) {
		return
	}
	if (currentRoute() === CHAT_PAGE && currentChatUserId() === targetId) {
		state.pendingChatUserId = ''
		return
	}
	state.pendingChatUserId = targetId
	if (state.navigatingToChat) {
		return
	}
	state.navigatingToChat = true
	uni.navigateTo({
		url: CHAT_PAGE + '?id=' + encodeURIComponent(targetId),
		success: () => {
			state.navigatingToChat = false
			state.pendingChatUserId = ''
		},
		fail: () => {
			state.navigatingToChat = false
			if (retry < 5) {
				setTimeout(() => navigateToChat(targetId, retry + 1), 400 * (retry + 1))
				return
			}
			uni.reLaunch({
				url: CHAT_PAGE + '?id=' + encodeURIComponent(targetId),
				success: () => {
					state.pendingChatUserId = ''
				}
			})
		}
	})
}

function vibrateForMessage() {
	const enabled = uni.getStorageSync('messageVibrateEnabled')
	if (enabled === false || enabled === '0') {
		return
	}
	if (typeof uni.vibrateShort === 'function') {
		uni.vibrateShort({ fail: () => {} })
		return
	}
	// #ifdef APP-PLUS
	if (typeof plus !== 'undefined' && plus.device && plus.device.vibrate) {
		plus.device.vibrate(180)
	}
	// #endif
}

function showForegroundNotice(message) {
	const enabled = uni.getStorageSync('messageForegroundNoticeEnabled')
	if (enabled === false || enabled === '0') {
		return
	}
	const title = getMessageTitle(message)
	const content = getMessageContent(message)
	uni.showToast({
		title: title + '：' + content,
		icon: 'none',
		duration: 2600
	})
}

function handleForegroundChatMessage(message) {
	if (!message) {
		return
	}
	const senderId = getMessageSenderId(message)
	if (!senderId) {
		return
	}
	const messageId = message.message_id || message.messageId || message.id || ''
	const key = senderId + ':' + messageId + ':' + (message.client_msg_id || message.clientMsgId || '')
	const now = Date.now()
	Object.keys(state.recentForegroundKeys).forEach(oldKey => {
		if (now - state.recentForegroundKeys[oldKey] >= FOREGROUND_DEDUP_MS) {
			delete state.recentForegroundKeys[oldKey]
		}
	})
	if (state.recentForegroundKeys[key] && now - state.recentForegroundKeys[key] < FOREGROUND_DEDUP_MS) {
		return
	}
	state.recentForegroundKeys[key] = now
	if (isCurrentChat(message)) {
		vibrateForMessage()
		return
	}
	vibrateForMessage()
	showForegroundNotice(message)
}

function installForegroundChatHandler() {
	if (state.foregroundInstalled) {
		return
	}
	state.foregroundInstalled = true
	uni.$on('selfChatMessage', handleForegroundChatMessage)
}

function requestNotificationPermission() {
	// #ifdef APP-PLUS
	if (typeof plus !== 'undefined' && plus.os && String(plus.os.name || '').toLowerCase() === 'android') {
		const Build = plus.android.importClass('android.os.Build')
		if (Build.VERSION.SDK_INT >= 33 && plus.android.requestPermissions) {
			plus.android.requestPermissions([
				'android.permission.POST_NOTIFICATIONS'
			], () => {}, () => {})
		}
	}
	// #endif
}

function ensureAndroidNotificationChannel() {
	// #ifdef APP-PLUS
	if (typeof plus === 'undefined' || !plus.os || String(plus.os.name || '').toLowerCase() !== 'android') {
		return
	}
	try {
		const Build = plus.android.importClass('android.os.Build')
		if (Build.VERSION.SDK_INT < 26) {
			return
		}
		const main = plus.android.runtimeMainActivity()
		const Context = plus.android.importClass('android.content.Context')
		const NotificationManager = plus.android.importClass('android.app.NotificationManager')
		const NotificationChannel = plus.android.importClass('android.app.NotificationChannel')
		const manager = main.getSystemService(Context.NOTIFICATION_SERVICE)
		const channel = new NotificationChannel(
			CHAT_NOTIFICATION_CHANNEL_ID,
			'聊天消息',
			NotificationManager.IMPORTANCE_HIGH
		)
		channel.setDescription('新聊天消息、礼物和互动提醒')
		channel.enableVibration(true)
		channel.enableLights(true)
		channel.setShowBadge(true)
		manager.createNotificationChannel(channel)
	} catch (error) {}
	// #endif
}

function registerPushClickHandler() {
	// #ifdef APP-PLUS
	if (state.installed) {
		return
	}
	state.installed = true
	const hasUniPushHandler = typeof uni.onPushMessage === 'function'
	if (hasUniPushHandler) {
		uni.onPushMessage((res) => {
			if (res && res.type === 'click') {
				openChatFromPayload(res.data || res)
				return
			}
			if (res && res.type === 'receive') {
				handleForegroundChatMessage(normalizePayload(res.data || res))
			}
		})
	}
	if (!hasUniPushHandler && typeof plus !== 'undefined' && plus.push && plus.push.addEventListener) {
		plus.push.addEventListener('click', (message) => {
			openChatFromPayload(message)
		}, false)
		if (typeof uni.onPushMessage !== 'function') {
			plus.push.addEventListener('receive', (message) => {
				handleForegroundChatMessage(normalizePayload(message))
			}, false)
		}
	}
	// #endif
}

function scheduleBindRetry(retry) {
	// #ifdef APP-PLUS
	if (retry >= MAX_BIND_RETRIES) {
		return
	}
	if (state.bindRetryTimer) {
		clearTimeout(state.bindRetryTimer)
	}
	const delay = Math.min(60000, 1500 * Math.pow(2, retry))
	state.bindRetryTimer = setTimeout(() => {
		state.bindRetryTimer = null
		bindPushClientId(retry + 1)
	}, delay)
	// #endif
}

function bindPushClientId(retry = 0) {
	// #ifdef APP-PLUS
	const user = getLoginUser()
	const token = getLoginToken(user)
	if (!token || state.binding) {
		return
	}
	state.binding = true
	const finish = () => {
		state.binding = false
	}
	const submit = (clientId) => {
		clientId = normalizeClientId(clientId)
		if (!clientId) {
			finish()
			scheduleBindRetry(retry)
			return
		}
		const userId = user.user_id || user.id || ''
		const bindKey = String(userId || token || '') + ':' + clientId
		if (bindKey === state.lastBindKey) {
			finish()
			return
		}
		const systemInfo = uni.getSystemInfoSync ? uni.getSystemInfoSync() : {}
		util.request('user/bind_push_client', {
			token,
			client_id: clientId,
			platform: detectPlatform(systemInfo),
			device_model: systemInfo.model || '',
			os_name: systemInfo.osName || systemInfo.platform || '',
			os_version: systemInfo.osVersion || systemInfo.system || '',
			app_version: systemInfo.appVersion || ''
		}).then((result) => {
			if (result && result.db_saved === false) {
				finish()
				scheduleBindRetry(retry)
				return
			}
			if (state.bindRetryTimer) {
				clearTimeout(state.bindRetryTimer)
				state.bindRetryTimer = null
			}
			state.lastBindKey = bindKey
			uni.setStorageSync('pushClientId', clientId)
			finish()
			updateAppState('foreground')
		}).catch(() => {
			finish()
			scheduleBindRetry(retry)
		})
	}
	if (typeof uni.getPushClientId === 'function') {
		uni.getPushClientId({
			success: (res) => submit(res && (res.cid || res.clientid || res.clientId)),
			fail: () => {
				const info = typeof plus !== 'undefined' && plus.push ? plus.push.getClientInfo() : {}
				submit(info && (info.clientid || info.clientId || info.cid))
			}
		})
		return
	}
	const info = typeof plus !== 'undefined' && plus.push ? plus.push.getClientInfo() : {}
	submit(info && (info.clientid || info.clientId || info.cid))
	// #endif
}

function unbindPushClientId() {
	// #ifdef APP-PLUS
	const user = getLoginUser()
	const token = getLoginToken(user)
	if (state.bindRetryTimer) {
		clearTimeout(state.bindRetryTimer)
		state.bindRetryTimer = null
	}
	state.lastBindKey = ''
	if (!token) {
		return Promise.resolve()
	}
	return new Promise((resolve, reject) => {
		const submit = clientId => {
			clientId = normalizeClientId(clientId || uni.getStorageSync('pushClientId'))
			if (!clientId) {
				reject(new Error('push client id is unavailable'))
				return
			}
			const requestUnbind = attempt => util.request('user/unbind_push_client', {
				token,
				client_id: clientId
			}).then(result => {
				if (result && result.db_saved === false) {
					throw new Error('push device database update failed')
				}
				uni.removeStorageSync('pushClientId')
			}).catch(error => {
				if (attempt >= 2) {
					throw error
				}
				return new Promise(retryResolve => {
					setTimeout(retryResolve, 600 * (attempt + 1))
				}).then(() => requestUnbind(attempt + 1))
			})
			requestUnbind(0).then(resolve).catch(reject)
		}
		if (typeof uni.getPushClientId === 'function') {
			uni.getPushClientId({
				success: res => submit(res && (res.cid || res.clientid || res.clientId)),
				fail: () => {
					const info = typeof plus !== 'undefined' && plus.push ? plus.push.getClientInfo() : {}
					submit((info && (info.clientid || info.clientId || info.cid)) || uni.getStorageSync('pushClientId'))
				}
			})
			return
		}
		const info = typeof plus !== 'undefined' && plus.push ? plus.push.getClientInfo() : {}
		submit((info && (info.clientid || info.clientId || info.cid)) || uni.getStorageSync('pushClientId'))
	})
	// #endif
	// #ifndef APP-PLUS
	return Promise.resolve()
	// #endif
}

function updateAppState(appState = 'foreground') {
	// #ifdef APP-PLUS
	const user = getLoginUser()
	const token = getLoginToken(user)
	if (!token) {
		return
	}
	util.request('user/update_push_state', {
		token,
		state: appState,
		client_id: uni.getStorageSync('pushClientId') || ''
	}, 'POST').catch(() => {})
	// #endif
}

function startAppStateHeartbeat() {
	// #ifdef APP-PLUS
	stopAppStateHeartbeat(false)
	bindPushClientId()
	updateAppState('foreground')
	if (state.pendingChatUserId) {
		setTimeout(() => navigateToChat(state.pendingChatUserId), 300)
	}
	state.heartbeatTimer = setInterval(() => {
		updateAppState('foreground')
	}, 60000)
	// #endif
}

function stopAppStateHeartbeat(markBackground = true) {
	// #ifdef APP-PLUS
	if (state.heartbeatTimer) {
		clearInterval(state.heartbeatTimer)
		state.heartbeatTimer = null
	}
	if (markBackground) {
		updateAppState('background')
	}
	// #endif
}

function install() {
	ensureAndroidNotificationChannel()
	requestNotificationPermission()
	registerPushClickHandler()
	installForegroundChatHandler()
	bindPushClientId()
	startAppStateHeartbeat()
}

export default {
	install,
	bindPushClientId,
	unbindPushClientId,
	requestNotificationPermission,
	ensureAndroidNotificationChannel,
	updateAppState,
	startAppStateHeartbeat,
	stopAppStateHeartbeat,
	handleForegroundChatMessage
}
