<template>
	<div class="progress-linear">
		<div class="progress-linear__bar" :style="{ width: progress + '%' }"></div>
	</div>
</template>

<script setup>
	defineProps({
		progress: {
			type: Number,
			required: true
		}
	})
</script>

<style scoped lang="scss">
	.progress-linear {
		width: 100%;
		height: 12px;
		background-color: #4c334d;
		border-radius: 6px;
		overflow: hidden;

		&__bar {
			height: 100%;
			background-color: #f4af8b;
			transition: width 0.3s ease;
		}
	}
</style>
