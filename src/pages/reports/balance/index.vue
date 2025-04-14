<template>
	<section class="balance-report">
		<Report entity_type="balance-report" content_type="reports.balancereport" />
	</section>
</template>

<script setup>
	import Report from '~/components/common/Report/Report.vue';

	definePageMeta({
		middleware: 'auth',
		bread: [
			{
				text: 'Balance Report',
				to: '/reports/balance',
				disabled: true
			}
		]
	});
</script>

<style scoped lang="scss">
	.balance-report {
		position: relative;
		width: 100%;
		height: 100%;
	}
</style>

<style lang="scss">
	.v-overlay-container {
		.v-overlay,
		.v-overlay.v-menu {
			.v-overlay__content {
				border-radius: 4px !important;

				& > div {
					border-radius: 4px !important;
				}
			}
		}
	}
</style>
