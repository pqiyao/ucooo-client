import { socket } from '@/common/api.js';
import { emitChatMessage, emitChatRead, emitChatRecall } from '@/common/chatRealtime.js';

const HEARTBEAT_INTERVAL = 5000;
const AUTH_TIMEOUT = 5000;
const HEARTBEAT_TIMEOUT = 5000;
const MESSAGE_TIMEOUT = 10000;
const RECONNECT_BASE_INTERVAL = 1000;
const RECONNECT_MAX_INTERVAL = 30000;
const MAX_SEND_QUEUE_SIZE = 100;

const CONNECTION_STATE = {
	IDLE: 'idle',
	CONNECTING: 'connecting',
	AUTHENTICATING: 'authenticating',
	AUTHENTICATED: 'authenticated',
	CLOSED: 'closed'
};

class WebSocketManager {
	constructor() {
		this.socketTask = null;
		this.socketIsOpen = false;
		this.connectionState = CONNECTION_STATE.IDLE;
		this.isSocketClose = false;
		this.reconnectAttempts = 0;
		this.reconnectTimer = null;
		this.authTimeoutTimer = null;
		this.heartbeatTimer = null;
		this.heartbeatTimeoutTimer = null;
		this.msgs = { message: {} };
		this.sendQueue = [];
		this.onAuthenticated = null;
		this.init();
	}

	async init() {
		const systemInfo = await this.getSystemInfo();
		this.platform = systemInfo.platform;
	}

	getSystemInfo() {
		return new Promise((resolve) => {
			uni.getSystemInfo({
				success: (res) => resolve(res),
				fail: () => resolve({ platform: '' })
			});
		});
	}

	connectSocket(options = {}) {
		if (
			this.connectionState === CONNECTION_STATE.CONNECTING ||
			this.connectionState === CONNECTION_STATE.AUTHENTICATING ||
			this.connectionState === CONNECTION_STATE.AUTHENTICATED
		) return;
		if (typeof options.onAuthenticated === 'function') {
			this.onAuthenticated = options.onAuthenticated;
		}
		this.isSocketClose = false;
		this.clearTimers();
		this.connectionState = CONNECTION_STATE.CONNECTING;

		try {
			const socketTask = uni.connectSocket({ url: socket });
			this.socketTask = socketTask;
			this.setupEventHandlers(socketTask);
		} catch (error) {
			console.error('WebSocket connect failed:', error);
			this.scheduleReconnect();
		}
	}

	setupEventHandlers(socketTask) {
		socketTask.onOpen(() => {
			if (this.socketTask !== socketTask) return;
			this.socketIsOpen = true;
			this.connectionState = CONNECTION_STATE.AUTHENTICATING;
			this.sendAuth(true);
		});

		socketTask.onError((err) => {
			if (this.socketTask !== socketTask) return;
			console.error('WebSocket error:', err);
			this.scheduleReconnect();
		});

		socketTask.onClose(() => {
			if (this.socketTask !== socketTask) return;
			this.scheduleReconnect();
		});

		socketTask.onMessage((res) => {
			if (this.socketTask !== socketTask) return;
			this.handleMessage(res);
		});
	}

	handleMessage(res) {
		try {
			const msg = JSON.parse(res.data);
			if (msg.type === 'auth_ok') {
				if (this.connectionState !== CONNECTION_STATE.AUTHENTICATING) return;
				this.connectionState = CONNECTION_STATE.AUTHENTICATED;
				this.clearAuthTimeout();
				this.reconnectAttempts = 0;
				this.startHeartbeat();
				this.flushSendQueue();
				if (typeof this.onAuthenticated === 'function') {
					this.onAuthenticated(msg.data || {});
				}
				return;
			}
			if (msg.type === 'auth_failed' || msg.type === 'auth_required') {
				console.warn('Socket authentication rejected:', msg.type);
				this.scheduleReconnect();
				return;
			}
			if (msg.type === 'pong') {
				if (this.connectionState === CONNECTION_STATE.AUTHENTICATED) {
					this.clearHeartbeatTimeout();
				}
				return;
			}
			if (this.connectionState !== CONNECTION_STATE.AUTHENTICATED) return;
			if (msg.type === 'getOnline' && msg.data && msg.data.length) {
				uni.$emit('refMessage', msg.data);
			}
			if (msg.type === 'private_message_received' && msg.data) {
				emitChatMessage(msg.data);
			}
			if (msg.type === 'message_recalled' && msg.data) {
				emitChatRecall(msg.data);
			}
			if (msg.type === 'messages_read' && msg.data) {
				emitChatRead(msg.data);
			}
		} catch (error) {
			console.error('Socket message parse failed:', error);
		}
	}

	startHeartbeat() {
		this.clearHeartbeat();
		if (this.connectionState !== CONNECTION_STATE.AUTHENTICATED) return;
		this.heartbeatTimer = setInterval(() => {
			this.sendHeartbeat();
		}, HEARTBEAT_INTERVAL);
	}

	sendAuth(resetTimeout = false) {
		if (!this.socketIsOpen || !this.socketTask) return false;

		try {
			const conversations = uni.getStorageSync('conversationsList') || [];
			const userIds = conversations.map(item => item.userId).filter(Boolean);
			const user = uni.getStorageSync('user') || {};
			const message = {
				type: 'auth',
				uid: user.user_id || user.id || '',
				token: user.token || uni.getStorageSync('token') || '',
				user_ids: userIds.join()
			};
			this._doSend(JSON.stringify(message));
			if (resetTimeout) {
				this.clearAuthTimeout();
				this.authTimeoutTimer = setTimeout(() => {
					console.warn('Socket auth timeout, reconnecting');
					this.scheduleReconnect();
				}, AUTH_TIMEOUT);
			}
			return true;
		} catch (error) {
			console.error('Socket auth failed:', error);
			this.scheduleReconnect();
			return false;
		}
	}

