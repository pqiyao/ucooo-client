<template>
	<view>
		<view class="" style="display: flex;align-items: center;flex-wrap: wrap;">
			<view style="width: 25%;margin-top: 25rpx;" v-for="i in 10">
				<view class="on">
					<image src="/static/logo.png" mode="aspectFill"
						style="width: 68upx;height: 74upx;padding-top: 15rpx;">
					</image>
					<view style="font-size: 26rpx;padding-top: 10rpx;">白酒</view>
					<view style="font-size: 24rpx;padding-top: 5rpx;color: #999999;">299
						钻石
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
	.on {
		width: 154rpx;
		height: 193rpx;
		background: rgba(153,153,153,0.1);
		border-radius: 20rpx;
		margin: 0 auto;
		text-align: center;
	}

</style>
