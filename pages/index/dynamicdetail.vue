<template>
	<view class="dynamic-detail-page">
		<view class="" style="height: 6rpx;box-shadow: 0rpx 3rpx 3rpx 0rpx rgba(153,153,153,0.1);"></view>
		<view class="" style="border-bottom: 1rpx solid #F5F5F5;">
			<view class="" style="display: flex;align-items: center;justify-content: space-between;padding: 28rpx 24rpx;">
				<view class="" style="display: flex;align-items: center;">
					<image :src="dynamic.avatar" mode="aspectFill" style="width: 110rpx;height: 110rpx;border-radius: 50%;"></image>
					<view class="" style="font-size: 30rpx;font-weight: bold;margin-left: 14rpx;">
						{{dynamic.nickname}}
					</view>
				</view>
				<view class="btn" v-if="!isSelfDynamic" @tap="gz(dynamic.user_id)">
					{{dynamic.is_follow==0 ? '+'+allText.首页.关注 : allText.首页.已关注}}
				</view>
			</view>
			<view class="" style="padding: 0 26rpx 10rpx 26rpx;font-size: 28rpx;">
				{{dynamic.content}}
			</view>
			<view class="" style="display: flex;align-items: center;flex-wrap: wrap;margin: 0 25rpx;" v-if="dynamic.have_source==1">
				<view class="" style="width: 33.3%;text-align: center;margin-top: 10rpx;" v-for="(i,k) in dynamic.img_list" :key="k" @tap="lookImg(dynamic.img_list,k)">
					<image :src="i.image" mode="aspectFill" style="width: 230rpx;height: 230rpx;border-radius: 15rpx;"></image>
				</view>
			</view>
			<template v-if="dynamic.have_source==2">
				<view class="" style=" display: flex;align-items: center;flex-wrap: wrap;margin: 0 25rpx;">
					<view
					 style="width: 100%;height:500rpx; border-radius: 20rpx;margin: 22rpx 29rpx;position: relative;border-radius: 15rpx;overflow: hidden;"
					 v-for="(i,k) in dynamic.img_list" :key="k" @click="play_show=!play_show">
					 <template v-if="play_show">
						 <video style="width: 100%;height: 500rpx;" :src="i.image" autoplay=""></video>
					 </template>
					 <template v-if="!play_show">
						<image :src="i.image+'?x-oss-process=video/snapshot,t_1000,f_jpg,w_420,h_300'" mode="aspectFill"></image>
						<image src="/static/home/bo.png" mode="" style="width: 86rpx;height: 86rpx;position: absolute;top: 50%;left: 50%;margin-top: -43rpx;margin-left: -43rpx;"></image>
					 </template>
					</view>
				</view>
			</template>
			<view class="" style="display: flex;align-items: center;justify-content: space-between;padding: 33rpx 37rpx;">
				<view class="" style="display: flex;align-items: center;">
					<view class="" style="display: flex;align-items: center;font-size: 26rpx;" @tap.stop="zan(dynamic.id)">
						<image :src="dynamic.is_zan==0 ? '/static/home/zan.png' : '/static/home/xzan.png'" mode=""
							style="width: 30rpx;height: 30rpx;"></image>
						<view class="" style="padding-left: 10rpx;">
							{{dynamic.great_num}}
						</view>
					</view>
					<view class="" style="display: flex;align-items: center;font-size: 26rpx;margin-left: 64rpx;">
						<image src="/static/home/edits.png" mode="" style="width: 30rpx;height: 30rpx;"></image>
						<view class="" style="padding-left: 10rpx;">
							{{dynamic.comments_num}}
						</view>
					</view>
				</view>
				<view class="" v-if="!isSelfDynamic" style="font-size: 26rpx;display: flex;align-items: center;" @tap.stop="gochat(dynamic.user_id)">
					<image src="/static/home/sendchat.png" mode="" style="width: 32rpx;height: 32rpx;"></image>
					<view class="" style="padding-left: 13rpx;">
						{{allText.首页.发消息}}
					</view>
				</view>
			</view>
		</view>
		<view class="comment-title">
			{{allText.首页.全部评论}}（{{pjlist.length}}）
		</view>
		<view class="comment-empty" v-if="pjlist.length == 0">
			暂无评论
		</view>
		<view class="comment-item" v-for="(i,k) in pjlist" :key="k">
			<view class="comment-head">
				<view class="comment-user">
					<image :src="i.avatar" mode="aspectFill" class="comment-avatar"></image>
					<view class="comment-name">
						{{i.nickname}}
					</view>
				</view>
				<view class="comment-time">
					{{i.time_date}}
				</view>
			</view>
			<view class="comment-content">
				{{i.comments}}
			</view>
		</view>
		<view class="comment-bottom-space"></view>
		<view class="comment-bar">
			<input type="text" :placeholder="allText.首页.跟ta说点好听的 || '跟ta说点好听的'" class="comment-input"
				v-model="value" confirm-type="send" @confirm="send" />
			<view class="footbtn" :class="{disabled: sending}" @tap="send">
				{{allText.首页.发送}}
			</view>
		</view>
		
		<u-popup v-model="show" mode="center" width="624rpx" height="308rpx" border-radius="20">
			<view style="font-size: 30rpx;font-weight: bold;text-align: center;padding-top: 74rpx;">{{allText.首页.该功能仅对VIP会员开放}}</view>
			<view class="btn1" @tap="util.urlTo('/pages/user/myvip')">
				{{allText.首页.升级VIP会员}}
			</view>
		</u-popup>
		
	</view>
