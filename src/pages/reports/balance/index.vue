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
	import { inject, onBeforeMount } from 'vue';
	import { storeToRefs } from 'pinia';
	import get from 'lodash/get';
	import set from 'lodash/set';
	import { FmProgressCircular, FM_DIALOGS_KEY } from '@finmars/ui';
	import useNotify from '~/composables/useNotify';
	import * as uiService from '~/services/uiService';
	import * as metaContentTypesService from '~/services/meta/metaContentTypeService';
	import { prepareTableDataRequestOptions } from '@/components/pages/reports/common/utils';
	import { useAttributes } from '~/stores/useAttributes';
	import { useBalanceReportStore } from '~/stores/useBalanceReportStore';
	// import { getLayoutByUserCode } from '~/services/entity/entityViewerHelperService';
	import ReportHeader from '~/components/pages/reports/common/ReportHeader/ReportHeader.vue';
	import ReportTable from '~/components/pages/reports/common/ReportTable/ReportTable.vue';
	import LayoutSaveAsDialog from '~/components/modal/LayoutSaveAsDialog/LayoutSaveAsDialog.vue';
	import cloneDeep from 'lodash/cloneDeep';

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

	const balanceReportStore = useBalanceReportStore();
	const {
		changeRouteQuery,
		getLayouts,
		updateLayoutList,
		getCurrencies,
		getTableData,
		loadTableDataToGroupLevel,
		saveLayout
	} = balanceReportStore;
	const {
		isLoading,
		entityType,
		contentType,
		rootEntityViewer,
		layouts,
		currentLayout,
		splitPanelDefaultLayout,
		groups,
		tableData
	} = storeToRefs(balanceReportStore);

	const {
		downloadCustomFieldsByEntityType,
		downloadDynamicAttributesByEntityType,
		downloadInstrumentUserFields
	} = useAttributes();

	entityType.value = 'balance-report';
	contentType.value = 'reports.balancereport';

	async function saveAsLayout(updatedLayoutData) {
		const layout = await uiService.createListLayout(updatedLayoutData);
		updateLayoutList(layout);
		await processAction({ action: 'layout:select', payload: layout });
		useNotify({ type: 'success', title: `Layout ${updatedLayoutData.name} saved.` });
	}

	async function overwriteLayout(updatedLayoutData) {
		const layoutToOverwriteData = await uiService.getListLayoutByUserCode(
			entityType.value,
			updatedLayoutData.user_code
		);

		const layoutToOverwrite = layoutToOverwriteData.results[0];
		layoutToOverwrite.data = updatedLayoutData.data;
		layoutToOverwrite.name = updatedLayoutData.name;
		const layout = await uiService.updateListLayout(layoutToOverwrite);
		updateLayoutList(layout);
		await processAction({ action: 'layout:select', payload: layout });
		useNotify({ type: 'success', title: `Success. Layout ${updatedLayoutData.name} overwritten.` });
	}

	async function processAction({ action, payload }) {
		console.log('processAction => ', action, payload);
		switch (action) {
			case 'layout:select':
				try {
					isLoading.value = true;
					currentLayout.value = payload;
					await changeRouteQuery(entityType.value);
					tableData.value = [];
					await loadTableData();
				} finally {
					isLoading.value = false;
				}
				break;
			case 'layout:save':
				await saveLayout();
				break;
			case 'layout:save-as':
				dialogsSrv.$openDialog({
					component: LayoutSaveAsDialog,
					componentProps: {
						entityType: entityType.value
					},
					dialogProps: {
						title: 'New layout',
						width: 800,
						cancelButton: false,
						confirmButton: false,
						closeOnClickOverlay: false,
						onConfirm: async ({ status, data }) => {
							try {
								isLoading.value = true;

								const updatedLayout = {
									...data,
									is_systemic: false
								};

								if (status === 'agree') {
									updatedLayout.id && delete updatedLayout.id;
									await saveAsLayout(updatedLayout);
								} else if (status === 'overwrite') {
									await overwriteLayout(updatedLayout);
								}
							} finally {
								isLoading.value = false;
							}
						}
					}
				});
				break;
			case 'layout:rename':
				dialogsSrv.$openDialog({
					component: LayoutSaveAsDialog,
					componentProps: {
						entityType: metaContentTypesService.findEntityByContentType(contentType.value),
						name: currentLayout.value.name,
						userCode: currentLayout.value.user_code,
						offerToOverride: true
					},
					dialogProps: {
						title: 'New layout',
						width: 800,
						cancelButton: false,
						confirmButton: false,
						closeOnClickOverlay: false,
						onConfirm: async ({ status, data }) => {
							try {
								isLoading.value = true;
								if (status === 'agree') {
									const updatedLayout = cloneDeep(currentLayout.value);
									updatedLayout.name = data.name;
									updatedLayout.user_code = data.user_code;
									const res = await uiService.updateListLayout(updatedLayout);
									updateLayoutList(res);
									currentLayout.value = res;
									await processAction({ action: 'layout:select', payload: layout });
									useNotify({ type: 'success', title: 'Success. Layout has been renamed.' });
								}
							} finally {
								isLoading.value = false;
							}
						}
					}
				});
				break;
			case 'layout:make-default':
				if (rootEntityViewer.value) {
					const updatedLayout = payload || cloneDeep(currentLayout.value);

					if (updatedLayout.is_default) return;

					updatedLayout.is_default = true;
					layouts.value.forEach((l) => {
						l.is_default = l.id === updatedLayout.id;
					});
					const layout = await uiService.updateListLayout(updatedLayout);
					updateLayoutList(layout);

					useNotify({ type: 'success', title: 'Success. Layout made by default' });
				} else if (updatedLayout.id !== splitPanelDefaultLayout.value.id) {
					splitPanelDefaultLayout.value = {
						layoutId: updatedLayout.id,
						name: updatedLayout.name,
						content_type: updatedLayout.content_type
					};
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
		const groupIndexToExpand = groups.value.reduce((acc, g, index) => {
			const { report_settings = {} } = g;
			const { is_level_folded } = report_settings;
			if (!is_level_folded && index > acc) {
				acc = index;
			}

			return acc;
		}, -1);

		if (groupIndexToExpand !== -1) {
			await loadTableDataToGroupLevel(groupIndexToExpand);
		} else {
			const options = prepareTableDataRequestOptions({
				currentLayout: currentLayout.value,
				groupIndex: -1,
				groupValues: []
			});

			await getTableData({
				type: options.frontend_request_options.groups_types.length ? 'group' : 'items',
				entityType: entityType.value,
				options,
				justThisLevel: true
			});
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
