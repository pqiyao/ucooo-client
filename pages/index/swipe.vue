<template>
	<view class="swipe-page">
		<image class="swipe-bg" src="/static/home/homebg.png" mode="aspectFill"></image>
		<view class="swipe-top">
			<view class="brand-wrap">
				<image class="brand-mark" src="/static/home/xzan.png" mode="aspectFit"></image>
				<view class="brand">心动</view>
			</view>
			<view class="filter-btn" @tap="openFilter">
				<view class="filter-icon">
					<view class="filter-line"></view>
					<view class="filter-line short"></view>
					<view class="filter-line tiny"></view>
				</view>
			</view>
		</view>

		<view class="card-stage" v-if="cards.length">
			<view
				v-for="(card, index) in visibleCards"
				:key="card.user_id || card.id || index"
				class="profile-card"
				:class="{'is-top': index === 0}"
				:style="getCardStyle(index)"
				@touchstart="index === 0 && touchStart($event)"
				@touchmove.stop.prevent="index === 0 && touchMove($event)"
				@touchend="index === 0 && touchEnd()"
			>
				<view class="photo-progress">
					<view
						v-for="(item, photoIndex) in getPhotos(card)"
						:key="photoIndex"
						class="photo-bar"
						:class="{'active': photoIndex <= currentPhotoIndex}"
					></view>
				</view>

				<image class="profile-photo" :class="{'is-photo-blurred': shouldBlurPhotos}"
					:src="getPhoto(card)" mode="aspectFill" @tap.stop="nextPhoto(card)"></image>
				<view class="vip-blur-window" v-if="shouldBlurPhotos">
					<view class="vip-blur-title">VIP</view>
				</view>

				<view class="swipe-label dislike" :class="{'show': dragX < -60}">跳过</view>
				<view class="swipe-label like" :class="{'show': dragX > 60}">喜欢</view>

				<view class="card-gradient">
					<view class="person-row">
						<text class="nickname">{{ card.nickname || '未命名用户' }}</text>
						<text class="age" v-if="card.age">{{ card.age }}</text>
						<image
							v-if="card.vip_type && card.vip_type != 0"
							class="vip"
							:src="card.vip_type == 1 ? '/static/home/vip.png' : '/static/work/vip.png'"
							mode="aspectFit"
						></image>
					</view>

					<view class="online-row">
						<view class="online-dot" :class="{'off': card.on_line_text != 1}"></view>
						<text>{{ card.on_line || (card.on_line_text == 1 ? '在线' : '离线') }}</text>
					</view>

					<view class="profile-meta" v-if="card.height || card.weight || card.occupation_arr || card.country">
						<text v-if="card.height">{{ card.height }}cm</text>
						<text v-if="card.weight"> · {{ card.weight }}kg</text>
						<text v-if="card.occupation_arr"> · {{ card.occupation_arr }}</text>
						<text v-if="card.country"> · {{ card.country }}</text>
					</view>

					<view class="looking-panel" v-if="getCardIntroText(card)">
						<view class="looking-icon">🥂</view>
						<view class="looking-content">
							<view class="looking-title">{{ getBioText(card) ? 'TA的介绍' : '我想寻找' }}</view>
							<view class="looking-text">{{ getCardIntroText(card) }}</view>
						</view>
					</view>
				</view>

				<view class="detail-float" @tap.stop="openDetail(card)">
					<view class="detail-arrow"></view>
				</view>
			</view>
		</view>

		<view class="empty-state" v-else>
			<view class="empty-title">{{ getEmptyTitle() }}</view>
			<view class="empty-subtitle">{{ getEmptySubtitle() }}</view>
			<view class="reload-btn" @tap="reload">重新加载</view>
		</view>

		<view class="action-bar" v-if="cards.length">
			<view class="action-shell">
				<view class="action-btn undo" @tap="undo" aria-label="撤回">
					<image class="action-icon" src="/static/home/shuaxin.png" mode="aspectFit"></image>
				</view>
				<view class="action-btn nope" @tap="skip" aria-label="跳过">
					<image class="action-icon" src="/static/swipe/x.png" mode="aspectFit"></image>
				</view>
				<view class="action-btn star" :class="{'active': isLiked(currentCard)}" @tap="collectCard" aria-label="关注">
					<image class="action-icon" src="/static/swipe/collect.png" mode="aspectFit"></image>
				</view>
				<view class="action-btn heart" :class="{'active': isLiked(currentCard)}" @tap="like" aria-label="喜欢">
					<image class="action-icon" src="/static/swipe/heart.png" mode="aspectFit"></image>
				</view>
				<view class="action-btn chat" @tap="openChat(currentCard)" aria-label="聊天">
					<image class="action-icon" src="/static/home/sendchat.png" mode="aspectFit"></image>
				</view>
			</view>
		</view>

		<u-popup v-model="showFilter" mode="bottom" border-radius="28" height="430rpx">
			<view class="filter-panel">
				<view class="filter-title">筛选推荐</view>
				<view class="filter-section">
					<view class="filter-label">推荐类型</view>
					<view class="segment">
						<view
							class="segment-item"
							:class="{'active': draftFilterGirlSwitch === 0}"
							@tap="draftFilterGirlSwitch = 0"
						>推荐</view>
						<view
							class="segment-item"
							:class="{'active': draftFilterGirlSwitch === 1}"
							@tap="draftFilterGirlSwitch = 1"
						>女神</view>
					</view>
				</view>
				<view class="filter-actions">
					<view class="filter-cancel" @tap="closeFilter">取消</view>
					<view class="filter-confirm" @tap="applyFilter">应用筛选</view>
				</view>
			</view>
		</u-popup>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				cards: [],
				history: [],
				page: 1,
				loading: false,
				noMore: false,
				dragX: 0,
				dragY: 0,
				startX: 0,
				startY: 0,
				dragging: false,
				currentPhotoIndex: 0,
				showFilter: false,
				filterGirlSwitch: 0,
				draftFilterGirlSwitch: 0,
				loadFailed: false,
				viewerInfo: {
					is_vip: 'three',
					vip_type: 0
				},
				likedIds: [],
				seenIds: [],
				actionLocked: false
			}
		},
		computed: {
			visibleCards() {
				return this.cards.slice(0, 3)
			},
			currentCard() {
				return this.cards[0] || null
			},
			shouldBlurPhotos() {
				return !this.isVipUser(this.viewerInfo)
			}
		},
		onLoad() {
			this.loadSeenIds()
			this.reload()
		},
		onShow() {
			this.checkProfile()
		},
		methods: {
			checkProfile() {
				const user = uni.getStorageSync('user') || {}
				if (!user.token) {
					return
				}
				this.util.request('user/user_info', {
					token: user.token
				}).then(res => {
					this.viewerInfo = res || this.viewerInfo
					if (res && res.need_edit == 0) {
						uni.reLaunch({
							url: '/pages/perfect/perfect'
						})
					}
				})
			},
			reload() {
				this.page = 1
				this.cards = []
				this.history = []
				this.noMore = false
				this.loadFailed = false
				this.currentPhotoIndex = 0
				this.fetchCards()
			},
			seenStorageKey() {
				const user = uni.getStorageSync('user') || {}
				const userId = user.user_id || user.id || 'guest'
				return 'swipe_seen_' + userId + '_' + this.filterGirlSwitch
			},
			todayKey() {
				const date = new Date()
				const month = String(date.getMonth() + 1).padStart(2, '0')
				const day = String(date.getDate()).padStart(2, '0')
				return date.getFullYear() + '-' + month + '-' + day
			},
			loadSeenIds() {
				const cache = uni.getStorageSync(this.seenStorageKey()) || {}
				if (cache.date === this.todayKey() && Array.isArray(cache.ids)) {
					this.seenIds = cache.ids.map(id => Number(id)).filter(id => id > 0)
					return
				}
				this.seenIds = []
			},
			saveSeenIds() {
				const ids = this.seenIds.slice(-300)
				this.seenIds = ids
				uni.setStorageSync(this.seenStorageKey(), {
					date: this.todayKey(),
					ids
				})
			},
			rememberCards(list) {
				const ids = Array.isArray(list) ? list.map(item => Number(item && item.user_id)).filter(id => id > 0) : []
				if (!ids.length) {
					return
				}
				const merged = this.seenIds.slice()
				ids.forEach(id => {
					if (merged.indexOf(id) === -1) {
						merged.push(id)
					}
				})
				this.seenIds = merged
				this.saveSeenIds()
			},
			excludeIds() {
				const cardIds = this.cards.map(item => Number(item && item.user_id)).filter(id => id > 0)
				return Array.from(new Set(this.seenIds.concat(cardIds)))
			},
			requestWithTimeout(url, data, method, timeout = 12000) {
				return Promise.race([
					this.util.request(url, data, method),
					new Promise((resolve, reject) => {
						setTimeout(() => reject(new Error('request timeout')), timeout)
					})
				])
			},
			fetchCards() {
				if (this.loading || this.noMore) {
					return
				}
				const user = uni.getStorageSync('user') || {}
				this.loading = true
				this.loadFailed = false
				this.requestWithTimeout('friend/user_list', {
					page: 1,
					limit: 10,
					token: user.token,
					girl_switch: this.filterGirlSwitch,
					recommend_scene: 'swipe',
					exclude_ids: this.excludeIds().join(',')
				}, 'POST').then(res => {
					const list = res && res.code == 1 ? (res.data || []) : (Array.isArray(res) ? res : [])
					if (!list.length) {
						this.noMore = true
						return
					}
					const exists = this.excludeIds()
					const next = list.filter(item => exists.indexOf(Number(item.user_id)) === -1)
					if (!next.length) {
						this.noMore = list.length < 10
						return
					}
					this.cards = this.cards.concat(next)
					this.noMore = list.length < 10
				}).catch(() => {
					this.loadFailed = true
					this.util.showToast('推荐加载失败，请稍后再试')
				}).finally(() => {
					this.loading = false
				})
			},
			openFilter() {
				this.draftFilterGirlSwitch = this.filterGirlSwitch
				this.showFilter = true
			},
			closeFilter() {
				this.draftFilterGirlSwitch = this.filterGirlSwitch
				this.showFilter = false
			},
			applyFilter() {
				this.filterGirlSwitch = this.draftFilterGirlSwitch
				this.showFilter = false
				this.loadSeenIds()
				this.reload()
			},
			getEmptyTitle() {
				if (this.loading) {
					return '正在加载推荐用户'
				}
				if (this.loadFailed) {
					return '推荐加载失败'
				}
				return '暂时没有更多用户'
			},
			getEmptySubtitle() {
				if (this.loadFailed) {
					return '网络不稳定，请重新加载试试'
				}
				return '可以调整筛选条件，或者稍后再来看看'
			},
			isVipUser(user) {
				return !!(user && (user.is_vip == 'one' || Number(user.vip_type) > 0))
			},
			getPhotos(card) {
				if (!card) {
					return []
				}
				if (Array.isArray(card.avatar_arr) && card.avatar_arr.length) {
					return card.avatar_arr.map(item => {
						return typeof item === 'string' ? item : (item.image || item.url || card.avatar)
					}).filter(Boolean)
				}
				if (Array.isArray(card.photo_array) && card.photo_array.length) {
					return card.photo_array.map(item => item.image || item.url).filter(Boolean)
				}
				return card.avatar ? [card.avatar] : ['/static/home/mei.png']
			},
			getPhoto(card) {
				const photos = this.getPhotos(card)
				const index = Math.min(this.currentPhotoIndex, Math.max(photos.length - 1, 0))
				return photos[index] || '/static/home/mei.png'
			},
			nextPhoto(card) {
				const photos = this.getPhotos(card)
				if (photos.length <= 1) {
					return
				}
				this.currentPhotoIndex = (this.currentPhotoIndex + 1) % photos.length
			},
			getBioText(card) {
				if (!card || !card.bio) {
					return ''
				}
				return String(card.bio).replace(/\s+/g, ' ').trim()
			},
			getCardIntroText(card) {
				return this.getBioText(card) || this.getLookingText(card)
			},
			getLookingText(card) {
				if (!card) {
					return ''
				}
				if (Array.isArray(card.relation_array) && card.relation_array.length) {
					return card.relation_array.map(item => {
						return typeof item === 'string' ? item : (item && item.code)
					}).filter(Boolean).join('、')
				}
				if (card.relation_arr) {
					return card.relation_arr
				}
				if (card.relation) {
					return card.relation
				}
				return ''
			},
			getCardStyle(index) {
				if (index === 0) {
					const rotate = this.dragX / 18
					const transition = this.dragging ? 'none' : 'transform 0.25s ease'
					return `z-index: 10; transform: translate(${this.dragX}px, ${this.dragY}px) rotate(${rotate}deg); transition: ${transition};`
				}
				const scale = 1 - index * 0.032
				const top = index * 16
				const opacity = 1 - index * 0.18
				return `z-index: ${10 - index}; transform: translateY(${top}rpx) scale(${scale}); opacity: ${opacity};`
			},
			touchStart(event) {
				const touch = event.touches[0]
				this.startX = touch.clientX
				this.startY = touch.clientY
				this.dragging = true
			},
			touchMove(event) {
				const touch = event.touches[0]
				this.dragX = touch.clientX - this.startX
				this.dragY = touch.clientY - this.startY
			},
			touchEnd() {
				this.dragging = false
				if (this.dragX > 115) {
					this.completeSwipe('like')
					return
				}
				if (this.dragX < -115) {
					this.completeSwipe('skip')
					return
				}
				this.resetDrag()
			},
			resetDrag() {
				this.dragX = 0
				this.dragY = 0
			},
			completeSwipe(type) {
				if (this.actionLocked) {
					return
				}
				const card = this.currentCard
				if (!card) {
					this.resetDrag()
					return
				}
				if (type === 'like') {
					this.actionLocked = true
					this.follow(card, '已喜欢').then(success => {
						if (success) {
							this.advanceCard(card, type)
						} else {
							this.resetDrag()
						}
					}).finally(() => {
						this.actionLocked = false
					})
					return
				}
				this.advanceCard(card, type)
			},
			advanceCard(card, type) {
				this.rememberCards([card])
				this.history.push({
					card,
					type
				})
				this.cards.splice(0, 1)
				this.currentPhotoIndex = 0
				this.resetDrag()
				if (this.cards.length < 4) {
					this.fetchCards()
				}
			},
			skip() {
				this.completeSwipe('skip')
			},
			like() {
				this.completeSwipe('like')
			},
			collectCard() {
				if (this.actionLocked) {
					return
				}
				const card = this.currentCard
				if (!card) {
					return
				}
				this.actionLocked = true
				this.follow(card, '已关注').then(success => {
					if (success) {
						this.resetDrag()
					}
				}).finally(() => {
					this.actionLocked = false
				})
			},
			undo() {
				const last = this.history[this.history.length - 1]
				if (!last) {
					this.util.showToast('暂无可撤回的卡片')
					return
				}
				if (last.type === 'like') {
					this.util.showToast('已喜欢，不能撤回')
					return
				}
				this.history.pop()
				this.cards.unshift(last.card)
				this.currentPhotoIndex = 0
			},
			isLiked(card) {
				return !!(card && (card.have_follow == 1 || this.likedIds.indexOf(card.user_id) !== -1))
			},
			follow(card, successText) {
				if (!card) {
					return Promise.resolve(false)
				}
				if (this.isLiked(card)) {
					if (successText) {
						this.util.showToast(successText)
					}
					return Promise.resolve(true)
				}
				return this.util.request('dynamic/follow_user', {
					friend_id: card.user_id,
					only_follow: 1,
					token: uni.getStorageSync('user').token
				}, 'POST').then(res => {
					if (!res || res.code != 1) {
						this.util.showToast((res && res.msg) || '操作失败，请稍后再试')
						return false
					}
					if (this.likedIds.indexOf(card.user_id) === -1) {
						this.likedIds.push(card.user_id)
					}
					card.have_follow = '1'
					this.util.showToast(successText || '已喜欢')
					return true
				}).catch(() => {
					this.util.showToast('操作失败，请稍后再试')
					return false
				})
			},
			openDetail(card) {
				if (!card || !card.user_id) {
					return
				}
				this.rememberCards([card])
				this.util.urlTo('/pages/index/userdetail?id=' + card.user_id)
			},
			openChat(card) {
				if (!card || !card.user_id) {
					return
				}
				this.util.urlTo('/pages/chatNew/chatpage?id=' + encodeURIComponent(card.user_id))
			}
		}
	}
