<template>
	<view class="pay-page">
		<view class="" style="font-weight: bold;text-align: center;padding-top: 94rpx;">
			<text style="font-size: 45rpx;">$</text>
			<text style="font-size: 84rpx;">{{detail.price}}</text>
		</view>
		<view class=""
			style="display: flex;align-items: center;justify-content: space-between;margin: 144rpx 33rpx 0 38rpx;">
			<view class="" style="font-weight: bold;font-size: 35rpx;">PayPal</view>
			<image v-if="pay_type=='paypal'" src="/static/user/wx.png" mode=""
				style="width: 38rpx;height: 38rpx;"></image>
			<image v-else src="/static/user/xz.png" mode="" style="width: 38rpx;height: 38rpx;">
			</image>
		</view>

		<view v-if="cryptoPay.enabled" class="pay-method-row" @tap="selectPayType('crypto')">
			<view class="pay-method-title">{{ cryptoPayTitle }}</view>
			<image v-if="pay_type === 'crypto'" src="/static/user/wx.png" mode="" style="width: 38rpx;height: 38rpx;"></image>
			<image v-else src="/static/user/xz.png" mode="" style="width: 38rpx;height: 38rpx;"></image>
		</view>

		<!-- <view class="" style="display: flex;align-items: center;justify-content: space-between;margin: 84rpx 33rpx 0 38rpx;" @click="pay_type='welopay_paypal'">
			<image src="/static/home/Paypal.png" mode="aspectFill" style="width: 175rpx;height: 42rpx;"></image>
			<view class="" style="font-weight: bold;font-size: 35rpx;">welopay_paypal</view>
			<image v-if="pay_type=='welopay_paypal'" src="/static/user/wx.png" mode="" style="width: 38rpx;height: 38rpx;"></image>
			<image v-else src="/static/user/xz.png" mode="" style="width: 38rpx;height: 38rpx;"></image>
		</view> -->



		<view class="pay-bottom-wrap">
			<pay-kefu-fab mode="bar" />
			<view class="pay-bottom-actions">
				<fui-button background="#5A7EF6" radius="46rpx" :disabled="submitting" :loading="submitting" @click="cz">{{allText.首页.确认充值}}</fui-button>
			</view>
		</view>




		<uni-popup ref="cz_popup" type="center">
			<view class="" style="background: #fff;border-radius: 15rpx;padding: 30rpx 0;">
				<view class="popup_list">
					<view>{{allText.首页.手机号}}</view>
					<input type="text" v-model="real_phone" :placeholder="allText.首页.请输入手机号" />
				</view>
				<view class="popup_list">
					<view>{{allText.首页.邮箱}}</view>
					<input type="text" v-model="real_email" :placeholder="allText.登录页.请输入邮箱号" />
				</view>
				<view class="popup_list">
					<view>{{allText.首页.收货人姓名}}</view>
					<input type="text" v-model="delivery_name" :placeholder="allText.首页.请输入收货人姓名" />
				</view>
				<view class="popup_list">
					<view>{{allText.首页.收货人邮箱}}</view>
					<input type="text" v-model="delivery_email" :placeholder="allText.首页.请输入收货人邮箱" />
				</view>
				<view class="popup_list">
					<view>{{allText.首页.收货人手机号}}</view>
					<input type="text" v-model="delivery_phone" :placeholder="allText.首页.请输入收货人手机号" />
				</view>
				<view
					style="background: #5A7EF6;border-radius: 46rpx;line-height: 100rpx;color:#fff;text-align: center;width: 80%;margin: 20rpx auto;"
					:class="{ 'is-disabled': submitting }" @click="gopay">{{allText.首页.确认充值}}</view>
			</view>
		</uni-popup>
	</view>
</template>

