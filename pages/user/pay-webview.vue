<template>
	<view class="pay-webview-wrap">
		<web-view v-if="payUrl" :src="payUrl" @message="onWebMessage"></web-view>
		<pay-kefu-fab overlay />
	</view>
</template>

<script>
	export default {
		data() {
			return {
				payUrl: '',
				orderSn: '',
				checkingPayment: false
			}
		},
		onLoad(op) {
			const raw = op && op.url ? decodeURIComponent(op.url) : ''
			this.orderSn = op && op.order_sn ? decodeURIComponent(op.order_sn) : ''
			if (!this.isAllowedPaymentUrl(raw)) {
				this.util.showToast('Invalid payment link')
				setTimeout(() => uni.navigateBack(), 800)
				return
			}
			this.payUrl = raw
		},
		methods: {
			isAllowedPaymentUrl(raw) {
				const match = String(raw || '').trim().match(/^https:\/\/([^\/?#:]+)(?::\d+)?(?:[\/?#]|$)/i)
				if (!match) return false
				const host = match[1].toLowerCase()
				return host === 'paypal.com' || host.endsWith('.paypal.com') ||
					host === 'sslonlinepay.com' || host.endsWith('.sslonlinepay.com')
			},
			onWebMessage(e) {
				const list = (e && e.detail && e.detail.data) || []
				const payload = list.length ? list[list.length - 1] : null
				if (!payload) return
				if (payload.action === 'open_kefu' && payload.kefu_id) {
					this.util.urlTo('/pages/chatNew/chatpage?id=' + encodeURIComponent(String(payload.kefu_id)))
					return
				}
				if (payload.action === 'pay_success') {
					this.verifyPayment()
					return
				}
				if (payload.action === 'pay_fail') {
					this.finishPay(false)
				}
			},
			verifyPayment() {
				if (this.checkingPayment) return
				const user = uni.getStorageSync('user') || {}
				if (!this.orderSn || !user.token) {
					this.util.showToast('Unable to verify payment status')
					return
				}

				this.checkingPayment = true
				uni.showLoading({ title: 'Verifying payment', mask: true })
				this.util.request('vip/recharge_info', {
					token: user.token,
					order_sn: this.orderSn
				}).then(status => {
					uni.hideLoading()
					this.checkingPayment = false
					if (status === 1 || status === '1') {
						this.finishPay(true)
						return
					}
					this.util.showToast('Payment is still processing')
				}).catch(() => {
					uni.hideLoading()
					this.checkingPayment = false
					this.util.showToast('Unable to verify payment status')
				})
			},
			finishPay(success) {
				uni.showToast({
					title: success ? 'Payment successful' : 'Payment failed',
					icon: success ? 'success' : 'none'
				})
				setTimeout(() => {
					uni.navigateBack({
						delta: 1,
						fail: () => {
							uni.switchTab({ url: '/pages/user/user' })
						}
					})
				}, 600)
			}
		}
	}
</script>

<style>
	.pay-webview-wrap {
		width: 100%;
		height: 100vh;
	}
</style>
