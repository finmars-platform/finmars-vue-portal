<template>
	<section class="balance-report">
		<ReportHeader
			:entity-type="entityType"
			:content-type="contentType"
			:disabled="isLoading"
			@set:layout="(ev) => console.log('SET LAYOUT AS DEFAULT: ', ev)"
			@select:layout="(ev) => console.log('SELECT LAYOUT', ev)"
		/>

		<div class="balance-report__content">CONTENT</div>

		<div v-if="isLoading" class="balance-report__loader">
			<FmProgressCircular indeterminate size="100" />
		</div>
	</section>
</template>

<script setup>
	import { onBeforeMount, ref } from 'vue';
	import { FmProgressCircular } from '@finmars/ui';
	import { useBalanceReportStore } from '~/stores/useBalanceReportStore';
	import ReportHeader from '~/components/pages/reports/common/ReportHeader/ReportHeader.vue';

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

	const { getLayouts, getCurrencies, prepareReportLayoutOptions } = useBalanceReportStore();

	const entityType = 'balance-report';
	const contentType = 'reports.balancereport';
	const isLoading = ref(false);

	onBeforeMount(async () => {
		console.log('=== ON BEFORE MOUNT ===');
		try {
			isLoading.value = true;
			await getLayouts(entityType);
			await getCurrencies();

			prepareReportLayoutOptions();
		} finally {
			isLoading.value = false;
		}
	});
</script>

<style scoped lang="scss">
	.balance-report {
		position: relative;
		width: 100%;
		height: 100%;
		color: var(--on-surface);

		&__content {
			position: relative;
			width: 100%;
			height: calc(100% - 130px);
		}

		&__loader {
			position: absolute;
			inset: 0;
			z-index: 5;
			pointer-events: none;
			display: flex;
			justify-content: center;
			align-items: center;
		}
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
