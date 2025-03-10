<template>
	<FmMenu v-model="isMenuOpen" :offset="-20" :disabled="disabled">
		<template #activator="{ props }">
			<FmTextField
				v-bind="props"
				:model-value="valueText"
				:label="label"
				outlined
				readonly
			/>
		</template>

		<div class="table-attribute-selector">
			<div class="table-attribute-selector__title">{{ title }}</div>

			<TableAttributeSelectorDialog
				:available-attrs="availableAttrs"
				:disabled="disabled"
				@update:value="update"
			/>
		</div>
	</FmMenu>
</template>

<script setup>
	import { computed, ref } from 'vue';
	import { FmMenu, FmTextField } from '@finmars/ui';
	import TableAttributeSelectorDialog from '~/components/modal/TableAttributeSelectorDialog/TableAttributeSelectorDialog.vue';

	const props = defineProps({
		value: {
			type: [String, Object]
		},
		label: {
			type: String
		},
		title: {
			type: String
		},
		availableAttrs: {
			type: Array,
			default: () => []
		},
		isReport: {
			type: Boolean
		},
		disabled: {
			type: Boolean
		}
	});
	const emits = defineEmits(['update:value']);

	const isMenuOpen = ref(false);

	const valueText = computed(() => {
		const attr = props.availableAttrs.find((a) => a.key === props.value);
		return attr?.name || '';
	});

	function update(value) {
		emits('update:value', value[0]);
		isMenuOpen.value = false;
	}
</script>

<style lang="scss" scoped>
	.table-attribute-selector {
		position: relative;

		&__title {
			padding: 16px 24px;
			font: var(--headline-small-font);
			background-color: var(--surface-container-high);
		}
	}
</style>
