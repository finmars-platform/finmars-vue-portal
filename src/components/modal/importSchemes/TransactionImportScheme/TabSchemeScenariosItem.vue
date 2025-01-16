<template>
	<div class="scenarios-item">
		<div class="scenarios-item__row">
			<FmTextField
				outlined
				compact
				hide-details
				label="Scenarion Name"
				class="scenarios-item__cell"
				:model-value="scenario.name"
				@change="updateScenarioField('name', $event)"
			/>

			<div v-if="!isNotMainScenario" class="scenarios-item__cell">
				<FmSelect
					variant="outlined"
					compact
					label="Status"
					:options="SCENARIO_STATUS_OPTIONS"
					:model-value="scenario.status"
					@update:model-value="updateScenario('status', $event)"
				/>
			</div>

			<div v-if="!isNotMainScenario" class="scenarios-item__cell">
				<MultipleSelectWithTransfer
					:model-value="scenario.selector_values"
					:options="selectorValuesOptions"
					label="Selector values"
					compact
					@update:model-value="
						updateScenarioFieldMultiple('selector_values', $event)
					"
				/>
			</div>

			<div class="scenarios-item__type">
				<FmTooltip type="secondary" location="top">
					<template #activator="{ props }">
						<FmSearch
							v-bind="props"
							:model-value="scenario.transaction_type"
							:items="transactionTypes"
							:loading="isProcessing"
							:readonly="isProcessing"
							@update:model-value="updateScenarioTransactionType($event)"
						/>
					</template>

					<span>{{ scenario.transaction_type }}</span>
				</FmTooltip>
			</div>

			<div class="scenarios-item__actions">
				<FmTooltip type="secondary" location="top">
					<template #activator="{ props }">
						<FmIconButton
							v-bind="props"
							icon="mdi-view-list"
							variant="outlined"
							@click.stop.prevent="isListOpened = !isListOpened"
						/>
					</template>

					<span>{{ isListOpened ? 'Hide ' : 'Show ' }}inputs</span>
				</FmTooltip>

				<FmTooltip type="secondary" location="top">
					<template #activator="{ props }">
						<FmIconButton
							v-bind="props"
							icon="mdi-pencil"
							variant="outlined"
							@click.stop.prevent="openTransactionTypeEditor"
						/>
					</template>

					<span>Edit transaction type</span>
				</FmTooltip>

				<FmTooltip v-if="!isNotMainScenario" type="secondary" location="top">
					<template #activator="{ props }">
						<FmIconButton
							v-bind="props"
							icon="mdi-close"
							variant="outlined"
							@click.stop.prevent="removeItem"
						/>
					</template>

					<span>Delete scenario</span>
				</FmTooltip>
			</div>
		</div>

		<div v-if="scenario.error_message" class="scenarios-item__error">
			{{ scenario.error_message }}
		</div>

		<div v-if="isListOpened && !isProcessing" class="scenarios-item__inputs">
			<div
				v-for="typeInput in scenario.frontOptions?.transactionTypeInputs"
				:key="typeInput.id"
				class="scenarios-item__type-input"
			>
				<div class="scenarios-item__type-input-label">
					<span>{{ typeInput.verbose_name }}</span>
					<span>
						Input: <b>{{ typeInput.name }}</b>
					</span>
				</div>

				<div class="scenarios-item__type-input-value">
					<FmTextField
						:model-value="typeInput.expression"
						outlined
						compact
						hide-details
						:label="getLabelOfScenarioInputValueType(typeInput.value_type)"
						@update:model-value="updateScenarioExpression(typeInput, $event)"
					/>
				</div>

				<ExpressionEditorSelector
					class="scenarios-item__type-input-expression"
					:rule-expr="typeInput.expression"
					:data="expressionEditorSelectorData"
					menu-location="end"
					:disabled="isProcessing"
					@update="updateScenarioExpression(typeInput, $event)"
				>
					<template #activator>
						<FmIconButton icon="mdi-dots-horizontal" variant="outlined" />
					</template>
				</ExpressionEditorSelector>

				<FmTooltip
					v-if="typeInput.dryRunResult"
					type="secondary"
					location="top"
				>
					<template #activator="{ props }">
						<div v-bind="props" class="scenarios-item__dry-run-result">
							{{ typeInput.dryRunResult }}
						</div>
					</template>

					<span>{{ typeInput.dryRunResult }}</span>
				</FmTooltip>
			</div>
		</div>
	</div>
