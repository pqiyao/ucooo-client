<template>
	<view>
		<view class="" style="display: flex;align-items: center;justify-content: space-between;height: 139rpx;padding: 0 30rpx 0 40rpx;border-bottom: 1rpx solid #EEEEEE;" v-for="(i,k) in zanlist" :key="k">
		     	<view class="" style="display: flex;align-items: center;">
		     		<image :src="i.avatar" mode="aspectFill" style="width: 100rpx;height: 100rpx;border-radius: 50%;"></image>
					<view class="" style="padding-left: 28rpx;">
						<view class="" style="font-size: 30rpx;font-weight: 800;">
							{{i.nickname}}
						</view>
						<view class="" style="font-size: 22rpx;padding-top: 10rpx;">
							{{i.createtime_attr}}{{allText.我的页.赞了你的动态}}
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
				page:1,
				zanlist:[]
			}
		},
		methods: {
			myzan(e){
				if(e==1){
					this.page=1
					this.zanlist=[]
				}
				this.util.request('dynamic/dynamic_user_great_list',{
					token: uni.getStorageSync('user').token,
					page:this.page
				}).then(res=>{
					this.zanlist=this.zanlist.concat(res)
					this.page++
				})
			}
		},
		onShow() {
			this.myzan(1)
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