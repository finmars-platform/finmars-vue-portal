<template>
	<div class="wrap">
		<iframe
			:src="component.settings[0].default_value"
			width="100%"
			height="100%"
			frameborder="0"
		></iframe>
	</div>
</template>

<script setup>
	const props = defineProps({
		wid: String,
	})

	const dashStore = useStoreDashboard()
	let component = dashStore.getWidget(props.wid)
	console.log('component:', component)
</script>

<style lang="scss" scoped>
	.wrap {
		border-radius: 5px;
		border: 1px solid $border;
	}
	.title {
		height: 36px;
		line-height: 36px;
		background: $main-darken;
		padding: 0 20px;
	}
	.log_wrap {
		padding: 15px;
	}
</style>
