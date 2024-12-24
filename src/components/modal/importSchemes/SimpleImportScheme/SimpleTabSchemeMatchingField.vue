<template>
	<div class="matching-block-item">
		<div class="matching-block-item__name">
			{{ field.name }}
		</div>

		<div
			class="matching-block-item__expression"
			v-ripple.center
			@click.stop.prevent="isExpressionEditorShow = true"
		>
			{{ field.expression }}
		</div>

		<FmIconButton
			v-if="field.value_type === 'field'"
			class="matching-block-item__btn"
			icon="mdi-book-open-blank-variant"
			@click.stop.prevent="isEntityTypeMappingShow = true"
		/>

		<ExpressionEditor
			v-if="isExpressionEditorShow"
			:rule-expr="field.expression"
			:data="expressionEditorSelectorData"
			disallow-empty-value
			@close="isExpressionEditorShow = false"
			@update="onExpressionEditorUpdate"
		/>

		<EntityTypeMapping
			v-if="isEntityTypeMappingShow"
			:locals="{
				mapItem: { complexExpressionEntity: field.entity }
			}"
			@close="isEntityTypeMappingShow = false"
		/>
	</div>
</template>

<script setup>
	import { ref } from 'vue';
	import { FmIconButton, Ripple } from '@finmars/ui';
	import ExpressionEditor from '~/components/common/ExpressionEditorSelector/ExpressionEditor.vue';
	import EntityTypeMapping from '~/components/modal/EntityTypeMapping/EntityTypeMapping.vue';

	const vRipple = Ripple;

	const props = defineProps({
		field: {
			type: Object
		},
		expressionEditorSelectorData: {
			type: Object,
			required: true
		}
	});

	const isExpressionEditorShow = ref(false);
	const isEntityTypeMappingShow = ref(false);

	function onExpressionEditorUpdate(value) {
		console.log('onExpressionEditorUpdate: ', value);
	}
</script>

<style lang="scss" scoped>
	.matching-block-item {
		position: relative;
		width: 100%;
		height: 40px;
		display: flex;
		justify-content: flex-start;
		align-items: center;
		column-gap: 8px;
		padding-right: 48px;
		margin-bottom: 8px;

		&__name {
			position: relative;
			min-width: 160px;
			width: 160px;
			font-size: 16px;
		}

		&__expression {
			position: relative;
			height: 40px;
			display: flex;
			justify-content: flex-start;
			align-items: center;
			padding: 0 8px;
			flex-grow: 1;
			border-radius: 4px;
			border: 1px solid var(--outline-variant);
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			cursor: pointer;

			&:hover {
				background-color: color-mix(in srgb, transparent, var(--on-surface) 8%);
			}
		}

		&__btn {
			position: absolute;
			right: 0;
		}
	}
</style>
