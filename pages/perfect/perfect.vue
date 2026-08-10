<template>
	<view>
		<view class="top"></view>
		<!-- <view class="" style="display: flex;align-items: center;justify-content: space-between;margin: 60rpx 27rpx;">
			<view class="" style="text-align: center;">
				<image src="/static/login/ziliao.png" mode="" style="width: 50rpx;height: 50rpx;"></image>
				<view class="" style="font-size: 24rpx;color: #FF5F79;">
					{{allText.登录页.资料完成}}
				</view>
			</view>
			<view class="">
				<view class="" style="width: 270px;font-size: 28rpx;color: #FF5F79;">
					{{value}}%
				</view>
				<fui-slider  height="8" background="#EEEEEE"
					activeColor="#FF5F79" :disabled="true" :width="width" :value="value"></fui-slider>

			</view>
		</view> -->
		<!-- 10% -->
		<view class="" style="margin-top: 40rpx;" v-if="value==10">
			<view class="" style="display: flex;align-items: center;justify-content: center;">
				<view class="yuan"></view>
				<view class="" style="font-size: 48rpx;font-weight: bold;padding-left: 30rpx;padding-right: 30rpx;">
					{{allText.登录页.选择你的性别}}
				</view>
				<view class="yuan"></view>
			</view>
			<!-- 男女切换 -->
			<view class="">
				<view class=""
					style="display: flex;align-items: center;justify-content: space-between;margin: 113rpx 120rpx;">
					<view class="" @tap="gender=1">
						<image src="/static/login/nan.png" mode="" style="width: 223rpx;height: 286rpx;"></image>
						<view :class="gender==1 ? 'btn' : 'btn1'" style="margin-top: 40rpx;">
							<image :src="gender==1 ? '/static/login/xz.png' : '/static/login/wx.png'" mode=""
								style="width: 43rpx;height: 43rpx;"></image>
							<view class="" style="margin-left: 22rpx;">
								{{allText.登录页.男生}}
							</view>
						</view>
					</view>
					<view class="" @tap="gender=2">
						<image src="/static/login/nv.png" mode="" style="width: 223rpx;height: 286rpx;"></image>
						<view :class="gender==2 ? 'btn' : 'btn1'" style="margin-top: 40rpx;">
							<image :src="gender==2 ? '/static/login/xz.png' : '/static/login/wx.png'" mode=""
								style="width: 43rpx;height: 43rpx;"></image>
							<view class="" style="margin-left: 22rpx;">
								{{allText.登录页.女生}}
							</view>
						</view>
					</view>
				</view>
			</view>
			<view class="" style="margin: 54rpx 68rpx 50rpx 68rpx;">
				<fui-button background="#5A7EF6" radius="46rpx" @click="value=20">{{allText.登录页.下一步}}</fui-button>
			</view>
			<!-- <view class="" style="margin: 54rpx 68rpx 50rpx 68rpx;">
				<fui-button background="#5A7EF6" radius="46rpx" @click="value=20">{{allText.登录页.下一步}}</fui-button>
			</view> -->
		</view>
		<!-- 20% -->
		<view class="" v-if="value==20">
			<view class="" style="display: flex;align-items: center;justify-content: space-between;margin: 0 29rpx;">
				<view class="" style="font-size: 30rpx;font-weight: bold;">
					{{allText.登录页.出生年月}}
				</view>
				<view class=""
					style="margin: 0 0 0 31rpx;background: #F5F5F5;border-radius: 10rpx;height: 80rpx;display: flex;align-items: center;justify-content: space-between;width: 75%;"
					@tap="show=true">
					<view class="" style="font-size: 26rpx;color: #666;padding-left: 27rpx;">
						{{birthday=='' ? allText.登录页.请选择出生年月 : birthday}}
					</view>
					<image src="/static/login/right.png" mode=""
						style="width: 13rpx;height: 22rpx;padding-right: 20rpx;"></image>
				</view>
			</view>

			<view class=""
				style="display: flex;align-items: center;justify-content: space-between;margin: 66rpx 29rpx;">
				<view class="" style="font-size: 30rpx;font-weight: bold;">
					{{allText.登录页.身高体重}}
				</view>
				<view class=""
					style="margin: 0 0 0 31rpx;background: #F5F5F5;border-radius: 10rpx;height: 80rpx;display: flex;align-items: center;justify-content: space-between;width: 75%;">
					<view class="" style="font-size: 26rpx;color: #666;padding-left: 27rpx;">
						<text @tap="heightshow=true">{{height=='' ? allText.登录页.身高+'(CM)' : height+'CM'}}</text>
						<text style="padding-left: 25rpx;" @tap="weightshow=true">{{weight=='' ? allText.登录页.体重+'(KG)' : weight+'KG'}} </text>
						
					</view>
					<image src="/static/login/right.png" mode=""
						style="width: 13rpx;height: 22rpx;padding-right: 20rpx;"></image>
				</view>
			</view>

			<view class="">
				<view class="" style="margin: 0 29rpx;">
					<text style="font-size: 30rpx;font-weight: bold;">{{allText.登录页.上传头像}}</text>
					<text style="font-size: 26rpx;color: #666;padding-left: 60rpx;">{{allText.登录页.展现真实的自己你将更受欢迎}}</text>
				</view>
				<view class="" style="margin: 22rpx 22rpx 22rpx 190rpx;">
					<u-upload ref="photoUpload" :action="action" :file-list="fileList" @on-uploaded="onUploaded"
						@on-remove="onUploadRemoved" :max-count="photoUploadMaxCount" name="file" :form-data="formData"></u-upload>
				</view>
			</view>
			<view class="" style="margin: 54rpx 68rpx 50rpx 68rpx;">
				<fui-button background="#5A7EF6" radius="46rpx" @click="next">{{allText.登录页.下一步}}</fui-button>
			</view>
		</view>
		<!-- 40 -->
		<view class="" v-if="value==40">
			<view class="" style="font-size: 30rpx;font-weight: bold;padding: 50rpx 64rpx 25rpx 50rpx;">
				{{allText.登录页.喜欢的人}}
			</view>
			<view class="" style="display: flex;flex-wrap: wrap;align-items: center;">
				<view class="" v-for="(i,k) in label" :key="k">
					<view :class="current==k ? 'lovebtns' : 'lovebtn'" @tap="current=k">
						{{i.code}}
					</view>
				</view>
			</view>


			<view class="" style="font-size: 30rpx;font-weight: bold;padding: 50rpx 64rpx 25rpx 50rpx;">
				{{allText.登录页.期待的关系}}
			</view>
			<view class="" style="display: flex;flex-wrap: wrap;align-items: center;">
				<view class=""  v-for="(i,k) in relation" :key="k">
					<view :class="relations.indexOf(i.id)!=-1 ? 'lovebtns' : 'lovebtn'" @tap="tapInfo(i.id)">
						{{i.code}}
					</view>
				</view>
			</view>
			<view class="" style="margin: 54rpx 68rpx 50rpx 68rpx;">
				<fui-button background="#5A7EF6" radius="46rpx" @click="nexts">{{allText.登录页.下一步}}</fui-button>
			</view>
		</view>
		<!-- 50 -->
		<view class="" v-if="value==60">
			<view class="" style="font-size: 30rpx;font-weight: bold;padding: 50rpx 64rpx 25rpx 50rpx;">
				{{allText.登录页.我的职业}}
			</view>
			<view class="" style="display: flex;flex-wrap: wrap;align-items: center;">
				<view class=""  v-for="(i,k) in occupation" :key="k">
					<view :class="current1==k ? 'lovebtns' : 'lovebtn'" @tap="current1=k">
						{{i.code}}
					</view>
				</view>
			</view>


			<view class="" style="font-size: 30rpx;font-weight: bold;padding: 50rpx 64rpx 25rpx 50rpx;">
				{{allText.登录页.我的形容词}}
			</view>
			<view class="" style="display: flex;flex-wrap: wrap;align-items: center;">
				<view class="" v-for="(i,k) in characters" :key="k">
					<view :class="labels.indexOf(i.id)!=-1 ? 'lovebtns' : 'lovebtn'" @tap="tapInfos(i.id)">
						{{i.code}}
					</view>
				</view>
			</view>
			<view class="" style="margin: 54rpx 68rpx 50rpx 68rpx;">
				<fui-button background="#5A7EF6" radius="46rpx" @click="xingnext">{{allText.登录页.下一步}}</fui-button>
			</view>
		</view>
		<!-- 90 -->
		<view class="about-step" v-if="value==90">
			<view class="" style="font-size: 30rpx;font-weight: bold;padding: 50rpx 64rpx 25rpx 50rpx;">
				{{allText.登录页.关于我}}
			</view>
			<view class="texttarer">
				<textarea class="about-textarea" :placeholder="allText.登录页.介绍一下自己吧"
					v-model="content" maxlength="500" confirm-type="done" :adjust-position="true" cursor-spacing="24"
					@input="onAboutInput" @blur="onAboutInput" @confirm="textnext"></textarea>
			</view>
			<view class="about-next-wrap">
				<view class="about-next-button" hover-class="about-next-button-active" @tap.stop="textnext">
					<text class="about-next-text">{{allText.登录页.下一步}}</text>
				</view>
			</view>
		</view>

		<view class="" v-if="value==100">
			<view class="" style="display: flex;align-items: center;justify-content: space-between;margin: 0 29rpx;">
				<view class="" style="font-size: 30rpx;font-weight: bold;">
					{{allText.登录页.国家}}
				</view>
				<view class=""
					style="margin: 0 0 0 31rpx;background: #F5F5F5;border-radius: 10rpx;height: 80rpx;display: flex;align-items: center;justify-content: space-between;width: 70%;" @tap="cityshow=true">
					<view class="" style="font-size: 26rpx;color: #666;padding-left: 27rpx;">
						{{city=='' ? allText.登录页.请选择国家 : city}} 
					</view>
					<image src="/static/login/right.png" mode=""
						style="width: 13rpx;height: 22rpx;padding-right: 20rpx;"></image>
				</view>
			</view>
			<view class="" style="margin: 54rpx 68rpx 50rpx 68rpx;">
				<fui-button background="#5A7EF6" radius="46rpx" @click="countryNext">{{submitting ? '提交中...' : (needFaceAuth && !authVideo ? '下一步' : allText.首页.提交)}}</fui-button>
			</view>
		</view>

		<view class="auth-page" v-if="value==110 && needFaceAuth">
			<view class="auth-hero">
				<view class="auth-kicker">真人审核</view>
				<view class="auth-heading">完成视频认证</view>
				<view class="auth-copy">请面对镜头录制 3-5 秒正脸视频，确认清晰后再提交后台人工审核。</view>
			</view>
			<view class="auth-card">
				<view class="auth-stepbar">
					<view class="auth-step is-active">录制</view>
					<view :class="videoTempPath || authVideo ? 'auth-step is-active' : 'auth-step'">确认</view>
					<view :class="authVideo ? 'auth-step is-active' : 'auth-step'">提交</view>
				</view>
				<view class="auth-preview" @tap="!h5Recording && !h5CameraReady && !videoTempPath && !authVideo && recordAuthVideo()">
					<video v-if="h5CameraReady || h5Recording" id="h5-camera-video" ref="h5CameraVideo" class="auth-video" autoplay muted playsinline webkit-playsinline></video>
					<video v-else-if="videoTempPath || authVideo" :src="videoTempPath || authVideo" class="auth-video" controls></video>
					<view v-else class="auth-empty">
						<view class="auth-empty-title">准备开始录制</view>
						<view class="auth-empty-text">点击下方按钮调用摄像头</view>
					</view>
					<view class="auth-recording-badge" v-if="h5Recording">录制中 {{h5RecordSeconds}}s</view>
					<view class="auth-done-badge" v-if="authVideo">已确认</view>
				</view>
				<view class="auth-status">
					<view class="auth-status-title" v-if="authVideo">视频已确认</view>
					<view class="auth-status-title" v-else-if="h5Recording">保持正脸面对镜头</view>
					<view class="auth-status-title" v-else-if="videoTempPath">请确认视频是否清晰</view>
					<view class="auth-status-title" v-else>请先录制认证视频</view>
					<view class="auth-status-desc" v-if="authVideo">提交后账号会进入后台审核，通过后即可正常登录。</view>
					<view class="auth-status-desc" v-else-if="h5Recording">至少录制 3 秒，系统会在 5 秒自动停止。</view>
					<view class="auth-status-desc" v-else-if="videoTempPath">不满意可以重新录制，满意后点击确认使用。</view>
					<view class="auth-status-desc" v-else>请确保光线清楚、露脸、无遮挡，视频仅用于真人审核。</view>
				</view>
				<view class="auth-checks">
					<view class="auth-check">光线清楚</view>
					<view class="auth-check">正脸入镜</view>
					<view class="auth-check">无遮挡</view>
				</view>
				<view class="auth-actions">
					<view class="auth-secondary" @tap="h5Recording ? null : recordAuthVideo()">{{h5Recording ? '录制中' : (videoTempPath || authVideo ? '重新录制' : '开始录制')}}</view>
					<view class="auth-primary" v-if="h5Recording" @tap="stopH5Recording(true)">{{h5RecordSeconds < 3 ? '至少录制3秒' : '停止录制'}}</view>
					<view class="auth-primary" v-else-if="videoTempPath && !authVideo" @tap="confirmAuthVideo">{{videoUploading ? '上传中...' : '确认使用'}}</view>
					<view class="auth-primary" v-else @tap="submitAuthFlow">{{submitting ? '提交中...' : (authOnly ? '重新提交审核' : '提交审核')}}</view>
				</view>
			</view>
		</view>
 
		<u-picker v-model="show" mode="time" @confirm="confirm"></u-picker>
		<u-picker mode="selector" v-model="heightshow"  :default-selector="[65]" :range="heightlist" @confirm="confirmheight"></u-picker>
		<u-picker mode="selector" v-model="weightshow"  :default-selector="[20]" :range="weightlist" @confirm="confirmweight"></u-picker>
		<u-picker mode="selector" v-model="cityshow"  :default-selector="[0]" :range="citylist" @confirm="confirmcity" range-key="name"></u-picker>
	</view>
