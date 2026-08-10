<template>
	<view>
		<view class="" style="display: flex;align-content: center;justify-content: space-between;padding: 28rpx 30rpx;" v-for="(i,k) in list" :key="k" @tap="current=k">
			<view class="" style="font-size: 30rpx;">
				{{i}}
			</view>
			<view class="">
				<image :src="current==k ? '/static/user/wx.png' : '/static/user/xz.png'" mode="" style="width: 35rpx;height: 35rpx;"></image>
			</view>
		</view>
		<view class="" style="width: 100%;position: fixed;bottom: 100rpx;">
			<view class="" style="margin: 54rpx 30rpx;">
				<fui-button background="#5A7EF6" radius="46rpx" @click="submit">{{allText.我的页.确定}}</fui-button>
			</view>
		</view>
		
	</view>
</template>

<script>
	import fuiButton from "@/components/firstui/fui-button/fui-button.vue"
	import languagePreference from '@/common/languagePreference.js'
	export default {
		data() {
			return {
				// list:[this.allText.我的页.繁体中文,this.allText.我的页.简体中文,this.allText.我的页.英文,this.allText.我的页.韩语,this.allText.我的页.日语,this.allText.我的页.德语,this.allText.我的页.法语],
				list:['繁体中文','简体中文','English','한국어','日本語','Deutsch','Français'],
				current:0
			}
		},
		components: {
			fuiButton
		},
		methods: {
			submit(k) {
				this.current = languagePreference.setLanguageIndex(this.current, true);
				this.languageChange();	
				this.util.request('index/article_info', {id:1}, 'POST').then(res =>{
					this.$store.commit('setxieyi',res && res.data ? res.data.content : '')
				}).catch(() => {})
				this.util.request('user/updLang',{
					token: uni.getStorageSync('user').token,
					clang: languagePreference.codeForIndex(this.current)
				}).then(res=>{
					setTimeout(()=>{
						uni.navigateBack()
					},1000)
				})
				
			}
		},
		onShow() {
			this.current = languagePreference.getLanguageIndex();
		}
	}
</script>

<style>

</style>
