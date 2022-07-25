<template>
	<div class="fm_card">
		<div class="fm_card_title" v-if="title">{{ title }}</div>
		<slot></slot>
	</div>
</template>

<script setup>
	defineProps({
		title: String
	})
</script>

<style lang="scss" scoped>
	.fm_card {
		background: $separ;
		box-shadow: 0 1px 4px rgb(103 102 102 / 25%);
		border-radius: 4px;
		padding: 20px;
		margin-bottom: $content-padding-x;

		&.fm_card_text {
			background: none;
			box-shadow: none;
		}
	}
</style>
