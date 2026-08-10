<template>
	<view>
		<view class="" style="margin: 15rpx 30rpx;">
			<u-search :placeholder="allText.我的页.搜索用户名" v-model="keyword" @search="search" @custom="search"></u-search>
		</view>
		<scroll-view scroll-y="true" id="box" :style="{height:boxHeight+'px'}" @scrolltolower="scrolltolower">
		<view class="" style="display: flex;align-items: center;justify-content: space-between;height: 139rpx;padding: 0 30rpx 0 40rpx;border-bottom: 1rpx solid #EEEEEE;" v-for="(i,k) in friend_list" :key="k">
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
				<view class="btn" :class="{ 'is-disabled': submitting }" @tap="sendgift(i.user_id)">
					{{allText.我的页.赠送}}
				</view>
		     
		</view>
		</scroll-view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				keyword: '',
				boxHeight:'',
				friend_list:[],
				page:1,
				gift_id:'',
				submitting:false
			}
		},
		onReady() {
			this.box();
		},
		onLoad(op) {
			this.gift_id=op.id
		},
		methods: {
			sendgift(e){
				if (this.submitting) return
				if (!e || !this.gift_id) {
					this.util.showToast('礼物或收礼用户无效')
					return
				}
				this.submitting = true
				this.util.request('gift/send_gift',{
					num:1,
					friend_id: e,
					token: uni.getStorageSync('user').token,
					gift_id:this.gift_id
				}).then(ext=>{
					this.util.showToast('赠送成功！')
				}).catch(() => {}).then(() => {
					this.submitting = false
				})
			},
			box() {
				uni.getSystemInfo({
					success: e => {
						const query = uni.createSelectorQuery().in(this);
						query.select('#box').boundingClientRect(data => {
							this.boxHeight = e.screenHeight - data.top - 50;
													}).exec();
					}
				})
			},
			search(e){
				if(e==1){
					this.page=1
					this.friend_list=[]
				}
				this.util.request('friend/user_list', {
					page: this.page,
					token: uni.getStorageSync('user').token,
					keyword:this.keyword
				}).then(res => {
				     this.friend_list=this.friend_list.concat(res)
					 this.page++
				})
			},
			
			scrolltolower(){
				this.search()
			}
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
	.btn.is-disabled { opacity: .62; }

</style>
