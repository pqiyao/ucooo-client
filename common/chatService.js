import { emitChatMessage, emitChatRead, emitChatRecall } from './chatRealtime.js'

var api = require('./api.js')
var util = require('./util.js')

function joinApiPath(base, url) {
	const cleanBase = String(base || '').replace(/\/+$/, '')
	const cleanUrl = String(url || '').replace(/^\/+/, '').replace(/^api\/+/, '')
	return cleanBase + '/' + cleanUrl
}

function request(url, data = {}) {
	return new Promise((resolve, reject) => {
		const user = uni.getStorageSync('user') || {}
		if (util.isPendingRegisterUser && util.isPendingRegisterUser(user)) {
			reject({ msg: 'pending register' })
			return
		}
		uni.request({
			url: joinApiPath(api.path, url),
			data,
			method: 'POST',
			timeout: 10000,
			header: Object.assign({
				'content-type': 'application/x-www-form-urlencoded',
				'token': user.token || uni.getStorageSync('token') || ''
			}, util.getAppRequestHeaders ? util.getAppRequestHeaders() : {}),
			success(res) {
				if (res.statusCode === 426 || (res.data && Number(res.data.code) === 426)) {
					uni.$emit('app-update-required', res.data && res.data.data ? res.data.data : {})
					reject(res.data || { code: 426, msg: 'update required' })
					return
				}
				if (res.data && String(res.data.code) === '1') {
					resolve(res.data.data)
					return
				}
				reject(res.data || { msg: 'request failed' })
			},
			fail(err) {
				reject(err)
			}
		})
	})
}

function uploadFile(file, onProgress, onTask) {
	const filePath = typeof file === 'string' ? file : (file && (file.path || file.tempFilePath || file.url))
	if (!filePath) {
		return Promise.reject(new Error('empty file path'))
	}
	return new Promise((resolve, reject) => {
		const user = uni.getStorageSync('user') || {}
		const task = uni.uploadFile({
			url: joinApiPath(api.uploadpath, 'common/upload'),
			filePath,
			name: 'file',
			timeout: 30000,
			header: util.getAppRequestHeaders ? util.getAppRequestHeaders() : {},
			formData: {
				token: user.token || uni.getStorageSync('token') || '',
				purpose: 'chat'
			},
			success(uploadFileRes) {
				try {
					const res = JSON.parse(uploadFileRes.data)
					if (uploadFileRes.statusCode === 426 || Number(res.code) === 426) {
						uni.$emit('app-update-required', res.data || {})
						reject(res)
						return
					}
					if (String(res.code) === '1') {
						const data = res.data || {}
						resolve(data.fullurl || data.url || data)
						return
					}
					reject(res)
				} catch (error) {
					reject(error)
				}
			},
			fail: reject
		})
		if (task && typeof onTask === 'function') {
			onTask(task)
		}
		if (task && typeof task.onProgressUpdate === 'function' && typeof onProgress === 'function') {
			task.onProgressUpdate(onProgress)
		}
	})
}

function getProvider() {
	return uni.getStorageSync('imProvider') || api.imProvider || 'goeasy'
}

function setProvider(provider) {
	if (['self', 'hybrid', 'goeasy'].indexOf(provider) === -1) {
		provider = 'goeasy'
	}
	uni.setStorageSync('imProvider', provider)
	return provider
}

function setGoEasyIdentity(userId) {
	const value = String(userId || '').trim()
	if (value) {
		uni.setStorageSync('goeasyUserId', value)
	} else {
		uni.removeStorageSync('goeasyUserId')
	}
	return value
}

/** 消息读写走自建 HTTP API（self / hybrid / goeasy 三种模式均如此） */
function usesSelfBackend() {
	const provider = getProvider()
	return provider === 'self' || provider === 'hybrid' || provider === 'goeasy'
}

/** 兼容旧命名：与 usesSelfBackend 相同 */
function isSelfProvider() {
	return usesSelfBackend()
}

function isGoEasyProvider() {
	return getProvider() === 'goeasy'
}

/** hybrid / goeasy 需连接 GoEasy 实时通道 */
function shouldUseGoEasyRealtime() {
	const provider = getProvider()
	return provider === 'goeasy' || provider === 'hybrid'
}

/** 仅 self / hybrid 连接自建 WebSocket */
function shouldConnectSelfWebSocket() {
	const provider = getProvider()
	return provider === 'self' || provider === 'hybrid'
}

function randomId() {
	return 'c_' + Date.now() + '_' + Math.random().toString(16).slice(2)
}

function installationId() {
	let value = String(uni.getStorageSync('imInstallationId') || '')
	if (/^[A-Za-z0-9_-]{16,80}$/.test(value)) return value
	value = 'install_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)
	uni.setStorageSync('imInstallationId', value)
	return value
}

