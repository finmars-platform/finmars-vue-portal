<template>
	<div class="fm_card"
		:class="{with_controls: controls}"
	>
		<div class="fm_card_title" v-if="title">{{ title }}</div>
		<slot></slot>

		<div class="fm_card_actions flex justify-end">
			<slot name="controls"></slot>
		</div>
	</div>
</template>

<script setup>
	defineProps({
		title: String,
		controls: Boolean
	})
</script>

<style lang="scss" scoped>
	.fm_card {
		position: relative;
		background: $separ;
		box-shadow: 0 1px 4px hsl(0deg 0% 40% / 25%);
		border-radius: 4px;
		padding: 20px;
		margin-bottom: $content-padding-x;

		&.fm_card_text {
			background: none;
			box-shadow: none;
		}
	}
	.fm_card_actions {
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;
		padding: inherit;
		padding-bottom: 20px;
		padding-top: 0;
	}
	.with_controls {
		padding-bottom: 80px;
	}
</style>
