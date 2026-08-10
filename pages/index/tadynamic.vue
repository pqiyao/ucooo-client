<template>
	<view>
		<view class="" style="height: 6rpx;box-shadow: 0rpx 3rpx 3rpx 0rpx rgba(153,153,153,0.1);"></view>
		<view class="" style="border-bottom: 1rpx solid #F5F5F5;">
			<view class="" style="display: flex;align-items: center;justify-content: space-between;padding: 28rpx 24rpx;">
				<view class="" style="display: flex;align-items: center;">
					<image src="/static/login/nv.png" mode="aspectFill" style="width: 110rpx;height: 110rpx;border-radius: 50%;"></image>
					<view class="" style="font-size: 30rpx;font-weight: bold;margin-left: 14rpx;">
						俄的幸福需要Ni
					</view>
				</view>
				<view class="btn">
					+ 关注
				</view>
			</view>
			<view class="" style="padding: 0 26rpx 10rpx 26rpx;font-size: 28rpx;">
				辣妹出击！轻松实现夏日穿搭！
			</view>
			<view class="" style="display: flex;align-items: center;flex-wrap: wrap;margin: 0 25rpx;">
				<view class="" style="width: 33.3%;text-align: center;margin-top: 10rpx;" v-for="i in 4">
					<image src="/static/home/mei.png" mode="aspectFill" style="width: 230rpx;height: 230rpx;border-radius: 15rpx;"></image>
				</view>
			</view>
			<view class="" style="width: 420rpx;height: 508rpx;background: url(/static/home/mei.png) no-repeat;background-size: 100% 100%;border-radius: 20rpx;display: flex;align-items: center;justify-content: center;margin: 22rpx 29rpx;">
				<image src="/static/home/bo.png" mode="" style="width: 86rpx;height: 86rpx;"></image>
			</view>
			<view class="" style="display: flex;align-items: center;justify-content: space-between;padding: 33rpx 37rpx;">
				<view class="" style="display: flex;align-items: center;">
					<view class="" style="display: flex;align-items: center;font-size: 26rpx;">
						<image src="/static/home/zan.png" mode="" style="width: 30rpx;height: 30rpx;"></image>
						<view class="" style="padding-left: 10rpx;">
							0
						</view>
					</view>
					<view class="" style="display: flex;align-items: center;font-size: 26rpx;margin-left: 64rpx;">
						<image src="/static/home/edits.png" mode="" style="width: 30rpx;height: 30rpx;"></image>
						<view class="" style="padding-left: 10rpx;">
							234
						</view>
					</view>
				</view>
				<view class="" style="font-size: 26rpx;display: flex;align-items: center;">
					<image src="/static/home/sendchat.png" mode="" style="width: 32rpx;height: 32rpx;"></image>
					<view class="" style="padding-left: 13rpx;">
						发消息
					</view>
				</view>
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
	.btn{
		width: 140rpx;
		height: 50rpx;
		border-radius: 25rpx;
		border: 1rpx solid #333333;
		text-align: center;
		line-height: 50rpx;
		font-size: 26rpx;
		
	}

</style>
