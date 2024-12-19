<template>
	<div class="tab-general">
		<UserCodeInput
			class="tab-general__field"
			:user-code="scheme.user_code"
			:disabled="isEditMode || loading"
			@update:user-code="updateScheme('user_code', $event)"
			@update:configuration-code="updateScheme('configuration_code', $event)"
		/>

		<div class="tab-general__row tab-general__row-1 mb-1">
			<FmTextField
				outlined
				:model-value="scheme.name"
				label="Name*"
				:disabled="loading"
				:error="validationData.name.isDirty && !validationData.name.isValid"
				:error-messages="
					validationData.name.isDirty && !validationData.name.isValid
						? ['This field may not blank']
						: []
				"
				@update:model-value="updateScheme('name', $event)"
			/>

			<FmTextField
				outlined
				:model-value="scheme.short_name"
				label="Short name"
				:disabled="loading"
				@update:model-value="updateScheme('short_name', $event)"
			/>
		</div>

		<div class="tab-general__row tab-general__row-2 mb-1">
			<FmTextField
				outlined
				:model-value="scheme.rule_expr"
				label="Expression for Transaction Type Selector"
				:disabled="loading"
				:error="
					validationData.rule_expr.isDirty && !validationData.rule_expr.isValid
				"
				:error-messages="
					validationData.rule_expr.isDirty && !validationData.rule_expr.isValid
						? ['This field may not blank']
						: []
				"
				@update:model-value="updateScheme('rule_expr', $event)"
			/>

			<ExpressionEditorSelector
				:rule-expr="scheme.rule_expr"
				:data="expressionEditorSelectorData"
				disallow-empty-value
				:disabled="loading"
				@update="updateScheme('rule_expr', $event)"
			/>

			<SelectorManager
				:selector-values="scheme.selector_values"
				:disabled="loading"
				@update="updateScheme('selector_values', $event)"
			/>
		</div>

		<div class="tab-general__row tab-general__row-3 mb-[26px]">
			<FmTextField
				outlined
				hide-details
				:model-value="scheme.data_preprocess_expression"
				label="Expression for File Preprocessing"
				:disabled="loading"
				@update:model-value="updateScheme('data_preprocess_expression', $event)"
			/>

			<ExpressionEditorSelector
				:rule-expr="scheme.data_preprocess_expression"
				:data="expressionEditorSelectorData"
				:disabled="loading"
				@update="updateScheme('data_preprocess_expression', $event)"
			/>
		</div>

		<div class="tab-general__row tab-general__row-4">
			<div class="tab-general__cell">
				<FmSelect
					variant="outlined"
					label="Error handling"
					:options="ERROR_HANDLER_OPTIONS"
					:model-value="scheme.error_handler"
					:disabled="loading"
					@update:model-value="updateScheme('error_handler', $event)"
				/>
			</div>

			<div class="tab-general__cell">
				<FmSelect
					variant="outlined"
					label="Separator"
					:options="SEPARATORS_OPTIONS"
					:model-value="scheme.delimiter"
					:disabled="loading"
					@update:model-value="updateScheme('delimiter', $event)"
				/>
			</div>

			<div class="tab-general__cell">
				<FmSelect
					variant="outlined"
					label="Import Rules - if object is not found"
					:options="DATA_HANDLER_OPTIONS"
					:model-value="scheme.missing_data_handler"
					:disabled="loading"
					@update:model-value="updateScheme('missing_data_handler', $event)"
				/>
			</div>

			<FmTextField
				outlined
				:model-value="scheme.spreadsheet_start_cell"
				label="Spreadsheet start cell"
				:disabled="loading"
				:error="
					validationData.spreadsheet_start_cell.isDirty &&
					!validationData.spreadsheet_start_cell.isValid
				"
				:error-messages="
					validationData.spreadsheet_start_cell.isDirty &&
					!validationData.spreadsheet_start_cell.isValid
						? ['This field may not blank']
						: []
				"
				@update:model-value="updateScheme('spreadsheet_start_cell', $event)"
			/>

			<FmTextField
				outlined
				:model-value="scheme.spreadsheet_active_tab_name"
				label="Spreadsheet active tab"
				:disabled="loading"
				@update:model-value="
					updateScheme('spreadsheet_active_tab_name', $event)
				"
			/>

			<div class="tab-general__cell">
				<FmSelect
					variant="outlined"
					label="Column Matcher"
					:options="COLUMN_MATCHER_OPTIONS"
					:model-value="scheme.column_matcher"
					:disabled="loading"
					@update:model-value="updateScheme('column_matcher', $event)"
				/>
			</div>
		</div>

		<FmCheckbox
			class="tab-general__checkbox"
			:model-value="scheme.has_header_row"
			label="Has header row"
			:disabled="loading"
			@update:model-value="updateScheme('has_header_row', $event)"
		/>

		<div class="tab-general__row tab-general__row-1 mb-[26px]">
			<FmTextField
				outlined
				hide-details
				:model-value="scheme.filter_expression"
				label="Filter Expression"
				:disabled="loading"
				@update:model-value="updateScheme('filter_expression', $event)"
			/>
		</div>

		<div class="tab-general__row tab-general__row-1 mb-[26px]">
			<FmSelect
				variant="outlined"
				label="Transaction Unique Code Settings"
				:options="BOOK_UNIQUENESS_OPTIONS"
				:model-value="scheme.book_uniqueness_settings"
				:disabled="loading"
				@update:model-value="updateScheme('book_uniqueness_settings', $event)"
			/>
		</div>

		<div class="tab-general__row tab-general__row-1">
			<FmTextField
				outlined
				type="nuber"
				:model-value="scheme.expression_iterations_count"
				label="Expression Iterations Count"
				:disabled="loading"
				:error="
					validationData.expression_iterations_count.isDirty &&
					!validationData.expression_iterations_count.isValid
				"
				:error-messages="
					validationData.expression_iterations_count.isDirty &&
					!validationData.expression_iterations_count.isValid
						? ['This field may not blank']
						: []
				"
				@update:model-value="
					updateScheme('expression_iterations_count', $event)
				"
			/>
		</div>
	</div>