</script>

<style>
	.swipe-page {
		position: relative;
		min-height: 100vh;
		padding: calc(var(--status-bar-height, 0px) + 29rpx) 22rpx 132rpx;
		box-sizing: border-box;
		background: #ffffff;
		color: #181923;
		overflow: hidden;
	}

	.swipe-bg {
		position: fixed;
		left: 0;
		top: 0;
		width: 100%;
		height: 100vh;
		z-index: 0;
	}

	.swipe-top {
		position: relative;
		z-index: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		height: 90rpx;
		padding: 0 24rpx;
		box-sizing: border-box;
	}

	.brand-wrap {
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 0;
	}

	.brand-mark {
		width: 40rpx;
		height: 40rpx;
		margin-right: 10rpx;
	}

	.brand {
		font-size: 40rpx;
		font-weight: 800;
		color: #FF5F79;
		line-height: 1;
	}

	.filter-btn {
		position: absolute;
		right: 6rpx;
		top: 13rpx;
		width: 66rpx;
		height: 64rpx;
		border-radius: 50%;
		background: rgba(255,255,255,0.78);
		border: 1rpx solid rgba(255,255,255,0.94);
		box-shadow: 0 12rpx 30rpx rgba(64,78,112,0.12);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.filter-icon {
		width: 38rpx;
		height: 30rpx;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}

	.filter-line {
		position: relative;
		width: 36rpx;
		height: 5rpx;
		margin: 0;
		border-radius: 10rpx;
		background: #8C93A3;
	}

	.filter-line::after {
		content: "";
		position: absolute;
		top: -5rpx;
		width: 15rpx;
		height: 15rpx;
		border-radius: 50%;
		background: #8C93A3;
	}

	.filter-line:nth-child(1)::after {
		right: 5rpx;
	}

	.filter-line:nth-child(2)::after {
		left: 5rpx;
	}

	.filter-line:nth-child(3)::after {
		right: 13rpx;
	}

	.filter-line.short {
		width: 36rpx;
	}

	.filter-line.tiny {
		width: 36rpx;
	}

	.card-stage {
		position: relative;
		z-index: 1;
		height: calc(100vh - 444rpx);
		min-height: 700rpx;
		margin-top: 12rpx;
	}

	.profile-card {
		position: absolute;
		left: 0;
		right: 0;
		top: 0;
		height: 100%;
		border-radius: 30rpx;
		overflow: hidden;
		background: #ffffff;
		box-shadow: 0 18rpx 44rpx rgba(37,43,62,0.16);
		transform-origin: center bottom;
	}

	.profile-card.is-top {
		box-shadow: 0 22rpx 58rpx rgba(37,43,62,0.20);
	}

	.photo-progress {
		position: absolute;
		left: 24rpx;
		right: 24rpx;
		top: 18rpx;
		z-index: 5;
		display: flex;
		gap: 8rpx;
	}

	.photo-bar {
		flex: 1;
		height: 7rpx;
		border-radius: 10rpx;
		background: rgba(20,24,35,0.22);
		box-shadow: 0 0 0 1rpx rgba(255,255,255,0.18);
	}

	.photo-bar.active {
		background: #ffffff;
	}

	.profile-photo {
		width: 100%;
		height: 100%;
		display: block;
		background: #f5f5f5;
		transition: filter 0.2s ease, transform 0.2s ease;
	}

	.profile-photo.is-photo-blurred {
		filter: blur(5px);
		transform: scale(1.035);
	}

	.vip-blur-window {
		position: absolute;
		left: 50%;
		top: 34%;
		z-index: 3;
		transform: translate(-50%, -50%);
		min-width: 142rpx;
		height: 58rpx;
		padding: 0 28rpx;
		border-radius: 999rpx;
		background: rgba(255, 255, 255, 0.26);
		border: 1rpx solid rgba(255, 255, 255, 0.62);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 12rpx 30rpx rgba(20, 24, 35, 0.16);
	}

	.vip-blur-title {
		font-size: 28rpx;
		font-weight: 800;
		color: #ffffff;
		text-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.28);
	}

	.card-gradient {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		padding: 220rpx 30rpx 32rpx;
		background: linear-gradient(0deg, rgba(6,8,15,0.90) 0%, rgba(6,8,15,0.60) 50%, rgba(6,8,15,0) 100%);
		box-sizing: border-box;
	}

	.person-row {
		display: flex;
		align-items: flex-end;
		min-width: 0;
	}

	.nickname {
		max-width: 480rpx;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-size: 54rpx;
		font-weight: 800;
		line-height: 1.06;
		color: #ffffff;
	}

	.age {
		margin-left: 12rpx;
		font-size: 40rpx;
		line-height: 1.1;
		color: #ffffff;
	}

	.vip {
		width: 48rpx;
		height: 40rpx;
		margin-left: 12rpx;
		margin-bottom: 8rpx;
	}

	.online-row {
		display: flex;
		align-items: center;
		width: fit-content;
		margin-top: 16rpx;
		padding: 8rpx 16rpx;
		border-radius: 999rpx;
		background: rgba(255,255,255,0.16);
		font-size: 25rpx;
		font-weight: 700;
		color: #ffffff;
	}

	.online-dot {
		width: 14rpx;
		height: 14rpx;
		margin-right: 10rpx;
		border-radius: 50%;
		background: #08D68B;
		box-shadow: none;
	}

	.online-dot.off {
		background: #999999;
	}

	.profile-meta {
		margin-top: 12rpx;
		font-size: 24rpx;
		color: rgba(255,255,255,0.78);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.looking-panel {
		display: flex;
		align-items: flex-start;
		margin-top: 18rpx;
		margin-right: 78rpx;
		padding: 16rpx 18rpx;
		border-radius: 20rpx;
		background: rgba(255,255,255,0.12);
		border: 1rpx solid rgba(255,255,255,0.14);
	}

	.looking-icon {
		width: 54rpx;
		margin-right: 14rpx;
		font-size: 36rpx;
		line-height: 1.2;
	}

	.looking-content {
		min-width: 0;
		flex: 1;
	}

	.looking-title {
		font-size: 25rpx;
		font-weight: 700;
		color: #FFF7B1;
	}

	.looking-text {
		margin-top: 5rpx;
		font-size: 30rpx;
		font-weight: 800;
		line-height: 1.28;
		color: #FFF7B1;
		display: -webkit-box;
		overflow: hidden;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
	}

	.country {
		display: inline-flex;
		margin-top: 18rpx;
		padding: 8rpx 18rpx;
		border-radius: 999rpx;
		background: rgba(255, 255, 255, 0.18);
		font-size: 24rpx;
		color: #ffffff;
	}

	.detail-float {
		position: absolute;
		right: 30rpx;
		bottom: 38rpx;
		z-index: 4;
		width: 62rpx;
		height: 62rpx;
		border-radius: 50%;
		background: #ffffff;
		color: #000000;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 10rpx 24rpx rgba(0, 0, 0, 0.20);
	}

	.detail-arrow {
		width: 17rpx;
		height: 17rpx;
		border-top: 5rpx solid #000000;
		border-right: 5rpx solid #000000;
		transform: rotate(-45deg);
		margin-top: 8rpx;
	}

	.swipe-label {
		position: absolute;
		top: 130rpx;
		z-index: 6;
		padding: 12rpx 26rpx;
		border: 5rpx solid;
		border-radius: 16rpx;
		font-size: 38rpx;
		font-weight: 800;
		opacity: 0;
		transform: rotate(-14deg);
		background: rgba(255,255,255,0.86);
	}

	.swipe-label.show {
		opacity: 1;
	}

	.swipe-label.like {
		left: 36rpx;
		color: #08D68B;
		border-color: #08D68B;
	}

	.swipe-label.dislike {
		right: 36rpx;
		color: #FF738E;
		border-color: #FF738E;
		transform: rotate(14deg);
	}

	.action-bar {
		position: relative;
		z-index: 12;
		margin-top: 18rpx;
		padding: 0;
		box-sizing: border-box;
	}

	.action-shell {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		height: 128rpx;
		padding: 0 20rpx;
		box-sizing: border-box;
		background: transparent;
		border: 0;
		box-shadow: none;
	}

	.action-btn {
		width: 96rpx;
		height: 96rpx;
		border-radius: 50%;
		background: rgba(255,255,255,0.94);
		display: flex;
		align-items: center;
		justify-content: center;
		border: 2rpx solid rgba(255,255,255,0.86);
		box-shadow: 0 10rpx 26rpx rgba(25,31,48,0.16);
		pointer-events: auto;
	}

	.action-icon {
		width: 44rpx;
		height: 44rpx;
	}

	.action-btn.undo {
		border-color: rgba(255, 217, 86, 0.62);
	}

	.action-btn.nope {
		width: 112rpx;
		height: 112rpx;
		border-color: rgba(231, 40, 18, 0.48);
	}

	.action-btn.star {
		border-color: rgba(82, 183, 255, 0.62);
	}

	.action-btn.star.active {
		background: rgba(229, 245, 255, 0.98);
		box-shadow: 0 12rpx 28rpx rgba(82, 183, 255, 0.24);
	}

	.action-btn.heart {
		width: 112rpx;
		height: 112rpx;
		border-color: rgba(82, 183, 255, 0.62);
	}

	.action-btn.heart.active {
		background: rgba(229, 245, 255, 0.98);
		box-shadow: 0 12rpx 28rpx rgba(82, 183, 255, 0.24);
	}

	.action-btn.chat {
		border-color: rgba(90, 126, 246, 0.62);
	}

	.empty-state {
		position: relative;
		z-index: 1;
		height: calc(100vh - 350rpx);
		min-height: 720rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		color: #333333;
	}

	.empty-title {
		font-size: 34rpx;
		font-weight: 700;
	}

	.empty-subtitle {
		width: 520rpx;
		margin-top: 18rpx;
		font-size: 26rpx;
		color: #666666;
		line-height: 1.5;
	}

	.reload-btn {
		margin-top: 34rpx;
		padding: 18rpx 36rpx;
		border-radius: 999rpx;
		background: #5A7EF6;
		color: #ffffff;
		font-size: 28rpx;
		font-weight: 700;
	}

	.filter-panel {
		padding: 36rpx 32rpx;
		box-sizing: border-box;
		background: #ffffff;
		color: #181923;
	}

	.filter-title {
		font-size: 34rpx;
		font-weight: 800;
	}

	.filter-section {
		margin-top: 34rpx;
	}

	.filter-label {
		font-size: 26rpx;
		color: #626777;
	}

	.segment {
		display: flex;
		margin-top: 16rpx;
		padding: 8rpx;
		border-radius: 20rpx;
		background: #f1f3f7;
	}

	.segment-item {
		flex: 1;
		height: 72rpx;
		border-radius: 14rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 28rpx;
		font-weight: 700;
		color: #626777;
	}

	.segment-item.active {
		background: #ffffff;
		color: #FF738E;
		box-shadow: 0 8rpx 22rpx rgba(25, 28, 40, 0.08);
	}

	.filter-actions {
		display: flex;
		gap: 18rpx;
		margin-top: 34rpx;
	}

	.filter-cancel,
	.filter-confirm {
		flex: 1;
		height: 82rpx;
		border-radius: 999rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 28rpx;
		font-weight: 800;
	}

	.filter-cancel {
		background: #f1f3f7;
		color: #626777;
	}

	.filter-confirm {
		background: #5A7EF6;
		color: #ffffff;
	}
</style>
