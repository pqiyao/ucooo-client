<template>
	<view class="profile-edit-page">
		<u-navbar :title="allText.我的页.编辑" :background="background" title-color="#1F2433" back-icon-color="#1F2433">
			<view class="save-action" slot="right" @tap="save">
				{{allText.我的页.保存}}
			</view>
		</u-navbar>

		<view class="profile-hero">
			<view class="avatar-wrap" @tap="upload">
				<image class="avatar-img" :src="$getimgsrc(avatar)" mode="aspectFill"></image>
				<view class="camera-badge">
					<image src="/static/user/pai.png" mode="aspectFit"></image>
				</view>
			</view>
			<view class="hero-name">{{nickname || allText.我的页.昵称}}</view>
			<view class="hero-meta">
				<text>{{gender==2 ? '女' : '男'}}</text>
				<text v-if="birthday"> · {{birthday}}</text>
				<text v-if="country"> · {{country}}</text>
			</view>
		</view>

		<view class="form-card">
			<view class="section-title">基础资料</view>
			<view class="form-row" @tap="show=true">
				<view class="row-label">{{allText.我的页.昵称}}</view>
				<view class="row-value">
					<text>{{nickname || allText.我的页.昵称}}</text>
					<u-icon name="arrow-right" color="#A4ABBA" size="26"></u-icon>
				</view>
			</view>
			<view class="form-row">
				<view class="row-label">{{allText.我的页.性别}}</view>
				<view class="row-value muted">
					<text>{{gender==2 ? '女' : '男'}}</text>
					<u-icon name="arrow-right" color="#D4D9E4" size="26"></u-icon>
				</view>
			</view>
			<view class="form-row" @tap="timeshow=true">
				<view class="row-label">{{allText.我的页.生日}}</view>
				<view class="row-value">
					<text>{{birthday || allText.我的页.生日}}</text>
					<u-icon name="arrow-right" color="#A4ABBA" size="26"></u-icon>
				</view>
			</view>
			<view class="form-row" @tap="heightshow=true">
				<view class="row-label">{{allText.登录页.身高体重}}</view>
				<view class="row-value">
					<text>{{height&&weight ? height+'cm · '+weight+'kg' : allText.登录页.身高体重}}</text>
					<u-icon name="arrow-right" color="#A4ABBA" size="26"></u-icon>
				</view>
			</view>
			<view class="form-row" @tap="cityshow=true">
				<view class="row-label">{{allText.登录页.国家}}</view>
				<view class="row-value">
					<text>{{country || allText.登录页.国家}}</text>
					<u-icon name="arrow-right" color="#A4ABBA" size="26"></u-icon>
				</view>
			</view>
		</view>

		<view class="form-card">
			<view class="section-title">交友偏好</view>
			<view class="form-row" @tap="util.urlTo('/pages/user/edittag?type=2')">
				<view class="row-label">{{allText.登录页.我的职业}}</view>
				<view class="row-value">
					<text>{{occupation || allText.登录页.我的职业}}</text>
					<u-icon name="arrow-right" color="#A4ABBA" size="26"></u-icon>
				</view>
			</view>
			<view class="form-row" @tap="util.urlTo('/pages/user/edittag?type=1')">
				<view class="row-label">{{allText.登录页.喜欢的人}}</view>
				<view class="row-value">
					<text>{{characters || allText.登录页.喜欢的人}}</text>
					<u-icon name="arrow-right" color="#A4ABBA" size="26"></u-icon>
				</view>
			</view>
			<view class="form-row" @tap="util.urlTo('/pages/user/edittag?type=4')">
				<view class="row-label">{{allText.登录页.期待的关系}}</view>
				<view class="row-value">
					<text>{{relation || allText.登录页.期待的关系}}</text>
					<u-icon name="arrow-right" color="#A4ABBA" size="26"></u-icon>
				</view>
			</view>
			<view class="form-row" @tap="util.urlTo('/pages/user/edittag?type=3')">
				<view class="row-label">{{allText.登录页.我的形容词}}</view>
				<view class="row-value">
					<text>{{label || allText.登录页.我的形容词}}</text>
					<u-icon name="arrow-right" color="#A4ABBA" size="26"></u-icon>
				</view>
			</view>
			<view class="form-row">
				<view class="row-label">{{allText.我的页.我的表白墙}}</view>
				<view class="row-value">
					<text>未设置</text>
					<u-icon name="arrow-right" color="#A4ABBA" size="26"></u-icon>
				</view>
			</view>
		</view>
		
		<view class="gift-card" v-if="gift_list.length">
			<view class="section-title">{{allText.我的页.我的表白墙}}</view>
			<view class="gift-grid">
				<view class="gift-item" v-for="(i,k) in gift_list" :key="k">
					<image :src="i.image" mode="aspectFill"></image>
					<view class="gift-name">{{i.name}}</view>
					<view class="gift-count">
					x{{i.num}}
					</view>
				</view>
			</view>
		</view>

		<view class="bio-card">
			<view class="section-title">{{allText.我的页.个人资料}}</view>
			<textarea class="bio-textarea" :placeholder="allText.我的页.介绍自己吧" v-model="bio" maxlength="500"
				confirm-type="done" :adjust-position="true" cursor-spacing="24"
				@input="onBioInput" @blur="onBioInput" @confirm="onBioInput"></textarea>
			
		</view>
		<u-modal v-model="show" :title="allText.我的页.昵称" :show-cancel-button="true" confirm-color="#333333" cancel-color="#858585"  @cancel="cancel">
			<view class="slot-content" style="margin: 37rpx 60rpx;height: 92rpx;background: #F5F5F5;text-align: center;">
				<input type="text" :placeholder="allText.我的页.昵称" style="height: 92rpx;font-size: 28rpx;" v-model="nickname"/>
			</view>
			
		</u-modal>
		
		<u-picker v-model="timeshow" mode="time" @confirm="confirm"></u-picker>
		<u-picker mode="selector" v-model="heightshow"  :default-selector="[65]" :range="heightlist" @confirm="confirmheight"></u-picker>
		<u-picker mode="selector" v-model="weightshow"  :default-selector="[20]" :range="weightlist" @confirm="confirmweight"></u-picker>
		<u-picker mode="selector" v-model="cityshow"  :default-selector="[0]" :range="citylist" @confirm="confirmcity" range-key="name"></u-picker>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				background: {
					backgroundColor: '#fff'
				},
				bio:'',//简介
				show:false,
				userinfo:{},
				avatar:'',//头像
				nickname:'',//昵称
				birthday:'',//生日
				height:'',//身高
				weight:'',//体重
				country:'',//国家
				country_id:'',//国家id
				characters:'',//喜欢的人
				relation:'',//期待的关系
				occupation:'',//职业
				label:'',//我的形容词
				gender:'',
				timeshow: false,
				heightshow:false,
				weightshow:false,
				cityshow:false,
				citylist:[],
				characters_id:'',  //喜欢的人
				relation_id:'', //期待的关系
				label_id:'', //我的形容词
				occupation_id:'', //我的职业
				heightlist:  [100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197, 198, 199, 200],
				weightlist: [30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150],
				id:'',
				gift_list:[]
			}
		},
		methods: {
			onBioInput(event){
				if(event && event.detail && typeof event.detail.value === 'string'){
					this.bio = event.detail.value
				}
			},
			upload(){
				this.util.addImg().then(data => {
					this.util.uploadFile(data).then(res => {
						this.avatar=res.url
											})
				})
			},
			save(){
				this.bio = String(this.bio || '').trim()
				uni.hideKeyboard()
				this.util.request('index/profile',{
					need_edit:1,
					nickname:this.nickname,
					bio:this.bio,
					avatar:this.avatar,
					birthday:this.birthday?this.birthday:'',
					height:this.height,
					weight:this.weight,
					country:this.country,
					characters:this.characters_id,
					relation:this.relation_id,
					occupation:this.occupation_id,
					label:this.label_id,
					token: uni.getStorageSync('user').token,
					gender:this.gender
				}).then(res=>{
					this.util.showToast('成功！')
					this.myuser()
				})
			},
			getDomainFromURL(url) {
			  // 移除协议（http, https, ftp等）
			  let domain = url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "");
			  // 提取第一个"/"之前的部分
			  domain = domain.split("/")[1];
			  			  return domain;
			},
			confirmheight(e){
				let num = e[0] 
				this.height=this.heightlist[num]
				this.weightshow=true
			},
			confirmweight(e){
				let num = e[0]
				this.weight=this.weightlist[num]
			},
			getteg(){
				this.util.request('index/countryList',{}).then(res=>{
										this.citylist=res.list
				})
			},
			confirm(e){
								this.birthday=e.year+'-'+e.month+'-'+e.day
			},
			confirmcity(e){
				let num = e[0]
				this.country=this.citylist[num].name
				this.country_id=this.citylist[num].id
			},
			cancel(){
				this.util.request('user/user_info',{
					token: uni.getStorageSync('user').token
				}).then(res=>{
					this.nickname=res.nickname
				})
			},
            myuser(){
            	this.util.request('user/user_info',{
            		token: uni.getStorageSync('user').token
            	}).then(res=>{
					this.id=res.user_id
            		this.avatar=res.avatar
					this.nickname=res.nickname
					this.birthday=res.birthday
					this.height=res.height
					this.weight=res.weight
					this.country=res.country
					this.relation=res.relation_arr
					this.characters=res.characters_arr
					this.occupation=res.occupation_arr
					this.label=res.label_arr
					this.bio=res.bio
					this.gender=res.gender
            	})
            },
			gift_count(){
				this.util.request('gift/gift_count',{
					be_send:2,
					token: uni.getStorageSync('user').token,
					uid:uni.getStorageSync('user').id
				}).then(res=>{
					 this.gift_list=res
				})
			}
		},
		onLoad() {
			this.myuser()
			this.getteg()
		},
		onShow() {
			this.gift_count()
		}
	}
