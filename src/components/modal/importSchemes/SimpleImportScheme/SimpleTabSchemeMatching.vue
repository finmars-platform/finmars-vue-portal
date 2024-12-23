<template>
	<div class="matching-block">
		<div v-for="(field, index) in entityFields" :key="index">
			<template v-if="field.system_property_key">
				<SimpleTabSchemeMatchingField :field="field" />
			</template>

			<template v-if="field.attribute_user_code">
				<SimpleTabSchemeMatchingField :field="field" />
			</template>
		</div>

		<div class="matching-block__delimiter" />

		<SimpleTabSchemeMatchingField
			:field="{
				name: 'Post Process Script',
				expression: scheme.item_post_process_script
			}"
		/>
	</div>
</template>

<script setup>
	import { computed, ref } from 'vue';
	import isEmpty from 'lodash/isEmpty';
	import { DEPRECATED_ENTITY_FIELDS, MODELS } from './constants';
	import SimpleTabSchemeMatchingField from './SimpleTabSchemeMatchingField.vue';

	const props = defineProps({
		scheme: {
			type: Object
		},
		loading: {
			type: Boolean
		}
	});

	const emits = defineEmits(['update:block', 'update:valid']);

	const attrTypes = ref(MODELS[props.scheme?.content_type] || []);

	console.log('A: ', DEPRECATED_ENTITY_FIELDS, props.scheme?.content_type);

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
