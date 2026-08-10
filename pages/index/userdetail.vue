<template>
	<view>
		<view class="detail-top-actions">
			<image src="/static/home/back.png" mode="" style="width: 46rpx;height: 46rpx;margin-left: 28rpx;" @tap="back">
			</image>
			<view class="" style="display: flex;align-items: center;margin-right: 24rpx;">
				<view class="" style="font-size: 24rpx;color: #FF5F79;width: 96rpx;text-align: center;line-height: 44rpx;
height: 44rpx;
background: #FFFFFF;
border-radius: 16rpx;" @tap.stop="gz(frienddetail.user_id)">
{{frienddetail.have_follow==0 ? '+'+allText.首页.关注 : allText.首页.已关注}}
					<!-- +关注 -->
				</view>
				<image src="/static/home/right.png" mode="" style="width: 44rpx;height: 44rpx;margin-left: 19rpx;"
					@tap="show=true">
				</image>
			</view>
		</view>
		<view class="detail-hero" :class="{'is-locked': shouldBlurPhotos}">
			<u-swiper class="detail-hero-swiper" :list="frienddetail.avatar_arr" mode="dot" indicator-pos="bottomCenter" height="700" @click="clicks"></u-swiper>
			<view class="vip-blur-window" v-if="shouldBlurPhotos">
				<view class="vip-blur-title">VIP</view>
			</view>
		</view>
		<view v-if="frienddetail.on_line_text == 1" class="" style="width: 112rpx;
height: 52rpx;
background: rgba(0, 0, 0, .5);
border-radius: 26rpx;
display: flex;align-items: center;justify-content: center;position: absolute;top: 560rpx;left: 26rpx;">
			<view class="" style="width: 12rpx;