function getInstallationId() {
	return installationId()
}

const providerAckInFlight = Object.create(null)
const providerAckRetryTimers = Object.create(null)
const providerAckRetryCounts = Object.create(null)
const providerAckConfirmed = Object.create(null)
const providerAckConfirmedAt = Object.create(null)

function providerAckKey(channel) {
	return [
		String((currentUser() || {}).user_id || (currentUser() || {}).id || ''),
		getProvider(),
		Number(uni.getStorageSync('imProviderEpoch') || 0),
		channel,
		installationId()
	].join('|')
}

function reportProviderAck(channel) {
	const provider = getProvider()
	const epoch = Number(uni.getStorageSync('imProviderEpoch') || 0)
	if (!epoch || ['self', 'goeasy'].indexOf(channel) === -1) return Promise.resolve(false)
	const ackKey = providerAckKey(channel)
	if (providerAckConfirmed[ackKey] && Date.now() - Number(providerAckConfirmedAt[ackKey] || 0) < 15000) {
		if (channel === 'goeasy') flushMessageAcks()
		return Promise.resolve(true)
	}
	if (providerAckInFlight[ackKey]) return providerAckInFlight[ackKey]
	const runtime = uni.getStorageSync('app_runtime_context') || {}
	const promise = request('chat/provider_ack', {
		provider,
		epoch,
		channel,
		installation_id: installationId(),
		realtime_id: channel === 'goeasy' ? String(uni.getStorageSync('goeasyUserId') || '') : '',
		platform: runtime.platform || (api.appType === 2 ? 'ios' : 'android'),
		app_version: runtime.version_code || api.version || runtime.version_name || api.versionName || ''
	}).then(() => {
		providerAckConfirmed[ackKey] = true
		providerAckConfirmedAt[ackKey] = Date.now()
		providerAckRetryCounts[ackKey] = 0
		if (providerAckRetryTimers[ackKey]) {
			clearTimeout(providerAckRetryTimers[ackKey])
			delete providerAckRetryTimers[ackKey]
		}
		if (channel === 'goeasy' && providerAckKey(channel) === ackKey) flushMessageAcks()
		return true
	}).catch(error => {
		console.warn('IM provider acknowledgement failed', error)
		const code = Number(error && error.code || 0)
		if (code !== 42901 && providerAckKey(channel) === ackKey && !providerAckRetryTimers[ackKey]) {
			const attempts = Math.min(Number(providerAckRetryCounts[ackKey] || 0) + 1, 6)
			providerAckRetryCounts[ackKey] = attempts
			const delay = Math.min(30000, 1000 * (2 ** (attempts - 1)))
			providerAckRetryTimers[ackKey] = setTimeout(() => {
				delete providerAckRetryTimers[ackKey]
				if (providerAckKey(channel) === ackKey) reportProviderAck(channel)
			}, delay)
		}
		return false
	}).then(result => {
		delete providerAckInFlight[ackKey]
		return result
	})
	providerAckInFlight[ackKey] = promise
	return promise
}

let messageAckTimer = null
let messageAckInFlight = false
let messageAckRetryCount = 0
let messageAckBatchLimit = 100
let goEasyPrivateListenerIm = null
let goEasyPrivateListenerEvent = null
let goEasyConversationListenerIm = null
let goEasyConversationListenerEvent = null
let goEasyConversationUnreadHandler = null
let goEasyConversationListenerIdentity = ''
let goEasyConversationRefreshTimer = null
let goEasyConversationRefreshInFlight = false
let goEasyConversationRefreshTrailing = false
let goEasyConnectKey = ''
let goEasyConnectInFlight = false
let goEasyOtp = ''
const goEasyEventVerificationInFlight = new Map()
const goEasyEventVerificationCache = new Map()
const GOEASY_EVENT_VERIFICATION_TTL_MS = 120000
const GOEASY_EVENT_REJECTION_TTL_MS = 15000
const GOEASY_EVENT_VERIFICATION_CACHE_MAX = 2000

function messageAckStorageKey() {
	const user = currentUser()
	return 'imPendingMessageAcks:' + String(user.user_id || user.id || '')
}

function setGoEasyOtp(value) {
	goEasyOtp = String(value || '')
}

function rawPendingMessageAcks(storageKey) {
	const stored = uni.getStorageSync(storageKey) || {}
	return {
		provider: String(stored.provider || ''),
		epoch: Number(stored.epoch || 0),
		ids: Array.isArray(stored.ids) ? stored.ids.map(Number).filter(id => id > 0) : []
	}
}

