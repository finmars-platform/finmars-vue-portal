<template>
	<div class="reference-table-editor">
		<div class="reference-table-editor__content">
			<div class="reference-table-editor__field">
				<FmTextField
					:model-value="editedTable.name"
					outlined
					label="Name"
					:error="formData.name.isDirty && !formData.name.isValid"
					:error-messages="
						formData.name.isDirty && !formData.name.isValid
							? 'This field may not be blank.'
							: ''
					"
					@change="updateField('name', $event)"
				/>
			</div>

			<div class="reference-table-editor__user-code-block">
				<UserCodeInput
					class="attribute-type__row"
					:user-code="editedTable.user_code"
					@update:user-code="updateField('user_code', $event)"
					@update:configuration-code="
						updateField('configuration_code', $event)
					"
					@update:valid="updateUserCodeValidationValue"
				/>
			</div>

			<div class="reference-table-editor__rows">
				<div class="reference-table-editor__rows-header">
					<div class="reference-table-editor__rows-header-cell">
						<span>Key</span>

						<FmTextField
							v-model="search.keys"
							compact
							label="Search for keys"
							hide-details
						/>
					</div>

					<div class="reference-table-editor__rows-header-cell">
						<span>Value</span>
						<FmTextField
							v-model="search.values"
							compact
							label="Search for values"
							hide-details
						/>
					</div>
				</div>

				<draggable
					:list="filteredRows"
					item-key="order"
					handle=".reference-table-editor__item-drag"
					chosen-class="reference-table-editor__item--chosen"
					drag-class="reference-table-editor__item--move"
					@end="onMoveItemEnd"
				>
					<template #item="{ element }">
						<div class="reference-table-editor__item">
							<div class="reference-table-editor__item-key">
								<FmIcon
									v-if="!search.values && !search.keys"
									class="reference-table-editor__item-drag"
									icon="mdi-drag"
									size="24"
									color="var(--on-surface)"
								/>

								<FmTextField
									:model-value="element.key"
									compact
									placeholder="Enter key"
									:error="
										element.isDirty.key &&
										!!element.errorMessage.key
									"
									:error-messages="
										element.isDirty.key &&
										!!element.errorMessage.key
											? element.errorMessage.key
											: ''
									"
									@change="
										updateRowField(element, 'key', $event)
									"
								/>
							</div>

							<div class="reference-table-editor__item-value">
								<FmTextField
									:model-value="element.value"
									compact
									placeholder="Enter value"
									:error="
										element.isDirty.value &&
										!!element.errorMessage.value
									"
									:error-messages="
										element.isDirty.value &&
										!!element.errorMessage.value
											? element.errorMessage.value
											: ''
									"
									@change="
										updateRowField(element, 'value', $event)
									"
								/>

								<FmIconButton
									variant="text"
									icon="mdi-delete"
									color="var(--error)"
									class="reference-table-editor__item-delete"
									@click.stop.prevent="deleteRow(element)"
								/>
							</div>
						</div>
					</template>
				</draggable>
			</div>

			<FmButton rounded @click.stop.prevent="addNewRow">
				Add New Row
			</FmButton>
		</div>

		<div class="reference-table-editor__actions">
			<FmButton
				type="secondary"
				rounded
				@click.stop.prevent="emits('close')"
			>
				Close
			</FmButton>

			<div class="reference-table-editor__actions-block">
				<FmButton
					type="tertiary"
					rounded
					:disabled="!editedTable?.id"
					@click.stop.prevent="makeCopy"
				>
					Make a copy
				</FmButton>

				<FmButton
					rounded
					:disabled="!isDirty || !isValid"
					@click.stop.prevent="save"
				>
					{{ table?.id ? 'Update' : 'Create' }}
				</FmButton>
			</div>
		</div>

		<div v-if="isProcessing" class="reference-table-editor__loader">
			<FmProgressCircular indeterminate size="80" />
		</div>
	</div>
</template>

