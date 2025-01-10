<template>
	<section @mouseup="onResizerMouseUp" class="expression-editor-overlay">
		<div class="expression-editor">
			<div class="expression-editor__header">
				Expression editor

				<FmIconButton
					icon="mdi-close"
					variant="text"
					@click.stop.prevent="emits('close')"
				/>
			</div>

			<div
				@mousemove.stop.prevent="onResizerMouseMove"
				class="expression-editor__body"
			>
				<div class="expression-editor__editor">
					<textarea
						ref="textEditor"
						class="expression-editor__editor-input"
						:value="expression"
						@input="onInput"
					/>
					<label class="expression-editor__editor-label">Expression</label>
				</div>

				<div
					v-if="validationResult.show"
					class="expression-editor__validation-result"
				>
					<label class="expression-editor__validation-result-label">
						The Validation Result
					</label>

					<div v-html="validationResult.result" class="mb-2" />

					<div class="expression-editor__validation-result-row">
						Status:
						<b
							:style="{
								color:
									EXPRESSION_VALIDATION_DESCRIPTIONS[validationResult.status]
										?.color
							}"
						>
							{{
								EXPRESSION_VALIDATION_DESCRIPTIONS[validationResult.status]
									?.text
							}}
						</b>
					</div>

					<div class="expression-editor__validation-result-row">
						<div
							class="expression-editor__validation-result-dot expression-editor__validation-result-func"
						/>
						<span>&nbsp;-&nbsp;functions&nbsp;</span>

						<div
							class="expression-editor__validation-result-dot expression-editor__validation-result-prop"
						/>
						<span>&nbsp;-&nbsp;properties&nbsp;</span>

						<div
							class="expression-editor__validation-result-dot expression-editor__validation-result-inp"
						/>
						<span>&nbsp;-&nbsp;inputs&nbsp;</span>
					</div>
				</div>

				<div class="expression-editor__functions">
					<label class="expression-editor__functions-label">
						Available functions
					</label>

					<FmButton
						v-if="isInsideReport"
						class="expression-editor__functions-btn-insert"
					>
						Column Selector

						<FmMenu
							v-model="isAttrsSelectorOpen"
							activator="parent"
							:close-on-content-click="false"
						>
							<div class="expression-editor__attr-selector">
								<div class="expression-editor__attr-selector-header">
									Choose column's key to add it at the end of the expression

									<FmIconButton
										icon="mdi-close"
										variant="text"
										size="small"
										@click.stop.prevent="isAttrsSelectorOpen = false"
									/>
								</div>
								<FmItemPicker
									:model-value="[]"
									:attributes="availableAttrs"
									:suggested="[]"
									@close="isAttrsSelectorOpen = false"
									@update:model-value="insertAttr"
								/>
							</div>
						</FmMenu>
					</FmButton>

					<div
						ref="resizerEl"
						class="expression-editor__functions-resizer"
						@dragstart="onResizerDragStart"
						@mousedown="onResizerMouseDown"
						@mousemove.stop.prevent="onResizerMouseMove"
					/>

					<div ref="dataBlockEl" class="expression-editor__functions-data">
						<div class="expression-editor__functions-group">
							<div
								v-for="(group, index) in groups"
								:key="index"
								:class="[
									'expression-editor__functions-group-item',
									{
										'expression-editor__functions-group-item--selected':
											isGroupSelected(group)
									}
								]"
								v-html="group.name"
								@click.stop.prevent="selectGroup(group)"
							/>
						</div>

						<div class="expression-editor__functions-exprs">
							<FmTextField
								v-model="searchExpr"
								label="Search"
								compact
								hide-details
								clearable
								@click:clear="searchExpr = ''"
							/>

							<div class="expression-editor__functions-exprs-list">
								<div
									v-for="(expr, index) in filteredExpressions"
									:key="index"
									:class="[
										'expression-editor__functions-exprs-item',
										{
											'expression-editor__functions-exprs-item--selected':
												isExpressionSelected(expr)
										}
									]"
									@click.stop.prevent="selectedHelpItem = expr"
								>
									{{ expr.name }}
								</div>
							</div>
						</div>
					</div>

					<div class="expression-editor__functions-description">
						<div class="expression-editor__functions-description-content">
							<div class="expression-editor__functions-description-header">
								{{ selectedHelpItem?.func }}
							</div>

							<div
								class="expression-editor__functions-description-value"
								v-fm-html="selectedHelpItem?.description"
							/>
						</div>

						<FmButton
							rounded
							:disabled="!selectedHelpItem || isLoading"
							@click.stop.prevent="addExpression"
						>
							Add
						</FmButton>
					</div>
				</div>
			</div>

			<div class="expression-editor__actions">
				<div class="expression-editor__actions-block">
					<FmButton
						type="tertiary"
						rounded
						:disabled="!ruleExpr || isLoading || !expression"
						@click.stop.prevent="validate"
					>
						Validate
					</FmButton>

					<FmButton
						type="tertiary"
						rounded
						:disabled="isEmpty(expressionsHistory) || isLoading"
						@click.stop.prevent="undo"
					>
						Undo
					</FmButton>
				</div>

				<div class="expression-editor__actions-block">
					<FmButton type="secondary" rounded @click="emits('close')">
						Cancel
					</FmButton>

					<FmButton
						rounded
						:disabled="saveBtnDisabled"
						@click.stop.prevent="update"
					>
						OK
					</FmButton>
				</div>
			</div>

			<div v-if="isLoading" class="expression-editor__loader">
				<FmProgressCircular indeterminate size="200" />
			</div>
		</div>
	</section>
