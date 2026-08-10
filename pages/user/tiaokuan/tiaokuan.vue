<template>
	<view>
		<rich-text :nodes="content"></rich-text>
		<u-gap height="200"></u-gap>
		<bottombox>
			<view class="" style="padding: 20rpx;background-color: #FFFFFF;">
				<rich-text :nodes="xieyi"></rich-text>
			</view>
		</bottombox>
	</view>
</template>

<script>
	import{
		mapState
	}from 'vuex'
	export default {
		data() {
			return {
				content:''
			}
		},
		computed:{
			...mapState(['xieyi'])
		},
		onLoad() {
			this.getxieyi()
		},
		methods: {
			getxieyi(){
				this.util.request('index/article_info', {id:4}, 'POST').then(res =>{
					this.content = res && res.data ? res.data.content : ''
				}).catch(() => {})
			},
		}
	}
</script>

<style>

</style>