function loadPendingMessageAcks() {
	const provider = getProvider()
	const epoch = Number(uni.getStorageSync('imProviderEpoch') || 0)
	const stored = rawPendingMessageAcks(messageAckStorageKey())
	if (!stored.ids.length) {
		return { provider, epoch, ids: [] }
	}
	const storedUsesGoEasy = ['hybrid', 'goeasy'].indexOf(stored.provider) !== -1
	const currentUsesGoEasy = ['hybrid', 'goeasy'].indexOf(provider) !== -1
	return {
		provider,
		epoch,
		ids: storedUsesGoEasy && currentUsesGoEasy
			? stored.ids.map(Number).filter(id => id > 0)
			: []
	}
}

function savePendingMessageAcks(batch, storageKey = messageAckStorageKey()) {
	uni.setStorageSync(storageKey, {
		provider: batch.provider,
		epoch: batch.epoch,
		ids: Array.from(new Set(batch.ids.map(Number).filter(id => id > 0)))
	})
}

function scheduleMessageAck(delay) {
	if (messageAckTimer) return
	messageAckTimer = setTimeout(flushMessageAcks, Math.max(300, Number(delay || 0)))
}

function reportMessageAck(message) {
	const messageId = Number(message && (message.message_id || message.messageId || message.id) || 0)
	const user = currentUser()
	const currentUserId = String(user.user_id || user.id || '')
	const receiverId = String(message && (message.receiverId || message.to_id) || '')
	if (!messageId || message.provider !== 'goeasy' || !currentUserId || receiverId !== currentUserId) return
	const batch = loadPendingMessageAcks()
	batch.ids.push(messageId)
	savePendingMessageAcks(batch)
	scheduleMessageAck(300)
}

function flushMessageAcks() {
	messageAckTimer = null
	if (messageAckInFlight) return
	const storageKey = messageAckStorageKey()
	const batch = loadPendingMessageAcks()
	const messageIds = batch.ids.slice(0, messageAckBatchLimit)
	if (!messageIds.length || !batch.epoch || ['hybrid', 'goeasy'].indexOf(batch.provider) === -1) return
	const ackKey = providerAckKey('goeasy')
	if (!providerAckConfirmed[ackKey]) {
		reportProviderAck('goeasy')
		return
	}
	messageAckInFlight = true
	request('chat/message_ack', {
		provider: batch.provider,
		epoch: batch.epoch,
		channel: 'goeasy',
		installation_id: installationId(),
		message_ids: JSON.stringify(messageIds)
	}).then(() => {
		const current = rawPendingMessageAcks(storageKey)
		const sent = new Set(messageIds)
		current.ids = current.ids.filter(id => !sent.has(id))
		savePendingMessageAcks(current, storageKey)
		messageAckRetryCount = 0
		messageAckBatchLimit = 100
	}).catch(error => {
		const code = Number(error && error.code || 0)
		if (code === 404 && messageIds.length > 1) {
			messageAckBatchLimit = Math.max(1, Math.floor(messageIds.length / 2))
			messageAckRetryCount = 0
		} else if (code === 404 && messageIds.length === 1) {
			const current = rawPendingMessageAcks(storageKey)
			current.ids = current.ids.filter(id => id !== messageIds[0])
			savePendingMessageAcks(current, storageKey)
			messageAckBatchLimit = 100
			messageAckRetryCount = 0
		} else {
			messageAckRetryCount = Math.min(messageAckRetryCount + 1, 6)
		}
		console.warn('GoEasy message acknowledgement failed', error)
	}).then(() => {
		messageAckInFlight = false
		const current = loadPendingMessageAcks()
		if (current.ids.length) {
			const delay = messageAckRetryCount > 0 ? Math.min(30000, 1000 * (2 ** (messageAckRetryCount - 1))) : 300
			scheduleMessageAck(delay)
		}
	})
}

function handleGoEasyPrivateEvent(message) {
	const normalized = normalizeGoEasyMessage(message)
	if (!normalized) return
	verifyGoEasyEvent(normalized).then(authoritative => {
		if (!authoritative) return
		if (authoritative.__event === 'message_recalled') {
			emitChatRecall(authoritative.messages || [authoritative.message])
			return
		}
		if (authoritative.__event === 'messages_read') {
			emitChatRead(authoritative.data || authoritative)
			return
		}
		reportMessageAck(authoritative)
		emitChatMessage(authoritative)
	}).catch(error => {
		console.warn('Rejected unverified GoEasy realtime event', error)
	})
}

