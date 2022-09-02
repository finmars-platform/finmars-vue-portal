<template>
	<div :class="['icon', {primary, btn, 'btn-primary': btnPrimary}]" :style="{fontSize: size + 'px'}">
		<div class="material-icons">{{ icon }}</div>

		<div class="tooltip" v-if="tooltip">{{ tooltip }}</div>
	</div>
</template>

<script setup>
	let props = defineProps({
		icon: String,
		size: String,
		tooltip: String,
		primary: Boolean,
		btn: Boolean,
		btnPrimary: Boolean
	})
</script>

<style lang="scss" scoped>
	.icon {
		position: relative;
		display: block;
		cursor: pointer;
		transition: color, background  0.3s;
		font-size: 24px;
		line-height: 0;
		color: $text-lighten;

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
		&.btn-primary {
			background: $primary;
			color: $white;
			padding: 7px;
			border-radius: 50%;

			&:hover {
				background: $primary-lighten;
			}
		}
		&.primary {
			color: $primary;

			&:hover {
				color: $primary-lighten;
			}
		}
		&.primary {
			color: $primary;

			&:hover {
				color: $primary-lighten;
			}
		}
		&.btn {
			padding: 7px;
			border-radius: 50%;

			&:hover {
				background: $main-darken-hover;
			}
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
		height: 15px;
		line-height: 15px;
		border-radius: 4px;
		font-size: 10px;
		opacity: 0;
		visibility: hidden;
		transition: 0.3s;
		white-space: nowrap;
	}
</style>
