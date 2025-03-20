<template>
	<section class="balance-report">
		<ReportHeader
			:entity-type="entityType"
			:content-type="contentType"
			:disabled="isLoading"
			@header:action="processAction"
		/>

		<div class="balance-report__content">
			<ReportTable
				:current-layout="currentLayout"
				:table-data="tableData"
				:sort-group="sortGroup"
				:sort-column="sortColumn"
				@cell-resize="onCellResize"
			/>
		</div>

		<div v-if="isLoading" class="balance-report__loader">
			<FmProgressCircular indeterminate size="100" />
		</div>
	</section>
</template>

<script setup>
	import { onBeforeMount, ref } from 'vue';
	import { storeToRefs } from 'pinia';
	import get from 'lodash/get';
	import set from 'lodash/set';
	import { FmProgressCircular } from '@finmars/ui';
	import { useAttributes } from '~/stores/useAttributes';
	import { useBalanceReportStore } from '~/stores/useBalanceReportStore';
	// import { getLayoutByUserCode } from '~/services/entity/entityViewerHelperService';
	import ReportHeader from '~/components/pages/reports/common/ReportHeader/ReportHeader.vue';
	import ReportTable from '~/components/pages/reports/common/ReportTable/ReportTable.vue';

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
	const {
		changeRouteQuery,
		getLayouts,
		getCurrencies,
		getGroupList,
		getItemList,
		prepareTableDataRequestOptions,
		getTableData
	} = balanceReportStore;
	const { currentLayout, sortGroup, sortColumn, tableData } = storeToRefs(balanceReportStore);

	const {
		downloadCustomFieldsByEntityType,
		downloadDynamicAttributesByEntityType,
		downloadInstrumentUserFields
	} = useAttributes();

	const entityType = 'balance-report';
	const contentType = 'reports.balancereport';
	const isLoading = ref(false);

	async function processAction({ action, payload }) {
		console.log('processAction => ', action, payload);
		switch (action) {
			case 'layout:select':
				try {
					isLoading.value = true;
					currentLayout.value = payload;
					await changeRouteQuery(entityType);
					tableData.value = [];
					await loadTableData();
				} finally {
					isLoading.value = false;
				}
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

	async function loadTableData() {
		const options = prepareTableDataRequestOptions({});
		console.log('!!! OPTIONS => ', options, !!options.frontend_request_options.groups_types.length);
		await getTableData(
			options.frontend_request_options.groups_types.length ? 'group' : 'items',
			entityType,
			options
		);
	}

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
