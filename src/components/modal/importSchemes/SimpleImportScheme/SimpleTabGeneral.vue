<template>
	<div class="simple-tab-general">
		<UserCodeInput
			class="simple-tab-general__field"
			:user-code="scheme.user_code"
			:disabled="isEditMode || loading"
			@update:user-code="updateScheme('user_code', $event)"
			@update:configuration-code="
				updateScheme('configuration_code', $event)
			"
		/>

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
			class="simple-tab-general__field"
			outlined
			hide-details
			:model-value="scheme.short_name"
			label="Short name"
			:disabled="loading"
			@update:model-value="updateScheme('short_name', $event)"
		/>

		<div class="simple-tab-general__row simple-tab-general__row-1 mb-4">
			<FmTextField
				outlined
				hide-details
				:model-value="scheme.filter_expr"
				label="Filter Condition (line is imported if the Filter Expression
                                                    returns True,
                                                    executed before the conversions)"
				:disabled="loading"
				@update:model-value="updateScheme('filter_expr', $event)"
			/>

			<div class="simple-tab-general__expression-editor">
				<ExpressionEditorSelector
					menu-location="end"
					:rule-expr="scheme.filter_expr"
					:data="expressionEditorSelectorData"
					:disabled="loading"
					@update="updateScheme('filter_expr', $event)"
				>
					<template #activator>
						<FmIconButton
							icon="mdi-dots-horizontal"
							variant="outlined"
						/>
					</template>
				</ExpressionEditorSelector>
			</div>
		</div>

		<div class="simple-tab-general__row simple-tab-general__row-2 mb-4">
			<div class="simple-tab-general__cell">
				<FmSelect
					variant="outlined"
					label="Error handling"
					:options="ERROR_HANDLER_OPTIONS"
					:model-value="scheme.error_handler"
					:disabled="loading"
					@update:model-value="updateScheme('error_handler', $event)"
				/>
			</div>

			<div class="simple-tab-general__cell">
				<FmSelect
					variant="outlined"
					label="Separator"
					:options="SEPARATORS_OPTIONS"
					:model-value="scheme.delimiter"
					:disabled="loading"
					@update:model-value="updateScheme('delimiter', $event)"
				/>
			</div>

			<div class="simple-tab-general__cell">
				<FmSelect
					variant="outlined"
					label="Mode"
					:options="MODE_OPTIONS"
					:model-value="scheme.mode"
					:disabled="loading"
					@update:model-value="updateScheme('mode', $event)"
				/>
			</div>

			<div class="simple-tab-general__cell">
				<FmSelect
					variant="outlined"
					label="Import Rules - if object is not found"
					:options="DATA_HANDLER_OPTIONS"
					:model-value="scheme.missing_data_handler"
					:disabled="loading"
					@update:model-value="
						updateScheme('missing_data_handler', $event)
					"
				/>
			</div>

			<div class="simple-tab-general__cell">
				<FmSelect
					variant="outlined"
					label="Import Rules - If User Attribute-Classifier doesn't have such category"
					:options="CLASSIFIER_HANDLER_OPTIONS"
					:model-value="scheme.classifier_handler"
					:disabled="loading"
					@update:model-value="
						updateScheme('classifier_handler', $event)
					"
				/>
			</div>
		</div>

		<div class="simple-tab-general__row simple-tab-general__row-2">
			<div class="simple-tab-general__cell">
				<FmSelect
					variant="outlined"
					label="Column Matcher"
					:options="COLUMN_MATCHER_OPTIONS"
					:model-value="scheme.column_matcher"
					:disabled="loading"
					@update:model-value="updateScheme('column_matcher', $event)"
				/>
			</div>

			<FmTextField
				outlined
				:model-value="scheme.spreadsheet_start_cell"
				label="Spreadsheet start cell*"
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
				@update:model-value="
					updateScheme('spreadsheet_start_cell', $event)
				"
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

			<FmTextField
				v-if="scheme.content_type === 'instruments.instrument'"
				outlined
				:model-value="scheme.instrument_reference_column"
				label="Reference column"
				:disabled="loading"
				@update:model-value="
					updateScheme('instrument_reference_column', $event)
				"
			/>
		</div>
	</div>
</template>

<script setup>
	import { computed, nextTick, ref } from 'vue';
	import cloneDeep from 'lodash/cloneDeep';
	import set from 'lodash/set';
	import { FmIconButton, FmSelect, FmTextField } from '@finmars/ui';
	import { getFunctions } from '~/components/modal/importSchemes/utils';
	import {
		CLASSIFIER_HANDLER_OPTIONS,
		DATA_HANDLER_OPTIONS,
		ERROR_HANDLER_OPTIONS,
		COLUMN_MATCHER_OPTIONS,
		MODE_OPTIONS,
		SEPARATORS_OPTIONS
	} from '~/components/modal/importSchemes/constants-tab-general';
	import UserCodeInput from '~/components/common/UserCodeInput/UserCodeInput.vue';
	import ExpressionEditorSelector from '~/components/common/ExpressionEditorSelector/ExpressionEditorSelector.vue';

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
		user_code: { isDirty: false, isValid: true },
		spreadsheet_start_cell: { isDirty: false, isValid: true }
	});

	const isTabFieldsValuesValid = computed(
		() => !Object.values(validationData.value).some((v) => !v.isValid)
	);

	const expressionEditorSelectorData = computed(() => {
		return {
			groups: [{ name: '<b>Imported</b>', key: 'input' }],
			functions: [getFunctions(props.scheme.csv_fields)]
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
			if (
				validationData.value[field] &&
				!validationData.value[field].isDirty
			) {
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
	.simple-tab-general {
		position: relative;
		width: 100%;
		height: 100%;
		padding: 24px;
		overflow-y: auto;
		color: var(--on-surface);

		&__field {
			margin-bottom: 16px;
		}

		&__row {
			display: grid;
			column-gap: 16px;

			&-1 {
				grid-template-columns: auto 56px;
			}

			&-2 {
				grid-template-columns: 1fr 1fr 1fr 1fr 2fr;
			}
		}

		&__expression-editor {
			position: relative;
			width: 100%;
			height: 100%;
			padding: 8px;
		}
	}
</style>