function bindGoEasyPrivateListener(goeasy) {
	if (!goeasy || !goeasy.im || typeof goeasy.im.on !== 'function' || !goeasy.IM_EVENT) return
	const eventName = goeasy.IM_EVENT.PRIVATE_MESSAGE_RECEIVED
	if (!eventName || (goEasyPrivateListenerIm === goeasy.im && goEasyPrivateListenerEvent === eventName)) return
	if (goEasyPrivateListenerIm && goEasyPrivateListenerEvent && typeof goEasyPrivateListenerIm.off === 'function') {
		goEasyPrivateListenerIm.off(goEasyPrivateListenerEvent, handleGoEasyPrivateEvent)
	}
	goeasy.im.on(eventName, handleGoEasyPrivateEvent)
	goEasyPrivateListenerIm = goeasy.im
	goEasyPrivateListenerEvent = eventName
}

function bindGoEasyConversationListener(goeasy, onUnread) {
	if (!goeasy || !goeasy.im || typeof goeasy.im.on !== 'function' || !goeasy.IM_EVENT) return
	const eventName = goeasy.IM_EVENT.CONVERSATIONS_UPDATED
	if (!eventName) return
	const identity = currentGoEasyConversationIdentity()
	goEasyConversationUnreadHandler = typeof onUnread === 'function' ? onUnread : null
	if (goEasyConversationListenerIm === goeasy.im
		&& goEasyConversationListenerEvent === eventName
		&& goEasyConversationListenerIdentity === identity) return
	if (goEasyConversationListenerIm && goEasyConversationListenerEvent && typeof goEasyConversationListenerIm.off === 'function') {
		goEasyConversationListenerIm.off(goEasyConversationListenerEvent, handleGoEasyConversationUpdate)
	}
	goeasy.im.on(eventName, handleGoEasyConversationUpdate)
	goEasyConversationListenerIm = goeasy.im
	goEasyConversationListenerEvent = eventName
	goEasyConversationListenerIdentity = identity
}

function handleGoEasyConversationUpdate(event) {
	const currentIdentity = currentGoEasyConversationIdentity()
	if (!goEasyConversationListenerIdentity || currentIdentity !== goEasyConversationListenerIdentity) return
	if (goEasyConversationRefreshTimer) return
	goEasyConversationRefreshTimer = setTimeout(() => {
		goEasyConversationRefreshTimer = null
		refreshAuthoritativeUnread(currentIdentity)
	}, 250)
}

function refreshAuthoritativeUnread(identity) {
	if (!identity
		|| identity !== goEasyConversationListenerIdentity
		|| identity !== currentGoEasyConversationIdentity()) return
	if (goEasyConversationRefreshInFlight) {
		goEasyConversationRefreshTrailing = true
		return
	}
	goEasyConversationRefreshInFlight = true
	request('chat/conversations', { limit: 1 }).then(data => {
		if (identity !== goEasyConversationListenerIdentity
			|| identity !== currentGoEasyConversationIdentity()) return
		if (typeof goEasyConversationUnreadHandler === 'function') {
			goEasyConversationUnreadHandler(Number(data && data.unreadTotal || 0))
		}
	}).catch(error => {
		console.warn('Failed to refresh authoritative unread total', error)
	}).then(() => {
		goEasyConversationRefreshInFlight = false
		if (goEasyConversationRefreshTrailing) {
			goEasyConversationRefreshTrailing = false
			refreshAuthoritativeUnread(goEasyConversationListenerIdentity)
		}
	})
}

function currentGoEasyConversationIdentity() {
	const user = currentUser()
	return [
		String(user.user_id || user.id || ''),
		String(uni.getStorageSync('goeasyUserId') || ''),
		String(uni.getStorageSync('imProviderEpoch') || '')
	].join('|')
}

function currentUser() {
	return uni.getStorageSync('user') || {}
}

function normalizeTo(to) {
	return {
		id: String((to && to.id) || ''),
		data: (to && to.data) || {}
	}
}

function createLocalMessage(type, payload, options = {}) {
	const user = currentUser()
	const to = normalizeTo(options.to)
	const clientMsgId = options.clientMsgId || randomId()
	return {
		id: clientMsgId,
		messageId: clientMsgId,
		clientMsgId,
		type,
		payload: payload || {},
		senderId: String(user.user_id || user.id || ''),
		receiverId: String(to.id || ''),
		timestamp: Date.now(),
		to,
		file: options.file,
		onProgress: options.onProgress,
		onUploadTask: options.onUploadTask,
		onUploaded: options.onUploaded,
		notification: options.notification
	}
}

function previewOf(message) {
	if (!message) return ''
	if (message.type === 'text') return (message.payload && message.payload.text) || ''
	if (message.type === 'image') return '[image]'
	if (message.type === 'video') return '[video]'
	if (message.type === 'liwu') return '[gift]'
	if (message.type === 'tips') return (message.payload && message.payload.tipsText) || '[tips]'
	return message.type || ''
}

