<template>
	<button
		:class="['fm_btn', { icon }, type]"
		@click="to ? $router.push(to) : ''"
	>
		<div v-if="icon" :class="`icon material-icons`">{{ icon }}</div>
		<slot />
	</button>
</template>

<script setup>
	let props = defineProps({
		label: String,
		icon: String,
		to: String,
		/**
		 * Type of button
		 * @values primary, basic, text, action, icon
		 */
		type: {
			type: String,
			default: 'primary',
		},
	})
</script>

<style lang="scss" scoped>
	$height: 36px;
	.fm_btn {
		height: $height;
		line-height: $height;
		padding: 0 16px;
		min-width: 64px;
		border-radius: 4px;
		text-transform: uppercase;
		font-weight: 500;
		font-size: 14px;
		letter-spacing: 0.4px;
		transition: 0.3s;
		user-select: none;

		&.basic {
			color: $primary;

			&:not([disabled]):hover {
				background: $primary-lighten-2;
			}
		}
		&.primary {
			background: $primary;
			color: $separ;

			&:not([disabled]):hover {
				background: $primary-darken;
			}
		}
		&.plain {
			padding: 0;
			background: transparent !important;
			height: auto;
			line-height: 1.5;
			&:not([disabled]):hover {
				color: $text;
			}
		}
		&.text {
			color: $text;

			&:not([disabled]):hover {
				background: $main-darken-hover;
			}
			&:not([disabled]).active {
				background: $main-darken-hover;
			}
		}
		&.action {
			color: $primary;

			.icon {
				color: $primary !important;
			}

			&:not([disabled]):hover {
				background: $primary-lighten-2;
			}
		}
		&.icon {
			padding: 0;
			min-width: 0;
			height: auto;

			&.primaryIcon {
				color: $primary;

				.icon {
					color: $primary;
				}
			}
		}
		&[disabled] {
			cursor: default;
			opacity: 0.6;

			&.primary {
				background: $primary-lighten;
				opacity: 1;
			}
		}
	}
	.fm_btn.icon {
		display: flex;
		align-items: center;

		.icon {
			color: $text-lighten;
		}

		&:not(.icon) .icon {
			margin-right: 7px;
		}
	}
</style>