</template> 

<script>
	import fuiSlider from "@/components/firstui/fui-slider/fui-slider.vue"
	import fuiButton from "@/components/firstui/fui-button/fui-button.vue"
	export default {
		data() {
			return {
				value: 10, 
				width: 270,
				gender: 1,
				action: this.util.buildUploadUrl('common/upload'),
				fileList: [],
				formData: {
					token: uni.getStorageSync('user').token
				},
				imgbox: [],
				occupation:[],//我的职业数组
				characters:[],//我的形容词数组
				relation:[],//期待的关系数组
				label:[],//喜欢的人数组
				characterss:'',//喜欢的ta
				relations:[],//期待的关系传参
				occupations:'',//我的职业
				labels:[],//自我标签
				rSelect: [],
				current: 0,
				current1: 0,
				content: '',
				show: false,
				heightshow:false,
				weightshow:false,
				birthday: '',
				height:'',
				weight:'',
				cityshow:false,
				citylist:[],
				city:'',
				city_id:'',
				videoTempPath: '',
				videoFile: null,
				authVideo: '',
				videoUploading: false,
				authOnly: false,
				femaleFaceAuthEnabled: true,
				maleFaceAuthEnabled: false,
				authConfigLoaded: false,
				registerPhotoMinCount: 3,
				submitting: false,
				h5CameraStream: null,
				h5Recorder: null,
				h5RecordChunks: [],
				h5Recording: false,
				h5CameraReady: false,
				h5RecordTimer: null,
				h5RecordSeconds: 0,
				heightlist:  [100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197, 198, 199, 200],
				weightlist: [30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150]
			}
		},
		onLoad(options) {
			this.loadFaceAuthConfig(options)
			if (options && options.auth == 1) {
				this.authOnly = true
				const user = uni.getStorageSync('user') || {}
				this.gender = user.gender || this.gender || 2
				this.value = 100
			}
		},
		onShow() {
			this.getteg()
		},
		onUnload() {
			this.cleanupH5Recorder()
		},
		beforeDestroy() {
			this.cleanupH5Recorder()
		},
		components: {
			fuiSlider,
			fuiButton
		},
		computed: {
			needFaceAuth() {
				return this.authOnly || (this.gender == 2 && this.femaleFaceAuthEnabled) || (this.gender == 1 && this.maleFaceAuthEnabled)
			},
			photoUploadMaxCount() {
				const minCount = Number(this.registerPhotoMinCount) || 3
				return Math.max(minCount, 9)
			}
		},
		methods: {
			beginSubmission(){
				if(this.submitting){
					return false
				}
				this.submitting = true
				uni.showLoading({
					title: '提交中',
					mask: true
				})
				return true
			},
			endSubmission(){
				this.submitting = false
				uni.hideLoading()
			},
			handleSubmissionError(error){
				this.endSubmission()
				if(!error || !error.msg){
					this.util.showToast('提交失败，请稍后重试')
				}
			},
			loadFaceAuthConfig(options = {}){
				this.util.request('index/female_face_auth_config',{}).then(res=>{
					this.applyFaceAuthConfig(res, options)
				})
			},
			applyFaceAuthConfig(res, options = {}){
				const femaleValue = res && res.female_face_auth_enabled !== undefined ? res.female_face_auth_enabled : '1'
				const maleValue = res && res.male_face_auth_enabled !== undefined ? res.male_face_auth_enabled : '0'
				this.femaleFaceAuthEnabled = String(femaleValue) !== '0'
				this.maleFaceAuthEnabled = String(maleValue) !== '0'
				const photoMinCount = parseInt(res && res.register_photo_min_count, 10)
				this.registerPhotoMinCount = photoMinCount > 0 ? photoMinCount : 3
				this.authConfigLoaded = true
				if(this.needFaceAuth){
					if(this.authOnly || (options && options.auth == 1)){
						this.value = 110
					}
					return
				}
				if(!this.needFaceAuth){
					this.authVideo = ''
					this.videoTempPath = ''
					if(this.value == 110){
						if(this.authOnly || (options && options.auth == 1)){
							this.finishAuthWithoutVideo()
						}else{
							this.value = 100
						}
					}
				}
			},
			ensureFaceAuthConfigLoaded(){
				return new Promise(resolve => {
					if(this.authConfigLoaded){
						resolve()
						return
					}
					this.util.request('index/female_face_auth_config',{}).then(res=>{
						this.applyFaceAuthConfig(res)
						resolve()
					}).catch(()=>{
						resolve()
					})
				})
			},
			async finishAuthWithoutVideo(){
				if(!this.beginSubmission()){
					return
				}
				const user = uni.getStorageSync('user') || {}
				this.util.request('index/profile',{
					gender: this.gender || user.gender || 2,
					need_edit: 1,
					token: user.token
				},'POST').then(res=>{
					this.syncLoginUser(res)
					this.endSubmission()
					this.util.showToast('真人认证已关闭，已为你放行')
					this.$store.dispatch('imConnect')
					setTimeout(()=>{
						uni.reLaunch({
							url: "/pages/index/index"
						})
					},500)
				}).catch(error=>{
					this.handleSubmissionError(error)
				})
			},
			async countryNext(){
				if(this.submitting){
					return
				}
				await this.ensureFaceAuthConfigLoaded()
				if(this.needFaceAuth && !this.authVideo){
					this.value=110
					return
				}
				this.sub()
			},
			recordAuthVideo(){
				if(this.videoUploading){
					return
				}
				this.cleanupH5Recorder()
				if(this.isBrowserH5()){
					if(this.isH5CameraSupported()){
						this.startH5Recording()
					}else{
						this.util.showToast('当前浏览器不支持摄像头录制，请使用最新版 Chrome 或 Edge')
					}
					return
				}
				uni.chooseVideo({
					count: 1,
					sourceType: ['camera'],
					maxDuration: 8,
					camera: 'front',
					success: res => {
						this.videoTempPath = res.tempFilePath
						this.videoFile = null
						this.authVideo = ''
					},
					fail: () => {
						this.util.showToast('未选择认证视频')
					}
				})
			},
			isBrowserH5(){
				return typeof window !== 'undefined'
					&& typeof document !== 'undefined'
					&& !(window.plus && window.plus.camera)
			},
			isH5CameraSupported(){
				return typeof window !== 'undefined'
					&& typeof navigator !== 'undefined'
					&& navigator.mediaDevices
					&& typeof navigator.mediaDevices.getUserMedia === 'function'
					&& typeof window.MediaRecorder === 'function'
					&& !(window.plus && window.plus.camera)
			},
			getSupportedVideoMime(){
				if(typeof window === 'undefined' || typeof window.MediaRecorder === 'undefined'){
					return ''
				}
				const types = [
					'video/webm;codecs=vp9',
					'video/webm;codecs=vp8',
					'video/webm'
				]
				return types.find(type => window.MediaRecorder.isTypeSupported(type)) || ''
			},
			getH5CameraVideoElement(){
				const videoRef = this.$refs.h5CameraVideo
				const refEl = videoRef && (videoRef.$el || videoRef)
				if(refEl && refEl.tagName && refEl.tagName.toLowerCase() === 'video'){
					return refEl
				}
				if(refEl && refEl.querySelector){
					const innerVideo = refEl.querySelector('video')
					if(innerVideo){
						return innerVideo
					}
				}
				if(typeof document !== 'undefined'){
					const el = document.getElementById('h5-camera-video')
					if(el && el.tagName && el.tagName.toLowerCase() === 'video'){
						return el
					}
					if(el && el.querySelector){
						return el.querySelector('video')
					}
					return document.querySelector('#h5-camera-video video')
				}
				return null
			},
			async startH5Recording(){
				try {
					this.videoTempPath = ''
					this.videoFile = null
					this.authVideo = ''
					this.h5RecordChunks = []
					const stream = await navigator.mediaDevices.getUserMedia({
						video: {
							facingMode: 'user',
							width: { ideal: 720 },
							height: { ideal: 960 }
						},
						audio: false
					})
					this.h5CameraStream = stream
					this.h5CameraReady = true
					await this.$nextTick()
					const videoEl = this.getH5CameraVideoElement()
					if(videoEl){
						videoEl.srcObject = stream
						videoEl.muted = true
						videoEl.setAttribute('playsinline', true)
						videoEl.setAttribute('webkit-playsinline', true)
						const playPromise = videoEl.play && videoEl.play()
						if(playPromise && playPromise.catch){
							playPromise.catch(() => {})
						}
					}else{
						throw new Error('camera video element not found')
					}
					const mimeType = this.getSupportedVideoMime()
					const options = mimeType ? { mimeType } : undefined
					const recorder = new MediaRecorder(stream, options)
					this.h5Recorder = recorder
					recorder.ondataavailable = event => {
						if(event.data && event.data.size > 0){
							this.h5RecordChunks.push(event.data)
						}
					}
					recorder.onstop = () => {
						const type = mimeType || 'video/webm'
						const blob = new Blob(this.h5RecordChunks, { type })
						const fileName = 'auth-' + Date.now() + '.webm'
						this.videoFile = new File([blob], fileName, { type })
						this.videoTempPath = URL.createObjectURL(blob)
						this.h5Recording = false
						this.h5CameraReady = false
						this.stopH5Stream()
					}
					recorder.start()
					this.h5Recording = true
					this.h5RecordSeconds = 0
					this.h5RecordTimer = setInterval(() => {
						this.h5RecordSeconds += 1
						if(this.h5RecordSeconds >= 5){
							this.stopH5Recording(false)
						}
					}, 1000)
				} catch (e) {
					this.cleanupH5Recorder()
					this.util.showToast('无法调用摄像头，请检查浏览器权限')
				}
			},
			stopH5Recording(manual){
				if(!this.h5Recording || !this.h5Recorder){
					return
				}
				if(manual && this.h5RecordSeconds < 3){
					this.util.showToast('请至少录制 3 秒')
					return
				}
				if(this.h5RecordTimer){
					clearInterval(this.h5RecordTimer)
					this.h5RecordTimer = null
				}
				if(this.h5Recorder.state !== 'inactive'){
					this.h5Recorder.stop()
				}
			},
			stopH5Stream(){
				if(this.h5RecordTimer){
					clearInterval(this.h5RecordTimer)
					this.h5RecordTimer = null
				}
				if(this.h5CameraStream){
					this.h5CameraStream.getTracks().forEach(track => track.stop())
					this.h5CameraStream = null
				}
				const videoEl = this.getH5CameraVideoElement()
				if(videoEl){
					videoEl.srcObject = null
				}
				this.h5CameraReady = false
			},
			cleanupH5Recorder(){
				if(this.h5Recorder && this.h5Recorder.state !== 'inactive'){
					try {
						this.h5Recorder.stop()
					} catch (e) {}
				}
				this.h5Recorder = null
				this.h5Recording = false
				this.stopH5Stream()
			},
			confirmAuthVideo(){
				if(!this.videoTempPath){
					this.util.showToast('请先录制认证视频')
					return
				}
				if(this.videoUploading){
					return
				}
				this.videoUploading = true
				uni.showLoading({
					title: '上传中'
				})
				if(this.videoFile){
					this.uploadAuthVideoFile(this.videoFile)
					return
				}
				uni.uploadFile({
					url: this.util.buildUploadUrl('common/upload'),
					filePath: this.videoTempPath,
					name: 'file',
					formData: {
						token: uni.getStorageSync('user').token
					},
					success: uploadFileRes => {
						let data = {}
						try {
							data = JSON.parse(uploadFileRes.data)
						} catch (e) {
							data = {}
						}
						const uploadedUrl = data.data && (data.data.fullurl || data.data.url)
						if(data.code == 1 && uploadedUrl){
							this.authVideo = uploadedUrl
							this.util.showToast('视频已确认')
						}else{
							this.util.showToast(data.msg || '视频上传失败')
						}
					},
					fail: () => {
						this.util.showToast('视频上传失败')
					},
					complete: () => {
						this.videoUploading = false
						uni.hideLoading()
					}
				})
			},
			uploadAuthVideoFile(file){
				const formData = new FormData()
				formData.append('token', uni.getStorageSync('user').token)
				formData.append('file', file, file.name || ('auth-' + Date.now() + '.webm'))
				const xhr = new XMLHttpRequest()
				xhr.open('POST', this.util.buildUploadUrl('common/upload'))
				xhr.onload = () => {
					let data = {}
					try {
						data = JSON.parse(xhr.responseText)
					} catch (e) {
						data = {}
					}
					const uploadedUrl = data.data && (data.data.fullurl || data.data.url)
					if(xhr.status >= 200 && xhr.status < 300 && data.code == 1 && uploadedUrl){
						this.authVideo = uploadedUrl
						this.util.showToast('视频已确认')
					}else{
						this.util.showToast(data.msg || '视频上传失败')
					}
				}
				xhr.onerror = () => {
					this.util.showToast('视频上传失败')
				}
				xhr.onloadend = () => {
					this.videoUploading = false
					uni.hideLoading()
				}
				xhr.send(formData)
			},
			submitAuthFlow(){
				if(!this.authVideo){
					this.util.showToast('请先确认认证视频')
					return
				}
				if(this.authOnly){
					this.resubmitAuth()
				}else{
					this.sub()
				}
			},
			resubmitAuth(){
				if(!this.beginSubmission()){
					return
				}
				const user = uni.getStorageSync('user') || {}
				this.util.request('index/profile',{
					gender: this.gender || user.gender || 2,
					auth_video: this.authVideo,
					token: user.token
				},'POST').then(res=>{
					this.endSubmission()
					this.handlePendingAuth(res)
				}).catch(error=>{
					this.handleSubmissionError(error)
				})
			},
			handlePendingAuth(res){
				uni.hideLoading()
				uni.removeStorageSync('user')
				uni.removeStorageSync('token')
				this.$store.state.user = {}
				this.$store.state.token = ''
				this.util.showToast((res && res.msg) || '真人认证已提交，请等待审核')
				setTimeout(()=>{
					uni.reLaunch({
						url: "/pages/login/login"
					})
				},800)
			},
			syncLoginUser(res){
				const data = res && res.data ? res.data : res
				const userinfo = data && data.userinfo ? data.userinfo : null
				if(!userinfo || !userinfo.token){
					return
				}
				uni.setStorageSync('user', userinfo)
				this.$store.commit('setuser', userinfo)
				this.$store.commit('settoken', userinfo.token)
			},
			sub(){
				// if(this.city==''){
				// 	this.util.showToast(this.allText.登录页.请选择国家)
				// 	return false
				// }
				if(this.needFaceAuth && !this.authVideo){
					this.util.showToast('请先完成真人认证视频')
					this.value=110
					return false
				}
				const selectedLabel = this.label && this.label[this.current]
				const selectedOccupation = this.occupation && this.occupation[this.current1]
				if (!selectedLabel || !selectedOccupation) {
					this.util.showToast('资料选项未加载，请稍后重试')
					return false
				}
				if(!this.beginSubmission()){
					return false
				}
				this.util.request('index/profile',{
					need_edit:1,
					country:this.city,//城市
					bio:this.content,//简介
					gender:this.gender,//性别 1=男,2=女
					birthday:this.birthday,//生日
					height:this.height,//身高
					weight:this.weight,//体重
					avatar:this.imgbox.join(','),//头像
					auth_video:this.authVideo,
					characters:selectedLabel.id, //喜欢的人
					relation:this.relations,//期待的关系
					occupation:selectedOccupation.id,//职业
					label:this.labels,//我的形容词
					token: uni.getStorageSync('user').token 
				},'POST').then(res=>{
					this.endSubmission()
					if(res.code==4003){
						this.handlePendingAuth(res)
						
					}else{
						this.syncLoginUser(res)
						this.$store.dispatch('imConnect')
						setTimeout(()=>{
							uni.reLaunch({
								url: "/pages/index/index"
							})
						},500)
					}
				}).catch(error=>{
					this.handleSubmissionError(error)
				})
			},
			confirmcity(e){
				let num = e[0]
				this.city=this.citylist[num].name
				this.city_id=this.citylist[num].id
			},
			onAboutInput(event){
				if(event && event.detail && typeof event.detail.value === 'string'){
					this.content = event.detail.value
				}
			},
			textnext(event){
				const eventValue = event && event.detail && typeof event.detail.value === 'string'
					? event.detail.value
					: this.content
				const content = String(eventValue || '').trim()
				if(!content){
					this.util.showToast(this.allText.登录页.请填写我的介绍)
					return false
				}
				this.content = content
				uni.hideKeyboard()
				this.value=100
			},
			xingnext(){
				if(this.labels==''){
					this.util.showToast(this.allText.登录页.请选择我的形容词)
					return false
				}
				this.value=90
			},
			nexts(){
				if(this.relations==''){
					this.util.showToast(this.allText.登录页.请选择期待的关系)
					return false
				}
				this.value=60
			},
			getteg(){
				this.util.request('index/get_select',{}).then(res=>{
										res = res || {}
					this.characters=res.characters || []
					this.label=res.label || []
					this.occupation=res.occupation || []
					this.relation=res.relation || []
				})
				this.util.request('index/countryList',{}).then(res=>{
										this.citylist=(res && res.list) || []
				})
			},
			next(){
				if(this.birthday==''){
					this.util.showToast(this.allText.登录页.请选择出生日期)
					return false
				}
				if(this.height==''){
					this.util.showToast(this.allText.登录页.请选择身高)
					return false
				}
				if(this.weight==''){
					this.util.showToast(this.allText.登录页.请选择体重)
					return false
				}
				const photoCount = Array.isArray(this.imgbox) ? this.imgbox.length : 0
				if(photoCount < this.registerPhotoMinCount){
					this.util.showToast('请至少上传' + this.registerPhotoMinCount + '张照片')
					return false
				}
				this.value=40
			},
			confirmheight(e){
				let num = e[0]
				this.height=this.heightlist[num]
			},
			confirmweight(e){
				let num = e[0]
				this.weight=this.weightlist[num]
			},
			confirm(e) {
								this.birthday = e.year + '-' + e.month + '-' + e.day
			},
			tapInfo(e) {
				if (this.relations.indexOf(e) == -1) {
					this.relations.push(e)
				} else {
					this.relations.splice(this.relations.indexOf(e), 1);
				}
			},
			
			tapInfos(e) {
				if (this.labels.indexOf(e) == -1) {
					this.labels.push(e)
				} else {
					this.labels.splice(this.labels.indexOf(e), 1);
				}
			},
			onUploaded(res) {
				this.syncUploadedPhotos(res, true)
			},
			onUploadRemoved(index, res) {
				this.syncUploadedPhotos(res, false)
			},
			syncUploadedPhotos(res, showError) {
				let imgs = []
				let errorMessage = ''
				;(res || []).forEach(item => {
					const response = item.response || {}
					const data = response.data || {}
					const url = String(response.code) === '1' ? (data.fullurl || data.url) : ''
					if(url){
						imgs.push(url)
						return
					}
					if(!item.error && item.response){
						this.$set(item, 'error', true)
						this.$set(item, 'progress', 0)
						errorMessage = errorMessage || response.msg || '照片上传失败，请重试'
					}
				})
				this.imgbox = [...new Set(imgs)]
				if(showError && errorMessage){
					this.util.showToast(errorMessage)
				}
			},
			onChange() {

			},
			onChange() {

			}
		}
	}
