<template>
	<div class="expression-editor-selector">
		<FmMenu
			v-model="isMenuBodyOpen"
			:id="id"
			:activator="`#a-${id}`"
			:attach="true"
			location-strategy="static"
			:width="width"
			:items="items"
			@click:item="selectItem"
		/>

		<div
			:id="`a-${id}`"
			ref="activatorEl"
			class="expression-editor-selector__activator"
		>
			<slot name="activator">
				<FmButton
					type="tertiary"
					class="expression-editor-selector__btn"
					:disabled="disabled"
				>
					Select editor
				</FmButton>
			</slot>
		</div>

		<teleport v-if="isExpressionEditorOpen || isCodeEditorOpen" to="body">
			<ExpressionEditor
				v-if="isExpressionEditorOpen"
				:rule-expr="ruleExpr"
				:data="data"
				:disallow-empty-value="disallowEmptyValue"
				@close="isExpressionEditorOpen = false"
				@update="emits('update', $event)"
			/>

			<CodeEditor
				v-if="isCodeEditorOpen"
				:value="ruleExpr"
				:disallow-empty-value="disallowEmptyValue"
				@close="isCodeEditorOpen = false"
				@update="emits('update', $event)"
			/>
		</teleport>
	</div>
</template>

<script setup>
	import { nextTick, ref, watch } from 'vue';
	import { FmButton, FmMenu, getRandomString } from '@finmars/ui';
	import CodeEditor from './CodeEditor.vue';
	import ExpressionEditor from './ExpressionEditor.vue';

	const props = defineProps({
		ruleExpr: {
			type: String
		},
		data: {
			type: Object,
			default: () => ({})
		},
		menuLocation: {
			type: String,
			default: 'start',
			validator(value) {
				return ['start', 'end'].includes(value);
			}
		},
		disallowEmptyValue: {
			type: Boolean
		},
		disabled: {
			type: Boolean
		}
	});

	const emits = defineEmits(['update']);

	const items = [
		{ title: 'Expression Builder', value: '1' },
		{ title: 'Code Editor', value: '2' }
	];

	const id = getRandomString(4);
	const width = 160;
	const isMenuBodyOpen = ref(false);

	const activatorEl = ref(null);

	const isExpressionEditorOpen = ref(false);
	const isCodeEditorOpen = ref(false);

	function selectItem({ item }) {
		switch (item.value) {
			case '1':
				isExpressionEditorOpen.value = true;
				break;
			case '2':
				isCodeEditorOpen.value = true;
				break;
		}
	}

	watch(
		() => isMenuBodyOpen.value,
		(val, oldVal) => {
			if (val !== oldVal && val) {
				nextTick(() => {
					const menuOverlayElement = document.getElementById(id);
					const el = menuOverlayElement.querySelector('.v-overlay__content');
					if (el) {
						el.style.top = `${activatorEl.value.clientHeight}px`;
						props.menuLocation === 'end' && (el.style.right = '0');
					}
				});
			}
		}
	);
</script>

<style lang="scss" scoped>
	.expression-editor-selector {
		position: relative;
		width: 100%;

		&__activator {
			position: relative;
			width: auto;
		}

		&__btn {
			--v-btn-height: 56px;

			width: 100%;
			max-width: 100% !important;
			text-transform: none;

			:deep(.v-btn__content) {
				font-size: 16px;
			}
		}
	}
</style>