</template>

<script setup>
	import { computed, onMounted, ref, watch } from 'vue';
	import isEmpty from 'lodash/isEmpty';
	import {
		FmButton,
		FmIconButton,
		FmItemPicker,
		FmMenu,
		FmProgressCircular,
		FmTextField
	} from '@finmars/ui';
	import FmHtml from '@/directives/FmHtml';
	import {
		prepareExpressionsData,
		prepareGroupsData,
		validateExpression
	} from './express-editor-utils';
	import { EXPRESSION_VALIDATION_DESCRIPTIONS } from './express-editor-constants';
	import useEvAttributesStore from '~/stores/useEvAttributesStore';

	const vFmHtml = FmHtml;

	const props = defineProps({
		ruleExpr: {
			type: String
		},
		data: {
			type: Object
		},
		disallowEmptyValue: {
			type: Boolean
		}
	});

	const emits = defineEmits(['close', 'update']);

	const { getDataForAttributesSelector } = useEvAttributesStore();

	const textEditor = ref();
	const isLoading = ref(true);

	const isInsideReport = ref(!!props.data.entityType);
	const availableAttrs = ref([]);
	const isAttrsSelectorOpen = ref(false);

	const expression = ref();
	const expressionsHistory = ref([]);

	const searchExpr = ref('');
	const expressions = ref([]);
	const groups = ref([]);
	const selectedHelpItem = ref(null);
	const selectedHelpGroup = ref(null);

	const validationResult = ref({
		show: false,
		status: 'success',
		result: ''
	});
	const dataBlockEl = ref();
	const resizerEl = ref();
	const functionDataBlock = ref({
		width: 500,
		shift: 0,
		changing: false
	});

	const functionDataBlockWidthCss = computed(
		() => `${functionDataBlock.value.width}px`
	);

	const filteredExpressions = computed(() => {
		if (!selectedHelpGroup.value || selectedHelpGroup.value.key === 'all') {
			return expressions.value.filter(
				(expr) =>
					!expr.name ||
					expr?.name.toLowerCase().includes(searchExpr.value.toLowerCase())
			);
		}

		return (expressions.value || []).filter((expr) => {
			return (
				expr.groups === selectedHelpGroup.value.key &&
				(!expr.name ||
					expr?.name.toLowerCase().includes(searchExpr.value.toLowerCase()))
			);
		});
	});

	const saveBtnDisabled = computed(() => {
		if (isLoading.value) {
			return true;
		}

		return props.disallowEmptyValue ? !expression.value : false;
	});

	function onInput(event) {
		expression.value = event.target.value;
		validationResult.value = {
			show: false,
			status: 'success',
			result: ''
		};
	}

	function selectGroup(group) {
		selectedHelpGroup.value = group;
		searchExpr.value = '';
	}

	function isGroupSelected(group) {
		return group.key === selectedHelpGroup.value.key;
	}

	function isExpressionSelected(expression) {
		if (!selectedHelpItem.value) {
			return false;
		}

		return (
			expression.groups === selectedHelpItem.value.groups &&
			expression.name === selectedHelpItem.value.name &&
			expression.search_index === selectedHelpItem.value.search_index
		);
	}

	function insertAttr(attrs) {
		expression.value += attrs[0];
	}

	function addExpression() {
		expressionsHistory.value.push(expression.value ?? '');

		if (isEmpty(expression.value)) {
			expression.value = selectedHelpItem.value.func ?? '';
		} else {
			const cursorPosition = textEditor.value.selectionStart;
			const textBeforeCursor = expression.value.slice(0, cursorPosition);
			const textAfterCursor = expression.value.slice(cursorPosition);
			expression.value = `${textBeforeCursor}${selectedHelpItem.value.func ?? ''}${textAfterCursor}`;
		}
	}

	function undo() {
		if (isEmpty(expressionsHistory.value)) {
			return;
		}

		const value = expressionsHistory.value.pop();
		value && (expression.value = value);
	}

	async function validate() {
		try {
			isLoading.value = true;
			const validationResultData = await validateExpression(
				expression.value,
				props.data
			);

			validationResult.value = {
				show: true,
				status: validationResultData.error
					? validationResultData.htmlExpressionData.status
					: validationResultData.status,
				result: validationResultData.error
					? validationResultData.htmlExpressionData.result
					: validationResultData.result
			};
		} catch (e) {
			console.error(e);
		} finally {
			isLoading.value = false;
		}
	}

	function update() {
		emits('update', expression.value);
		emits('close');
	}

	function onResizerDragStart() {
		return false;
	}

	function onResizerMouseDown(ev) {
		const dataBlockRect = dataBlockEl.value.getBoundingClientRect();
		functionDataBlock.value.shift = ev.clientX - dataBlockRect.right;
		functionDataBlock.value.changing = true;
	}

	function onResizerMouseUp() {
		functionDataBlock.value.changing = false;
		functionDataBlock.value.shift = 0;
		return false;
	}

	function onResizerMouseMove(ev) {
		if (functionDataBlock.value.changing) {
			const dataBlockRect = dataBlockEl.value.getBoundingClientRect();
			const newBlockWidth =
				ev.clientX - functionDataBlock.value.shift - dataBlockRect.x;

			if (newBlockWidth > 250 && newBlockWidth < 700) {
				functionDataBlock.value.width = newBlockWidth;
			}
		}
	}

	onMounted(async () => {
		try {
			isLoading.value = true;
			expressions.value = prepareExpressionsData(props.data);
			selectedHelpItem.value = expressions.value[0];
			groups.value = prepareGroupsData(props.data);
			selectedHelpGroup.value = groups.value[0];

			if (isInsideReport.value) {
				availableAttrs.value = getDataForAttributesSelector(
					props.data.entityType
				);
			}
		} finally {
			isLoading.value = false;
		}
	});

	watch(
		() => props.ruleExpr,
		() => {
			expression.value = props.ruleExpr;
		},
		{ immediate: true }
	);
