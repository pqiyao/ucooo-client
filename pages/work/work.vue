<template>
	<view class="work-page">
		<view class="wrap">
			<view class="">

				<view class="u-tabs-box work-topbar"
					style="display: flex;align-items: center;justify-content: space-between;margin: 0 32rpx;padding-top: 10rpx;">
					<view class="" style="width: 350rpx;">
						<u-tabs-swiper activeColor="#333333" ref="tabs" :list="list" :current="current" @change="change"
							:is-scroll="false" bg-color=""></u-tabs-swiper>
					</view>
					<view class="" style="display: flex;align-items: center;">
						<view class="work-icon-btn" @tap="util.urlTo('/pages/index/sousuo')">
							<image src="/static/work/suosou.png" mode="" style="width: 35rpx;height: 35rpx;">
							</image>
						</view>
						<view class="work-icon-btn work-add-box" @tap="getadd">
							<image src="/static/work/add.png" mode="" class="work-add-icon">
							</image>
						</view>
					</view>


				</view>



			</view>

		</view>
		<view class="new-dynamic-tip" v-if="hasNewDynamic" @tap="refreshToLatest">
			有新动态
		</view>


			<view class="" id="box">

			</view>



		<swiper class="swiper-box" :current="swiperCurrent" @transition="transition" @animationfinish="animationfinish"
			@change="swiperchange" :style="{height:boxHeight+'px'}">
			<swiper-item class="swiper-item">
				<scroll-view scroll-y style="height: 100%;width: 100%;" :scroll-top="scrollTop"
					@scroll="handleScroll" @scrolltolower="reachBottomGuanZhu">
					<view class="page-box">
						<view class="banner-box" style="padding: 29rpx;" v-if="list1.length">
							<u-swiper :list="list1" height="330"></u-swiper>
						</view>
						<!-- 动态 -->
						<view class="dynamic-card" style="border-bottom: 1rpx solid #F5F5F5;" v-for="(i,k) in greatlist" :key="k"
							@tap="lookdetail(i.id)">
							<view class="dynamic-head"
								style="display: flex;align-items: center;justify-content: space-between;padding: 28rpx 24rpx;">
								<view class="author-line" style="display: flex;align-items: center;">
									<image :src="i.avatar" mode="aspectFill"
										class="author-avatar" style="width: 110rpx;height: 110rpx;border-radius: 50%;">
									</image>
									<view class="author-name" style="font-size: 30rpx;font-weight: bold;margin-left: 14rpx;">
										{{i.nickname}}
									</view>
									<view class="gender-pill"
										style="width: 67rpx;height: 30rpx;background: #fff;border-radius: 15rpx;font-size: 21rpx;display: flex;align-items: center;justify-content: center;margin-left: 6rpx;"
										:style="{color:i.gender==2 ? '#FF738E' : '#56A0FF'}">
										<image
											:src="i.gender==2 ? '/static/home/nv.png' : '/static/home/nan.png'"
											mode="" style="width: 24rpx;height: 24rpx;margin-right: 5rpx;"></image>
										<text>{{i.age}}</text>
									</view>
									<image src="/static/work/ren.png" mode=""
										style="width: 80rpx;height: 30rpx;margin-left: 12rpx;" v-if="i.is_auth==1">
									</image>
									<image src="/static/work/vip.png" mode=""
										style="width: 47rpx;height: 42rpx;padding-left: 5rpx;" v-if="i.is_vip=='one'">
									</image>
								</view>
								<view class="btn" v-if="!isOwnDynamic(i.user_id)" @tap.stop="gz(i.user_id,k)">
									{{i.is_follow==0 ? '+'+allText.首页.关注 : allText.首页.已关注}}
								</view>
							</view>
							<view class="dynamic-text" style="padding: 0 26rpx 10rpx 26rpx;font-size: 28rpx;">
								{{i.content}}
							</view>
							<view class="media-grid" style="display: flex;align-items: center;flex-wrap: wrap;margin: 0 25rpx;"
								v-if="i.have_source==1">
								
								<view class="media-item" style="text-align: center;margin-top: 10rpx;"
									v-for="(m,n) in i.img_list" :key="n" @tap.stop="lookImg(i.img_list,n)">
									<image :src="m.image" mode="aspectFill" :class="i.img_list.length==1 ? 'image-check2' : i.img_list.length==2 ? 'image-check1' : 'image-check'" style="margin-right: 15rpx;"
										>
									</image>
								</view>
							</view>
							<view class="video-list"
								style="display: flex;align-items: center;"
								v-if="i.have_source==2">
								<view class="video-card" style="width: 420rpx;height: 508rpx;margin: 22rpx 29rpx;border-radius: 15rpx;overflow: hidden;position: relative;"
								 v-for="(v,k) in i.img_list" :key="k">
									<image :src="v.image+'?x-oss-process=video/snapshot,t_1000,f_jpg,w_420,h_300'" mode="aspectFill" style="width: 100%;height: 100%;"></image>
									<image src="/static/home/bo.png" mode="" style="width: 86rpx;height: 86rpx;position: absolute;top: 50%;left: 50%;margin-top: -43rpx;margin-left: -43rpx;">
									</image>
								</view>
							</view>
							<view class="dynamic-actions"
								style="display: flex;align-items: center;justify-content: space-between;padding: 33rpx 37rpx;">
								<view class="action-left" style="display: flex;align-items: center;">
									<view class="action-item" style="display: flex;align-items: center;font-size: 26rpx;"
										@tap.stop="zan(i.id,k)">
										<image
											:src="i.is_zan==0 ? '/static/home/zan.png' : '/static/home/xzan.png'"
											mode="" style="width: 30rpx;height: 30rpx;"></image>
										<view class="" style="padding-left: 10rpx;">
											{{i.great_num}}
										</view>
									</view>
									<view class="action-item"
										style="display: flex;align-items: center;font-size: 26rpx;margin-left: 64rpx;">
										<image src="/static/home/edits.png" mode=""
											style="width: 30rpx;height: 30rpx;"></image>
										<view class="" style="padding-left: 10rpx;">
											{{i.comments_num}}
										</view>
									</view>
								</view>
								<view class="chat-action" v-if="!isOwnDynamic(i.user_id)" style="font-size: 26rpx;display: flex;align-items: center;" @tap.stop="gochat(i.user_id)">
									<image src="/static/home/sendchat.png" mode=""
										style="width: 32rpx;height: 32rpx;"></image>
									<view class="" style="padding-left: 13rpx;">
										{{allText.首页.发消息}}
									</view>
								</view>
							</view>
						</view>

					</view>
				</scroll-view>
			</swiper-item>


			<swiper-item class="swiper-item">
				<scroll-view scroll-y style="height: 100%;width: 100%;" :scroll-top="scrollTop"
					@scroll="handleScroll" @scrolltolower="reachBottomGuanZhu">
					<view class="page-box">
						<view class="banner-box" style="padding: 29rpx;" v-if="list1.length">
							<u-swiper :list="list1" height="330"></u-swiper>
						</view>
						<!-- 动态 -->
						<view class="dynamic-card" style="border-bottom: 1rpx solid #F5F5F5;" v-for="(i,k) in greatlist" :key="k"
							@tap="lookdetail(i.id)">
							<view class="dynamic-head"
								style="display: flex;align-items: center;justify-content: space-between;padding: 28rpx 24rpx;">
								<view class="author-line" style="display: flex;align-items: center;">
									<image :src="i.avatar" mode="aspectFill"
										class="author-avatar" style="width: 110rpx;height: 110rpx;border-radius: 50%;">
									</image>
									<view class="author-name" style="font-size: 30rpx;font-weight: bold;margin-left: 14rpx;">
										{{i.nickname}}
									</view>
									<view class="gender-pill"
										style="width: 67rpx;height: 30rpx;background: #fff;border-radius: 15rpx;font-size: 21rpx;display: flex;align-items: center;justify-content: center;margin-left: 6rpx;"
										:style="{color:i.gender==2 ? '#FF738E' : '#56A0FF'}">
										<image
											:src="i.gender==2 ? '/static/home/nv.png' : '/static/home/nan.png'"
											mode="" style="width: 24rpx;height: 24rpx;margin-right: 5rpx;"></image>
										<text>{{i.age}}</text>
									</view>
									<image src="/static/work/ren.png" mode=""
										style="width: 80rpx;height: 30rpx;margin-left: 12rpx;" v-if="i.is_auth==1">
									</image>
									<image src="/static/work/vip.png" mode=""
										style="width: 47rpx;height: 42rpx;padding-left: 5rpx;" v-if="i.is_vip=='one'">
									</image>
								</view>
								<view class="btn" v-if="!isOwnDynamic(i.user_id)" @tap.stop="gz(i.user_id,k)">
									{{i.is_follow==0 ? '+'+allText.首页.关注 : allText.首页.已关注}}
								</view>
							</view>
							<view class="dynamic-text" style="padding: 0 26rpx 10rpx 26rpx;font-size: 28rpx;">
								{{i.content}}
							</view>
							<view class="media-grid" style="display: flex;align-items: center;flex-wrap: wrap;margin: 0 25rpx;"
								v-if="i.have_source==1">
								<view class="media-item" style="text-align: center;margin-top: 10rpx;"
									v-for="(m,n) in i.img_list" :key="n" @tap="lookImg(i.img_list,n)">
									<image :src="m.image" mode="aspectFill"
										:class="i.img_list.length==1 ? 'image-check2' : i.img_list.length==2 ? 'image-check1' : 'image-check'" style="margin-right: 15rpx;">
									</image>
								</view>
							</view>
							<view class="video-card"
								style="width: 420rpx;height: 508rpx;background: url(/static/home/mei.png) no-repeat;background-size: 100% 100%;border-radius: 20rpx;display: flex;align-items: center;justify-content: center;margin: 22rpx 29rpx;"
								v-if="i.have_source==2">
								<image src="/static/home/bo.png" mode="" style="width: 86rpx;height: 86rpx;">
								</image>
							</view>
							<view class="dynamic-actions"
								style="display: flex;align-items: center;justify-content: space-between;padding: 33rpx 37rpx;">
								<view class="action-left" style="display: flex;align-items: center;">
									<view class="action-item" style="display: flex;align-items: center;font-size: 26rpx;"
										@tap.stop="zan(i.id,k)">
										<image
											:src="i.is_zan==0 ? '/static/home/zan.png' : '/static/home/xzan.png'"
											mode="" style="width: 30rpx;height: 30rpx;"></image>
										<view class="" style="padding-left: 10rpx;">
											{{i.great_num}}
										</view>
									</view>
									<view class="action-item"
										style="display: flex;align-items: center;font-size: 26rpx;margin-left: 64rpx;">
										<image src="/static/home/edits.png" mode=""
											style="width: 30rpx;height: 30rpx;"></image>
										<view class="" style="padding-left: 10rpx;">
											{{i.comments_num}}
										</view>
									</view>
								</view>
								<view class="chat-action" v-if="!isOwnDynamic(i.user_id)" style="font-size: 26rpx;display: flex;align-items: center;" @tap.stop="gochat(i.user_id)">
									<image src="/static/home/sendchat.png" mode=""
										style="width: 32rpx;height: 32rpx;"></image>
									<view class="" style="padding-left: 13rpx;">
										{{allText.首页.发消息}}
									</view>
								</view>
							</view>
						</view>

					</view>
				</scroll-view>
			</swiper-item>
		</swiper>





		<u-popup v-model="show" mode="center" width="624rpx" height="308rpx" border-radius="20">
			<view style="font-size: 30rpx;font-weight: bold;text-align: center;padding-top: 74rpx;">{{allText.首页.该功能仅对VIP会员开放}}</view>
			<view class="btn1" @tap="util.urlTo('/pages/user/myvip')">
				{{allText.首页.升级VIP会员}}
			</view>
		</u-popup>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				show: false,
				list: [{
						name: this.allText.我的页.推荐
					},
					{
						name: this.allText.首页.关注
					}
				],
				current: 0,
				swiperCurrent: 0,
				dx: 0,
				currents: 0,
				boxHeight: '',
				list1: [],
				greatlist: [],
				page: 1,
				isLoaded: false,
				isLoading: false,
				hasMore: true,
				scrollTop: 0,
				scrollTopTick: false,
				lastScrollTop: 0,
				requestId: 0,
				myUserId: 0,
				needRefreshOnShow: false,
				tabState: {},
				likeLoadingMap: {},
				hasNewDynamic: false,
				newDynamicTimer: null
			};
		},
		onReady() {
			this.box()
			uni.$off('dynamicUpdated', this.handleDynamicUpdated)
			uni.$on('dynamicUpdated', this.handleDynamicUpdated)
		},
		
		methods: {
			getLocalUserId() {
				const user = uni.getStorageSync('user') || {}
				return user.user_id || user.id || 0
			},
			isOwnDynamic(userId) {
				return Number(userId) === Number(this.myUserId)
			},
			getTabState(index = this.swiperCurrent) {
				const key = String(index)
				if (!this.tabState[key]) {
					this.$set(this.tabState, key, {
						list: [],
						page: 1,
						hasMore: true,
						isLoaded: false,
						scrollTop: 0
					})
				}
				return this.tabState[key]
			},
			saveCurrentTabState(index = this.swiperCurrent) {
				const state = this.getTabState(index)
				state.list = this.greatlist
				state.page = this.page
				state.hasMore = this.hasMore
				state.isLoaded = this.isLoaded
				state.scrollTop = this.lastScrollTop
			},
			restoreTabState(index) {
				const state = this.getTabState(index)
				this.greatlist = state.list
				this.page = state.page
				this.hasMore = state.hasMore
				this.isLoaded = state.isLoaded
				this.lastScrollTop = state.scrollTop || 0
				this.restoreScrollPosition(this.lastScrollTop)
				return state.isLoaded
			},
			restoreScrollPosition(top = this.lastScrollTop) {
				const targetTop = Number(top) || 0
				this.$nextTick(() => {
					this.scrollTopTick = !this.scrollTopTick
					this.scrollTop = targetTop === 0 ? 1 : 0
					this.$nextTick(() => {
						this.scrollTop = targetTop
					})
				})
			},
			mergeDynamicItem(detail) {
				if (!detail || !detail.id) {
					return
				}
				Object.keys(this.tabState).forEach(key => {
					const state = this.tabState[key]
					const list = state && Array.isArray(state.list) ? state.list : []
					const index = list.findIndex(item => Number(item.id) === Number(detail.id))
					if (index > -1) {
						this.$set(list, index, Object.assign({}, list[index], detail))
					}
				})
				const currentIndex = this.greatlist.findIndex(item => Number(item.id) === Number(detail.id))
				if (currentIndex > -1) {
					this.$set(this.greatlist, currentIndex, Object.assign({}, this.greatlist[currentIndex], detail))
				}
			},
			handleDynamicUpdated(detail) {
				this.mergeDynamicItem(detail)
			},
			checkNewDynamic() {
				const firstId = this.greatlist && this.greatlist[0] ? this.greatlist[0].id : ''
				if (!firstId || this.swiperCurrent !== 0) {
					return
				}
				this.util.request('dynamic/dynamic_list', {
					page: 1,
					limit: 1,
					my_follow: this.swiperCurrent,
					token: uni.getStorageSync('user').token
				}).then(res => {
					const list = res && Array.isArray(res.list) ? res.list : []
					this.hasNewDynamic = !!(list[0] && Number(list[0].id) !== Number(firstId))
				})
			},
			startNewDynamicTimer() {
				if (this.newDynamicTimer) {
					clearInterval(this.newDynamicTimer)
				}
				this.newDynamicTimer = setInterval(() => {
					this.checkNewDynamic()
				}, 30000)
			},
			stopNewDynamicTimer() {
				if (this.newDynamicTimer) {
					clearInterval(this.newDynamicTimer)
					this.newDynamicTimer = null
				}
			},
			refreshToLatest() {
				this.hasNewDynamic = false
				this.scrollTop = 0
				this.lastScrollTop = 0
				this.getTabState().scrollTop = 0
				this.getwork(1)
			},
			lookdetail(e){
				this.saveCurrentTabState()
				this.util.request('user/user_info', {
					token: uni.getStorageSync('user').token
				}).then(res => {
					if (res.is_vip == 'one') {
						this.util.urlTo('/pages/index/dynamicdetail?id='+e)
					} else {
						this.show = true
					}
				})
				
			},
			getadd(){
				this.util.request('user/user_info', {
					token: uni.getStorageSync('user').token
				}).then(res => {
					if (res.is_vip == 'one') {
						this.needRefreshOnShow = true
						this.util.urlTo('/pages/work/send')
					} else {
						this.show = true
					}
				})
				
			},
			gochat(e){
				if (!e || this.isOwnDynamic(e)) {
					return
				}
				this.util.request('user/user_info', {
					token: uni.getStorageSync('user').token
				}).then(res => {
					if (res.is_vip == 'one') {
						this.util.urlTo('/pages/chatNew/chatpage?id=' + encodeURIComponent(e))
					} else {
						this.show = true
					}
				})
				
				
				
			},
			reachBottomGuanZhu() {
				this.getwork()
			},
			handleScroll(e) {
				this.lastScrollTop = e.detail.scrollTop || 0
				this.getTabState().scrollTop = this.lastScrollTop
			},
			box() {
				uni.getSystemInfo({
					success: e => {
						const query = uni.createSelectorQuery().in(this);
						query.select('#box').boundingClientRect(data => {
							this.boxHeight = e.windowHeight - data.top;
													}).exec();
					}
				})
			},
			gz(e, a) {
				if (!e || this.isOwnDynamic(e)) {
					return
				}
				this.util.request('dynamic/follow_user', {
					friend_id: e,
					token: uni.getStorageSync('user').token
				}).then(res => {
					if (this.greatlist[a].is_follow == 0) {
						this.greatlist[a].is_follow = 1
					} else {
						this.greatlist[a].is_follow = 0
					}
				})
			},
			getbanner() {
				this.util.request('index/banner_list', {}).then(res => {
					this.list1 = Array.isArray(res) ? res.filter(item => {
						return typeof item === 'string' ? item : (item && (item.image || item.url))
					}) : []
				})
			},
			lookImg(e, index = 0, item) {
				let url;
				if (Array.isArray(e)) {
					url = e;
				} else {
					url = [e];
				}
				let urls = [];
				// if (item) {
				url.map(i => {
					urls.push(i.image);
				})
				url = urls;
				// }
				uni.previewImage({
					urls: url,
					current: index
				})
			},
			zan(a, b) {
				if (this.likeLoadingMap[a]) {
					return
				}
				this.$set(this.likeLoadingMap, a, true)
				this.util.request('user/user_info', {
					token: uni.getStorageSync('user').token
				}).then(res => {
					if (res.is_vip == 'one') {
						this.util.request('dynamic/great_dynamic', {
							dynamic_id: a,
							token: uni.getStorageSync('user').token
						}).then(res => {
							if (this.greatlist[b].is_zan == 0) {
								this.greatlist[b].great_num++
								this.greatlist[b].is_zan = 1
							} else {
								this.greatlist[b].great_num--
								this.greatlist[b].is_zan = 0
							}
							this.mergeDynamicItem(this.greatlist[b])
							this.$delete(this.likeLoadingMap, a)


						}).catch(() => {
							this.$delete(this.likeLoadingMap, a)
						})
					} else {
						this.$delete(this.likeLoadingMap, a)
						this.show = true
					}
				}).catch(() => {
					this.$delete(this.likeLoadingMap, a)
				})

			},

			getwork(e) {
				if (this.isLoading && e != 1) {
					return
				}
				const state = this.getTabState()
				if (e == 1) {
					this.page = 1
					this.greatlist = []
					this.hasMore = true
					state.page = 1
					state.list = []
					state.hasMore = true
					state.isLoaded = false
				}
				if (!this.hasMore) {
					return
				}
				this.isLoading = true
				const requestId = ++this.requestId
				this.util.request('dynamic/dynamic_list', {
					page: this.page,
					my_follow: this.swiperCurrent,
					token: uni.getStorageSync('user').token
				}).then(res => {
					if (requestId !== this.requestId) {
						return
					}
					const list = res && Array.isArray(res.list) ? res.list : []
					this.greatlist = e == 1 ? list : this.greatlist.concat(list)
					this.hasMore = list.length > 0
					this.page++
					this.isLoaded = true
					state.list = this.greatlist
					state.page = this.page
					state.hasMore = this.hasMore
					state.isLoaded = true
					this.isLoading = false
				}).catch(() => {
					if (requestId === this.requestId) {
						this.isLoading = false
					}
				})
			},
			switchDynamicTab(index) {
				const nextCurrent = Number(index)
				if (nextCurrent < 0 || nextCurrent >= this.list.length || nextCurrent % 1 !== 0) {
					return
				}
				if (this.current === nextCurrent && this.swiperCurrent === nextCurrent) {
					return
				}
				const oldCurrent = this.current
				this.saveCurrentTabState(oldCurrent)
				this.requestId++
				this.isLoading = false
				this.swiperCurrent = nextCurrent
				this.current = nextCurrent
				if (!this.restoreTabState(nextCurrent)) {
					this.getwork(1)
				}
				if (this.swiperCurrent !== 0) {
					this.hasNewDynamic = false
				}
			},
			swiperchange(e) {
				this.switchDynamicTab(e.detail.current)
			},
			// tab栏切换
			change(index) {
				this.switchDynamicTab(index)
			},
			transition({
				detail: {
					dx
				}
			}) {
				this.$refs.tabs.setDx(dx);
			},
			animationfinish({
				detail: {
					current
				}
			}) {
				this.$refs.tabs.setFinishCurrent(current);
				this.swiperCurrent = current;
				this.current = current;

			}

		},
		onShow() {
			this.myUserId = this.getLocalUserId()
			this.list=[{
					name: this.allText.我的页.推荐
				},
				{
					name: this.allText.首页.关注
				}
			]
												const tabbarText = this.allText.tabbar || {}
						uni.setTabBarItem({
							index: 1,
							text: tabbarText['\u53d1\u73b0'] || '\u53d1\u73b0'
						})
						uni.setTabBarItem({
							index: 2,
							text: tabbarText['\u52a8\u6001'] || '\u52a8\u6001'
						})
						uni.setTabBarItem({
							index: 3,
							text: tabbarText['\u6d88\u606f'] || '\u6d88\u606f'
						})
						uni.setTabBarItem({
							index: 4,
							text: tabbarText['\u6211\u7684'] || '\u6211\u7684'
						})
			this.getbanner()
			this.startNewDynamicTimer()
				if (!this.isLoaded || this.needRefreshOnShow) {
					this.needRefreshOnShow = false
					this.getwork(1)
				} else {
					this.restoreScrollPosition(this.lastScrollTop)
				}
		},
		onHide() {
			this.scrollTop = this.lastScrollTop
			this.saveCurrentTabState()
			this.stopNewDynamicTimer()
		},
		onUnload() {
			this.stopNewDynamicTimer()
			uni.$off('dynamicUpdated', this.handleDynamicUpdated)
		}
	};
