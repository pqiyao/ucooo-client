<template>
	<view>
		<u-navbar :title="allText.我的页.会员中心" :background="background" :immersive="true" title-size="34" :title-bold="true"
			title-color="#333333"></u-navbar>
		<view class=""
			style="height: 900rpx;width: 100%;background: url(/static/user/vipbgs.png) no-repeat;background-size: 100% 100%;">
			<view class="" style="display: flex;align-items: center;padding-top: 209rpx;padding-left: 31rpx;">
				<image :src="userinfo.avatar" mode="aspectFill"
					style="width: 140rpx;height: 140rpx;border:1rpx solid #fff;border-radius: 50%;"></image>
				<view class="" style="margin-left: 20rpx;">
					<view class="" style="display: flex;align-items: center;">
						<view class="" style="font-size: 34rpx;font-weight: bold;">
							{{userinfo.nickname}}
						</view> 
						<view class=""
							style="margin-left: 11rpx;height: 40rpx;background: #F5F5F5;border-radius: 10rpx;text-align: center;line-height: 40rpx;font-size: 24rpx;color: #666666;padding: 0 10rpx;" v-if="userinfo.vip_type!=0&&userinfo.vip_type">
							{{allText.我的页.到期时间}}{{userinfo.vip_end_time_attr}}
						</view>
						<view class=""
							style="margin-left: 11rpx;height: 40rpx;background: #F5F5F5;border-radius: 10rpx;text-align: center;line-height: 40rpx;font-size: 24rpx;color: #666666;padding: 0 10rpx;" v-else>
							{{allText.我的页.普通使用者}}
						</view>
					</view>
					<view class="" style="font-size: 24rpx;color: #666666;padding-top: 17rpx;">
						{{allText.我的页.开通会员享受专属特权}}
					</view>
				</view>
			</view>
			<view class="" style="display: flex;align-items: center;padding: 40rpx 0 0 32rpx;">
				<view :class="current==k ? 'on1' : 'on'" v-for="(i,k) in tablist" :key="k" @tap="current=k,getuser()"
					style="margin-right: 88rpx;">
					{{i}}
				</view>
			</view>
			<view class="" style="margin-top: 34rpx;">
				<scroll-view :scroll-top="scrollTop" scroll-x="true" class="scroll-Y" style="white-space: nowrap;">
					<view class="" style="display: flex;align-items: center;">
						<view class="" v-for="(i,k) in viplist" :key="k" style="margin-left: 30rpx;">
							<view :class="current1==k ? 'xzsbtn' : 'zsbtn'" @tap="current1=k">
								<view class=""
									style="font-size: 26rpx;display: flex;align-items: center;justify-content: center;padding-top: 47rpx;">
									{{i.name}}
								</view>
								<view class="" style="font-size: 40rpx;font-weight: bold;text-align: center;padding-top: 25rpx;">
									${{i.now_price}}
								</view>
								<view class="neibtn">
									{{allText.我的页.每日仅需}}${{i.old_price}}
								</view>

							</view>
						</view>

					</view>
				</scroll-view>
			</view>
			<view class="" style="font-size: 36rpx;font-weight: bold;padding: 76rpx 0 40rpx 33rpx;">
				{{current==0 ? allText.我的页.VIP特权 : allText.我的页.高级VIP特权}}
				
			</view>
		</view>
		<view class="" style="margin: 0 30rpx;box-shadow: 0rpx 0rpx 16rpx 0rpx rgba(67,67,67,0.15);background: #FFFFFF;border-radius: 20rpx;display: flex;align-items: flex-start;flex-wrap: wrap;">
			<view class="" style="width: 33.3%;" v-for="(i,k) in tequan" :key="k">
				
				<view class="" style="width: 200rpx;text-align: center;margin: 30rpx auto;" v-if="current==0 ? k<8 : true">
					<image :src="'/static/user/v'+k+'.png'" mode="" style="width: 120rpx;height: 120rpx;"></image>
					<view class="" style="font-size: 28rpx;">
						{{i.name}}
					</view>
					<view class="" style="font-size: 22rpx;color: #666666;">
						{{i.txt}}
					</view>
				</view>
			</view>
		</view>
		<view class="vip-pay-bottom">
			<pay-kefu-fab mode="bar" />
			<view class="tongbtn tongbtn-line" @tap="tokefu">
				{{allText.我的页.聯繫客服LINE}}
			</view>
			<view class="tongbtn" :class="{ 'is-disabled': submitting }" @tap="kai">
				{{allText.我的页.立即开通}}
			</view>
		</view>
		<u-gap height="200"></u-gap>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				scrollTop: 0,
				background: {
					backgroundColor: ''
				},
				tablist: [this.allText.我的页.普通会员, this.allText.我的页.高级会员],
				current: 0,
				current1: 0,
				viplist: [],
				datadown:{},
				tequan:[
					{
						name:this.allText.我的页.解锁私聊,
						txt:this.allText.我的页.无限制
					},{
						name:this.allText.我的页.查看访问,
						txt:this.allText.我的页.查看访客记录
					},{
						name:this.allText.我的页.发布评论,
						txt:this.allText.我的页.随时发布评论
					},{
						name:this.allText.我的页.发布动态,
						txt:this.allText.我的页.随时发布评论
					},{
						name:this.allText.我的页.一键搭讪,
						txt:this.allText.我的页.天次
					},{
						name:this.allText.我的页.查看谁关注了你,
						txt:this.allText.我的页.查看粉丝信息
					},{
						name:this.allText.我的页.点赞,
						txt:this.allText.我的页.随时点赞动态
					},{
						name:this.allText.我的页.聊天自带翻译,
						txt:this.allText.我的页.无限制
					},{
						name:this.allText.我的页.客服,
						txt:this.allText.我的页.拥有24小时专属客服
					},{
						name:this.allText.我的页.已读,
						txt:this.allText.我的页.显示消息是否已读
					},{
						name:this.allText.我的页.推荐,
						txt:this.allText.我的页.将您的资料推荐给至少20名女士以及新注册女士
					},{
						name:this.allText.我的页.量身打造,
						txt:this.allText.我的页.使用精准算法为您推荐更适合您的异性提高约会成功率
					},
				],
				userinfo:{},
				submitting:false
			}
		},
		onLoad() {
			this.getkefu()
		},
		methods: {
			tokefu() {
				const id = this.datadown && this.datadown.set_customer_service
				if (id) {
					this.util.urlTo('/pages/chatNew/chatpage?id=' + encodeURIComponent(String(id)))
					return
				}
				window.location.href = 'https://line.me/ti/p/ngnsR676c6'
			},
			getkefu() {
				uni.showLoading({
					title: 'login...',
					mask: true
				})
				this.util.request('index/get_global_config', {
					token: uni.getStorageSync('user').token
				}).then(res => {
					this.datadown = res
					uni.hideLoading()
				})
			},
			kai(){
				if (this.submitting) return
				const selected = this.viplist[this.current1]
				if (!selected || !selected.vip_id) {
					this.util.showToast('请选择会员套餐')
					return
				}
				this.submitting = true
				this.util.request('vip/add_vip_order',{
					token: uni.getStorageSync('user').token,
					other_id:this.userinfo.user_id,
					vip_id:selected.vip_id
				}).then(res=>{
					this.util.urlTo('/pages/user/pay?detail='+JSON.stringify(res))
				}).catch(() => {}).then(() => {
					this.submitting = false
				})
			},
            getuser(){
				this.util.request('user/user_info',{
					token: uni.getStorageSync('user').token
				}).then(res=>{
					this.userinfo=res
				})
				this.util.request('vip/good_list',{
					token: uni.getStorageSync('user').token,
					status:this.current+1
				}).then(res=>{
					this.viplist=res
				})
			}
		},
		onShow() {
			this.getuser()
		}
	}
