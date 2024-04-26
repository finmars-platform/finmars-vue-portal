<template>
	<div>
		<div class="nf_content">
			<div class="presets_container">
				<div class="select-main">
					<FmSelect
						:modelValue="vm.activePreset"
						label="Select Preset"
						:items="vm.presetSelectorData.options"
						@update:modelValue="applyPreset"
					></FmSelect>
				</div>

				<div class="examples">
					<div class="examples__name">Examples:</div>
					<div class="examples-number">
						<div>{{ vm.positiveNumberExample }}</div>
						<div>{{ vm.zeroExample }}</div>
						<div>{{ vm.negativeNumberExample }}</div>
					</div>
				</div>
			</div>

			<div class="content">
				<FmExpansionPanel
					title="Zero"
					:subtitle="
					getSelRadioName(
						vm.zeroFormats, vm.settings.zero_format_id
					)
				"
					subtitleOpen="Select zero number format"
					:open="false"
					class="nf_expansion_panel"
				>
					<div
						class="panel-content"
						v-for="(item, index) in vm.zeroFormats"
						:key="index"
					>
						<FmInputRadio
							:label="item.name"
							:modelValue="vm.settings.zero_format_id"
							:value="item.id"
							name="zero"
							@update:modelValue="onZeroFormatChange"
						/>
					</div>
				</FmExpansionPanel>

				<FmExpansionPanel
					title="Negative"
					:subtitle="
					getSelRadioName(
						vm.negativeFormats, vm.negativeFormat
					)
				"
					subtitleOpen="Select negative number format"
					:open="false"
				>
					<div
						class="panel-content"
						v-for="(item, index) in vm.negativeFormats"
						:key="index"
					>
						<FmInputRadio
							:label="item.name"
							:modelValue="vm.negativeFormat"
							:value="item.id"
							name="negative"
							@update:modelValue="vm.onNegativeFormatChange"
							:class="{'primary-text': item.color === 'red'}"
						></FmInputRadio>
					</div>
				</FmExpansionPanel>

				<FmExpansionPanel
					title="Rounding"
					:subtitle="
					getSelRadioName(
						vm.roundingFormats, vm.settings.round_format_id
					)
				"
					subtitleOpen="Select rounding format"
					:open="false"
				>
					<div
						class="panel-content"
						v-for="item in vm.roundingFormats"
						:key="item.id"
					>
						<FmInputRadio
							:label="item.name"
							:modelValue="vm.settings.round_format_id"
							name="rounding"
							:value="item.id"
							@update:modelValue="vm.onRoundingChange"
						></FmInputRadio>
					</div>
				</FmExpansionPanel>

				<FmExpansionPanel
					title="Thousands separation"
					:subtitle="
					getSelRadioName(
						vm.separationFormats,
						vm.settings.thousands_separator_format_id
					)
				"
					subtitleOpen="Select separation format"
					:open="false"
				>
					<div
						class="panel-content"
						v-for="(item, index) in vm.separationFormats"
						:key="index"
					>
						<FmInputRadio
							:label="item.name"
							:modelValue="vm.settings.thousands_separator_format_id"
							:value="item.id"
							name="thousandsSeparation"
							@update:modelValue="vm.onThousandsSepChange"
						></FmInputRadio>
					</div>
				</FmExpansionPanel>

				<FmExpansionPanel
					title="Percentage"
					:subtitle="
					getSelRadioName(
						vm.percentageFormats,
						vm.settings.percentage_format_id
					)
				"
					subtitleOpen="Select percentage format"
					:open="false"
				>
					<div
						class="panel-content"
						v-for="(item, index) in vm.percentageFormats"
						:key="index"
					>
						<FmInputRadio
							:label="item.name"
							:modelValue="vm.settings.percentage_format_id"
							:value="item.id"
							name="percentageFormats"
							@update:modelValue="vm.onPercentageChange"
						></FmInputRadio>
					</div>
				</FmExpansionPanel>

				<FmExpansionPanel
					title="Suffix"
					subtitleOpen="Enter suffix (after number)"
					:open="false"
				>
					<div class="panel-content">
						<FmInputText
							label="Suffix"
							v-model="vm.settings.number_suffix"
							noIndicatorButton
						></FmInputText>
					</div>
				</FmExpansionPanel>

				<FmExpansionPanel
					title="Prefix"
					subtitleOpen="Enter prefix (before number)"
					:open="false"
				>
					<div class="panel-content">
						<FmInputText
							label="Prefix"
							v-model="vm.settings.number_prefix"
							noIndicatorButton
						></FmInputText>
					</div>
				</FmExpansionPanel>

				<FmExpansionPanel
					title="Multiplier"
					subtitleOpen="Enter multiplier"
					:open="false"
				>
					<div class="panel-content">
						<FmInputText
							label="Multiplier"
							v-model="vm.settings.number_multiplier"
							noIndicatorButton
						></FmInputText>
					</div>
				</FmExpansionPanel>
			</div>
		</div>

		<div class="flex footer-part">
			<div class="row flex sb">
				<FmBtn type="text" @click="cancelModal()">CANCEL</FmBtn>

				<FmBtn type="primary" @click="save()">save</FmBtn>
			</div>
		</div>
	</div>