<script setup>
	import { computed, onBeforeMount, ref } from 'vue';
	import cloneDeep from 'lodash/cloneDeep';
	import omit from 'lodash/omit';
	import draggable from 'vuedraggable';
	import {
		FmButton,
		FmIcon,
		FmIconButton,
		FmProgressCircular,
		FmTextField
	} from '@finmars/ui';
	import { create, update } from '~/services/referenceTablesService';
	import UserCodeInput from '~/components/common/UserCodeInput/UserCodeInput.vue';

	const EMPTY_TABLE = {
		name: '',
		user_code: '',
		configuration_code: '',
		rows: []
	};

	const props = defineProps({
		table: {
			type: [Object, null, undefined]
		}
	});

	const emits = defineEmits(['close', 'select', 'confirm']);

	const isProcessing = ref(false);
	const editedTable = ref(cloneDeep(EMPTY_TABLE));
	const formData = ref({
		name: {
			isDirty: false,
			isValid: true
		},
		configuration_code: {
			isDirty: false,
			skipValidation: true,
			isValid: true
		},
		user_code: {
			isDirty: false,
			skipValidation: true,
			isValid: true
		}
	});

	const search = ref({
		keys: '',
		values: ''
	});

	const filteredRows = computed(() =>
		(editedTable.value.rows || []).filter((row) => {
			const { key = '', value = '' } = row;
			return (
				key.toLowerCase().includes(search.value.keys.toLowerCase()) &&
				value.toLowerCase().includes(search.value.values.toLowerCase())
			);
		})
	);

	const isDirty = computed(
		() =>
			Object.values(formData.value).some((i) => i.isDirty) ||
			(editedTable.value.rows || []).some(
				(r) => r.isDirty.key || r.isDirty.value
			)
	);
	const isValid = computed(
		() =>
			!(
				Object.values(formData.value).some((i) => !i.isValid) ||
				(editedTable.value.rows || []).some(
					(r) => !!r.errorMessage.key || !!r.errorMessage.value
				)
			)
	);

	function prepareTableData(table, withValidation = false) {
		const data = cloneDeep(table || EMPTY_TABLE);
		if (withValidation) {
			Object.values(formData.value).forEach((i) => {
				i.isDirty = true;
			});
		}

		(data.rows || []).forEach((r) => {
			r.isDirty = {
				key: !!withValidation,
				value: !!withValidation
			};
			r.errorMessage = {
				key: '',
				value: ''
			};
		});

		editedTable.value = data;

		withValidation && validateForm();
	}

	function validateRows() {
		(editedTable.value.rows || []).forEach((row) => {
			const { key, value, order } = row;

			const doesKeyRepeat = !!editedTable.value.rows.find((r) => {
				if (r.order === order) {
					return false;
				}

				return r.key === key;
			});

			row.errorMessage = {
				key: !key
					? 'This field may not be blank.'
					: doesKeyRepeat
						? 'The such key already exists'
						: '',
				value: !value ? 'This field may not be blank.' : ''
			};
		});
	}

	function validateForm() {
		Object.keys(formData.value).forEach((field) => {
			if (!formData.value[field].skipValidation) {
				formData.value[field].isValid = !!editedTable.value[field];
			}
		});
		validateRows();
	}

	function onMoveItemEnd({ oldIndex, newIndex }) {
		const rows = cloneDeep(editedTable.value.rows);
		const item = rows.splice(oldIndex, 1)[0];
		rows.splice(newIndex, 0, item);
		rows.forEach((r, index) => {
			r.isDirty.key = true;
			r.isDirty.value = true;
			r.order = index;
		});
		editedTable.value.rows = rows;
		validateForm();
	}

	function updateUserCodeValidationValue(val) {
		formData.value.user_code.isValid = val;
		formData.value.configuration_code.isValid = val;
	}

	function updateField(field, value) {
		editedTable.value[field] = value;
		!formData.value[field].isDirty &&
			(formData.value[field].isDirty = true);
		validateForm();
	}

	function updateRowField(row, field, val) {
		const index = (editedTable.value.rows || []).findIndex(
			(r) =>
				(r.id !== undefined &&
					row.id !== undefined &&
					r.id === row.id) ||
				r.order === row.order
		);

		if (index !== -1) {
			editedTable.value.rows[index][field] = val;
			editedTable.value.rows[index].isDirty[field] = true;
		}
		validateForm();
	}

	function addNewRow() {
		editedTable.value.rows.push({
			key: '',
			value: '',
			order: editedTable.value.rows.length,
			isDirty: {
				key: true,
				value: true
			},
			errorMessage: {
				key: 'This field may not be blank.',
				value: 'This field may not be blank.'
			}
		});
		validateForm();
	}

	function deleteRow(row) {
		const rows = cloneDeep(editedTable.value.rows);
		const index = rows.findIndex(
			(r) => r.id === row.id || r.order === row.order
		);
		rows.splice(index, 1);
		rows.forEach((r, index) => {
			r.order = index;
		});
		editedTable.value.rows = rows;
		validateForm();
	}

	function makeCopy() {
		const processedTable = cloneDeep(editedTable.value);
		delete processedTable.id;
		processedTable.user_code = `${processedTable.user_code}_copy`;
		processedTable.rows = processedTable.rows.map((r) =>
			omit(r, ['isDirty', 'errorMessage'])
		);
		emits('select', { action: 'make:copy', value: processedTable });
		emits('confirm');
	}

	async function save() {
		try {
			isProcessing.value = true;

			const data = cloneDeep(editedTable.value);
			(data.rows || []).forEach((r) => {
				delete r.isDirty;
				delete r.isValid;
			});

			if (data.id) {
				await update(data);
			} else {
				await create(data);
			}

			emits('select', { action: 'save', value: data });
			emits('confirm');
		} finally {
			isProcessing.value = false;
		}
	}

	onBeforeMount(() => {
		const withValidation = props.table && !props.table.id;
		prepareTableData(props.table, withValidation);
	});
