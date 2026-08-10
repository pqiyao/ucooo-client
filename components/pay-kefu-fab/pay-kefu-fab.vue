<template>
	<view v-if="visible">
		<!-- 支付 web-view 页（APP）：须用 cover-view 才能浮在 web-view 之上 -->
		<!-- #ifdef APP-PLUS -->
		<cover-view v-if="overlay" class="pay-kefu-fab" @tap="contactKefu">
			<cover-view class="pay-kefu-fab__inner">{{ label }}</cover-view>
		</cover-view>
		<!-- #endif -->
		<!-- 条形色按钮（钱包 / 收银台） -->
		<view v-if="mode === 'bar' && !overlay" class="pay-kefu-bar" @tap="contactKefu">
			<text class="pay-kefu-bar__title">{{ label }}</text>
			<text class="pay-kefu-bar__hint">{{ hint }}</text>
		</view>
		<!-- 悬浮按钮（非 cover 场景） -->
		<view v-if="mode === 'fab' && !overlay" class="pay-kefu-fab" @tap="contactKefu">
			<text class="pay-kefu-fab__inner">{{ label }}</text>
		</view>
	</view>
</template>

<script>
	export default {
		name: 'PayKefuFab',
		props: {
			/** bar：底部通栏；fab：右下角悬浮 */
			mode: {
				type: String,
				default: 'fab'
			},
			/** APP 支付 web-view 页设为 true */
			overlay: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				kefuid: ''
			}
		},
		computed: {
			visible() {
				return !!this.kefuid
			},
			label() {
				return (this.allText && this.allText.我的页 && this.allText.我的页.联系客服) || '联系客服'
			},
			hint() {
				return '支付、虚拟币转账有疑问请联系客服人工核账'
			}
		},
		mounted() {
			this.fetchKefu()
		},
		methods: {
			fetchKefu() {
				const user = uni.getStorageSync('user') || {}
				if (!user.token) {
					return
				}
				this.util.request('index/get_global_config', {
					token: user.token
				}).then(res => {
					const id = res && res.set_customer_service
					if (id) {
						this.kefuid = String(id)
					}
				}).catch(() => {})
			},
			contactKefu() {
				if (!this.kefuid) {
					this.util.showToast(this.label)
					return
				}
				this.util.urlTo('/pages/chatNew/chatpage?id=' + encodeURIComponent(this.kefuid))
			}
		}
	}
</script>

<style scoped>
	.pay-kefu-bar {
		margin: 0 30rpx 24rpx;
		padding: 24rpx 32rpx;
		background: linear-gradient(90deg, #fff5e6 0%, #ffe8cc 100%);
		border: 2rpx solid #f0b45c;
		border-radius: 20rpx;
		box-shadow: 0 8rpx 24rpx rgba(178, 113, 29, 0.15);
	}

	.pay-kefu-bar__title {
		display: block;
		font-size: 30rpx;
		font-weight: bold;
		color: #b2711d;
	}

	.pay-kefu-bar__hint {
		display: block;
		margin-top: 8rpx;
		font-size: 24rpx;
		color: #8a6a3a;
		line-height: 1.4;
	}

	.pay-kefu-fab {
		position: fixed;
		right: 24rpx;
		bottom: 220rpx;
		z-index: 99999;
	}

	.pay-kefu-fab__inner {
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 120rpx;
		padding: 20rpx 28rpx;
		font-size: 26rpx;
		font-weight: bold;
		color: #fff;
		background: linear-gradient(135deg, #b2711d 0%, #fcd7a3 100%);
		border-radius: 999rpx;
		box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.2);
	}
</style>
