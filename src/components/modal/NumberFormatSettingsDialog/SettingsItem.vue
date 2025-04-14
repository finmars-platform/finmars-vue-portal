<template>
	<div
		:class="[
			'settings-item',
			{
				'settings-item--expanded': item.isOpen
			}
		]"
	>
		<div class="settings-item__header" @click.stop.prevent="emits('expand', !item.isOpen)">
			<span class="settings-item__label">
				{{ item.label }}
			</span>

			<span class="settings-item__value" :style="{ color: displayValue.color }">
				{{ displayValue.text }}
			</span>

			<FmIcon :icon="item.isOpen ? 'mdi-chevron-up' : 'mdi-chevron-down'" />
		</div>

		<Transition name="fade" mode="out-in">
			<div v-if="item.isOpen" class="settings-item__body">
				<template v-if="item.input.type === 'radio'">
					<FmRadioGroup
						:model-value="settings[item.key]"
						direction="vertical"
						@update:model-value="updateItem"
					>
						<FmRadio
							v-for="option in options"
							:key="option.value"
							:label="option.title"
							:value="option.value"
							:class="{
								'option--colored': has(option, 'color') && option.color === 1
							}"
						/>
					</FmRadioGroup>
				</template>

				<template v-else>
					<FmTextField
						:model-value="settings[item.key]"
						:label="item.label"
						:type="item.input.type"
						compact
						outlined
						clearable
						@update:model-value="updateItem"
					/>
				</template>
			</div>
		</Transition>
	</div>
</template>

<script setup>
	import { FmIcon, FmRadio, FmRadioGroup, FmTextField } from '@finmars/ui';
	import has from 'lodash/has';
	import {
		ZERO_FORMATS,
		NEGATIVE_FORMATS,
		ROUNDING_FORMATS,
		SEPARATION_FORMATS,
		PERCENTAGE_FORMATS
	} from './constants';

	const optionsByKey = {
		zero_format_id: ZERO_FORMATS,
		negative_format_id: NEGATIVE_FORMATS,
		round_format_id: ROUNDING_FORMATS,
		thousands_separator_format_id: SEPARATION_FORMATS,
		percentage_format_id: PERCENTAGE_FORMATS
	};

	const props = defineProps({
		settings: {
			type: Object
		},
		item: {
			type: Object
		}
	});
	const emits = defineEmits(['expand', 'update:item']);

	const options = computed(() => optionsByKey[props.item?.key] || []);

	const displayValue = computed(() => {
		const { key, isOpen, placeholder, input } = props.item;

		if (isOpen) {
			return { text: placeholder, color: 'var(--outline)' };
		}

		if (input.type === 'radio') {
			const option = options.value.find((o) => o.value === props.settings[key]);

			if (option) {
				return {
					text: option.title,
					color: !input.getColor
						? 'var(--outline)'
						: input.getColor(props.settings) || 'var(--outline)'
				};
			}

			return {
				text: '',
				color: 'var(--outline)'
			};
		}

		return {
			text: props.settings[key],
			color: 'var(--outline)'
		};
	});

	function updateItem(value) {
		const { key } = props.item;
		emits('update:item', { key, value });
	}
</script>

<style lang="scss" scoped>
	.settings-item {
		position: relative;
		width: calc(100% - 4px);
		border-radius: 4px;
		border: 1px solid var(--outline-variant);
		margin: 0 auto 2px;
		color: var(--on-surface);
		box-shadow: 0 2px 5px 2px var(--surface-container-highest);

		&--expanded {
			margin-bottom: 8px;
		}

		&__header {
			display: flex;
			width: 100%;
			height: 48px;
			padding: 0 16px;
			justify-content: flex-start;
			align-items: center;
			cursor: pointer;

			span {
				display: block;
				position: relative;
			}
		}

		&__label {
			width: 168px;
			font: var(--body-medium-pro-font);
		}

		&__value {
			width: calc(100% - 168px - 24px);
			padding-right: 8px;
			font: var(--body-medium-font);
			color: var(--outline);
		}

		&__body {
			position: relative;
			width: 100%;
			padding: 16px;
			border-top: 1px solid var(--outline-variant);
			display: flex;
			justify-content: center;
			align-items: center;
		}
	}

	.option--colored {
		:deep(.v-label) {
			.fm-radio__label {
				color: var(--error);
			}
		}
	}
</style>
