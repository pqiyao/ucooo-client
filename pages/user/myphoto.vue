<template>
	<view>
		<u-navbar :title="allText.我的页.我的相册" :background="background" title-color="#333333" back-icon-color="#333333">
			<view class="" slot="right" style="font-size: 26rpx;padding-right: 23rpx;">
				<text v-if="!editshow" @tap="editshow=!editshow">{{allText.我的页.编辑}}</text>
				<!-- <image src="/static/user/del.png" mode="" style="width: 30rpx;height: 30rpx;" v-if="editshow">
				</image> -->
				<text @tap="rSelect=[],editshow=!editshow" v-if="editshow">{{allText.我的页.取消}}</text>
			</view>
		</u-navbar>
		<view class="" style="display: flex;align-items: center;flex-wrap: wrap;">
			<view class="" style="width: 33.3%;" v-for="(i,k) in photolist" :key="k" @tap="look(i.id,i)">
				<view class=""
					style="width: 218rpx;height: 284rpx;border-radius: 16rpx;position: relative;margin: 25rpx auto;">
					<image :src="i.image" mode="aspectFill" style="width: 218rpx;height: 284rpx;border-radius: 16rpx;"
						v-if="i.file_type==1">
					</image>
					<image :src="i.image+'?x-oss-process=video/snapshot,t_0,f_jpg,w_218,h_284'" mode="aspectFill"
						style="width: 218rpx;height: 284rpx;border-radius: 16rpx;" v-if="i.file_type==2">
					</image>

					<image src="/static/home/bo.png" mode=""
						style="width: 66rpx;height: 66rpx;position: absolute;top: 81rpx;left: 76rpx;z-index: 9999;"
						v-if="i.file_type==2"></image>
					<view class=""
						style="width: 218rpx;height: 68rpx;background: #5A7EF6;text-align: center;line-height: 68rpx;font-size: 26rpx;color: #fff;border-radius: 0 0 16rpx 16rpx;position: absolute;bottom: 0;">
						{{i.file_type==1 ? allText.我的页.普通照片 : allText.我的页.视频}}
					</view>
					<image src="/static/user/dui.png" mode=""
						style="width: 30rpx;height: 30rpx;position: absolute;top: 11rpx;right: 13rpx;"
						v-if="rSelect.indexOf(i.id)!=-1"></image>
				</view>
			</view>
		</view>
		<view class="" style="margin: 54rpx 30rpx;">
			<fui-button background="#5A7EF6" radius="46rpx" @click="shows=true" v-if="!editshow">{{allText.我的页.上传照片视频}}</fui-button>
			<fui-button background="#5A7EF6" radius="46rpx" @click="show=true" v-if="editshow">{{allText.我的页.确认删除}}</fui-button>
		</view>
		<u-modal v-model="show" :content="allText.我的页.您确定要删除该照片吗" :show-cancel-button="true" title="" :confirm-text="allText.我的页.确定" :cancel-text="allText.我的页.取消" @confirm	="confirm"></u-modal>
		<u-action-sheet :list="list" v-model="shows" border-radius="20" @click="click"></u-action-sheet>

		<!-- 播放视频 -->
		<u-mask :show="tus" @click="msk" style="background: #000000;">
			<view class="" style="margin-top: 90upx;margin-left: 30rpx;">
				<u-icon name="arrow-left" color="#ffffff" size="50" @tap="back"></u-icon>
			</view>

			<video @tap="back" :src="src1" v-if="src1!=''" @fullscreenchange="horizontal" :autoplay="true"
				object-fit="cover" style="position: absolute;margin:auto;top:0;bottom:0;right:0;left:0;width: 100%;height: 400rpx;"></video>
		</u-mask>
	</view>
</template>

