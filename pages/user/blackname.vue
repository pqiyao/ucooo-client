<template>
	<view>
		<view class="" style="display: flex;align-items: center;justify-content: space-between;height: 139rpx;padding: 0 30rpx 0 40rpx;border-bottom: 1rpx solid #EEEEEE;" v-for="(i,k) in list" :key="k">
		     	<view class="" style="display: flex;align-items: center;">
		     		<image :src="i.avatar" mode="aspectFill" style="width: 100rpx;height: 100rpx;border-radius: 50%;"></image>
					<view class="" style="padding-left: 28rpx;">
						<view class="" style="font-size: 30rpx;font-weight: 800;">
							{{i.nickname}}
						</view>
						<view class="" style="font-size: 22rpx;padding-top: 10rpx;">
							{{i.height}}cm·{{i.weight}}kg·{{i.occupation_arr}}
						</view>
					</view>
		     	</view>
				<view class="btn" @tap="canle(i.user_id)">
					{{allText.首页.取消}}
				</view>
		     
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
			   page:1,
			   list:[]
			}
		},
		onReachBottom() {
			this.getblack()
		},
		methods: {
			getblack(e){
				if(e==1){
					this.page=1
					this.list=[]
				}
				this.util.request('friend/lahei_list',{
					token: uni.getStorageSync('user').token,
					page:this.page
				}).then(res=>{
					this.list=this.list.concat(res)
					this.page++
				})
			},
			canle(e){
				this.util.request('mi/forbid_user',{
					token: uni.getStorageSync('user').token,
					uid:e
				},'POST').then(res=>{
					this.util.showToast(res.msg)
					this.getblack(1)
				})
			}
		},
		onShow() {
			this.getblack(1)
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