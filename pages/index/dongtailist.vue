<template>
	<view>
		<view class="" style="height: 6rpx;box-shadow: 0rpx 3rpx 3rpx 0rpx rgba(153,153,153,0.1);"></view>
		<view class="" style="border-bottom: 1rpx solid #F5F5F5;" v-for="(i,k) in dynamic_list" :key="k">
			<view class=""
				style="display: flex;align-items: center;justify-content: space-between;padding: 28rpx 24rpx;">
				<view class="" style="display: flex;align-items: center;">
					<image :src="i.avatar" mode="aspectFill" style="width: 110rpx;height: 110rpx;border-radius: 50%;">
					</image>
					<view class="" style="margin-left: 14rpx;">
						<view class="" style="display: flex;align-items: center;">
							<view class="" style="font-size: 30rpx;font-weight: bold;">
								{{i.nickname}}
							</view>
							<view class=""
								style="width: 68rpx;height: 30rpx;background: #EEEEEE;border-radius: 15rpx;font-size: 21rpx;display: flex;align-items: center;justify-content: center;margin-left: 22rpx;"
								:style="{color:i.gender==2 ? '#FF738E' : '#56A0FF'}">
								<image :src="i.gender==2 ? '/static/home/nv.png' : '/static/home/nan.png'"
									mode="" style="width: 24rpx;height: 24rpx;padding-right: 5rpx;"></image>
								<text>{{i.age}}</text>
							</view>
						</view>
						<view class="" style="font-size: 26rpx;color: #999999;padding-top: 8rpx;">
							{{i.country}}
						</view>
					</view>

				</view>

			</view>
			<view class="" style="padding: 0 26rpx 10rpx 26rpx;font-size: 28rpx;">
				{{i.content}}
			</view>

			<view class="" style="display: flex;align-items: center;flex-wrap: wrap;margin: 0 25rpx;"
				v-if="i.have_source==1">
				<view class="" style="width: 33.3%;text-align: center;margin-top: 10rpx;" v-for="(m,n) in i.img_list"
					:key="n" @tap="lookImg(i.img_list,n)">
					<image :src="m.image" mode="aspectFill" style="width: 230rpx;height: 230rpx;border-radius: 15rpx;">
					</image>
				</view>
			</view>
			<view class=""
				style="width: 420rpx;height: 508rpx;background: url(/static/home/mei.png) no-repeat;background-size: 100% 100%;border-radius: 20rpx;display: flex;align-items: center;justify-content: center;margin: 22rpx 29rpx;"
				v-if="i.have_source==2">
				<image src="/static/home/bo.png" mode="" style="width: 86rpx;height: 86rpx;"></image>
			</view>


			<view class=""
				style="display: flex;align-items: center;justify-content: space-between;padding: 33rpx 37rpx;">
				<view class="" style="display: flex;align-items: center;">
					<view class="" style="display: flex;align-items: center;font-size: 26rpx;" @tap.stop="zan(i.id,k)">
						<image :src="i.is_zan==0 ? '/static/home/zan.png' : '/static/home/xzan.png'" mode=""
							style="width: 30rpx;height: 30rpx;"></image>
						<view class="" style="padding-left: 10rpx;">
							{{i.great_num}}
						</view>
					</view>
					<view class="" style="display: flex;align-items: center;font-size: 26rpx;margin-left: 64rpx;">
						<image src="/static/home/edits.png" mode="" style="width: 30rpx;height: 30rpx;"></image>
						<view class="" style="padding-left: 10rpx;">
							{{i.comments_num}}
						</view>
					</view>
				</view>

			</view>
		</view>
		<u-popup v-model="show" mode="center" width="624rpx" height="308rpx" border-radius="20">
			<view style="font-size: 30rpx;font-weight: bold;text-align: center;padding-top: 74rpx;">{{allText.首页.该功能仅对VIP会员开放}}</view>
			<view class="btn1" @tap="util.urlTo('/pages/user/myvip')">
				{{allText.首页.升级VIP会员}}
			</view>
		</u-popup>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				show: false,
				dynamic_list: [],
				page: 1,
				id: '',
				to_id: ''
			}
		},
		methods: {

			getdong(e) {
				if (e == 1) {
					this.page = 1
					this.dynamic_list = []
				}
				this.util.request('dynamic/dynamic_list', {
					page: this.page,
					token: uni.getStorageSync('user').token,
					to_id: this.to_id
				}).then(res => {
					this.dynamic_list = this.dynamic_list.concat(res.list)
					this.page++
				})
			},
			lookImg(e, index = 0, item) {
				let url;
				if (Array.isArray(e)) {
					url = e;
				} else {
					url = [e];
				}
				let urls = [];
				// if (item) {
				url.map(i => {
					urls.push(i.image);
				})
				url = urls;
				// }
				uni.previewImage({
					urls: url,
					current: index
				})
			},
			zan(a, b) {
				this.util.request('user/user_info', {
					token: uni.getStorageSync('user').token
				}).then(res => {
					if (res.is_vip == 'one') {
						this.util.request('dynamic/great_dynamic', {
							dynamic_id: a,
							token: uni.getStorageSync('user').token
						}).then(res => {
							if (this.dynamic_list[b].is_zan == 0) {
								this.dynamic_list[b].great_num++
								this.dynamic_list[b].is_zan = 1
							} else {
								this.dynamic_list[b].great_num--
								this.dynamic_list[b].is_zan = 0
							}


						})
					} else {
						this.show = true
					}
				})

			},
		},
		onLoad(op) {
			this.to_id = op.id
		},
		onShow() {
			this.getdong(1)
		}
	}
</script>

<style>
	.btn {
		width: 140rpx;
		height: 50rpx;
		border-radius: 25rpx;
		border: 1rpx solid #333333;
		text-align: center;
		line-height: 50rpx;
		font-size: 26rpx;

	}
	.btn1 {
		margin: 33rpx 195rpx;
		height: 70rpx;
		background: #5A7EF6;
		border-radius: 35rpx;
		text-align: center;
		line-height: 70rpx;
		font-size: 28rpx;
		color: #fff;
	}
</style>