function makeVideoThumbnail(url) {
	if (!url || typeof url !== 'string') {
		return ''
	}
	if (!/aliyuncs\.com|oss-cn-|x-oss-process=/i.test(url)) {
		return url
	}
	const joiner = url.indexOf('?') >= 0 ? '&' : '?'
	return url + joiner + 'x-oss-process=video/snapshot,t_1000,f_jpg,w_420,h_300'
}

async function ensureUploadedPayload(message) {
	if (!message || !message.file) {
		return message
	}
	if (message.type === 'image') {
		const url = await uploadFile(message.file, message.onProgress, message.onUploadTask)
		message.payload = { url }
		message.attachmentClaimRequired = true
		message.file = null
		if (typeof message.onUploaded === 'function') message.onUploaded(message)
		return message
	}
	if (message.type === 'video') {
		const url = await uploadFile(message.file, message.onProgress, message.onUploadTask)
		message.payload = {
			video: { url },
			thumbnail: { url: makeVideoThumbnail(url) }
		}
		message.attachmentClaimRequired = true
		message.file = null
		if (typeof message.onUploaded === 'function') message.onUploaded(message)
		return message
	}
	return message
}

function goeasyFallback(nativeIm, method, args, onFailed) {
	if (!nativeIm || typeof nativeIm[method] !== 'function') {
		if (typeof onFailed === 'function') {
			onFailed({ code: 500, content: 'IM service unavailable' })
		}
		return
	}
	return nativeIm[method].apply(nativeIm, args)
}

