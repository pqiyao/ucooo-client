<template>
	<view>
		<view class="row" @tap="onBindEmailTap">
			<view class="row-main">
				<view class="row-title">绑定邮箱</view>
				<view class="row-desc">{{ emailDesc }}</view>
			</view>
			<u-icon name="arrow-right" color="#333333" size="28"></u-icon>
		</view>
		<view class="row" @tap="util.urlTo('/pages/user/editpwd')">
			<view class="row-title">
				{{allText.我的页.修改密码}}
			</view>
			<u-icon name="arrow-right" color="#333333" size="28"></u-icon>
		</view>
		<view class="row" @tap="show=true">
			<view class="row-title">
				{{allText.我的页.注销账号}}
			</view>
			<u-icon name="arrow-right" color="#333333" size="28"></u-icon>
		</view>
		
		<u-modal v-model="show" :content="allText.我的页.注销" :show-cancel-button="true" @confirm="confirm"></u-modal> 
	</view>
</template>

<script>
	export default {
		data() {
			return {
				show: false,
				boundEmail: ''
			}
		},
		computed: {
			emailDesc() {
				if (this.boundEmail) {
					return this.maskEmail(this.boundEmail) + '（已绑定，可用于找回密码）'
				}
				return '未绑定，绑定后可通过邮箱找回密码'
			}
		},
		onShow() {
			this.loadEmail()
		},
		methods: {
			loadEmail() {
				this.util.request('user/user_info', {
					token: uni.getStorageSync('user').token
				}).then(res => {
					this.boundEmail = (res && res.email) ? String(res.email).trim() : ''
				}).catch(() => {})
			},
			maskEmail(email) {
				const parts = String(email).split('@')
				if (parts.length !== 2) {
					return email
				}
				const name = parts[0]
				const masked = name.length <= 2 ? name[0] + '***' : name.slice(0, 2) + '***'
				return masked + '@' + parts[1]
			},
			onBindEmailTap() {
				if (this.boundEmail) {
					this.util.showToast('已绑定邮箱，请使用忘记密码功能')
					return
				}
				this.util.urlTo('/pages/user/bind-email')
			},
			async confirm(){
				this.util.request('index/forever_exit',{
					token: uni.getStorageSync('user').token,
				}).then(async () => {
					await this.$store.dispatch('userout', { skipPushUnbind: true })
				}).catch(() => {})
			}
		}
	}
</script>

<style>
	.row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 29rpx;
		border-bottom: 1rpx solid #EEEEEE;
		min-height: 107rpx;
	}

	.row-main {
		flex: 1;
		min-width: 0;
		padding-right: 16rpx;
	}

	.row-title {
		font-size: 30rpx;
		color: #333;
	}

	.row-desc {
		margin-top: 8rpx;
		font-size: 24rpx;
		color: #999;
		line-height: 1.4;
	}
</style>
