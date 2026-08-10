<template>
	<view>
		<view class="bg">
			<view class="" style="position: relative;">
				<view class="login-language" @click="util.urlTo('/pages/user/language')">
					<image src="/static/user/u6.png" mode="" style="width: 44rpx;height: 44rpx;"></image>
					<view class="" style="font-size: 26rpx;padding-top: 10rpx;">
						Z_N
						<!-- {{allText.我的页.语言}} -->
					</view>
				</view>
			</view>
			<view class="" style="text-align: center;">
				<image src="/static/logo.png" mode="" class="logo"></image>
			</view>

			<view class="input-box" style="">
				<input type="text" :placeholder="allText.登录页.请输入邮箱号ID用户名" v-model="account" />
			</view>

			<view class="input-boxs">
				<input :type="inputshow ? 'text' : 'password'" :placeholder="allText.登录页.请输入密码"  v-model="password"
					style="width: 75%;height: 80rpx;background: #F1F6FE;border: none;border-radius: 45rpx;font-size: 30rpx;padding-left: 49rpx;" />
				<image :src="inputshow ? '/static/bieye.png' : '/static/eye.png'" mode=""
					style="width: 40rpx;height: 40rpx;margin-right: 38rpx;" @tap="inputshow=!inputshow"></image>
			</view>
			<view class="" style="margin: 54rpx 68rpx 50rpx 68rpx;">
				<fui-button background="#5A7EF6" disabledBackground="#e3e3e3f2" :disabled="!agreePrivacy" radius="46rpx" @click="login">{{allText.登录页.登录}}</fui-button>
			</view>
			<view class="" style="margin: 54rpx 68rpx 50rpx 68rpx;">
				<fui-button background="#5A7EF6" radius="46rpx" @click="util.urlTo('/pages/login/reg')">{{allText.登录页.新用户注册}}</fui-button>
			</view>
			<view class="privacy-agreement" style="display: flex;align-items: center;margin-top: 30rpx;font-size: 26rpx;color: #666;justify-content: center;">
				<image src="/static/user/wx.png" v-if="agreePrivacy" style="width: 40rpx;height: 40rpx;" mode="" @tap="agreePrivacy = !agreePrivacy"></image>
				<image src="/static/user/xz.png" v-else style="width: 40rpx;height: 40rpx;" mode="" @tap="agreePrivacy = !agreePrivacy"></image>
				<view style="margin-left: 10rpx;">
					{{allText.登录页.我已阅读并同意}}
					<text style="color: #5A7EF6;" @tap="util.urlTo('/pages/user/yinshi/yinshi')">{{allText.我的页.隐私协议}}</text>
				</view>
			</view>
			<view class="foot">
				<text @tap="util.urlTo('/pages/login/forget')">{{allText.登录页.忘记密码}}？</text>
			</view>
		</view>
		<u-gap height="200"></u-gap>
		<bottombox>
			<view class="" style="padding: 20rpx;">
				<rich-text :nodes="xieyi"></rich-text>
			</view>
		</bottombox>
		<u-popup  v-model="show" mode="center" width="624rpx" height="334rpx" border-radius="20">
			<view style="font-size: 30rpx;font-weight: bold;text-align: center;padding-top: 74rpx;">{{content}}</view>
			<view class="btn" @tap="show=false">
				{{allText.我的页.确定}}
			</view>
		</u-popup>
	</view>
</template>

