<template>
	<FmMenu v-model="menu" :close-on-content-click="false" :disabled="disabled">
		<template #activator="{ props }">
			<FmTextField
				v-bind="props"
				outlined
				hide-details
				:label="label"
				readonly
				:model-value="date"
			/>
		</template>

		<FmDateEditor
			v-model="date"
			show-adjacent-months
			allow-weekend-selection
			:disabled="disabled"
			@update:model-value="updateValue"
		/>
	</FmMenu>
</template>

<script setup>
	import { ref } from 'vue';
	import cloneDeep from 'lodash/cloneDeep';
	import dayjs from 'dayjs';
	import { FmDateEditor, FmMenu, FmTextField } from '@finmars/ui';

	const props = defineProps({
		modelValue: {
			type: String,
			default: dayjs().format('YYYY-MM-DD')
		},
		label: {
			type: String,
			default: 'Date'
		},
		dateFormat: {
			type: String,
			default: 'YYYY-MM-DD'
		},
		disabled: {
			type: Boolean
		}
	});

	const emits = defineEmits(['update:modelValue']);

	const date = ref(cloneDeep(props.modelValue));
	const menu = ref(false);

	function updateValue(value) {
		date.value = dayjs(value).format(props.dateFormat);
		emits('update:modelValue', date.value);
		menu.value = false;
	}
</script>

<style lang="scss">
	.v-overlay-container {
		.v-overlay.v-menu {
			.v-overlay__content {
				.v-list {
					.v-list-item {
						color: var(--on-surface-variant) !important;
						caret-color: var(--on-surface-variant) !important;
					}
				}

				& > div {
					padding: 0 !important;
				}

				.fm-date-editor {
					box-shadow: none !important;
					border-top-right-radius: 4px !important;
					border-bottom-right-radius: 4px !important;
				}
			}
		}
	}
</style>

<style lang="scss" scoped>
	.task-filter-date {
		position: relative;
		width: 100%;
	}
</style>