</template>

<script setup>
	import renderHelper from '~~/src/angular/helpers/render.helper'

	const props = defineProps(['settings'])

	const emits = defineEmits(['save', 'cancel'])


	let vm = reactive({
		settings: null,
		activePreset: null,
	})

	const defaultReportSettings = {
		zero_format_id: 0,
		negative_format_id: 0,
		negative_color_format_id: 0,
		round_format_id: 0,
		thousands_separator_format_id: 0,
		percentage_format_id: 0,
		number_multiplier: null,
		number_suffix: '',
		number_prefix: '',
	}
	const settings = ref(props.settings);

	if (settings) {
		const report_settings = {...settings.value};
		vm.settings = { ...defaultReportSettings, ...report_settings }

	} else {
		vm.settings = { ...defaultReportSettings }
	}

	vm.zeroFormats = [
		{ id: 0, name: '0' },
		{ id: 1, name: '-' },
		{ id: 2, name: '(empty)' },
	]

	vm.negativeFormats = [
		{ id: 0, name: '-100', color: 'black' },
		{ id: 1, name: '-100', color: 'red' },
		{ id: 2, name: '(100)', color: 'black' },
		{ id: 3, name: '(100)', color: 'red' },
	]

	vm.roundingFormats = [
		{ id: 0, name: 'no rounding' },
		{ id: 1, name: '0' },
		{ id: 2, name: '0.0' },
		{ id: 3, name: '0.00' },
		{ id: 4, name: '0.0000' },
	]

	vm.separationFormats = [
		{ id: 0, name: 'No separation' },
		{ id: 1, name: 'Space' },
		{ id: 2, name: 'Apostrophe' },
	]

	vm.percentageFormats = [
		{ id: 0, name: 'N/A' },
		{ id: 1, name: '0%' },
		{ id: 2, name: '0.0%' },
		{ id: 3, name: '0.00%' },
		{ id: 4, name: '0 bps' },
		{ id: 5, name: '0.0 bps' },
	]

	const presetsSettings = {
		price: {
			zero_format_id: 1,
			negative_color_format_id: 0,
			negative_format_id: 0,
			round_format_id: 1,
			percentage_format_id: 0,
			number_multiplier: 100,
			number_suffix: '',
			number_prefix: '',
		},
		market_value: {
			zero_format_id: 1,
			negative_color_format_id: 1,
			negative_format_id: 1,
			thousands_separator_format_id: 2,
			round_format_id: 1,
			percentage_format_id: 0,
			number_multiplier: 100,
			number_suffix: '',
			number_prefix: '',
		},
		amount: {
			zero_format_id: 1,
			negative_color_format_id: 1,
			negative_format_id: 0,
			thousands_separator_format_id: 2,
			round_format_id: 3,
			percentage_format_id: 0,
			number_multiplier: 100,
			number_suffix: '',
			number_prefix: '',
		},
		exposure: {
			zero_format_id: 1,
			negative_color_format_id: 1,
			negative_format_id: 1,
			round_format_id: 0,
			percentage_format_id: 2,
			number_multiplier: 100,
			number_suffix: '',
			number_prefix: '',
		},
		return: {
			zero_format_id: 1,
			negative_color_format_id: 1,
			negative_format_id: 0,
			percentage_format_id: 3,
			number_multiplier: 100,
			number_suffix: '',
			number_prefix: '',
		},
	}

	vm.presetSelectorData = {
		options: [
			{ id: 'price', name: `Price (0)`, isActive: false },
			{ id: 'market_value', name: `Market Value (000'000)`, isActive: false },
			{ id: 'amount', name: `Amount (000'000.00)`, isActive: false },
			{ id: 'exposure', name: `Exposure (0.0%)`, isActive: false },
			{ id: 'return', name: `Return (0.00%)`, isActive: false },
		],
	}

	function applyPreset(option) {

		const numberFormat = presetsSettings[option];

		vm.settings = Object.assign(vm.settings, numberFormat);

		vm.onNumberFormatChange()

	}

	const isObjectContain = function (obj, targetObj) {
		return Object.keys(targetObj).every((key) => targetObj[key] === obj[key])
	}

	const getActivePreset = function () {

		const selectedPreset = vm.presetSelectorData.options.find((option) => {
			const requiredProps = presetsSettings[option.id]
			const currentProps = vm.settings

			return isObjectContain(currentProps, requiredProps)
		})

		if (selectedPreset) {
			return selectedPreset.id;
		}

	}

	const clearAllPresetSelection = function () {
		vm.activePreset = null;
	}

	const getSelRadioName = function(formatsList, selectedValue) {
		return formatsList.find(format => format.id === selectedValue).name;
	};

	// Negative format in new design differ from settings structure
	const getNegativeFormat = function (reportSettings) {
		// 0 0 -> 0
		// 0 1 -> 1
		// 1 0 -> 2
		// 1 1 -> 3
		const { negative_format_id, negative_color_format_id } = reportSettings

		return parseInt('' + negative_format_id + negative_color_format_id, 2)
	}

	vm.onNegativeFormatChange = function (newVal) {

		vm.negativeFormat = newVal;

		vm.settings.negative_format_id = vm.negativeFormat < 2 ? 0 : 1
		vm.settings.negative_color_format_id = vm.negativeFormat % 2

		vm.onNumberFormatChange()

	}

	vm.onRoundingChange = function (newVal) {

		vm.settings.round_format_id = newVal;

		if (vm.settings.round_format_id !== 0) {
			vm.settings.percentage_format_id = 0

			vm.settings.number_multiplier = null
			vm.settings.number_suffix = ''
			vm.settings.number_prefix = ''
		}

		vm.onNumberFormatChange()
	}

	vm.onPercentageChange = function (newVal) {

		vm.settings.percentage_format_id = newVal;

		if (vm.settings.percentage_format_id !== 0) {
			vm.settings.round_format_id = 0
		} else {
			vm.settings.number_multiplier = null
			vm.settings.number_suffix = ''
			vm.settings.number_prefix = ''
		}

		if (
			vm.settings.percentage_format_id > 0 &&
			vm.settings.percentage_format_id < 4
		) {
			vm.settings.number_multiplier = 100
			vm.settings.number_suffix = '%'
			vm.settings.number_prefix = ''
		}

		if (vm.settings.percentage_format_id > 3) {
			vm.settings.number_multiplier = 10000
			vm.settings.number_suffix = 'bps'
			vm.settings.number_prefix = ''
		}

		vm.onNumberFormatChange()
	}

	function onZeroFormatChange(newVal) {

		vm.settings.zero_format_id = newVal;
		vm.onNumberFormatChange();

	}

	vm.onThousandsSepChange = function (newVal) {

		vm.settings.thousands_separator_format_id = newVal;
		vm.onNumberFormatChange();

	}

	vm.onNumberFormatChange = function () {

		vm.positiveNumberExample = vm.formatValue(4878.2308)
		vm.zeroExample = vm.formatValue(0)
		vm.negativeNumberExample = vm.formatValue(-9238.1294)

		vm.negativeFormat = getNegativeFormat(vm.settings)

		clearAllPresetSelection()
		vm.activePreset = getActivePreset();

	}

	vm.formatValue = (value) =>
		renderHelper.formatValue(
			{ example: value },
			{ key: 'example', report_settings: vm.settings }
		)

	function cancelModal() {
		emits('cancel');
	}

	function save() {
		emits('save', JSON.parse(JSON.stringify(vm.settings)) );
	}

	function init() {
		vm.onNumberFormatChange();
	}

	init();

