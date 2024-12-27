<template>
	<div class="imported-block">
		<draggable
			:list="csvFields"
			:item-key="(item) => item.column"
			handle=".imported-block__item-drag"
			chosen-class="imported-block__item--chosen"
			drag-class="imported-block__item--move"
			@end="onMoveItemEnd"
		>
			<template #item="{ element }">
				<div class="imported-block__item">
					<FmIcon
						class="imported-block__item-drag"
						icon="mdi-drag"
						size="20"
						color="var(--on-surface)"
					/>

					<FmTextField
						class="imported-block__item-cell"
						outlined
						compact
						label="Column name"
						:model-value="element.column_name"
						@change="updateField(element, 'column_name', $event)"
					/>

					<FmTextField
						class="imported-block__item-cell"
						outlined
						compact
						label="Name"
						:model-value="element.name"
						@change="updateField(element, 'name', $event)"
					/>

					<FmTooltip type="secondary" location="top">
						<template #activator="{ props }">
							<div
								:class="[
									'imported-block__expr-editor',
									{
										'imported-block__expr-editor--error':
											!!element.frontOptions.validateError?.name_expr
									}
								]"
								v-bind="props"
								v-ripple.center
								@click.stop.prevent="openExpressionEditor(element)"
							>
								<FmIcon icon="mdi-sigma" size="20" color="var(--on-surface)" />

								<span>{{ element.name_expr }}</span>

								<div
									v-if="!!element.frontOptions.validateError?.name_expr"
									class="imported-block__expr-editor-messages"
								>
									{{ element.frontOptions.validateError?.name_expr }}
								</div>
							</div>
						</template>

						<span>{{ element.name_expr }}</span>
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
	import { validators } from './utils';
	import { getFunctions } from '~/components/modal/importSchemes/utils';
	import ExpressionEditor from '~/components/common/ExpressionEditorSelector/ExpressionEditor.vue';

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

	const csvFields = computed(() => {
		if (isEmpty(props.scheme?.csv_fields)) {
			return [];
		}

		return cloneDeep(props.scheme.csv_fields)
			.sort((a, b) => a.column - b.column)
			.map((i) => ({
				...i,
				frontOptions: {
					validateError: {
						name_expr: validators.required(i, 'name_expr')
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
			!csvFields.value.some((i) => {
				const { frontOptions = {} } = i;
				const { validateError = {} } = frontOptions;
				return !!validateError.name_expr;
			})
	);

	function findItemIndex(item) {
		return props.scheme.csv_fields.findIndex((i) => item.column === i.column);
	}

	function onMoveItemEnd({ oldIndex, newIndex }) {
		const updatedBlock = cloneDeep(props.scheme.csv_fields);
		const movedItems = updatedBlock.splice(oldIndex, 1);
		updatedBlock.splice(newIndex, 0, movedItems[0]);
		updatedBlock.forEach((i, index) => (i.column = index));
		updatedBlock.sort((a, b) => a.column - b.column);
		emits('update:block', updatedBlock);
	}

	function addField() {
		const updatedBlock = cloneDeep(props.scheme.csv_fields);
		updatedBlock.push({
			name: '',
			name_expr: '',
			column: size(csvFields.value) + 1
		});
		emits('update:block', updatedBlock);
	}

	function removeItem(column) {
		const updatedBlock = cloneDeep(props.scheme.csv_fields);
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
		if (index !== -1 && props.scheme.csv_fields[index][field] !== value) {
			const updatedBlock = cloneDeep(props.scheme.csv_fields);
			updatedBlock[index][field] = value;
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
		if (index !== -1 && props.scheme.csv_fields[index].name_expr !== value) {
			const updatedBlock = cloneDeep(props.scheme.csv_fields);
			updatedBlock[index].name_expr = value;
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
	.imported-block {
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

			&-cell {
				position: relative;
				min-width: 25%;
				width: 25%;
				max-width: 25%;
			}

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
		}

		&__expr-editor {
			position: relative;
			width: 100%;
			height: 40px;
			border-radius: 4px;
			border: 1px solid color-mix(in srgb, var(--on-surface) 38%, transparent);
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

				.imported-block__expr-editor-messages {
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
	}
</style>
