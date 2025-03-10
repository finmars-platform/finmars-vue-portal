<template>
	<div class="table-attribute-selector-dialog">
		<FmItemPicker
			v-model="val"
			height="480"
			:multiple="multiple"
			:attributes="availableAttrs"
			@close="emits('close')"
			@update:model-value="selectAttribute"
		/>
	</div>
</template>

<script setup>
	import { ref } from 'vue';
	import { FmItemPicker } from '@finmars/ui';

	defineProps({
		availableAttrs: {
			type: Array,
			default: () => []
		},
		multiple: {
			type: Boolean
		}
	});

	const emits = defineEmits(['close', 'select', 'confirm', 'update:value']);

	const val = ref([]);

	function selectAttribute(value) {
		emits('update:value', value);
		emits('select', value);
		emits('confirm');
	}
</script>

<style lang="scss" scoped>
	.table-attribute-selector-dialog {
		position: relative;

		:deep(.fm-item-picker) {
			border-radius: 0;
			box-shadow: none;

			button {
				text-transform: none;
			}
		}
	}
</style>
