<template>
	<view class="update-screen">
		<view class="update-mask"></view>
		<view class="update-panel" :class="{ 'is-force': isForce }">
			<view class="brand-mark">
				<image class="brand-image" src="/static/logo.png" mode="aspectFit"></image>
			</view>

			<view class="update-title">{{ release.title || copy.newVersion }}</view>
			<view class="version-meta">
				<text>V{{ release.target_version_name }}</text>
				<text v-if="packageSize"> · {{ packageSize }}</text>
			</view>

			<view class="notes-heading">{{ copy.releaseNotes }}</view>
			<scroll-view class="notes-list" scroll-y="true" :show-scrollbar="false">
				<view v-for="(note, index) in notes" :key="index" class="note-row">
					<view class="note-dot"></view>
					<text class="note-text">{{ note }}</text>
				</view>
			</scroll-view>

			<view v-if="isForce" class="force-hint">{{ copy.forceHint }}</view>
			<button class="primary-action" :loading="opening" :disabled="opening" @tap="updateNow">{{ actionLabel }}</button>

			<view v-if="!isForce" class="secondary-actions">
				<button class="secondary-action" @tap="later">{{ copy.later }}</button>
				<view v-if="release.can_ignore" class="action-divider"></view>
				<button v-if="release.can_ignore" class="secondary-action" @tap="ignoreVersion">{{ copy.ignore }}</button>
			</view>
		</view>
	</view>
</template>

<script>
	import appUpdate from '@/common/appUpdate.js'
	import updateText from '@/common/appUpdateText.js'

	export default {
		data() {
			return {
				release: {},
				copy: updateText.getCopy(updateText.getLanguageCode()),
				opening: false,
				leaving: false
			}
		},
		computed: {
			isForce() {
				return this.release.update_mode === 'force'
			},
			notes() {
				const notes = Array.isArray(this.release.release_notes) ? this.release.release_notes : []
				return notes.length ? notes : [this.copy.newVersion]
			},
			packageSize() {
				const bytes = Number(this.release.package_size || 0)
				return bytes > 0 ? (bytes / 1048576).toFixed(1) + ' MB' : ''
			},
			actionLabel() {
				if (this.release.download_strategy === 'browser') return this.copy.downloadUpdate
				if (this.release.channel === 'google_play') return this.copy.openGooglePlay
				if (this.release.channel === 'app_store') return this.copy.openAppStore
				return this.copy.updateNow
			}
		},
		onLoad() {
			const pending = uni.getStorageSync(appUpdate.keys.pending) || {}
			if (!pending.release) {
				this.leaving = true
				setTimeout(() => uni.navigateBack(), 0)
				return
			}
			this.release = pending.release
			this.copy = pending.copy || this.copy
		},
		onBackPress(event) {
			if (this.leaving && event && event.from === 'navigateBack') return false
			if (this.isForce) return true
			this.later()
			return true
		},
		onUnload() {
			appUpdate.onDialogClosed()
		},
		methods: {
			updateNow() {
				if (this.opening) return
				this.opening = true
				appUpdate.openRelease(this.release).catch(() => {
					uni.showToast({ title: this.copy.openFailed, icon: 'none' })
				}).then(() => {
					setTimeout(() => { this.opening = false }, 900)
				})
			},
			later() {
				if (this.isForce || this.leaving) return
				this.leaving = true
				appUpdate.snooze(this.release)
				uni.navigateBack()
			},
			ignoreVersion() {
				if (this.isForce || !this.release.can_ignore || this.leaving) return
				this.leaving = true
				appUpdate.ignore(this.release)
				uni.navigateBack()
			}
		}
	}
</script>

