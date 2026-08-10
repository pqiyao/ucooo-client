<template>
	<view>
		<view class="" style="margin:20rpx auto;width: 690rpx;">
			<view class="">{{allText.我的页.国家或地区}}</view>
			<view class="" style="margin-top: 20rpx;">
				<u-input v-model="country" border :placeholder="allText.我的页.国家或地区"/>
			</view>
		</view>
		<view class="" style="margin:20rpx auto;width: 690rpx;">
			<view class="">{{allText.我的页.卡号}}</view>
			<view class="" style="margin-top: 20rpx;">
				<u-input v-model="id_no" border :placeholder="allText.我的页.卡号"/>
			</view>
		</view>
		<view class="" style="margin:20rpx auto;width: 690rpx;">
			<view class="">{{allText.我的页.姓名}}</view>
			<view class="" style="margin-top: 20rpx;">
				<u-input v-model="username" border :placeholder="allText.我的页.姓名"/>
			</view>
		</view>
		<view class="" style="margin:20rpx auto;width: 690rpx;">
			<view class="">{{allText.我的页.退款金额}}</view>
			<view class="" style="margin-top: 20rpx;">
				<u-input v-model="money" border :placeholder="allText.我的页.退款金额"/>
			</view>
		</view>
		<view class="" style="margin:100rpx auto;width: 690rpx;">
			<u-button type="primary" :disabled="submitting" :loading="submitting" @click="createRefundLog">{{allText.我的页.提交}}</u-button>
		</view>
		<u-popup v-model="show" border-radius="14" mode="center" @close="close">
			<view style="width: 690rpx;">
				<view class="" style="padding: 20rpx;border-bottom: 1rpx solid #e2e2e2;font-weight: bold;">Tips</view>
				<view class="" style="padding: 20rpx;">
					{{allText.我的页.先生您好已成功将您的资料汇总给财务部门您的资料正在审核中请您耐心等待}}
				</view>
			</view>
		</u-popup>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				show:false,
				country:'',
				id_no:'',
				username:'',
				money:'',
				submitting:false
			}
		},
		methods: {
			close(){
				uni.navigateBack()
			},
			createRefundLog(){
				if (this.submitting) return
				if (!this.country || !this.id_no || !this.username || !this.money) {
					this.util.showToast('请完整填写退款信息')
					return
				}
				const amount = Number(this.money)
				if (!Number.isFinite(amount) || amount <= 0) {
					this.util.showToast('请输入正确的退款金额')
					return
				}
				this.submitting = true
				this.util.request('user/createRefundLog', {
					token: uni.getStorageSync('user').token,
					country:this.country,
					id_no:this.id_no,
					username:this.username,
					money:this.money
				}).then(res => {
					this.show = true
				}).catch(() => {}).then(() => {
					this.submitting = false
				})
			}
		}
	}
</script>

<style>

</style>