</script>

<style>
	/* #ifndef H5 */
	page {
		height: 100%;
		background-color: #f2f2f2;
	}

	/* #endif */
</style>

<style lang="scss" scoped>
	page {
		background: #F6F7FA;
	}

	.work-page {
		min-height: 100vh;
		background: #F6F7FA;
		color: #1F2430;
	}

	.work-page::before {
		content: '';
		display: block;
		position: fixed;
		left: 0;
		top: 0;
		width: 100%;
		height: 220rpx;
		background: linear-gradient(180deg, #EEF4FF 0%, #F6F7FA 100%);
		z-index: -1;
	}

	.work-topbar {
		margin: 0 26rpx !important;
		padding-top: calc(var(--status-bar-height, 0px) + 14rpx) !important;
		padding-bottom: 12rpx;
	}

	.work-icon-btn {
		width: 68rpx !important;
		height: 68rpx !important;
		border-radius: 34rpx;
		background: rgba(255, 255, 255, 0.86);
		box-shadow: 0 8rpx 24rpx rgba(31, 36, 48, 0.06);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.work-add-box {
		margin-left: 18rpx !important;
	}

	.new-dynamic-tip {
		position: fixed;
		top: calc(var(--status-bar-height, 0px) + 112rpx);
		left: 50%;
		transform: translateX(-50%);
		z-index: 20;
		height: 56rpx;
		padding: 0 30rpx;
		border-radius: 28rpx;
		background: #5A7EF6;
		color: #fff;
		font-size: 25rpx;
		line-height: 56rpx;
		box-shadow: 0 10rpx 24rpx rgba(90, 126, 246, 0.24);
	}

	.work-add-icon {
		width: 40rpx;
		height: 40rpx;
	}

	.banner-box {
		padding: 18rpx 24rpx 8rpx !important;
	}

	.banner-box ::v-deep .u-swiper-wrap {
		border-radius: 18rpx !important;
		overflow: hidden;
	}

	.page-box {
		padding-bottom: 130rpx;
	}

	.dynamic-card {
		margin: 18rpx 24rpx !important;
		padding: 0 !important;
		background: #FFFFFF;
		border: 1rpx solid #ECEFF5;
		border-bottom: 1rpx solid #ECEFF5 !important;
		border-radius: 18rpx;
		box-shadow: 0 10rpx 28rpx rgba(31, 36, 48, 0.04);
		overflow: hidden;
	}

	.dynamic-head {
		padding: 24rpx 24rpx 14rpx !important;
		align-items: flex-start !important;
	}

	.author-line {
		flex: 1;
		min-width: 0;
		padding-right: 16rpx;
		flex-wrap: wrap;
	}

	.author-avatar {
		width: 88rpx !important;
		height: 88rpx !important;
		border: 3rpx solid #FFFFFF;
		box-shadow: 0 6rpx 18rpx rgba(31, 36, 48, 0.08);
		flex-shrink: 0;
	}

	.author-name {
		max-width: 210rpx;
		margin-left: 18rpx !important;
		font-size: 29rpx !important;
		line-height: 40rpx;
		color: #20242C;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.gender-pill {
		width: auto !important;
		min-width: 64rpx;
		height: 32rpx !important;
		padding: 0 10rpx;
		margin-left: 12rpx !important;
		background: #F6F8FC !important;
		border-radius: 16rpx !important;
		box-sizing: border-box;
	}

	.author-line > image[src="/static/work/ren.png"] {
		width: 70rpx !important;
		height: 27rpx !important;
		margin-left: 10rpx !important;
	}

	.author-line > image[src="/static/work/vip.png"] {
		width: 40rpx !important;
		height: 36rpx !important;
		padding-left: 0 !important;
		margin-left: 8rpx;
	}

	.dynamic-text {
		padding: 0 24rpx 18rpx !important;
		font-size: 28rpx !important;
		line-height: 44rpx;
		color: #303642;
		word-break: break-word;
	}

	.media-grid {
		margin: 0 24rpx !important;
		gap: 12rpx;
	}

	.media-item {
		margin-top: 0 !important;
		line-height: 0;
	}

	.image-check,
	.image-check1,
	.image-check2 {
		display: block;
		margin-right: 0 !important;
		border-radius: 14rpx;
		background: #EEF1F6;
	}

	.image-check {
		width: 204rpx;
		height: 204rpx;
	}

	.image-check2 {
		width: 654rpx;
		height: 420rpx;
	}

	.image-check1 {
		width: 315rpx;
		height: 315rpx;
	}

	.video-list {
		padding: 0 24rpx;
	}

	.video-card {
		width: 520rpx !important;
		height: 360rpx !important;
		margin: 4rpx 0 0 24rpx !important;
		border-radius: 16rpx !important;
		background-color: #EDEFF5 !important;
		overflow: hidden;
		position: relative;
	}

	.video-card image:first-child {
		width: 100% !important;
		height: 100% !important;
	}

	.video-card image:last-child {
		width: 78rpx !important;
		height: 78rpx !important;
		position: absolute;
		top: 50%;
		left: 50%;
		margin-top: -39rpx !important;
		margin-left: -39rpx !important;
	}

	.dynamic-actions {
		padding: 24rpx !important;
		margin-top: 8rpx;
		border-top: 1rpx solid #F0F2F6;
		color: #6D7480;
	}

	.action-left {
		gap: 34rpx;
	}

	.action-item {
		margin-left: 0 !important;
		font-size: 25rpx !important;
		color: #687080;
	}

	.action-item image {
		width: 30rpx !important;
		height: 30rpx !important;
		opacity: 0.9;
	}

	.action-item view {
		padding-left: 9rpx !important;
	}

	.chat-action {
		font-size: 25rpx !important;
		color: #4F66D5;
		background: #F3F5FF;
		border-radius: 28rpx;
		padding: 10rpx 18rpx;
	}

	.chat-action image {
		width: 30rpx !important;
		height: 30rpx !important;
	}

	.chat-action view {
		padding-left: 9rpx !important;
	}

	.btn {
		width: auto;
		min-width: 118rpx;
		height: 48rpx;
		padding: 0 20rpx;
		border-radius: 24rpx;
		border: 1rpx solid #D9DEEA;
		background: #FFFFFF;
		color: #333A45;
		text-align: center;
		line-height: 48rpx;
		font-size: 24rpx;
		box-sizing: border-box;
		flex-shrink: 0;
	}

	.btn1 {
		margin: 38rpx 118rpx 0;
		height: 78rpx;
		background: #5A7EF6;
		border-radius: 39rpx;
		text-align: center;
		line-height: 78rpx;
		font-size: 28rpx;
		color: #fff;
		box-shadow: 0 10rpx 24rpx rgba(90, 126, 246, 0.22);
	}

	.wrap {
		display: flex;
		flex-direction: column;
		// height: calc(100vh - var(--window-top)-200px);
		// height: 750rpx;
		width: 100%;
	}

	.swiper-box {
		flex: 1;
	}

	.swiper-item {
		height: 100%;
	}

	.swiper-box {
		flex: 1;
	}

	.swiper-item {
		// height: 100%;e
	}
</style>
