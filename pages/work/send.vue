<template>
	<view>
		<view class="texttarer">
			<textarea class="moment-textarea" :placeholder="allText.动态页聊天页.记录这一刻晒给懂你的人" v-model="content"
				maxlength="500" confirm-type="done" :adjust-position="true" cursor-spacing="24"
				@input="onContentInput" @blur="onContentInput" @confirm="onContentInput"></textarea>
			
		</view>
		<view class="" style="padding: 45rpx 28rpx;">

			<view style="margin: 20rpx 0rpx;display: flex;flex-wrap: wrap;">

				<view class="" style="width: 218rpx;height: 218rpx;display: inline-block;margin: 10rpx;border-radius: 10rpx;position: relative;margin: 10rpx;" v-for="(item,index) in imagelist" :key="index" >
					<image :src="$getimgsrc(item)" mode="" style="width: 218rpx;height: 218rpx;display: inline-block;border-radius: 10rpx;"></image>
					<image src="/static/cha.png" mode="" style="width: 36rpx;height: 36rpx;position: absolute;top: -10rpx;right: -10rpx;" @tap="del(index)"></image>
				</view>
				
				<view class="" style="width: 218rpx;height: 218rpx;display: inline-block;margin: 10rpx;border-radius: 10rpx;position: relative;margin: 10rpx;" v-for="(item,index) in videolist" :key="index" >
					<image :src="$getimgsrc(item)+'?x-oss-process=video/snapshot,t_0,f_jpg,w_218,h_218'" mode="" style="width: 218rpx;height: 218rpx;display: inline-block;border-radius: 10rpx;"></image>
					<image src="/static/cha.png" mode="" style="width: 36rpx;height: 36rpx;position: absolute;top: -10rpx;right: -10rpx;" @tap="videolist=[],imgraios=2"></image>
					<image src="/static/home/bo.png" mode="" style="width: 50rpx;height: 50rpx;position: absolute;margin: auto;left: 0;right: 0;top: 0;bottom: 0;"></image>
				</view>
				
				<image src="/static/work/upload.png" mode="" style="width: 218rpx;height: 218rpx;margin: 10rpx;" @tap="typeselect=true" v-if="imgraios==2"></image>
				<image src="/static/work/upload.png" mode="" style="width: 218rpx;height: 218rpx;margin: 10rpx;" @tap="select(0)" v-if="imgraios==0&&imagelist.length!=9"></image>
				<image src="/static/work/upload.png" mode="" style="width: 218rpx;height: 218rpx;margin: 10rpx;" @tap="select(1)" v-if="imgraios==1&&videolist.length!=1"></image>
			</view>
		</view>
		<view class="" style="width: 100%;background: #EEEEEE;font-size: 24rpx;color: #858585;text-align: center;padding: 15rpx 10rpx;">
			{{allText.动态页聊天页.请勿发布色情低俗血腥政治三方联系方式等违规内容}}
		</view>
		<view class="" style="margin: 54rpx 30rpx 50rpx 30rpx;">
			<fui-button background="#5A7EF6" radius="46rpx" :disabled="submitting || uploadingCount > 0" :loading="submitting" @click="send">{{allText.动态页聊天页.发表}}</fui-button>
		</view>
		<u-action-sheet :list="setlist" v-model="show1" @click="see"></u-action-sheet>
		<u-action-sheet :list="list" v-model="typeselect" @click="select"></u-action-sheet>
	</view>
</template>