height: 12rpx;
background: #08D68B;
border-radius: 50%;">

			</view>
			<view class="" style="font-size: 26rpx;color: #08D68B;padding-left: 12rpx;">
				{{frienddetail.on_line}}
			</view>

		</view>
		<!-- <view class="" style="width: 112rpx;
		height: 52rpx;
		background: rgba(0, 0, 0, .5);
		border-radius: 26rpx;
		display: flex;align-items: center;justify-content: center;position: absolute;top: 560rpx;left: 26rpx;">
					<view class="" style="width: 12rpx;
		height: 12rpx;
		background: #999999;
		border-radius: 50%;">
		
					</view>
					<view class="" style="font-size: 26rpx;color: #999999;padding-left: 12rpx;">
						{{frienddetail.on_line}}
					</view>
		
				</view> -->
		<!-- 人物详情 -->
		<view class=""
			style="background: #fff;z-index: 999;position: absolute;top: 650rpx;width: 100%;border-radius: 30rpx;">
			<view class=""
				style="padding: 41rpx 31rpx 27rpx 27rpx;display: flex;align-items: center;justify-content: space-between;">
				<view class="" style="display: flex;align-items: center;">
					<text style="font-size: 32rpx;font-weight: bold;">{{frienddetail.nickname}}
					<text v-if="frienddetail.alias_name">({{frienddetail.alias_name}})</text>
					
					</text>
					<view class=""
						style="width: 67rpx;height: 30rpx;background: #EEEEEE;border-radius: 15rpx;font-size: 21rpx;color: #FF738E;display: flex;align-items: center;justify-content: center;margin-left: 13rpx;" :style="{color:frienddetail.gender==2 ? '#FF738E' : '#58A3FF'}">
						<image :src="frienddetail.gender==2 ? '/static/home/nv.png' : '/static/home/nan.png'" mode=""
							style="width: 24rpx;height: 24rpx;margin-right: 5rpx;"></image>
						<text>{{frienddetail.age}}</text>
					</view>
					<!-- <image src="/static/home/zhenren.png" mode=""
						style="width: 80rpx;height: 30rpx;margin-left: 10rpx;"></image> -->
				</view>
				<view class="" style="display: flex;align-items: center;" @tap="beishow=true">
					<view class="" style="font-size: 24rpx;color: #858585;">
						{{allText.首页.备注}}：{{allText.首页.设置备注}}
					</view>
					<image src="/static/home/edit.png" mode=""
						style="width: 30rpx;height: 30rpx;margin-left: 23rpx;"></image>
				</view>
			</view>
			<view class="" style="font-size: 23rpx;display: flex;align-items: center;padding: 0 0 73rpx 29rpx;">
				<text>{{frienddetail.height}}cm·{{frienddetail.weight}}kg &nbsp;|&nbsp;{{allText.首页.职业}}：{{frienddetail.occupation_arr}} &nbsp;|</text>

				<view class="" style="display: flex;align-items: center;margin-left: 10rpx;">
					<image src="/static/home/map.png" mode=""
						style="width: 26rpx;height: 26rpx;margin-right: 12rpx;"></image>
					<text>{{frienddetail.country}}</text>
				</view>
			</view>
			<view class="title">
				<view class="fen"></view>
				<view class="">
					{{allText.首页.我的形容词}}
				</view>
			</view>
			<view class="" style="display: flex;align-items: center;flex-wrap: wrap;margin: 0 21rpx;">
				<view class="btn" v-for="(i,k) in frienddetail.label_array" :key="k">
					{{i.code}}
				</view> 
			</view>

			<view class="title" style="margin-top: 51rpx;">
				<view class="fen"></view>
				<view class="">
					{{allText.首页.期待的关系}}
				</view>
			</view>
			<view class="" style="display: flex;align-items: center;flex-wrap: wrap;margin: 0 21rpx;">
				<view class="btn" v-for="(i,k) in frienddetail.relation_array" :key="k">
					{{i.code}}
				</view>
			</view>

			<view class="title" style="margin-top: 51rpx;">
				<view class="fen"></view>
				<view class="">
					{{allText.首页.喜欢的人}}
				</view>
			</view>
			<view class="" style="display: flex;align-items: center;flex-wrap: wrap;margin: 0 21rpx;">
				<view class="btn" v-for="(i,k) in frienddetail.characters_array" :key="k">
					{{i.code}}
				</view>
			</view>
			<!-- 交友试验 -->
			<view class="title" style="margin-top: 51rpx;">
				<view class="fen"></view>
				<view class="">
					{{allText.首页.TA的交友誓言}}
				</view>
			</view>
			<view class="" style="font-size: 28rpx;padding: 0 24rpx 0 24rpx;">
				{{frienddetail.bio}}
			</view>

			<!-- 动态 -->
			<view class="title"
				style="margin-top: 51rpx;display: flex;align-items: center;justify-content: space-between;"
				@tap="util.urlTo('/pages/index/dongtailist?id='+id)">
				<view class="" style="display: flex;align-items: center;">
					<view class="fen"></view>
					<view class="">
						{{allText.首页.TA的动态}}
					</view>
				</view>
				<view class="" style="margin-right: 26rpx;">
					<u-icon name="arrow-right" color="#222222 " size="28"></u-icon>
				</view>
			</view>
			<view class="" style="display: flex;align-items: center;flex-wrap: wrap;">
				<view class="" style="width: 33.3%;text-align: center;" v-for="(i,k) in frienddetail.dynamic_arr" :key="k" @tap="openDynamic(i.dynamic_id)">
					<image :src="i.image" mode="aspectFill"
						:class="{'detail-thumb-blurred': shouldBlurPhotos}"
						style="width: 224rpx;height: 250rpx;border-radius: 20rpx;"></image>
				</view>
			</view>
			<!-- 相册 -->
			<view class="" v-if="frienddetail.have_follow==1">
				<view class="title"
					style="margin-top: 51rpx;display: flex;align-items: center;justify-content: space-between;"
					@tap="openAlbum">
					<view class="" style="display: flex;align-items: center;">
						<view class="fen"></view>
						<view class="">
							{{allText.首页.TA的相册}}
						</view>
					</view>
					<view class="" style="margin-right: 26rpx;">
						<u-icon name="arrow-right" color="#222222 " size="28"></u-icon>
					</view>
				</view>
				<view class="" style="font-size: 28rpx;padding: 0 24rpx 0 24rpx;" v-if="frienddetail.photo_array==''">
					{{allText.首页.ta还没有发布什么作品哦}}
				</view>
				
				<view class="" style="display: flex;align-items: center;flex-wrap: wrap;" v-else>
					<view class="" style="width: 33.3%;" v-for="(i,k) in frienddetail.photo_array" :key="k" @tap="look(i)">
						<view class=""
							style="width: 218rpx;height: 284rpx;border-radius: 16rpx;position: relative;margin: 25rpx auto;">
							<image :src="i.image" mode="aspectFill" style="width: 218rpx;height: 284rpx;border-radius: 16rpx;"
								:class="{'detail-thumb-blurred': shouldBlurPhotos}" v-if="i.file_type==1">
							</image>
							<image :src="i.image+'?x-oss-process=video/snapshot,t_0,f_jpg,w_218,h_284'" mode="aspectFill"
								:class="{'detail-thumb-blurred': shouldBlurPhotos}"
								style="width: 218rpx;height: 284rpx;border-radius: 16rpx;" v-if="i.file_type==2">
							</image>
				
							<image src="/static/home/bo.png" mode=""
								style="width: 66rpx;height: 66rpx;position: absolute;top: 81rpx;left: 76rpx;z-index: 9999;"
								v-if="i.file_type==2"></image>
						</view>
					</view>
				</view>
			</view>
			

			<view class="" style="height: 230rpx;">

			</view>
			<view class=""
				style="width: 100%;height: 201rpx;box-shadow: 0rpx 0rpx 32rpx 0rpx rgba(0,0,0,0.1);border-radius: 10rpx;position: fixed;bottom: 0;background: #fff;display: flex;align-items: center;justify-content: space-around;">
				<view class="footbtn" @tap="show1=true">
					{{allText.动态页聊天页.表白特效}}
				</view>
				<view class="footbtn" @tap="util.urlTo('/pages/index/tavip?id='+id)">
					{{allText.首页.为ta升级VIP}}
				</view>
				<view class="footbtn" @tap="util.urlTo('/pages/chatNew/chatpage?id='+id)">
					{{allText.首页.私聊ta}}
				</view>
			</view>
		</view>

		<u-action-sheet :list="lists" v-model="show" z-index="9999999" border-radius="20"
			@click="click"></u-action-sheet>
		<!-- 充值余额不足 -->
		<u-popup v-model="shows" mode="bottom" border-radius="30" z-index="99">
			<view class="" style="text-align: center;padding-top: 103rpx;">
				<image src="/static/home/err.png" mode="" style="width: 91rpx;height: 91rpx;"></image>
				<view class="" style="font-size: 30rpx;color: #666;">
					{{allText.首页.余额不足}}
				</view>
				<view class=""
					style="margin: 80rpx 164rpx 49rpx 164rpx;text-align: center;line-height: 86rpx;height: 86rpx;background: #5A7EF6;border-radius: 43rpx;font-size: 30rpx;color: #fff;">
					{{allText.首页.充值余额}}
				</view>
			</view>
		</u-popup>
		<!-- 充值钻石 -->
		<u-popup v-model="shows1" mode="bottom" border-radius="30" z-index="2001" >
			<view class="" style="font-size: 34rpx;color: #5A7EF6;font-weight: 800;padding: 33rpx 32rpx;">
				{{allText.首页.充值钻石}}
			</view>
			<scroll-view :scroll-top="scrollTop" scroll-x="true" class="scroll-Y" style="white-space: nowrap;">
				<view class="" style="display: flex;align-items: center;">
					<view class="" v-for="(i,k) in zslist" :key="k" style="margin-left: 30rpx;">
						<view :class="current==k ? 'xzsbtn' : 'zsbtn'" @tap="current=k">
							<view class=""
								style="font-size: 28rpx;display: flex;align-items: center;justify-content: center;padding-top: 47rpx;">
								<image src="/static/home/zs.png" mode="" style="width: 28rpx;height: 28rpx;">
									
								</image>
								<view class="" style="padding-left: 9rpx;">
									{{i.diamond}}钻
								</view>
							</view>
							<view class="neibtn">
								+{{allText.我的页.赠送}}{{i.zengsong_diamond}}钻
							</view>
							<view class="" style="font-size: 36rpx;font-weight: bold;text-align: center;">
								￥{{i.price}}
							</view>
						</view>
					</view>

				</view>
			</scroll-view>
			<!-- <view class="" style="font-size: 26rpx;color: #858585;padding: 62rpx 31rpx;">
				直接冲VIP会员可以解锁查看微信！限时特惠活动中，请到我
				的会员中心开通会员！
			</view> -->
			<view class="uploadbtn" @tap="cz">
				{{allText.首页.确认充值}}
			</view>
		</u-popup>

		<u-popup v-model="show1" mode="bottom" border-radius="14" width="100%" z-index="2000">
			<view class=""
				style="display: flex;align-items: center;justify-content: space-between;padding: 39rpx 32rpx;">
				<view class="" style="font-size: 34rpx;color: #5A7EF6;font-weight: 800;">
					{{allText.首页.送礼物}}
				</view>
				<view class="" style="display: flex;align-items: center;font-size: 32rpx;font-weight: bold;">
					<image src="/static/home/zs.png" mode=""
						style="width: 28rpx;height: 28rpx;margin-right: 20rpx;"></image>
					<view class="">
						{{score}}
					</view>
				</view>
			</view>
			<swiper :indicator-dots="true" :autoplay="false" :interval="3000" :duration="1000"
				style="width: 100%;height: 450upx;">
				<swiper-item v-for="(i,k) in (Math.ceil(liwulist.length/8))" :key="k">
					<view class="" style="display: flex;flex-wrap: wrap;">
						<view class="" v-for="(n,m) in 8" style="width: 25%;">
							<view class="liwu" @tap="xuanz(k*8+m)" :class="{on:currents==k*8+m}">
								<view v-if="liwulist[k*8+m]">
									<image :src="liwulist[(k*8)+m].image" mode="aspectFill"
										style="width: 68upx;height: 74upx;padding-top: 15rpx;">
									</image>
									<view style="font-size: 26rpx;padding-top: 10rpx;">{{liwulist[(k*8)+m].name}}</view>
									<view style="font-size: 26rpx;padding-top: 5rpx;">{{liwulist[(k*8)+m].price}}
										钻石
									</view>

								</view>
							</view>
						</view>

					</view>
				</swiper-item>
			</swiper>
			<view class="" style="display: flex;align-items: center;margin: 0 26rpx 54rpx 26rpx;justify-content: space-between;">
				<view class="czbtn" @tap="shows1=true">
					{{allText.首页.充值余额}}
				</view>
				<view class="czbtn" @tap="sendgift">
					{{allText.首页.发送礼物}}
				</view>
			</view>

		</u-popup>
		
		<!-- 播放视频 -->
		<u-mask :show="tus" @click="msk" style="background: #000000;">
			<view class="" style="margin-top: 90upx;margin-left: 30rpx;">
				<u-icon name="arrow-left" color="#ffffff" size="50" @tap="back"></u-icon>
			</view>
		
			<video @tap="back" :src="src1" v-if="src1!=''" @fullscreenchange="horizontal" :autoplay="true"
				object-fit="cover" style="position: absolute;margin:auto;top:0;bottom:0;right:0;left:0;width: 100%;height: 400rpx;"></video>
		</u-mask>
		
		<u-modal v-model="beishow" :title="allText.首页.备注" :show-cancel-button="true" confirm-color="#333333" cancel-color="#858585"  @cancel="cancel" :confirm-text="allText.我的页.确定" :cancel-text="allText.我的页.取消" @confirm="confirm">
			<view class="slot-content" style="margin: 37rpx 60rpx;height: 92rpx;background: #F5F5F5;text-align: center;">
				<input type="text" :placeholder="allText.首页.备注" style="height: 92rpx;font-size: 28rpx;" v-model="nickname"/>
			</view>
			
		</u-modal>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				scrollTop: 0,
				list: [{
						image: '/static/home/mei.png',
						title: '昨夜星辰昨夜风，画楼西畔桂堂东'
					},
					{
						image: '/static/home/mei0.png',
						title: '身无彩凤双飞翼，心有灵犀一点通'
					}
				],
				beishow:false,
				lists: [],
				show: false,
				shows: false,
				shows1: false,
				zslist: [],
				current: 0,
				show1: false,
				liwulist: [],
				currents: 0,
				id:'',
				frienddetail:{},
				viewerInfo: {
					user_id: '',
					is_vip: 'three',
					vip_type: 0
				},
				tus: false,
				score:'',
				src1: '',
				nickname:''
			}
		},
		computed: {
			shouldBlurPhotos() {
				const isSelf = this.viewerInfo.user_id && this.frienddetail.user_id && this.viewerInfo.user_id == this.frienddetail.user_id
				return !this.isVipUser(this.viewerInfo) && !isSelf
			}
		},
		methods: {
			isVipUser(user) {
				return !!(user && (user.is_vip == 'one' || Number(user.vip_type) > 0))
			},
			goVipCenter() {
				this.util.urlTo('/pages/user/myvip')
			},
			cz(){
				
					this.util.request('vip/add_recharge',{
						token: uni.getStorageSync('user').token,
						good_id:this.zslist[this.current].good_id
					}).then(res=>{
						this.util.urlTo('/pages/user/pay?detail='+JSON.stringify(res))
					})
				
			},
			// 设置备注
			confirm(){
				
				this.util.request('friend/alias_user',{
					uid:this.id,
					token: uni.getStorageSync('user').token,
					name:this.nickname
				},'POST').then(res=>{
					this.util.showToast(res.msg)
					this.detail()
				})
			},
			// 赠送礼物
			sendgift() {
				this.util.request('gift/send_gift',{
					num:1,
					friend_id: this.id,
					token: uni.getStorageSync('user').token,
					gift_id:this.liwulist[this.currents].id
				},'POST').then(ext=>{
					this.util.showToast(ext.msg)
					this.gosvga()
				
				})
				
				
			
			},
			// 播放svga
			gosvga(){
				this.$refs.svga.render(async (parser, player) => {
					const videoItem = await parser.load(
						"https://daliaocdn.sydaliao.com/admin/20240523/b21a8d3aad91ace32c33feeb3543085d.svga"
						);
					this.show1 = false
					await player.setVideoItem(videoItem);
					// 设置当前动画的循环次数，0代表无限循环 默认 0
					player.loops = 1
					// 开始播放动画，reverse = true 时则反向播放。
					player.startAnimation()
					// 监听动画完成
					player.onFinished(() => {
						this.gity=false
											})
				})
			},
			gz(e){
				this.util.request('dynamic/follow_user', {
					friend_id: this.id,
					token: uni.getStorageSync('user').token
				}).then(res => {
					this.detail()
				})
			},
			horizontal(e) {
								if (e.detail.direction == 'vertical') {
					this.tus = false
					this.src1 = ''
				}
			
			},
			msk() {
				this.tus = false
				this.src1 = ''
			},
			back() {
				this.src1 = ''
			},
			look(b) {
					if (this.shouldBlurPhotos) {
						this.goVipCenter()
						return
					}
				
					if (b.file_type == 1) {
						this.util.lookImg(b.image)
					} else {
						this.src1 = b.image
						this.tus = true
					}
				
			
			},
			clicks(e){
				if (this.shouldBlurPhotos) {
					this.goVipCenter()
					return
				}
				this.util.lookImg(this.frienddetail.avatar_arr,e)
			},
			openDynamic(dynamicId) {
				if (this.shouldBlurPhotos) {
					this.goVipCenter()
					return
				}
				this.util.urlTo('/pages/index/dynamicdetail?id=' + dynamicId)
			},
			openAlbum() {
				if (this.shouldBlurPhotos) {
					this.goVipCenter()
					return
				}
				this.util.urlTo('/pages/index/taphoto?id=' + this.id)
			},
			gift(){
				this.util.request('gift/all_gift_list',{}).then(res=>{
					this.liwulist=res
				})
			},
			detail(){
				this.util.request('user/user_info',{
					token: uni.getStorageSync('user').token
				}).then(res=>{
					this.viewerInfo=res || this.viewerInfo
				})
				this.util.request('friend/user_info',{
					uid:this.id,
					token: uni.getStorageSync('user').token
				}).then(res=>{
					this.frienddetail=res
				})
				this.util.request('gift/my_son_num',{
					token: uni.getStorageSync('user').token
				}).then(res=>{
					this.score=res.score
				})
				this.util.request('vip/recharge_good_list',{
					token: uni.getStorageSync('user').token
				}).then(res=>{
					this.zslist=res
				})
			},
			xuanz(k) {
								this.currents = k
			},
			back(){
				uni.navigateBack()
			},
			
			click(e) {
								if (e == 0) {
					this.util.urlTo('/pages/index/report?id='+this.id)
				} else {
                   this.util.request('mi/forbid_user',{
					   uid:this.id,
					   token: uni.getStorageSync('user').token
				   },'POST').then(res=>{
					   					   this.util.showToast(res.msg)
				   })
				}
			}
		},
		onLoad(op) {
			this.id=op.id
		},
		onShow() {
			this.lists=[{
				text: this.allText.首页.举报
			}, {
				text:this.allText.首页.拉黑
			}],
			this.detail()
			this.gift()
		}
	}
