<template>
	<view class="crypto-pay-page">
		<view class="crypto-order-card">
			<view class="crypto-order-label">订单金额</view>
			<view class="crypto-order-amount">
				<text class="crypto-currency">$</text>
				<text class="crypto-price">{{ orderPrice }}</text>
			</view>
			<view class="crypto-order-sn" v-if="orderSn">订单号：{{ orderSn }}</view>
		</view>

		<view class="crypto-panel" v-if="cryptoPay.title">
			<view class="crypto-panel-title">{{ cryptoPay.title }}</view>
			<view class="crypto-panel-remark" v-if="cryptoPay.remark">{{ cryptoPay.remark }}</view>
		</view>

		<view class="crypto-panel" v-if="cryptoPay.type === 'qrcode' && cryptoPay.qrcode_url">
			<image class="crypto-qrcode" :src="cryptoPay.qrcode_url" mode="aspectFit" @tap="previewQrcode" />
			<view class="crypto-qrcode-tip">长按或点击放大保存收款码</view>
		</view>

		<view class="crypto-panel" v-if="cryptoPay.type === 'link' && cryptoPay.link">
			<view class="crypto-link-box">{{ cryptoPay.link }}</view>
			<fui-button background="#B2711D" radius="46rpx" @click="openPayLink">打开支付链接</fui-button>
		</view>

		<view class="pay-bottom-wrap">
			<pay-kefu-fab mode="bar" />
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
				orderSn: '',
				orderPrice: '',
				cryptoPay: {
					enabled: 0,
					type: 'link',
					title: '',
					link: '',
					qrcode_url: '',
					remark: ''
				}
			}
		},
		onLoad(op) {
			if (op && op.detail) {
				try {
					const detail = JSON.parse(decodeURIComponent(op.detail))
					this.orderSn = detail.order_sn || ''
					this.orderPrice = detail.price || detail.amount || ''
				} catch (e) {
					try {
						const detail = JSON.parse(op.detail)
						this.orderSn = detail.order_sn || ''
						this.orderPrice = detail.price || detail.amount || ''
					} catch (err) {}
				}
			}
			this.loadCryptoPay()
		},
		methods: {
			loadCryptoPay() {
				const user = uni.getStorageSync('user') || {}
				if (!user.token) {
					return
				}
				this.util.request('index/get_global_config', {
					token: user.token
				}).then(res => {
					const cfg = (res && res.crypto_pay) || {}
					if (!cfg.enabled) {
						this.util.showToast('虚拟币收款未开启')
						setTimeout(() => uni.navigateBack(), 600)
						return
					}
					this.cryptoPay = cfg
					uni.setNavigationBarTitle({
						title: cfg.title || '虚拟币支付'
					})
				})
			},
			openPayLink() {
				const url = (this.cryptoPay && this.cryptoPay.link) || ''
				if (!url) {
					this.util.showToast('未配置支付链接')
					return
				}
				this.util.openPayUrl(url)
			},
			previewQrcode() {
				const url = (this.cryptoPay && this.cryptoPay.qrcode_url) || ''
				if (!url) {
					return
				}
				uni.previewImage({
					urls: [url],
					current: url
				})
			}
		}
	}
</script>

<style>
	.crypto-pay-page {
		min-height: 100vh;
		padding: 40rpx 30rpx 360rpx;
		background: #f7f8fa;
	}

	.crypto-order-card {
		background: #fff;
		border-radius: 20rpx;
		padding: 40rpx 32rpx;
		text-align: center;
		box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.04);
	}

	.crypto-order-label {
		font-size: 28rpx;
		color: #666;
	}

	.crypto-currency {
		font-size: 40rpx;
		font-weight: bold;
	}

	.crypto-price {
		font-size: 72rpx;
		font-weight: bold;
		color: #ff5f79;
	}

	.crypto-order-sn {
		margin-top: 16rpx;
		font-size: 24rpx;
		color: #999;
		word-break: break-all;
	}

	.crypto-panel {
		margin-top: 30rpx;
		padding: 32rpx;
		background: #fff;
		border-radius: 20rpx;
	}

	.crypto-panel-title {
		font-size: 34rpx;
		font-weight: bold;
		color: #333;
	}

	.crypto-panel-remark {
		margin-top: 16rpx;
		font-size: 26rpx;
		color: #666;
		line-height: 1.6;
	}

	.crypto-qrcode {
		display: block;
		width: 420rpx;
		height: 420rpx;
		margin: 24rpx auto 0;
	}

	.crypto-qrcode-tip {
		margin-top: 16rpx;
		text-align: center;
		font-size: 24rpx;
		color: #999;
	}

	.crypto-link-box {
		margin: 20rpx 0 28rpx;
		padding: 24rpx;
		font-size: 24rpx;
		color: #333;
		word-break: break-all;
		background: #f5f5f5;
		border-radius: 12rpx;
	}

	.pay-bottom-wrap {
		position: fixed;
		bottom: 0;
		left: 0;
		width: 100%;
		padding-bottom: constant(safe-area-inset-bottom);
		padding-bottom: env(safe-area-inset-bottom);
		background: #f7f8fa;
	}
</style>