</script>

<style lang="scss" scoped>
	.footer-part {
		position: fixed;
		bottom: 0px;
		background: white;
		width: 90%;
		display: flex;
		justify-content: flex-end;
		padding: 12px 0;
	}
	.nf_content {
		width: 100%;
		margin-bottom: 24px;
		// padding: 5px 0 20px;
		:deep(.fm_expansion_panel) {
			.name {
				font-size: 14px;
			}

			.subtitle {
				font-size: 14px;
			}
		}
	}
	.content {
		height: 416px;
		max-height: 416px;
		padding: 13px 18px;
		overflow-y: scroll;
	}
	.presets_container {
		min-height: 92px;
		padding: 0 24px;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		color: #747474;
		border-top: 2px solid #e0e0e0;
		border-bottom: 2px solid #e0e0e0;
	}
	.select-main {
		flex: 0 0 50%;

		:deep(.fm_select) {
			margin-bottom: 0;
		}
	}
	.panel-content {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		padding-left: 40%;
		justify-content: center;
	}

	.examples {
		flex: 0 0 210px;
		display: flex;
		flex-direction: column;

		&__name {
			font-size: 12px;
			color: $gray;
		}
	}
	.examples-number {
		display: flex;
		justify-content: space-between;
		margin-top: 4px;
		font-size: 12px;
		font-weight: 500;
	}
</style>
