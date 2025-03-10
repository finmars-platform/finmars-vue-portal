<template>
	<div class="number-format-settings-dialog">
		<div class="number-format-settings-dialog__preset">
			<FmSelect
				:model-value="currentPreset"
				:options="PRESET_SELECTOR_OPTIONS"
				variant="outlined"
				label="Preset"
				placeholder="Select Preset"
				persistent-placeholder
				@update:model-value="changePreset"
			/>

			<div class="number-format-settings-dialog__examples">
				<span class="number-format-settings-dialog__examples-label">
					Examples:
				</span>

				<div class="number-format-settings-dialog__examples-value">
					<span>{{ examples.positiveNumber }}</span>
					<span>{{ examples.zero }}</span>
					<span
						:style="
							settings.negative_color_format_id
								? { color: 'var(--error)' }
								: {}
						"
					>
						{{ examples.negativeNumber }}
					</span>
				</div>
			</div>
		</div>

		<div class="number-format-settings-dialog__content">
			<SettingsItem
				v-for="item in accordionSettings"
				:key="item.key"
				:settings="settings"
				:item="item"
				@expand="item.isOpen = $event"
				@update:item="updateItem"
			/>
		</div>
	</div>
</template>

<script setup>
	import { computed, ref } from 'vue';
	import cloneDeep from 'lodash/cloneDeep';
	import isEqual from 'lodash/isEqual';
	import size from 'lodash/size';
	import { FmSelect } from '@finmars/ui';
	import { formatValue } from '~/utils/renderHelper';
	import {
		DEFAULT_REPORT_SETTINGS,
		PRESET_SELECTOR_OPTIONS,
		PRESETS_SETTINGS,
		NEGATIVE_FORMATS
	} from './constants';
	import SettingsItem from './SettingsItem.vue';

	const props = defineProps({
		settings: {
			type: Object
		}
	});

	const emits = defineEmits(['select']);

	const settings = ref(
		props.settings
			? {
					...cloneDeep(DEFAULT_REPORT_SETTINGS),
					...cloneDeep(props.settings)
				}
			: { ...cloneDeep(DEFAULT_REPORT_SETTINGS) }
	);

	const accordionSettings = ref([
		{
			key: 'zero_format_id',
			isOpen: false,
			label: 'Zero',
			placeholder: 'Select zero number format',
			input: {
				type: 'radio'
			}
		},
		{
			key: 'negative_format_id',
			isOpen: false,
			label: 'Negative',
			placeholder: 'Select negative number format',
			input: {
				type: 'radio',
				getColor: (currentSettings) => {
					return currentSettings.negative_color_format_id === 1
						? 'var(--error)'
						: '';
				}
			}
		},
		{
			key: 'round_format_id',
			isOpen: false,
			label: 'Rounding',
			placeholder: 'Select rounding format',
			input: {
				type: 'radio'
			}
		},
		{
			key: 'thousands_separator_format_id',
			isOpen: false,
			label: 'Thousands separation',
			placeholder: 'Select separation format',
			input: {
				type: 'radio'
			}
		},
		{
			key: 'percentage_format_id',
			isOpen: false,
			label: 'Percentage',
			placeholder: 'Select percentage format',
			input: {
				type: 'radio'
			}
		},
		{
			key: 'number_suffix',
			isOpen: false,
			label: 'Suffix',
			placeholder: 'Enter suffix (after number)',
			input: {
				type: 'text'
			}
		},
		{
			key: 'number_prefix',
			isOpen: false,
			label: 'Prefix',
			placeholder: 'Enter prefix (before number)',
			input: {
				type: 'text'
			}
		},
		{
			key: 'number_multiplier',
			isOpen: false,
			label: 'Multiplier',
			placeholder: 'Enter multiplier',
			input: {
				type: 'number'
			}
		}
	]);

	const currentPreset = computed(() => getActivePreset());
	const examples = computed(() => ({
		positiveNumber: applyFormatValue(4878.2308),
		negativeNumber: applyFormatValue(-9238.1294),
		zero: applyFormatValue(0)
	}));

	function applyFormatValue(value) {
		return formatValue(
			{ example: value },
			{
				key: 'example',
				report_settings: settings.value
			}
		);
	}

	function getActivePreset() {
		return Object.keys(PRESETS_SETTINGS).reduce((res, key) => {
			const preset = PRESETS_SETTINGS[key];
			if (isEqual(preset, settings.value)) {
				res = key;
			}
			return res;
		}, '');
	}

	function changePreset(presetId) {
		const preset = cloneDeep(PRESETS_SETTINGS[presetId]);
		settings.value = {
			...settings.value,
			...preset
		};
	}

	function updateItem({ key, value }) {
		settings.value[key] = value === null ? '' : value;

		if (key === 'negative_format_id') {
			const option = NEGATIVE_FORMATS.find((o) => o.value === value);
			option && (settings.value.negative_color_format_id = option.color);
		}

		const number_multiplier = settings.value.number_multiplier;
		emits('select', {
			...settings.value,
			...(size(number_multiplier) > 0 && {
				number_multiplier: Number(number_multiplier)
			})
		});
	}
</script>

<style lang="scss" scoped>
	@use '@/assets/scss/core/_mixins' as mixins;

	.number-format-settings-dialog {
		position: relative;
		width: 600px;
		height: 560px;
		color: var(--on-surface);

		&__preset {
			position: relative;
			width: 100%;
			padding: 16px 24px;
			display: grid;
			grid-template-columns: 1fr 1fr;
			column-gap: 16px;
			border-top: 1px solid var(--outline-variant);
			border-bottom: 1px solid var(--outline-variant);
		}

		&__examples {
			display: flex;
			width: 100%;
			max-width: 268px;
			flex-direction: column;
			justify-content: center;
			align-items: flex-start;
			row-gap: 4px;

			&-label {
				font: var(--label-medium-pro-font);
			}

			&-value {
				display: flex;
				width: 100%;
				justify-content: space-between;
				align-items: center;
				column-gap: 4px;
				font: var(--number-medium-font);

				span {
					display: block;
					@include mixins.text-overflow-ellipsis();
				}
			}
		}

		&__content {
			position: relative;
			width: calc(100% - 36px);
			height: calc(100% - 108px);
			margin: 0 auto;
			padding-top: 16px;
			padding-right: 12px;
			overflow-y: auto;
		}
	}
</style>
