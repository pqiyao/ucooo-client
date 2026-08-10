<template>
	<view class="mymoney-page">
		<u-navbar :title="allText.我的页.我的钱包" :background="background" :immersive="true" title-size="34" :title-bold="true"
			title-color="#FFFFFF" back-icon-color="#fff"></u-navbar>
		<view class="" style="width: 100%;height: 535rpx;background: url(/static/user/moneybg.png) no-repeat;background-size: 100% 100%;">
			<view class="" style="padding: 220rpx 30rpx 0 30rpx;">
				<view class="" style="height: 220rpx;background: url(/static/user/zsbg.png) no-repeat;background-size: 100% 100%;z-index: 9999;">
					<view class="" style="font-size: 30rpx;color: #FF5F79;padding-top: 53rpx;padding-left: 41rpx;">
						{{allText.我的页.我的钻石}}
					</view>
					<view class="" style="font-size: 52rpx;color: #FF5F79;font-weight: bold;padding-top: 10rpx;padding-left: 41rpx;">
						{{userinfo.score}}
					</view>
				</view>
			</view>	
		</view>
		<view class="" style="font-size: 32rpx;font-weight: bold;padding-left: 29rpx;">
			{{allText.首页.充值钻石}}
		</view>
		<view class="" style="margin-top: 34rpx;">
			<scroll-view :scroll-top="scrollTop" scroll-x="true" class="scroll-Y" style="white-space: nowrap;">
				<view class="" style="display: flex;align-items: center;">
					<view class="" v-for="(i,k) in list" :key="k" style="margin-left: 30rpx;">
						<view :class="current==k ? 'xzsbtn' : 'zsbtn'" @tap="current=k">
							<view class=""
								style="font-size: 26rpx;display: flex;align-items: center;justify-content: center;padding-top: 47rpx;">
								{{i.diamond}}{{allText.我的页.钻}}
							</view>
							<view class="" style="font-size: 40rpx;font-weight: bold;text-align: center;padding-top: 25rpx;">
								${{i.price}}
							</view>
							<view class="neibtn">
								+{{allText.我的页.赠送}}{{i.zengsong_diamond}}{{allText.我的页.钻}}
							</view>
		
						</view>
					</view>
		
				</view>
			</scroll-view>
		</view>
		<!-- <view class="" style="font-size: 26rpx;color: #666;padding-top: 37rpx;padding-left: 32rpx;">
			{{allText.我的页.限时特惠活动中请到我的会员中心开通会员}}
		</view> -->
		<view class="pay-bottom-wrap">
			<pay-kefu-fab mode="bar" />
			<view class="pay-bottom-actions">
				<fui-button background="#FF5F79" radius="46rpx" :disabled="submitting" :loading="submitting" @click="pay">{{allText.首页.确认充值}}</fui-button>
			</view>
		</view>
	</view>
</template>

<script>
	import fuiButton from "@/components/firstui/fui-button/fui-button.vue"
	export default {
		data() {
			return {
				background: {
					backgroundColor: ''
				},
				current:0,
				scrollTop:0,
				userinfo:{},
				list:[],
				submitting:false
			}
		},
		components: {
			fuiButton
		},
		methods: {
			pay(){
				if (this.submitting) return
				const selected = this.list[this.current]
				if (!selected || !selected.good_id) {
					this.util.showToast('请选择充值套餐')
					return
				}
				this.submitting = true
				this.util.request('vip/add_recharge',{
					token: uni.getStorageSync('user').token,
					good_id:selected.good_id
				}).then(res=>{
					this.util.urlTo('/pages/user/pay?detail='+JSON.stringify(res))
				}).catch(() => {}).then(() => {
					this.submitting = false
				})
			},
			mymoney(){
				this.util.request('gift/my_son_num',{
					token: uni.getStorageSync('user').token
				}).then(res=>{
					this.userinfo=res
				})
				this.util.request('vip/recharge_good_list',{
					token: uni.getStorageSync('user').token
				}).then(res=>{
					this.list=res
				})
			}
		},
		onShow() {
			this.mymoney()
		}
	}
</script>

<style lang="scss">
.mymoney-page {
	padding-bottom: 320rpx;
}

.pay-bottom-wrap {
	position: fixed;
	bottom: 0;
	left: 0;
	width: 100%;
	padding-bottom: constant(safe-area-inset-bottom);
	padding-bottom: env(safe-area-inset-bottom);
	background: #fff;
}

.pay-bottom-actions {
	margin: 0 30rpx 40rpx;
}

.zsbtn {
		width: 260rpx;
		height: 255rpx;
		background: #F2F2F2;
		border-radius: 20rpx;
		color: #222222;

		.neibtn {
			// width: 174rpx;
			height: 42rpx;
			background: rgba(221,221,221,0.8);
			border-radius: 10rpx;
			text-align: center;
			line-height: 42rpx;
			font-size: 22rpx;
			color: #666666;
			margin: 25rpx 10rpx;
		}
	}

	.xzsbtn {
		width: 260rpx;
		height: 255rpx;
		background: #F3F9FF;
		border-radius: 20rpx;
		border: 2rpx solid #FFBBC6;
		color: #222222;

		.neibtn {
			// width: 178rpx;
			height: 42rpx;
			background: rgba(255,187,198,0.3);
			border-radius: 10rpx;
			text-align: center;
			line-height: 42rpx;
			font-size: 22rpx;
			color:#FF5F79;
			margin: 25rpx 10rpx;
		}
	}
</style>