</script>

<style>
	.top {
		width: 100%;
		height: 5rpx;
		background: #FFFFFF;
		box-shadow: 0rpx 5rpx 8rpx 0rpx rgba(51, 51, 51, 0.06);

	}

	.texttarer {
		margin: 0 30rpx;
		background: #F5F5F5;
		border-radius: 20rpx;
		padding: 28rpx;
		box-sizing: border-box;
		overflow: hidden;
	}

	.about-textarea {
		display: block;
		width: 100%;
		height: 320rpx;
		min-height: 320rpx;
		font-size: 28rpx;
		line-height: 42rpx;
		color: #333333;
		background: transparent;
		box-sizing: border-box;
	}

	.about-next-wrap {
		margin: 54rpx 68rpx 50rpx;
	}

	.about-next-button {
		width: 100%;
		height: 96rpx;
		border-radius: 46rpx;
		background: #5A7EF6;
		display: flex;
		align-items: center;
		justify-content: center;
		box-sizing: border-box;
	}

	.about-next-button-active {
		opacity: 0.82;
	}

	.about-next-text {
		font-size: 32rpx;
		line-height: 40rpx;
		color: #FFFFFF;
	}

	.yuan {
		width: 18rpx;
		height: 18rpx;
		background: #FF5F79;
		border-radius: 50%;
	}

	.btn {
		/* width: 223rpx;
		height: 80rpx; */
		padding: 0 15rpx;
		background: #FFFFFF;
		border-radius: 40rpx;
		border: 2rpx solid #5A7EF6;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 36rpx;
	}

	.btn1 {
		/* width: 223rpx;
		height: 80rpx; */
		padding: 0 15rpx;
		background: #FFFFFF;
		border-radius: 40rpx;
		border: 2rpx solid #999999;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 36rpx;
	}

