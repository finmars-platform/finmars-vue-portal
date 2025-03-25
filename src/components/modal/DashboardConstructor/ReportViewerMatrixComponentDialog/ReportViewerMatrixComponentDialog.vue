<template>
	<div class="report-viewer-matrix-component-dialog">
		<div class="body">
			<FmTabs
				:tabs="REPORT_COMPONENT_TABS"
				variant="normal"
				@change-tab="activeTab = $event"
			/>

			<div class="content">
				<!-- TAB: Main -->
				<template v-if="activeTab === 0">
					<div class="row-grid">
						<FmTextField
							v-model="itemData.name"
							label="Name"
							outlined
							:disabled="isLoading"
						/>

						<UserCodeField
							v-model="itemData.user_code"
							:disabled="isLoading"
							@update:valid="isUserCodeValid = $event"
						/>

						<FmSelect
							v-model="itemData.settings.matrix_type"
							:options="[
								{ value: 'balance', title: 'Balance' },
								{ value: 'pl', title: 'P&L' }
							]"
							variant="outlined"
							label="Matrix Type"
							:disabled="isLoading"
							@update:model-value="getAttributes"
						/>
					</div>

					<div class="row-grid">
						<TwoFieldsMultiselect
							:value="itemData.settings.components_to_listen"
							:options="componentsTypesToListen"
							label="Component to Listen"
							:disabled="isLoading"
							@update:value="
								itemData.settings.components_to_listen = $event
							"
						/>

						<TableAttributeSelector
							:value="itemData.settings.abscissa"
							label="Axis X Columns"
							title="Axis X Columns"
							:available-attrs="attributes"
							is-report
							:disabled="isLoading"
							@update:value="itemData.settings.abscissa = $event"
						/>

						<TableAttributeSelector
							:value="itemData.settings.ordinate"
							label="Axis Y Columns"
							title="Axis Y Columns"
							:available-attrs="attributes"
							is-report
							:disabled="isLoading"
							@update:value="itemData.settings.ordinate = $event"
						/>
					</div>

					<div class="row-grid">
						<TableAttributeSelector
							:value="itemData.settings.value_key"
							label="Value"
							title="Value"
							:available-attrs="numericAttributes"
							is-report
							:disabled="isLoading"
							@update:value="itemData.settings.value_key = $event"
						/>

						<FmSelect
							:model-value="itemData.settings.subtotal_formula_id"
							:options="SUBTOTAL_FORMULA_OPTIONS"
							label="Formula"
							variant="outlined"
							:disabled="isLoading"
							@update:model-value="
								itemData.settings.subtotal_formula_id = $event
							"
						/>

						<FmButton
							type="tertiary"
							rounded
							@click.stop.prevent="openNumberFormatSettingsDialog"
						>
							Format Settings
						</FmButton>
					</div>

					<div class="row-grid">
						<FmSelect
							:model-value="itemData.settings.matrix_view"
							:options="MATRIX_TYPE_OPTIONS"
							variant="outlined"
							label="Matrix type"
							:disabled="isLoading"
							@update:model-value="
								itemData.settings.matrix_view = $event
							"
						/>
					</div>
				</template>

				<!-- TAB: Advance settings  -->
				<template v-if="activeTab === 1">
					<div class="editor-wrapper">
						<VAceEditor
							:value="reportOptions"
							lang="json"
							theme="monokai"
							class="editor"
							@init="_onEditorInit"
							@update:value="onJsonUpdate"
						/>
					</div>

					<div class="row-grid">
						<FmSelect
							:model-value="itemData.settings.hide_empty_lines"
							:options="MATRIX_HIDE_EMPTY_COLUMNS_OPTIONS"
							variant="outlined"
							label="Hide empty columns or / and rows"
							:disabled="isLoading"
							@update:model-value="
								itemData.settings.hide_empty_lines = $event
							"
						/>

						<FmButton
							type="secondary"
							rounded
							@click.stop.prevent="
								itemData.settings.hide_empty_lines = ''
							"
							style="align-self: center"
						>
							Clear
						</FmButton>
					</div>

					<div class="row-grid">
						<FmSelect
							:model-value="
								itemData.settings.styles.cell.text_align
							"
							:options="TEXT_CELL_ALIGN_STYLES"
							variant="outlined"
							label="Style. Cell Text Align"
							:disabled="isLoading"
							@update:model-value="
								itemData.settings.styles.cell.text_align =
									$event
							"
						/>

						<FmCheckbox
							v-model="itemData.settings.auto_scaling"
							label="Scale matrix"
							:disabled="isLoading"
						/>

						<FmCheckbox
							v-model="
								itemData.settings.calculate_name_column_width
							"
							label="Calculate width for column with names"
							:disabled="isLoading"
						/>
					</div>
				</template>

				<!-- TAB: Menu settings  -->
				<template v-if="activeTab === 2">
					<div class="row-grid">
						<TableAttributesMenuConstructor
							:value="
								itemData.user_settings?.available_abscissa_keys
							"
							label="Axis X Columns"
							title="Axis X Columns"
							:available-attrs="attributes"
							is-report
							:disabled="isLoading"
							@update:value="
								itemData.user_settings.available_abscissa_keys =
									$event
							"
						/>

						<TableAttributesMenuConstructor
							:value="
								itemData.user_settings?.available_ordinate_keys
							"
							label="Axis Y Columns"
							title="Axis Y Columns"
							:available-attrs="attributes"
							is-report
							:disabled="isLoading"
							@update:value="
								itemData.user_settings.available_ordinate_keys =
									$event
							"
						/>

						<TableAttributesMenuConstructor
							:value="
								itemData.user_settings?.available_value_keys
							"
							label="Values"
							title="Values"
							:available-attrs="numericAttributes"
							is-report
							:disabled="isLoading"
							@update:value="
								itemData.user_settings.available_value_keys =
									$event
							"
						/>
					</div>
				</template>

				<!-- TAB: Linking -->
				<template v-if="activeTab === 3">
					<div class="row-grid">
						<TwoFieldsMultiselect
							:value="
								itemData.settings.linked_components
									.active_object
							"
							:options="componentsForMultiselector"
							label="Select Link to Component"
							:disabled="isLoading"
							@update:value="
								itemData.settings.linked_components.active_object =
									$event
							"
						/>
					</div>
				</template>

				<!-- TAB: Calculation -->
				<template v-if="activeTab === 4">
					<div class="row-grid">
						<div
							v-if="
								itemData.settings?.entity_type ===
									'balance-report' ||
								(itemData.type === 'report_viewer_matrix' &&
									itemData.settings?.matrix_type ===
										'balance')
							"
							class="cell"
						>
							<FmSelect
								:model-value="
									itemData.settings.linked_components
										.report_settings.report_date
								"
								:options="
									dateControlComponentsTypes.map((t) => ({
										title: t.name,
										value: t.user_code
									}))
								"
								variant="outlined"
								label="Date"
								:disabled="isLoading"
								@update:model-value="
									itemData.settings.linked_components.report_settings.report_date =
										$event
								"
							/>

							<FmButton
								type="secondary"
								rounded
								:disabled="isLoading"
								@click.stop.prevent="
									clearSelect(
										'settings.linked_components.report_settings.report_date'
									)
								"
							>
								Clear
							</FmButton>
						</div>

						<template
							v-if="
								itemData.settings.entity_type === 'pl-report' ||
								(itemData.type === 'report_viewer_matrix' &&
									itemData.settings.matrix_type === 'pl')
							"
						>
							<div class="cell">
								<FmSelect
									:model-value="
										itemData.settings.linked_components
											.report_settings.pl_first_date
									"
									:options="
										dateControlComponentsTypes.map((t) => ({
											title: t.name,
											value: t.user_code
										}))
									"
									variant="outlined"
									label="Date From (PL First Date)"
									:disabled="isLoading"
									@update:model-value="
										itemData.settings.linked_components.report_settings.pl_first_date =
											$event
									"
								/>

								<FmButton
									type="secondary"
									rounded
									:disabled="isLoading"
									@click.stop.prevent="
										clearSelect(
											'settings.linked_components.report_settings.pl_first_date'
										)
									"
								>
									Clear
								</FmButton>
							</div>

							<div class="cell">
								<FmSelect
									:model-value="
										itemData.settings.linked_components
											.report_settings.report_date
									"
									:options="
										dateControlComponentsTypes.map((t) => ({
											title: t.name,
											value: t.user_code
										}))
									"
									variant="outlined"
									label="Date To"
									:disabled="isLoading"
									@update:model-value="
										itemData.settings.linked_components.report_settings.report_date =
											$event
									"
								/>

								<FmButton
									type="secondary"
									rounded
									:disabled="isLoading"
									@click.stop.prevent="
										clearSelect(
											'settings.linked_components.report_settings.report_date'
										)
									"
								>
									Clear
								</FmButton>
							</div>
						</template>

						<template
							v-if="
								itemData.settings.entity_type ===
								'transaction-report'
							"
						>
							<div class="cell">
								<FmSelect
									:model-value="
										itemData.settings.linked_components
											.report_settings.begin_date
									"
									:options="
										dateControlComponentsTypes.map((t) => ({
											title: t.name,
											value: t.user_code
										}))
									"
									variant="outlined"
									label="Date From"
									:disabled="isLoading"
									@update:model-value="
										itemData.settings.linked_components.report_settings.begin_date =
											$event
									"
								/>

								<FmButton
									type="secondary"
									rounded
									:disabled="isLoading"
									@click.stop.prevent="
										clearSelect(
											'settings.linked_components.report_settings.begin_date'
										)
									"
								>
									Clear
								</FmButton>
							</div>

							<div class="cell">
								<FmSelect
									:model-value="
										itemData.settings.linked_components
											.report_settings.end_date
									"
									:options="
										dateControlComponentsTypes.map((t) => ({
											title: t.name,
											value: t.user_code
										}))
									"
									variant="outlined"
									label="Date To"
									:disabled="isLoading"
									@update:model-value="
										itemData.settings.linked_components.report_settings.end_date =
											$event
									"
								/>

								<FmButton
									type="secondary"
									rounded
									:disabled="isLoading"
									@click.stop.prevent="
										clearSelect(
											'settings.linked_components.report_settings.end_date'
										)
									"
								>
									Clear
								</FmButton>
							</div>
						</template>

						<div class="cell">
							<FmSelect
								:model-value="
									itemData.settings.linked_components
										.report_settings.report_currency
								"
								:options="
									currencyControlComponentsTypes.map((t) => ({
										title: t.name,
										value: t.user_code
									}))
								"
								variant="outlined"
								label="Currency"
								:disabled="isLoading"
								@update:model-value="
									itemData.settings.linked_components.report_settings.report_currency =
										$event
								"
							/>

							<FmButton
								type="secondary"
								rounded
								:disabled="isLoading"
								@click.stop.prevent="
									clearSelect(
										'settings.linked_components.report_settings.report_currency'
									)
								"
							>
								Clear
							</FmButton>
						</div>

						<div class="cell">
							<FmSelect
								:model-value="
									itemData.settings.linked_components
										.report_settings.pricing_policy
								"
								:options="
									pricingPolicyControlComponentsTypes.map(
										(t) => ({
											title: t.name,
											value: t.user_code
										})
									)
								"
								variant="outlined"
								label="Pricing Policy"
								:disabled="isLoading"
								@update:model-value="
									itemData.settings.linked_components.report_settings.pricing_policy =
										$event
								"
							/>

							<FmButton
								type="secondary"
								rounded
								:disabled="isLoading"
								@click.stop.prevent="
									clearSelect(
										'settings.linked_components.report_settings.pricing_policy'
									)
								"
							>
								Clear
							</FmButton>
						</div>

						<div class="cell">
							<FmSelect
								:model-value="
									itemData.settings.linked_components
										.report_settings.portfolios
								"
								:options="
									portfoliosComponentTypes.map((t) => ({
										title: t.name,
										value: t.user_code
									}))
								"
								variant="outlined"
								label="Portfolios"
								:disabled="isLoading"
								@update:model-value="
									itemData.settings.linked_components.report_settings.portfolios =
										$event
								"
							/>

							<FmButton
								type="secondary"
								rounded
								:disabled="isLoading"
								@click.stop.prevent="
									clearSelect(
										'settings.linked_components.report_settings.portfolios'
									)
								"
							>
								Clear
							</FmButton>
						</div>

						<div class="cell">
							<FmSelect
								:model-value="
									itemData.settings.linked_components
										.report_settings.accounts
								"
								:options="
									accountsComponentTypes.map((t) => ({
										title: t.name,
										value: t.user_code
									}))
								"
								variant="outlined"
								label="Accounts"
								:disabled="isLoading"
								@update:model-value="
									itemData.settings.linked_components.report_settings.accounts =
										$event
								"
							/>

							<FmButton
								type="secondary"
								rounded
								:disabled="isLoading"
								@click.stop.prevent="
									clearSelect(
										'settings.linked_components.report_settings.accounts'
									)
								"
							>
								Clear
							</FmButton>
						</div>

						<div class="cell">
							<FmSelect
								:model-value="
									itemData.settings.linked_components
										.report_settings.strategies1
								"
								:options="
									strategies1ComponentTypes.map((t) => ({
										title: t.name,
										value: t.user_code
									}))
								"
								variant="outlined"
								label="Strategies 1"
								:disabled="isLoading"
								@update:model-value="
									itemData.settings.linked_components.report_settings.strategies1 =
										$event
								"
							/>

							<FmButton
								type="secondary"
								rounded
								:disabled="isLoading"
								@click.stop.prevent="
									clearSelect(
										'settings.linked_components.report_settings.strategies1'
									)
								"
							>
								Clear
							</FmButton>
						</div>

						<div class="cell">
							<FmSelect
								:model-value="
									itemData.settings.linked_components
										.report_settings.strategies2
								"
								:options="
									strategies2ComponentTypes.map((t) => ({
										title: t.name,
										value: t.user_code
									}))
								"
								variant="outlined"
								label="Strategies 2"
								:disabled="isLoading"
								@update:model-value="
									itemData.settings.linked_components.report_settings.strategies2 =
										$event
								"
							/>

							<FmButton
								type="secondary"
								rounded
								:disabled="isLoading"
								@click.stop.prevent="
									clearSelect(
										'settings.linked_components.report_settings.strategies2'
									)
								"
							>
								Clear
							</FmButton>
						</div>

						<div class="cell">
							<FmSelect
								:model-value="
									itemData.settings.linked_components
										.report_settings.strategies3
								"
								:options="
									strategies3ComponentTypes.map((t) => ({
										title: t.name,
										value: t.user_code
									}))
								"
								variant="outlined"
								label="Strategies 3"
								:disabled="isLoading"
								@update:model-value="
									itemData.settings.linked_components.report_settings.strategies3 =
										$event
								"
							/>

							<FmButton
								type="secondary"
								rounded
								:disabled="isLoading"
								@click.stop.prevent="
									clearSelect(
										'settings.linked_components.report_settings.strategies1'
									)
								"
							>
								Clear
							</FmButton>
						</div>
					</div>

					<div class="row">
						<FmCheckbox
							v-model="itemData.settings.auto_refresh"
							label="Trigger Refresh on Value Change"
							:disabled="isLoading"
						/>
					</div>
				</template>
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
					rounded
					:disabled="isLoading || !itemData.name || !isUserCodeValid"
					@click.stop.prevent="save"
				>
					Ok
				</FmButton>
			</div>
		</div>
	</div>