function createSelfAdapter(nativeIm, GoEasy) {
	const eventMap = new Map()
	const events = GoEasy && GoEasy.IM_EVENT ? GoEasy.IM_EVENT : {}
	const privateScene = GoEasy && GoEasy.IM_SCENE ? GoEasy.IM_SCENE.PRIVATE : 'private'
	let conversationsInFlight = false
	let currentConversationCallbacks = []
	let trailingConversationCallbacks = []
	const runConversationRequest = callbacks => {
		conversationsInFlight = true
		currentConversationCallbacks = callbacks
		request('chat/conversations', { limit: 200 }).then(data => {
			uni.$emit('selfChatUnreadTotal', Number(data && data.unreadTotal || 0))
			currentConversationCallbacks.forEach(item => {
				if (typeof item.onSuccess === 'function') item.onSuccess({ content: data })
			})
		}).catch(error => {
			currentConversationCallbacks.forEach(item => {
				if (typeof item.onFailed === 'function') item.onFailed(error)
			})
		}).then(() => {
			currentConversationCallbacks = []
			if (trailingConversationCallbacks.length) {
				const next = trailingConversationCallbacks
				trailingConversationCallbacks = []
				runConversationRequest(next)
				return
			}
			conversationsInFlight = false
		})
	}
	const requestLatestConversations = callbacks => {
		if (conversationsInFlight) {
			trailingConversationCallbacks.push(callbacks)
			return
		}
		runConversationRequest([callbacks])
	}
	return {
		createTextMessage(options = {}) {
			return createLocalMessage('text', { text: options.text || '' }, options)
		},
		createImageMessage(options = {}) {
			return createLocalMessage('image', {}, {
				to: options.to,
				file: options.file,
				onProgress: options.onProgress,
				onUploadTask: options.onUploadTask,
				onUploaded: options.onUploaded,
				notification: options.notification
			})
		},
		createVideoMessage(options = {}) {
			return createLocalMessage('video', {}, {
				to: options.to,
				file: options.file,
				onProgress: options.onProgress,
				onUploadTask: options.onUploadTask,
				onUploaded: options.onUploaded,
				notification: options.notification
			})
		},
		createCustomMessage(options = {}) {
			return createLocalMessage(options.type || 'custom', options.payload || {}, options)
		},
		async sendMessage({ message, onSuccess, onFailed }) {
			try {
				const clientMsgId = message.client_msg_id || message.clientMsgId || randomId()
				message.client_msg_id = clientMsgId
				message.clientMsgId = clientMsgId
				await ensureUploadedPayload(message)
				const saved = await request('chat/send', {
					to_user_id: message.receiverId,
					message_type: message.type,
					client_msg_id: clientMsgId,
					payload: JSON.stringify(message.payload || {}),
					attachment_claim_required: message.attachmentClaimRequired ? 1 : 0,
					content: previewOf(message)
				})
				Object.assign(message, saved)
				uni.$emit('selfChatConversationRefresh', message)
				if (typeof onSuccess === 'function') onSuccess(message)
			} catch (error) {
				if (typeof onFailed === 'function') onFailed(error)
			}
		},
			history({ id, lastTimestamp, beforeId, limit, onSuccess, onFailed }) {
			request('chat/history', {
				user_id: id,
				last_timestamp: lastTimestamp || 0,
				before_id: beforeId || 0,
				limit: limit || 30
			}).then((data) => {
				if (typeof onSuccess === 'function') onSuccess(data)
			}).catch((error) => {
				if (typeof onFailed === 'function') onFailed(error)
			})
		},
		sync({ id, afterId, updatedAfter, changedAfterTime, changedAfterId, changedBeforeId, syncBefore, limit, onSuccess, onFailed }) {
			request('chat/sync', {
				user_id: id,
				after_id: afterId || 0,
				updated_after: updatedAfter || 0,
				changed_after_time: changedAfterTime || 0,
				changed_after_id: changedAfterId || 0,
				changed_before_id: changedBeforeId || 0,
				sync_before: syncBefore || 0,
				limit: limit || 100
			}).then((data) => {
				if (typeof onSuccess === 'function') onSuccess(data)
			}).catch((error) => {
				if (typeof onFailed === 'function') onFailed(error)
			})
		},
		latestConversations({ onSuccess, onFailed }) {
			requestLatestConversations({ onSuccess, onFailed })
		},
		markMessageAsRead({ id, onSuccess, onFailed }) {
			request('chat/mark_read', {
				user_id: id
			}).then((data) => {
				if (Number(data && data.read_count || 0) > 0) {
					uni.$emit('selfChatConversationRefresh', data)
				}
				if (typeof onSuccess === 'function') onSuccess(data)
			}).catch((error) => {
				if (typeof onFailed === 'function') onFailed(error)
			})
		},
		recallMessage({ messages, onSuccess, onFailed }) {
			const first = messages && messages[0]
			request('chat/recall', {
				message_id: first && (first.message_id || first.messageId || first.id)
			}).then((data) => {
				uni.$emit('selfChatConversationRefresh', data)
				if (typeof onSuccess === 'function') onSuccess(data)
			}).catch((error) => {
				if (typeof onFailed === 'function') onFailed(error)
			})
		},
			on(eventName, callback) {
			if (eventName === events.PRIVATE_MESSAGE_RECEIVED) {
				uni.$on('selfChatMessage', callback)
				eventMap.set(callback, [{ type: 'uni', event: 'selfChatMessage', callback }])
				return
			}
			if (eventName === events.MESSAGE_RECALLED) {
				uni.$on('selfChatRecalled', callback)
				eventMap.set(callback, [{ type: 'uni', event: 'selfChatRecalled', callback }])
				return
			}
			if (eventName === events.CONVERSATIONS_UPDATED) {
				const wrapped = () => {
					if (wrapped.refreshTimer) clearTimeout(wrapped.refreshTimer)
					wrapped.refreshTimer = setTimeout(() => {
						wrapped.refreshTimer = null
						this.latestConversations({
							onSuccess: result => callback(result.content)
						})
					}, 300)
				}
				wrapped.cancel = () => {
					if (wrapped.refreshTimer) clearTimeout(wrapped.refreshTimer)
					wrapped.refreshTimer = null
				}
				uni.$on('selfChatConversationRefresh', wrapped)
				eventMap.set(callback, [{ type: 'uni', event: 'selfChatConversationRefresh', callback: wrapped }])
				return
			}
			goeasyFallback(nativeIm, 'on', [eventName, callback])
		},
		off(eventName, callback) {
			const mapped = eventMap.get(callback)
			if (mapped) {
				const rows = Array.isArray(mapped) ? mapped : [mapped]
				rows.forEach(item => {
					if (typeof item.callback.cancel === 'function') item.callback.cancel()
					uni.$off(item.event, item.callback)
				})
				eventMap.delete(callback)
				return
			}
			goeasyFallback(nativeIm, 'off', [eventName, callback])
		}
	}
}

function createAdapter(nativeIm, GoEasy) {
	return createSelfAdapter(nativeIm, GoEasy)
}