<script>
	import fuiButton from "@/components/firstui/fui-button/fui-button.vue"
	export default {
		data() {
			return {
				background: {
					backgroundColor: '#fff'
				},
				editshow: false,
				show: false,
				shows: false,
				content: '您确定要删除该照片吗？',
				list: [{
					text: ''
				}, {
					text: ''
				}],
				photolist: [],
				rSelect: [],
				tus: false,
				src1: ''
			}
		},
		components: {
			fuiButton
		},
		onShow() {
			
			this.list=[{
				text: this.allText.我的页.上传视频
			}, {
				text: this.allText.我的页.上传普通照片
			}]
			this.photo_self()
		},
		methods: {
			confirm(){
				this.util.request('user/del_photo',{
					photo_ids:this.rSelect,
					token: uni.getStorageSync('user').token
				},'POST').then(res=>{
					this.util.showToast(res.msg)
					this.photo_self()
				})
			},
			horizontal(e) {
								if (e.detail.direction == 'vertical') {
					this.tus = false
					this.src1 = ''
				}
			
			},
			msk() {
				this.tus = false
				this.src1 = ''
			},
			back() {
				this.src1 = ''
			},
			look(a, b) {
				if (this.editshow) {
					if (this.rSelect.indexOf(a) == -1) {
						this.rSelect.push(a)
					} else {
						this.rSelect.splice(this.rSelect.indexOf(a), 1);
					}
				} else {
					if (b.file_type == 1) {
						this.util.lookImg(b.image)
					} else {
						this.src1 = b.image
						this.tus = true
					}
				}

			},
			photo_self() {
				this.util.request('user/photo_self', {
					token: uni.getStorageSync('user').token
				}).then(res => {
					this.photolist = res
				})
			},
			click(e) {
								if (e == 1) {
					uni.chooseImage({
						count: 9, //默认9
						sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
						success: res => {
							const tempFilePaths = res.tempFilePaths;
							for (let i = 0; i < tempFilePaths.length; i++) {
																uni.uploadFile({
									url: this.util.buildUploadUrl('common/upload'),
									filePath: tempFilePaths[i],
									name: 'file',
									formData: {
										token: uni.getStorageSync('user').token
									},
									success: (uploadFileRes) => {
										let response = {}
										try {
											response = typeof uploadFileRes.data === 'string' ? JSON.parse(uploadFileRes.data) : (uploadFileRes.data || {})
										} catch (e) {}
										const data = response.data || {}
										const url = data.fullurl || data.url
										if(![200, 201, 204].includes(uploadFileRes.statusCode) || String(response.code) !== '1' || !url){
											this.util.showToast(response.msg || '图片上传失败，请重试')
											return
										}
										this.util.request('user/up_photo', {
											file_type: 1,
											type: 1,
											image: url,
											token: uni.getStorageSync('user').token
										}).then(res => {
											this.photo_self()
										})
									},
									fail: () => {
										this.util.showToast('图片上传失败，请重试')
									}
								});
							}
						}
					});
				} else {
					uni.chooseVideo({
						count: 1,
						sourceType: ['camera', 'album'],
						success: res => {
							uni.showLoading({
								title: '上传中'
							})
							uni.uploadFile({
								url: this.util.buildUploadUrl('common/upload'),
								filePath: res.tempFilePath,
								name: 'file',
								formData: {
									token: uni.getStorageSync('user').token
								},
								success: (uploadFileRes) => {
									let response = {}
									try {
										response = typeof uploadFileRes.data === 'string' ? JSON.parse(uploadFileRes.data) : (uploadFileRes.data || {})
									} catch (e) {}
									const data = response.data || {}
									const url = data.fullurl || data.url
									if(![200, 201, 204].includes(uploadFileRes.statusCode) || String(response.code) !== '1' || !url){
										this.util.showToast(response.msg || '视频上传失败，请重试')
										return
									}
									this.util.request('user/up_photo', {
										file_type: 2,
										type: 1,
										image: url,
										token: uni.getStorageSync('user').token
									}).then(res => {
										this.photo_self()
									})
								},
								fail: () => {
									this.util.showToast('视频上传失败，请重试')
								},
								complete: () => {
									uni.hideLoading()
								}
							});
						}
					});
				}
			}
		}
	}
</script>

<style>
	.mask {}
</style>
