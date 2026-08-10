const seenEvents = new Map()
const DEDUP_TTL_MS = 120000
const MAX_SEEN_EVENTS = 2000

function messageKey(message) {
	if (!message) return ''
	const id = message.message_id || message.messageId || message.id || ''
	const clientId = message.client_msg_id || message.clientMsgId || ''
	const senderId = message.from_id || message.senderId || message.fromId || ''
	return [senderId, id, clientId].join(':')
}

function acceptEvent(eventType, data) {
	const key = eventType + ':' + messageKey(Array.isArray(data) ? data[0] : data)
	if (!key || key === eventType + '::') return true

	const now = Date.now()
	const lastSeen = seenEvents.get(key) || 0
	if (lastSeen && now - lastSeen < DEDUP_TTL_MS) return false

	seenEvents.set(key, now)
	if (seenEvents.size > MAX_SEEN_EVENTS) {
		for (const [storedKey, timestamp] of seenEvents) {
			if (now - timestamp >= DEDUP_TTL_MS || seenEvents.size > MAX_SEEN_EVENTS) {
				seenEvents.delete(storedKey)
			}
			if (seenEvents.size <= MAX_SEEN_EVENTS) break
		}
	}
	return true
}

export function emitChatMessage(message) {
	if (!acceptEvent('message', message)) return false
	uni.$emit('selfChatMessage', message)
	uni.$emit('selfChatConversationRefresh', message)
	return true
}

export function emitChatRecall(messages) {
	if (!acceptEvent('recall', messages)) return false
	uni.$emit('selfChatRecalled', messages)
	uni.$emit('selfChatConversationRefresh', messages)
	return true
}

export function emitChatRead(data) {
	const conversation = data && data.conversation ? data.conversation : (data || {})
	const readerId = data && data.reader_id ? data.reader_id : conversation.reader_id
	const peerId = data && data.peer_id ? data.peer_id : conversation.peer_id
	const keyData = {
		id: [
			readerId,
			peerId,
			conversation.read_up_to_id || 0,
			conversation.read_count || 0
		].join('_'),
		from_id: readerId
	}
	if (!acceptEvent('read', keyData)) return false
	uni.$emit('selfChatRead', data)
	return true
}