<script>
	import fuiButton from "@/components/firstui/fui-button/fui-button.vue"
	import{
		mapState
	}from 'vuex'
	export default {
		data() {
			return {
				agreePrivacy: true,
				inputshow: false,
				show: false,
				password: '',
				account: '',
				content: '',
			}
		},
		components: {
			fuiButton
		},
		computed:{
			...mapState(['xieyi'])
		},
		onShow() {
			const user = uni.getStorageSync('user') || {}
			if (!this.util.hasLogin()) {
				return
			}
			if (user.need_edit == 0 || user.status === 'hidden') {
				uni.reLaunch({
					url: user.status === 'hidden' ? '/pages/perfect/perfect?auth=1' : '/pages/perfect/perfect'
				})
				return
			}
			uni.reLaunch({
				url: '/pages/index/index'
			})
		},
		methods: {
			//用户登录
			login() {
				if (this.account == '') {
					this.util.showToast(this.allText.登录页.请输入邮箱号ID用户名)
					return false
				}
				if (this.password == '') {
					this.util.showToast(this.allText.登录页.请输入密码)
					return false
				}
				uni.showLoading({
					title:'login...'
				})
				this.util.request('index/emslogin', {
					account: this.account,
					password: this.password
				}, 'POST').then(res => {
					if (res.code == 1) {
						const userinfo = res.data && res.data.userinfo ? res.data.userinfo : null
						if (!userinfo || !userinfo.token) {
							return
						}
						uni.setStorageSync('user', userinfo);
						this.$store.commit('setuser', userinfo)
						this.$store.commit('settoken', userinfo.token)
						setTimeout(() => {
							if (userinfo.need_edit == 0 && userinfo.status == 'normal') {
								this.util.urlTo('/pages/perfect/perfect')
							} else if (userinfo.need_edit == 1 && userinfo.status == 'normal') {
								this.$store.dispatch('imConnect')
								uni.reLaunch({
									url: '/pages/index/index'
								})
							}
						}, 500)
					} else if (res.code == 4002) {
						uni.hideLoading()
						this.content = res.msg
						this.show = true
					} else if (res.code == 4003) {
						uni.hideLoading()
						const userinfo = res.data && res.data.userinfo
						if (userinfo && userinfo.token) {
							uni.setStorageSync('user', userinfo);
							this.$store.commit('setuser', userinfo)
							this.$store.commit('settoken', userinfo.token)
							uni.showModal({
								title: '真人认证未通过',
								content: res.msg || '请重新提交认证视频',
								confirmText: '重新提交',
								cancelText: '稍后再说',
								success: result => {
									if (result.confirm) {
										uni.reLaunch({
											url: '/pages/perfect/perfect?auth=1'
										})
									} else {
										uni.removeStorageSync('user')
										uni.removeStorageSync('token')
										this.$store.state.user = {}
										this.$store.state.token = ''
									}
								}
							})
						} else {
							this.content = res.msg
							this.show = true
						}

					}
				}).catch(() => {}).finally(() => {
					uni.hideLoading()
				})
			}
		}
	}
</script>

<style lang="scss">
	.bg {
		width: 100%;
		background: url(/static/login.png) no-repeat;
		background-size: 100% 100%;
		height: 1082rpx;
	}

	.login-language {
		position: absolute;
		right: 0;
		top: calc(var(--status-bar-height, 0px) + 20rpx);
		z-index: 2;
		width: 25%;
		text-align: center;
	}

	.btn {
		margin: 53rpx 169rpx 0rpx 169rpx;
		height: 86rpx;
		background: #5A7EF6;
		border-radius: 43rpx;
		text-align: center;
		line-height: 86rpx;
		font-size: 30rpx;
		color: #fff;
	}

	.logo {
		width: 260rpx;
		height: 260rpx;
		border-radius: 52rpx;
		margin: 204rpx auto 40rpx auto;

	}

	.foot {
		font-size: 30rpx;
		color: #666666;
		text-align: center;
	}

	.input-box {
		margin: 34rpx 68rpx;
		background-color: #F1F6FE;
		height: 90rpx;
		border-radius: 45rpx;

		input {
			height: 90rpx;

			font-size: 30rpx;
			padding-left: 54rpx;
			padding-right: 15rpx;
		}
	}

	.input-boxs {
		margin: 34rpx 68rpx;
		background-color: #F1F6FE;
		height: 90rpx;
		border-radius: 45rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
</style>