<script>
	import fuiButton from "@/components/firstui/fui-button/fui-button.vue"
	
	export default {
		data() {
			return {
				value:'',
				show1:false,
				list: [{text: '上传图片',}, {text: '上传视频'}],
				setlist: [{text: '预览',}, {text: '删除'}],
				show:false,
				imagelist: [],
				js:'',
				type: 0,
				typeselect:false,
				content:'',
				img:[],
				source_type:'',
				videolist:[],
				imgraios:2,
				uploadingCount:0,
				uploadFailed:false,
				submitting:false
			}
		},
		components: {
			fuiButton
		},
		methods: {
			onContentInput(event){
				if(event && event.detail && typeof event.detail.value === 'string'){
					this.content = event.detail.value
				}
			},
			del(e){
								this.imagelist.splice(e,1)
				if(this.$u.test.isEmpty(this.imagelist)){
					this.imgraios=2
				}
			},
			
			
			send(event){
				if (this.submitting) return
				if (this.uploadingCount > 0) {
					this.util.showToast('文件正在上传，请稍后发布')
					return
				}
				if (this.uploadFailed) {
					this.util.showToast('有文件上传失败，请重新选择')
					return
				}
				const eventValue = event && event.detail && typeof event.detail.value === 'string'
					? event.detail.value
					: this.content
				const content = String(eventValue || '').trim()
				if(!content && this.imagelist.length === 0 && this.videolist.length === 0){
					this.util.showToast('请输入发布内容')
					return false
				}
				this.content = content
				this.submitting = true
				uni.hideKeyboard()
				if(this.imagelist.length!=0){
					this.img=this.imagelist
				}
				if(this.videolist.length!=0){
					this.img=this.videolist
				}
				this.util.request('dynamic/add_dynamic',{
					content:this.content,
					source_type:this.imgraios==2 ? '' : this.imgraios==0 ? 1 : 2,
					img:this.img,
					token: uni.getStorageSync('user').token
				},'POST').then(res=>{
					this.util.showToast(res.msg)
					setTimeout(()=>{
						uni.navigateBack()
					},1000)
				}).catch(() => {}).then(() => {
					this.submitting = false
				})
			},
			
			select(e){
				
				let that = this;
			
				
				
				if(e == 0){
					this.uploadFailed = false
					uni.chooseImage({
					    count: 9, //默认9
					    sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
					    success:res=> {
					        const tempFilePaths = res.tempFilePaths;
							for(let i = 0 ; i < tempFilePaths.length ; i++){
								that.uploadingCount++
														uni.uploadFile({
								    url: that.util.buildUploadUrl('common/upload'),
				    filePath: tempFilePaths[i],
				    name: 'file',
				    timeout: 30000,
				    header: that.util.getAppRequestHeaders ? that.util.getAppRequestHeaders() : {},
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
											that.uploadFailed = true
											that.util.showToast(response.msg || '图片上传失败，请重试')
											return
										}
								        that.imagelist.push(url)
										that.imgraios=0
								    },
					fail: () => {
						that.uploadFailed = true
						that.util.showToast('图片上传失败，请重试')
				    },
					complete: () => {
						that.uploadingCount = Math.max(0, that.uploadingCount - 1)
				    }
								});
							}
					    }
					});
				}else{
					this.uploadFailed = false
					uni.chooseVideo({
						count: 1,
						sourceType: ['camera', 'album'],
						success: res=> {
							that.uploadingCount++
							uni.showLoading({
								title: '上传中'
							})
							uni.uploadFile({
							    url: that.util.buildUploadUrl('common/upload'),
					    filePath: res.tempFilePath,
					    name: 'file',
					    timeout: 30000,
					    header: that.util.getAppRequestHeaders ? that.util.getAppRequestHeaders() : {},
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
											that.uploadFailed = true
										that.util.showToast(response.msg || '视频上传失败，请重试')
										return
									}
							        that.videolist.push(url)
									that.imgraios=1
							    },
								fail: () => {
								that.uploadFailed = true
									that.util.showToast('视频上传失败，请重试')
								},
							complete: () => {
								uni.hideLoading()
								that.uploadingCount = Math.max(0, that.uploadingCount - 1)
							    }
							});
						}
					});
				}
			},
		}
	}
</script>

<style>
	.texttarer {
		margin: 22rpx;
		background: #fff;
		border-radius: 20rpx;
		padding: 28rpx;
		overflow: hidden;
	}

	.moment-textarea {
		display: block;
		width: 100%;
		height: 200rpx;
		min-height: 200rpx;
		font-size: 28rpx;
		line-height: 42rpx;
		box-sizing: border-box;
	}

</style>