</script>

<style>
	page {
		background: #F4F8FE url(/static/home/homebg.png) no-repeat;
		background-size: 100% 100%;
	}

	.profile-edit-page {
		min-height: 100vh;
		padding-bottom: 44rpx;
		background: url(/static/home/homebg.png) no-repeat;
		background-size: 100% 100%;
	}

	.save-action {
		margin-right: 22rpx;
		padding: 12rpx 24rpx;
		border-radius: 999rpx;
		background: #5A7EF6;
		font-size: 26rpx;
		font-weight: 700;
		color: #FFFFFF;
		line-height: 1;
	}

	.profile-hero {
		margin: 28rpx 24rpx 22rpx;
		padding: 36rpx 28rpx 32rpx;
		border-radius: 28rpx;
		background: rgba(255, 255, 255, 0.92);
		box-shadow: 0 18rpx 44rpx rgba(37, 43, 62, 0.08);
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.avatar-wrap {
		width: 156rpx;
		height: 156rpx;
		position: relative;
	}

	.avatar-img {
		width: 156rpx;
		height: 156rpx;
		border-radius: 50%;
		border: 6rpx solid #FFFFFF;
		box-shadow: 0 14rpx 34rpx rgba(37, 43, 62, 0.18);
	}

	.camera-badge {
		position: absolute;
		right: 0;
		bottom: 4rpx;
		width: 48rpx;
		height: 48rpx;
		border-radius: 50%;
		background: #FFFFFF;
		box-shadow: 0 8rpx 20rpx rgba(37, 43, 62, 0.14);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.camera-badge image {
		width: 34rpx;
		height: 34rpx;
	}

	.hero-name {
		max-width: 560rpx;
		margin-top: 22rpx;
		font-size: 38rpx;
		font-weight: 800;
		color: #1F2433;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.hero-meta {
		margin-top: 10rpx;
		font-size: 24rpx;
		color: #7B8497;
	}

	.form-card,
	.gift-card,
	.bio-card {
		margin: 22rpx 24rpx 0;
		padding: 26rpx 28rpx;
		border-radius: 26rpx;
		background: #FFFFFF;
		box-shadow: 0 14rpx 34rpx rgba(37, 43, 62, 0.07);
	}

	.section-title {
		margin-bottom: 10rpx;
		font-size: 28rpx;
		font-weight: 800;
		color: #1F2433;
	}

	.form-row {
		min-height: 88rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		border-bottom: 1rpx solid #EEF1F7;
	}

	.form-row:last-child {
		border-bottom: 0;
	}

	.row-label {
		flex-shrink: 0;
		font-size: 28rpx;
		font-weight: 600;
		color: #2B3040;
	}

	.row-value {
		min-width: 0;
		margin-left: 24rpx;
		display: flex;
		align-items: center;
		color: #7B8497;
		font-size: 26rpx;
	}

	.row-value text {
		max-width: 400rpx;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.row-value .u-icon {
		margin-left: 10rpx;
	}

	.row-value.muted {
		color: #A4ABBA;
	}

	.gift-grid {
		display: flex;
		align-items: flex-start;
		flex-wrap: wrap;
		padding-top: 8rpx;
	}

	.gift-item {
		width: 25%;
		margin-top: 22rpx;
		text-align: center;
		font-size: 23rpx;
		color: #596174;
	}

	.gift-item image {
		width: 72rpx;
		height: 72rpx;
		border-radius: 18rpx;
		box-shadow: 0 8rpx 18rpx rgba(37, 43, 62, 0.08);
	}

	.gift-name {
		margin-top: 8rpx;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.gift-count {
		margin-top: 3rpx;
		color: #9BA3B3;
	}

	.bio-textarea {
		margin-top: 18rpx;
		width: 100%;
		height: 220rpx;
		padding: 22rpx;
		box-sizing: border-box;
		border-radius: 22rpx;
		background: #F6F8FC;
		font-size: 28rpx;
		line-height: 1.5;
		color: #1F2433;
	}
</style>