function normalizeGoEasyMessage(message) {
	const payload = message && message.payload && typeof message.payload === 'object' ? message.payload : {}
	const proofVersion = Number(payload.event_proof_v || 0)
	const proof = String(payload.event_proof || '')
	const event = String(payload.event || '')
	const messageId = Number(payload.message_id || 0)
	const to = message && message.to || {}
	const currentRealtimeId = String(uni.getStorageSync('goeasyUserId') || '')
	const outerReceiverId = String(to.id || message && (message.toId || message.receiverId) || '')
	if (!currentRealtimeId
		|| outerReceiverId !== currentRealtimeId
		|| proofVersion !== 1
		|| !/^[a-f0-9]{64}$/.test(proof)
		|| !messageId
		|| ['message', 'recall', 'read'].indexOf(event) === -1) return null
	const user = currentUser()
	const currentUserId = String(user.user_id || user.id || '')
	if (!currentUserId) return null
	if (event === 'recall') {
		const recalledMessage = { message_id: messageId, id: String(messageId) }
		return {
			__event: 'message_recalled',
			message: recalledMessage,
			messages: [recalledMessage],
			receiverId: currentUserId,
			event_proof_v: proofVersion,
			event_proof: proof
		}
	}
	if (event === 'read') {
		return {
			__event: 'messages_read',
			receiverId: currentUserId,
			event_proof_v: proofVersion,
			event_proof: proof,
			data: {
				conversation: { read_up_to_id: messageId }
			}
		}
	}
	return {
		id: String(messageId),
		messageId: String(messageId),
		message_id: messageId,
		receiverId: currentUserId,
		to_id: Number(currentUserId),
		provider: 'goeasy',
		event_proof_v: proofVersion,
		event_proof: proof
	}
}

function verifyGoEasyEvent(normalized) {
	const event = normalized && normalized.__event === 'message_recalled'
		? 'recall'
		: (normalized && normalized.__event === 'messages_read' ? 'read' : 'message')
	const data = normalized && normalized.data ? normalized.data : {}
	const conversation = data.conversation || {}
	const message = normalized && (normalized.message || (normalized.messages && normalized.messages[0])) || normalized || {}
	const messageId = Number(event === 'read'
		? (conversation.read_up_to_id || data.read_up_to_id || 0)
		: (message.message_id || message.messageId || message.id || 0))
	const readerId = Number(data.reader_id || conversation.reader_id || 0)
	const peerId = Number(data.peer_id || conversation.peer_id || 0)
	const proofVersion = Number(normalized && normalized.event_proof_v || 0)
	const proof = String(normalized && normalized.event_proof || '')
	if (!messageId || proofVersion !== 1 || !/^[a-f0-9]{64}$/.test(proof)) {
		return Promise.reject({ code: 404, msg: 'invalid GoEasy realtime event' })
	}
	const identity = currentGoEasyConversationIdentity()
	const key = [identity, event, messageId, proof].join('|')
	const cached = goEasyEventVerificationCache.get(key)
	if (cached && Date.now() - cached.at < (cached.rejected ? GOEASY_EVENT_REJECTION_TTL_MS : GOEASY_EVENT_VERIFICATION_TTL_MS)) {
		return cached.rejected ? Promise.reject(cached.error) : Promise.resolve(cached.value)
	}
	if (goEasyEventVerificationInFlight.has(key)) return goEasyEventVerificationInFlight.get(key)
	const promise = request('chat/realtime_event', {
		event,
		message_id: messageId,
		event_proof_v: proofVersion,
		event_proof: proof
	}).then(result => {
		if (identity !== currentGoEasyConversationIdentity()) return null
		let value = result && result.message ? Object.assign({}, result.message, { provider: 'goeasy' }) : null
		if (result && result.event === 'recall' && value) {
			value = { __event: 'message_recalled', message: value, messages: [value], receiverId: String(value.to_id || value.receiverId || '') }
		} else if (result && result.event === 'read') {
			value = { __event: 'messages_read', receiverId: String(result.peer_id || ''), data: result }
		}
		if (value) cacheGoEasyEventVerification(key, { at: Date.now(), value, rejected: false })
		return value
	}).then(value => {
		goEasyEventVerificationInFlight.delete(key)
		return value
	}, error => {
		goEasyEventVerificationInFlight.delete(key)
		cacheGoEasyEventVerification(key, { at: Date.now(), rejected: true, error })
		throw error
	})
	goEasyEventVerificationInFlight.set(key, promise)
	return promise
}

function cacheGoEasyEventVerification(key, entry) {
	goEasyEventVerificationCache.set(key, entry)
	if (goEasyEventVerificationCache.size <= GOEASY_EVENT_VERIFICATION_CACHE_MAX) return
	const now = Date.now()
	for (const [storedKey, stored] of goEasyEventVerificationCache) {
		const ttl = stored.rejected ? GOEASY_EVENT_REJECTION_TTL_MS : GOEASY_EVENT_VERIFICATION_TTL_MS
		if (now - Number(stored.at || 0) >= ttl || goEasyEventVerificationCache.size > GOEASY_EVENT_VERIFICATION_CACHE_MAX) {
			goEasyEventVerificationCache.delete(storedKey)
		}
		if (goEasyEventVerificationCache.size <= GOEASY_EVENT_VERIFICATION_CACHE_MAX) break
	}
}

