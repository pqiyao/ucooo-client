<template>
	<view>
		<!-- 40 -->
		<!-- <view class="" v-if="type==1">
			<view class="" style="font-size: 30rpx;font-weight: bold;padding: 50rpx 64rpx 25rpx 50rpx;">
				喜欢的人
			</view>
			<view class="" style="display: flex;flex-wrap: wrap;">
				<view class="" style="width: 33.3%;" v-for="(i,k) in lovepople" :key="k">
					<view :class="current1==k ? 'lovebtns' : 'lovebtn'" @tap="current1=k">
						{{i}}
					</view>
				</view>
			</view>
			
			
			<view class="" style="font-size: 30rpx;font-weight: bold;padding: 50rpx 64rpx 25rpx 50rpx;">
				期待的关系
			</view>
			<view class="" style="display: flex;flex-wrap: wrap;">
				<view class="" style="width: 33.3%;" v-for="(i,k) in lovepople" :key="k">
					<view :class="rSelect.indexOf(i)!=-1 ? 'lovebtns' : 'lovebtn'" @tap="tapInfo(i)">
						{{i}}
					</view>
				</view>
			</view>
		</view>
		
		<view class="" v-if="type==2">
			<view class="" style="font-size: 30rpx;font-weight: bold;padding: 50rpx 64rpx 25rpx 50rpx;">
				我的职业
			</view>
			<view class="" style="display: flex;flex-wrap: wrap;">
				<view class="" style="width: 33.3%;" v-for="(i,k) in lovepople" :key="k">
					<view :class="current1==k ? 'lovebtns' : 'lovebtn'" @tap="current1=k">
						{{i}}
					</view>
				</view>
			</view>
			
			
			<view class="" style="font-size: 30rpx;font-weight: bold;padding: 50rpx 64rpx 25rpx 50rpx;">
				我的形容词
			</view>
			<view class="" style="display: flex;flex-wrap: wrap;">
				<view class="" style="width: 33.3%;" v-for="(i,k) in lovepople" :key="k">
					<view :class="rSelect.indexOf(i)!=-1 ? 'lovebtns' : 'lovebtn'" @tap="tapInfo(i)">
						{{i}}
					</view>
				</view>
			</view>

		</view> -->


		<view class="" v-if="type==1">
			<view class="" style="font-size: 30rpx;font-weight: bold;padding: 50rpx 64rpx 25rpx 50rpx;">
				{{allText.首页.喜欢的人}}
			</view>
			<view class="" style="display: flex;flex-wrap: wrap;align-items: center;">
				<view class="" style="" v-for="(i,k) in label" :key="k">
					<view :class="current==k ? 'lovebtns' : 'lovebtn'" @tap="current=k">
						{{i.code}}
					</view>
				</view>
			</view>


			
		</view>
		
		<view v-if="type==4">
			<view class="" style="font-size: 30rpx;font-weight: bold;padding: 50rpx 64rpx 25rpx 50rpx;">
				{{allText.首页.期待的关系}}
			</view>
			<view class="" style="display: flex;flex-wrap: wrap;align-items: center;">
				<view class=""  v-for="(i,k) in relation" :key="k">
			
					<view :class="relations.indexOf(i.id)!=-1 ? 'lovebtns' : 'lovebtn'" @tap="tapInfo(i.id,i.code)">
						{{i.code}}
					</view>
				</view>
			</view>
		</view>
		<!-- 50 -->
		<view class="" v-if="type==2">
			<view class="" style="font-size: 30rpx;font-weight: bold;padding: 50rpx 64rpx 25rpx 50rpx;">
				{{allText.登录页.我的职业}}
			</view>
			<view class="" style="display: flex;flex-wrap: wrap;align-items: center;">
				<view class="" v-for="(i,k) in occupation" :key="k">
					<view :class="current1==k ? 'lovebtns' : 'lovebtn'" @tap="current1=k">
						{{i.code}}
					</view>
				</view>
			</view>


		</view>
		
		<view class=""  v-if="type==3">
			<view class="" style="font-size: 30rpx;font-weight: bold;padding: 50rpx 64rpx 25rpx 50rpx;">
				{{allText.首页.我的形容词}}
			</view>
			<view class="" style="display: flex;flex-wrap: wrap;align-items: center;">
				<view class=""  v-for="(i,k) in characters" :key="k">
					<view :class="labels.indexOf(i.id)!=-1 ? 'lovebtns' : 'lovebtn'" @tap="tapInfos(i.id,i.code)">
						{{i.code}}
					</view>
				</view>
			</view>
		</view>
		
		
		<view class="" style="margin: 54rpx 68rpx 50rpx 68rpx;">
			<fui-button background="#5A7EF6" radius="46rpx" @click="back">完成</fui-button>
		</view>
	</view>
