<template>
	<view class="ucooo-progress" :style="trackStyle">
		<view class="ucooo-progress__value" :style="valueStyle"></view>
	</view>
</template>

<script>
export default {
	name: 'FuiSlider',
	props: {
		value: { type: [String, Number], default: 0 },
		min: { type: [String, Number], default: 0 },
		max: { type: [String, Number], default: 100 },
		width: { type: [String, Number], default: '100%' },
		height: { type: [String, Number], default: 8 },
		background: { type: String, default: '#eeeeee' },
		activeColor: { type: String, default: '#5A7EF6' },
		disabled: { type: Boolean, default: false }
	},
	computed: {
		percentage() {
			const min = Number(this.min) || 0
			const max = Number(this.max) || 100
			const value = Number(this.value) || 0
			if (max <= min) return 0
			return Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100))
		},
		trackStyle() {
			return {
				width: this.normalizeWidth(this.width),
				height: this.normalizeUnit(this.height),
				background: this.background,
				borderRadius: this.normalizeUnit(this.height)
			}
		},
		valueStyle() {
			return {
				width: this.percentage + '%',
				background: this.activeColor,
				borderRadius: this.normalizeUnit(this.height)
			}
		}
	},
	methods: {
		normalizeUnit(value) {
			return typeof value === 'number' || /^\d+(\.\d+)?$/.test(String(value)) ? value + 'rpx' : value
		},
		normalizeWidth(value) {
			return typeof value === 'number' || /^\d+(\.\d+)?$/.test(String(value)) ? value + 'px' : value
		}
	}
}
</script>

<style scoped>
.ucooo-progress {
	overflow: hidden;
	box-sizing: border-box;
}

.ucooo-progress__value {
	height: 100%;
	transition: width 0.2s ease;
}
</style>
