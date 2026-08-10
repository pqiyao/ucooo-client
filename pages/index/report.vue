<template>
	<view>
		<view class="" style="display: flex;align-items: center;flex-wrap: wrap;">
			<view class="" style="width: 33.3%;" v-for="(i,k) in report_type_list" :key="k">
				<view  :class="rSelect.indexOf(i)!=-1 ? 'btn1' : 'btn'" style="margin-top: 22rpx;" @tap="tapInfo(i)">
					{{i}}
				</view>
			</view>
		</view>
		<view class="" style="font-size: 28rpx;padding: 78rpx 0 21rpx 43rpx;">
			{{allText.首页.问题描述}}（
			<text style="color: #FF3333;">*</text>
			{{allText.首页.必填}}）
		</view>
		<view class="texttarer">
			<textarea class="report-textarea" :placeholder="allText.首页.请描述您遇到的问题"
				v-model="value" maxlength="500" confirm-type="done" :adjust-position="true" cursor-spacing="24"
				@input="onDescriptionInput" @blur="onDescriptionInput" @confirm="onDescriptionInput"></textarea>
		</view>
		<view class="" style="padding: 45rpx 28rpx;">
			<u-upload :action="action" :file-list="fileList" @on-uploaded="onUploaded" @on-remove="onUploadRemoved"
				max-count="1" name="file" :form-data="formData"></u-upload>
		</view>
		<view class="" style="margin: 54rpx 68rpx 50rpx 68rpx;">
			<fui-button background="#5A7EF6" radius="46rpx" @click="sub">{{allText.首页.提交}}</fui-button>
		</view>
	</view>
</template>

<script>
	import fuiButton from "@/components/firstui/fui-button/fui-button.vue"
	export default {
		data() {
			return {
				value: '',
				action: this.util.buildUploadUrl('common/upload'),
				fileList: [],
				formData: {
					token: uni.getStorageSync('user').token
				},
				imgbox: [],
				id:'',
				report_type_list:[],
				rSelect: [],
			}
		},
		components: {
			fuiButton
		},
		onLoad(op) {
			this.id=op.id
		},
		methods: {
			onDescriptionInput(event){
				if(event && event.detail && typeof event.detail.value === 'string'){
					this.value = event.detail.value
				}
			},
			sub(event){
				const eventValue = event && event.detail && typeof event.detail.value === 'string'
					? event.detail.value
					: this.value
				const content = String(eventValue || '').trim()
				if(!content){
					this.util.showToast('请填写问题描述')
					return false
				}
				this.value = content
				uni.hideKeyboard()
				this.util.request('user/report_user',{
					token: uni.getStorageSync('user').token,
					be_user_id:this.id,
					content:this.value,
					type:this.rSelect,
					images:this.imgbox
				},'POST').then(res=>{
					 this.util.showToast(res.msg)
					 setTimeout(()=>{uni.navigateBack()},1000)
				})
			},
			onUploaded(res) {
				this.syncUploadedImages(res, true)
			},
			onUploadRemoved(index, res) {
				this.syncUploadedImages(res, false)
			},
			syncUploadedImages(res, showError) {
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
						errorMessage = errorMessage || response.msg || '图片上传失败，请重试'
					}
				})
				this.imgbox = [...new Set(imgs)]
				if(showError && errorMessage){
					this.util.showToast(errorMessage)
				}
			},
			tapInfo(e) {
				if (this.rSelect.indexOf(e) == -1) {
					this.rSelect.push(e)
				} else {
					this.rSelect.splice(this.rSelect.indexOf(e), 1);
				}
			},
			getreport() {
				this.util.request('index/report_type_list', {
					token: uni.getStorageSync('user').token
				}).then(res => {
					this.report_type_list=res
				})
			}
		},
		onShow() {
			this.getreport()
		}
	}
</script>

<style>
	.btn {
		width: 202rpx;
		height: 68rpx;
		background: rgba(153, 153, 153, 0.1);
		border-radius: 34rpx;
		text-align: center;
		line-height: 68rpx;
		font-size: 30rpx;
		font-size: 30rpx;
		margin: 0 auto;
	}
	.btn1{
		width: 202rpx;
		height: 68rpx;
		background: #5A7EF6;
		border-radius: 34rpx;
		color: #fff;
		text-align: center;
		line-height: 68rpx;
		font-size: 30rpx;
		font-size: 30rpx;
		margin: 0 auto;
		
	}

	.texttarer {
		margin: 0 28rpx;
		background: #EEEEEE;
		box-shadow: 0rpx 0rpx 111rpx 0rpx rgba(255, 255, 255, 0.08);
		border-radius: 20rpx;
		padding: 28rpx;
		overflow: hidden;
	}

	.report-textarea {
		display: block;
		width: 100%;
		height: 280rpx;
		min-height: 280rpx;
		font-size: 28rpx;
		line-height: 42rpx;
		box-sizing: border-box;
	}
</style>
