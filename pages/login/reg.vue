<template>
	<view>
		<u-navbar title="" :background="background" :immersive="true" title-size="34" :title-bold="true"
			title-color="#fff"></u-navbar>
		<view class="bg">
			<view class="" style="text-align: center;">
				<image src="/static/logo.png" mode="" class="logo"></image>
			</view>

			<view class="input-box" style="">
				<input type="text" :placeholder="allText.登录页.请输入用户名" v-model="username" />
			</view>

			<view class="input-box" style="">
				<input type="text" :placeholder="allText.登录页.请输入邮箱号 + '（选填，用于找回密码）'" v-model="email" />
			</view>

			<view v-if="needInviteCode" class="input-box" style="">
				<input type="text" placeholder="请输入邀请码" v-model="pid" />
			</view>

			<!-- <view class="input-boxs">
				<input type="text" :placeholder="allText.登录页.请输入验证码" maxlength="11" v-model="code"
					style="width: 45%;height: 80rpx;background: #F9FCFF;border: none;border-radius: 45rpx;font-size: 30rpx;padding-left: 49rpx;" />
				<view class="" style="font-size: 28rpx;padding-right: 18rpx;" @tap="getCode">
					 {{codeNun==60 ? allText.登录页.获取验证码 : codeNun+'s'}}
				</view>
			</view> -->

			<view class="input-boxs">
				<input :type="inputshow ? 'text' : 'password'" :placeholder="allText.登录页.请输入密码"  v-model="pwd"
					style="width: 80%;height: 80rpx;background: #F9FCFF;border: none;border-radius: 45rpx;font-size: 30rpx;padding-left: 49rpx;" />
				<image :src="inputshow ? '/static/bieye.png' : '/static/eye.png'" mode=""
					style="width: 40rpx;height: 40rpx;margin-right: 38rpx;" @tap="inputshow=!inputshow"></image>
			</view>
			<view class="input-boxs">
				<input :type="inputshow ? 'text' : 'password'" :placeholder="allText.登录页.再次输入密码" v-model="pwd2"
					style="width: 80%;height: 80rpx;background: #F9FCFF;border: none;border-radius: 45rpx;font-size: 30rpx;padding-left: 49rpx;" />
				<image :src="inputshow ? '/static/bieye.png' : '/static/eye.png'" mode=""
					style="width: 40rpx;height: 40rpx;margin-right: 38rpx;" @tap="inputshow=!inputshow"></image>
			</view>



		</view>
		<view class="" style="margin: 0rpx 68rpx 50rpx 68rpx;">
			<fui-button background="#5A7EF6" disabledBackground="#e3e3e3f2" radius="46rpx" @click="reg" :disabled="!agreePrivacy">{{allText.登录页.立即注册}}</fui-button>

			<view class="privacy-agreement" style="display: flex;align-items: center;margin-top: 30rpx;font-size: 26rpx;color: #666;justify-content: center;">
				<image src="/static/user/wx.png" v-if="agreePrivacy" style="width: 40rpx;height: 40rpx;" mode="" @tap="agreePrivacy = !agreePrivacy"></image>
				<image src="/static/user/xz.png" v-else style="width: 40rpx;height: 40rpx;" mode="" @tap="agreePrivacy = !agreePrivacy"></image>
				<view style="margin-left: 10rpx;">
					{{allText.登录页.我已阅读并同意}}
					<text style="color: #5A7EF6;" @tap="util.urlTo('/pages/user/yinshi/yinshi')">{{allText.我的页.隐私协议}}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import fuiButton from "@/components/firstui/fui-button/fui-button.vue"
	export default {
		data() {
			return {
				inputshow: false,
				show: false,
				background: {
					backgroundColor: ''
				},
				code_url: '',
				code: '',
				pwd: '',
				pwd2:'',
				email: '',
				username: '',
				code_id:'',
				codeNun: 60,
				agreePrivacy: true,
				needInviteCode: false,
				pid: ''
			}
		},
		components: {
			fuiButton
		},
		methods: {
			timer() {
				let _this = this;
				let type = 1;
				setInterval(function() {
					if (_this.codeNun == 0) {
						_this.codeNun = 60;
						type = 0;
					} else if (type == 1) {
						_this.codeNun--;
					}
				}, 1000)
			},
			getCode() {
				if (this.codeNun != 60) {
					return false;
				}
				if (this.email=='') {
					this.util.showToast(this.allText.登录页.请输入邮箱号)
					return false
				}
				this.util.request('/ems/send', {
					email:this.email,
					event:'register',
			
				}).then(res => {
					this.timer();
				})
			},
			
			// getCap() {
			// 	this.util.request('index/getCaptchaUrl', {

			// 	}).then(res => {
			// 		this.code_id=res.code_id
			// 		this.code_url = res.code_url
			// 	})
			// },
			loadRegisterConfig() {
				this.util.request('index/get_global_config', {}).then(res => {
					this.needInviteCode = String(res.need_invite_code) === '1'
				}).catch(() => {})
			},
			reg() {
				if(this.pwd != this.pwd2){
					this.util.showToast(this.allText.登录页.两次密码不一致)
					return
				} 
				if (!this.agreePrivacy) {
					this.util.showToast(this.allText.登录页.请先同意隐私协议)
					return false
				}
				// if (this.email=='') {
				// 	this.util.showToast(this.allText.登录页.请输入邮箱号)
				// 	return false
				// }
				// if (this.code == '') {
				// 	this.util.showToast(this.allText.登录页.请输入验证码)
				// 	return false
				// }
				if (this.username == '') {
					this.util.showToast(this.allText.登录页.请输入用户名)
					return false
				}
				if (this.pwd == '') {
					this.util.showToast(this.allText.登录页.请输入密码)
					return false
				}
				if (this.pwd.length < 6) {
					this.util.showToast('密码至少6位')
					return false
				}
				if (this.needInviteCode && !this.pid) {
					this.util.showToast('请输入邀请码')
					return false
				}
				const email = (this.email || '').trim()
				if (email && !this.util.checkEmail(email)) {
					this.util.showToast(this.allText.登录页.请输入邮箱号 || '邮箱格式不正确')
					return false
				}
				uni.showLoading({
					mask: true
				})
				this.util.request('index/emsregister', {
					password: this.pwd,
					username: this.username,
					email: email,
					pid: this.pid,
					type: 0
				}, 'POST').then(res => {
					if (res.code != 1) {
						return
					}
					this.util.showToast(res.msg)
					const userinfo = res.data && res.data.userinfo ? res.data.userinfo : {}
					uni.setStorageSync('user', userinfo);
					this.$store.commit('setuser', userinfo)
					if (userinfo.is_register_temp == 1) {
						this.$store.state.token = ''
						uni.removeStorageSync('token')
					} else {
						this.$store.commit('settoken', userinfo.token)
					}
					setTimeout(() => {
						this.util.urlTo('/pages/perfect/perfect')
					}, 500)
				}).catch(() => {}).finally(() => {
					uni.hideLoading()
				})
			}
		},
		onShow() {
			this.loadRegisterConfig()
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
		background-color: #F9FCFF;
		height: 90rpx;
		border-radius: 45rpx;

		input {
			height: 90rpx;

			font-size: 30rpx;
			padding-left: 54rpx;
		}
	}

	.input-boxs {
		margin: 34rpx 68rpx;
		background-color: #F9FCFF;
		height: 90rpx;
		border-radius: 45rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
</style>