</template>

<script setup>
	import { computed } from 'vue';
	import cloneDeep from 'lodash/cloneDeep';
	import size from 'lodash/size';
	import {
		FmIconButton,
		FmSearch,
		FmSelect,
		FmTextField,
		FmTooltip
	} from '@finmars/ui';
	import useApi from '~/composables/useApi';
	import useNotify from '~/composables/useNotify';
	import { SCENARIO_STATUS_OPTIONS } from '~/components/modal/importSchemes/TransactionImportScheme/constants-tab-scheme';
	import { getFunctions } from '~/components/modal/importSchemes/utils';
	import { generalTabFormatItem } from '~/components/modal/importSchemes/TransactionImportScheme/utils';
	import MultipleSelectWithTransfer from '~/components/common/MultipleSelectWithTransfer/MultipleSelectWithTransfer.vue';
	import ExpressionEditorSelector from '~/components/common/ExpressionEditorSelector/ExpressionEditorSelector.vue';

	const props = defineProps({
		scheme: {
			type: Object,
			default: () => ({})
		},
		scenario: {
			type: Object,
			default: () => ({})
		},
		selectorValuesOptions: {
			type: Array,
			default: () => []
		},
		transactionTypes: {
			type: Array,
			default: () => []
		},
		isNotMainScenario: {
			type: Boolean
		}
	});

	const emits = defineEmits(['update', 'remove']);

	const route = useRoute();
	const router = useRouter();

	const isProcessing = ref(false);
	const isListOpened = ref(false);

	const currentScenarioIndex = computed(() =>
		props.scheme.rule_scenarios.findIndex(
			(s) =>
				s.id === props.scenario.id ||
				s.frontOptions?.key === props.scenario.frontOptions?.key
		)
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

	function openTransactionTypeEditor() {
		const { realm_code, space_code } = route.params;
		const { transaction_type_object = {} } = props.scenario;
		const { user_code } = transaction_type_object;
		user_code &&
			router.push(
				`/${realm_code}/${space_code}/a/#!/data/transaction-type/${user_code}`
			);
	}

	function removeItem() {
		currentScenarioIndex.value !== -1 &&
			emits('remove', currentScenarioIndex.value);
	}

	function updateScenario(field, value) {
		const updatedScenario = cloneDeep(props.scenario);
		updatedScenario[field] = value;
		emits('update', {
			index: currentScenarioIndex.value,
			value: updatedScenario
		});
	}

	function updateScenarioField(field, value) {
		if (
			currentScenarioIndex.value !== -1 &&
			props.scheme.rule_scenarios[currentScenarioIndex.value][field] !== value
		) {
			updateScenario(field, value);
		}
	}

	function updateScenarioFieldMultiple(field, value) {
		const isChangeNecessary =
			JSON.stringify(
				props.scheme.rule_scenarios[currentScenarioIndex.value][field]
			) !== JSON.stringify(value);

		if (isChangeNecessary) {
			updateScenario(field, value);
		}
	}

	function updateScenarioExpression(typeInput, value) {
		const updatedScenarioFields = cloneDeep(props.scenario.fields);
		let isFieldChanged = false;
		updatedScenarioFields.forEach((field) => {
			if (field.transaction_type_input === typeInput.name) {
				field.value_expr = value;
				isFieldChanged = true;
			}
		});
		if (!isFieldChanged) {
			updatedScenarioFields.push({
				transaction_type_input: typeInput.name,
				value_expr: value
			});
		}
		updateScenario(
			'fields',
			updatedScenarioFields.filter((f) => f.value_expr)
		);
	}

	async function updateScenarioTransactionType(value) {
		if (
			currentScenarioIndex.value === -1 ||
			props.scheme.rule_scenarios[currentScenarioIndex.value]
				.transaction_type === value
		) {
			return;
		}

		try {
			isProcessing.value = true;
			const updatedScenario = cloneDeep(props.scenario);
			updatedScenario.transaction_type = value;

			const res = await useApi('transactionType.get', {
				filters: { user_code: value }
			});

			if (res.results) {
				delete updatedScenario.error_message;
				updatedScenario.transaction_type_object = res.results[0];
				updatedScenario.frontOptions.transactionTypeInputs =
					updatedScenario.transaction_type_object.inputs.filter(
						(i) => i.value_type !== 120
					);
			} else {
				updatedScenario.error_message = '⚠️ Transaction Type is not found';
				useNotify({
					type: 'error',
					title: 'Transaction type not found'
				});
			}

			emits('update', {
				index: currentScenarioIndex.value,
				value: updatedScenario
			});
		} catch (e) {
			console.error('The error of the transaction type list loading. ', e);
		} finally {
			isProcessing.value = false;
		}
	}

	function getLabelOfScenarioInputValueType(valueType) {
		switch (valueType) {
			case 10:
				return 'String';
			case 20:
				return 'Number';
			case 30:
				return 'Classifier';
			case 40:
				return 'Date';
			case 100:
				return 'Relation';
			default:
				return 'N/A';
		}
	}
</script>

<style lang="scss" scoped>
	.scenarios-item {
		position: relative;
		width: max-content;
		padding: 7px 0;
		margin-bottom: 4px;

		&__row {
			display: flex;
			justify-content: flex-start;
			align-items: center;
			column-gap: 4px;
		}

		&__cell {
			min-width: 200px;
			width: 200px;
			max-width: 200px;
		}

		&__type {
			position: relative;
			min-width: 250px;
			width: 250px;
			max-width: 250px;

			:deep(.fm-search) {
				.v-input__control {
					.v-field {
						border-radius: 4px !important;
						background-color: transparent !important;
						border: 1px solid var(--outline-variant);

						.v-field__prepend-inner {
							display: none;
						}

						.v-field__field {
							.v-field__input {
								min-height: 40px !important;
								padding: 7px 0 !important;
							}
						}
					}
				}
			}
		}

		&__actions {
			display: flex;
			justify-content: flex-start;
			align-items: center;
			column-gap: 8px;
			padding-left: 4px;
		}

		&__error {
			position: relative;
			width: 100%;
			padding: 8px 0;
			font-size: 14px;
			font-weight: 400;
			line-height: 22px;
			color: var(--error);
		}

		&__inputs {
			position: relative;
			width: 100%;
			padding: 16px;
			margin: 2px 0 16px;
			border-radius: 4px;
			border: 1px solid var(--outline-variant);
		}

		&__type-input {
			position: relative;
			width: 100%;
			padding: 8px 0;
			display: flex;
			justify-content: flex-start;
			align-items: center;
			column-gap: 8px;

			&-label {
				width: 280px;
				min-width: 280px;
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: flex-start;
				font-size: 14px;
				font-weight: 400;
				line-height: 22px;
			}

			&-value {
				position: relative;
				width: 140px;
				min-width: 140px;
			}

			&-expression {
				width: auto;
			}
		}

		&__dry-run-result {
			position: relative;
			max-width: 144px;
			padding: 0 8px;
			font-size: 14px;
			line-height: 24px;
			overflow: hidden;
			white-space: nowrap;
			text-overflow: ellipsis;
			border-radius: 4px;
			background-color: var(--secondary-container);
		}
	}
</style>