<style>
	page { background: transparent; }

	.update-screen {
		position: fixed;
		inset: 0;
		z-index: 99999;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: calc(32rpx + constant(safe-area-inset-top)) 32rpx calc(32rpx + constant(safe-area-inset-bottom));
		padding: calc(32rpx + env(safe-area-inset-top)) 32rpx calc(32rpx + env(safe-area-inset-bottom));
		box-sizing: border-box;
	}

	.update-mask {
		position: absolute;
		inset: 0;
		background: rgba(15, 18, 28, 0.58);
		animation: mask-in 180ms ease-out both;
	}

	.update-panel {
		position: relative;
		display: flex;
		flex-direction: column;
		width: calc(100vw - 64rpx);
		max-width: 680rpx;
		max-height: 86vh;
		padding: 34rpx 36rpx 24rpx;
		overflow: hidden;
		box-sizing: border-box;
		border: 1rpx solid rgba(90, 126, 246, 0.14);
		border-radius: 26rpx;
		background: #FFFFFF;
		box-shadow: 0 28rpx 72rpx rgba(19, 29, 54, 0.24);
		animation: panel-in 220ms cubic-bezier(.2, .8, .2, 1) both;
	}

	.brand-mark {
		width: 118rpx;
		height: 118rpx;
		margin: -82rpx auto 18rpx;
		padding: 8rpx;
		box-sizing: border-box;
		border: 6rpx solid #FFFFFF;
		border-radius: 24rpx;
		background: #F1F6FE;
		box-shadow: 0 14rpx 32rpx rgba(65, 90, 158, 0.18);
	}

	.brand-image { width: 100%; height: 100%; }

	.update-title {
		font-size: 36rpx;
		font-weight: 800;
		line-height: 48rpx;
		text-align: center;
		color: #1F2433;
		word-break: break-word;
	}

	.version-meta {
		margin-top: 8rpx;
		font-size: 24rpx;
		line-height: 34rpx;
		text-align: center;
		color: #98A1B3;
	}

	.notes-heading {
		margin-top: 30rpx;
		font-size: 27rpx;
		font-weight: 800;
		line-height: 38rpx;
		color: #2B3040;
	}

	.notes-list {
		flex: 1 1 240rpx;
		height: 240rpx;
		min-height: 116rpx;
		max-height: 30vh;
		margin-top: 12rpx;
		padding: 18rpx 20rpx;
		box-sizing: border-box;
		border-radius: 16rpx;
		background: #F5F8FD;
	}

	.note-row { display: flex; align-items: flex-start; padding: 7rpx 0; }
	.note-dot { flex: 0 0 auto; width: 10rpx; height: 10rpx; margin: 14rpx 18rpx 0 0; border-radius: 50%; background: #5A7EF6; }
	.note-text { flex: 1; min-width: 0; font-size: 27rpx; line-height: 40rpx; color: #515A6B; word-break: break-word; }

	.force-hint {
		flex: 0 0 auto;
		margin-top: 18rpx;
		font-size: 23rpx;
		line-height: 34rpx;
		text-align: center;
		color: #7C8596;
	}

	.primary-action {
		flex: 0 0 auto;
		height: 88rpx;
		margin-top: 24rpx;
		border: 0;
		border-radius: 18rpx;
		background: #5A7EF6;
		color: #FFFFFF;
		font-size: 29rpx;
		font-weight: 800;
		line-height: 88rpx;
		box-shadow: 0 14rpx 28rpx rgba(90, 126, 246, 0.24);
	}

	.primary-action::after, .secondary-action::after { border: 0; }
	.primary-action[disabled] { opacity: 0.72; }

	.secondary-actions {
		flex: 0 0 auto;
		height: 78rpx;
		margin-top: 8rpx;
		display: flex;
		align-items: center;
	}

	.secondary-action {
		flex: 1;
		height: 70rpx;
		padding: 0 8rpx;
		border: 0;
		background: transparent;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 23rpx;
		font-weight: 700;
		line-height: 30rpx;
		color: #6F788A;
		white-space: normal;
		word-break: break-word;
	}

	.action-divider { width: 1rpx; height: 30rpx; background: #E4E8F0; }

	@media screen and (max-height: 600px) {
		.update-screen {
			padding-top: calc(16rpx + env(safe-area-inset-top));
			padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
		}

		.update-panel {
			max-height: 94vh;
			padding-top: 24rpx;
		}

		.brand-mark {
			width: 92rpx;
			height: 92rpx;
			margin-top: -58rpx;
			margin-bottom: 10rpx;
		}

		.notes-heading { margin-top: 18rpx; }
		.notes-list { flex-basis: 150rpx; height: 150rpx; min-height: 90rpx; max-height: 22vh; }
		.primary-action { height: 76rpx; margin-top: 16rpx; line-height: 76rpx; }
		.secondary-actions { height: 64rpx; }
		.secondary-action { height: 60rpx; }
	}

	@media screen and (orientation: landscape) and (max-height: 600px) {
		.update-screen {
			align-items: stretch;
			padding: calc(10px + constant(safe-area-inset-top)) calc(16px + constant(safe-area-inset-right)) calc(10px + constant(safe-area-inset-bottom)) calc(16px + constant(safe-area-inset-left));
			padding: calc(10px + env(safe-area-inset-top)) calc(16px + env(safe-area-inset-right)) calc(10px + env(safe-area-inset-bottom)) calc(16px + env(safe-area-inset-left));
		}

		.update-panel {
			display: grid;
			grid-template-columns: minmax(0, 1fr) minmax(210px, .8fr);
			grid-template-rows: auto auto auto minmax(0, 1fr) auto auto;
			column-gap: 18px;
			width: min(720px, 100%);
			height: 100%;
			max-width: none;
			max-height: none;
			margin: auto;
			padding: 12px 16px 10px;
			border-radius: 14px;
		}

		.brand-mark {
			position: absolute;
			top: 12px;
			left: 16px;
			width: 46px;
			height: 46px;
			margin: 0;
			padding: 3px;
			border-width: 3px;
			border-radius: 10px;
		}

		.update-title {
			grid-column: 1;
			grid-row: 1;
			min-height: 28px;
			padding-left: 58px;
			font-size: 20px;
			line-height: 28px;
			text-align: left;
		}

		.version-meta {
			grid-column: 1;
			grid-row: 2;
			margin-top: 0;
			padding-left: 58px;
			font-size: 12px;
			line-height: 18px;
			text-align: left;
		}

		.notes-heading {
			grid-column: 1;
			grid-row: 3;
			margin-top: 8px;
			font-size: 13px;
			line-height: 20px;
		}

		.notes-list {
			grid-column: 1;
			grid-row: 4 / 7;
			align-self: stretch;
			width: auto;
			height: auto;
			min-height: 0;
			max-height: none;
			margin-top: 6px;
			padding: 7px 10px;
			border-radius: 8px;
		}

		.note-row { padding: 3px 0; }
		.note-dot { width: 5px; height: 5px; margin: 7px 9px 0 0; }
		.note-text { font-size: 13px; line-height: 19px; }

		.force-hint {
			grid-column: 2;
			grid-row: 4;
			align-self: end;
			margin: 0 0 8px;
			font-size: 12px;
			line-height: 18px;
		}

		.primary-action {
			grid-column: 2;
			grid-row: 5;
			width: 100%;
			height: 44px;
			margin: 0;
			border-radius: 10px;
			font-size: 14px;
			line-height: 44px;
		}

		.secondary-actions {
			grid-column: 2;
			grid-row: 6;
			height: 38px;
			margin-top: 2px;
		}

		.secondary-action {
			height: 36px;
			font-size: 12px;
			line-height: 16px;
		}
	}

	@keyframes mask-in { from { opacity: 0; } to { opacity: 1; } }
	@keyframes panel-in { from { opacity: 0; transform: translateY(24rpx) scale(.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
</style>
