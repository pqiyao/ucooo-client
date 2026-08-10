<template>
	<view :class="['chat-page', { 'input-focused': isInputFocus, 'keyboard-open': isKeyboardOpen }]">
		<!-- 导航栏 -->
		<view class="nav-bar">
			<view class="back-btn" style="display: flex;" @click="goBack">
				<u-icon name="arrow-left" size="40"></u-icon>
				<view class="unread-badge" v-if="unreadTotal">
					{{ unreadTotal > 99 ? '99+' : unreadTotal }}
				</view>
			</view>
			<view class="title">{{ chatTitle }}</view>
		</view>

		<!-- 聊天内容区域 -->
		<scroll-view class="chat-content" scroll-y :scroll-with-animation="true" :scroll-into-view="scrollToView">
			<view class="" style="text-align: center;" v-if="isShowLoadin" @click="lastPages">查看更多</view>
			<view v-for="(message, index) in messages" :key="messageKey(message, index)" :id="'msg-' + messageKey(message, index)">
				<!-- 普通消息类型 -->
				<view :class="['message-item', message.senderId == user.user_id ? 'me' : 'other']"
					v-if="(message.type == 'text' || message.type == 'image' || message.type == 'video') && !message.recaller">
					<!-- recaller这个字段为当前的消息撤回没有，只有撤回的消息才有该字段 -->
					<!-- 对方头像 -->
					<image v-if="message.senderId != user.user_id" class="avatar" :src="$getimgsrc(friendInfo.avatar)"
						mode="aspectFill" @tap.stop="openFriendProfile"></image>
					<view class="message-content">
						<view class="readBox"
							v-if="message.senderId == user.user_id && message.localStatus !== 'sending' && message.localStatus !== 'failed' && (message.read || Number(message.is_read) === 1)">
							{{allText.动态页聊天页.已读}}
						</view>
						<view class="readBox"
							v-else-if="message.senderId == user.user_id && message.localStatus !== 'sending' && message.localStatus !== 'failed' && message.delivered">
							已送达
						</view>
						<view class="readBoxYou"
							v-if="message.senderId != user.user_id && !message.fanyi && message.type === 'text' "
							:style="getTranslateButtonPosition(allText.动态页聊天页.翻译)" @click="fanyi(message,index)">
							{{allText.动态页聊天页.翻译}}</view>
						<!-- 文本消息 -->
						<view class="text-message" :id="message"
							v-if="message.type === 'text'">
							<text>
								{{ message.payload.text }}
							</text>
							<view class=""
								style="border-top: 1rpx solid #7c7c7c;color: #7c7c7c;margin-top: 10rpx;padding-top: 10rpx;"
								v-if="message.fanyi">
								{{ message.fanyi }}
							</view>
						</view>
						<!-- <hy-tooltip1 class="text-message" @taptab="tapMessage" :tabs="tab" :id="message"
							v-if="message.type === 'text'">
							<text>
								{{ message.payload.text }}
							</text>
							<view class=""
								style="border-top: 1rpx solid #7c7c7c;color: #7c7c7c;margin-top: 10rpx;padding-top: 10rpx;"
								v-if="message.fanyi">
								{{ message.fanyi }}
							</view>
						</hy-tooltip1> -->
						<!-- 图片消息 -->
						<view :id="message"
							v-else-if="message.type === 'image'">
							<image class="image-message" :src="message.payload.url" mode="widthFix"
								@click="previewImage(message.payload.url)"></image>
						</view>
						<!-- <hy-tooltip1 @taptab="tapMessage" :tabs="tab" :id="message"
							v-else-if="message.type === 'image'">
							<image class="image-message" :src="message.payload.url" mode="widthFix"
								@click="previewImage(message.payload.url)"></image>
						</hy-tooltip1> -->

						<!-- 视频消息 -->
						<view :id="message" v-if="message.type === 'video'">
							<view class="video-message" @click="previewVideo(message)">
								<image class="video-cover" :src="message.payload.thumbnail.url" mode="aspectFill">
								</image>
								<view class="play-icon">
									<u-icon name="play-right-fill" color="#ffffff" size="48"></u-icon>
								</view>
							</view>
						</view>
						<!-- <hy-tooltip1 @taptab="tapMessage" :tabs="tab" :id="message" v-if="message.type === 'video'">
							<view class="video-message" @click="previewVideo(message)">
								<image class="video-cover" :src="message.payload.thumbnail.url" mode="aspectFill">
								</image>
								<view class="play-icon">
									<u-icon name="play-right-fill" color="#ffffff" size="48"></u-icon>
								</view>
							</view>
						</hy-tooltip1> -->
						<!-- 时间 -->
						<text class="message-time">{{ formatTime(message.timestamp) }}</text>
						<text v-if="message.senderId == user.user_id && message.localStatus === 'failed'"
							style="margin-left: 12rpx;color: #e45656;" @click.stop="retryMessage(message)">重试</text>
						<text v-else-if="message.senderId == user.user_id && message.localStatus === 'sending' && message.type !== 'text'"
							style="margin-left: 12rpx;color: #7c7c7c;" @click.stop="cancelMediaUpload(message)">{{ Number(message.uploadProgress || 0) }}% 取消</text>
						<text v-else-if="message.senderId == user.user_id && message.localStatus === 'sending'"
							style="margin-left: 12rpx;color: #7c7c7c;">发送中</text>
						<text v-else-if="message.senderId == user.user_id && !message.delivered && !message.read && Number(message.is_read || 0) !== 1"
							style="margin-left: 12rpx;color: #7c7c7c;">已发送</text>
					</view>
					<!-- 我的头像 -->
					<image v-if="message.senderId == user.user_id" class="avatar" :src="$getimgsrc(user.avatar)"
						mode="aspectFill"></image>
				</view>
				<!-- 撤回消息 -->
				<view class=""
					style="width: 400rpx;padding: 10rpx 0rpx;text-align: center;border-radius: 20rpx;margin:0rpx auto 20rpx auto;color: #999999;"
					v-if="message.recaller">
					<view class="">{{message.timestamp | date('yyyy-mm-dd hh:MM:ss')}}</view>
					<view class="" style="margin-top: 20rpx;">{{allText.动态页聊天页.撤回了一条消息}}</view>
				</view>
				<!-- 违规提醒 -->
				<view class=""
					style="width: 400rpx;padding: 10rpx 0rpx;background-color: #d9d9d9;text-align: center;border-radius: 20rpx;margin:0rpx auto 20rpx auto;color: #999999;"
					v-if="message.type == 'tips'">
					{{message.payload.tipsText}}
				</view>
				<!-- 礼物信息 -->
				<view :class="['message-item', message.senderId == user.user_id ? 'me' : 'other']"
					v-if="message.type == 'liwu'">
					<image v-if="message.senderId != user.user_id" class="avatar" :src="$getimgsrc(friendInfo.avatar)"
						mode="aspectFill" @tap.stop="openFriendProfile"></image>
					<view class="message-content" style="background-color: #FFFFFF;">
						<view class="" style="display: flex;padding: 20rpx 25rpx;align-items: center;">
							<view class="" style="width: 151rpx;height: 151rpx;">
								<image :src="message.payload.imageUrl" mode="aspectFill"
									style="width: 151rpx;height: 151rpx;border-radius: 10rpx;"></image>
							</view>
							<view class="" style="padding-left: 22rpx;">
								<view class="" style="font-size: 30rpx;">
									{{allText.动态页聊天页.赠送了个}}{{message.payload.name}}
								</view>
							</view>

						</view>
					</view>
					<image v-if="message.senderId == user.user_id" class="avatar" :src="$getimgsrc(user.avatar)"
						mode="aspectFill"></image>
				</view>
			</view>
		</scroll-view>

		<!-- 输入区域 -->
		<view class="input-area" v-if="user.nomessage == 0">
			<!-- <view class="voice-btn" v-if="!isInputFocus" @click="toggleVoiceMode">
			<uni-icons type="mic" size="28" color="#666"></uni-icons>
		</view> -->
			<!-- 输入框 -->
			<input class="chat-input" :class="{'input-focused': isInputFocus || inputMessage}" :maxlength="-1" type="text" v-model="inputMessage"
				:placeholder="allText.动态页聊天页.请输入消息" :focus="isInputFocus" @focus="onInputFocus" @blur="onInputBlur"
				confirm-type="send" />
			<!-- @confirm="sendMessage" -->
			<!-- 表情按钮 -->
			<image @click="toggleEmojiPanel" v-if="!isVoiceMode"
				src="/static/chat/em.png" mode="aspectFill" class="emoji-btn"></image>
			<!-- 更多功能按钮 -->
			<image class="more-btn" v-if="!isVoiceMode"
				src="/static/chat/add.png" @click="showMoreOptions" mode="aspectFill">
			</image>
			<!-- 发送按钮 @click="sendMessage" -->
			<view class="send-btn" v-if="isInputFocus || inputMessage" @touchend.prevent="sendMessage">
				<text>{{allText.首页.发送}}</text>
			</view>
		</view>
		<view class="input-area" v-else>
			<input class="chat-input" type="text" 
				:placeholder="allText.动态页聊天页.你已被禁言" 
				disabled
				confirm-type="send" />
		</view>
		<!-- 表情面板 -->
		<view class="emoji-panel" v-if="showEmojiPanel">
			<view class="emoji-list">
				<view v-for="(emoji, index) in emojis" :key="index" class="emoji-item" @click="insertEmoji(emoji)">
					{{ emoji }}
				</view>
			</view>
			<!-- <view class="emoji-panel-close" @click="toggleEmojiPanel">
        <text>关闭</text>
      </view> -->
		</view>
		<!-- 更多功能面板 -->
		<view class="more-panel" v-if="showMorePanel">
			<view class="more-option" @click="sendImage">
				<image src="/static/chat/tu.png" mode="" style="width: 76rpx;height: 76rpx;">
				</image>
				<text>{{allText.动态页聊天页.图片}}</text>
			</view>
			<view class="more-option" @click="sendVideo">
				<image src="/static/chat/tu.png" mode="" style="width: 76rpx;height: 76rpx;">
				</image>
				<text>{{allText.动态页聊天页.视频}}</text>
			</view>
			<view class="more-option" @tap="kind=1,gift(),liwuShow=true"
				v-if="friendID != datadown.set_customer_service">
				<image src="/static/chat/sgift.png" mode="" style="width: 76rpx;height: 76rpx;">
				</image>
				<text>{{allText.动态页聊天页.送礼物}}</text>
			</view>
			<view class="more-option" @tap="weiguiShow = true"
				v-if="user.gender == 2 && friendID != datadown.set_customer_service">
				<image src="/static/chat/weigui.png" mode="" style="width: 76rpx;height: 76rpx;">
				</image>
				<text>{{allText.动态页聊天页.违规提示}}</text>
			</view>
		</view>
		<!-- 送礼物 -->
		<u-popup v-model="liwuShow" mode="bottom" border-radius="14" width="100%">
			<view class=""
				style="display: flex;align-items: center;justify-content: space-between;padding: 39rpx 32rpx;">
				<view class="" style="font-size: 38rpx;color: #5A7EF6;font-weight: 800;">
					{{allText.动态页聊天页.表白特效}}
				</view>
				<view class="" style="display: flex;align-items: center;font-size: 36rpx;font-weight: bold;">
					<image src="/static/home/zs.png" mode=""
						style="width: 28rpx;height: 28rpx;margin-right: 20rpx;"></image>
					<view class="">
						{{score}}
					</view>
				</view>
			</view>
			<swiper :indicator-dots="true" :autoplay="false" :interval="3000" :duration="1000"
				style="width: 100%;height: 450upx;">
				<swiper-item v-for="(i,k) in (Math.ceil(liwulist.length/8))" :key="k">
					<view class="" style="display: flex;flex-wrap: wrap;">
						<view class="" v-for="(n,m) in 8" style="width: 25%;">
							<view :class="currents==k*8+m ? 'liwu1' : 'liwu'" @tap="xuanz(k*8+m)">
								<view v-if="liwulist
								
								[k*8+m]">
									<image :src="liwulist[(k*8)+m].image" mode="aspectFill"
										style="width: 68upx;height: 74upx;padding-top: 15rpx;">
									</image>
									<view class="shopname" style="font-size: 30rpx;padding-top: 10rpx;">
										{{liwulist[(k*8)+m].name}}
									</view>

									<view
										style="font-size: 30rpx;padding-top: 10rpx;display: flex;align-items: center;justify-content: center;">
										<view>{{liwulist[(k*8)+m].price}}</view>

										<!-- 钻石 -->
										<image src="/static/home/zs.png" mode=""
											style="width: 28rpx;height: 28rpx;margin-left: 8rpx;"></image>
									</view>
								</view>
							</view>
						</view>

					</view>
				</swiper-item>
			</swiper>
			<view class=""
				style="display: flex;align-items: center;margin: 0 26rpx 54rpx 26rpx;justify-content: space-between;">
				<view class="czbtn" @click="zsShow=true,liwuShow=false">
					{{allText.首页.充值余额}}
				</view>
				<view class="czbtn" @tap="sendbiaogift">
					{{allText.首页.发送}}
				</view>
			</view>

		</u-popup>
		<!-- 钻石充值 -->
		<u-popup v-model="zsShow" mode="bottom" border-radius="30" z-index="2001">
			<view class="" style="font-size: 38rpx;color: #5A7EF6;font-weight: 800;padding: 33rpx 32rpx;">
				{{allText.首页.充值钻石}}
			</view>
			<scroll-view scroll-x="true" class="scroll-Y" style="white-space: nowrap;">
				<view class="" style="display: flex;align-items: center;">
					<view class="" v-for="(i,k) in zslist" :key="k" style="margin-left: 30rpx;">
						<view :class="current==k ? 'xzsbtn' : 'zsbtn'" @tap="current=k">
							<view class=""
								style="font-size: 30rpx;display: flex;align-items: center;justify-content: center;padding-top: 47rpx;">
								{{i.diamond}}{{allText.我的页.钻}}
							</view>
							<view class=""
								style="font-size: 44rpx;font-weight: bold;text-align: center;padding-top: 25rpx;">
								￥{{i.price}}
							</view>
							<view class="neibtn">
								+{{allText.我的页.赠送}}{{i.zengsong_diamond}}{{allText.我的页.钻}}
							</view>

						</view>
					</view>


				</view>
			</scroll-view>
			<view class="uploadbtn" @tap="cz">
				{{allText.首页.确认充值}}
			</view>
		</u-popup>
		<!-- 违规提醒弹框 -->
		<u-popup v-model="weiguiShow" mode="bottom" border-radius="14" width="100%">
			<view class="">
				<view class=""
					style="display: flex;justify-content: space-between;align-items: center;padding: 20rpx 20rpx;">
					<u-input v-model="tipstext" placeholder="请输入要添加的提示语" :border="true" />
					<view class="" style="margin-left: 20rpx;color: #2979ff;" @click="tianjiaTips">添加</view>
				</view>
				<scroll-view scroll-y="true" style="height: 600rpx;">
					<view class="" style="margin: 20rpx auto;padding: 0rpx 20rpx;">
						<view class=""
							style="display: flex;justify-content: space-between;align-items: center;margin-bottom: 20rpx;"
							v-for="(item,index) in tipsList" :key="index" @click="sendWarin(item)">
							<view class="" style="width: 600rpx;">
								{{item}}
							</view>
							<u-icon @click="remTips(index)" name="trash-fill" color="#2979ff" size="38"></u-icon>
						</view>
					</view>
				</scroll-view>
			</view>
		</u-popup>
		<!-- 提示开通会员 -->
		<u-popup v-model="vipshow" closeable mode="center" border-radius="14" close-icon-color="#fff">
			<view style="width: 600rpx;height: 785rpx;background: #242525;">
				<view class="" style="display: flex;align-items: center;justify-content: center;padding-top: 63rpx;">
					<view class="" style="width: 121rpx;
