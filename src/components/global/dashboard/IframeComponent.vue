<template>
	<div class="wrap">
		<iframe
			:src="component.settings.url.default_value"
			width="100%"
			height="100%"
			frameborder="0"
		></iframe>
	</div>
</template>

<script setup>
	const props = defineProps({
		uid: String,
	})

	const dashStore = useStoreDashboard()
	let component = dashStore.getComponent(props.uid)
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
		background: var(--table-header-background-color);
		padding: 0 20px;
	}
	.log_wrap {
		padding: 15px;
	}
</style>