.lovebtn {
		/* width: 180rpx;
		height: 66rpx; */
		padding: 15rpx;
		background: #F5F5F5;
		border-radius: 33rpx;
		text-align: center;
		/* line-height: 66rpx; */
		font-size: 28rpx;
		color: #666;
		margin-left: 15rpx;
        margin-top: 15rpx;
	}

	.lovebtns {
		/* width: 180rpx;
		height: 66rpx; */
		padding: 15rpx;
		background: #5A7EF6;
		border-radius: 33rpx;
		border: 1rpx solid #5A7EF6;
		text-align: center;
		/* line-height: 66rpx; */
		font-size: 28rpx;
		color: #fff;
		margin-left: 15rpx;
		margin-top: 15rpx;
	}

	.auth-page {
		min-height: calc(100vh - 5rpx);
		padding: 42rpx 28rpx 80rpx;
		background: #F5F8FF url(/static/home/homebg.png) no-repeat top center;
		background-size: 100% auto;
		box-sizing: border-box;
	}

	.auth-hero {
		padding: 14rpx 10rpx 34rpx;
	}

	.auth-kicker {
		width: fit-content;
		padding: 10rpx 20rpx;
		border-radius: 999rpx;
		background: rgba(90, 126, 246, 0.12);
		color: #5A7EF6;
		font-size: 24rpx;
		font-weight: bold;
	}

	.auth-heading {
		margin-top: 22rpx;
		font-size: 48rpx;
		font-weight: bold;
		color: #182033;
		line-height: 60rpx;
	}

	.auth-copy {
		margin-top: 14rpx;
		width: 88%;
		font-size: 28rpx;
		line-height: 44rpx;
		color: #596171;
	}

	.auth-card {
		background: #FFFFFF;
		border-radius: 28rpx;
		padding: 28rpx;
		box-shadow: 0 20rpx 52rpx rgba(48, 68, 125, 0.14);
	}

	.auth-stepbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 14rpx;
		margin-bottom: 24rpx;
	}

	.auth-step {
		flex: 1;
		height: 56rpx;
		border-radius: 28rpx;
		background: #F2F5FB;
		color: #8A92A3;
		text-align: center;
		line-height: 56rpx;
		font-size: 25rpx;
		font-weight: bold;
	}

	.auth-step.is-active {
		background: #E8EEFF;
		color: #5A7EF6;
	}

	.auth-preview {
		position: relative;
		width: 100%;
		height: 620rpx;
		border-radius: 24rpx;
		overflow: hidden;
		background: #121722;
		border: 2rpx solid rgba(90, 126, 246, 0.18);
	}

	.auth-video {
		width: 100%;
		height: 100%;
		background: #111;
		object-fit: cover;
	}

	.auth-empty {
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background: #F7F9FF;
	}

	.auth-empty-title {
		font-size: 34rpx;
		font-weight: bold;
		color: #1E2638;
	}

	.auth-empty-text {
		margin-top: 16rpx;
		padding: 16rpx 28rpx;
		border-radius: 999rpx;
		background: #E8EEFF;
		color: #5A7EF6;
		font-size: 26rpx;
	}

	.auth-recording-badge,
	.auth-done-badge {
		position: absolute;
		top: 22rpx;
		left: 22rpx;
		padding: 10rpx 18rpx;
		border-radius: 999rpx;
		font-size: 24rpx;
		font-weight: bold;
		color: #fff;
		background: rgba(255, 95, 121, 0.92);
	}

	.auth-done-badge {
		background: rgba(90, 126, 246, 0.92);
	}

	.auth-status {
		margin-top: 24rpx;
		padding: 24rpx;
		border-radius: 20rpx;
		background: #F7F9FF;
	}

	.auth-status-title {
		font-size: 30rpx;
		font-weight: bold;
		color: #20283B;
	}

	.auth-status-desc {
		margin-top: 10rpx;
		font-size: 26rpx;
		line-height: 40rpx;
		color: #687184;
	}

	.auth-checks {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 14rpx;
		margin-top: 20rpx;
	}

	.auth-check {
		flex: 1;
		height: 58rpx;
		border-radius: 16rpx;
		background: #F1F4FF;
		color: #5A7EF6;
		font-size: 24rpx;
		line-height: 58rpx;
		text-align: center;
	}

	.auth-actions {
		margin-top: 28rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 18rpx;
	}

	.auth-secondary,
	.auth-primary {
		flex: 1;
		height: 92rpx;
		border-radius: 46rpx;
		text-align: center;
		line-height: 92rpx;
		font-size: 30rpx;
		font-weight: bold;
	}

	.auth-secondary {
		background: #EEF3FF;
		color: #5A7EF6;
	}

	.auth-primary {
		background: #5A7EF6;
		color: #fff;
	}
</style>
