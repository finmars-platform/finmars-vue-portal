<template>
	<div class="fm_tabs">
		<div class="fm_tabs_item"
			v-for="(tab, index) in tabs"
			:key="index"
			:class="{active: tab == modelValue}"
			@click="$emit('update:modelValue', tab)"
		>
			{{ tab }}
		</div>
	</div>
</template>

<script setup>
	defineProps({
		modelValue: String,
		tabs: Array
	})
	defineEmits(['update:modelValue'])
</script>

<style lang="scss">
	.fm_tabs {
		display: flex;
		background: $separ;
		border-bottom: 1px solid $border;
		height: 48px;
		line-height: 48px;

		&_item {
			height: inherit;
			line-height: inherit;
			padding: 0 $content-padding-x;
			text-transform: uppercase;
			font-size: 14px;
			letter-spacing: 0.4px;
			transition: background 0.3s;
			cursor: pointer;

			&:hover {
				background: $main-darken;
			}
			&.active {
				color: $primary;
				border-bottom: 2px solid $primary;

				&:hover {
					background: $primary-lighten-2;
				}
			}
		}
	}
</style>