</template>

<script>
	import fuiButton from "@/components/firstui/fui-button/fui-button.vue"
	export default {
		data() {
			return {
				lovepople: [],
				current1: 0,
				current: 0,
				rSelect: [],
				type: '',
				characters: [],
				label: [],
				occupation: [],
				relation: [],
				relations: [],
				labels: [],
				characterid: '',
				zhiyeid: '',
				xrclist: [], //传上个页面
				qdgxlist: [], //传上个页面
				lovetext:'',//喜欢的人
				zhiyetext:'',//职业
			}
		},
		onLoad(op) {
			this.type = op.type
		},
		components: {
			fuiButton
		},
		methods: {
			back() {
				let pages = getCurrentPages(); //获取所有页面栈实例列表
				let nowPage = pages[pages.length - 1]; //当前页页面实例
				let prevPage = pages[pages.length - 2]; //上一页页面实例
								if (this.type == 1) {
					
					prevPage.$vm.characters = this.label[this.current].code; //给上个页面的变量赋值
					prevPage.$vm.characters_id = this.label[this.current].id; //给上个页面的变量赋值
					
                    
                    uni.navigateBack()
				}else if(this.type==2){
					
					prevPage.$vm.occupation = this.occupation[this.current1].code; //给上个页面的变量赋值
					
					prevPage.$vm.occupation_id = this.occupation[this.current1].id; //给上个页面的变量赋值
					
					uni.navigateBack()
				}else if(this.type==3){
					prevPage.$vm.label = this.xrclist.join(','); //给上个页面的变量赋值
					prevPage.$vm.label_id = this.labels; //给上个页面的变量赋值
					
					uni.navigateBack()
				}else{
					prevPage.$vm.relation = this.qdgxlist.join(','); //给上个页面的变量赋值
					prevPage.$vm.relation_id = this.relations; //给上个页面的变量赋值
										uni.navigateBack()
				}
			},
			tapInfo(e, a) {
								if (this.relations.indexOf(e) == -1) {
					this.relations.push(e)
					this.qdgxlist.push(a)
				} else {
					this.relations.splice(this.relations.indexOf(e), 1);
					this.qdgxlist.splice(this.qdgxlist.indexOf(a), 1);
				}
							},

			tapInfos(e, a) {
								if (this.labels.indexOf(e) == -1) {
					this.labels.push(e)
					this.xrclist.push(a)

				} else {
					this.labels.splice(this.labels.indexOf(e), 1);
					this.xrclist.splice(this.xrclist.indexOf(a), 1);
				}
			},
			async myuser() {
				await this.util.request('user/user_info', {
					token: uni.getStorageSync('user').token
				}).then(res => {
					this.characterid = res.characters
					this.zhiyeid = res.occupation
					if (res.relation.indexOf(',') != '-1') {
						this.relations = res.relation.split(',').map(item => {
							if (!isNaN(item - 0)) {
								return item - 0;
							} else {
								return item;
							}
						})
					} else {
						if(res.relation){
							this.relations = [
								res.relation
							]
						}
					}
					
					if (res.relation_arr.indexOf(',') != '-1') {
						this.qdgxlist = res.relation_arr.split(',').map(item => {
							if (!isNaN(item - 0)) {
								return item - 0;
							} else {
								return item;
							}
						})
					} else {
						if(res.relation_arr){
							this.qdgxlist = [
								res.relation_arr
							]
						}
					}
					
					if (res.label_arr.indexOf(',') != '-1') {
						this.xrclist = res.label_arr.split(',').map(item => {
							if (!isNaN(item - 0)) {
								return item - 0;
							} else {
								return item;
							}
						})
					} else {
						if(res.label_arr){
							this.xrclist = [
								Number(res.label_arr)
								
							]
						}
					}

					if (res.label.indexOf(',') != '-1') {

						this.labels = res.label.split(',').map(item => {
							if (!isNaN(item - 0)) {
								return item - 0;
							} else {
								return item;
							}
						})
					} else {
						if(res.label){
							this.labels = [
								Number(res.label)
							]
						}
					}


									})
				this.util.request('index/get_select', {}).then(res => {
					this.current = res.label.findIndex(item => item.id == this.characterid)
										this.current1 = res.occupation.findIndex(item => item.id == this.zhiyeid)
                    
					this.characters = res.characters
					this.label = res.label
					this.occupation = res.occupation
					this.relation = res.relation
				})
			},
			get_select() {

			}

		},

		onShow() {
			this.myuser()
		}
	}
</script>

<style>
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
</style>
