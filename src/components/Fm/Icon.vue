<template>
	<div class="icon">
		<div :class="`material-icons${type ? '-' + type : ''}`">{{ icon }}</div>

		<div class="tooltip" v-if="tooltip">{{ tooltip }}</div>
	</div>
</template>

<script setup>
	let props = defineProps({
		icon: String,
		type: String,
		tooltip: String,
	})
</script>

<style lang="scss" scoped>
	.icon {
		position: relative;
		display: block;
		cursor: pointer;
		transition: color 0.3s;
		font-size: 24px;
		line-height: 0;

		&:hover {
			color: $text-hover;

			.tooltip {
				opacity: 0.8;
				visibility: visible;
			}
		}

		&.gray-icon {
			color: $grayIcon;
		}
	}
	.material-icons {
		font-size: inherit;
	}
	.tooltip {
		position: absolute;
		bottom: -18px;
		left: 50%;
		transform: translateX(-50%);
		color: rgb(230, 230, 230);
		background: rgb(26, 26, 26);
		padding: 0 6px;
		height: 12px;
		line-height: 12px;
		border-radius: 4px;
		font-size: 10px;
		opacity: 0;
		visibility: hidden;
		transition: 0.3s;

	}
</style>