</template>

<script setup>
	import { computed, inject, onBeforeMount, ref } from 'vue';
	import { storeToRefs } from 'pinia';
	import cloneDeep from 'lodash/cloneDeep';
	import size from 'lodash/size';
	import unset from 'lodash/unset';
	import {
		FM_DIALOGS_KEY,
		FmButton,
		FmCheckbox,
		FmSelect,
		FmTabs,
		FmTextField
	} from '@finmars/ui';
	import useAceEditor from '~/composables/useAceEditor';
	import {
		SUBTOTAL_FORMULA_OPTIONS,
		REPORT_COMPONENT_TABS,
		MATRIX_TYPE_OPTIONS,
		MATRIX_HIDE_EMPTY_COLUMNS_OPTIONS,
		TEXT_CELL_ALIGN_STYLES
	} from '~/components/modal/DashboardConstructor/constants';
	import { useDashboardConstructorStore } from '~/stores/useDashboardConstructorStore';
	import { useAttributes } from '~/stores/useAttributes';
	import { wrapperStringify } from '~/utils/wrapperStringify';
	import { md5 } from '~/utils/md5';
	import TwoFieldsMultiselect from '~/components/common/TwoFieldsMultiselect/TwoFieldsMultiselect.vue';
	import TableAttributeSelector from '~/components/common/TableAttributeSelector/TableAttributeSelector.vue';
	import TableAttributesMenuConstructor from '~/components/pages/configuration/dashboard-constructor/TableAttributesMenuConstructor/TableAttributesMenuConstructor.vue';
	import NumberFormatSettingsDialog from '~/components/modal/NumberFormatSettingsDialog/NumberFormatSettingsDialog.vue';
	import UserCodeField from '~/components/common/UserCodeField/UserCodeField.vue';

	const props = defineProps({
		item: {
			type: [Object, null]
		},
		data: {
			type: Object,
			default: () => ({})
		}
	});
	const emits = defineEmits(['close', 'select', 'confirm']);

	const dialogService = inject(FM_DIALOGS_KEY);

	const { VAceEditor, onEditorInit } = useAceEditor();

	const dashboardConstructorStore = useDashboardConstructorStore();
	const {
		components,
		dateControlComponentsTypes,
		currencyControlComponentsTypes,
		pricingPolicyControlComponentsTypes,
		portfoliosComponentTypes,
		accountsComponentTypes,
		strategies1ComponentTypes,
		strategies2ComponentTypes,
		strategies3ComponentTypes
	} = storeToRefs(dashboardConstructorStore);
	const { getComponentsForMultiselector, updateComponent, setComponents } =
		dashboardConstructorStore;
	const { getAllAttributesByEntityType } = useAttributes();

	const activeTab = ref(0);
	const isLoading = ref(false);
	const itemData = ref(null);
	const isUserCodeValid = ref(false);
	const aceEditor = ref();

	const componentsForMultiselector = ref([]);
	const componentsTypes = ref([]);
	const componentsTypesToListen = ref([]);
	const attributes = ref([]);

	const numericAttributes = computed(() =>
		attributes.value.filter((a) => a.value_type === 20)
	);
	const reportOptions = computed(() =>
		wrapperStringify(itemData.value.settings.default_report_options)
	);

	function _onEditorInit(editor) {
		onEditorInit(editor);
		editor.getSession().setMode('ace/mode/json');
		editor.getSession().setUseWorker(false);
		editor.setAutoScrollEditorIntoView(true);
		editor.setValue(reportOptions.value);
		aceEditor.value = editor;
	}

	function onJsonUpdate(val) {
		try {
			itemData.value.settings.default_report_options = JSON.parse(val);
		} catch (e) {
			console.warn('JSON is not valid.');
		}
	}

	function openNumberFormatSettingsDialog() {
		dialogService.$openDialog({
			component: NumberFormatSettingsDialog,
			componentProps: {
				settings: itemData.value.settings.number_format
			},
			dialogProps: {
				title: 'Complex Transaction Code: Number Format',
				width: 600,
				closeOnClickOverlay: false,
				onConfirm: (val) => {
					itemData.value.settings.number_format = val;
				}
			}
		});
	}

	function getAttributes() {
		const entityType =
			itemData.value?.settings.matrix_type === 'balance'
				? 'balance-report'
				: itemData.value?.settings.matrix_type === 'pl'
					? 'pl-report'
					: undefined;
		attributes.value = getAllAttributesByEntityType(entityType);
	}

	function clearSelect(path) {
		unset(itemData.value, path);
	}

	function save() {
		if (itemData.value.id) {
			updateComponent(itemData.value);
		} else {
			itemData.value.id = md5(`${Date.now()}_${size(componentsTypes)}`);
			componentsTypes.value.push(itemData.value);
			setComponents(componentsTypes.value);
		}

		emits('confirm');
	}

	onBeforeMount(() => {
		if (props.item) {
			itemData.value = cloneDeep(props.item);
		} else {
			itemData.value = {
				type: 'report_viewer_matrix',
				id: null, // should be generated before create
				name: '',
				settings: {
					components_to_listen: [],
					matrix_type: 'balance',
					// entity_type: 'balance-report',
					abscissa: '',
					ordinate: '',
					value_key: '',
					subtotal_formula_id: 1,
					matrix_view: 'usual',
					styles: {
						cell: {
							text_align: 'center'
						}
					},
					auto_refresh: false,
					auto_scaling: false,
					calculate_name_column_width: false,
					linked_components: {
						report_settings: {}
					},
					hide_empty_lines: '',
					filters: {
						show_filters_area: false,
						show_use_from_above_filters: false
					},
					default_report_options: {
						cost_method: 1,
						account_mode: 1,
						portfolio_mode: 1,
						custom_fields_to_calculate: ''
					}
				},
				user_settings: {}
			};
		}

		componentsTypes.value = cloneDeep(components.value);
		componentsTypesToListen.value = componentsTypes.value.reduce(
			(res, c) => {
				if (c.user_code) {
					res.push({
						id: c.user_code,
						name: c.name
					});
				}
				return res;
			},
			[]
		);
		componentsForMultiselector.value = cloneDeep(
			getComponentsForMultiselector(itemData.value.user_code)
		);
		getAttributes();
	});
