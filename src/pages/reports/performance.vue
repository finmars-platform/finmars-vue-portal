<template>
	<RvPerformance />
</template>

<script setup>
	definePageMeta({
		middleware: 'auth',
		bread: [
			{
				text: 'Performance Report',
				to: '/reports/performance',
				disabled: true
			}
		],
	});

</script>

<style lang="scss" scoped>
</style>
