<template>
	<div class="matching-block">
		<div v-for="(field, index) in entityFields" :key="index">
			<template v-if="field.system_property_key">
				<SimpleTabSchemeMatchingField
					:field="field"
					:expression-editor-selector-data="expressionEditorSelectorData"
					@update="updateBlock"
				/>
			</template>

			<template v-if="field.attribute_user_code">
				<SimpleTabSchemeMatchingField
					:field="field"
					:expression-editor-selector-data="expressionEditorSelectorData"
					@update="updateBlock"
				/>
			</template>
		</div>

		<div class="matching-block__delimiter" />

		<SimpleTabSchemeMatchingField
			:field="{
				name: 'Post Process Script',
				expression: scheme.item_post_process_script
			}"
			:expression-editor-selector-data="expressionEditorSelectorData"
			@update="updateField('item_post_process_script', $event)"
		/>
	</div>
</template>

<script setup>
	import { computed, ref } from 'vue';
	import isEmpty from 'lodash/isEmpty';
	import { getFunctions } from '~/components/modal/importSchemes/utils';
	import { DEPRECATED_ENTITY_FIELDS, MODELS } from './constants';
	import SimpleTabSchemeMatchingField from './SimpleTabSchemeMatchingField.vue';
	import cloneDeep from 'lodash/cloneDeep';

	const props = defineProps({
		scheme: {
			type: Object
		},
		loading: {
			type: Boolean
		}
	});

	const emits = defineEmits(['update:block', 'update:field']);

	const attrTypes = ref(MODELS[props.scheme?.content_type] || []);

	const entityFields = computed(() => {
		if (isEmpty(props.scheme.entity_fields)) {
			return [];
		}

		return props.scheme.entity_fields
			.filter(
				(f) =>
					!(
						DEPRECATED_ENTITY_FIELDS[props.scheme?.content_type] || []
					).includes(f.system_property_key)
			)
			.reduce((res, f) => {
				if (!f.system_property_key) {
					res.push(f);
					return res;
				}

				const attrTypeForTheField = attrTypes.value.find(
					(a) => a.key === f.system_property_key
				);
				if (
					!attrTypeForTheField ||
					attrTypeForTheField.value_type === 'mc_field'
				) {
					return res;
				}

				res.push({
					...f,
					value_type: attrTypeForTheField.value_type,
					entity: attrTypeForTheField.value_entity,
					content_type: attrTypeForTheField.content_type,
					code: attrTypeForTheField.code
				});

				return res;
			}, []);
	});

	const expressionEditorSelectorData = computed(() => {
		return {
			groups: [{ name: '<b>Imported</b>', key: 'input' }],
			functions: [getFunctions(props.scheme.csv_fields)]
		};
	});

	function updateBlock(field) {
		const updatedBlock = cloneDeep(props.scheme.entity_fields);
		const updatedFieldIndex = updatedBlock.findIndex((i) => i.id === field.id);
		if (updatedFieldIndex === -1) {
			return;
		}

		if (updatedBlock[updatedFieldIndex].expression !== field.expression) {
			updatedBlock[updatedFieldIndex].expression = field.expression;
			emits('update:block', updatedBlock);
		}
	}

	function updateField(field, val) {
		emits('update:field', { field, value: val.expression });
	}
</script>

<style lang="scss" scoped>
	.matching-block {
		position: relative;
		width: 100%;
		height: 100%;

		&__delimiter {
			position: relative;
			width: 100%;
			height: 1px;
			margin: 16px 0;
			border-bottom: 1px solid var(--outline-variant);
		}
	}
</style>
