<template>
	<div class="expandable-items-selector-dialog">
		<div v-if="title" class="expandable-items-selector-dialog__title">
			{{ title }}
		</div>

		<FmTextField
			v-model="searchText"
			outlined
			placeholder="Search for ..."
			persistent-placeholder
			compact
			hide-details
			clearable
			:disabled="disabled"
			class="expandable-items-selector-dialog__search"
		/>

		<div class="expandable-items-selector-dialog__content">
			<div
				v-for="option in filteredOptions"
				:key="option.id"
				:class="[
					'expandable-items-selector-dialog__item',
					{
						'expandable-items-selector-dialog__item--multi':
							multiselector,
						'expandable-items-selector-dialog__item--selected':
							innerValue.includes(option.id)
					}
				]"
				@click.stop.prevent="selectOption(option)"
			>
				<FmCheckbox
					v-if="multiselector"
					class="expandable-items-selector-dialog__item-checkbox"
					:model-value="innerValue.includes(option.id)"
				/>

				<div
					class="expandable-items-selector-dialog__item-name"
					v-fm-html="highlightText(option.name, searchText)"
				/>

				<div
					v-for="content in option.content"
					:key="content.key"
					class="expandable-items-selector-dialog__item-content"
				>
					{{ content.name }}
				</div>
			</div>
		</div>

		<div class="expandable-items-selector-dialog__actions">
			<FmButton
				type="secondary"
				rounded
				@click.stop.prevent="emits('close')"
			>
				Cancel
			</FmButton>

			<FmButton rounded :disabled="disabled" @click.stop.prevent="update">
				Ok
			</FmButton>
		</div>
	</div>
</template>

<script setup>
	import { computed, ref, watch } from 'vue';
	import cloneDeep from 'lodash/cloneDeep';
	import { FmButton, FmCheckbox, FmTextField, FmHtml } from '@finmars/ui';
	import { highlightText } from '~/utils/highlightString';

	const vFmHtml = FmHtml;

	const props = defineProps({
		title: {
			type: String
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
	const emits = defineEmits(['close', 'select', 'confirm']);

	const searchText = ref('');
	const innerValue = ref([]);

	const filteredOptions = computed(() =>
		props.options.filter((o) => {
			if (!searchText.value) {
				return true;
			}

			return o.name
				.toLowerCase()
				.includes(searchText.value.toLowerCase());
		})
	);

	function selectOption(option) {
		if (props.disabled) {
			return;
		}

		if (props.multiselector) {
			const optionIndex = innerValue.value.indexOf(option.id);
			if (optionIndex !== -1) {
				innerValue.value.splice(optionIndex, 1);
			} else {
				innerValue.value.push(option.id);
			}
			return;
		}

		innerValue.value = [option.id];
	}

	function update() {
		const updatedValue = props.multiselector
			? innerValue.value
			: innerValue.value[0];
		emits('select', updatedValue);
		emits('confirm', updatedValue);
	}

	watch(
		() => props.value,
		() => {
			if (props.multiselector && Array.isArray(props.value)) {
				innerValue.value = cloneDeep(props.value);
			} else {
				innerValue.value = [props.value];
			}
		},
		{ immediate: true }
	);
</script>

<style lang="scss" scoped>
	@use '@/assets/scss/core/_mixins' as mixins;

	.expandable-items-selector-dialog {
		position: relative;
		width: 480px;
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
