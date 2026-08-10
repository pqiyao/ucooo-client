<template>
	<view>
		<view class="user-profile-head" @tap="util.urlTo('/pages/user/editziliao')">
			<view class="" style="display: flex;align-items: center;" >
				<image :src="userinfo.avatar" mode="aspectFill"
					style="width: 140rpx;height: 140rpx;border:1rpx solid #fff;border-radius: 50%;" ></image>
				<view class="" style="margin-left: 20rpx;">
					<view class="" style="display: flex;align-items: center;">
						<view class="" style="font-size: 34rpx;font-weight: bold;">
							{{userinfo.nickname}}
						</view>
						<view class="btn" style="margin-left: 11rpx;" v-if="userinfo.vip_type!=0&&userinfo.vip_type">
							{{allText.我的页.会员用户}}
						</view>
					</view> 
					<view class=""
						style="background: #FFFFFF;border-radius: 15rpx;font-size: 20rpx;color: #4AA9FE;display: flex;align-items: center;margin-top: 9rpx;padding: 0 15rpx;" >
						<!-- <image src="/static/user/rz.png" mode="" style="width: 20rpx;height: 22rpx;"></image> -->
						<text>{{allText.我的页.待退款金额}}</text>
						<text style="margin-left: 10rpx;">{{userinfo.moneyalias}}</text>
						<text>{{userinfo.pendingmoney}}</text>
					</view>
				</view>
			</view>
			<view class="" style="display: flex;align-items: center;">
				<view class="" @click.stop="tuikuan">{{allText.我的页.申请退款}}</view>
				<u-icon name="arrow-right" color="#333333" size="28"></u-icon>
			</view>
		</view>

		<view class="" style="display: flex;align-items: center;justify-content: space-between;padding: 50rpx 64rpx;">
			<view class="" style="text-align: center;" @tap="util.urlTo('/pages/user/focus')">
				<view class="" style="font-size: 32rpx;font-weight: bold;">
					{{allnum.follow_num}}
				</view>
				<view class="" style="font-size: 26rpx;color: #666666;">
					{{allText.我的页.关注}}
				</view>
			</view>
			<view class="" style="text-align: center;" @tap="util.urlTo('/pages/user/dongtai')">
				<view class="" style="font-size: 32rpx;font-weight: bold;">
					{{allnum.dynamic_num}}
				</view>
				<view class="" style="font-size: 26rpx;color: #666666;">
					{{allText.我的页.动态}}
				</view>
			</view>
			<view class="" style="text-align: center;" @tap="openVipFeature('/pages/user/focus?current=1')">
				<view class="" style="font-size: 32rpx;font-weight: bold;">
					{{allnum.fans_num}}
				</view>
				<view class="" style="font-size: 26rpx;color: #666666;">
					{{allText.我的页.粉丝}}
				</view>
			</view>
			<view class="" style="text-align: center;" @tap="util.urlTo('/pages/user/myzan')">
				<view class="" style="font-size: 32rpx;font-weight: bold;">
					{{allnum.great_num}}
				</view>
				<view class="" style="font-size: 26rpx;color: #666666;">
					{{allText.我的页.点赞}}
				</view>
			</view>
			<view class="" style="text-align: center;" @tap="openVipFeature('/pages/user/whome')">
				<view class="" style="font-size: 32rpx;font-weight: bold;">
					{{allnum.visit_num}}
				</view>
				<view class="" style="font-size: 26rpx;color: #666666;">
					{{allText.我的页.访客}}
				</view>
			</view>
		</view> 

		<view class=""
			style="display: flex;align-items: center;justify-content: space-between;margin: 20rpx 30rpx;background: url(/static/user/vipbg.png) no-repeat;background-size: 100% 100%;height: 170rpx;"
			@tap="util.urlTo('/pages/user/myvip')">
			<view class="" style="display: flex;align-items: center;margin-left: 12rpx;">
				<!-- <image src="/static/user/vipbg.png" mode=""></image> -->
				<image src="/static/user/guan.png" mode="" style="width: 90rpx;height: 90rpx;"></image>
				<view class="" style="margin-left: 23rpx;">
					<view class="" style="font-size: 34rpx;font-weight: bold;">
						{{allText.我的页.会员}}
					</view>
					<view class="" style="font-size: 28rpx;padding-top: 15rpx;">
						{{allText.我的页.开通VIP解锁专属特权}}
					</view>
				</view>
			</view> 
			<view class="t-btn" style="margin-right: 20rpx;">
				{{allText.我的页.开通会员}}
			</view>
		</view>

		<view class=""
			style="display: flex;align-items: center;justify-content: space-between;margin: 20rpx 30rpx;background: url(/static/user/qianbg.png) no-repeat;background-size: 100% 100%;height: 170rpx;" @tap="util.urlTo('/pages/user/mymoney')">
			<view class="" style="display: flex;align-items: center;margin-left: 12rpx;">

				<image src="/static/user/qian.png" mode="" style="width: 90rpx;height: 90rpx;"></image>
				<view class="" style="margin-left: 23rpx;font-size: 34rpx;font-weight: bold;">
					{{allText.我的页.我的钱包}} 
				</view>
			</view> 
			<view style="margin-right: 20rpx;">
				<image src="/static/user/qianright.png" mode="" style="width: 249rpx;height: 127rpx;"></image>
			</view>
		</view>

		<view class=""
			style="margin: 39rpx 30rpx;box-shadow: 0rpx 0rpx 32rpx 0rpx rgba(86,86,86,0.1);border-radius: 20rpx;background: #fff;padding-bottom: 51rpx;">
			<view class="" style="font-size: 34rpx;font-weight: bold;padding: 34rpx 0 0 34rpx;">
				{{allText.我的页.常用功能}}
			</view>
			<view class="" style="display: flex;align-items: center;flex-wrap: wrap;">
				<view class="" v-for="(i,k) in list" :key="k" style="width: 25%;text-align: center;margin-top: 49rpx;" @tap="joop(k)">
					<image :src="'/static/user/u'+k+'.png'" mode="" style="width: 44rpx;height: 44rpx;"></image>
					<view class="" style="font-size: 26rpx;padding-top: 10rpx;">
						{{i}}
					</view>
				</view>
			</view>


		</view>
		<u-popup v-model="showVip" mode="center" width="624rpx" height="308rpx" border-radius="20" z-index="970">
			<view class="vip-popup-title">
				{{allText.首页.该功能仅对VIP会员开放}}
			</view>
			<view class="vip-popup-button" hover-class="vip-popup-button-active" @tap.stop="goVip">
				{{allText.首页.升级VIP会员}}
			</view>
		</u-popup>

		<u-popup v-model="show1" mode="center" border-radius="20" width ="694" z-index="969">
		
			<view class=""
				style="margin: 0 10rpx;background: #fff;border-radius: 20rpx;box-shadow: 0rpx 0rpx 24rpx 0rpx rgba(83,83,83,0.06);padding-bottom: 1rpx;">
				<view class=""
					style="display: flex;align-items: center;justify-content: space-between;padding: 30rpx 20rpx;">
					<!-- <image src="/static/home/xindong.png" mode="" style="width: 234rpx;height: 29rpx;" v-if="tuishow==1"></image>
					<image src="/static/home/ying.png" mode="" style="width: 445rpx;height: 29rpx;" v-if="tuishow==0"></image>
					<image src="/static/home/ri.png" mode="" style="width: 361rpx;height: 29rpx;" v-if="tuishow==4"></image>
					<image src="/static/home/riyu.png" mode="" style="width: 238rpx;height: 29rpx;" v-if="tuishow==3"></image>
					<image src="/static/home/f1.png" mode="" style="width: 198rpx;height: 29rpx;" v-if="tuishow==2"></image> -->
					<!-- 简体中文 -->
					<image src="/static/home/xindong.png" mode=""
						style="width: 234rpx;height: 29rpx;" v-if="tuishow==1"></image> 
						<!-- 英语 -->
					<image src="/static/home/ying.png" mode=""
						style="width: 445rpx;height: 29rpx;" v-if="tuishow==2"></image>
						<!-- 日语 -->
					<image src="/static/home/ri.png" mode=""
						style="width: 361rpx;height: 29rpx;" v-if="tuishow==4"></image>
						<!-- 韩语 -->
					<image src="/static/home/riyu.png" mode=""
						style="width: 238rpx;height: 29rpx;" v-if="tuishow==3"></image>
						<!-- 繁体 -->
					<image src="/static/home/f1.png" mode=""
						style="width: 198rpx;height: 29rpx;" v-if="tuishow==0"></image>
					<view class="" style="display: flex;align-items: center;font-size: 26rpx;" @tap="pubuser">
						<image src="/static/home/shuaxin.png" mode="" style="width: 24rpx;height: 24rpx;"></image>
						<view class="" style="padding-left: 12rpx;">
							{{allText.首页.换一批}}
						</view>
					</view>
				</view>
			
				<!-- meinv -->
				<view class="" style="display: flex;align-items: center;padding: 0 13rpx;">
					<view class="" style="width: 33.3%;" v-for="(i,k) in tuilist" :key="k">
						<view class=""
							style="width: 206rpx;height: 263rpx;background-size: cover;border-radius: 16rpx;margin: 0 auto;display: flex;align-items: flex-end;background-repeat: no-repeat;"
							:style="{backgroundImage:'url('+i.avatar+')'}">
			
							<view class=""
								style="padding: 15rpx 6rpx;background: linear-gradient(0deg, #000000 0%, rgba(0,0,0,0) 100%);border-radius: 20rpx;">
								<view class="" style="font-size: 24rpx;color: #fff;display: flex;align-items: center;">
									<text>{{i.nickname}}</text>
									<image :src="i.vip_type==1 ? '/static/home/vip.png' : '/static/work/vip.png'" mode=""
										style="width: 28rpx;height: 28rpx;padding-left: 6rpx;" v-if="i.vip_type!=0">
									</image>
								</view>
								<view class=""
									style="font-size: 20rpx;color: #fff;width: 196rpx;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;">
									{{i.height}}cm·{{i.weight}}kg·{{i.occupation_arr}}
								</view>
							</view>
			
						</view>
					</view>
				</view>
				<view class="btns" @tap="allone">
					{{allText.首页.一键搭讪}}
				</view>
			</view>
			<!-- <view class=""
				style="margin: 0 10rpx;background: #fff;border-radius: 20rpx;box-shadow: 0rpx 0rpx 24rpx 0rpx rgba(83,83,83,0.06);padding-bottom: 1rpx;">
				<view class=""
					style="display: flex;align-items: center;justify-content: flex-end;padding: 30rpx 20rpx;">
					<image src="/static/user/ri.png" mode="" style="width: 156rpx;height: 30rpx;"></image>
					<view class="" style="display: flex;align-items: center;font-size: 26rpx;margin-left: 124rpx;">
						<image src="/static/home/shuaxin.png" mode="" style="width: 24rpx;height: 24rpx;"></image>
						<view class="" style="padding-left: 12rpx;">
							{{allText.首页.换一批}}
						</view>
					</view>
				</view>
			
				
				<view class="" style="display: flex;align-items: center;">
					<view class="" style="width: 33.3%;" v-for="i in 3">
						<view class=""
							style="width: 206rpx;height: 263rpx;background: url(/static/home/mei.png) no-repeat;background-size: 100% 100%;border-radius: 16rpx;margin: 0 auto;display: flex;align-items: flex-end;">
			
							<view class="" style="padding: 15rpx 6rpx;background: linear-gradient(0deg, #000000 0%, rgba(0,0,0,0) 100%);border-radius: 20rpx;">
								<view class="" style="font-size: 24rpx;color: #fff;display: flex;align-items: center;">
									<text>甜美长腿美女</text>
									<image src="/static/home/vip.png" mode="" style="width: 28rpx;height: 28rpx;">
									</image>
								</view>
								<view class="" style="font-size: 20rpx;color: #fff;">
									167cm·45kg·学生
								</view>
							</view>
			
						</view>
					</view>
				</view>
				<view class="btns">
					{{allText.首页.一键搭讪}}
				</view>
				<view class="" style="font-size: 26rpx;color: #666;text-align: center;padding-bottom: 60rpx;">
					今日还剩10次免费打招呼
				</view>
			</view> -->
		</u-popup>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				list: [this.allText.我的页.我的资料, this.allText.我的页.认证中心, this.allText.我的页.礼物商城, this.allText.我的页.个人相册, this.allText.我的页.一键搭讪, this.allText.我的页.联系客服, this.allText.我的页.语言, this.allText.我的页.设置],
				showVip: false,
				show1: false,
				userinfo:{},
				allnum:{},
				tuilist:[],
				user_ids:[],
				kefuid:'',
				tuishow:''
			}
		},
		methods: {
			isVipUser(user) {
				return !!(user && (user.is_vip == 'one' || Number(user.vip_type) > 0))
			},
			openVipFeature(url) {
				if (this.isVipUser(this.userinfo)) {
					this.util.urlTo(url)
					return
				}
				this.showVip = true
			},
			goVip() {
				this.showVip = false
				this.util.urlTo('/pages/user/myvip')
			},
			tuikuan(){
				uni.navigateTo({
					url:'/pages/tuikuan/tuikuan'
				})
			},
			getkefu() {
				this.util.request('index/get_global_config', {
					token: uni.getStorageSync('user').token
				}).then(res => {
					this.kefuid = res.set_customer_service
				})
			},
			allone(){
				const userIds = (this.user_ids || []).filter(Boolean)
				if(!userIds.length){
					this.show1=false
					this.util.showToast('暂无可搭讪用户')
					return
				}
				this.util.request('user/write_random', {
					token: uni.getStorageSync('user').token,
					user_ids:userIds.join(',')
				},'POST').then(res => {
					this.show1=false
					this.util.showToast(res.msg)
				})
			},
			pubuser() {
				this.util.request('user/random_user', {
					token: uni.getStorageSync('user').token
				}).then(res => {
					this.tuilist = res
					this.user_ids=[]
					res.map(i=>{
						this.user_ids.push(i.user_id)
					})
					
				})
			},
            myuser(){
				this.util.request('user/user_info',{
					token: uni.getStorageSync('user').token
				}).then(res=>{
					this.userinfo=res
				})
				this.util.request('user/user_base',{
					token: uni.getStorageSync('user').token
				}).then(res=>{
					this.allnum=res
				})
			},
			joop(e){
				if(e==0){
					this.util.urlTo('/pages/user/editziliao')
				}else if(e==1){
					this.util.urlTo('/pages/perfect/perfect?auth=1')
				}else if(e==2){
					this.util.urlTo('/pages/user/giftshop')
				}else if(e==3){
					this.util.urlTo('/pages/user/myphoto')
				}else if(e==4){
					this.show1=true
				}else if(e==5){
					this.util.urlTo('/pages/chatNew/chatpage?id=' + encodeURIComponent(this.kefuid))
				}else if(e==6){
					this.util.urlTo('/pages/user/language')
				}else{
					this.util.urlTo('/pages/user/set')
				}
			}
		},
		onShow() {
			this.tuishow=uni.getStorageSync('languageType') ? uni.getStorageSync('languageType') : 0
			this.getkefu()
			this.list=[this.allText.我的页.我的资料, this.allText.我的页.认证中心, this.allText.我的页.礼物商城, this.allText.我的页.个人相册, this.allText.我的页.一键搭讪, this.allText.我的页.联系客服, this.allText.我的页.语言, this.allText.我的页.设置]
												const tabbarText = this.allText.tabbar || {}
						uni.setTabBarItem({
							index: 1,
							text: tabbarText['\u53d1\u73b0'] || '\u53d1\u73b0'
						})
						uni.setTabBarItem({
							index: 2,
							text: tabbarText['\u52a8\u6001'] || '\u52a8\u6001'
						})
						uni.setTabBarItem({
							index: 3,
							text: tabbarText['\u6d88\u606f'] || '\u6d88\u606f'
						})
						uni.setTabBarItem({
							index: 4,
							text: tabbarText['\u6211\u7684'] || '\u6211\u7684'
						})
						this.myuser()
			this.pubuser()
		}
	}
