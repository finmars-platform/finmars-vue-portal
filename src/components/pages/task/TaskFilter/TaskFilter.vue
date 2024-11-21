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
				@update:model-value="debouncedUpdateText"
			/>
		</div>

		<div class="grid grid-cols-3 gap-x-2">
			<div>
<!--				<FmSelect-->
<!--					v-model="filter.statuses"-->
<!--					:options="TASK_STATUSES"-->
<!--					variant="outlined"-->
<!--					label="Status"-->
<!--					placeholder="Select statuses"-->
<!--					persistent-placeholder-->
<!--					clearable-->
<!--					multiple-->
<!--					chip-->
<!--					:disabled="disabled"-->
<!--					@change="updateFilterValue"-->
<!--				/>-->
				<TaskFilterSelect
					:model-value="filter.statuses"
					:options="TASK_STATUSES"
					label="Status"
					placeholder="Select statuses"
					:disabled="disabled"
					@update:model-value="updateSelect('statuses', $event)"
				/>
			</div>

			<div>
				<FmSelect
					v-model="filter.types"
					:options="TASK_TYPES"
					variant="outlined"
					label="Task type"
					placeholder="Select task types"
					persistent-placeholder
					clearable
					multiple
					chip
					:disabled="disabled"
					@change="updateFilterValue"
				/>
			</div>

			<div>
				<FmSelect
					v-model="filter.result"
					:options="TASK_RESULTS"
					variant="outlined"
					label="Result"
					placeholder="Select results"
					persistent-placeholder
					clearable
					multiple
					chip
					:disabled="disabled"
					@change="updateFilterValue"
				/>
			</div>
		</div>
	</div>
</template>

<script setup>
	import { ref } from 'vue';
	import dayjs from 'dayjs';
	import cloneDeep from 'lodash/cloneDeep';
	import debounce from 'lodash/debounce';
	import { FmSelect, FmTextField } from '@finmars/ui';
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

	const debouncedUpdateText = debounce(updateText, 500);

	function updateFilterValue() {
		console.log('updateFilterValue: ', filter.value);
		emits('update:modelValue', filter.value);
	}

	function updateText(value) {
		filter.value.query = value;
		emits('update:modelValue', filter.value);
	}

	function updateSelect(field, value) {
		console.log('updateSelect: ', field, value);
		filter.value[field] = value;
		emits('update:modelValue', filter.value);
	}
</script>
