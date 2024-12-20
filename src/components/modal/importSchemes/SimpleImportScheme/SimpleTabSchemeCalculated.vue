<template>
	<div class="calculated-block">
		<draggable
			:list="calculatedInputs"
			:item-key="(item) => item.frontOptions?.key"
			handle=".calculated-block__item-drag"
			chosen-class="calculated-block__item--chosen"
			drag-class="calculated-block__item--move"
			@end="onMoveItemEnd"
		>
			<template #item="{ element }">
				<div class="calculated-block__item">
					<FmIcon
						class="calculated-block__item-drag"
						icon="mdi-drag"
						size="20"
						color="var(--on-surface)"
					/>

					<FmTextField
						outlined
						compact
						label="Name*"
						:model-value="element.name"
						:error="!!element.frontOptions.validateError?.name"
						:error-messages="
							!!element.frontOptions.validateError?.name
								? [element.frontOptions.validateError.name]
								: []
						"
						@change="updateField(element, 'name', $event)"
					/>

					<FmTooltip
						type="secondary"
						location="top"
						:disabled="!element.name || !!element.name_expr"
					>
						<template #activator="{ props }">
							<FmIconButton
								class="calculated-block__item-expression"
								v-ripple.center
								icon="mdi-function-variant"
								:variant="
									element.name && !element.name_expr ? 'flat' : 'outlined'
								"
								v-bind="props"
								@click.stop.prevent="openExpressionEditor(element)"
							/>
						</template>

						<span>No expression defined for the calculated variable.</span>
					</FmTooltip>

					<FmIconButton
						class="calculated-block__item-del-btn"
						v-ripple.center
						icon="mdi-close"
						variant="outlined"
						@click.stop.prevent="removeItem(element.column)"
					/>
				</div>
			</template>
		</draggable>

		<FmButton
			class="calculated-block__add-btn"
			type="secondary"
			rounded
			:disabled="loading"
			@click.stop.prevent="addField"
		>
			Add field
		</FmButton>

		<ExpressionEditor
			v-if="expressionEditor.show"
			:rule-expr="expressionEditor.item?.name_expr"
			:data="expressionEditorSelectorData"
			disallow-empty-value
			@close="expressionEditor.show = false"
			@update="onExpressionEditorUpdate"
		/>
	</div>
</template>

<script setup>
	import { computed, watch } from 'vue';
	import isEmpty from 'lodash/isEmpty';
	import cloneDeep from 'lodash/cloneDeep';
	import size from 'lodash/size';
	import draggable from 'vuedraggable';
	import {
		FmButton,
		FmIcon,
		FmIconButton,
		FmTextField,
		FmTooltip,
		Ripple
	} from '@finmars/ui';
	import ExpressionEditor from '~/components/common/ExpressionEditorSelector/ExpressionEditor.vue';
	import { getFunctions } from '~/components/modal/importSchemes/utils';

	const vRipple = Ripple;

	const props = defineProps({
		scheme: {
			type: Object
		},
		loading: {
			type: Boolean
		}
	});

	const emits = defineEmits(['update:block', 'update:valid']);

	const expressionEditor = ref({
		show: false,
		item: null
	});

	const calculatedInputs = computed(() => {
		if (isEmpty(props.scheme?.calculated_inputs)) {
			return [];
		}

		return cloneDeep(props.scheme.calculated_inputs)
			.sort((a, b) => a.column - b.column)
			.map((i) => ({
				...i,
				frontOptions: {
					validateError: {
						name: getFieldValidationError(i, 'name'),
						name_expr: getFieldValidationError(i, 'name_expr')
					}
				}
			}));
	});

	const expressionEditorSelectorData = computed(() => {
		return {
			groups: [{ name: '<b>Imported</b>', key: 'input' }],
			functions: [getFunctions(props.scheme.csv_fields)]
		};
	});

	const isBlockValid = computed(
		() =>
			!calculatedInputs.value.some((i) => {
				const { frontOptions = {} } = i;
				const { validateError = {} } = frontOptions;
				return !!validateError.name || !!validateError.name_expr;
			})
	);

	function getFieldValidationError(item, fieldName) {
		return !item[fieldName] ? 'This field may not blank' : '';
	}

	function findItemIndex(item) {
		return props.scheme.calculated_inputs.findIndex(
			(i) => item.column === i.column
		);
	}

	function onMoveItemEnd({ oldIndex, newIndex }) {
		console.log('onMoveCalculatedItemEnd: ', oldIndex, newIndex);
		const updatedBlock = cloneDeep(props.scheme.calculated_inputs);
		const movedItems = updatedBlock.splice(oldIndex, 1);
		updatedBlock.splice(newIndex, 0, movedItems[0]);
		updatedBlock.forEach((i, index) => (i.column = index));
		updatedBlock.sort((a, b) => a.column - b.column);
		emits('update:block', updatedBlock);
	}

	function addField() {
		const updatedBlock = cloneDeep(props.scheme.calculated_inputs);
		updatedBlock.push({
			name: '',
			name_expr: '',
			column: size(calculatedInputs.value) + 1
		});
		emits('update:block', updatedBlock);
	}

	function removeItem(column) {
		console.log('removeItem (calculated_inputs): ', column);
		const updatedBlock = cloneDeep(props.scheme.calculated_inputs);
		const index = updatedBlock.findIndex((i) => i.column === column);
		if (index !== -1) {
			updatedBlock.splice(index, 1);
			updatedBlock.forEach((_, ind) => {
				updatedBlock[ind].column = ind + 1;
			});
			emits('update:block', updatedBlock);
		}
	}

	function updateField(item, field, value) {
		const index = findItemIndex(item);
		if (
			index !== -1 &&
			props.scheme.calculated_inputs[index][field] !== value
		) {
			const updatedBlock = cloneDeep(props.scheme.calculated_inputs);
			updatedBlock[index][field] = value;
			console.log('updateField: ', updatedBlock);
			emits('update:block', updatedBlock);
		}
	}

	function openExpressionEditor(item) {
		expressionEditor.value = {
			show: true,
			item
		};
	}

	function onExpressionEditorUpdate(value) {
		const { item } = expressionEditor.value;
		const index = findItemIndex(item);
		if (
			index !== -1 &&
			props.scheme.calculated_inputs[index].name_expr !== value
		) {
			const updatedBlock = cloneDeep(props.scheme.calculated_inputs);
			updatedBlock[index].name_expr = value;
			console.log('onExpressionEditorUpdate: ', updatedBlock);
			emits('update:block', updatedBlock);
			expressionEditor.value = {
				show: false,
				item: null
			};
		}
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
	.calculated-block {
		position: relative;
		width: 100%;
		height: 100%;

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
			column-gap: 8px;

			&-drag {
				position: absolute;
				top: 18px;
				left: 1px;
				cursor: move;
			}

			&--chosen {
				background-color: color-mix(in srgb, var(--on-surface) 8%, transparent);
			}

			&--move {
				background-color: var(--secondary-container);
			}

			&-del-btn {
				position: absolute;
				right: 4px;
			}

			&-expression {
				&.v-btn--variant-flat {
					background-color: var(--error) !important;
				}
			}
		}

		&__add-btn {
			text-transform: none;
			margin: 8px 0;
		}
	}
</style>
