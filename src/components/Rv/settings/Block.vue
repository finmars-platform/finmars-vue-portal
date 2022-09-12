<template>
	<div>
		<h5 class="rs_block_h">{{ props.title }}</h5>

		<div class="rs_block_content flex-column">
			<slot />
		</div>
	</div>
</template>

<script setup>
	let props = defineProps({
		title: String
	})


</script>

<style lang="scss" scoped>
 .rs_block_h {
	font-size: 16px;
	margin-bottom: 15px;
	font-weight: 600;
 }

 .rs_block_content {
 }
</style>