</template>

<script>
	export default {
		data() {
			return {
				id:'',
				dynamic:{},
				value:'',
				pjlist:[],
				show:false,
				play_show:false,
				myUserId: 0,
				sending: false,
			}
		},
		computed: {
			isSelfDynamic() {
				return Number(this.dynamic && this.dynamic.user_id) === Number(this.myUserId)
			}
		},
		onLoad(op) {
			this.id=op.id
			this.myUserId = this.getLocalUserId()
		},
		methods: {
			getLocalUserId() {
				const user = uni.getStorageSync('user') || {}
				return user.user_id || user.id || 0
			},
			gz(e,a){
				if (!e || Number(e) === Number(this.myUserId)) {
					return
				}
				this.util.request('dynamic/follow_user', {
					friend_id: e,
					token: uni.getStorageSync('user').token
				}).then(res => {
					this.detail()
				})
			},
			gochat(e) {
				if (!e || Number(e) === Number(this.myUserId)) {
					return
				}
				this.util.urlTo('/pages/chatNew/chatpage?id=' + encodeURIComponent(e))
			},
			send(){
				const comments = (this.value || '').trim()
				if (this.sending) {
					return
				}
				if (!comments) {
					this.util.showToast('请输入评论内容')
					return false
				}
				this.sending = true
				this.util.request('user/user_info',{
					token: uni.getStorageSync('user').token
				}).then(res=>{
					if(res.is_vip=='one'){
						this.util.request('dynamic/cmt_dynamic',{
							comments:comments,
							dynamic_id:this.id,
							token: uni.getStorageSync('user').token
						}).then(res=>{
							this.value=''
							this.getpl()
							this.detail()
							this.sending = false
						}).catch(() => {
							this.sending = false
						})
					}else{
						this.sending = false
						this.show=true
					}
				}).catch(() => {
					this.sending = false
				})
				
				
			},
			getpl(){
				this.util.request('dynamic/dynamic_comments_list',{
					dynamic_id:this.id,
					token: uni.getStorageSync('user').token
				}).then(res=>{
					this.pjlist=res && Array.isArray(res.list) ? res.list : []
				})
				// this.util.request('dynamic/delete_dynamic',{
				// 	dynamic_id:this.id,
				// 	token: uni.getStorageSync('user').token
				// }).then(res=>{
					
				// })
			},
			detail(){
				this.util.request('dynamic/dynamic_info',{
					dynamic_id:this.id,
					token: uni.getStorageSync('user').token
				}).then(res=>{
					this.dynamic=res || {}
					this.emitDynamicUpdated()
				})
			},
			emitDynamicUpdated() {
				if (this.dynamic && this.dynamic.id) {
					uni.$emit('dynamicUpdated', this.dynamic)
				}
			},
			lookImg(e, index = 0, item) {
				let url;
				if (Array.isArray(e)) {
					url = e;
				} else {
					url = [e];
				}
				let urls = [];
				// if (item) {
					url.map(i => {
						urls.push(i.image);
					})
					url = urls;
				// }
				uni.previewImage({
					urls: url,
					current: index
				})
			},
			zan(a) {
				this.util.request('user/user_info',{
					token: uni.getStorageSync('user').token
				}).then(res=>{
					if(res.is_vip=='one'){
						this.util.request('dynamic/great_dynamic', {
							dynamic_id: a,
							token: uni.getStorageSync('user').token
						}).then(res => {
							this.detail()
						})
					}else{
						this.show=true
					}
				})
				
			},
		},
		onShow() {
			this.myUserId = this.getLocalUserId()
			this.detail()
			this.getpl()
		}
	}