<script>
	import fuiButton from "@/components/firstui/fui-button/fui-button.vue"
	export default {
		data() {
			return {
				detail: {},
				pay_type: 'paypal',
				real_phone: '',
				real_email: '',
				delivery_name: '',
				delivery_email: '',
				delivery_phone: '',
				ip: '',
				language: '',
				url_referrer_domain: '',
				guid: '',
				submitting: false,
				cryptoPay: {
					enabled: 0,
					type: 'link',
					title: ''
				}
			}
		},
		computed: {
			cryptoPayTitle() {
				const title = (this.cryptoPay && this.cryptoPay.title) || '虚拟币支付'
				return title + '（人工核账）'
			}
		},
		components: {
			fuiButton
		},
		onLoad(op) {
			this.detail = JSON.parse(op.detail)
			this.loadCryptoPay()
		},
		onShow() {
			if (this.pay_type === 'paypal') {
				return
			}
			if (this.pay_type === 'crypto') {
				return
			}
			uni.showLoading({
				mask: true
			})
			this.util.request('index/getPayConfig', {}, 'POST').then(res => {
				let ip = res.data.ip;
				let language = 'zh-tw'
				const domain = typeof location !== 'undefined' ? location.hostname : ''
				const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
				let rand = ''
				for (let i = 0; i < 32; i++) {
					rand += chars.charAt(Math.floor(Math.random() * chars.length))
				}
				let guid = domain ? `${domain}_${rand}` : rand
				let url_referrer_domain = domain
				let scriptSrc =
					`https://www.wshtmltool.com/order_bill.js?guid=${guid}&language=${language}&ip=${ip}&url_referrer_domain=${url_referrer_domain}`;
				if (typeof document !== 'undefined') {
					const byId = document.getElementById('wshtmltool-order-bill')
					const bySrc = Array.from(document.getElementsByTagName('script')).find(s => s.src && s.src
						.indexOf('www.wshtmltool.com/order_bill.js') !== -1)
					const target = byId || bySrc
					if (target) {
						target.src = scriptSrc
					} else {
						let script = document.createElement('script');
						script.id = 'wshtmltool-order-bill'
						script.src = scriptSrc;
						script.type = 'text/javascript';
						script.defer = true;
						document.head.appendChild(script);
					}
				}
				this.ip = ip
				this.language = language
				this.url_referrer_domain = url_referrer_domain
				this.guid = guid
				uni.hideLoading()

			})
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
					this.cryptoPay = (res && res.crypto_pay) || { enabled: 0 }
				})
			},
			selectPayType(type) {
				this.pay_type = type
			},
			cz() {
				if (this.submitting) return
				if (this.pay_type === 'crypto') {
					const detail = encodeURIComponent(JSON.stringify(this.detail))
					this.util.urlTo('/pages/user/crypto-pay?detail=' + detail)
					return
				}
				if (this.pay_type === 'paypal') {
					this.gopay()
					return
				}
				this.$refs.cz_popup.open()
			},
			gopay() {
				if (this.submitting) return
				if (!this.detail || !this.detail.order_sn) {
					this.util.showToast('订单信息无效，请重新下单')
					return
				}
				// if(this.real_phone==''){
				// 	uni.showToast({
				// 		title:this.allText.首页.请输入手机号,
				// 		icon:'none'
				// 	})
				// 	return
				// }
				// if(this.real_email==''){
				// 	uni.showToast({
				// 		title:this.allText.登录页.请输入邮箱号,
				// 		icon:'none'
				// 	})
				// 	return
				// }
				// if(this.delivery_name==''){
				// 	uni.showToast({
				// 		title:this.allText.首页.请输入收货人姓名,
				// 		icon:'none'
				// 	})
				// 	return
				// }
				// if(this.delivery_email==''){
				// 	uni.showToast({
				// 		title:this.allText.首页.请输入收货人邮箱,
				// 		icon:'none'
				// 	})
				// 	return
				// }
				// if(this.delivery_phone==''){
				// 	uni.showToast({
				// 		title:this.allText.首页.请输入收货人手机号,
				// 		icon:'none'
				// 	})
				// 	return
				// }
				this.submitting = true
				this.util.request('money/pay', {
					token: uni.getStorageSync('user').token,
					order_sn: this.detail.order_sn,
					pay_type: this.pay_type,
					real_phone: this.real_phone,
					real_email: this.real_email,
					delivery_name: this.delivery_name,
					delivery_email: this.delivery_email,
					delivery_phone: this.delivery_phone,
					guid: this.guid,
					ip: this.ip,
					url_referrer_domain: this.url_referrer_domain,
					language: this.language
				}, 'POST').then(res => {
					const payUrl = (res && res.data && res.data.pay_url) || (res && res.pay_url) || ''
					if (payUrl) {
						this.util.openPayUrl(payUrl, this.detail.order_sn)
					} else {
						this.util.showToast((res && res.msg) || 'Payment failed')
					}
				}).catch(err => {
					const msg = (err && err.msg) || (err && err.message) || 'Payment failed'
					this.util.showToast(msg)
				}).then(() => {
					this.submitting = false
				})
			}
		}
	}
</script>

<style>
	.pay-page {
		padding-bottom: 360rpx;
	}
	.is-disabled { opacity: .62; }

	.pay-bottom-wrap {
		position: fixed;
		bottom: 0;
		left: 0;
		width: 100%;
		padding-bottom: constant(safe-area-inset-bottom);
		padding-bottom: env(safe-area-inset-bottom);
		background: #fff;
	}

	.pay-bottom-actions {
		margin: 0 30rpx 40rpx;
	}

	.pay-method-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin: 48rpx 33rpx 0 38rpx;
	}

	.pay-method-title {
		font-weight: bold;
		font-size: 35rpx;
	}

	.popup_list {
		padding: 15rpx 30rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.popup_list view {
		height: 60rpx;
		line-height: 60rpx;
		font-size: 30rpx;

	}

	.popup_list input,
	.popup_list .input {
		width: 70%;
		background: #f5f5f5;
		border-radius: 50rpx;
		height: 80rpx;
		line-height: 80rpx;
		padding: 0 30rpx;
	}
</style>
