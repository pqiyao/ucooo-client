<template>
	<view class="settings-page">
		<view class="settings-hero">
			<view class="settings-title">我的设置</view>
		</view>

		<view class="settings-card">
			<view class="card-title">账号管理</view>
			<view class="setting-row" @tap="util.urlTo('/pages/user/blackname')">
				<view class="row-left">
					<view class="row-text">
						<view class="row-title">黑名单</view>
					</view>
				</view>
				<u-icon name="arrow-right" color="#A4ABBA" size="28"></u-icon>
			</view>
			<view class="setting-row" @tap="util.urlTo('/pages/user/numanquan')">
				<view class="row-left">
					<view class="row-text">
						<view class="row-title">账号与安全</view>
					</view>
				</view>
				<u-icon name="arrow-right" color="#A4ABBA" size="28"></u-icon>
			</view>
		</view>

		<view class="settings-card">
			<view class="card-title">消息通知</view>
			<view class="setting-row" @tap="requestNotificationPermission">
				<view class="row-left">
					<view class="row-text">
						<view class="row-title">系统通知</view>
						<view class="row-desc">{{ notificationDesc }}</view>
					</view>
				</view>
				<u-icon name="arrow-right" color="#A4ABBA" size="28"></u-icon>
			</view>
		</view>

		<view class="settings-card">
			<view class="card-title">关于与协议</view>
			<view class="setting-row" @tap="checkForUpdate">
				<view class="row-left">
					<view class="row-text">
						<view class="row-title">检查更新</view>
						<view class="row-desc">{{ updateCheckDesc }}</view>
					</view>
				</view>
				<u-icon name="arrow-right" color="#A4ABBA" size="28"></u-icon>
			</view>
			<view class="setting-row" @tap="util.urlTo('/pages/user/aboutmy')">
				<view class="row-left">
					<view class="row-text">
						<view class="row-title">关于我们</view>
					</view>
				</view>
				<u-icon name="arrow-right" color="#A4ABBA" size="28"></u-icon>
			</view>
			<view class="setting-row" @tap="util.urlTo('/pages/user/tiaokuan/tiaokuan')">
				<view class="row-left">
					<view class="row-text">
						<view class="row-title">使用条款</view>
					</view>
				</view>
				<u-icon name="arrow-right" color="#A4ABBA" size="28"></u-icon>
			</view>
			<view class="setting-row" @tap="util.urlTo('/pages/user/yinshi/yinshi')">
				<view class="row-left">
					<view class="row-text">
						<view class="row-title">隐私协议</view>
					</view>
				</view>
				<u-icon name="arrow-right" color="#A4ABBA" size="28"></u-icon>
			</view>
		</view>

		<view class="settings-card">
			<view class="card-title">帮助服务</view>
			<view class="setting-row" @tap="util.urlTo('/pages/user/lianxiwomen/lianxiwomen')">
				<view class="row-left">
					<view class="row-text">
						<view class="row-title">联系我们</view>
					</view>
				</view>
				<u-icon name="arrow-right" color="#A4ABBA" size="28"></u-icon>
			</view>
		</view>

		<view class="logout-card" @tap="outlogin">退出登录</view>
	</view>
</template>