</script>

<style>
	page {
		height: 100vh;
		background: linear-gradient(90deg, #CBE4FF 52%, #F6DFFF 100%);
	}

	.user-profile-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: calc(var(--status-bar-height, 0px) + 68rpx) 24rpx 0 26rpx;
	}

	.btn {
		/* width: 118rpx; */
		padding: 0 10rpx;
		height: 40rpx;
		background: #FFFFFF;
		border-radius: 6rpx;
		text-align: center;
		line-height: 40rpx;
		font-size: 24rpx;
		color: #5A7EF6;
		font-weight: bold;
	}

	.t-btn {
		width: 160rpx;
		height: 58rpx;
		background: linear-gradient(0deg, #99B8FF, #5186FF);
		border-radius: 29rpx;
		text-align: center;
		line-height: 58rpx;
		font-size: 28rpx;
		color: #fff;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.vip-popup-title {
		padding: 74rpx 32rpx 0;
		font-size: 30rpx;
		font-weight: bold;
		text-align: center;
	}

	.vip-popup-button {
		margin: 48rpx auto 0;
		width: 300rpx;
		height: 70rpx;
		background: #5A7EF6;
		border-radius: 35rpx;
		color: #FFFFFF;
		font-size: 28rpx;
		line-height: 70rpx;
		text-align: center;
	}

	.vip-popup-button-active {
		opacity: 0.86;
	}

	.btns {
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
