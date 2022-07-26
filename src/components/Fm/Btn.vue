<template>
	<button
		:class="['fm_btn', {icon: icon}, type]"
		:disabled="loading"
	>
		<div v-if="icon" :class="`icon material-icons`">{{ icon }}</div>
		<slot />
	</button>
</template>

<script setup>

	let props = defineProps({
		label: String,
		icon: String,
		loading: Boolean,
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
		$size: 40px;
		width: $size;
		min-width: $size;
		border-radius: 50%;
		height: $size;
		line-height: $size;
		padding: 0;
		padding-left: 1px;
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>
