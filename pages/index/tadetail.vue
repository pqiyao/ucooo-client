<template>
	<view>
		<view class="" style="height: 6rpx;box-shadow: 0rpx 3rpx 3rpx 0rpx rgba(153,153,153,0.1);"></view>
		<view class="title" style="margin-top: 38rpx;display: flex;align-items: center;justify-content: space-between;font-size: 30rpx;padding: 0 20rpx 0 28rpx;">
			<view class="" style="display: flex;align-items: center;">
				<view class="">
					{{allText.首页.TA的相册}}
				</view>
			</view>
			
		</view>
		<view class="" style="display: flex;align-items: center;flex-wrap: wrap;margin: 19rpx 15rpx;">
			<view class="" style="width: 33.3%;text-align: center;margin-top: 10rpx;" v-for="i in 3">
				<image src="/static/home/mei.png" mode="aspectFill" style="width: 218rpx;height: 284rpx;border-radius: 15rpx;"></image>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				
			}
		},
		methods: {
			
		}
	}
</script>

<style>

</style>
