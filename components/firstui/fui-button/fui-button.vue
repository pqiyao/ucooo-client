<template>
	<button
		class="ucooo-button"
		:class="{ 'ucooo-button--disabled': disabled, 'ucooo-button--loading': loading }"
		:disabled="disabled || loading"
		:style="buttonStyle"
		@click="handleClick"
	>
		<text v-if="loading" class="ucooo-button__spinner"></text>
		<slot></slot>
	</button>
</template>

<script>
export default {
	name: 'FuiButton',
	props: {
		background: { type: String, default: '#5A7EF6' },
		disabledBackground: { type: String, default: '#d8d8d8' },
		color: { type: String, default: '#ffffff' },
		radius: { type: [String, Number], default: '10rpx' },
		disabled: { type: Boolean, default: false },
		loading: { type: Boolean, default: false }
	},
	computed: {
		buttonStyle() {
			return {
				background: this.disabled ? this.disabledBackground : this.background,
				color: this.color,
				borderRadius: this.normalizeUnit(this.radius)
			}
		}
	},
	methods: {
		normalizeUnit(value) {
			return typeof value === 'number' ? value + 'rpx' : value
		},
		handleClick(event) {
			if (!this.disabled && !this.loading) this.$emit('click', event)
		}
	}
}
</script>

<style scoped>
.ucooo-button {
	display: flex;
	align-items: center;
	justify-content: center;
	box-sizing: border-box;
	width: 100%;
	min-height: 88rpx;
	margin: 0;
	padding: 0 32rpx;
	border: 0;
	font-size: 28rpx;
	line-height: 1.2;
}

.ucooo-button::after {
	border: 0;
}

.ucooo-button--disabled {
	opacity: 0.75;
}

.ucooo-button__spinner {
	width: 28rpx;
	height: 28rpx;
	margin-right: 14rpx;
	border: 3rpx solid rgba(255, 255, 255, 0.45);
	border-top-color: currentColor;
	border-radius: 50%;
	animation: ucooo-button-spin 0.8s linear infinite;
}

@keyframes ucooo-button-spin {
	to { transform: rotate(360deg); }
}
</style>
