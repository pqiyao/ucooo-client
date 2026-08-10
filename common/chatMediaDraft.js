const STORAGE_KEY = 'chat_pending_media_v1'
const EXPIRES_MS = 7 * 24 * 60 * 60 * 1000
const MAX_DRAFTS = 20
const MAX_BYTES = 150 * 1024 * 1024

function readDrafts() {
	try {
		const value = uni.getStorageSync(STORAGE_KEY)
		return Array.isArray(value) ? value.filter(item => item && item.id) : []
	} catch (error) {
		return []
	}
}

function writeDrafts(drafts) {
	try {
		uni.setStorageSync(STORAGE_KEY, drafts)
		return true
	} catch (error) {
		return false
	}
}

function removeSavedFile(filePath) {
	if (!filePath || typeof uni.removeSavedFile !== 'function') return
	uni.removeSavedFile({ filePath, fail() {} })
}

function prune(drafts) {
	const now = Date.now()
	const sorted = drafts.slice().sort((left, right) => Number(right.updatedAt || 0) - Number(left.updatedAt || 0))
	const kept = []
	let bytes = 0
	sorted.forEach(draft => {
		const size = Math.max(0, Number(draft.size || 0))
		const expired = now - Number(draft.updatedAt || draft.createdAt || 0) > EXPIRES_MS
		if (expired || kept.length >= MAX_DRAFTS || bytes + size > MAX_BYTES) {
			removeSavedFile(draft.savedFilePath)
			return
		}
		bytes += size
		kept.push(draft)
	})
	return kept
}

function savePermanentFile(tempFilePath) {
	if (!tempFilePath || typeof uni.saveFile !== 'function') return Promise.resolve('')
	return new Promise(resolve => {
		uni.saveFile({
			tempFilePath,
			success: result => resolve(String(result.savedFilePath || '')),
			fail: () => resolve('')
		})
	})
}

function messageClientId(message) {
	return String(message && (message.client_msg_id || message.clientMsgId || message.message_id || message.messageId || message.id) || '')
}

function localPath(file) {
	if (typeof file === 'string') return file
	return String(file && (file.path || file.tempFilePath || file.url) || '')
}

function serializablePayload(message) {
	const payload = message && message.payload
	return payload && typeof payload === 'object' ? JSON.parse(JSON.stringify(payload)) : {}
}

function hasRemotePayload(payload) {
	return /^https?:\/\//i.test(String(
		payload && (payload.url || (payload.video && payload.video.url)) || ''
	))
}

async function create(message, context = {}) {
	const clientMsgId = messageClientId(message)
	const accountId = String(context.accountId || '')
	const peerId = String(context.peerId || '')
	if (!clientMsgId || !accountId || !peerId) return null

	const originalPath = localPath(message.file)
	const savedFilePath = await savePermanentFile(originalPath)
	const payload = serializablePayload(message)
	if (!savedFilePath && !hasRemotePayload(payload)) return null
	if (savedFilePath && !hasRemotePayload(payload)) {
		if (message.type === 'image') {
			payload.url = savedFilePath
		} else if (message.type === 'video') {
			payload.video = Object.assign({}, payload.video, { url: savedFilePath })
			payload.thumbnail = Object.assign({}, payload.thumbnail, { url: savedFilePath })
		}
	}

	const now = Date.now()
	const draft = {
		id: [accountId, peerId, clientMsgId].join(':'),
		accountId,
		peerId,
		clientMsgId,
		type: message.type,
		payload,
		savedFilePath,
		size: Number(context.size || 0),
		toData: context.toData || {},
		createdAt: now,
		updatedAt: now
	}
	const drafts = readDrafts().filter(item => item.id !== draft.id)
	drafts.push(draft)
	if (!writeDrafts(prune(drafts))) {
		removeSavedFile(savedFilePath)
		return null
	}
	if (savedFilePath) message.file = savedFilePath
	message.payload = payload
	message.mediaDraftId = draft.id
	return draft
}

function update(message) {
	const id = String(message && message.mediaDraftId || '')
	if (!id) return
	const drafts = readDrafts()
	const index = drafts.findIndex(item => item.id === id)
	if (index < 0) return
	drafts[index] = Object.assign({}, drafts[index], {
		payload: serializablePayload(message),
		updatedAt: Date.now()
	})
	writeDrafts(prune(drafts))
}

function complete(messageOrId) {
	const id = typeof messageOrId === 'string'
		? messageOrId
		: String(messageOrId && messageOrId.mediaDraftId || '')
	if (!id) return
	const drafts = readDrafts()
	const removed = drafts.find(item => item.id === id)
	if (removed) removeSavedFile(removed.savedFilePath)
	writeDrafts(drafts.filter(item => item.id !== id))
}

function restore(accountId, peerId) {
	const drafts = prune(readDrafts())
	writeDrafts(drafts)
	return drafts.filter(item => String(item.accountId) === String(accountId) && String(item.peerId) === String(peerId))
}

export default { create, update, complete, restore, hasRemotePayload }
