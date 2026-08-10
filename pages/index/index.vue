<template>
	<view
		style="width: 100%;background: url(/static/home/homebg.png) no-repeat;background-size: 100% 100%;">
		<view class="wrap">
			<view class="">
				<view class="u-tabs-box home-topbar"
					style="display: flex;align-items: center;justify-content: space-between;margin: 10rpx 32rpx;">
					<view class="">
						<u-tabs-swiper activeColor="#333333" ref="tabs" :list="list" :current="current" @change="change"
							:is-scroll="false" bg-color=""></u-tabs-swiper>
					</view>
					<view class="" @tap="util.urlTo('/pages/index/sousuo')">
						<image src="/static/home/sousuo.png" mode=""
							style="width: 35rpx;height: 35rpx;"></image>
					</view>

				</view>
			</view>
		</view>
		<u-popup v-model="show" mode="center" width="624rpx" height="308rpx" border-radius="20">
			<view style="font-size: 30rpx;font-weight: bold;text-align: center;padding-top: 74rpx;">
				{{allText.首页.该功能仅对VIP会员开放}}
			</view>
			<view class="btn" @tap="util.urlTo('/pages/user/myvip')">
				{{allText.首页.升级VIP会员}}
			</view>
		</u-popup>
		<!-- 女神 -->
		<view class="" id="box">

		</view>
		<!--  -->
		<swiper class="swiper-box" :current="swiperCurrent" @transition="transition" @animationfinish="animationfinish"
			@change="swiperchange" :style="{height:boxHeight+'px'}">
			<swiper-item class="swiper-item">
				<scroll-view scroll-y style="height: 100%;width: 100%;" @scrolltolower="reachBottomGuanZhu">
					<view class="page-box">
						<view class=""
							style="margin: 0 29rpx;background: #fff;border-radius: 20rpx;box-shadow: 0rpx 0rpx 24rpx 0rpx rgba(83,83,83,0.06);padding-bottom: 1rpx;margin-top: 15rpx;">
							<view class=""
								style="display: flex;align-items: center;justify-content: space-between;padding: 30rpx 20rpx;">
								<!-- 简体中文 -->
								<image src="/static/home/xindong.png" mode=""
									style="width: 234rpx;height: 29rpx;" v-if="tuishow==1"></image>
								<!-- 英语 -->
								<image src="/static/home/ying.png" mode=""
									style="width: 445rpx;height: 29rpx;" v-if="tuishow==2"></image>
								<!-- 日语 -->
								<image src="/static/home/ri.png" mode=""
									style="width: 361rpx;height: 29rpx;" v-if="tuishow==4"></image>
								<!-- 韩语 -->
								<image src="/static/home/riyu.png" mode=""
									style="width: 238rpx;height: 29rpx;" v-if="tuishow==3"></image>
								<!-- 繁体 -->
								<image src="/static/home/f1.png" mode=""
									style="width: 198rpx;height: 29rpx;" v-if="tuishow==0"></image>
								<view class="" style="display: flex;align-items: center;font-size: 26rpx;"
									@tap="pubuser">
									<image src="/static/home/shuaxin.png" mode=""
										style="width: 24rpx;height: 24rpx;"></image>
									<view class="" style="padding-left: 12rpx;">
										{{allText.首页.换一批}}
									</view>
								</view>
							</view>

							<!-- meinv -->
							<view class="" style="display: flex;align-items: center;padding: 0 13rpx;">
								<view class="" style="width: 33.3%;" v-for="(i,k) in tuilist" :key="k"
									@tap="getjoop(i.user_id)">
									<view class="discover-photo-card discover-photo-card-small">
										<view class="discover-photo-bg" :class="{'is-photo-blurred': shouldBlurPhotos}"
											:style="{backgroundImage:'url('+i.avatar+')'}"></view>
										<view class="vip-blur-window vip-blur-window-small" v-if="shouldBlurPhotos">
											<view class="vip-blur-title">VIP</view>
										</view>

										<view class="discover-card-info"
											style="padding: 15rpx 6rpx;background: linear-gradient(0deg, #000000 0%, rgba(0,0,0,0) 100%);border-radius: 20rpx;">
											<view class=""
												style="font-size: 24rpx;color: #fff;display: flex;align-items: center;">
												<view
													style="max-width: 160rpx;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;">
													{{i.nickname}}</view>
												<image
													:src="i.vip_type==1 ? '/static/home/vip.png' : '/static/work/vip.png'"
													mode="" style="width: 38rpx;height: 32rpx;margin-left: 6rpx;"
													v-if="i.vip_type&&i.vip_type!=0">
												</image>
											</view>
											<view class=""
												style="font-size: 20rpx;color: #fff;width: 196rpx;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;">
												{{i.height}}cm·{{i.weight}}kg·{{i.occupation_arr}}
											</view>
										</view>

									</view>
								</view>
							</view>
							<view class="btn" @tap="allone">
								{{allText.首页.一键搭讪}}
							</view>
						</view>

						<!-- 人员列表 -->
						<view class="" style="display: flex;align-items: center;flex-wrap: wrap;margin: 15rpx 28rpx;">
							<view class="" style="width: 50%;margin-top: 20rpx;" v-for="(i,k) in friend_list" :key="k">
								<view class="discover-photo-card discover-photo-card-grid" @tap="getjoop(i.user_id)">
									<view class="discover-photo-bg" :class="{'is-photo-blurred': shouldBlurPhotos}"
										:style="{backgroundImage:'url('+i.avatar+')'}"></view>
									<view class="vip-blur-window" v-if="shouldBlurPhotos">
										<view class="vip-blur-title">VIP</view>
									</view>
									<view class="discover-card-info"
										style="padding: 25rpx 12rpx;width: 100%;background: linear-gradient(0deg, #000000 0%, rgba(0,0,0,0) 100%);border-radius: 20rpx;">
										<view class=""
											style="font-size: 24rpx;color: #fff;display: flex;align-items: center;">
											<text>{{i.nickname}}</text>
											<view class=""
												style="width: 67rpx;height: 30rpx;background: #fff;border-radius: 15rpx;font-size: 21rpx;display: flex;align-items: center;justify-content: center;margin-left: 6rpx;"
												:style="{color:i.gender==2 ? '#FF738E' : '#56A0FF'}">
												<image
													:src="i.gender==2 ? '/static/home/nv.png' : '/static/home/nan.png'"
													mode="" style="width: 24rpx;height: 24rpx;margin-right: 5rpx;">
												</image>
												<text>{{i.age}}</text>
											</view>
											<image
												:src="i.vip_type==1 ? '/static/home/vip.png' : '/static/work/vip.png'"
												mode="" style="width: 38rpx;height: 32rpx;margin-left: 6rpx;"
												v-if="i.vip_type&&i.vip_type!=0">
											</image>
										</view>
										<view class="" style="font-size: 20rpx;color: #fff;margin-top: 5rpx;">
											{{i.height}}cm·{{i.weight}}kg·{{i.occupation_arr}}
										</view>
										<view class=""
											style="font-size: 20rpx;display: flex;align-items: center;justify-content: space-between;margin-top: 5rpx;">
											<view class="" style="color: #fff;">
												{{i.country}}
											</view>
											<view class="" style="display: flex;align-items: center;" v-if="i.on_line_text == 1">
												<view class=""
													style="width: 12rpx;height: 12rpx;background: #08D68B;border-radius: 50%;">
												</view>
												<view class="" style="color: #08D68B;margin-left: 5rpx;">
													{{i.on_line}}
												</view>
											</view>
											<!-- <view class="" style="display: flex;align-items: center;">
												<view class=""
													style="width: 12rpx;height: 12rpx;background: #999999;border-radius: 50%;">
												</view>
												<view class="" style="color: #999999;margin-left: 5rpx;">
													{{i.on_line}}
												</view>
											</view> -->
										</view>
									</view>
								</view>
							</view>
						</view>

					</view>
					<view class="tabbar-safe-space"></view>
				</scroll-view>
			</swiper-item>


			<swiper-item class="swiper-item">
				<scroll-view scroll-y style="height: 100%;width: 100%;" @scrolltolower="reachBottomGuanZhu">
					<view class="page-box">
						<!-- 人员列表 -->
						<view class="" style="display: flex;align-items: center;flex-wrap: wrap;margin: 15rpx 28rpx;">
							<view class="" style="width: 50%;margin-top: 20rpx;" v-for="(i,k) in friend_list" :key="k">
								<view class="discover-photo-card discover-photo-card-grid" @tap="getjoop(i.user_id)">
									<view class="discover-photo-bg" :class="{'is-photo-blurred': shouldBlurPhotos}"
										:style="{backgroundImage:'url('+i.avatar+')'}"></view>
									<view class="vip-blur-window" v-if="shouldBlurPhotos">
										<view class="vip-blur-title">VIP</view>
									</view>
									<view class="discover-card-info"
										style="padding: 25rpx 12rpx;width: 100%;background: linear-gradient(0deg, #000000 0%, rgba(0,0,0,0) 100%);border-radius: 20rpx;">
										<view class=""
											style="font-size: 24rpx;color: #fff;display: flex;align-items: center;">
											<text>{{i.nickname}}</text>
											<view class=""
												style="width: 67rpx;height: 30rpx;background: #fff;border-radius: 15rpx;font-size: 21rpx;display: flex;align-items: center;justify-content: center;margin-left: 6rpx;"
												:style="{color:i.gender==2 ? '#FF738E' : '#56A0FF'}">
												<image
													:src="i.gender==2 ? '/static/home/nv.png' : '/static/home/nan.png'"
													mode="" style="width: 24rpx;height: 24rpx;padding-right: 5rpx;">
												</image>
												<text>{{i.age}}</text>
											</view>
											<image
												:src="i.vip_type==1 ? '/static/home/vip.png' : '/static/work/vip.png'"
												mode="" style="width: 38rpx;height: 32rpx;margin-left: 6rpx;"
												v-if="i.vip_type&&i.vip_type!=0">
											</image>
										</view>
										<view class="" style="font-size: 20rpx;color: #fff;margin-top: 5rpx;">
											{{i.height}}cm·{{i.weight}}kg·{{i.occupation_arr}}
										</view>
										<view class=""
											style="font-size: 20rpx;display: flex;align-items: center;justify-content: space-between;margin-top: 5rpx;">
											<view class="" style="color: #fff;">
												{{i.country}}
											</view>
											<view class="" style="display: flex;align-items: center;"  v-if="i.on_line_text == 1">
												<view class=""
													style="width: 12rpx;height: 12rpx;background: #08D68B;border-radius: 50%;">
												</view>
												<view class="" style="color: #08D68B;margin-left: 5rpx;">
													{{i.on_line}}
												</view>
											</view>
										</view>
									</view>
									<view class=""
										style="width: 88rpx;height: 32rpx;background: linear-gradient(0deg, #F9E9CE 1%, #F1CA98 98%);border-radius: 16rpx;display: flex;align-items: center;font-size: 22rpx;position: absolute;top: 12rpx;justify-content: center;left: 13rpx;z-index: 2;">
										<image src="/static/home/guan.png" mode=""
											style="width: 30rpx;height: 30rpx;"></image>
										<view class="">
											{{i.gender==2 ? allText.首页.女神 :  allText.首页.男神}}
										</view>
									</view>
								</view>
							</view>
						</view>
					</view>
					<view class="tabbar-safe-space"></view>
				</scroll-view>
			</swiper-item>
		</swiper>
	</view>