</script>

<style lang="scss">
	.detail-top-actions {
		display: flex;
		align-items: center;
		justify-content: space-between;
		position: absolute;
		top: calc(var(--status-bar-height, 0px) + 48rpx);
		z-index: 99;
		width: 100%;
	}

	.detail-hero {
		position: relative;
		height: 700rpx;
		overflow: hidden;
		background: #f2f3f6;
	}

	.detail-hero-swiper {
		transition: filter 0.2s ease, transform 0.2s ease;
	}

	.detail-hero.is-locked .detail-hero-swiper {
		filter: blur(5px);
		transform: scale(1.035);
	}

	.vip-blur-window {
		position: absolute;
		left: 50%;
		top: 36%;
		z-index: 4;
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

	.detail-thumb-blurred {
		filter: blur(5px);
		transform: scale(1.03);
	}

	.liwu {
		width: 154rpx;
		height: 193rpx;
		border-radius: 20rpx;
		text-align: center;
		margin: 0 auto;
	}
	.czbtn{
		width: 341rpx;
		height: 86rpx;
		background: #5A7EF6;
		border-radius: 43rpx;
		text-align: center;
		line-height: 86rpx;
		font-size: 30rpx;color: #fff;
		
	}

	.on {
		width: 154rpx;
		height: 193rpx;
		background: linear-gradient(180deg, rgba(143, 160, 255, 0.2) 1%, rgba(131, 194, 255, 0.07) 98%);
		border-radius: 20rpx;
		border: 1rpx solid #9296FF;
		margin: 0 auto;
	}

	.uploadbtn {
		margin: 78rpx 105rpx 56rpx 103rpx;
		height: 86rpx;
		background: #5A7EF6;
		border-radius: 43rpx;
		text-align: center;
		line-height: 86rpx;
		font-size: 30rpx;
		color: #fff;
	}

	.title {
		font-size: 32rpx;
		font-weight: bold;
		display: flex;
		align-items: center;
		padding: 0 0 19rpx 24rpx;
	}

	.fen {
		width: 8rpx;
		height: 32rpx;
		background: #FF5F79;
		border-radius: 4rpx;
		margin-right: 15rpx;
	}

	.btn {
		padding: 17rpx 29rpx;
		background: #EEF2FE;
		font-size: 28rpx;
		color: #5A7EF6;
		border-radius: 30rpx;
		margin-top: 10rpx;
		margin-right: 20rpx;
	}

	.footbtn {
		width: 225rpx;
		height: 86rpx;
		background: #5A7EF6;
		border-radius: 43rpx;
		text-align: center;
		line-height: 86rpx;
		font-size: 30rpx;
		color: #fff;
		font-weight: bold;
	}

	.zsbtn {
		width: 200rpx;
		height: 230rpx;
		background: rgba(153, 153, 153, 0.1);
		border-radius: 20rpx;
		color: #222222;

		.neibtn {
			width: 174rpx;
			height: 42rpx;
			background: #5A7EF6;
			border-radius: 10rpx;
			text-align: center;
			line-height: 42rpx;
			font-size: 22rpx;
			color: #FFFFFF;
			margin: 25rpx auto;
		}
	}

	.xzsbtn {
		width: 200rpx;
		height: 230rpx;
		background: rgba(90, 126, 246, 0.12);
		border-radius: 20rpx;
		border: 2rpx solid #5D81F7;
		color: #5A7EF6;

		.neibtn {
			width: 174rpx;
			height: 42rpx;
			background: #5A7EF6;
			border-radius: 10rpx;
			text-align: center;
			line-height: 42rpx;
			font-size: 22rpx;
			color: #FFFFFF;
			margin: 25rpx auto;
		}
	}
</style>
