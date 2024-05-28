<template>
	<div
		:class="[
			'icon',
			{ primary, error, btn, disabled, 'btn-primary': btnPrimary },
		]"
		:style="{ fontSize: size + 'px' }"
	>
		<slot>
			<div class="material-icons">{{ icon }}</div>
		</slot>

		<!--		<div class="tooltip" v-if="tooltip">{{ tooltip }}</div>-->
	</div>
</template>

<script setup>
	let props = defineProps({
		icon: String,
		size: String,
		tooltip: String,
		primary: Boolean,
		error: Boolean,
		btn: Boolean,
		btnPrimary: Boolean,
		disabled: Boolean,
	})
</script>

<style lang="scss" scoped>
	.icon {
		position: relative;
		display: block;
		cursor: pointer;
		transition: color, background 0.3s;
		font-size: 24px;
		line-height: 0;
		color: var(--primary-color);
		overflow: hidden;
		user-select: none;

		&:not(.disabled):hover {
			color: var(--primary-hover);

			/*.tooltip {
				opacity: 0.8;
				visibility: visible;
			}*/
		}

		&.disabled {
			cursor: default;
		}
		&.gray-icon {
			color: $grayIcon;
		}
		&.btn-primary {
			background: $primary;
			color: var(--on-primary-color);
			padding: 7px;
			border-radius: 50%;

			&:hover {
				background: var(--primary-hover);
				color: var(--on-primary-color);
				// color: $white;
			}
		}
		&.primary {
			color: var(--primary-color);

			&:hover {
				color: var(--primary-hover);
			}
		}
		&.error {
			color: $error;
		}
		&.btn {
			padding: 7px;
			border-radius: 50%;

			&:hover {
				background: var(--state-active-background-color);
			}
		}
	}
	.material-icons {
		font-size: inherit;
		font-weight: inherit;
	}
	/*.tooltip {
		position: absolute;
		bottom: -18px;
		left: 50%;
		transform: translateX(-50%);
		color: rgb(230, 230, 230);
		background: rgb(26, 26, 26);
		padding: 3px 6px;
		// height: 15px;
		height: 20px;
		line-height: 15px;
		border-radius: 4px;
		font-size: 14px;
		opacity: 0;
		visibility: hidden;
		transition: 0.3s;
		white-space: nowrap;
	}*/
</style>