</template>

<script>
	import chatService from '@/common/chatService.js'
	export default {
		data() {
			return {
				show: false,
				list: [{
						name: this.allText.我的页.推荐
					},
					{
						name: this.allText.首页.女神
					}
				],
				current: 0,
				swiperCurrent: 0,
				dx: 0,
				page: 1,
				requestId: 0,
				tuilist: [],
				boxHeight: '',
				friend_list: [],
				user_ids: [],
				tuishow: '',
				viewerInfo: {
					is_vip: 'three',
					vip_type: 0
				},
				im: chatService.createAdapter(this.$goeasy.im, this.GoEasy), //im实例
			};
		},
		computed:{
			shouldBlurPhotos() {
				return !this.isVipUser(this.viewerInfo)
			}
		},
		onReady() {
			this.box()
		},
		methods: {
			getjoop(e) {
				this.util.urlTo('/pages/index/userdetail?id=' + e)
				// this.util.request('user/user_info', {
				// 	token: uni.getStorageSync('user').token
				// }).then(res => {
				// 	if (res.vip_type != 0 && res.vip_type) {
				// 		this.util.urlTo('/pages/index/userdetail?id=' + e)
				// 	} else {
				// 		this.show = true
				// 	}

				// })

			},
			isVipUser(user) {
				return !!(user && (user.is_vip == 'one' || Number(user.vip_type) > 0))
			},
			allone() {
				const userIds = (this.user_ids || []).filter(Boolean)
				if(!userIds.length){
					this.$u.toast('暂无可搭讪用户')
					return
				}
				this.util.request('user/write_random', {
					token: uni.getStorageSync('user').token,
					user_ids: userIds.join(',')
				}, 'POST').then(res => {
					// this.util.showToast(res.msg)
					for (let i in (this.tuilist || [])) {
						this.util.request('friend/user_info', {
							uid: this.tuilist[i].user_id,
							token: uni.getStorageSync('user').token
						}).then(req => {
							this.frienddetail = req
							this.confirm(this.tuilist[i].greet_word, this.tuilist[i].user_id, {
								receiveName: req.nickname,
								receiveHead: req.avatar
							})
						})
					}
					this.$u.toast(this.allText.首页.搭讪成功)
					// this.pubuser()
				})
			},
			async confirm(content, user_id, obj) {
				let textMessage = this.im.createTextMessage({
						text: content, //消息内容
						to: {
							type: this.GoEasy.IM_SCENE.PRIVATE, //私聊还是群聊，群聊为GoEasy.IM_SCENE.GROUP
							id: JSON.stringify(user_id), //接收方用户id
							data: {
								"avatar": obj.receiveHead,
								"nickname": obj.receiveName,
							} //接收方用户扩展数据, 任意格式的字符串或者对象，用于更新会话列表conversation.data
						}
					});
					this.im.sendMessage({
						message: textMessage,
						onSuccess: () => { //发送成功
													},
						onFailed: function(error) { //发送失败
													}
					});
					
					
					
				
				// obj.fanyi = data.info
				// // // 定义消息投送目标会话, 这里定义一个群组类型会话

				// 	// 文本内容
				// 	content: content,
				// 	// （可选）消息中附加信息，透传到对端
				// 	extra: JSON.stringify(obj)
				// })
				// // 发送消息
				// 		// 消息发送成功，可以根据返回结果中的 messageId 字段将列表中的该消息状态改为发送成功。                      
				// 						// 	} else {
				// 						// 	}
				// })
			},
			reachBottomGuanZhu() {
				this.friend()
			},
			switchDiscoverTab(index) {
				const nextIndex = Number(index)
				if (nextIndex < 0 || nextIndex >= this.list.length || nextIndex % 1 !== 0) {
					return
				}
				if (this.current === nextIndex && this.swiperCurrent === nextIndex) {
					return
				}
				this.current = nextIndex
				this.swiperCurrent = nextIndex
				this.page = 1
				this.friend(1)
			},
			swiperchange(e) {
				this.switchDiscoverTab(e.detail.current)
			},
			box() {
				uni.getSystemInfo({
					success: e => {
						const query = uni.createSelectorQuery().in(this);
						query.select('#box').boundingClientRect(data => {
							this.boxHeight = e.windowHeight - data.top
													}).exec();
					}
				})
			},
			pubuser() {
				this.util.request('user/random_user', {
					token: uni.getStorageSync('user').token
				}).then(res => {
					this.tuilist = res
					this.user_ids = []
					res.map(i => {
						this.user_ids.push(i.user_id)
					})

				})
			},
			friend(e) {
				if (e == 1) {
					this.page = 1
					this.friend_list = []
				}
				const requestId = ++this.requestId
				this.util.request('friend/user_list', {
					page: this.page,
					token: uni.getStorageSync('user').token,
					girl_switch: this.swiperCurrent
					// long:'0',
					// lat:'0'
				}, 'POST').then(res => {
					if (requestId !== this.requestId) {
						return
					}
										if (res.code == 1) {
						this.friend_list = this.friend_list.concat(res.data)
						this.page++
					} else {
												this.show = true
					}

				})
			},
			// tab栏切换
			change(index) {
				this.switchDiscoverTab(index)
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
				// this.reachBottomGuanZhu(1)
			}
		},
		onShow() {
						this.tuishow = uni.getStorageSync('languageType') ? uni.getStorageSync('languageType') : 0
			this.util.request('user/user_info', {
				token: uni.getStorageSync('user').token
			}).then(res => {
				this.viewerInfo = res || this.viewerInfo
				if (res.need_edit == 0) {
					uni.reLaunch({
						url: '/pages/perfect/perfect'
					})
				}

			})
			// 	if (res.code === 0) {

			// 		const includeMuted = false
			// 			if (data.code === 0) {
			// 							// 				if (data.data != 0) {
			// 					uni.setTabBarBadge({
			// 						index: 2,
			// 						text: String(data.data)
			// 					})
			// 				} else {
			// 					uni.removeTabBarBadge({
			// 						index: 2
			// 					})
			// 				}

			// 			} else {

			// 			}
			// 		}).catch(error => {
			// 						// 		})



			// 				if (data.code === 0) {
			// 								// 					if (data.data != 0) {
			// 						uni.setTabBarBadge({
			// 							index: 2,
			// 							text: String(data.data)
			// 						})
			// 					} else {
			// 						uni.removeTabBarBadge({
			// 							index: 2
			// 						})
			// 					}

			// 				} else {

			// 				}
			// 			}).catch(error => {
			// 							// 			})
			// 				if (data.code === 0) {
			// 								// 					if (data.data != 0) {
			// 						uni.setTabBarBadge({
			// 							index: 2,
			// 							text: String(data.data)
			// 						})
			// 					} else {
			// 						uni.removeTabBarBadge({
			// 							index: 2
			// 						})
			// 					}

			// 				} else {

			// 				}
			// 			}).catch(error => {
			// 							// 			})
			// 			this.$forceUpdate()


			// 						// 			// this.getchat()
			// 		})





			// 	}
			// })




			this.util.request('user/user_info', {
				token: uni.getStorageSync('user').token
			}).then(res => {
				this.viewerInfo = res || this.viewerInfo
				if (res.gender == 1) {
					this.list = [{
							name: this.allText.我的页.推荐
						},
						{
							name: this.allText.首页.女神
						}
					]
				} else {
					this.list = [{
							name: this.allText.我的页.推荐
						},
						{
							name: 'VIP'
						}
					]
				}

			})

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
						this.pubuser()
		},
		onLoad() {

			this.friend(1)
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
		background: #F4F8FE;
	}

	.wrap {
		display: flex;
		flex-direction: column;
		// height: calc(100vh - var(--window-top)-200px);
		// height: 750rpx;
		width: 100%;
	}

	.home-topbar {
		padding-top: var(--status-bar-height, 0px);
	}

	.swiper-box {
		flex: 1;
	}

	.swiper-item {
		height: 100%;
	}

	.tabbar-safe-space {
		height: 168rpx;
		height: calc(168rpx + constant(safe-area-inset-bottom));
		height: calc(168rpx + env(safe-area-inset-bottom));
	}

	.btn {
		margin: 33rpx 195rpx;
		height: 70rpx;
		background: #5A7EF6;
		border-radius: 35rpx;
		text-align: center;
		line-height: 70rpx;
		font-size: 28rpx;
		color: #fff;
	}

	.discover-photo-card {
		position: relative;
		overflow: hidden;
		margin: 0 auto;
		display: flex;
		align-items: flex-end;
		background: #f2f3f6;
	}

	.discover-photo-card-small {
		width: 206rpx;
		height: 263rpx;
		border-radius: 16rpx;
	}

	.discover-photo-card-grid {
		width: 336rpx;
		height: 424rpx;
		border-radius: 20rpx;
	}

	.discover-photo-bg {
		position: absolute;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		background-size: cover;
		background-position: center;
		background-repeat: no-repeat;
		transition: filter 0.2s ease, transform 0.2s ease;
	}

	.discover-photo-bg.is-photo-blurred {
		filter: blur(5px);
		transform: scale(1.04);
	}

	.discover-card-info {
		position: relative;
		z-index: 2;
		box-sizing: border-box;
	}

	.vip-blur-window {
		position: absolute;
		left: 50%;
		top: 35%;
		z-index: 1;
		transform: translate(-50%, -50%);
		min-width: 118rpx;
		height: 50rpx;
		padding: 0 22rpx;
		border-radius: 999rpx;
		background: rgba(255, 255, 255, 0.28);
		border: 1rpx solid rgba(255, 255, 255, 0.62);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 10rpx 24rpx rgba(20, 24, 35, 0.14);
	}

	.vip-blur-window-small {
		top: 34%;
		min-width: 92rpx;
		height: 42rpx;
	}

	.vip-blur-title {
		font-size: 24rpx;
		font-weight: 700;
		color: #ffffff;
		text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.26);
	}

	.swiper-box {
		flex: 1;
	}

	.swiper-item {
		// height: 100%;e
	}
</style>
