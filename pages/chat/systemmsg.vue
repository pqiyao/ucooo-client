<template>
	<view>
		<view class="" style="margin: 20rpx 30rpx;background: #fff;border-radius: 12rpx;" v-for="(i,k) in list" :key="k">
			<view class="" style="display: flex;align-items: center;justify-content: space-between;padding: 33rpx 35rpx;">
				<view class="" style="font-size: 26rpx;display: flex;align-items: center;">
					<view class="" style="width: 32rpx;height: 32rpx;margin-right: 16rpx;">
						<image src="/static/chat/xx.png" mode="" style="width: 32rpx;height: 32rpx;"></image>
					</view>
					
					<view class="">
						{{allText.动态页聊天页.系统消息}}
					</view>
				</view>
				<view class="" style="font-size: 24rpx;">
					{{i.createtime_attr}}
				</view>
			</view>
			<view class="" style="font-size: 28rpx;padding: 10rpx 24rpx 27rpx 28rpx;">
				{{i.title}}
			</view>
			<view class="" style="font-size: 26rpx;color: #666;padding: 0 24rpx 50rpx 31rpx;">
				{{i.content}}
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				list:[]
			}
		},
		methods: {
			sys(){
				this.util.request('user/sys_list',{
					token: uni.getStorageSync('user').token
				}).then(res=>{
					this.list=res
				})
			}
		},
		onShow() {
			this.sys()
		}
	}
</script>

<style>
	page{
		background: #EEEEEE;
	}

</style>