</script>

<style lang="scss" scoped>
	.reference-table-editor {
		position: relative;
		width: 100%;

		&__content {
			position: relative;
			width: 100%;
			min-height: 400px;
			max-height: 600px;
			padding: 0 24px 8px 24px;
			overflow-y: auto;
		}

		&__field {
			padding-top: 4px;
		}

		&__user-code-block {
			position: relative;
			width: 100%;
			padding: 16px 12px;
			border-radius: 8px;
			border: 1px solid var(--outline-variant);
		}

		&__rows {
			position: relative;
			width: 100%;
			padding: 16px 0;

			&-header {
				display: flex;
				width: 100%;
				justify-content: space-between;
				align-items: center;
				margin-bottom: 16px;

				&-cell {
					position: relative;
					width: 49%;
					padding-left: 24px;
					font: var(--title-medium-font);

					span {
						display: inline-block;
						margin-bottom: 8px;
					}
				}
			}
		}

		&__item {
			position: relative;
			width: 100%;
			min-height: 40px;
			padding: 8px 0 0;
			border-radius: 4px;
			border: 1px solid var(--outline-variant);
			margin-bottom: 4px;
			display: flex;
			justify-content: space-between;
			align-items: flex-start;
			column-gap: 4px;
			background-color: var(--surface);

			:deep(.fm-text-field) {
				--backgroundColor-fmTextField: transparent;
			}

			:deep(.v-input) {
				.v-input__details {
					box-sizing: border-box;
					padding-top: 2px;
					line-height: 1;
					min-height: 12px;
				}
			}

			&-key {
				position: relative;
				width: 49%;
				padding-left: 24px;
			}

			&-value {
				position: relative;
				width: 49%;
				padding: 0 48px 0 24px;
			}

			&-delete {
				position: absolute;
				right: 4px;
				top: 0;
			}

			&-drag {
				position: absolute;
				left: 0;
				top: 8px;
				cursor: move;
			}

			&--chosen {
				background-color: color-mix(
					in srgb,
					var(--on-surface) 8%,
					transparent
				);
			}

			&--move {
				background-color: var(--secondary-container);
			}
		}

		&__actions {
			display: flex;
			width: 100%;
			justify-content: space-between;
			align-items: center;
			padding: 24px;

			&-block {
				display: flex;
				justify-content: center;
				align-items: center;
				column-gap: 16px;
			}
		}

		button {
			text-transform: none;
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
