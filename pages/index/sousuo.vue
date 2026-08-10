<template>
	<view>
		<view class="" style="margin: 10rpx 30rpx;">
			<u-search :placeholder="allText.首页.搜索用户名" v-model="keyword" height="80" @custom="friend(1)" @search="friend(1)" :show-action="false"></u-search>
		</view>
		<scroll-view scroll-y="true" id="box" :style="{height:boxHeight+'px'}" @scrolltolower="scrolltolower">
		<view class="page-box">
		   <!-- 人员列表 -->
		   <view class="" style="display: flex;align-items: center;flex-wrap: wrap;margin: 15rpx 28rpx;">
		   	<view class="" style="width: 50%;margin-top: 20rpx;" v-for="(i,k) in friend_list" :key="k">
		   		<view class="discover-photo-card" @tap="getjoop(i.user_id)">
					<view class="discover-photo-bg" :class="{'is-photo-blurred': shouldBlurPhotos}"
						:style="{backgroundImage:'url('+i.avatar+')'}"></view>
					<view class="vip-blur-window" v-if="shouldBlurPhotos">VIP</view>
		   			<view class="discover-card-info"
		   				style="padding: 25rpx 12rpx;width: 100%;background: linear-gradient(0deg, #000000 0%, rgba(0,0,0,0) 100%);border-radius: 20rpx;">
		   				<view class="" style="font-size: 24rpx;color: #fff;display: flex;align-items: center;">
		   					<text>{{i.nickname}}</text>
		   					<view class=""
		   						style="width: 67rpx;height: 30rpx;background: #fff;border-radius: 15rpx;font-size: 21rpx;display: flex;align-items: center;justify-content: center;margin-left: 6rpx;" :style="{color:i.gender==2 ? '#FF738E' : '#56A0FF'}">
		   						<image :src="i.gender==2 ? '/static/home/nv.png' : '/static/home/nan.png'" mode=""
		   							style="width: 24rpx;height: 24rpx;margin-right: 5rpx;"></image>
		   						<text>{{i.age}}</text>
		   					</view>
		   					<image :src="i.vip_type==1 ? '/static/home/vip.png' : '/static/work/vip.png'" mode=""
		   						style="width: 28rpx;height: 28rpx;margin-left: 5rpx;" v-if="i.vip_type&&i.vip_type!=0">
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
		   					<view class="" style="display: flex;align-items: center;">
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
		   				<image src="/static/home/guan.png" mode="" style="width: 30rpx;height: 30rpx;"></image>
		   				<view class="">
		   					{{i.gender==2 ? allText.首页.女神 :  allText.首页.男神}}
		   				</view>
		   			</view>
		   		</view>
		   	</view>
		   </view>
					 
		</view>
		</scroll-view>
		<u-popup v-model="show" mode="center" width="624rpx" height="308rpx" border-radius="20">
			<view style="font-size: 30rpx;font-weight: bold;text-align: center;padding-top: 74rpx;">{{allText.首页.该功能仅对VIP会员开放}}</view>
			<view class="btn" @tap="util.urlTo('/pages/user/myvip')">
				{{allText.首页.升级VIP会员}}
			</view>
		</u-popup>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				keyword: '',
				page: 1,
				boxHeight:'',
				friend_list:[],
				show:false,
				viewerInfo: {
					is_vip: 'three',
					vip_type: 0
				}
			}
		},
		computed: {
			shouldBlurPhotos() {
				return !this.isVipUser(this.viewerInfo)
			}
		},
		onReady() {
			this.box();
		},
		methods: {
			isVipUser(user) {
				return !!(user && (user.is_vip == 'one' || Number(user.vip_type) > 0))
			},
			getjoop(e){
				this.util.urlTo('/pages/index/userdetail?id='+e)
				// this.util.request('user/user_info',{
				// 	token: uni.getStorageSync('user').token
				// }).then(res=>{
				// 	if(res.vip_type!=0&&res.vip_type){
				// 		this.util.urlTo('/pages/index/userdetail?id='+e)
				// 	}else{
				// 		this.show=true
				// 	}
					
				// })
				
			},
			scrolltolower(){
				this.friend()
			},
			friend(e) {
				if(e==1){
					this.page=1
					this.friend_list=[]
				}
				this.util.request('friend/user_list', {
					page: this.page,
					token: uni.getStorageSync('user').token,
					key_word:this.keyword
				},'POST').then(res => {
					if(res.code==1){
						this.friend_list=this.friend_list.concat(res.data)
						this.page++
					}else{
						this.show=true
					}
			        
				})
			},
			box() {
				uni.getSystemInfo({
					success: e => {
						const query = uni.createSelectorQuery().in(this);
						query.select('#box').boundingClientRect(data => {
							this.boxHeight = e.screenHeight - data.top - 50;
													}).exec();
					}
				})
			},
		},
		onShow() {
			this.util.request('user/user_info',{
				token: uni.getStorageSync('user').token
			}).then(res=>{
				this.viewerInfo=res || this.viewerInfo
			})
		}
	}
</script>

<style>
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
		width: 336rpx;
		height: 424rpx;
		margin: 0 auto;
		border-radius: 20rpx;
		display: flex;
		align-items: flex-end;
		background: #f2f3f6;
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
		font-size: 24rpx;
		font-weight: 700;
		color: #ffffff;
		text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.26);
	}

</style>
