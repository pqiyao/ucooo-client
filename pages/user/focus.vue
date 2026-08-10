<template>
	<view class="focus-page">
		<u-tabs :list="list" :is-scroll="false" :current="current" @change="change" active-color="#333333" inactive-color="#999999"></u-tabs>
		<view class="focus-item" hover-class="focus-item-hover" hover-stay-time="80" v-for="(i,k) in focuson_list" :key="k" @tap="goUser(i.user_id)">
		     	<view class="user-main">
		     		<image :src="i.avatar" mode="aspectFill" class="avatar"></image>
					<view class="user-info">
						<view class="nickname">
							{{i.nickname}}
						</view>
						<view class="meta">
							{{i.height}}cm·{{i.weight}}kg·{{i.occupation_arr}}
						</view>
					</view>
		     	</view>
				<view class="btn" v-if="current==0" @tap.stop="gz(i.user_id,k)">
					{{allText.首页.已关注}}
				</view>
		       <view class="btn" v-if="current==1" @tap.stop="gz(i.user_id,k)">
		       	  {{i.have_follow==1 ? allText.首页.已关注 : allText.我的页.回关}}
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
					name: this.allText.首页.关注
				}, {
					name: this.allText.我的页.粉丝
				}],
				current: 0,
				page:1,
				focuson_list:[],
				fans_list:[],
				showVip:false
			}
		},
		onLoad(op) {
			this.current = Number(op.current) === 1 ? 1 : 0
		},
		onShow() {
			if (this.current === 1) {
				this.getfans(1)
			} else {
				this.focuson(1)
			}
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
			goUser(e){
				this.util.urlTo('/pages/index/userdetail?id=' + e)
			},
			gz(e,a){
				this.util.request('dynamic/follow_user', {
					friend_id: e,
					token: uni.getStorageSync('user').token
				}).then(res => {
					if(this.current==0){
						this.focuson_list.splice(a,1)
					}else{
						if(this.focuson_list[a].have_follow==0){
							this.focuson_list[a].have_follow=1
						}else{
							this.focuson_list[a].have_follow=0
						}
					}
					
				})
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
					this.focuson_list=[]
				}
				this.util.request('dynamic/focuson_list',{
					page:this.page,
					token: uni.getStorageSync('user').token
				}).then(res=>{
					const rows = this.handleVipResult(res)
					if (!rows) return
					this.focuson_list=this.focuson_list.concat(rows)
					this.page++
				})
			},
			getfans(e){
				if(e==1){
					this.page=1
					this.focuson_list=[]
				}
				this.util.request('dynamic/fans_list',{
					page:this.page,
					token: uni.getStorageSync('user').token
				}).then(res=>{
					const rows = this.handleVipResult(res)
					if (!rows) return
					this.focuson_list=this.focuson_list.concat(rows)
					this.page++
				})
			}
		}
	}
</script>

<style>
	page {
		background: #F4F8FE url(/static/home/homebg.png) no-repeat;
		background-size: 100% auto;
	}

	.focus-page{
		min-height: 100vh;
		padding-bottom: 40rpx;
		background: rgba(255,255,255,0.2) url(/static/home/homebg.png) no-repeat;
		background-size: 100% auto;
	}

	.focus-item{
		height: 139rpx;
		margin: 0;
		padding: 0 30rpx 0 40rpx;
		border-bottom: 1rpx solid rgba(255,255,255,0.62);
		background: rgba(255,255,255,0.36);
		backdrop-filter: blur(12rpx);
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.focus-item-hover{
		background: rgba(255,255,255,0.58);
	}

	.user-main{
		display: flex;
		align-items: center;
		min-width: 0;
		flex: 1;
	}

	.avatar{
		width: 100rpx;
		height: 100rpx;
		border-radius: 50%;
		border: 2rpx solid rgba(255,255,255,0.78);
		flex-shrink: 0;
	}

	.user-info{
		min-width: 0;
		padding-left: 24rpx;
		padding-right: 18rpx;
	}

	.nickname{
		font-size: 30rpx;
		font-weight: 800;
		color: #111827;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.meta{
		font-size: 22rpx;
		color: #6B7280;
		padding-top: 10rpx;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.btn{
		width: 140rpx;
		height: 50rpx;
		border-radius: 25rpx;
		border: 1rpx solid rgba(51,51,51,0.24);
		background: rgba(255,255,255,0.42);
		text-align: center;
		line-height: 50rpx;
		font-size: 26rpx;
		color: #333333;
		flex-shrink: 0;
	}

</style>