</script>

<style>
	page {
		background: #F6F7FA;
	}

	.dynamic-detail-page {
		min-height: 100vh;
		background: #F6F7FA;
		color: #1F2430;
	}

	.dynamic-detail-page > view:nth-child(2) {
		background: #FFFFFF;
		border-bottom: 1rpx solid #ECEFF5 !important;
	}

	.btn{
		min-width: 132rpx;
		height: 50rpx;
		padding: 0 18rpx;
		border-radius: 25rpx;
		border: 1rpx solid #D9DEEA;
		background: #FFFFFF;
		color: #333A45;
		text-align: center;
		line-height: 50rpx;
		font-size: 26rpx;
		box-sizing: border-box;
		
	}
	.footbtn{
		width: 120rpx;
		height: 60rpx;
		background: #5A7EF6;
		border-radius: 30rpx;
		text-align: center;
		line-height: 60rpx;
		font-size: 28rpx;
		color: #fff;
	}
	.footbtn.disabled {
		opacity: 0.55;
	}
	.comment-title {
		padding: 32rpx 28rpx 16rpx;
		font-size: 31rpx;
		font-weight: 700;
		color: #20242C;
	}
	.comment-empty {
		margin: 12rpx 28rpx 0;
		padding: 36rpx 24rpx;
		border-radius: 16rpx;
		background: #FFFFFF;
		border: 1rpx solid #ECEFF5;
		text-align: center;
		font-size: 26rpx;
		color: #8A92A0;
	}
	.comment-item {
		margin: 14rpx 24rpx 0;
		padding: 22rpx 22rpx 24rpx;
		border-radius: 16rpx;
		background: #FFFFFF;
		border: 1rpx solid #ECEFF5;
	}
	.comment-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.comment-user {
		display: flex;
		align-items: center;
		min-width: 0;
		flex: 1;
	}
	.comment-avatar {
		width: 72rpx;
		height: 72rpx;
		border-radius: 50%;
		flex-shrink: 0;
	}
	.comment-name {
		margin-left: 18rpx;
		font-size: 28rpx;
		font-weight: 600;
		color: #252A33;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.comment-time {
		margin-left: 18rpx;
		font-size: 24rpx;
		color: #9AA2AF;
		flex-shrink: 0;
	}
	.comment-content {
		padding: 14rpx 0 0 90rpx;
		font-size: 27rpx;
		line-height: 42rpx;
		color: #444B57;
		word-break: break-word;
	}
	.comment-bottom-space {
		height: 168rpx;
	}
	.comment-bar {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 20;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 18rpx 24rpx 22rpx;
		background: #FFFFFF;
		box-shadow: 0 -8rpx 28rpx rgba(31, 36, 48, 0.08);
		box-sizing: border-box;
	}
	.comment-input {
		flex: 1;
		height: 68rpx;
		margin-right: 18rpx;
		padding: 0 26rpx;
		border-radius: 34rpx;
		background: #F1F3F7;
		font-size: 27rpx;
		color: #1F2430;
		box-sizing: border-box;
	}
	.btn1 {
		margin: 33rpx 195rpx;
		height: 70rpx;
		background: #5A7EF6;
		border-radius: 35rpx;
		text-align: center;
		line-height: 70rpx;
		font-size: 28rpx;
		color: #fff;
	}

</style>
