<template>
	<button
		:class="['fm_btn', { icon }, type]"
		:disabled="loading"
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
		loading: Boolean,
		/**
		 * Type of button
		 * @values primary, basic, text, action
		 */
		type: {
			type: String,
			default: 'primary'
		}
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
		transition: background 0.3s;

		&.basic {
			color: $primary;

			&:hover {
				background: $primary-lighten-2;
			}
		}
		&.primary {
			background: $primary;
			color: $separ;

			&:hover {
				background: $primary-darken;
			}
		}
		&.text {
			color: $text;

			&:hover {
				background: $main-darken-hover;
			}
			&.active {
				background: $main-darken-hover;
			}
		}
		&.action {
			color: $primary;

			&:hover {
				background: $primary-lighten-2;
			}
		}
		&[disabled] {
			background: $primary-lighten;

			&:hover {
				background: $primary-lighten;
			}
		}
	}
	.fm_btn.icon {
		display: flex;
		align-items: center;

		.icon {
			margin-right: 7px;
			color: $text-lighten;
		}
	}
</style>