</template>

<script setup>
	import { computed, nextTick, ref } from 'vue';
	import cloneDeep from 'lodash/cloneDeep';
	import set from 'lodash/set';
	import size from 'lodash/size';
	import {
		BOOK_UNIQUENESS_OPTIONS,
		COLUMN_MATCHER_OPTIONS,
		ERROR_HANDLER_OPTIONS,
		DATA_HANDLER_OPTIONS,
		SEPARATORS_OPTIONS
	} from '../constants-tab-general';
	import { FmCheckbox, FmTextField, FmSelect } from '@finmars/ui';
	import { getFunctions } from '~/components/modal/importSchemes/utils';
	import { generalTabFormatItem } from './utils';
	import UserCodeInput from '~/components/common/UserCodeInput/UserCodeInput.vue';
	import ExpressionEditorSelector from '~/components/common/ExpressionEditorSelector/ExpressionEditorSelector.vue';
	import SelectorManager from '~/components/common/SelectorManager/SelectorManager.vue';

	const props = defineProps({
		scheme: {
			type: Object
		},
		isEditMode: {
			type: Boolean
		},
		loading: {
			type: Boolean
		}
	});

	const emits = defineEmits(['update:scheme', 'update:valid']);

	const validationData = ref({
		name: { isDirty: false, isValid: true },
		rule_expr: { isDirty: false, isValid: true },
		user_code: { isDirty: false, isValid: true },
		spreadsheet_start_cell: { isDirty: false, isValid: true },
		expression_iterations_count: { isDirty: false, isValid: true }
	});

	const isTabFieldsValuesValid = computed(
		() => !Object.values(validationData.value).some((v) => !v.isValid)
	);

	const schemeInputs = computed(() => {
		if (!size(props.scheme.inputs)) {
			return [];
		}

		return props.scheme.inputs
			.map(generalTabFormatItem)
			.sort((a, b) => a.column - b.column);
	});

	const expressionEditorSelectorData = computed(() => {
		return {
			groups: [{ name: '<b>Imported</b>', key: 'input' }],
			functions: [getFunctions(schemeInputs.value)]
		};
	});

	function validateTabFields(data) {
		Object.keys(validationData.value).forEach((key) => {
			validationData.value[key].isValid = !!data[key];
		});
		nextTick(() => {
			emits('update:valid', isTabFieldsValuesValid.value);
		});
	}

	async function updateScheme(field, value) {
		await nextTick(() => {
			if (validationData.value[field] && !validationData.value[field].isDirty) {
				validationData.value[field].isDirty = true;
			}
			const updatedScheme = cloneDeep(props.scheme);
			set(updatedScheme, field, value);
			validateTabFields(updatedScheme);
			emits('update:scheme', updatedScheme);
		});
	}
</script>

<style lang="scss" scoped>
	.tab-general {
		position: relative;
		width: 100%;
		height: 100%;
		padding: 24px;
		overflow-y: auto;
		color: var(--on-surface);

		&__row {
			display: grid;
			column-gap: 16px;

			&-1 {
				grid-template-columns: 1fr 1fr;
			}

			&-2 {
				grid-template-columns: auto 200px 200px;
			}

			&-3 {
				grid-template-columns: auto 200px;
			}

			&-4 {
				grid-template-columns: repeat(6, 1fr);
			}
		}

		&__field {
			margin-bottom: 16px;
		}

		&__checkbox {
			margin-bottom: 16px;

			:deep(.v-input__control) {
				.v-checkbox-btn {
					column-gap: 8px;

					.v-label {
						font-size: 16px;
						color: var(--on-surface);
					}
				}
			}
		}
	}
</style>
