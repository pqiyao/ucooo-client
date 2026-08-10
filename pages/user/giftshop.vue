<template>
	<view>
		<!-- <u-tabs :list="list" :is-scroll="false" :current="current1" @change="change"></u-tabs> -->
		<view class="" style="display: flex;align-items: center;flex-wrap: wrap;">
			<view style="width: 50%;margin-top: 25rpx;" @tap="setliwu = i" v-for="(i,k) in liwulist" :key="k" >
				<view class="on" :class="i.id == setliwu.id?'on1':''">
					<image :src="i.image" mode="aspectFill" style="width: 170upx;height: 170upx;padding-top: 23rpx;">
					</image>
					<view style="font-size: 26rpx;padding-top: 15rpx;">{{i.name}}</view>
					<view style="font-size: 26rpx;padding-top: 15rpx;">{{i.price}}{{allText.我的页.钻}}</view>
					<!-- <view style="font-size: 24rpx;padding-top: 5rpx;color: #999999;">{{current1==0 ? allText.我的页.来自 : allText.我的页.送出}}:{{i.nickname}}</view>
					<view style="font-size: 24rpx;padding-top: 17rpx;color: #999999;">{{i.createtime_attr}}</view> -->

				</view>
			</view>
		</view>
		<view class="" style="margin: 54rpx 30rpx;">
			<fui-button background="#5A7EF6" radius="46rpx"
				@click="sendGift">{{allText.首页.送礼物}}</fui-button>
		</view>
	</view>
</template>

<script>
	import fuiButton from "@/components/firstui/fui-button/fui-button.vue"
	export default {
		data() {
			return {
				liwulist: [],
				current: 0,
				list: [{
					name: this.allText.首页.我收到的
					
				}, {
					name: this.allText.首页.我送出的
				}],
				current1: 0,
				setliwu:{}
			}
		},
		components: {
			fuiButton
		},
		methods: {
			sendGift() {
				const giftId = this.setliwu && this.setliwu.id
				if (!giftId) {
					this.util.showToast('请先选择礼物')
					return false
				}
				this.util.urlTo('/pages/user/sendgift?id=' + giftId)
			},
			gift() {
				this.util.request('gift/all_gift_list', {}).then(res => {
					this.liwulist = res
				})
				// this.util.request('gift/gifts_log_list', {
				// 	type:this.current1==0 ? 2 : 1,
				// 	token: uni.getStorageSync('user').token,
				// }).then(res => {
				// 	this.liwulist = res
				// })
				
			},
			change(index) {
				this.current1 = index;
				this.gift()
			}
		},
		onShow() {
			uni.setNavigationBarTitle({
				title:this.allText.我的页.礼物商城
			})
			this.gift()
		}
	}
</script>

<style>
	page{
		background: #FAFBFF;
	}
	.on {
		width: 351rpx;
		
		background: #FFFFFF;
		box-shadow: 0rpx 4rpx 19rpx 0rpx #F6F7FF;
		border-radius: 15rpx;
		margin: 0 auto;
		text-align: center;
		padding-bottom: 16rpx;
	}

	.on1 {
		width: 154rpx;
		height: 193rpx;
		background: linear-gradient(180deg, rgba(143, 160, 255, 0.2) 1%, rgba(131, 194, 255, 0.07) 98%);
		border-radius: 20rpx;
		border: 1rpx solid #9296FF;
		text-align: center;
		margin: 0 auto;
	}
</style>
