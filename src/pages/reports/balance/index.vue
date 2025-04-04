<template>
	<section class="balance-report">
		<ReportHeader
			:entity-type="entityType"
			:content-type="contentType"
			@header:action="processAction"
		/>

		<div class="balance-report__content">
			<ReportTable @cell-resize="onCellResize" />
		</div>

		<div v-if="isLoading" class="balance-report__loader">
			<FmProgressCircular indeterminate size="100" />
		</div>
	</section>
</template>

<script setup>
	/* eslint-disable no-case-declarations */
	import { inject, onBeforeMount } from 'vue';
	import { storeToRefs } from 'pinia';
	import get from 'lodash/get';
	import set from 'lodash/set';
	import { FmProgressCircular, FM_DIALOGS_KEY } from '@finmars/ui';
	import { useAttributes } from '~/stores/useAttributes';
	import { useMainReportStore } from '~/stores/useMainReportStore';
	// import { getLayoutByUserCode } from '~/services/entity/entityViewerHelperService';
	import ReportHeader from '~/components/pages/reports/common/ReportHeader/ReportHeader.vue';
	import ReportTable from '~/components/pages/reports/common/ReportTable/ReportTable.vue';
	import LayoutListView from '~/components/modal/LayoutListView/LayoutListView.vue';

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

	const dialogsSrv = inject(FM_DIALOGS_KEY);

	const mainReportStore = useMainReportStore();
	const {
		getLayouts,
		getCurrencies,
		loadTableData,
		saveLayout,
		selectLayout,
		saveAsLayout,
		renameLayout,
		makeLayoutDefault,
		deleteLayout
	} = mainReportStore;
	const { isLoading, entityType, contentType, currentLayout } = storeToRefs(mainReportStore);

	const {
		downloadCustomFieldsByEntityType,
		downloadDynamicAttributesByEntityType,
		downloadInstrumentUserFields
	} = useAttributes();

	entityType.value = 'balance-report';
	contentType.value = 'reports.balancereport';

	async function processAction({ action, payload }) {
		console.log('processAction => ', action, payload);
		switch (action) {
			case 'layout:create':
				// TODO
				break;
			case 'layout:select':
				await selectLayout(payload);
				break;
			case 'layout:save':
				await saveLayout();
				break;
			case 'layout:save-as':
				await saveAsLayout();
				break;
			case 'layout:rename':
				await renameLayout();
				break;
			case 'layout:make-default':
				await makeLayoutDefault(payload);
				break;
			case 'layout:open':
				dialogsSrv.$openDialog({
					component: LayoutListView,
					componentProps: {},
					dialogProps: {
						title: 'Layouts',
						width: 800,
						confirmButtonText: 'Open',
						onConfirm: async (layout) => {
							console.log('layout:open => ', layout);
						}
					}
				});
				break;
			case 'layout:delete':
				await deleteLayout(payload);
				break;
		}
	}

	function onCellResize({ type, item, width }) {
		if (type === 'group') {
			const index = get(currentLayout.value, ['data', 'grouping'], []).findIndex(
				(i) => i.___group_type_id === item.___group_type_id
			);
			index > -1 && set(currentLayout.value, ['data', 'grouping', index, 'style', 'width'], width);
		} else {
			const index = get(currentLayout.value, ['data', 'columns'], []).findIndex(
				(i) => i.___column_id === item.___column_id
			);
			index > -1 && set(currentLayout.value, ['data', 'columns', index, 'style', 'width'], width);
		}
	}

	onBeforeMount(async () => {
		try {
			isLoading.value = true;
			await getLayouts(entityType.value);
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

			// const l = await getLayoutByUserCode(entityType, currentLayout.value.user_code);
			// console.log('R L => ', l);

			await loadTableData();
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
		padding-bottom: 16px;

		&__content {
			position: relative;
			width: 100%;
			height: calc(100% - 130px);
			padding-right: 16px;
			overflow-x: auto;
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
