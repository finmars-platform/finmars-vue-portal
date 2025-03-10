<template>
	<FmMenu v-model="isMenuOpen" :offset="-20" :close-on-content-click="false">
		<template #activator="{ props }">
			<FmTextField
				v-bind="props"
				:model-value="valueText"
				:label="label"
				outlined
				readonly
			/>
		</template>

		<div class="two-fields-multiselect">
			<FmTransferList
				:title="multiselectTitle"
				:options="options"
				:option-as-object="true"
				:option-title-key="itemTitle"
				:option-value-key="itemValue"
				:selected="processedValue"
				:disabled="disabled"
				@end="isMenuOpen = false"
				@change="onChange"
			/>
		</div>
	</FmMenu>
</template>

<script setup>
	import { computed, ref } from 'vue';
	import { FmMenu, FmTextField, FmTransferList } from '@finmars/ui';

	const props = defineProps({
		value: {
			type: Array,
			default: () => []
		},
		label: {
			type: String
		},
		multiselectTitle: {
			type: String
		},
		options: {
			type: Array
		},
		itemTitle: {
			type: String,
			default: 'name'
		},
		itemValue: {
			type: String,
			default: 'id'
		},
		disabled: {
			type: Boolean
		}
	});

	const emits = defineEmits(['update:value']);

	const isMenuOpen = ref(false);

	const processedValue = computed(() =>
		(props.value || []).map((v) => {
			const vAsObject = props.options.find(
				(o) => o[props.itemValue] === v
			);
			if (!vAsObject) {
				return {
					[props.itemValue]: v,
					[props.itemTitle]: v
				};
			}

			return vAsObject;
		})
	);

	const valueText = computed(() => {
		if (!processedValue.value.length) {
			return '[]';
		}

		return `[${processedValue.value.map((item) => item[props.itemTitle]).join(', ')}]`;
	});

	function onChange(val = []) {
		emits(
			'update:value',
			val.map((v) => v[props.itemValue])
		);
	}
</script>

<style lang="scss" scoped>
	.two-fields-multiselect {
		position: relative;
		width: 100%;
		height: 100%;
	}
</style>
