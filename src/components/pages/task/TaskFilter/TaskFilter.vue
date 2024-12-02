<template>
	<div class="relative w-full mb-6">
		<div class="grid grid-cols-3 gap-x-2 mb-4">
			<TaskFilterDate
				v-model="filter.date_from"
				label="Date From"
				:disabled="disabled"
				@update:model-value="updateFilterValue"
			/>

			<TaskFilterDate
				v-model="filter.date_to"
				label="Date To"
				:disabled="disabled"
				@update:model-value="updateFilterValue"
			/>

			<FmTextField
				outlined
				hide-details
				clearable
				label="Search"
				placeholder="Enter task name"
				:disabled="disabled"
				:model-value="modelValue.query"
				@init="onInit"
				@update:model-value="debouncedUpdateText"
			/>
		</div>

		<div class="grid grid-cols-3 gap-x-2">
			<TaskFilterSelect
				:model-value="filter.statuses"
				:options="TASK_STATUSES"
				label="Status"
				placeholder="Select statuses"
				:disabled="disabled"
				@update:model-value="updateSelect('statuses', $event)"
			/>

			<TaskFilterSelect
				:model-value="filter.types"
				:options="TASK_TYPES"
				label="Task type"
				placeholder="Select task types"
				:disabled="disabled"
				@update:model-value="updateSelect('types', $event)"
			/>

			<TaskFilterSelect
				:model-value="filter.result"
				:options="TASK_RESULTS"
				label="Result"
				placeholder="Select results"
				:disabled="disabled"
				@update:model-value="updateSelect('result', $event)"
			/>
		</div>
	</div>
</template>

<script setup>
	import { ref, watch } from 'vue';
	import dayjs from 'dayjs';
	import cloneDeep from 'lodash/cloneDeep';
	import debounce from 'lodash/debounce';
	import { FmTextField } from '@finmars/ui';
	import { TASK_RESULTS, TASK_STATUSES, TASK_TYPES } from './constants';
	import TaskFilterDate from './TaskFilterDate.vue';
	import TaskFilterSelect from './TaskFilterSelect.vue';

	const props = defineProps({
		modelValue: {
			type: Object,
			default: () => ({
				date_from: dayjs().subtract(30, 'days').format('YYYY-MM-DD'),
				date_to: dayjs().format('YYYY-MM-DD'),
				query: null,
				statuses: null,
				types: null,
				result: null
			})
		},
		disabled: {
			type: Boolean
		}
	});

	const emits = defineEmits(['update:modelValue']);

	const filter = ref(cloneDeep(props.modelValue));

	const debouncedUpdateText = debounce(updateText, 650);

	const searchInputEl = ref(null);
	const isSearchFieldDirty = ref(false);

	function onInit(instance) {
		console.log('instance: ', instance);
		searchInputEl.value = instance.input;
	}

	function updateFilterValue() {
		emits('update:modelValue', filter.value);
	}

	function updateText(value) {
		filter.value.query = value;
		isSearchFieldDirty.value = true;
		emits('update:modelValue', filter.value);
	}

	function updateSelect(field, value) {
		filter.value[field] = value;
		emits('update:modelValue', filter.value);
	}

	watch([() => props.modelValue, () => props.disabled], () => {
		filter.value = cloneDeep(props.modelValue);
		if (isSearchFieldDirty.value && !props.disabled) {
			nextTick(() => {
				searchInputEl.value && searchInputEl.value.focus();
				isSearchFieldDirty.value = false;
			});
		}
	});
</script>
