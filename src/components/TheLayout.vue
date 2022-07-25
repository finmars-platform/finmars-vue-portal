<template>
	<div class="wrap">
		<TheSidebar v-if="isShowSidebar" />

		<div class="main">
			<TheHeader />

			<div class="content">
				<slot />
			</div>
		</div>
	</div>
</template>

<script setup>
	defineProps({
		isShowSidebar: {
			type: Boolean,
			default: true
		}
	})
</script>

<style lang="scss" scoped>
.wrap {
	display: flex;
}
.main {
	flex-grow: 1;
	background: $main;
}
.content {
	height: calc(100vh - 56px);
	overflow: auto;
}
</style>
