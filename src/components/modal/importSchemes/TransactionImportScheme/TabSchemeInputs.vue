<template>
	<div class="tab-scheme-inputs">
		<div class="tab-scheme-inputs__label">{{ label }}</div>

		<div class="tab-scheme-inputs__body">
			<FmTextField
				v-model="searchText"
				outlined
				compact
				hide-details
				placeholder="Search"
			/>

			<div class="tab-scheme-inputs__content">
				<draggable
					:list="filteredInputs"
					:item-key="(item) => item.frontOptions?.key"
					handle=".tab-scheme-inputs__item-drag"
					chosen-class="tab-scheme-inputs__item--chosen"
					drag-class="tab-scheme-inputs__item--move"
					@end="onMoveItemEnd"
				>
					<template #item="{ element }">
						<div
							:class="[
								'tab-scheme-inputs__item',
								{
									'tab-scheme-inputs__item--with-result':
										!!dryRunResultActiveItem
								}
							]"
						>
							<FmIcon
								v-if="!searchText"
								class="tab-scheme-inputs__item-drag"
								icon="mdi-drag"
								size="20"
								color="var(--on-surface)"
							/>

							<FmTextField
								v-if="block === 'inputs'"
								:class="[
									{
										'tab-scheme-inputs__cell-3':
											block === 'inputs',
										'tab-scheme-inputs__cell-2':
											block === 'calculated_inputs'
									}
								]"
								outlined
								compact
								label="Column name"
								:model-value="element.column_name"
								@change="
									updateField(element, 'column_name', $event)
								"
							/>

							<FmTextField
								:class="[
									{
										'tab-scheme-inputs__cell-3':
											block === 'inputs',
										'tab-scheme-inputs__cell-2':
											block === 'calculated_inputs'
									}
								]"
								outlined
								compact
								label="Name"
								:model-value="element.name"
								:error="
									!!element.frontOptions.validateError?.name
								"
								:error-messages="
									!!element.frontOptions.validateError?.name
										? [
												element.frontOptions
													.validateError.name
											]
										: []
								"
								@change="updateField(element, 'name', $event)"
							/>

							<FmTooltip type="secondary" location="top">
								<template #activator="{ props }">
									<div
										:class="[
											'tab-scheme-inputs__expr-editor',
											{
												'tab-scheme-inputs__cell-3':
													block === 'inputs',
												'tab-scheme-inputs__cell-2':
													block ===
													'calculated_inputs',
												'tab-scheme-inputs__expr-editor--error':
													!!element.frontOptions
														.validateError
														?.name_expr
											}
										]"
										v-bind="props"
										v-ripple.center
										@click.stop.prevent="
											openExpressionEditor(
												element,
												element.name_expr
											)
										"
									>
										<FmIcon
											icon="mdi-sigma"
											size="20"
											color="var(--on-surface)"
										/>

										<span>{{ element.name_expr }}</span>

										<div
											v-if="
												!!element.frontOptions
													.validateError?.name_expr
											"
											class="tab-scheme-inputs__expr-editor-messages"
										>
											{{
												element.frontOptions
													.validateError?.name_expr
											}}
										</div>
									</div>
								</template>

								<span>{{ element.name_expr }}</span>
							</FmTooltip>

							<FmIconButton
								class="tab-scheme-inputs__del-btn"
								v-ripple.center
								icon="mdi-close"
								variant="outlined"
								@click.stop.prevent="removeItem(element.column)"
							/>

							<FmTooltip
								v-if="element.dryRunResult"
								type="secondary"
								location="top"
							>
								<template #activator="{ props }">
									<div
										v-bind="props"
										class="tab-scheme-inputs__item-result"
									>
										{{ element.dryRunResult }}
									</div>
								</template>

								<span>{{ element.dryRunResult }}</span>
							</FmTooltip>
						</div>
					</template>
				</draggable>

				<FmButton
					class="tab-scheme-inputs__add-btn"
					type="secondary"
					rounded
					@click.stop.prevent="addField"
				>
					Add field
				</FmButton>
			</div>
		</div>

		<div v-if="isProcessing" class="tab-scheme-inputs__loader">
			<FmProgressCircular indeterminate size="80" />
		</div>

		<ExpressionEditor
			v-if="expressionEditor.show"
			:rule-expr="expressionEditor.ruleExpr"
			:data="expressionEditorData"
			disallow-empty-value
			@close="expressionEditor.show = false"
			@update="onExpressionEditorUpdate"
		/>
	</div>
