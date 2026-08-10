<template>
	<view>
		<u-tabs :list="list" :is-scroll="false" :current="current" @change="change" active-color="#333333" inactive-color="#999999"></u-tabs>
		<view class="" style="display: flex;align-items: center;justify-content: space-between;height: 139rpx;padding: 0 30rpx 0 40rpx;border-bottom: 1rpx solid #EEEEEE;" v-for="(i,k) in visit_list" :key="k">
		     	<view class="" style="display: flex;align-items: center;">
		     		<image :src="i.avatar" mode="aspectFill" style="width: 100rpx;height: 100rpx;border-radius: 50%;"></image>
					<view class="" style="padding-left: 28rpx;">
						<view class="" style="font-size: 30rpx;font-weight: 800;">
							{{i.nickname}}
						</view>
						<view class="" style="font-size: 22rpx;padding-top: 10rpx;">
							{{i.createtime_attr}} {{current==0 ? '访问了您' : '访问了ta'}}
						</view>
					</view>
		     	</view>
		</view>
		<u-modal v-model="showVip" content="该功能仅对VIP会员开放" :show-cancel-button="true" confirm-text="升级VIP会员" @confirm="goVip"></u-modal>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				list: [{
					name: this.allText.我的页.谁看过我
				}, {
					name: this.allText.我的页.我看过谁
				}],
				current: 0,
				visit_list:[],
				page:1,
				showVip:false
			}
		},
		onShow() {
			this.focuson(1)
			
		},
		methods: {
			goVip(){
				this.showVip = false
				this.util.urlTo('/pages/user/myvip')
			},
			handleVipResult(res){
				if (res && Number(res.code) === 10005) {
					this.showVip = true
					return null
				}
				return Array.isArray(res) ? res : []
			},
			change(index) {
				this.current = index;
				if(index==0){
					this.focuson(1)
				}else{
					this.getfans(1)
				}
			},
			focuson(e){
				if(e==1){
					this.page=1
					this.visit_list=[]
				}
				this.util.request('dynamic/visit_me_list',{
					page:this.page,
					token: uni.getStorageSync('user').token
				}).then(res=>{
					const rows = this.handleVipResult(res)
					if (!rows) return
					this.visit_list=this.visit_list.concat(rows)
					this.page++
				})
			},
			getfans(e){
				if(e==1){
					this.page=1
					this.visit_list=[]
				}
				this.util.request('dynamic/visit_list',{
					page:this.page,
					token: uni.getStorageSync('user').token
				}).then(res=>{
					const rows = this.handleVipResult(res)
					if (!rows) return
					this.visit_list=this.visit_list.concat(rows)
					this.page++
				})
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

</style>
