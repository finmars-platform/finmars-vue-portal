<template>
	<section class="balance-report">
		<ReportHeader :entity-type="entityType" :content-type="contentType" :disabled="isLoading" />

		<div class="balance-report__content">CONTENT</div>

		<div v-if="isLoading" class="balance-report__loader">
			<FmProgressCircular indeterminate size="100" />
		</div>
	</section>
</template>

<script setup>
	import { onBeforeMount, ref } from 'vue';
	import { storeToRefs } from 'pinia';
	import { FmProgressCircular } from '@finmars/ui';
	import { useAttributes } from '~/stores/useAttributes';
	import { useBalanceReportStore } from '~/stores/useBalanceReportStore';
	import { getListLayoutByUserCode } from '~/services/entity/entityViewerHelperService';
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

	const balanceReportStore = useBalanceReportStore();
	const { getLayouts, getCurrencies } = balanceReportStore;
	const { currentLayout } = storeToRefs(balanceReportStore);

	const {
		downloadCustomFieldsByEntityType,
		downloadDynamicAttributesByEntityType,
		downloadInstrumentUserFields
	} = useAttributes();

	const entityType = 'balance-report';
	const contentType = 'reports.balancereport';
	const isLoading = ref(false);

	onBeforeMount(async () => {
		try {
			isLoading.value = true;
			await getLayouts(entityType);
			await getCurrencies();

			await Promise.allSettled([
				downloadCustomFieldsByEntityType('balance-report'),
				downloadCustomFieldsByEntityType('pl-report'),
				downloadCustomFieldsByEntityType('transaction-report'),
				downloadDynamicAttributesByEntityType('portfolio'),
				downloadDynamicAttributesByEntityType('account'),
				downloadDynamicAttributesByEntityType('instrument'),
				downloadDynamicAttributesByEntityType('responsible'),
				downloadDynamicAttributesByEntityType('counterparty'),
				downloadDynamicAttributesByEntityType('transaction-type'),
				downloadDynamicAttributesByEntityType('complex-transaction'),
				downloadInstrumentUserFields()
			]);


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