</template>

<script setup>
	import { computed, nextTick, ref, watch } from 'vue';
	import draggable from 'vuedraggable';
	import cloneDeep from 'lodash/cloneDeep';
	import size from 'lodash/size';
	import {
		FmButton,
		FmIcon,
		FmIconButton,
		FmTextField,
		FmProgressCircular,
		FmTooltip,
		Ripple,
		getRandomString
	} from '@finmars/ui';
	import { getFunctions } from '~/components/modal/importSchemes/utils';
	import ExpressionEditor from '~/components/common/ExpressionEditorSelector/ExpressionEditor.vue';
	import { schemeTabFormatItem } from '~/components/modal/importSchemes/TransactionImportScheme/utils';

	const vRipple = Ripple;

	const props = defineProps({
		block: {
			type: String,
			validator(value) {
				return ['inputs', 'calculated_inputs'].includes(value);
			}
		},
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

	const emits = defineEmits(['update:block', 'update:valid']);

	const searchText = ref('');
	const isProcessing = ref(false);

	const expressionEditor = ref({
		show: false,
		item: null,
		ruleExpr: ''
	});

	const schemeInputs = computed(() => getSchemeInputsData(props.block));

	const filteredInputs = computed(() => {
		if (!searchText.value) {
			return schemeInputs.value;
		}

		const search = (searchText.value || '').toLowerCase();
		return schemeInputs.value.filter((i) => {
			const { name = '', name_expr = '', column_name = '' } = i;
			return props.block === 'inputs'
				? name.toLowerCase().includes(search) ||
						name_expr.toLowerCase().includes(search) ||
						column_name.toLowerCase().includes(search)
				: name.toLowerCase().includes(search) ||
						name_expr.toLowerCase().includes(search);
		});
	});

	const expressionEditorData = computed(() => {
		return {
			groups: [{ name: '<b>Imported</b>', key: 'input' }],
			functions: [getFunctions(getSchemeInputsData('inputs'))]
		};
	});

	const isBlockValid = computed(
		() =>
			!schemeInputs.value.some((i) => {
				const { frontOptions = {} } = i;
				const { validateError = {} } = frontOptions;
				return !!validateError.name || !!validateError.name_expr;
			})
	);

	function getFieldValidationError(item, fieldName) {
		return !item[fieldName] ? 'This field may not blank' : '';
	}

	function getSchemeInputsData(block) {
		if (!size(props.scheme[block])) {
			return [];
		}

		return props.scheme[block]
			.map((i) => {
				const processedItem = schemeTabFormatItem(
					i,
					block,
					props.dryRunResultActiveItem
				);
				processedItem.frontOptions.validateError = {
					name: getFieldValidationError(i, 'name'),
					name_expr: getFieldValidationError(i, 'name_expr')
				};
				return processedItem;
			})
			.sort((a, b) => a.column - b.column);
	}

	function onMoveItemEnd() {
		isProcessing.value = true;
		const updatedInputs = cloneDeep(props.scheme[props.block]);
		updatedInputs.forEach((_, index) => {
			updatedInputs[index].column = index + 1;
		});
		emits('update:block', updatedInputs);
		nextTick(() => {
			isProcessing.value = false;
		});
	}

	function updateField(item, field, value) {
		const index = props.scheme[props.block].findIndex(
			(i) =>
				i.id === item.id ||
				i.frontOptions?.key === item.frontOptions?.key
		);
		if (index !== -1 && props.scheme[props.block][index][field] !== value) {
			isProcessing.value = true;
			const updatedInputs = cloneDeep(props.scheme[props.block]);
			updatedInputs[index][field] = value;
			emits('update:block', updatedInputs);
			nextTick(() => {
				isProcessing.value = false;
			});
		}
	}

	function openExpressionEditor(item, ruleExpr) {
		expressionEditor.value = {
			show: true,
			ruleExpr,
			item
		};
	}

	function onExpressionEditorUpdate(value) {
		const { item } = expressionEditor.value;
		const index = props.scheme[props.block].findIndex(
			(i) =>
				i.id === item.id ||
				i.frontOptions?.key === item.frontOptions?.key
		);

		if (
			index !== -1 &&
			props.scheme[props.block][index].name_expr !== value
		) {
			isProcessing.value = true;
			const updatedInputs = cloneDeep(props.scheme[props.block]);
			updatedInputs[index].name_expr = value;
			emits('update:block', updatedInputs);
			expressionEditor.value.item = null;
			expressionEditor.value.ruleExpr = '';
			nextTick(() => {
				isProcessing.value = false;
			});
		}
	}

	function removeItem(column) {
		isProcessing.value = true;
		const updatedInputs = cloneDeep(props.scheme[props.block]);
		const index = updatedInputs.findIndex((i) => i.column === column);
		if (index !== -1) {
			updatedInputs.splice(index, 1);
			updatedInputs.forEach((_, ind) => {
				updatedInputs[ind].column = ind + 1;
			});
			emits('update:block', updatedInputs);
		}

		nextTick(() => {
			isProcessing.value = false;
		});
	}

	function addField() {
		isProcessing.value = true;
		const updatedInputs = cloneDeep(props.scheme[props.block]);
		updatedInputs.push({
			name: '',
			column: size(schemeInputs.value) + 1,
			frontOptions: {
				key: getRandomString(5)
			}
		});
		emits('update:block', updatedInputs);
		nextTick(() => {
			isProcessing.value = false;
		});
	}

	watch(
		() => isBlockValid.value,
		(val, oVal) => {
			if (val !== oVal) {
				emits('update:valid', val);
			}
		},
		{
			immediate: true
		}
	);
</script>

<style lang="scss" scoped>
	.tab-scheme-inputs {
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

		&__item {
			position: relative;
			width: 100%;
			padding: 8px 48px 0 24px;
			border-radius: 4px;
			border: 1px solid var(--outline-variant);
			margin-bottom: 4px;
			display: flex;
			justify-content: flex-start;
			align-items: flex-start;
			column-gap: 4px;

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

			&-drag {
				position: absolute;
				top: 18px;
				left: 1px;
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

			&--with-result {
				width: calc(100% + 160px);
				padding-right: 200px;

				.tab-scheme-inputs__del-btn {
					right: 156px;
				}
			}

			&-result {
				position: absolute;
				left: calc(100% - 152px);
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

		&__cell-2 {
			position: relative;
			width: calc((100% - 4px) / 2);
			min-width: calc((100% - 4px) / 2);
			max-width: calc((100% - 4px) / 2);
		}

		&__cell-3 {
			position: relative;
			width: calc((100% - 8px) / 3);
			min-width: calc((100% - 8px) / 3);
			max-width: calc((100% - 8px) / 3);
		}

		&__expr-editor {
			position: relative;
			width: 100%;
			height: 40px;
			border-radius: 4px;
			border: 1px solid
				color-mix(in srgb, var(--on-surface) 38%, transparent);
			padding: 0 8px;
			display: flex;
			justify-content: flex-start;
			align-items: center;
			column-gap: 4px;
			cursor: pointer;

			span {
				display: block;
				position: relative;
				width: calc(100% - 24px);
				overflow: hidden;
				white-space: nowrap;
				text-overflow: ellipsis;
			}

			&--error {
				border: 1px solid var(--error);

				.tab-scheme-inputs__expr-editor-messages {
					position: absolute;
					top: 100%;
					left: 0;
					width: 100%;
					padding: 2px 16px 0 16px;
					font-size: 12px;
					font-weight: 400;
					line-height: 1;
					color: var(--error);
				}
			}
		}

		&__add-btn {
			text-transform: none;
			margin: 8px 0;
		}

		&__del-btn {
			position: absolute;
			right: 4px;
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
