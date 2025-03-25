<template>
	<div class="button-set-component-dialog">
		<div class="body">
			<div class="row-grid">
				<FmTextField
					v-model="itemData.name"
					label="Name"
					hide-details
					outlined
					:disabled="isLoading"
				/>

				<FmTextField
					v-model="itemData.custom_component_name"
					label="Label"
					hide-details
					outlined
					:disabled="isLoading"
				/>

				<FmCheckbox
					v-model="itemData.settings.showAsDropdown"
					label="Show as dropdown"
					:disabled="isLoading"
				/>
			</div>

			<div class="subtitle">Buttons Grid Projection Size (6 x 6 max)</div>

			<div class="row-grid">
				<FmTextField
					:model-value="gridRows"
					type="number"
					label="Rows"
					outlined
					hide-details
					:disabled="isLoading"
					@update:model-value="changeGridSize('rows', $event)"
				/>

				<FmTextField
					:model-value="gridColumns"
					type="number"
					label="Columns"
					outlined
					hide-details
					:disabled="isLoading"
					@update:model-value="changeGridSize('columns', $event)"
				/>
			</div>

			<div class="grid-wrapper">
				<div class="settings">
					<div v-for="r in gridRows" :key="r" class="settings__row">
						<div
							v-for="c in gridColumns"
							:key="c"
							class="settings__cell"
						>
							<ButtonSet
								:item="rowsData[r - 1]?.items[c - 1]"
								:row-index="r - 1"
								:col-index="c - 1"
								:actions="sortedActions"
								:targets="targets"
								:target-specifics="targetSpecifics"
								:disabled="isLoading"
								@update:target-specifics="updateTargetSpecifics"
								@update:button="
									updateGrid(r - 1, c - 1, $event)
								"
							/>
						</div>
					</div>
				</div>
			</div>
		</div>

		<div class="actions">
			<FmButton
				type="secondary"
				rounded
				@click.stop.prevent="emits('close')"
			>
				Cancel
			</FmButton>

			<div class="actions__block">
				<FmButton
					type="tertiary"
					rounded
					:disabled="isLoading"
					@click.stop.prevent="exportToDashboards"
				>
					Export to dashboards
				</FmButton>

				<FmButton
					rounded
					:disabled="isLoading || !itemData.name"
					@click.stop.prevent="save"
				>
					Ok
				</FmButton>
			</div>
		</div>

		<div v-if="isLoading" class="loader">
			<FmProgressCircular indeterminate size="80" />
		</div>
	</div>
</template>