height: 1rpx;
background: #606060;"></view>
					<image src="/static/vip.png" mode="" style="width: 44rpx;height: 44rpx;margin-left: 10rpx;"></image>
					<view class=""
						style="font-size: 40rpx;font-weight: bold;color: #F9E9CE;margin-left: 10rpx;margin-right: 13rpx;">
						VIP{{allText.我的页.会员}}
					</view>
					<view class="" style="width: 121rpx;
					height: 1rpx;
					background: #606060;"></view>
				</view>

				<view class="" style="font-size: 30rpx;color: #F9E9CE;text-align: center;padding-top: 51rpx;">
					{{allText.动态页聊天页.成为会员可继续与TA聊天}}
				</view>
				<view class="" style="text-align: center;margin-top: 98rpx;">
					<image src="/static/xiaoxi.png" mode="" style="width: 282rpx;height: 282rpx;"></image>
				</view>
				<view class=""
					style="margin: 35rpx 90rpx;height: 86rpx;background: linear-gradient(0deg, #F9E9CE 1%, #F1CA98 98%);border-radius: 43rpx;text-align: center;line-height: 86rpx;font-size: 30rpx;"
					@click="util.urlTo('/pages/user/myvip')">
					{{allText.我的页.开通会员}}
				</view>
			</view>
		</u-popup>
		<view class="content" style="position: fixed;
		      left: 0;
		      top: 0;
		      right: 0;
		      bottom: 0;
		      margin: auto;width: 690rpx;height: 900rpx;
		" v-if="gity">
			<l-svga ref="svga"></l-svga>
		</view>
		<u-popup :cenback="false" v-model="videoShow" mode="center" border-radius="30" z-index="2001">
			<view class="">
				<video :src="videoUrl"></video>
			</view>
		</u-popup>
	</view>
</template>