</script>

<style lang="scss">
	.vip-pay-bottom .tongbtn {
		margin: 16rpx 30rpx;
	}

	.tongbtn{
		margin: 31rpx 30rpx;
		height: 86rpx;
		background: linear-gradient(0deg, #B2711D 0%, #FCD7A3 100%);
		border-radius: 43rpx;
		text-align: center;
		line-height: 86rpx;
		font-size: 30rpx;
		color: #fff;
	}
	.tongbtn.is-disabled { opacity: .62; }
	.on {
		font-size: 30rpx;
		color: #333333;
	}

	.on1 {
		font-size: 36rpx;
		color: #333333;
		font-weight: bold;
	}

	.zsbtn {
		width: 200rpx;
		height: 255rpx;
		background: #FFFFFF;
		border-radius: 20rpx;
		color: #222222;

		.neibtn {
			width: 174rpx;
			height: 42rpx;
			background: rgba(221,221,221,0.8);
			border-radius: 10rpx;
			text-align: center;
			line-height: 42rpx;
			font-size: 22rpx;
			color: #666666;
			margin: 25rpx auto;
		}
	}

	.xzsbtn {
		width: 200rpx;
		height: 255rpx;
		background: #FFF1DB;
		border-radius: 20rpx;
		border: 2rpx solid #FFE3BC;
		color: #222222;

		.neibtn {
			width: 178rpx;
			height: 42rpx;
			background: rgba(255,213,155,0.6);
			border-radius: 10rpx;
			text-align: center;
			line-height: 42rpx;
			font-size: 22rpx;
			color:#6D3B16;
			margin: 25rpx auto;
		}
	}
</style>