</script>

<style lang="scss" scoped>
	.report-viewer-matrix-component-dialog {
		position: relative;
		width: 100%;

		.body {
			position: relative;
			width: 100%;
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

		.content {
			position: relative;
			top: -1px;
			width: 100%;
			height: 480px;
			border-radius: 0 8px 8px 8px;
			padding: 24px 24px 0 24px;
			border: 1px solid var(--outline-variant);

			button {
				text-transform: none;
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

	.row {
		position: relative;
		width: 100%;
		margin-bottom: 16px;

		&__title {
			font: var(--title-medium-font);
			margin-bottom: 16px;
		}

		&__item {
			font: var(--body-medium-font);
			margin-bottom: 8px;
		}
	}

	.row-grid {
		position: relative;
		width: 100%;
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 16px;
		margin-bottom: 16px;

		:deep(.fm-select-activator) {
			height: max-content;
		}

		:deep(.fm-text-field) {
			height: max-content;
		}
	}

	.cell {
		position: relative;
		width: 100%;
		display: flex;
		justify-content: space-between;
		align-items: center;
		column-gap: 8px;
	}

	.editor-wrapper {
		position: relative;
		width: 100%;
		height: 280px;
		margin-bottom: 16px;
	}

	.editor {
		position: relative;
		width: 100%;
		height: 100%;
		border-radius: 4px;
	}
</style>
