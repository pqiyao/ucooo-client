<template>
	<view>
		<view class="" style="height: 6rpx;box-shadow: 0rpx 3rpx 3rpx 0rpx rgba(153,153,153,0.1);"></view>
		<view class="title" style="margin-top: 38rpx;display: flex;align-items: center;justify-content: space-between;font-size: 30rpx;padding: 0 20rpx 0 28rpx;">
			<view class="" style="display: flex;align-items: center;">
				<view class="">
					{{allText.首页.TA的相册}}
				</view>
			</view>
			<view class="" style="margin-right: 26rpx;">
				<u-icon name="arrow-right" color="#222222 " size="28"></u-icon>
			</view>
		</view>
		<view class="" style="display: flex;align-items: center;flex-wrap: wrap;margin: 19rpx 15rpx;">
			<view class="" style="width: 33.3%;text-align: center;margin-top: 10rpx;" v-for="(i,k) in image_pub" :key="k" @tap="look(i.id,i)">
				<view class="album-thumb">
					<image :src="i.image" mode="aspectFill" :class="{'is-photo-blurred': shouldBlurPhotos}" style="width: 218rpx;height: 284rpx;border-radius: 15rpx;"></image>
					<view class="vip-blur-window" v-if="shouldBlurPhotos">VIP</view>
				</view>
			</view>
		</view>
		
		<view class="title" style="margin-top: 38rpx;display: flex;align-items: center;justify-content: space-between;font-size: 30rpx;padding: 0 20rpx 0 28rpx;">
			<view class="" style="display: flex;align-items: center;">
				<view class="">
					{{allText.首页.视频}}
				</view>
			</view>
			<view class="" style="margin-right: 26rpx;">
				<u-icon name="arrow-right" color="#222222 " size="28"></u-icon>
			</view>
		</view>
		<view class="" style="display: flex;align-items: center;flex-wrap: wrap;margin: 19rpx 15rpx;">
			<!-- <view class="" style="width: 33.3%;text-align: center;margin-top: 10rpx;" v-for="i in 3">
				<view class="" style="width: 218rpx;height: 284rpx;border-radius: 15rpx;background: url(/static/home/mei.png) no-repeat;background-size: 100% 100%;margin: 0 auto;display: flex;align-items: center;justify-content: center;">
					<image src="/static/home/bo.png" mode="" style="width: 86rpx;height: 86rpx;"></image>
				</view>
			
			</view> -->
			<view class="" style="width: 33.3%;" v-for="(i,k) in video" :key="k" @tap="look(i.id,i)">
				<view class="album-thumb"
					style="width: 218rpx;height: 284rpx;border-radius: 16rpx;position: relative;margin: 25rpx auto;">
					<image :src="i.image+'?x-oss-process=video/snapshot,t_0,f_jpg,w_218,h_284'" mode="aspectFill"
						:class="{'is-photo-blurred': shouldBlurPhotos}" style="width: 218rpx;height: 284rpx;border-radius: 16rpx;">
					</image>
					<view class="vip-blur-window" v-if="shouldBlurPhotos">VIP</view>
			
					<image src="/static/home/bo.png" mode=""
						style="width: 66rpx;height: 66rpx;position: absolute;top: 81rpx;left: 76rpx;z-index: 9999;" v-if="!shouldBlurPhotos"></image>
				</view>
			</view>
		</view>
		<!-- 播放视频 -->
		<u-mask :show="tus" @click="msk" style="background: #000000;">
			<view class="" style="margin-top: 90upx;margin-left: 30rpx;">
				<u-icon name="arrow-left" color="#ffffff" size="50" @tap="back"></u-icon>
			</view>
		
			<video @tap="back" :src="src1" v-if="src1!=''" @fullscreenchange="horizontal" :autoplay="true"
				object-fit="cover" style="position: absolute;margin:auto;top:0;bottom:0;right:0;left:0;width: 100%;height: 400rpx;"></video>
		</u-mask>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				id:'',
				image_pub:[],
				video:[],
				viewerInfo: {
					user_id: '',
					is_vip: 'three',
					vip_type: 0
				},
				tus: false,
				src1: ''
			}
		},
		computed: {
			shouldBlurPhotos() {
				const isSelf = this.viewerInfo.user_id && this.viewerInfo.user_id == this.id
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
			look(a, b) {
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
			get_phone(){
				this.util.request('user/user_info',{
					token: uni.getStorageSync('user').token
				}).then(res=>{
					this.viewerInfo=res || this.viewerInfo
				})
				this.util.request('user/photo_group',{
					uid:this.id,
					token: uni.getStorageSync('user').token
				}).then(res=>{
					this.image_pub=res.image_pub
					this.video=res.video
				})
			}
		},
		onLoad(op) {
			this.id=op.id
		},
		onShow() {
			this.get_phone()
		}
	}
</script>

<style>
	.album-thumb {
		position: relative;
		width: 218rpx;
		height: 284rpx;
		margin: 0 auto;
		overflow: hidden;
		border-radius: 16rpx;
		background: #f2f3f6;
	}

	.is-photo-blurred {
		filter: blur(5px);
		transform: scale(1.035);
	}

	.vip-blur-window {
		position: absolute;
		left: 50%;
		top: 42%;
		transform: translate(-50%, -50%);
		min-width: 92rpx;
		height: 42rpx;
		padding: 0 18rpx;
		border-radius: 999rpx;
		background: rgba(255, 255, 255, 0.26);
		border: 1rpx solid rgba(255, 255, 255, 0.62);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 24rpx;
		font-weight: 700;
		color: #ffffff;
		text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.26);
		z-index: 2;
	}

</style>