<script setup>
	import { nextTick, onBeforeMount, ref } from 'vue';
	import { storeToRefs } from 'pinia';
	import cloneDeep from 'lodash/cloneDeep';
	import size from 'lodash/size';
	import {
		FmButton,
		FmCheckbox,
		FmProgressCircular,
		FmTextField
	} from '@finmars/ui';
	import { getListLight as getTransactionList } from '~/services/transaction/transactionTypeService';
	import { getList as getPricingProcedureList } from '~/services/pricing/pricingProcedureService';
	import { getListLight as getImportSchemeList } from '~/services/csvImportSchemeService';
	import { getListLight as getTransactionImportSchemeList } from '~/services/transaction/transactionImportSchemeService';
	import { getList as getComplexImportSchemeList } from '~/services/complex/complexImportSchemeService';
	import { getDashboardLayoutList } from '~/services/uiService';
	import { getList as getInstrumentDownloadSchemeList } from '~/services/instrument/instrumantDownloadSchemeService';
	import { getListForUi } from '~/services/meta/metaContentTypeService';
	import { ACTIONS, TARGETS } from './constants';
	import { md5 } from '~/utils/md5';
	import { useDashboardConstructorStore } from '~/stores/useDashboardConstructorStore';
	import ButtonSet from './ButtonSet.vue';

	const props = defineProps({
		item: {
			type: [Object, null]
		}
	});
	const emits = defineEmits(['close', 'select', 'confirm']);

	const dashboardConstructorStore = useDashboardConstructorStore();
	const { components } = storeToRefs(dashboardConstructorStore);
	const { exportComponentToDashboards, updateComponent, setComponents } =
		dashboardConstructorStore;

	const isLoading = ref(false);
	const itemData = ref(null);
	const gridRows = ref(0);
	const gridColumns = ref(0);

	const rowsData = computed(() => itemData.value?.settings?.grid?.rows || []);
	const sortedActions = computed(() => ACTIONS.sort(sortByName));

	const targets = ref(cloneDeep(TARGETS));
	const targetSpecifics = ref({
		open_report: {},
		open_data_viewer: {}
	});

	function formatNumber(val) {
		return val.replace(/[^0-9]/g, '');
	}

	function sortByName(a, b) {
		return a.name > b.name ? -1 : 1;
	}

	async function getTransactionTypes() {
		const data = await getTransactionList({ pageSize: 1000 });
		targets.value.book_transaction = (data?.results || []).map((item) => ({
			value: item.user_code,
			name: item.short_name
		}));
	}

	async function getPricingProcedures() {
		const data = await getPricingProcedureList({ pageSize: 1000 });
		targets.value.run_valuation_procedure = (data?.results || []).map(
			(item) => ({
				value: item.user_code,
				name: item.name
			})
		);
	}

	async function getSimpleImportSchemes() {
		const data = await getImportSchemeList({ pageSize: 1000 });
		targets.value.import_data_from_file = (data?.results || []).map(
			(item) => ({
				value: item.user_code,
				name: item.user_code
			})
		);
	}

	async function getTransactionImportSchemes() {
		const data = await getTransactionImportSchemeList({ pageSize: 1000 });
		targets.value.import_transactions_from_file = (data?.results || []).map(
			(item) => ({
				value: item.user_code,
				name: item.user_code
			})
		);
	}

	async function getComplexImportSchemes() {
		const data = await getComplexImportSchemeList({ pageSize: 1000 });
		targets.value.complex_import_from_file = (data?.results || []).map(
			(item) => ({
				value: item.user_code,
				name: item.user_code
			})
		);
	}

	async function getDashboardLayouts() {
		const data = await getDashboardLayoutList();
		targets.value.open_dashboard = (data?.results || []).map((item) => ({
			value: item.user_code,
			name: item.name
		}));
	}

	async function getInstrumentDownloadSchemes() {
		const data = await getInstrumentDownloadSchemeList({ pageSize: 1000 });
		targets.value.download_instrument = (data?.results || []).map(
			(item) => ({
				value: item.user_code,
				name: item.user_code
			})
		);
	}

	async function getContentTypes() {
		const contentTypes = getListForUi();
		const excludes = (targets.value.open_report || []).map(
			(item) => item.value
		);
		targets.value.open_data_viewer = (contentTypes || []).reduce(
			(res, item) => {
				if (!excludes.includes(item.key)) {
					res.push({
						value: item.key,
						name: item.name
					});
				}

				return res;
			},
			[]
		);
	}

	function updateTargetSpecifics(value) {
		targetSpecifics.value = value;
	}

	function prepareInitialGrid(rows, columns) {
		const data = [];

		for (let r = 0; r < rows; r++) {
			const rowData = {
				index: r,
				items: []
			};

			for (let c = 0; c < columns; c++) {
				rowData.items.push({ options: {} });
			}

			data.push(rowData);
		}

		return data;
	}

	function changeGridSize(direction, value) {
		const formattedValue = formatNumber(value);
		const updatedValue =
			Number(formattedValue) < 1
				? 1
				: Number(formattedValue) > 6
					? 6
					: Number(formattedValue);

		nextTick(() => {
			if (direction === 'rows') {
				gridRows.value = updatedValue;
			} else {
				gridColumns.value = updatedValue;
			}

			itemData.value.settings.columns = `${gridColumns.value}`;
			itemData.value.settings.rows = `${gridRows.value}`;
		});
	}

	function updateGrid(rowIndex, colIndex, item) {
		itemData.value.settings.grid.rows[rowIndex].items[colIndex] = item;
	}

	function prepareSettingsBeforeSave(initialSettings) {
		const settings = cloneDeep(initialSettings);
		const { rows, columns, grid } = settings;
		const updatedGridRows = [];
		for (let r = 0; r < Number(rows); r++) {
			const row = {
				index: r,
				items: []
			};
			for (let c = 0; c < Number(columns); c++) {
				row.items.push(grid.rows[r].items[c]);
			}
			updatedGridRows.push(row);
		}

		settings.grid.rows = updatedGridRows;
		return settings;
	}

	function exportToDashboards() {
		const exportedComponent = cloneDeep(itemData.value);
		exportedComponent.settings = prepareSettingsBeforeSave(
			exportedComponent.settings
		);
		exportComponentToDashboards(exportedComponent);
	}

	function save() {
		const updatedComponent = cloneDeep(itemData.value);
		updatedComponent.settings = prepareSettingsBeforeSave(
			updatedComponent.settings
		);

		if (updatedComponent.id) {
			updateComponent(updatedComponent);
		} else {
			updatedComponent.id = md5(
				`${Date.now()}_${size(components.value)}`
			);
			const updatedComponents = cloneDeep(components.value);
			updatedComponents.push(updatedComponent);
			setComponents(updatedComponents);
		}

		emits('confirm');
	}

	onBeforeMount(async () => {
		if (props.item) {
			itemData.value = cloneDeep(props.item);
		} else {
			itemData.value = {
				type: 'button_set',
				id: null, // should be generated before create
				name: '',
				settings: {
					columns: 6,
					rows: 6,
					grid: {
						rows: prepareInitialGrid(6, 6)
					}
				}
			};
		}

		try {
			isLoading.value = true;

			await Promise.all([
				getTransactionTypes(),
				getPricingProcedures(),
				getSimpleImportSchemes(),
				getTransactionImportSchemes(),
				getComplexImportSchemes(),
				getDashboardLayouts(),
				getInstrumentDownloadSchemes(),
				getContentTypes()
			]);
		} catch (e) {
			console.error(e);
		} finally {
			isLoading.value = false;
		}

		gridRows.value = Number(itemData.value.settings.rows);
		gridColumns.value = Number(itemData.value.settings.columns);
	});
