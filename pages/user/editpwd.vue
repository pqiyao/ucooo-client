<template>
	<view>
		<view class="" style="margin: 20rpx 30rpx;background: #EEEEEE;border-radius: 44rpx;height: 88rpx;">
			<input type="password" :placeholder="allText.我的页.请输入原密码" style="height: 88rpx;font-size: 30rpx;padding-left: 36rpx;" v-model="oldpwd" />
		</view>
		<view class="" style="margin: 20rpx 30rpx;background: #EEEEEE;border-radius: 44rpx;height: 88rpx;">
			<input type="password" :placeholder="allText.我的页.请输入新密码" style="height: 88rpx;font-size: 30rpx;padding-left: 36rpx;" v-model="newpwd"/>
		</view>
		<view class="" style="margin: 20rpx 30rpx;background: #EEEEEE;border-radius: 44rpx;height: 88rpx;">
			<input type="password" :placeholder="allText.我的页.再次输入新密码" style="height: 88rpx;font-size: 30rpx;padding-left: 36rpx;" v-model="twopwd"/>
		</view>
		<view class="" style="width: 100%;position: fixed;bottom: 100rpx;">
			<view class="" style="margin: 54rpx 105rpx;">
				<fui-button background="#5A7EF6" radius="46rpx" :disabled="submitting" :loading="submitting" @click="save">{{allText.我的页.确定}}</fui-button>
			</view>
		</view>
	</view>
</template>

<script>
	import fuiButton from "@/components/firstui/fui-button/fui-button.vue"
	export default {
		data() {
			return {
				oldpwd:'',
				newpwd:'',
				twopwd:'',
				submitting:false
			}
		},
		components: {
			fuiButton
		},
		methods: {
			save(){
				if (this.submitting) return
				if (!this.oldpwd || !this.newpwd || !this.twopwd) {
					this.util.showToast('请完整填写密码')
					return
				}
				if (this.newpwd.length < 8) {
					this.util.showToast('新密码至少需要8位')
					return
				}
				if(this.newpwd!=this.twopwd){
					this.util.showToast('两次输入的密码不一致')
					return
				}
				this.submitting = true
				this.util.request('user/reset_pwd',{
					token: uni.getStorageSync('user').token,
					old_pwd:this.oldpwd,
					new_pwd:this.newpwd
				},'POST').then(res=>{
					this.util.showToast(res.msg)
				}).catch(() => {}).then(() => {
					this.submitting = false
				})
			}
		}
	}
</script>

<style>

</style>