function connectGoEasy(goeasy, user, onUnread) {
	const realtimeUserId = uni.getStorageSync('goeasyUserId')
	if (!goeasy || !user || !(user.user_id || user.id) || !realtimeUserId) {
		goEasyConnectKey = ''
		goEasyConnectInFlight = false
		uni.setStorageSync('imRealtimeStatus', 'disconnected')
		uni.$emit('imRealtimeState', {
			provider: 'goeasy',
			status: 'disconnected',
			code: !goeasy || !goeasy.signature ? 'config_missing' : 'identity_missing'
		})
		return
	}
	const epoch = Number(uni.getStorageSync('imProviderEpoch') || 1)
	const currentInstanceKey = () => String(goeasy.generation || 0) + '|' + String(goeasy.signature || '')
	const instanceKey = currentInstanceKey()
	const connectKey = instanceKey + '|' + String(realtimeUserId) + '|' + String(epoch)
	let connectionStatus = ''
	if (typeof goeasy.getConnectionStatus === 'function') {
		try {
			connectionStatus = String(goeasy.getConnectionStatus() || '').toLowerCase()
		} catch (error) {
			console.warn('Failed to read GoEasy connection status', error)
		}
	}
	const activeStatuses = ['connected', 'reconnected', 'connecting', 'reconnecting']
	if (goEasyConnectKey === connectKey && (goEasyConnectInFlight || activeStatuses.indexOf(connectionStatus) !== -1)) {
		bindGoEasyPrivateListener(goeasy)
		bindGoEasyConversationListener(goeasy, onUnread)
		if (connectionStatus === 'connected' || connectionStatus === 'reconnected') {
			reportProviderAck('goeasy')
		}
		return
	}
	goEasyConnectKey = connectKey
	goEasyConnectInFlight = true
	const handleConnectFailure = (error) => {
		if (goEasyConnectKey !== connectKey || currentInstanceKey() !== instanceKey) return
		goEasyConnectKey = ''
		goEasyConnectInFlight = false
		uni.hideLoading()
		uni.setStorageSync('imRealtimeStatus', 'disconnected')
		uni.$emit('imRealtimeState', {
			provider: 'goeasy',
			status: 'disconnected',
			code: String(error && error.code || '')
		})
		console.error('Failed to connect GoEasy, code:' + String(error && error.code || '') + ',error:' + String(error && (error.content || error.message) || 'unknown error'))
	}
	const options = {
		id: String(realtimeUserId),
		otp: goEasyOtp,
		data: {},
		onSuccess: () => {
			if (goEasyConnectKey !== connectKey || currentInstanceKey() !== instanceKey) return
			goEasyConnectInFlight = false
			uni.hideLoading()
			uni.setStorageSync('imRealtimeStatus', 'connected')
			uni.$emit('imRealtimeState', { provider: 'goeasy', status: 'connected' })
			reportProviderAck('goeasy')
			bindGoEasyPrivateListener(goeasy)
			bindGoEasyConversationListener(goeasy, onUnread)
		},
		onFailed: handleConnectFailure,
		onProgress: (attempts) => {
			if (goEasyConnectKey !== connectKey || currentInstanceKey() !== instanceKey) return
			uni.setStorageSync('imRealtimeStatus', 'reconnecting')
			uni.$emit('imRealtimeState', { provider: 'goeasy', status: 'reconnecting', attempts: Number(attempts || 0) })
		}
	}
	try {
		goeasy.connect(options)
	} catch (error) {
		handleConnectFailure(error)
	}
}

function connect({ goeasy, socket, push, user, onUnread }) {
	const provider = getProvider()

	if (push && typeof push.bindPushClientId === 'function') {
		push.bindPushClientId()
	}

	if (provider === 'goeasy') {
		connectGoEasy(goeasy, user, onUnread)
		return
	}

	if (shouldConnectSelfWebSocket()) {
		if (socket && typeof socket.connectSocket === 'function') {
			socket.connectSocket({
				onAuthenticated: () => reportProviderAck('self')
			})
		}
	}

	if (usesSelfBackend()) {
		request('chat/conversations', { limit: 1 }).then(data => {
			if (typeof onUnread === 'function') {
				onUnread(Number(data.unreadTotal || 0))
			}
		}).catch(() => {})
	}

	if (shouldUseGoEasyRealtime()) {
		connectGoEasy(goeasy, user, onUnread)
	}
}

export default {
	createAdapter,
	connect,
	getProvider,
	setProvider,
	setGoEasyIdentity,
	setGoEasyOtp,
	getInstallationId,
	usesSelfBackend,
	isSelfProvider,
	isGoEasyProvider,
	shouldUseGoEasyRealtime,
	shouldConnectSelfWebSocket,
	request
}
