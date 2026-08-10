<template>
	<view class="bind-page">
		<view class="tip-card">
			<view class="tip-title">绑定邮箱</view>
			<view class="tip-desc">绑定后可使用「忘记密码」通过邮箱找回账号，仅可绑定一次。</view>
		</view>

		<view class="field-card">
			<view class="field-label">邮箱</view>
			<input class="field-input" type="text" :placeholder="allText.登录页.请输入邮箱号" v-model="email" />
		</view>

		<view class="field-card">
			<view class="field-label">验证码</view>
			<view class="code-row">
				<input class="field-input code-input" type="text" maxlength="6" placeholder="请输入验证码" v-model="captcha" />
				<view class="code-btn" :class="{ disabled: codeNun !== 60 }" @tap="getCode">
					{{ codeNun == 60 ? allText.登录页.获取验证码 : codeNun + 's' }}
				</view>
			</view>
		</view>

		<view class="submit-wrap">
			<fui-button background="#5A7EF6" radius="46rpx" @click="submit">确认绑定</fui-button>
		</view>
	</view>
</template>

<script>
	import fuiButton from '@/components/firstui/fui-button/fui-button.vue'

	export default {
		components: {
			fuiButton
		},
		data() {
			return {
				email: '',
				captcha: '',
				codeNun: 60
			}
		},
		methods: {
			timer() {
				let type = 1
				const timerId = setInterval(() => {
					if (this.codeNun === 0) {
						this.codeNun = 60
						type = 0
						clearInterval(timerId)
					} else if (type === 1) {
						this.codeNun--
					}
				}, 1000)
			},
			getCode() {
				if (this.codeNun !== 60) {
					return
				}
				const email = (this.email || '').trim()
				if (!email) {
					this.util.showToast(this.allText.登录页.请输入邮箱号)
					return
				}
				if (!this.util.checkEmail(email)) {
					this.util.showToast('邮箱格式不正确')
					return
				}
				this.util.request('ems/send', {
					email,
					event: 'changeemail'
				}, 'POST').then(res => {
					if (res.code == 1) {
						this.timer()
					}
				})
			},
			submit() {
				const email = (this.email || '').trim()
				if (!email) {
					this.util.showToast(this.allText.登录页.请输入邮箱号)
					return
				}
				if (!this.util.checkEmail(email)) {
					this.util.showToast('邮箱格式不正确')
					return
				}
				if (!this.captcha) {
					this.util.showToast(this.allText.登录页.请输入验证码)
					return
				}
				uni.showLoading({
					mask: true
				})
				this.util.request('user/bind_email', {
					token: uni.getStorageSync('user').token,
					email,
					code: this.captcha
				}, 'POST').then(res => {
					if (res.code == 1) {
						this.util.showToast(res.msg || '绑定成功')
						setTimeout(() => {
							uni.navigateBack()
						}, 800)
					}
				}).finally(() => {
					uni.hideLoading()
				})
			}
		}
	}
</script>

<style>
	page {
		background: #F4F8FE;
	}

	.bind-page {
		min-height: 100vh;
		padding: 32rpx 28rpx 60rpx;
		box-sizing: border-box;
	}

	.tip-card {
		padding: 28rpx 30rpx;
		border-radius: 24rpx;
		background: #fff;
		box-shadow: 0 12rpx 30rpx rgba(37, 43, 62, 0.06);
	}

	.tip-title {
		font-size: 32rpx;
		font-weight: 700;
		color: #1F2433;
	}

	.tip-desc {
		margin-top: 12rpx;
		font-size: 26rpx;
		line-height: 1.5;
		color: #8A93A8;
	}

	.field-card {
		margin-top: 24rpx;
		padding: 24rpx 28rpx;
		border-radius: 24rpx;
		background: #fff;
	}

	.field-label {
		margin-bottom: 16rpx;
		font-size: 28rpx;
		font-weight: 600;
		color: #2B3040;
	}

	.field-input {
		height: 80rpx;
		padding: 0 24rpx;
		border-radius: 40rpx;
		background: #F4F8FE;
		font-size: 28rpx;
	}

	.code-row {
		display: flex;
		align-items: center;
		gap: 16rpx;
	}

	.code-input {
		flex: 1;
	}

	.code-btn {
		flex-shrink: 0;
		padding: 0 24rpx;
		height: 80rpx;
		line-height: 80rpx;
		border-radius: 40rpx;
		background: #5A7EF6;
		font-size: 26rpx;
		color: #fff;
	}

	.code-btn.disabled {
		background: #C5CBDA;
	}

	.submit-wrap {
		margin-top: 48rpx;
		padding: 0 20rpx;
	}
</style>
