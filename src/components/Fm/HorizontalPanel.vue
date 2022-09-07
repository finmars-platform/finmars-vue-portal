<template>
	<div class="fm_container flex sb aic" :style="{height: height + 'px'}">
		<div class="flex aic">
			<slot name="leftActions" />
		</div>

		<div class="flex aic">
			<slot name="rightActions" />
		</div>
	</div>
</template>

<script setup>
	defineProps({
		height: {
			type: String,
			default: '50'
		}
	})
</script>

<style lang="scss" scoped>
	.fm_container {
		background: $separ;
		padding-top: 0;
		padding-bottom: 0;
		border-bottom: 1px solid $border;
		box-sizing: border-box;
	}
</style>