</script>

<style lang="scss" scoped>
	.button-set-component-dialog {
		position: relative;
		width: 100%;

		.body {
			position: relative;
			width: 100%;
			height: 480px;
			padding: 24px 24px 0 24px;

			:deep(.v-tabs) {
				border-radius: 4px 4px 0 0;
				width: 640px;

				button {
					text-transform: none;
					background-color: transparent !important;
				}
			}
		}

		.actions {
			display: flex;
			width: 100%;
			padding: 24px;
			justify-content: space-between;
			align-items: center;

			&__block {
				display: flex;
				justify-content: center;
				align-items: center;
				column-gap: 16px;
			}

			button {
				text-transform: none;
			}
		}

		.loader {
			position: absolute;
			inset: 0;
			z-index: 5;
			pointer-events: none;
			display: flex;
			justify-content: center;
			align-items: center;
			background-color: rgba(0, 0, 0, 0.2);
		}
	}

	.subtitle {
		position: relative;
		width: 100%;
		margin-bottom: 16px;
		font: var(--label-large-font);
		color: var(--error);
	}

	.row-grid {
		position: relative;
		width: 100%;
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		column-gap: 16px;
		margin-bottom: 16px;
	}

	.grid-wrapper {
		position: relative;
		width: 100%;
		height: calc(100% - 180px);
		overflow-y: auto;
	}

	.settings {
		position: relative;
		width: 100%;

		&__row {
			position: relative;
			width: 100%;
			display: flex;
			justify-content: flex-start;
			align-items: stretch;
			column-gap: 16px;
			margin-bottom: 16px;
		}

		&__cell {
			position: relative;
			width: calc(calc(100% - 80px) / 6);
			padding: 8px;
			border-radius: 4px;
			border: 1px solid var(--outline-variant);
		}
	}
</style>
