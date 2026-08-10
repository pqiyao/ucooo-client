<template>
	<view class="">
		<!-- 导航栏 -->
		<view class="navbar">
			<view class="navbar-content">
				<view class="navbar-title">{{allText.动态页聊天页.聊天}}</view>
			<!-- 	<view class="navbar-right">
					<view class="online-status-toggle" @tap="toggleOnlineStatus">
						<view class="status-indicator" :class="{'online': currentUserOnlineStatus === '1', 'offline': currentUserOnlineStatus === '2'}"></view>
						<text class="status-text">{{currentUserOnlineStatus === '1' ? allText.动态页聊天页.在线 : allText.动态页聊天页.隐身}}</text>
					</view>
				</view> -->
			</view>
		</view>

		<view class=""
			style="display: flex;align-items: flex-start;justify-content: space-between;padding: 20rpx 25rpx;border-bottom: 1rpx solid #F5F5F5;"
			@tap="util.urlTo('/pages/chat/systemmsg')">
			<view class="" style="display: flex;align-items: center;">
				<image src="/static/chat/c0.png" mode=""
					style="width: 100rpx;height: 100rpx;border-radius: 50%;"></image>
				<view class="" style="padding-left: 20rpx;">
					<view class="" style="font-size: 30rpx;font-weight: bold;">
						{{allText.动态页聊天页.系统公告}}
					</view>
					<view class="" style="font-size: 26rpx;color: #666666;padding-top: 20rpx;">
						{{allText.动态页聊天页.欢迎使用}}
					</view>
				</view>
			</view>
			<view class="" style="font-size: 26rpx;color: #858585;padding-top: 15rpx;">
				<!-- 8:50 -->
			</view>
		</view>
		<!-- 官方客服 -->
		<view class=""
			style="display: flex;align-items: flex-start;justify-content: space-between;padding: 20rpx 25rpx;border-bottom: 1rpx solid #F5F5F5;"
			@tap="util.urlTo('/pages/chatNew/chatpage?id='+datadown.set_customer_service)">
			<!--  -->
			<view class="" style="display: flex;align-items: center;">
				<image src="/static/chat/c1.png" mode=""
					style="width: 100rpx;height: 100rpx;border-radius: 50%;"></image>
				<view class="" style="padding-left: 20rpx;">
					<view class="" style="font-size: 30rpx;font-weight: bold;">
						{{allText.动态页聊天页.官方客服}}
					</view>
					<view class="" style="font-size: 26rpx;color: #666666;padding-top: 20rpx;">
						{{allText.动态页聊天页.猜你所想}}
					</view>
				</view>
			</view>
			<view class="" style="font-size: 26rpx;color: #858585;padding-top: 15rpx;">
				<!-- 8:50 -->
			</view>
		</view>
		<view class="chat-container">
			<view class="chat-list">
				<view class="chat-item" v-for="(item, index) in newConversationsList" :key="item.id"
					@click="goChatpage(item)">
					<!-- 头像 -->
					<view class="avatar">
						<image :src="$getimgsrc(item.data.avatar)" mode="aspectFill"></image>
						<view class="unread-badge" v-if="item.unread">
							{{ item.unread > 99 ? '99+' : item.unread }}
						</view>
						<!-- 在线状态指示器 -->
						<view class="unread-status" v-show="item.hereNow === 'normal'" title="在线"></view>
						<view class="unread-status2" v-show="item.hereNow !== 'normal' && item.hereNow !== 'offline'" title="离线"></view>
						<view class="unread-status2" v-show="item.hereNow === 'offline'" title="隐身/离线"></view>
					</view>

					<!-- 内容区域 -->
					<view class="content">
						<view class="top-line">
							<text class="name">{{item.data.nickname}}</text>
							<text class="time">{{ item.lastMessage.timestamp | date('mm-dd hh:MM:ss') }}</text>
						</view>
						<view class="bottom-line">
							<view class="message" v-if="item.lastMessage.type == 'text' && !item.lastMessage.recaller">
								{{item.lastMessage.payload.text}}
							</view>
							<text class="message"
								v-else-if="item.lastMessage.type === 'image' && !item.lastMessage.recaller">
								{{`[${allText.动态页聊天页.图片}]`}}
							</text>
							<text class="message"
								v-else-if="item.lastMessage.type === 'video' && !item.lastMessage.recaller">
								{{`[${allText.动态页聊天页.视频}]`}}
							</text>
							<text class="message" v-else-if="item.lastMessage.type === 'liwu'">
								{{item.lastMessage.payload.name}}
							</text>
							<text class="message" v-else-if="item.lastMessage.type === 'tips'">
								{{`[${allText.动态页聊天页.违规提示}]`}}
							</text>
							<text class="message" v-else-if="item.lastMessage.recaller">
								{{allText.动态页聊天页.撤回了一条消息}}
							</text>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		mapState
	} from 'vuex'
	import chatService from '@/common/chatService.js'
	export default {
		data() {
			return {
				im: chatService.createAdapter(this.$goeasy.im, this.GoEasy),
				conversationsList: [], //原始会话列表
				newConversationsList: [], //添加在现状态的会话列表
				datadown: {}, //客服信息
				onlineStatusMap: {}, // 缓存后端返回的在线状态 map { uid: status }
				privacyStatusMap: {}, // 缓存隐身状态 map { user_id: online_status }
				statusRequestTimer: null, // debounce 定时器
				conversationPageVisible: false,
				conversationListenerBound: false,
				currentUserOnlineStatus: '1', // 当前用户在线状态 1=在线 2=隐身
			}
		},
		computed: {
			...mapState(['user', 'token','unreadTotal'])
		},
		onLoad() {
			this.getkefu()
			this.getCurrentUserOnlineStatus() // 获取当前用户在线状态
			//更新个人信息
			this.util.request('user/user_info', {
				token: this.token
			}).then(res => {
				this.$store.commit('setuser', res)
			})
			uni.$on('refMessage', item => {
				if (Array.isArray(item)) {
				  // 先更新Socket在线状态
				  this.setMessageList(item);
				  // 然后获取隐身状态并重新应用
				  this.getSetOnline()
				} else {
				  // 如果不是数组就不处理
				  // console.warn('refMessage 非数组数据，忽略', item);
				  // 但仍然需要重新获取隐身状态
				  this.getSetOnline()
				}
			})
		},
		onShow() {
			this.conversationPageVisible = true;
			uni.$emit('selfChatConversationPageVisibility', true);
			this.bindConversationUpdates();
			this.getlastList();
		},
		onHide() {
			this.conversationPageVisible = false;
			uni.$emit('selfChatConversationPageVisibility', false);
			this.unbindConversationUpdates();
		},
		onUnload() {
			this.conversationPageVisible = false;
			uni.$emit('selfChatConversationPageVisibility', false);
			// 清理定时器
			if (this.statusRequestTimer) {
				clearTimeout(this.statusRequestTimer);
				this.statusRequestTimer = null;
			}
			// 移除事件监听
			uni.$off('refMessage');
			this.unbindConversationUpdates();
		},
		methods: {
			bindConversationUpdates() {
				if (this.conversationListenerBound || !this.im) return
				this.im.on(this.GoEasy.IM_EVENT.CONVERSATIONS_UPDATED, this.onConversationsUpdated)
				this.conversationListenerBound = true
			},
			unbindConversationUpdates() {
				if (!this.conversationListenerBound || !this.im) return
				this.im.off(this.GoEasy.IM_EVENT.CONVERSATIONS_UPDATED, this.onConversationsUpdated)
				this.conversationListenerBound = false
			},
			//获取用户是否为隐身和在线
			getSetOnline(){
				const user_ids = (this.conversationsList || []).map(item => item.userId).filter(Boolean);
				if (!user_ids.length) {
					return;
				}

				this.util.request('user/getSetOnline', {
					user_ids:user_ids.join()
				}).then(res => {
					//online 1为在线 2为隐身
					if (res && Array.isArray(res)) {
						// 处理隐身状态数据
						this.processPrivacyStatus(res);
					} else {
						// console.error('getSetOnline API返回数据格式错误:', res);
					}
				}).catch(err => {
					// console.error('获取隐身状态失败:', err);
				})
			},
			//处理隐身状态数据
			processPrivacyStatus(privacyData) {
				// 更新隐身状态缓存
				this.privacyStatusMap = {};
				privacyData.forEach(item => {
					// 确保数据类型一致，转换为字符串
					const userId = String(item.user_id);
					const onlineStatus = String(item.online);
					this.privacyStatusMap[userId] = onlineStatus; // 1为在线 2为隐身
				});

				// 				// 
				// 应用隐身状态到当前会话列表
				this.applyPrivacyStatusToList();
			},
			//处理会话列表，添加在线状态
			setMessageList(onlineStatusList = null) {
			    if (!Array.isArray(this.conversationsList)) {
			      this.$set(this, 'newConversationsList', []);
			      return;
			    }

			    // 读取上一次的状态 map，便于保持旧状态
			    const prevMap = {};
			    (this.newConversationsList || []).forEach(i => {
			      prevMap[String(i.userId)] = i.hereNow || '';
			    });

			    // 如果收到了后端在线状态数组，则更新在线缓存
			    if (Array.isArray(onlineStatusList) && onlineStatusList.length) {
			      this.onlineStatusMap = {}; // 重建 map
			      onlineStatusList.forEach(u => {
			        this.onlineStatusMap[String(u.uid)] = u.status;
			      });
			    }

			    // 构建新的列表，但优先保留 prev 状态，只有当 server 明确存在状态时才覆盖
			    const newList = this.conversationsList.map(item => {
			      const newItem = { ...item };
			      const prevStatus = prevMap[String(item.userId)] || '';
			      const serverStatus = this.onlineStatusMap[String(item.userId)]; // undefined 表示服务器未返回
			      const finalStatus = typeof serverStatus !== 'undefined' ? serverStatus : prevStatus;

			      // 设置在线状态，但需要考虑隐身设置
			      newItem.hereNow = finalStatus;

			      return newItem;
			    });

			    // 对聊天列表进行排序：在线且有未读消息 > 在线 > 离线且有未读消息 > 离线
			    const sortedList = this.sortChatList(newList);

			    this.$set(this, 'newConversationsList', sortedList);
			    // 
			    // 在设置完socket状态后，重新应用隐身状态逻辑
			    this.applyPrivacyStatusToList();
			  },

			  //对聊天列表进行排序
			  sortChatList(list) {
			    return list.sort((a, b) => {
			      // 获取在线状态：normal表示在线，其他表示离线
			      const aIsOnline = a.hereNow === 'normal';
			      const bIsOnline = b.hereNow === 'normal';
			      
			      // 获取未读消息数量
			      const aHasUnread = a.unread && a.unread > 0;
			      const bHasUnread = b.unread && b.unread > 0;
			      
			      // 计算优先级：在线且有未读消息(4) > 在线(3) > 离线且有未读消息(2) > 离线(1)
			      const aPriority = aIsOnline ? (aHasUnread ? 4 : 3) : (aHasUnread ? 2 : 1);
			      const bPriority = bIsOnline ? (bHasUnread ? 4 : 3) : (bHasUnread ? 2 : 1);
			      
			      // 按优先级降序排列
			      if (aPriority !== bPriority) {
			        return bPriority - aPriority;
			      }
			      
			      // 优先级相同时，按最后消息时间降序排列（最新的在前）
			      const aTime = a.lastMessage ? a.lastMessage.timestamp : 0;
			      const bTime = b.lastMessage ? b.lastMessage.timestamp : 0;
			      return bTime - aTime;
			    });
			  },

			  //应用隐身状态到会话列表
			  applyPrivacyStatusToList() {
			    // 			    // 			    // 
			    // 如果有缓存的隐身状态数据，重新应用
			    if (this.privacyStatusMap && Object.keys(this.privacyStatusMap).length > 0) {
			      this.newConversationsList.forEach((conversation) => {
			        const userId = String(conversation.userId);
			        const privacyStatus = this.privacyStatusMap[userId];
			        const originalStatus = conversation.hereNow;

			        // 
			        // 如果用户设置了隐身(2)，则强制显示为离线状态
	        if (privacyStatus === '2') {
	          const oldStatus = conversation.hereNow;
	          conversation.hereNow = 'offline';
	        } else if (privacyStatus === '1') {
	          // 用户设置为在线，保持socket返回的实际状态
	        } else {
	        }
	      });

			      // 重新排序聊天列表
			      const sortedList = this.sortChatList(this.newConversationsList);
			      this.$set(this, 'newConversationsList', sortedList);
			      
	      // 强制更新视图
	      this.$forceUpdate();
	    } else {
	    }
			  },
			//进入会话
			goChatpage(item) {
				// 参数验证：确保item和userId有效
				if (!item || !item.userId) {
					console.error('goChatpage: 无效的用户ID', item);
					uni.showToast({
						title: '用户信息异常，请重试',
						icon: 'none'
					});
					return;
				}
				
				// 记录跳转日志
								
				uni.navigateTo({
					url: '/pages/chatNew/chatpage?id=' + encodeURIComponent(item.userId)
				});
			},
			//查询当前的用户列表在线状态
			seeUserStatus() {
			    if (this.statusRequestTimer) clearTimeout(this.statusRequestTimer);
			    this.statusRequestTimer = setTimeout(() => {
			      const user_ids = (this.conversationsList || []).map(item => item.userId).filter(Boolean);
			      if (!user_ids.length) return;
			      this.$socket.send({
			        uid: this.user.user_id,
			        user_ids: user_ids.join()
			      });
			    }, 200); // 200ms 防抖，可根据需要调整
			  },
			//会话监听回调函数
			onConversationsUpdated(conversations) {
				if (!this.conversationPageVisible) return;
			    this.conversationsList = conversations.conversations || [];
			    uni.setStorageSync('conversationsList', this.conversationsList);

			    // 先设置消息列表（保留旧状态）
			    this.setMessageList(null);

			    // 然后获取隐身状态并应用
			    this.getSetOnline();

			    // 请求最新在线状态（debounce 内部处理）
			    this.seeUserStatus();
			    this.$store.commit('setUnreadTotal', conversations.unreadTotal);
			  },
			//获取会话列表
			getlastList() {
			    this.im.latestConversations({
			      onSuccess: (result) => {
					if (!this.conversationPageVisible) return;
					this.conversationsList = result.content.conversations || [];
			        uni.setStorageSync('conversationsList', this.conversationsList);

			        // 先设置消息列表（保留以前状态）
			        this.setMessageList(null);

			        // 然后获取隐身状态并应用
			        this.getSetOnline();

			        // 请求最新在线状态
			        this.seeUserStatus();
			        this.$store.commit('setUnreadTotal', result.content.unreadTotal);
			      },
			      onFailed: (error) => {
			        if (!this.conversationPageVisible) return;
			      }
			    });
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

			//获取当前用户的在线状态
			getCurrentUserOnlineStatus() {
				this.util.request('user/user_info', {
					token: this.token
				}).then(res => {
					this.currentUserOnlineStatus = res.on_line || '1';
				}).catch(err => {
					console.error('获取当前用户在线状态失败:', err);
				})
			},

			//切换当前用户在线状态
			toggleOnlineStatus() {
				const newStatus = this.currentUserOnlineStatus === '1' ? '2' : '1';
				const statusText = newStatus === '1' ? '在线' : '隐身';

				uni.showModal({
					title: '切换状态',
					content: `确定要切换到${statusText}状态吗？`,
					success: (res) => {
						if (res.confirm) {
							this.setUserOnlineStatus(newStatus);
						}
					}
				});
			},

			//设置用户在线状态
			setUserOnlineStatus(status) {
				uni.showLoading({
					title: 'Loading...',
					mask: true
				});

				this.util.request('user/setOnline', {
					token: this.token,
					on_line: status
				}, 'POST').then(res => {
					uni.hideLoading();
					if (res.code == 1) {
						this.currentUserOnlineStatus = status;
						const statusText = status === '1' ? '在线' : '隐身';
						uni.showToast({
							title: `已切换到${statusText}状态`,
							icon: 'success'
						});

						// 重新获取会话列表的隐身状态，因为当前用户状态可能影响其他用户看到的状态
						
						// 延迟一下再获取，确保后端状态已更新
						setTimeout(() => {
							this.getSetOnline();
						}, 500);
					} else {
						uni.showToast({
							title: res.msg || '设置失败',
							icon: 'none'
						});
					}
				}).catch(err => {
					uni.hideLoading();
					console.error('设置在线状态失败:', err);
					uni.showToast({
						title: '设置失败，请重试',
						icon: 'none'
					});
				})
			},



		}
	}
</script>

<style lang="scss" scoped>
	/* 导航栏样式 */
	.navbar {
		background-color: #ffffff;
		border-bottom: 1rpx solid #f0f0f0;
		position: sticky;
		top: 0;
		z-index: 100;
		padding-top: var(--status-bar-height, 0px);

		.navbar-content {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 20rpx 30rpx;
			height: 88rpx;

			.navbar-title {
				font-size: 36rpx;
				font-weight: bold;
				color: #333333;
				flex: 1;
				text-align: center;
			}

			.navbar-right {
				position: absolute;
				right: 30rpx;

				.online-status-toggle {
					display: flex;
					align-items: center;
					padding: 12rpx 20rpx;
					background-color: #f8f8f8;
					border-radius: 30rpx;
					border: 1rpx solid #e0e0e0;

					.status-indicator {
						width: 20rpx;
						height: 20rpx;
						border-radius: 50%;
						margin-right: 12rpx;

						&.online {
							background-color: #00ff00;
						}

						&.offline {
							background-color: #c3c3c3;
						}
					}

					.status-text {
						font-size: 26rpx;
						color: #666666;
					}
				}

				.online-status-toggle:active {
					background-color: #eeeeee;
				}
			}
		}
	}

	.chat-container {
		display: flex;
		flex-direction: column;

		.search-bar {
			padding: 15rpx 30rpx;
			background-color: #ffffff;
		}

		.chat-list {
			flex: 1;
			overflow: hidden;

			.chat-item {
				display: flex;
				padding: 20rpx 30rpx;
				background-color: #fff;
				border-bottom: 1rpx solid #f0f0f0;

				.avatar {
					position: relative;
					width: 100rpx;
					height: 100rpx;
					margin-right: 20rpx;

					image {
						width: 100%;
						height: 100%;
						border-radius: 10rpx;
						border-radius: 50%;
					}

					.unread-badge {
						position: absolute;
						top: -10rpx;
						right: -10rpx;
						min-width: 36rpx;
						height: 36rpx;
						line-height: 36rpx;
						text-align: center;
						background-color: #f56c6c;
						color: #fff;
						border-radius: 18rpx;
						font-size: 20rpx;
						padding: 0 8rpx;
					}

					.unread-status {
						position: absolute;
						bottom: -10rpx;
						right: -10rpx;
						width: 30rpx;
						height: 30rpx;
						background-color: #00ff00;
						color: #fff;
						border-radius: 18rpx;
						font-size: 20rpx;
						padding: 0 8rpx;
					}

					.unread-status2 {
						position: absolute;
						bottom: -10rpx;
						right: -10rpx;
						width: 30rpx;
						height: 30rpx;
						background-color: #c3c3c3;
						color: #fff;
						border-radius: 18rpx;
						font-size: 20rpx;
						padding: 0 8rpx;
					}
				}

				.content {
					flex: 1;
					display: flex;
					flex-direction: column;
					justify-content: space-between;

					.top-line {
						display: flex;
						justify-content: space-between;

						.name {
							font-size: 32rpx;
							color: #333;
							max-width: 400rpx;
							overflow: hidden;
							text-overflow: ellipsis;
							white-space: nowrap;
						}

						.time {
							font-size: 24rpx;
							color: #999;
						}
					}

					.bottom-line {
						.message {
							font-size: 28rpx;
							color: #999;
							max-width: 450rpx;
							overflow: hidden;
							text-overflow: ellipsis;
							white-space: nowrap;
						}
					}
				}
			}

			.load-more,
			.no-more {
				text-align: center;
				padding: 20rpx;
				font-size: 28rpx;
				color: #999;
			}
		}
	}
</style>