	sendHeartbeat() {
		if (this.connectionState !== CONNECTION_STATE.AUTHENTICATED) return;
		if (this.heartbeatTimeoutTimer) return;
		this._doSend(JSON.stringify({ type: 'ping' }));
		this.heartbeatTimeoutTimer = setTimeout(() => {
			console.warn('Socket heartbeat timeout, reconnecting');
			this.scheduleReconnect();
		}, HEARTBEAT_TIMEOUT);
	}

	clearHeartbeat() {
		if (this.heartbeatTimer) {
			clearInterval(this.heartbeatTimer);
			this.heartbeatTimer = null;
		}
		this.clearHeartbeatTimeout();
	}

	clearHeartbeatTimeout() {
		if (this.heartbeatTimeoutTimer) {
			clearTimeout(this.heartbeatTimeoutTimer);
			this.heartbeatTimeoutTimer = null;
		}
	}

	clearAuthTimeout() {
		if (this.authTimeoutTimer) {
			clearTimeout(this.authTimeoutTimer);
			this.authTimeoutTimer = null;
		}
	}

	scheduleReconnect() {
		this.clearTimers();
		this.socketIsOpen = false;
		this.connectionState = CONNECTION_STATE.IDLE;
		const staleSocketTask = this.socketTask;
		this.socketTask = null;
		if (staleSocketTask) {
			try {
				staleSocketTask.close({});
			} catch (error) {
				console.error('Close stale WebSocket failed:', error);
			}
		}
		if (!this.isSocketClose && !this.reconnectTimer) {
			const exponentialDelay = Math.min(
				RECONNECT_MAX_INTERVAL,
				RECONNECT_BASE_INTERVAL * Math.pow(2, this.reconnectAttempts)
			);
			const reconnectDelay = Math.round(exponentialDelay * (0.8 + Math.random() * 0.4));
			this.reconnectAttempts += 1;
			this.reconnectTimer = setTimeout(() => {
				this.reconnectTimer = null;
				if (uni.getStorageSync('token')) {
					this.connectSocket();
				}
			}, reconnectDelay);
		}
	}

	closeSocket() {
		this.isSocketClose = true;
		this.clearTimers();
		this.connectionState = CONNECTION_STATE.CLOSED;
		this.reconnectAttempts = 0;
		if (this.socketTask) {
			const socketTask = this.socketTask;
			this.socketTask = null;
			try {
				socketTask.close({
					fail: (err) => console.error('Close WebSocket failed:', err)
				});
			} catch (error) {
				console.error('Close WebSocket exception:', error);
			}
		}
		this.socketIsOpen = false;
	}

	clearTimers() {
		this.clearAuthTimeout();
		this.clearHeartbeat();
		if (this.reconnectTimer) {
			clearTimeout(this.reconnectTimer);
			this.reconnectTimer = null;
		}
	}

	setMsg(message) {
		this.msgs.message = message;
	}

	send(message) {
		const messageStr = JSON.stringify(message);
		if (!this.socketTask || this.connectionState !== CONNECTION_STATE.AUTHENTICATED) {
			console.warn('WebSocket is not authenticated; queue message:', messageStr);
			this.enqueueMessage(messageStr);
			return false;
		}
		return this._doSend(messageStr);
	}

	enqueueMessage(messageStr) {
		const now = Date.now();
		this.sendQueue = this.sendQueue.filter(item => now - item.time < MESSAGE_TIMEOUT);
		if (this.sendQueue.length >= MAX_SEND_QUEUE_SIZE) {
			this.sendQueue.shift();
			console.warn('WebSocket send queue is full; drop oldest message');
		}
		this.sendQueue.push({ data: messageStr, time: now });
	}

	flushSendQueue() {
		while (
			this.connectionState === CONNECTION_STATE.AUTHENTICATED &&
			this.sendQueue.length > 0
		) {
			const { data, time } = this.sendQueue.shift();
			if (Date.now() - time < MESSAGE_TIMEOUT) {
				this._doSend(data);
			} else {
				console.warn('Drop expired socket message:', data);
			}
		}
	}

	_doSend(messageStr) {
		try {
			this.socketTask.send({ data: messageStr });
			return true;
		} catch (error) {
			console.error('Socket send failed:', error);
			return false;
		}
	}

	safeClose() {
		this.isSocketClose = true;
		this.clearTimers();
		this.connectionState = CONNECTION_STATE.CLOSED;
		this.reconnectAttempts = 0;
		this.sendQueue = [];
		this.onAuthenticated = null;

		if (this.socketTask) {
			const socketTask = this.socketTask;
			this.socketTask = null;
			try {
				socketTask.close({
					fail: (err) => console.error('WebSocket safe close failed:', err)
				});
			} catch (error) {
				console.error('WebSocket safe close exception:', error);
			}
		}
		this.socketIsOpen = false;
	}
}

const wsManager = new WebSocketManager();

export default {
	connectSocket: (options) => wsManager.connectSocket(options),
	closeSocket: () => wsManager.closeSocket(),
	send: (message) => wsManager.send(message),
	setMsg: (message) => wsManager.setMsg(message),
	safeClose: () => wsManager.safeClose(),
	msgs: wsManager.msgs
};
