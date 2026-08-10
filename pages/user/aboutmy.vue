<template>
	<view>
		<view class="" style="text-align: center;padding-top: 190rpx;">
			<image src="/static/logo.png" mode="" style="width: 229rpx;height: 229rpx;"></image>
			<view class="" style="font-size: 36rpx;font-weight: bold;">
				@yuming
			</view>
			<view class="" style="font-size: 28rpx;">
				版本 V{{ currentVersionName }}
			</view>
		</view>
		
	</view>
</template>

<script>
	import appUpdate from '@/common/appUpdate.js'

	export default {
		data() {
			return {
				currentVersionName: '--'
			}
		},
		methods: {
			loadRuntimeVersion() {
				appUpdate.getClientInfo().then(info => {
					this.currentVersionName = String(info.version_name || '--')
				})
			},
		},
		onShow() {
			this.loadRuntimeVersion()
		}
	}
</script>

<style>

</style>
