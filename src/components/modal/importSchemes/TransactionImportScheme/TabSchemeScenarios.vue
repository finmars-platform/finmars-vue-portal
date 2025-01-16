<template>
	<div class="tab-scheme-scenarios">
		<div class="tab-scheme-scenarios__label">{{ label }}</div>

		<div class="tab-scheme-scenarios__body">
			<FmTextField
				v-model="searchText"
				outlined
				compact
				hide-details
				placeholder="Search"
			/>

			<div class="tab-scheme-scenarios__content">
				<template
					v-for="item in filteredRuleScenarios"
					:key="item.frontOptions?.key"
				>
					<TabSchemeScenariosItem
						:scheme="scheme"
						:scenario="item"
						:selector-values-options="selectorValuesOptions"
						:transaction-types="transactionTypes"
						@update="updateScenarios"
						@remove="removeScenario"
					/>
				</template>

				<FmButton
					class="tab-scheme-scenarios__add-btn"
					type="secondary"
					rounded
					@click.stop.prevent="addScenario"
				>
					Add scenario
				</FmButton>

				<h3 class="tab-scheme-scenarios__sub-label">Default Rule Scenario</h3>

				<TabSchemeScenariosItem
					:scheme="scheme"
					:scenario="defaultRuleScenario"
					:selector-values-options="selectorValuesOptions"
					:transaction-types="transactionTypes"
					:is-not-main-scenario="true"
					@update="updateScenarios"
				/>

				<h3 class="tab-scheme-scenarios__sub-label">Error Rule Scenario</h3>

				<TabSchemeScenariosItem
					:scheme="scheme"
					:scenario="errorRuleScenario"
					:selector-values-options="selectorValuesOptions"
					:transaction-types="transactionTypes"
					:is-not-main-scenario="true"
					@update="updateScenarios"
				/>
			</div>
		</div>
	</div>
</template>

<script setup>
	import { computed, onBeforeMount, ref } from 'vue';
	import size from 'lodash/size';
	import cloneDeep from 'lodash/cloneDeep';
	import { FmButton, FmTextField } from '@finmars/ui';
	import useApi from '~/composables/useApi';
	import { getRuleScenarioTplt, schemeTabFormatItem } from './utils';
	import TabSchemeScenariosItem from './TabSchemeScenariosItem.vue';

	const props = defineProps({
		label: {
			type: String
		},
		scheme: {
			type: Object,
			default: () => ({})
		},
		dryRunResultActiveItem: {
			type: Object,
			default: () => ({})
		}
	});

	const emits = defineEmits(['update:block']);

	const isTransactionTypesLoading = ref(false);
	const searchText = ref('');
	const transactionTypes = ref([]);

	const defaultRuleScenario = ref(
		getRuleScenarioTplt({ name: '-', is_default_rule_scenario: true })
	);
	const errorRuleScenario = ref(
		getRuleScenarioTplt({ name: '-', is_error_rule_scenario: true })
	);

	const ruleScenarios = computed(() => {
		if (!size(props.scheme.rule_scenarios)) {
			return [];
		}

		return props.scheme.rule_scenarios.reduce((res, s) => {
			const item = schemeTabFormatItem(
				s,
				'scenarios',
				props.dryRunResultActiveItem
			);
			if (item.transaction_type_object) {
				item.frontOptions.transactionTypeInputs =
					s.transaction_type_object.inputs.filter((i) => i.value_type !== 120);
			} else {
				item.error_message = '⚠️ Transaction Type is not found';
			}

			if (item.frontOptions.transactionTypeInputs) {
				item.frontOptions.transactionTypeInputs.forEach((t) => {
					item.fields.forEach((f) => {
						if (f.transaction_type_input === t.name) {
							t.expression = f.value_expr;
						}
					});
				});
			} else {
				item.frontOptions.transactionTypeInputs = [];
			}

			if (item.is_default_rule_scenario) {
				defaultRuleScenario.value = item;
			} else if (item.is_error_rule_scenario) {
				errorRuleScenario.value = item;
			} else {
				res.push(item);
			}

			return res;
		}, []);
	});

	const filteredRuleScenarios = computed(() => {
		if (!searchText.value) {
			return ruleScenarios.value;
		}

		const search = (searchText.value || '').toLowerCase();
		return ruleScenarios.value.filter((i) => {
			const {
				name = '',
				status = '',
				selector_values = [],
				transaction_type = ''
			} = i;
			const hasInSelector = selector_values.some((v) =>
				v.toLowerCase().includes(search)
			);
			return (
				hasInSelector ||
				name.toLowerCase().includes(search) ||
				status.toLowerCase().includes(search) ||
				transaction_type.toLowerCase().includes(search)
			);
		});
	});

	const selectorValuesOptions = computed(() =>
		props.scheme?.selector_values.map((s) => ({
			title: s.value,
			value: s.value
		}))
	);

	function updateScenarios({ index, value }) {
		const updatedBlock = cloneDeep(props.scheme.rule_scenarios);
		updatedBlock[index] = value;
		emits('update:block', updatedBlock);
	}

	function addScenario() {
		const updatedBlock = cloneDeep(props.scheme.rule_scenarios);
		updatedBlock.push(getRuleScenarioTplt({ name: '' }));
		emits('update:block', updatedBlock);
	}

	function removeScenario(index) {
		const updatedBlock = cloneDeep(props.scheme.rule_scenarios);
		updatedBlock.splice(index, 1);
		emits('update:block', updatedBlock);
	}

	async function getTransactionTypes() {
		try {
			isTransactionTypesLoading.value = true;
			const res = await useApi('transactionTypeLight.get', {
				filters: { pageSize: 1000, page: 1 }
			});
			if (res && res.results) {
				transactionTypes.value = res.results.map((i) => ({
					title: `${i.name} (${i.user_code})`,
					value: i.user_code
				}));
			}
		} catch (e) {
			console.error('The loading transaction types error. ', e);
		} finally {
			isTransactionTypesLoading.value = false;
		}
	}

	onBeforeMount(() => {
		getTransactionTypes();
	});
</script>

<style lang="scss" scoped>
	.tab-scheme-scenarios {
		position: relative;
		width: 100%;
		height: 100%;
		border-radius: 8px;

		&__label {
			position: absolute;
			left: 12px;
			top: -10px;
			font-size: 12px;
			font-weight: 400;
			line-height: 18px;
			color: var(--on-surface-variant);
			background-color: var(--surface);
			padding: 0 4px;
			z-index: 1;
		}

		&__body {
			position: relative;
			width: 100%;
			height: 100%;
			padding: 8px;
			border-radius: 8px;
			border: 1px solid var(--outline-variant);
			overflow-y: auto;
		}

		&__content {
			position: relative;
			width: 100%;
			height: calc(100% - 48px);
			margin-top: 8px;
			overflow-y: auto;
			overflow-x: auto;
		}

		&__add-btn {
			text-transform: none;
			margin: 8px 0;
		}

		&__sub-label {
			font-size: 16px;
			font-weight: 500;
			line-height: 24px;
			margin: 16px 0;
		}
	}
</style>