</script>

<style lang="scss">
	.expression-editor {
		&--highlight-property {
			font-weight: bold;
			color: var(--secondary);
		}

		&--highlight-error {
			color: #ab2525;
			border-bottom: 1px dotted #ab2525;
		}

		&--highlight-input {
			font-weight: bold;
			color: #3e7eff;
		}

		&--highlight-func {
			font-weight: bold;
			color: #00cc7d;
		}

		&--error-bracket {
			border-bottom: 2px solid #ab2525;
			display: inline-block;
			padding-bottom: 2px;
			margin: 4px;
			width: 7px;
			color: #ab2525;
		}
	}
</style>

<style lang="scss" scoped>
	.expression-editor-overlay {
		position: fixed;
		inset: 0;
		background-color: rgba(0, 0, 0, 0.3);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1100;
	}

	.expression-editor {
		--expression-editor-data-block-width: v-bind(functionDataBlockWidthCss);
		--expression-editor-block-height: 300px;

		position: relative;
		width: 90%;
		max-width: 1400px;
		border-radius: 24px;
		background-color: var(--surface);
		box-shadow:
			0 1px 3px 0 rgba(0, 0, 0, 0.3),
			0 4px 8px 3px rgba(0, 0, 0, 0.15);

		&__header {
			position: relative;
			display: flex;
			width: 100%;
			height: 64px;
			padding: 0 24px;
			justify-content: space-between;
			align-items: center;
			border-bottom: 1px solid var(--outline-variant);
			font-size: 18px;
			font-weight: 600;
			line-height: 24px;
		}

		&__body {
			position: relative;
			width: 100%;
			padding: 24px;
		}

		&__editor {
			position: relative;
			width: 100%;
			height: 100px;
			display: flex;
			justify-content: center;
			align-items: center;
			border-radius: 8px;
			border: 1px solid var(--outline-variant);
			margin-bottom: 16px;

			&-input {
				position: relative;
				width: calc(100% - 24px);
				height: calc(100% - 24px);
				resize: none;
				border: none;
				outline: none;
				overflow-y: auto;
			}

			&-label {
				position: absolute;
				left: 12px;
				top: -9px;
				font-size: 12px;
				font-weight: 400;
				line-height: 18px;
				color: var(--on-surface-variant);
				background-color: var(--surface);
				padding: 0 4px;
				z-index: 1;
			}

			&:focus-within {
				border: 1px solid var(--primary);
			}
		}

		&__attr-selector {
			position: relative;

			&-header {
				display: flex;
				justify-content: space-between;
				align-items: center;
				background-color: var(--surface-container-high);
				padding: 16px 12px;
				border-bottom: 1px solid var(--outline-variant);
				font-size: 18px;
				font-weight: 500;
			}
		}

		&__validation-result {
			position: relative;
			width: 100%;
			border-radius: 8px;
			border: 1px solid var(--outline-variant);
			padding: 12px;
			margin-bottom: 16px;

			&-label {
				position: absolute;
				left: 12px;
				top: -9px;
				font-size: 12px;
				font-weight: 400;
				line-height: 18px;
				color: var(--on-surface-variant);
				background-color: var(--surface);
				padding: 0 4px;
				z-index: 1;
			}

			&-row {
				display: flex;
				justify-content: flex-start;
				align-items: center;
				column-gap: 4px;
				margin-bottom: 4px;
			}

			&-dot {
				position: relative;
				width: 12px;
				min-width: 12px;
				height: 12px;
				border-radius: 50%;
			}

			&-func {
				background-color: #00cc7d;
			}

			&-prop {
				background-color: var(--secondary);
			}

			&-inp {
				background-color: #3e7eff;
			}
		}

		&__functions {
			position: relative;
			width: 100%;
			border-radius: 8px;
			border: 1px solid var(--outline-variant);
			padding: 16px;
			display: grid;
			column-gap: 16px;
			grid-template-columns: var(--expression-editor-data-block-width) calc(
					100% - var(--expression-editor-data-block-width)
				);

			&-label {
				position: absolute;
				width: 150px;
				left: calc(50% - 75px);
				top: -10px;
				line-height: 20px;
				color: var(--on-surface-variant);
				background-color: var(--surface);
				z-index: 1;
			}

			&-btn-insert {
				--v-btn-height: 24px;

				position: absolute;
				text-transform: none;
				border-radius: 24px;
				top: -12px;
				right: 24px;
			}

			&-resizer {
				position: absolute;
				z-index: 5;
				top: 12px;
				height: calc(100% - 24px);
				width: 4px;
				left: calc(var(--expression-editor-data-block-width) + 16px + 6px);
				background-color: var(--outline-variant);
				cursor: ew-resize;
			}

			&-data {
				position: relative;
				width: 100%;
				height: var(--expression-editor-block-height);
				display: flex;
				column-gap: 2px;
				justify-content: space-between;
				align-items: flex-start;
			}

			&-group {
				position: relative;
				width: 200px;
				height: 100%;
				overflow: auto;

				&-item {
					position: relative;
					width: 100%;
					min-height: 32px;
					display: flex;
					justify-content: flex-start;
					align-items: center;
					padding: 4px 8px;
					border-radius: 4px;
					cursor: pointer;
					margin-bottom: 2px;
					user-select: none;

					&--selected {
						background-color: var(--secondary-container);
					}

					&:hover {
						background-color: var(--surface-container-highest);
					}
				}
			}

			&-exprs {
				position: relative;
				width: calc(100% - 208px);
				height: 100%;
				user-select: none;

				:deep(.fm-text-field) {
					--backgroundColor-fmTextField: transparent;

					.v-field__field {
						.v-label {
							margin-left: 4px;
						}

						.v-field__input {
							padding-left: 4px;
							padding-right: 4px;
						}
					}
				}

				&-list {
					position: relative;
					width: 100%;
					height: calc(100% - 48px);
					margin-top: 8px;
					overflow: auto;
				}

				&-item {
					position: relative;
					width: 100%;
					min-height: 32px;
					display: flex;
					justify-content: flex-start;
					align-items: center;
					padding: 4px 8px;
					border-radius: 4px;
					cursor: pointer;
					margin-bottom: 2px;

					&--selected {
						background-color: var(--secondary-container);
					}

					&:hover {
						background-color: var(--surface-container-highest);
					}
				}
			}

			&-description {
				position: relative;
				width: 100%;
				height: var(--expression-editor-block-height);
				display: flex;
				flex-direction: column;
				justify-content: flex-start;
				align-items: center;
				user-select: none;

				&-content {
					position: relative;
					width: calc(100% - 24px);
					height: calc(var(--expression-editor-block-height) - 52px);
					border-radius: 4px;
					margin: 0 16px 16px 8px;
					box-shadow: 0 0 4px rgba(0, 0, 0, 0.54);
				}

				&-header {
					line-height: 1;
					padding: 16px;
					border-bottom: 1px solid var(--outline-variant);
				}

				&-value {
					position: relative;
					width: 100%;
					height: calc(100% - 52px);
					padding: 16px;
					overflow: auto;
				}
			}
		}

		&__description {
			position: relative;
			width: 100%;
			height: 100%;

			&-content {
				position: relative;
				width: 100%;
				height: calc(100% - 44px);
				margin-bottom: 8px;
				overflow: auto;
			}
		}

		&__actions {
			display: flex;
			width: 100%;
			height: 84px;
			padding: 0 24px;
			justify-content: space-between;
			align-items: center;
			border-top: 1px solid var(--outline-variant);

			&-block {
				display: flex;
				justify-content: center;
				align-items: center;
				column-gap: 16px;
			}
		}

		&__loader {
			position: absolute;
			inset: 0;
			display: flex;
			justify-content: center;
			align-items: center;
			z-index: 5;
		}
	}
</style>