<script>
	import {
		mapState
	} from 'vuex'
	import chatService from '@/common/chatService.js'
	import chatMediaDraft from '@/common/chatMediaDraft.js'
	export default {
		data() {
			return {
				videoShow: false, //播放视频
				videoUrl: '', //播放的视频链接
				tab: [this.allText.动态页聊天页.撤回], //气泡操作框的选项
				vipshow: false,
				weiguiShow: false, //违规提醒弹框
				liwuShow: false, //礼物弹框
				zsShow: false, //钻石弹框
				chatTitle: '聊天',
				messages: [], //消息列表
				inputMessage: '', //发送消息内容
				isInputFocus: false, //输入框是否聚焦
				isKeyboardOpen: false, //虚拟键盘是否打开
				isVoiceMode: false, //是否开启了发送语音
				showEmojiPanel: false, //开启表情
				showMorePanel: false, //开启更多功能
				scrollToView: '', //自动滚动到最新消息
				emojis: ['', '', '', '', '', '', '', '', '', '❤️', '', ''],
				gity: false, //是否展示gif播放组件，播放完毕关闭组件
				kind: 1,
				liwulist: [], //礼物列表
				score: 0, //积分
				currents: 0, //选中的礼物下标
				zslist: [], //充值钻石列表
				current: 0, //充值钻石的下标
				tipsList: [], //违规提示语
				tipstext: '', //添加提示语输入框内容
				friendID: '', //对方的id
				friendInfo: {}, //对方信息
				im: chatService.createAdapter(this.$goeasy.im, this.GoEasy), //im实例
				timestamp: null, //上次查询结果里最后一条消息的时间戳，首次查询传入null即可
				beforeMessageId: null,
				latestMessageId: 0,
				lastSyncServerTime: 0,
				isShowLoadin: false, //是否显示加载更多
				historyLoading: false,
				historyInitialized: false,
				pageRequestGeneration: 0,
				syncLoading: false,
				syncGeneration: 0,
				chatPageActivationCount: 0,
				datadown: {}, //客服信息
				videoPlayer: {
					visible: false,
					url: '',
					context: null
				},
				userInfoTimer: null, //用户信息更新定时器
				deliveryReceiptTimer: null,
				markReadTimer: null,
				markReadInFlight: false,
				markReadPending: false,
				chatPageVisible: false,
				viewportResizeHandler: null,
				mediaSending: false,
				giftSubmitting: false,
				giftRequestId: '',
				rechargeSubmitting: false,
				filterList:[]
			}
		},
		computed: {
			...mapState(['user', 'token', 'unreadTotal'])
		},
		onLoad(option) {
			// 参数验证：确保传入的id有效
			if (!option || !option.id) {
				console.error('chatpage onLoad: 缺少必要的用户ID参数', option);
				uni.showModal({
					title: '错误',
					content: '聊天对象信息异常，请返回重试',
					showCancel: false,
					success: () => {
						uni.navigateBack();
					}
				});
				return;
			}
			// 解码并验证friendID
			const decodedId = decodeURIComponent(option.id);
			if (!decodedId || decodedId === 'undefined' || decodedId === 'null') {
				console.error('chatpage onLoad: 无效的用户ID', { originalId: option.id, decodedId });
				uni.showModal({
					title: '错误',
					content: '聊天对象ID无效，请返回重试',
					showCancel: false,
					success: () => {
						uni.navigateBack();
					}
				});
				return;
			}
			
			this.friendID = decodedId;
			
			// 记录页面加载日志
						
			this.getZSList()
			if (uni.getStorageSync('tipsList')) {
				this.tipsList = uni.getStorageSync('tipsList')
			}
			this.im.on(this.GoEasy.IM_EVENT.PRIVATE_MESSAGE_RECEIVED, this.onPrivateMessageReceived);
			//接收撤回通知
			this.im.on(this.GoEasy.IM_EVENT.MESSAGE_RECALLED, this.onMessageRecalled);
			uni.$on('imForegroundResume', this.onForegroundResume)
			uni.$on('imRealtimeState', this.onRealtimeState)
			uni.$on('selfChatRead', this.onMessagesRead)
			this.restorePendingMediaDrafts()
		},
		onReady() {
			this.videoPlayer.context = uni.createVideoContext('videoPlayer', this);
			this.adjustPageHeight();
			this.setViewportHeight();
		},

		onShow() {
			this.chatPageVisible = true;
			this.chatPageActivationCount += 1;
			// 重新验证friendID，防止页面参数污染
			if (!this.friendID || this.friendID === 'undefined' || this.friendID === 'null') {
				console.error('onShow: friendID异常，可能存在页面参数污染', {
					friendID: this.friendID,
					currentPages: getCurrentPages(),
					timestamp: new Date().toISOString()
				});
				
				// 尝试从页面栈中重新获取参数
				const pages = getCurrentPages();
				const currentPage = pages[pages.length - 1];
				if (currentPage && currentPage.options && currentPage.options.id) {
					const recoveredId = decodeURIComponent(currentPage.options.id);
					if (recoveredId && recoveredId !== 'undefined' && recoveredId !== 'null') {
												this.friendID = recoveredId;
					} else {
						uni.showModal({
							title: '错误',
							content: '聊天对象信息丢失，请返回重新进入',
							showCancel: false,
							success: () => {
								uni.navigateBack();
							}
						});
						return;
					}
				} else {
					uni.showModal({
						title: '错误',
						content: '页面参数异常，请返回重新进入',
						showCancel: false,
						success: () => {
							uni.navigateBack();
						}
					});
					return;
				}
			}
			
			// 记录页面显示日志
						
			//更新个人信息
			this.util.request('user/user_info', {
				token: this.token
			}).then(res => {
				this.$store.commit('setuser', res)
				this.getkefu()
			})
			// 页面显示时重新调整高度
			this.adjustPageHeight();
			this.setViewportHeight();
			
			// 启动用户信息更新定时器，每3秒调用一次
			this.startUserInfoTimer();
			this.scheduleDeliveryReceiptSync();
			this.friendDetail();
			if (this.historyInitialized) this.syncLatestMessages();
			else this.getHisMessage();
		},
		onHide() {
			this.chatPageVisible = false;
			this.pageRequestGeneration += 1;
			this.historyLoading = false;
			this.syncGeneration += 1;
			this.syncLoading = false;
			// 页面隐藏时清理定时器
			this.clearUserInfoTimer();
			this.clearDeliveryReceiptTimer();
			this.clearMarkReadTimer();
		},
		beforeDestroy() {
			this.chatPageVisible = false
			this.pageRequestGeneration += 1
			this.historyLoading = false
			this.syncGeneration += 1
			this.syncLoading = false
			this.cancelActiveMediaUploads()
			//关闭监听消息通知
			this.im.off(this.GoEasy.IM_EVENT.PRIVATE_MESSAGE_RECEIVED, this.onPrivateMessageReceived);
			//关闭消息撤回监听
			this.im.off(this.GoEasy.IM_EVENT.MESSAGE_RECALLED, this.onMessageRecalled);
			uni.$off('imForegroundResume', this.onForegroundResume)
			uni.$off('imRealtimeState', this.onRealtimeState)
			uni.$off('selfChatRead', this.onMessagesRead)
			// 清理定时器
			this.clearUserInfoTimer();
			this.clearDeliveryReceiptTimer();
			this.clearMarkReadTimer();
			// #ifdef H5
			if (typeof window !== 'undefined' && this.viewportResizeHandler) {
				window.removeEventListener('resize', this.viewportResizeHandler)
				this.viewportResizeHandler = null
			}
			// #endif
		},
		methods: {
			mediaDraftAccountId() {
				const storedUser = uni.getStorageSync('user') || {}
				return String(this.user.user_id || this.user.id || storedUser.user_id || storedUser.id || '')
			},
			restorePendingMediaDrafts() {
				const accountId = this.mediaDraftAccountId()
				if (!accountId || !this.friendID) return
				chatMediaDraft.restore(accountId, this.friendID).forEach(draft => {
					const remoteUploaded = chatMediaDraft.hasRemotePayload(draft.payload)
					let message = null
					const options = {
						file: remoteUploaded ? null : (draft.savedFilePath || null),
						to: {
							type: this.GoEasy.IM_SCENE.PRIVATE,
							id: this.friendID,
							data: draft.toData || {}
						},
						onProgress: event => {
							if (!message) return
							message.uploadProgress = this.uploadPercent(event)
							this.upsertMessage(Object.assign({}, message))
						},
						onUploadTask: task => {
							if (message) message.uploadTask = task
						},
						onUploaded: uploaded => {
							chatMediaDraft.update(uploaded)
						}
					}
					message = draft.type === 'video'
						? this.im.createVideoMessage(options)
						: this.im.createImageMessage(options)
					message.id = draft.clientMsgId
					message.messageId = draft.clientMsgId
					message.clientMsgId = draft.clientMsgId
					message.client_msg_id = draft.clientMsgId
					message.payload = draft.payload || {}
					message.mediaDraftId = draft.id
					message.localStatus = 'failed'
					message.uploadProgress = 0
					message.attachmentClaimRequired = !message.file
					this.upsertMessage(message)
				})
			},
			isCurrentPageRequest(generation, peerId) {
				return this.chatPageVisible
					&& Number(generation) === this.pageRequestGeneration
					&& String(peerId || '') === String(this.friendID || '')
			},
			messageKey(message, index = 0) {
				if (!message) return 'empty-' + index
				return String(message.client_msg_id || message.clientMsgId || message.message_id || message.messageId || message.id || ('local-' + index))
			},
			messageIdentity(message) {
				if (!message) return ''
				return String(message.client_msg_id || message.clientMsgId || message.message_id || message.messageId || message.id || '')
			},
			messageIdentifiers(message) {
				if (!message) return []
				const ids = []
				const clientId = message.client_msg_id || message.clientMsgId
				const serverId = message.message_id || message.messageId || message.id
				if (clientId) ids.push('client:' + String(clientId))
				if (serverId) ids.push('server:' + String(serverId))
				return ids
			},
			messagesMatch(left, right) {
				const leftIds = this.messageIdentifiers(left)
				const rightIds = this.messageIdentifiers(right)
				return leftIds.some(id => rightIds.indexOf(id) !== -1)
			},
			messageSortValue(message) {
				if (!message) return 0
				const sequence = Number(message.conversation_seq || message.sequence || 0)
				if (Number.isFinite(sequence) && sequence > 0) return sequence
				const serverId = Number(message.message_id || 0)
				if (Number.isFinite(serverId) && serverId > 0) return serverId
				const timestamp = Number(message.timestamp || message.createtime * 1000 || 0)
				return Number.isFinite(timestamp) ? timestamp : 0
			},
			isRecalledMessage(message) {
				return !!(message && (message.recaller || message.status === 'recalled'))
			},
			upsertMessage(message) {
				if (!message) return
				this.latestMessageId = Math.max(
					this.latestMessageId,
					Number(message.message_id || message.messageId || 0)
				)
				const index = this.messages.findIndex(item => this.messagesMatch(item, message))
				if (index >= 0) {
					const previous = this.messages[index]
					const merged = Object.assign({}, previous, message, {
						localStatus: message.localStatus || previous.localStatus
					})
					if (this.isRecalledMessage(previous) && !this.isRecalledMessage(message)) {
						merged.status = 'recalled'
						merged.recaller = previous.recaller || previous.senderId || previous.from_id || 'recalled'
						merged.content = ''
						merged.payload = {}
					}
					this.$set(this.messages, index, merged)
				} else {
					this.messages.push(message)
				}
				this.messages.sort((left, right) => {
					const leftValue = this.messageSortValue(left)
					const rightValue = this.messageSortValue(right)
					return leftValue - rightValue
				})
			},
			retryMessage(message) {
				if (!message || message.localStatus !== 'failed') return
				const isMedia = message.type === 'image' || message.type === 'video'
				if (isMedia && this.mediaSending) return
				if (isMedia) this.mediaSending = true
				message.uploadCancelled = false
				message.localStatus = 'sending'
				this.upsertMessage(message)
				this.im.sendMessage({
					message,
						onSuccess: (saved) => {
							if (isMedia) this.mediaSending = false
							message.uploadTask = null
							if (isMedia) chatMediaDraft.complete(message)
						this.upsertMessage(Object.assign({}, saved, { localStatus: 'sent' }))
						this.scrollToBottom()
					},
						onFailed: (error) => {
						if (isMedia) this.mediaSending = false
						message.uploadTask = null
							message.localStatus = 'failed'
							if (isMedia) chatMediaDraft.update(message)
						this.upsertMessage(message)
						this.handleChatSendFailed(error)
					}
				})
			},
			cancelMediaUpload(message) {
				if (!message || message.localStatus !== 'sending' || !message.uploadTask || typeof message.uploadTask.abort !== 'function') return
				message.uploadCancelled = true
				message.uploadTask.abort()
				message.uploadTask = null
				message.localStatus = 'failed'
				chatMediaDraft.update(message)
				this.mediaSending = false
				this.upsertMessage(message)
			},
			cancelActiveMediaUploads() {
				this.messages.forEach(message => {
					if (message && message.localStatus === 'sending' && message.uploadTask && typeof message.uploadTask.abort === 'function') {
						message.uploadCancelled = true
						message.uploadTask.abort()
						message.uploadTask = null
						message.localStatus = 'failed'
					}
				})
				this.mediaSending = false
			},
			//过滤发送信息中的违规词
			async wgFilter(content = ''){
				const sourceContent = typeof content === 'string' ? content : String(content || '');
				// The server owns the authoritative forbidden-word policy. Avoid a
				// second network round trip before every message; send failures keep
				// the local bubble and original text available for retry.
				return sourceContent;
			},
			//提交发送的消息给后端记录
			addMessage(content){
				if (chatService.isSelfProvider && chatService.isSelfProvider()) {
					return Promise.resolve()
				}
				this.util.request('user/add_chat_log', {
					token: uni.getStorageSync('user').token,
					user_id:this.friendID,
					content:content
				}).then(res => {
					
				})
			},
			handleChatSendFailed(error, fallbackText = '发送失败，请稍后重试') {
				const code = String((error && error.code) || '')
				const msg = (error && (error.msg || error.content || error.message)) || fallbackText
				if (code === '10005') {
					this.vipshow = true
					return
				}
				this.util.showToast(code === '408' ? 'GoEasy未连接，消息未发送' : msg)
			},
			//启动用户信息更新定时器
			startUserInfoTimer() {
				// 先清理已存在的定时器
				this.clearUserInfoTimer();
				// 禁言状态不需要高频轮询；进入页面已立即刷新一次。
				this.userInfoTimer = setInterval(() => {
					this.getUserInfo();
				}, 30000);
			},
			//清理用户信息更新定时器
			clearUserInfoTimer() {
				if (this.userInfoTimer) {
					clearInterval(this.userInfoTimer);
					this.userInfoTimer = null;
				}
			},
			//持续更新当前用户信息，以获取当前用户是否被禁言
			getUserInfo(){
				this.util.request('user/user_info', {
					token: this.token
				}).then(res => {
					this.$store.commit('setuser', res)
					if(this.user.nomessage == 1){
						this.showMorePanel = false
						this.liwuShow = false
						this.zsShow = false
						this.weiguiShow = false
					}
				})
			},
			//调用该接口减少用户免费聊天次数
			jiansao(){
				if (chatService.isSelfProvider && chatService.isSelfProvider()) {
					this.decrementLocalChatTimes()
					return
				}
				this.util.request('friend/deductChatTimes', {
					token: uni.getStorageSync('user').token
				}).then(res => {
					this.friendInfo.daily_remaining_times--
				})
			},
			decrementLocalChatTimes() {
				if (this.friendInfo && this.friendInfo.daily_remaining_times > 0 && this.user.is_vip == 'three' && this.friendID != this.datadown.set_customer_service && this.user.user_id != this.datadown.set_customer_service) {
					this.friendInfo.daily_remaining_times--
				}
			},
			hasPendingDeliveryReceipt() {
				if (!chatService.shouldUseGoEasyRealtime()) return false
				const receiptWindowStart = Date.now() - 5 * 60 * 1000
				return this.messages.some(message => {
					if (!message || String(message.senderId || message.from_id || '') !== String(this.user.user_id)) return false
					if (message.localStatus === 'sending' || message.localStatus === 'failed') return false
					const timestamp = Number(message.timestamp || Number(message.createtime || 0) * 1000 || 0)
					if (!timestamp || timestamp < receiptWindowStart) return false
					return !message.delivered && !message.read && Number(message.is_read || 0) !== 1
				})
			},
			scheduleDeliveryReceiptSync(delay = 5000) {
				this.clearDeliveryReceiptTimer()
				if (!this.hasPendingDeliveryReceipt()) return
				this.deliveryReceiptTimer = setTimeout(() => {
					this.deliveryReceiptTimer = null
					if (this.syncLoading) {
						this.scheduleDeliveryReceiptSync(1000)
						return
					}
					this.syncLatestMessages()
				}, Math.max(1000, Number(delay || 5000)))
			},
			clearDeliveryReceiptTimer() {
				if (!this.deliveryReceiptTimer) return
				clearTimeout(this.deliveryReceiptTimer)
				this.deliveryReceiptTimer = null
			},
			//设置视口高度（解决移动端浏览器地址栏问题）
			setViewportHeight() {
				// #ifdef H5
				if (typeof window !== 'undefined') {
					// 获取真实的视口高度
					const vh = window.innerHeight * 0.01;
					// 设置CSS自定义属性
					document.documentElement.style.setProperty('--vh', `${vh}px`);

					if (this.viewportResizeHandler) {
						window.removeEventListener('resize', this.viewportResizeHandler)
					}
					this.viewportResizeHandler = () => {
						const vh = window.innerHeight * 0.01;
						document.documentElement.style.setProperty('--vh', `${vh}px`);
					}
					window.addEventListener('resize', this.viewportResizeHandler);
				}
				// #endif
			},

			// 检测虚拟键盘显示/隐藏
			detectVirtualKeyboard() {
				// #ifdef H5
				if (typeof window !== 'undefined') {
					const initialHeight = window.innerHeight;
					let resizeTimer = null;
					
					const handleResize = () => {
						clearTimeout(resizeTimer);
						resizeTimer = setTimeout(() => {
							const currentHeight = window.innerHeight;
							const heightDiff = initialHeight - currentHeight;
							
							// 如果高度减少超过150px，认为是虚拟键盘弹出
							if (heightDiff > 150) {
								this.isKeyboardOpen = true;
								// 滚动到底部
								setTimeout(() => {
									this.scrollToBottom();
								}, 300);
							} else {
								this.isKeyboardOpen = false;
							}
						}, 100);
					};
					
					window.addEventListener('resize', handleResize);
					
					// 清理事件监听器
					this.$once('hook:beforeDestroy', () => {
						window.removeEventListener('resize', handleResize);
					});
				}
				// #endif
			},

			//调整页面高度
			adjustPageHeight() {
				// 确保聊天内容滚动到底部
				this.$nextTick(() => {
					this.scrollToBottom();
				});
			},

			//播放视频
			previewVideo(msg) {
				this.videoUrl = msg.payload.video.url
								this.videoShow = true
			},
			//获取客服
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
			//翻译文本
			fanyi(msg, index) {
				uni.showLoading({
					title: 'Loading'
				})
				this.util.request('user/translate', {
					content: msg.payload.text,
					user_id: this.friendID,
					token: this.token,
					fan: 'zh-cn'
				}).then(res => {
					this.$set(this.messages[index], 'fanyi', res.info)
					uni.hideLoading()
				})
			},
			//发送礼物
			sendbiaogift() {
				if (this.giftSubmitting) return
				if (this.friendInfo.lahei_status == 2) {
					this.util.showToast(this.allText.动态页聊天页.您已被对方拉黑)
					return false
				}
				//如果用户不是客服账号的话就判断可用的免费次数
				//可免费发送条数等于0，且这个人不是会员的化话
				if (this.friendInfo.daily_remaining_times <= 0 && this.user.is_vip == 'three' && this.friendID != this.datadown.set_customer_service && this.user.user_id != this.datadown.set_customer_service) {
					this.vipshow = true
					return
				}
				const selectedGift = this.liwulist[this.currents]
				if (!selectedGift || !selectedGift.id) {
					this.util.showToast('请先选择礼物')
					return
				}
				this.giftSubmitting = true
				if (!this.giftRequestId) {
					this.giftRequestId = 'gift_' + Date.now() + '_' + Math.random().toString(16).slice(2)
				}
				this.util.request('gift/send_gift', {
					num: 1,
					friend_id: this.friendID,
					token: this.token,
					gift_id: selectedGift.id,
					kind: this.kind,
					request_id: this.giftRequestId,
					im_provider: chatService.getProvider ? chatService.getProvider() : 'self'
				}).then(ext => {
					if (ext.code == 10005) {
						this.giftSubmitting = false
						this.giftRequestId = ''
						this.util.showToast(ext.msg)
						this.liwuShow = false
						this.zsShow = true
						return
					} else {
						this.util.request('gift/my_son_num', {
							token: this.token
						}).then(res => {
							this.score = res.score
						})
						if (chatService.isSelfProvider && chatService.isSelfProvider()) {
							const giftMessage = ext && ext.chat_message
							if (giftMessage && giftMessage.message_id) {
								this.upsertMessage(giftMessage)
							}
							this.liwuShow = false
							this.gity = !!giftMessage
							if (!ext.deduplicated) {
								this.decrementLocalChatTimes()
							}
							this.scrollToBottom()
							this.giftSubmitting = false
							this.giftRequestId = ''
							return
						}
						// 构建要发送的自定义消息
						var liwuInfo = {
							name: selectedGift.name,
							imageUrl: selectedGift.image,
							svgaUrl: selectedGift.file,
						};
						let customMessage = this.im.createCustomMessage({
							type: 'liwu', //字符串，可以任意自定义类型，比如红包'hongbao', 订单'order，处方'chufang'
							payload: liwuInfo,
							to: {
								type: this.GoEasy.IM_SCENE.PRIVATE, //私聊还是群聊，群聊为GoEasy.IM_SCENE.GROUP
								id: this.friendID, //接收方用户id
								data: {
									"avatar": this.friendInfo.avatar,
									"nickname": this.friendInfo.nickname,
								}
							},
							notification: this.buildNotification('送你一个礼物')
						})
						this.im.sendMessage({
							message: customMessage,
							onSuccess: () => { //发送成功
							this.giftSubmitting = false
							this.giftRequestId = ''
																this.messages.push(customMessage);
								this.liwuShow = false
								this.gity = true
								this.decrementLocalChatTimes()
								this.addMessage('礼物')
								// setTimeout(() => {
								// 	this.gosvga(this.liwulist[this.currents].file)
								// }, 800)
								this.scrollToBottom();
							},
							onFailed: (error) => { //发送失败
								this.giftSubmitting = false
																this.handleChatSendFailed(error)
							}
						});


					}

				}).catch(() => {
					this.giftSubmitting = false
				})

			},
			// 播放礼物svga
			gosvga(e) {
				this.$refs.svga.render(async (parser, player) => {

					const videoItem = await parser.load(
						e
					);
					this.show1 = false
					await player.setVideoItem(videoItem);
					// 设置当前动画的循环次数，0代表无限循环 默认 0
					player.loops = 1
					// 开始播放动画，reverse = true 时则反向播放。
					player.startAnimation()
					// 监听动画完成
					player.onFinished(() => {
						this.gity = false
											})
				})
			},
			//消息长按事件
			tapMessage(e, i, id) {
								if (e == 0) {
					this.withdraw(id)
				}
			},
			//消息撤回监听回调
			onMessageRecalled(messages) {
				const recalled = Array.isArray(messages) ? messages : [messages]
				recalled.filter(Boolean).forEach(message => this.upsertMessage(message))
			},
			onMessagesRead(event) {
				const data = event && event.conversation ? event.conversation : (event || {})
				const readerId = String(event && event.reader_id ? event.reader_id : data.reader_id || '')
				if (readerId && readerId !== String(this.friendID)) return
				const readUpToId = Number(data.read_up_to_id || 0)
				this.messages = this.messages.map(message => {
					const messageId = Number(message && (message.message_id || message.messageId || message.id) || 0)
					if (String(message && message.senderId || '') !== String(this.user.user_id)) return message
					if (readUpToId > 0 && messageId > readUpToId) return message
					return Object.assign({}, message, { read: true, is_read: 1 })
				})
			},
			onForegroundResume() {
				if (!this.friendID || this.syncLoading) return
				this.syncLatestMessages()
			},
			onRealtimeState(event) {
				if (!event || event.provider !== 'goeasy' || event.status === 'connected') return
				if (!this.friendID || this.syncLoading) return
				this.syncLatestMessages()
			},
			syncLatestMessages(round = 0, syncState = null) {
				if (round === 0) {
					if (this.syncLoading || !this.chatPageVisible || !this.friendID) return
					this.syncLoading = true
					this.syncGeneration += 1
					syncState = {
						generation: this.syncGeneration,
						peerId: String(this.friendID),
						updatedAfter: this.lastSyncServerTime || 0,
						afterId: this.latestMessageId || 0,
						changedAfterTime: 0,
						changedAfterId: 0,
						changedBeforeId: this.latestMessageId || 0,
						syncBefore: 0
					}
				}
				if (!syncState
					|| Number(syncState.generation || 0) !== this.syncGeneration
					|| String(syncState.peerId || '') !== String(this.friendID)
					|| !this.chatPageVisible) return
				this.im.sync({
					id: syncState.peerId,
					afterId: syncState.afterId,
					updatedAfter: syncState.updatedAfter,
					changedAfterTime: syncState.changedAfterTime,
					changedAfterId: syncState.changedAfterId,
					changedBeforeId: syncState.changedBeforeId,
					syncBefore: syncState.syncBefore,
					limit: 200,
					onSuccess: (result) => {
						if (Number(syncState.generation || 0) !== this.syncGeneration
							|| String(syncState.peerId || '') !== String(this.friendID)
							|| !this.chatPageVisible) return
						const content = Array.isArray(result && result.content) ? result.content : []
						content.forEach(message => this.upsertMessage(message))
						content.forEach(message => {
							this.latestMessageId = Math.max(this.latestMessageId, Number(message.message_id || message.messageId || message.id || 0))
						})
						if (result && result.has_more) {
							const nextState = Object.assign({}, syncState, {
								afterId: result.new_has_more ? Number(result.next_after_id || syncState.afterId) : Number(result.latest_message_id || syncState.afterId),
								changedAfterTime: Number(result.next_changed_time || syncState.changedAfterTime),
								changedAfterId: Number(result.next_changed_id || syncState.changedAfterId),
								changedBeforeId: Number(result.changed_before_id || syncState.changedBeforeId),
								syncBefore: Number(result.sync_before || syncState.syncBefore)
							})
							if (round >= 24) {
								setTimeout(() => {
									if (Number(nextState.generation || 0) !== this.syncGeneration
										|| String(nextState.peerId || '') !== String(this.friendID)
										|| !this.chatPageVisible) return
									this.syncLatestMessages(1, nextState)
								}, 50)
							} else {
								this.syncLatestMessages(round + 1, nextState)
							}
							return
						}
						if (!(result && result.has_more)) {
							this.latestMessageId = Math.max(this.latestMessageId, Number(result && result.latest_message_id || 0))
							this.lastSyncServerTime = Number(result && result.sync_before || this.lastSyncServerTime || 0)
						}
						this.syncLoading = false
						this.scheduleDeliveryReceiptSync()
						this.scrollToBottom()
					},
					onFailed: () => {
						if (Number(syncState.generation || 0) !== this.syncGeneration
							|| String(syncState.peerId || '') !== String(this.friendID)) return
						this.syncLoading = false
						if (this.chatPageVisible) this.scheduleDeliveryReceiptSync(10000)
					}
				})
			},
			//消息撤回
			withdraw(message) {
				this.im.recallMessage({
					messages: [message], //必须为数组格式，要撤回的消息
					onSuccess: (saved) => { //撤回成功
						this.onMessageRecalled([saved])
					},
					onFailed: (error) => { //失败失败
												this.handleChatSendFailed(error, '撤回失败，请稍后重试')
					}
				});
			},
			//预览图片
			previewImage(url) {
				uni.previewImage({
					urls: [url]
				});
			},
			//发送自定义消息,违规提醒
			sendWarin(item) {
				var tips = {
					tipsText: item,
				};
				let customMessage = this.im.createCustomMessage({
					type: 'tips', //字符串，可以任意自定义类型，比如红包'hongbao', 订单'order，处方'chufang'
					payload: tips,
					to: {
						type: this.GoEasy.IM_SCENE.PRIVATE, //私聊还是群聊，群聊为GoEasy.IM_SCENE.GROUP
						id: this.friendID, //接收方用户id
						data: {
							"avatar": this.friendInfo.avatar,
							"nickname": this.friendInfo.nickname,
						}
					},
							notification: this.buildNotification(item)
				})
				this.im.sendMessage({
					message: customMessage,
					onSuccess: () => { //发送成功
												this.messages.push(customMessage);
						this.weiguiShow = false
						this.addMessage('违规消息')
						this.scrollToBottom();
					},
					onFailed: (error) => { //发送失败
												this.handleChatSendFailed(error)
					}
				});
			},
			//标记消息为已读状态
			markMessage() {
				if (!this.chatPageVisible) return
				this.markReadPending = true
				if (this.markReadInFlight || this.markReadTimer) return
				this.markReadTimer = setTimeout(() => {
					this.markReadTimer = null
					this.flushMarkRead()
				}, 150)
			},
			flushMarkRead() {
				if (!this.markReadPending || this.markReadInFlight || !this.friendID || !this.chatPageVisible) return
				this.markReadPending = false
				this.markReadInFlight = true
				const requestGeneration = this.pageRequestGeneration
				const requestPeerId = String(this.friendID)
				this.im.markMessageAsRead({
					id: requestPeerId,
					type: this.GoEasy.IM_SCENE.PRIVATE, //群聊：GoEasy.IM_SCENE.GROUP, 客服消息：GoEasy.IM_SCENE.CS,
					onSuccess: () => this.finishMarkRead(requestGeneration, requestPeerId),
					onFailed: () => this.finishMarkRead(requestGeneration, requestPeerId),
				});
			},
			finishMarkRead(requestGeneration, requestPeerId) {
				if (Number(requestGeneration) !== this.pageRequestGeneration
					|| String(requestPeerId || '') !== String(this.friendID || '')) return
				this.markReadInFlight = false
				if (this.chatPageVisible && this.markReadPending) this.markMessage()
			},
			clearMarkReadTimer() {
				if (this.markReadTimer) clearTimeout(this.markReadTimer)
				this.markReadTimer = null
				this.markReadPending = false
				this.markReadInFlight = false
			},
			//加载下一页聊天信息
			lastPages() {
				if (this.historyLoading || !this.chatPageVisible || !this.friendID) return
				this.historyLoading = true
				const requestGeneration = this.pageRequestGeneration
				const requestPeerId = String(this.friendID)
				const anchorMessage = this.messages.length ? this.messages[0] : null
				const anchorId = anchorMessage ? 'msg-' + this.messageKey(anchorMessage, 0) : ''
				this.im.history({
					id: requestPeerId,
					type: this.GoEasy.IM_SCENE.PRIVATE,
					lastTimestamp: this.timestamp,
					beforeId: this.beforeMessageId,
					limit: 30,
					onSuccess: (result) => {
						if (!this.isCurrentPageRequest(requestGeneration, requestPeerId)) return
						this.historyLoading = false
						const content = Array.isArray(result && result.content) ? result.content : []
						content.forEach(message => this.upsertMessage(message))
						if (content.length) {
							this.timestamp = content[0].timestamp
							this.beforeMessageId = result.next_cursor || content[0].message_id
						}
						if (content.length == 30) {
							this.isShowLoadin = true
						} else {
							this.isShowLoadin = false
						}
						if (anchorId) {
							this.scrollToView = ''
							this.$nextTick(() => { this.scrollToView = anchorId })
						}
					},
					onFailed: (error) => {
						if (!this.isCurrentPageRequest(requestGeneration, requestPeerId)) return
						this.historyLoading = false
						this.handleChatSendFailed(error, '历史消息加载失败，请重试')
					}
				})
			},
			//获取历史消息
			getHisMessage() {
				if (this.historyLoading || !this.friendID) return
				this.historyLoading = true
				const requestGeneration = this.pageRequestGeneration
				const requestPeerId = String(this.friendID)
				this.im.history({
					id: requestPeerId,
					type: this.GoEasy.IM_SCENE.PRIVATE,
					lastTimestamp: this.timestamp,
					beforeId: this.beforeMessageId,
					limit: 30,
					onSuccess: (result) => {
						if (!this.isCurrentPageRequest(requestGeneration, requestPeerId)) return
						this.historyLoading = false
						this.historyInitialized = true
						const pending = this.messages.filter(message => message && ['sending', 'failed'].indexOf(message.localStatus) !== -1)
						this.messages = pending
						const content = Array.isArray(result && result.content) ? result.content : []
						content.forEach(message => this.upsertMessage(message))
						this.lastSyncServerTime = Number(result && result.server_time || this.lastSyncServerTime || 0)
						if (content.length) {
							this.timestamp = content[0].timestamp
							this.beforeMessageId = result.next_cursor || content[0].message_id
						}
						if (content.length == 30) {
							this.isShowLoadin = true
						}
						this.markMessage()
						this.scheduleDeliveryReceiptSync()
						this.scrollToBottom()
					},
					onFailed: (error) => {
						if (!this.isCurrentPageRequest(requestGeneration, requestPeerId)) return
						this.historyLoading = false
						this.handleChatSendFailed(error, '历史消息加载失败，请重试')
					}
				})
			},
			//监听消息
			onPrivateMessageReceived(message) {
				if(message.senderId == this.friendID){
					this.upsertMessage(message)
					if (message.type == "liwu") {
						this.gity = true
						// setTimeout(() => {
						// 	this.gosvga(message.payload.svgaUrl)
						// }, 800)
					}
					this.markMessage()
					this.scrollToBottom()
				}
				
			},
			limitNotificationText(text, maxLength) {
				const value = String(text || '').replace(/\s+/g, ' ').trim()
				if (value.length <= maxLength) {
					return value
				}
				return value.slice(0, Math.max(maxLength - 3, 0)) + '...'
			},
			buildNotification(body) {
				const title = this.limitNotificationText((this.user && this.user.nickname) || '新消息', 32)
				const content = this.limitNotificationText(body || '你收到一条新消息', 50)
				return {
					title,
					body: content,
					badge: '+1'
				}
			},
			//创建文本消息
			createMessage() {
				//创建消息, 内容最长不超过3K，可以发送字符串，对象和json格式字符串
				let textMessage = this.im.createTextMessage({
					text: this.inputMessage, //消息内容
					to: {
						type: this.GoEasy.IM_SCENE.PRIVATE, //私聊还是群聊，群聊为GoEasy.IM_SCENE.GROUP
						id: this.friendID, //接收方用户id
						data: {
							"avatar": this.friendInfo.avatar,
							"nickname": this.friendInfo.nickname,
						} //接收方用户扩展数据, 任意格式的字符串或者对象，用于更新会话列表conversation.data
					},
					notification: this.buildNotification(this.inputMessage)
				});
				return textMessage
			},
			//发送文本消息
			async sendMessage() {
				// 最终确认：验证接收方ID是否有效
				if (!this.friendID || this.friendID === 'undefined' || this.friendID === 'null') {
					console.error('sendMessage: 接收方ID无效', {
						friendID: this.friendID,
						friendInfo: this.friendInfo,
						timestamp: new Date().toISOString()
					});
					uni.showModal({
						title: '发送失败',
						content: '聊天对象信息异常，请重新进入聊天',
						showCancel: false
					});
					return;
				}
				
				// 记录发送消息日志
								
				if (this.friendInfo.lahei_status == 2) {
					this.util.showToast(this.allText.动态页聊天页.您已被对方拉黑)
					return false
				}
				//如果用户不是客服账号的话就判断可用的免费次数
				//可免费发送条数等于0，且这个人不是会员的化话
												if (this.friendInfo.daily_remaining_times <= 0 && this.user.is_vip == 'three' && this.friendID != this.datadown.set_customer_service && this.user.user_id != this.datadown.set_customer_service) {
					this.vipshow = true
					return
				}
				if (!this.inputMessage.trim()) return;

				// 过滤违规词汇
								const filteredMessage = await this.wgFilter(this.inputMessage);
								
				// 如果过滤后消息为空，提示用户
				if (!filteredMessage.trim()) {
					this.inputMessage = '';
					return;
				}
				
				// 临时保存原始输入，用过滤后的内容创建消息
				const originalMessage = this.inputMessage;
				this.inputMessage = filteredMessage;
				const newMessage = this.createMessage();
				newMessage.localStatus = 'sending';
				// 恢复原始输入用于日志记录
				this.inputMessage = originalMessage;
								
				
				// 再次确认消息接收方ID
				if (newMessage.receiverId !== this.friendID) {
					console.error('sendMessage: 消息接收方ID不匹配', {
						messageToId: newMessage.receiverId,
						currentFriendID: this.friendID
					});
					uni.showModal({
						title: '发送失败',
						content: '消息接收方信息不一致，请重新进入聊天',
						showCancel: false
					});
					return;
				}
				
				// 先显示本地 pending 气泡；服务端响应回来后按 client_msg_id 合并。
				this.upsertMessage(newMessage);
				this.inputMessage = '';

				//发送消息
				this.im.sendMessage({
					message: newMessage,
					onSuccess: (saved) => { //发送成功
												this.upsertMessage(Object.assign({}, saved, { localStatus: 'sent' }));
						this.scheduleDeliveryReceiptSync()
						this.addMessage(newMessage.payload.text)
						this.jiansao()
						this.scrollToBottom();
					},
					onFailed: (error) => { //发送失败
						newMessage.localStatus = 'failed';
						this.upsertMessage(newMessage);
												this.handleChatSendFailed(error)
					}
				});
			},
			insertEmoji(emoji) {
				this.inputMessage += emoji;
			},
			//获取对方的用户信息
			friendDetail() {
				if (!this.friendID) return
				const requestGeneration = this.pageRequestGeneration
				const requestPeerId = String(this.friendID)
				this.util.request('friend/user_info', {
					uid: requestPeerId,
					token: this.token
				}).then(res => {
					if (!this.isCurrentPageRequest(requestGeneration, requestPeerId)) return
					this.friendInfo = res
					this.chatTitle = res.nickname
				}).catch(error => {
					if (!this.isCurrentPageRequest(requestGeneration, requestPeerId)) return
					console.error('获取聊天对象失败:', error);
					uni.showToast({
						icon: 'none',
						title: '聊天对象加载失败'
					});
				})
			},
			openFriendProfile() {
				if (!this.friendID || this.friendID === 'undefined' || this.friendID === 'null') {
					uni.showToast({
						icon: 'none',
						title: '用户信息异常'
					});
					return;
				}
				this.util.urlTo('/pages/index/userdetail?id=' + encodeURIComponent(this.friendID));
			},
			//删除提示语
			remTips(index) {
								this.tipsList.splice(index, 1)
				if (this.tipsList.length != 0) {
					uni.setStorageSync('tipsList', this.tipsList)
				} else {
					uni.setStorageSync('tipsList', [])
				}
			},
			//添加提示语
			tianjiaTips() {
				if (this.tipsList.length >= 5) {
					uni.showToast({
						icon: 'none',
						title: '最多添加5条'
					})
				} else {
					this.tipsList.push(this.tipstext)
					uni.setStorageSync('tipsList', this.tipsList)
				}
				this.tipstext = ''
			},
			//获取砖石列表
			getZSList() {
				this.util.request('vip/recharge_good_list', {
					token: uni.getStorageSync('user').token
				}).then(res => {
					this.zslist = res
				})
			},
			//充值
			cz() {
				if (this.rechargeSubmitting) return
				const selected = this.zslist[this.current]
				if (!selected || !selected.good_id) {
					this.util.showToast('请选择充值套餐')
					return
				}
				this.rechargeSubmitting = true
				this.util.request('vip/add_recharge', {
					token: uni.getStorageSync('user').token,
					good_id: selected.good_id
				}).then(res => {
					this.util.urlTo('/pages/user/pay?detail=' + JSON.stringify(res))
				}).catch(() => {}).then(() => {
					this.rechargeSubmitting = false
				})

			},
			//选中的礼物下标
			xuanz(k) {
								this.currents = k
			},
			//点击获取礼物的时候获取当前礼物信息和余额信息
			gift() {
				this.util.request('gift/my_son_num', {
					token: this.token
				}).then(res => {
					this.score = res.score
				})
				this.util.request('gift/all_gift_list', {
					kind: this.kind
				}).then(res => {
					this.liwulist = res
				})
			},
			//返回上一页
			goBack() {
				let canNavBack = getCurrentPages()
				  if( canNavBack && canNavBack.length>1) {  
					  uni.navigateBack() 
				  } else {  
					  history.back();  
				  } 
			},

			onInputFocus() {
				this.isInputFocus = true;
				this.showEmojiPanel = false;
				this.showMorePanel = false;
				
				// 检测虚拟键盘
				this.detectVirtualKeyboard();
				
				setTimeout(() => {
					this.scrollToBottom();
				}, 800)
			},

			onInputBlur() {
				this.isInputFocus = false;
				this.isKeyboardOpen = false;
				
				setTimeout(() => {
					this.scrollToBottom();
				}, 800)
			},
			//发送语音点击事件，无实际功能
			toggleVoiceMode() {
				this.isVoiceMode = !this.isVoiceMode;
				if (this.isVoiceMode) {
					this.showEmojiPanel = false;
					this.showMorePanel = false;
				}
			},

			toggleEmojiPanel() {
				this.showEmojiPanel = !this.showEmojiPanel;
				this.showMorePanel = false;
				if (this.showEmojiPanel) {
					this.scrollToBottom();
				}
			},

			showMoreOptions() {
				this.showMorePanel = !this.showMorePanel;
				this.showEmojiPanel = false;
				if (this.showMorePanel) {
					this.scrollToBottom();
				}
			},

			scrollToBottom(lastID) {
				this.$nextTick(() => {
					if (this.messages.length > 0) {
						const lastIndex = this.messages.length - 1;
						this.scrollToView = 'msg-' + this.messageKey(this.messages[lastIndex], lastIndex);
					}
				});
			},
			//发送图片
			async setImageMessag(file) {
				if (this.mediaSending) return
				this.mediaSending = true
				let message = this.im.createImageMessage({
					file: file, //H5获得的图片file对象，Uniapp和小程序调用chooseImage，success时得到的res.tempFiles数组中的元素，比如res.tempFiles[0]即为选择的第一张图片
					to: {
						type: this.GoEasy.IM_SCENE.PRIVATE, //私聊还是群聊，群聊为GoEasy.IM_SCENE.GROUP
						id: this.friendID,
						data: {
							"avatar": this.friendInfo.avatar,
							"nickname": this.friendInfo.nickname,
						} //好友扩展数据, 任意格式的字符串或者对象，用于更新会话列表conversation.data
					},
					onProgress: (event) => {
						message.uploadProgress = this.uploadPercent(event)
						this.upsertMessage(Object.assign({}, message))
					},
					onUploadTask: (task) => {
						message.uploadTask = task
					},
					onUploaded: (uploaded) => {
						chatMediaDraft.update(uploaded)
					},
					notification: this.buildNotification('图片')
				})
				message.localStatus = 'sending'
				message.uploadProgress = 0
				message.payload = { url: this.localFilePath(file) }
				await chatMediaDraft.create(message, {
					accountId: this.mediaDraftAccountId(),
					peerId: this.friendID,
					size: Number(file && (file.size || file.fileSize) || 0),
					toData: { avatar: this.friendInfo.avatar, nickname: this.friendInfo.nickname }
				})
				this.upsertMessage(message)
				this.im.sendMessage({
					message: message,
					onSuccess: (saved) => { //发送成功
						this.mediaSending = false
						message.uploadTask = null
						chatMediaDraft.complete(message)
												// this.friendInfo.daily_remaining_times--
						this.jiansao()
						this.upsertMessage(Object.assign({}, saved || message, { localStatus: 'sent' }));
						this.scheduleDeliveryReceiptSync()
						this.addMessage('图片')
						this.scrollToBottom();
					},
					onFailed: (error) => { //发送失败
						this.mediaSending = false
						message.uploadTask = null
						message.localStatus = 'failed'
						chatMediaDraft.update(message)
						this.upsertMessage(message)
						if (!message.uploadCancelled) this.handleChatSendFailed(error)
					}
				});
			},
			//发送视频
			async sendVideoMessage(tempFile) {
				if (this.mediaSending) return
				this.mediaSending = true
				let message = this.im.createVideoMessage({
					file: tempFile,
					to: {
						type: this.GoEasy.IM_SCENE.PRIVATE, //私聊还是群聊，群聊为GoEasy.IM_SCENE.GROUP
						id: this.friendID,
						data: {
							"avatar": this.friendInfo.avatar,
							"nickname": this.friendInfo.nickname,
						} //好友扩展数据, 任意格式的字符串或者对象，用于更新会话列表conversation.data
					},
					onProgress: (event) => {
						message.uploadProgress = this.uploadPercent(event)
						this.upsertMessage(Object.assign({}, message))
					},
					onUploadTask: (task) => {
						message.uploadTask = task
					},
					onUploaded: (uploaded) => {
						chatMediaDraft.update(uploaded)
					},
					notification: this.buildNotification('视频')
				})
				message.localStatus = 'sending'
				message.uploadProgress = 0
				const localVideo = this.localFilePath(tempFile)
				message.payload = {
					video: { url: localVideo },
					thumbnail: { url: tempFile.thumbTempFilePath || tempFile.tempVideoThumbPath || localVideo }
				}
				await chatMediaDraft.create(message, {
					accountId: this.mediaDraftAccountId(),
					peerId: this.friendID,
					size: Number(tempFile && (tempFile.size || tempFile.fileSize) || 0),
					toData: { avatar: this.friendInfo.avatar, nickname: this.friendInfo.nickname }
				})
				this.upsertMessage(message)
				this.im.sendMessage({
					message: message,
					onSuccess: (saved) => { //发送成功
						this.mediaSending = false
						message.uploadTask = null
						chatMediaDraft.complete(message)
												// this.friendInfo.daily_remaining_times--
						this.jiansao()
						this.upsertMessage(Object.assign({}, saved || message, { localStatus: 'sent' }));
						this.scheduleDeliveryReceiptSync()
						this.addMessage('视频')
						this.scrollToBottom();
					},
					onFailed: (error) => { //发送失败
						this.mediaSending = false
						message.uploadTask = null
						message.localStatus = 'failed'
						chatMediaDraft.update(message)
						this.upsertMessage(message)
						if (!message.uploadCancelled) this.handleChatSendFailed(error)
					}
				});
			},
			//选择视频
			sendVideo() {
				if (this.mediaSending) return
				if (this.friendInfo.lahei_status == 2) {
					this.util.showToast(this.allText.动态页聊天页.您已被对方拉黑)
					return false
				}
				//如果用户不是客服账号的话就判断可用的免费次数
				//可免费发送条数等于0，且这个人不是会员的化话
				if (this.friendInfo.daily_remaining_times <= 0 && this.user.is_vip == 'three' && this.friendID != this.datadown.set_customer_service && this.user.user_id != this.datadown.set_customer_service) {
					this.vipshow = true
					return
				}
				uni.chooseVideo({
					success: (res) => {
						if (!this.validateMediaSize(res, 100, '视频')) return
						this.sendVideoMessage(res)
					}
				});
			},
			//选择图片
			sendImage() {
				if (this.mediaSending) return
				if (this.friendInfo.lahei_status == 2) {
					this.util.showToast(this.allText.动态页聊天页.您已被对方拉黑)
					return false
				}
				//如果用户不是客服账号的话就判断可用的免费次数
				//可免费发送条数等于0，且这个人不是会员的化话
				if (this.friendInfo.daily_remaining_times <= 0 && this.user.is_vip == 'three' && this.friendID != this.datadown.set_customer_service && this.user.user_id != this.datadown.set_customer_service) {
					this.vipshow = true
					return
				}
				uni.chooseImage({
					count: 1,
					success: (res) => {
						const file = res.tempFiles && res.tempFiles[0]
						if (!this.validateMediaSize(file, 10, '图片')) return
						this.setImageMessag(file)
					}
				})
			},
			uploadPercent(event) {
				if (event && Number.isFinite(Number(event.progress))) {
					return Math.max(0, Math.min(100, Math.round(Number(event.progress))))
				}
				const sent = Number(event && event.totalBytesSent || 0)
				const total = Number(event && event.totalBytesExpectedToSend || 0)
				return total > 0 ? Math.max(0, Math.min(100, Math.round(sent * 100 / total))) : 0
			},
			localFilePath(file) {
				if (typeof file === 'string') return file
				return String(file && (file.path || file.tempFilePath || file.url) || '')
			},
			validateMediaSize(file, maxMb, label) {
				if (!file) {
					this.util.showToast(label + '选择失败，请重试')
					return false
				}
				const bytes = Number(file.size || file.fileSize || 0)
				if (bytes > maxMb * 1024 * 1024) {
					this.util.showToast(label + '不能超过' + maxMb + 'MB')
					return false
				}
				return true
			},
			//压缩图片，展示没用
			compressImage(filePath) {
				return new Promise((resolve, reject) => {
					const img = new Image();
					img.src = filePath;
					img.onload = () => {
						const canvas = document.createElement('canvas');
						const ctx = canvas.getContext('2d');
						const maxWidth = 150;
						const maxHeight = 150;
						let width = img.width;
						let height = img.height;

						if (width > maxWidth) {
							height = height * (maxWidth / width);
							width = maxWidth;
						}
						if (height > maxHeight) {
							width = width * (maxHeight / height);
							height = maxHeight;
						}

						canvas.width = width;
						canvas.height = height;
						ctx.drawImage(img, 0, 0, width, height);

						const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.4);
						resolve(compressedDataUrl);
					};
					img.onerror = (err) => {

						reject(new Error('图片加载失败'));
					};
				});
			},

			sendFile() {
				// 文件消息处理
				this.showMorePanel = false;
			},

			formatTime(timestamp) {
				// 这里可以使用之前提供的formatTime函数
				return new Date(timestamp).toLocaleTimeString([], {
					hour: '2-digit',
					minute: '2-digit'
				});
			},

			//根据翻译文字长度动态调整按钮位置
			getTranslateButtonPosition(translateText) {
				if (!translateText) return {};

				// 特殊处理已知的翻译文字
				const knownTranslations = {
					'翻译': 70, // 中文，最短
					'翻訳': 70, // 日文
					'번역': 75, // 韩文
					'translate': 105, // 英文
					'Traduire': 100, // 法文
					'Übersetzen': 130, // 德文，最长
					'Invisible': 105, // 英文隐身
					'隐身': 70, // 中文隐身
					'隱身': 70, // 繁体中文隐身
					'オンライン': 110, // 日文在线
					'온라인': 85, // 韩文在线
					'Online': 85, // 英文在线
					'En ligne': 100 // 法文在线
				};

				// 如果是已知的翻译文字，使用预设值
				if (knownTranslations[translateText]) {
					return {
						right: `-${knownTranslations[translateText]}rpx`
					};
				}

				// 否则根据文字长度动态计算
				const textLength = translateText.length;
				let rightOffset = 70 + (textLength * 8); // 基础70rpx + 每个字符8rpx

				// 限制在合理范围内
				rightOffset = Math.min(Math.max(rightOffset, 70), 140);

				return {
					right: `-${rightOffset}rpx`
				};
			},


		}
	}
