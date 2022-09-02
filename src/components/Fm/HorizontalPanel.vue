<template>
	<div class="fm_container flex sb aic">
		<div class="flex aic">
			<slot name="leftActions" />
		</div>

		<div class="flex aic">
			<slot name="rightActions" />
		</div>
	</div>
</template>

<script setup>

</script>

<style lang="scss" scoped>
	.fm_container {
		background: $separ;
		padding-top: 0;
		padding-bottom: 0;
		// height: 65px;
		height: 100%;
		border-bottom: 1px solid $border;
		box-sizing: border-box;
	}
</style>