<script>
	import push from '@/common/push.js'
	import appUpdate from '@/common/appUpdate.js'

	export default {
		data() {
			return {
				notificationDesc: '用于后台和锁屏接收新消息提醒',
				currentVersionName: '',
				updateCheckDesc: '正在读取当前版本'
			}
		},
		onShow() {
			this.loadRuntimeVersion()
			this.refreshNotificationStatus()
		},
		methods: {
			loadRuntimeVersion() {
				appUpdate.getClientInfo().then(info => {
					this.currentVersionName = String(info.version_name || '')
					this.updateCheckDesc = '当前版本 V' + this.currentVersionName
				}).catch(() => {
					this.updateCheckDesc = '暂时无法读取版本信息'
				})
			},
			checkForUpdate() {
				this.updateCheckDesc = '正在检查新版本'
				appUpdate.manualCheck().then(result => {
					if (result && result.unsupported) {
						this.updateCheckDesc = '请在APP中检查更新'
						this.util.showToast('请在APP中检查更新')
						return
					}
					this.updateCheckDesc = result && result.has_update
						? '发现新版本'
						: '当前已是最新版本'
				}).catch(() => {
					this.updateCheckDesc = '检查失败，请稍后重试'
				})
			},
			loadServerPushStatus(cid) {
				const user = uni.getStorageSync('user') || {}
				if (!cid || !user.token) {
					return
				}
				this.util.request('user/push_status', { token: user.token, client_id: cid }).then(status => {
					if (!status || !status.current_client_bound) {
						this.notificationDesc = '设备通知通道正在绑定，请稍后重试'
						return
					}
					if (!status.webhook_configured || !status.secret_configured) {
						this.notificationDesc = '设备已绑定，服务端通知尚未配置'
						return
					}
					if (!status.gateway_reachable || !status.ready) {
						this.notificationDesc = '通知服务暂时不可用，请稍后重试'
						return
					}
					this.notificationDesc = '消息通知已就绪'
				}).catch(() => {
					this.notificationDesc = '暂时无法确认通知服务状态'
				})
			},
			refreshNotificationStatus() {
				// #ifdef APP-PLUS
				if (typeof plus === 'undefined') {
					this.notificationDesc = '请在APP中查看通知状态'
					return
				}
				if (typeof uni.getPushClientId !== 'function') {
					this.notificationDesc = 'uniPush模块未检测到，请检查打包配置'
					return
				}
				uni.getPushClientId({
					success: (res) => {
						const cid = res && (res.cid || res.clientid || res.clientId)
						this.notificationDesc = cid ? '设备通知通道已连接' : '正在获取uniPush通知通道'
						this.loadServerPushStatus(cid)
					},
					fail: () => {
						this.notificationDesc = 'uniPush通知通道未就绪，请检查打包配置'
					}
				})
				// #endif
				// #ifndef APP-PLUS
				this.notificationDesc = '请在APP中使用通知功能'
				// #endif
			},
			requestNotificationPermission() {
				// #ifdef APP-PLUS
				if (typeof plus === 'undefined') {
					return
				}
				if (plus.os.name === 'Android') {
					const Build = plus.android.importClass('android.os.Build')
					if (Build.VERSION.SDK_INT >= 33 && plus.android.requestPermissions) {
						plus.android.requestPermissions([
							'android.permission.POST_NOTIFICATIONS'
						], (result) => {
							const denied = []
								.concat((result && result.deniedPresent) || [])
								.concat((result && result.deniedAlways) || [])
							if (denied.length) {
								this.showNotificationSettingsGuide()
								return
							}
							push.bindPushClientId()
							this.util.showToast('通知权限已开启')
							this.refreshNotificationStatus()
						}, () => {
							this.showNotificationSettingsGuide()
						})
						return
					}
				}
				push.bindPushClientId()
				this.util.showToast('通知功能已开启')
				this.refreshNotificationStatus()
				// #endif
				// #ifndef APP-PLUS
				this.util.showToast('请在APP中使用通知功能')
				// #endif
			},
			showNotificationSettingsGuide() {
				uni.showModal({
					title: '开启通知',
					content: '请在系统设置中允许通知、横幅、声音和震动，后台和锁屏才能弹出消息提醒。',
					confirmText: '去设置',
					success: result => {
						if (result.confirm) {
							this.openAndroidNotificationSettings()
						}
					}
				})
			},
			openAndroidNotificationSettings() {
				// #ifdef APP-PLUS
				try {
					const main = plus.android.runtimeMainActivity()
					const Intent = plus.android.importClass('android.content.Intent')
					const Settings = plus.android.importClass('android.provider.Settings')
					const intent = new Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS)
					intent.putExtra(Settings.EXTRA_APP_PACKAGE, main.getPackageName())
					main.startActivity(intent)
				} catch (error) {
					this.util.showToast('请在系统设置的应用通知中手动开启')
				}
				// #endif
			},
			async outlogin() {
				try {
					await this.$store.dispatch('userout')
				} catch (error) {
					this.util.showToast('网络异常，无法安全退出，请稍后重试')
				}
			}
		}
	}
</script>

<style>
	page {
		background: #F4F8FE url(/static/home/homebg.png) no-repeat;
		background-size: 100% 100%;
	}

	.settings-page {
		min-height: 100vh;
		padding: 34rpx 24rpx 52rpx;
		box-sizing: border-box;
		background: url(/static/home/homebg.png) no-repeat;
		background-size: 100% 100%;
	}

	.settings-hero {
		padding: 34rpx 28rpx 30rpx;
		border-radius: 28rpx;
		background: rgba(255, 255, 255, 0.92);
		box-shadow: 0 16rpx 38rpx rgba(37,43,62,0.08);
	}

	.settings-title {
		font-size: 42rpx;
		font-weight: 800;
		color: #1F2433;
	}

	.settings-card {
		margin-top: 24rpx;
		padding: 24rpx 26rpx;
		border-radius: 26rpx;
		background: #FFFFFF;
		box-shadow: 0 14rpx 34rpx rgba(37,43,62,0.07);
	}

	.card-title {
		margin-bottom: 8rpx;
		font-size: 27rpx;
		font-weight: 800;
		color: #1F2433;
	}

	.setting-row {
		min-height: 104rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		border-bottom: 1rpx solid #EEF1F7;
	}

	.setting-row:last-child {
		border-bottom: 0;
	}

	.row-left {
		min-width: 0;
		display: flex;
		align-items: center;
	}

	.row-text {
		min-width: 0;
	}

	.row-title {
		font-size: 30rpx;
		font-weight: 700;
		color: #2B3040;
	}

	.row-desc {
		max-width: 500rpx;
		margin-top: 8rpx;
		font-size: 23rpx;
		color: #9BA3B3;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.logout-card {
		margin: 30rpx 0 0;
		height: 96rpx;
		border-radius: 24rpx;
		background: #FFFFFF;
		box-shadow: 0 14rpx 34rpx rgba(255,95,121,0.10);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 30rpx;
		font-weight: 800;
		color: #FF5F79;
	}
</style>