</script>

<style lang="scss" scoped>
	.shopname {
		display: -webkit-box;
		/* 设置为WebKit内核的弹性盒子模型 */
		-webkit-box-orient: vertical;
		/* 垂直排列 */
		-webkit-line-clamp: 2;
		/* 限制显示两行 */
		overflow: hidden;
		/* 隐藏超出范围的内容 */
		text-overflow: ellipsis;

	}

	.video-message {
		position: relative;
		width: 250rpx;
		height: 350rpx;
		border-radius: 8rpx;
		overflow: hidden;
		background-color: #222222;

		.video-cover {
			width: 100%;
			height: 100%;
		}

		.play-icon {
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			opacity: 0.8;
		}

		.video-duration {
			position: absolute;
			right: 10rpx;
			bottom: 10rpx;
			color: #fff;
			font-size: 24rpx;
			background-color: rgba(0, 0, 0, 0.5);
			padding: 4rpx 12rpx;
			border-radius: 20rpx;
		}
	}

	.zsbtn {
		width: 260rpx;
		height: 255rpx;
		background: #F2F2F2;
		border-radius: 20rpx;
		color: #222222;

		.neibtn {
			// width: 174rpx;
			height: 42rpx;
			background: rgba(221, 221, 221, 0.8);
			border-radius: 10rpx;
			text-align: center;
			line-height: 42rpx;
			font-size: 26rpx;
			color: #666666;
			margin: 25rpx 10rpx;
		}
	}

	.uploadbtn {
		margin: 78rpx 105rpx 56rpx 103rpx;
		height: 86rpx;
		background: #5A7EF6;
		border-radius: 43rpx;
		text-align: center;
		line-height: 86rpx;
		font-size: 34rpx;
		color: #fff;
	}

	.xzsbtn {
		width: 260rpx;
		height: 255rpx;
		background: #F3F9FF;
		border-radius: 20rpx;
		border: 2rpx solid #5D81F7;
		color: #222222;

		.neibtn {
				// width: 178rpx;
				height: 42rpx;
				background: #5A7EF6;
				border-radius: 10rpx;
				text-align: center;
				line-height: 42rpx;
				font-size: 26rpx;
				color: #FFF;
				margin: 25rpx 10rpx;
			}
	}

	.liwu {
		width: 154rpx;
		height: 200rpx;
		border-radius: 20rpx;
		text-align: center;
		margin: 0 auto;
	}

	.czbtn {
		width: 341rpx;
		height: 86rpx;
		background: #5A7EF6;
		border-radius: 43rpx;
		text-align: center;
		line-height: 86rpx;
		font-size: 34rpx;
		color: #fff;

	}

	.czbtn1 {
		width: 170rpx;
		height: 63rpx;
		background: #5A7EF6;
		border-radius: 43rpx;
		text-align: center;
		line-height: 63rpx;
		font-size: 30rpx;
		color: #fff;
	}

	.liwu1 {
		width: 154rpx;
		height: 200rpx;
		background: #fff;
		border-radius: 20rpx;
		border: 1rpx solid #9296FF;
		text-align: center;
		margin: 0 auto;
	}

	.chat-page {
		display: flex;
		flex-direction: column;
		height: 100vh;
		max-height: 100vh;
		background-color: #F6F7FA;
		position: relative;
		overflow: hidden;
		color: #20242C;

		.nav-bar {
			position: relative;
			display: flex;
			align-items: center;
			justify-content: flex-start;
			height: calc(96rpx + var(--status-bar-height, 0px));
			padding: var(--status-bar-height, 0px) 28rpx 0;
			background-color: #FFFFFF;
			border-bottom: 1rpx solid #ECEFF5;
			box-sizing: border-box;

			.back-btn {
				position: relative;
				z-index: 2;
				width: 76rpx;
				height: 72rpx;
				align-items: center;
			}

			.unread-badge {
				position: absolute;
				top: 6rpx;
				right: 6rpx;
				min-width: 36rpx;
				height: 36rpx;
				line-height: 36rpx;
				text-align: center;
				background-color: #EF5B68;
				color: #FFFFFF;
				border-radius: 18rpx;
				font-size: 20rpx;
				padding: 0 8rpx;
				box-sizing: border-box;
			}

			.title {
				position: absolute;
				left: 120rpx;
				right: 120rpx;
				text-align: center;
				font-size: 32rpx;
				font-weight: 700;
				color: #20242C;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}
		}

		.chat-content {
			flex: 1;
			padding: 26rpx 22rpx 18rpx;
			overflow-y: auto;
			overflow-x: hidden;
			box-sizing: border-box;
			/* 确保滚动区域不被输入框遮挡 */
			margin-bottom: 0;

			.message-item {
				display: flex;
				align-items: flex-start;
				margin-bottom: 26rpx;

				&.me {
					justify-content: flex-end; // 关键点：右对齐

					.message-content {
						order: -1; // 关键点：将内容放在头像前面
						margin-right: 18rpx;
						align-items: flex-end;
						position: relative;

						.text-message {
							background-color: #5A7EF6;
							border-radius: 22rpx 6rpx 22rpx 22rpx;
							color: #FFFFFF;
							box-shadow: 0 8rpx 22rpx rgba(90, 126, 246, 0.16);
						}

						.readBox {
							position: absolute;
							left: -120rpx;
							/* 基础左边距 */
							bottom: 40rpx;
							font-size: 24rpx;
							color: #7D8492;
							background-color: rgba(255, 255, 255, 0.96);
							/* 添加半透明背景 */
							padding: 8rpx 12rpx;
							/* 添加内边距 */
							border-radius: 20rpx;
							/* 添加圆角 */
							border: 1rpx solid #E6EAF2;
							/* 添加边框 */
							white-space: nowrap;
							/* 防止文字换行 */
							box-shadow: 0 4rpx 14rpx rgba(31, 36, 48, 0.08);
							/* 添加阴影 */
							z-index: 10;
							/* 确保在最上层 */
							min-width: 60rpx;
							/* 最小宽度 */
							max-width: 200rpx;
							/* 最大宽度 */
							text-align: center;
							/* 文字居中 */
							transition: all 0.2s ease;
							/* 添加过渡动画 */
						}

					}
				}

				&.other {
					.message-content {
						align-items: flex-start;
						margin-left: 18rpx;
						position: relative;

						.text-message {
							background-color: #FFFFFF;
							border: 1rpx solid #E9EDF5;
							border-radius: 6rpx 22rpx 22rpx 22rpx;
							color: #252A33;
							box-shadow: 0 8rpx 22rpx rgba(31, 36, 48, 0.04);
						}

						.readBoxYou {
							position: absolute;
							/* right值由动态计算提供 */
							bottom: 42rpx;
							font-size: 24rpx;
							color: #8A92A0;
							/* 淡灰色文字 */
							white-space: nowrap;
							cursor: pointer;

							/* 点击效果 */
							&:active {
								color: #666666;
								/* 点击时稍微深一点的灰色 */
							}
						}
					}

				}

				.avatar {
					width: 78rpx;
					height: 78rpx;
					border-radius: 22rpx;
					background: #E9EDF5;
					flex-shrink: 0;
				}

				.message-content {
					display: flex;
					flex-direction: column;
					max-width: 72%;

					.text-message {
						padding: 18rpx 22rpx;
						font-size: 30rpx;
						line-height: 1.48;
						word-break: break-word;
						box-sizing: border-box;
					}

					.image-message {
						max-width: 300rpx;
						border-radius: 18rpx;
						box-shadow: 0 8rpx 22rpx rgba(31, 36, 48, 0.08);
					}

					.message-time {
						margin-top: 9rpx;
						font-size: 22rpx;
						color: #A1A8B5;
					}
				}
			}
		}

		.input-area {
			display: flex;
			align-items: center;
			padding: 16rpx 20rpx;
			background-color: #FFFFFF;
			border-top: 1rpx solid #E9EDF5;
			flex-shrink: 0;
			/* 防止被压缩 */
			position: relative;
			z-index: 1000;
			/* 安全区域适配 */
			padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
			padding-bottom: calc(16rpx + constant(safe-area-inset-bottom));
			/* 确保在移动端浏览器中始终可见 */
			min-height: 96rpx;
			box-shadow: 0 -8rpx 26rpx rgba(31, 36, 48, 0.06);

			.voice-btn,
			.emoji-btn,
			.more-btn {
				display: flex;
				align-items: center;
				justify-content: center;
				width: 54rpx;
				height: 54rpx;
				line-height: 80rpx;
				white-space: nowrap;
				flex-shrink: 0;
				/* 防止功能按钮被压缩 */
				opacity: 0.72;
			}

			.more-btn {
				margin-left: 14rpx;
			}
			
			.emoji-btn {
				margin-left: 8rpx;
			}

			.send-btn {
				background-color: #5A7EF6;
				border-radius: 34rpx;
				padding: 0 26rpx;
				margin-left: 12rpx;
				flex-shrink: 0;
				/* 防止发送按钮被压缩 */
				min-width: 108rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				height: 68rpx;
				box-shadow: 0 8rpx 18rpx rgba(90, 126, 246, 0.18);

				text {
					color: #FFFFFF;
					font-size: 28rpx;
					font-weight: 700;
					white-space: nowrap;
				}
			}

			.chat-input {
				flex: 1;
				height: 72rpx;
				padding: 0 26rpx;
				margin: 0 12rpx;
				background-color: #F1F3F7;
				border-radius: 36rpx;
				font-size: 30rpx;
				color: #20242C;
				transition: all 0.3s ease;
				box-sizing: border-box;
			}
			
			.chat-input.input-focused {
				/* 当输入框聚焦或有内容时，适当缩小宽度为发送按钮让出空间 */
				flex: 0.96;
				min-width: 250rpx;
			}
		}

		.emoji-panel,
		.more-panel {
			background-color: #FFFFFF;
			border-top: 1rpx solid #E9EDF5;
			padding: 22rpx 24rpx;
			flex-shrink: 0;
			/* 防止被压缩 */
			/* 安全区域适配 */
			padding-bottom: calc(22rpx + env(safe-area-inset-bottom));
			padding-bottom: calc(22rpx + constant(safe-area-inset-bottom));

			.emoji-list {
				display: flex;
				flex-wrap: wrap;

				.emoji-item {
					width: 15%;
					text-align: center;
					padding: 15rpx 0;
					font-size: 40rpx;
				}
			}

			.emoji-panel-close {
				text-align: center;
				padding: 20rpx;
				color: #6D7480;
				font-size: 28rpx;
				border-top: 1rpx solid #E9EDF5;
			}
		}

		.more-panel {
			display: flex;
			justify-content: space-around;

			.more-option {
				display: flex;
				flex-direction: column;
				align-items: center;
				color: #444B57;

				text {
					margin-top: 12rpx;
					font-size: 24rpx;
					color: #6D7480;
				}
			}
		}
	}

	/* 移动端浏览器适配 */
	@media screen and (max-height: 700px) {
		.chat-page {
			height: 100vh;
			height: calc(var(--vh, 1vh) * 100);
		}
	}

	/* 移动端输入框焦点时的适配 */
	.chat-page.input-focused {
		.chat-content {
			padding-bottom: 100rpx; /* 为输入框留出更多空间 */
		}
	}

	/* 移动端浏览器虚拟键盘适配 */
	@supports (-webkit-touch-callout: none) {
		.chat-page {
			/* iOS Safari 适配 */
			height: 100vh;
			height: -webkit-fill-available;
		}
		
		.input-area {
			/* 确保输入区域在虚拟键盘上方 */
			position: relative;
			z-index: 999;
		}
		
		.chat-page.keyboard-open {
				.chat-content {
					/* 键盘打开时调整内容区域 */
					max-height: calc(100vh - 200rpx);
					padding-bottom: 120rpx;
				}
				
				.input-area {
					/* 确保输入框在键盘上方 */
					position: fixed;
					bottom: 0;
					left: 0;
					right: 0;
					transform: translateY(0);
				}
			}
		}

		/* Android Chrome 浏览器特殊适配 */
		@media screen and (max-width: 768px) {
			.chat-page.input-focused {
				.chat-content {
					/* 输入框聚焦时为内容区域留出更多空间 */
					padding-bottom: 150rpx;
					margin-bottom: 20rpx;
				}
			}
			
			.input-area {
				/* 移动端输入区域优化 */
				box-shadow: 0 -8rpx 26rpx rgba(31, 36, 48, 0.06);
			}
		}

	/* 小屏幕设备适配 */
	@media screen and (max-width: 750rpx) {
		.chat-content {
			padding: 15rpx;
		}

		.input-area {
			padding: 10rpx 15rpx;
		}

		/* 小屏幕上调整翻译按钮 */
		.message-item {
			&.other {
				.message-content {
					.readBoxYou {
						font-size: 22rpx;
					}
				}
			}

			&.me {
				.message-content {
					.readBox {
						left: -120rpx;
						font-size: 22rpx;
					}
				}
			}
		}
	}

	/* 超小屏幕设备适配 */
	@media screen and (max-width: 600rpx) {
		.message-item {
			&.other {
				.message-content {
					.readBoxYou {
						font-size: 20rpx;
					}
				}
			}

			&.me {
				.message-content {
					.readBox {
						left: -100rpx;
						font-size: 20rpx;
					}
				}
			}
		}
	}
</style>
