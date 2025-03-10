<template>
	<FmMenu
		v-model="isMenuOpen"
		:offset="-20"
		width="480"
		:close-on-content-click="false"
		:disabled="disabled"
	>
		<template #activator="{ props }">
			<FmTextField
				v-bind="props"
				:model-value="valueText"
				:label="label"
				outlined
				readonly
			/>
		</template>

		<ExpandableItemsSelectorDialog
			:title="title"
			:value="value"
			:options="options"
			:multiselector="multiselector"
			:disabled="disabled"
			@close="isMenuOpen = false"
			@confirm="update"
		/>
	</FmMenu>
</template>

<script setup>
	import { computed, ref } from 'vue';
	import size from 'lodash/size';
	import { FmMenu, FmTextField } from '@finmars/ui';
	import ExpandableItemsSelectorDialog from './ExpandableItemsSelectorDialog.vue';

	const props = defineProps({
		label: {
			type: String
		},
		title: {
			type: String,
			default: 'Select item'
		},
		value: {
			type: [String, Array]
		},
		options: {
			type: Array,
			default: () => []
		},
		multiselector: {
			type: Boolean
		},
		disabled: {
			type: Boolean
		}
	});
	const emits = defineEmits(['update']);

	const isMenuOpen = ref(false);

	const valueText = computed(() => {
		const selValue = props.options.reduce((acc, item) => {
			const currentValue =
				props.multiselector && Array.isArray(props.multiselector)
					? props.value
					: [props.value];
			const isPresent = currentValue.includes(item.id);
			if (isPresent) {
				acc.push(item);
			}

			return acc;
		}, []);

		const s = size(selValue);
		return s < 2 ? selValue[0]?.name : `${selValue[0].name} (+ ${s - 1})`;
	});

	function update(value) {
		emits('update', value);
		isMenuOpen.value = false;
	}
</script>

<style lang="scss" scoped>
	@use '@/assets/scss/core/_mixins' as mixins;

	.expandable-items-selector {
		position: relative;
		width: 100%;
		height: 100%;
		padding: 16px;

		&__title {
			font: var(--headline-small-font);
			margin-bottom: 16px;
		}

		&__search {
			margin-bottom: 16px;
		}

		&__content {
			position: relative;
			width: 100%;
			height: 240px;
			overflow-x: hidden;
			overflow-y: auto;
		}

		&__item {
			position: relative;
			width: 100%;
			padding: 8px 8px 8px 24px;
			border-radius: 4px;
			border: 1px solid var(--outline-variant);
			background-color: var(--surface);
			margin-bottom: 8px;
			cursor: pointer;

			&-checkbox {
				position: absolute;
				left: 2px;
				top: 6px;
			}

			&-name {
				font: var(--body-large-font);
				@include mixins.text-overflow-ellipsis();
			}

			&-content {
				font: var(--body-small-font);
				@include mixins.text-overflow-ellipsis();
			}

			&--multi {
				padding-left: 32px;
			}

			&--selected {
				background-color: var(--secondary);
				color: var(--on-secondary);
			}

			:deep(.text-highlight) {
				font-weight: 700;
				color: var(--primary);
			}
		}

		&__actions {
			display: flex;
			width: 100%;
			justify-content: space-between;
			align-items: center;
			padding: 8px 0;

			button {
				text-transform: none;
			}
		}
	}
</style>
