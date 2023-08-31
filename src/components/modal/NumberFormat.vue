<template>
	<BaseModal :title="title">
		<div style="padding: 5px 0 20px">
			<div class="header">
				<FmSelect label="Select Preset" :items="presetSelectorData"></FmSelect>

				<div class="examples">
					<div class="examples__name">Examples:</div>
					<div class="examples-number">
						<span>{{ positiveNumberExample }}</span>
						<span>{{ zeroExample }}</span>
						<span>{{ negativeNumberExample }}</span>
					</div>
				</div>
			</div>
			<div class="content">
				<FmExpansionPanel title="Zero">
					<div
						class="panel-content"
						v-for="(item, index) in zeroFormats"
						:key="index"
					>
						<div class="radio-input">
							<input type="radio" class="input" name="Zero" value="0" />
							<label>{{ item?.name }}</label>
						</div>
						<!-- id=`'ZeroBase' + ${item?.id}` for="ZeroBase" -->
					</div>
				</FmExpansionPanel>
				<FmExpansionPanel title="Negative">
					<div
						class="panel-content"
						v-for="(item, index) in negativeFormats"
						:key="index"
					>
						<div class="radio-input">
							<input type="radio" class="input" name="Negative" value="0" />
							<label>{{ item?.name }}</label>
						</div>
						<!-- id=`'ZeroBase' + ${item?.id}` for="ZeroBase" -->
					</div>
				</FmExpansionPanel>
				<FmExpansionPanel title="Rounding">
					<div
						class="panel-content"
						v-for="(item, index) in percentageFormats"
						:key="index"
					>
						<div class="radio-input">
							<input type="radio" class="input" name="Rounding" value="0" />
							<label>{{ item?.name }}</label>
						</div>
						<!-- id=`'ZeroBase' + ${item?.id}` for="ZeroBase" -->
					</div>
				</FmExpansionPanel>
				<FmExpansionPanel title="Thousands separation">
					<div
						class="panel-content"
						v-for="(item, index) in separationFormats"
						:key="index"
					>
						<div class="radio-input">
							<input
								type="radio"
								class="input"
								name="ThousandsSeparation"
								value="0"
							/>
							<label>{{ item?.name }}</label>
						</div>
						<!-- id=`'ZeroBase' + ${item?.id}` for="ZeroBase" -->
					</div>
				</FmExpansionPanel>

				<FmExpansionPanel title="Percentage">
					<div
						class="panel-content"
						v-for="(item, index) in percentageFormats"
						:key="index"
					>
						<div class="radio-input">
							<input
								type="radio"
								class="input"
								name="ThousandsSeparation"
								value="0"
							/>
							<label>{{ item?.name }}</label>
						</div>
						<!-- id=`'ZeroBase' + ${item?.id}` for="ZeroBase" -->
					</div>
				</FmExpansionPanel>
				<FmExpansionPanel title="Suffix">
					<div class="panel-content">
						<FmInputText label="Suffix" v-modal="SuffixActive"></FmInputText>
					</div>
				</FmExpansionPanel>
				<FmExpansionPanel title="Prefix">
					<div class="panel-content">
						<FmInputText label="Prefix" v-modal="PrefixActive"></FmInputText>
					</div>
				</FmExpansionPanel>
				<FmExpansionPanel title="Multiplier">
					<div class="panel-content">
						<FmInputText
							label="Multiplier"
							v-modal="MultiplierActive"
						></FmInputText>
					</div>
				</FmExpansionPanel>
			</div>
		</div>

		<template #controls="{ cancel }">
			<slot name="controls" :cancel="cancel">
				<div>
					<FmBtn type="basic" @click="cancel">CANCEL</FmBtn>
				</div>
			</slot>
		</template>
	</BaseModal>
</template>

<script setup>
	let props = defineProps({
		title: {
			type: String,
			default: 'Complex Transaction Code: Number Format',
		},
		description: String,
	})
	const SuffixActive = ref([])
	const PrefixActive = ref([])
	const MultiplierActive = ref([])
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

	const zeroFormats = ref([
		{ id: 0, name: '0' },
		{ id: 1, name: '-' },
		{ id: 2, name: '(empty)' },
	])
	const negativeFormats = ref([
		{ id: 0, name: '-100', color: 'black' },
		{ id: 1, name: '-100', color: 'red' },
		{ id: 2, name: '(100)', color: 'black' },
		{ id: 3, name: '(100)', color: 'red' },
	])
	const separationFormats = ref([
		{ id: 0, name: 'No separation' },
		{ id: 1, name: 'Space' },
		{ id: 2, name: 'Apostrophe' },
	])
	const percentageFormats = ref([
		{ id: 0, name: 'N/A' },
		{ id: 1, name: '0%' },
		{ id: 2, name: '0.0%' },
		{ id: 3, name: '0.00%' },
		{ id: 4, name: '0 bps' },
		{ id: 5, name: '0.0 bps' },
	])
	const presetSelectorData = ref([
		{ id: 'price', name: `Price (0)`, isActive: false },
		{ id: 'market_value', name: `Market Value (000'000)`, isActive: false },
		{ id: 'amount', name: `Amount (000'000.00)`, isActive: false },
		{ id: 'exposure', name: `Exposure (0.0%)`, isActive: false },
		{ id: 'return', name: `Return (0.00%)`, isActive: false },
	])
	const positiveNumberExample = ref([])
	const zeroExample = ref([])
	const negativeNumberExample = ref([])

	const negativeFormat = ref([])
	const presetsSettings = {
		price: {
			zero_format_id: 1,
			negative_color_format_id: 0,
			negative_format_id: 0,
			round_format_id: 1,
			percentage_format_id: 0,
		},
		market_value: {
			zero_format_id: 1,
			negative_color_format_id: 1,
			negative_format_id: 1,
			thousands_separator_format_id: 2,
			round_format_id: 1,
			percentage_format_id: 0,
		},
		amount: {
			zero_format_id: 1,
			negative_color_format_id: 1,
			negative_format_id: 0,
			thousands_separator_format_id: 2,
			round_format_id: 3,
			percentage_format_id: 0,
		},
		exposure: {
			zero_format_id: 1,
			negative_color_format_id: 1,
			negative_format_id: 1,
			round_format_id: 0,
			percentage_format_id: 2,
		},
		return: {
			zero_format_id: 1,
			negative_color_format_id: 1,
			negative_format_id: 0,
			percentage_format_id: 3,
		},
	}
	//  const onNegativeFormatChange = function () {
	// 	negativeFormats.negative_format_id = vm.negativeFormat < 2 ? 0 : 1;
	//         vm.settings.negative_color_format_id = vm.negativeFormat % 2;
	//         onNumberFormatChange();
	//     };

	// 	const   onRoundingChange = function () {
	//         if (vm.settings.round_format_id !== 0) {
	//             vm.settings.percentage_format_id = 0;

	//             vm.settings.number_multiplier = null;
	//             vm.settings.number_suffix = "";
	//             vm.settings.number_prefix = "";

	//         }

	//         vm.onNumberFormatChange();
	//     };

	//     vm.onPercentageChange = function () {
	//         if (vm.settings.percentage_format_id !== 0) {
	//             vm.settings.round_format_id = 0;
	//         } else {

	//             vm.settings.number_multiplier = null;
	//             vm.settings.number_suffix = "";
	//             vm.settings.number_prefix = "";

	//         }

	//         if (vm.settings.percentage_format_id > 0 &&
	//             vm.settings.percentage_format_id < 4) {

	//             vm.settings.number_multiplier = 100;
	//             vm.settings.number_suffix = "%";
	//             vm.settings.number_prefix = "";

	//         }

	//         if (vm.settings.percentage_format_id > 3) {

	//             vm.settings.number_multiplier = 10000;
	//             vm.settings.number_suffix = "bps";
	//             vm.settings.number_prefix = "";

	//         }

	//         vm.onNumberFormatChange();
	// };

	const onNumberFormatChange = function () {
		positiveNumberExample.value = formatNumberNegative(4878.2308)
		zeroExample.value = formatNumberNegative(0)
		negativeNumberExample.value = formatNumberNegative(-9238.1294)

		//  negativeFormat = getNegativeFormat(vm.settings)

		// clearAllPresetSelection()
		// const currentPreset = getActivePreset()
		// const currentPresetName = currentPreset
		// 	? currentPreset.name
		// 	: 'Select Preset'

		// setTimeout(() => $scope.$apply())
	}
	// console.log(
	// 	positiveNumberExample.value,
	// 	'positiveNumberExample',
	// 	zeroExample.value,
	// 	'zeroExample',
	// 	negativeNumberExample.value,
	// 	'negativeNumberExample'
	// )
	onNumberFormatChange()
	// console.log(negativeNumberExample,"negativeNumberExample", formatValue(4878.2308), "formatValue(4878.2308)")
	// onNumberFormatChange()
	// const getZeroName = function () {
	// 	return zeroFormats[vm.settings.zero_format_id].name
	// }

	// const getNegativeName = function () {
	// 	return negativeFormats[vm.negativeFormat].name
	// }

	// const getRoundingName = function () {
	// 	return vm.settings.round_format_id === 0
	// 		? 'No rounding'
	// 		: formatRounding(0)
	// }

	// const getSeparationName = function () {
	// 	return vm.separationFormats[vm.settings.thousands_separator_format_id].name
	// }

	// const getPercentageName = function () {
	// 	return vm.percentageFormats[vm.settings.percentage_format_id].name
	// }

	// const formatRounding = (value) =>
	// 	renderHelper.formatRounding(value, { report_settings: vm.settings })

	// const formatValue = (value) =>
	// 	renderHelper.formatValue(
	// 		{ example: value },
	// 		{ key: 'example', report_settings: vm.settings }
	// 	)
</script>

<style lang="scss" scoped>
	.header {
		display: flex;
		min-width: 100%;
		width: 100%;
		min-width: 570px;
	}
	.panel-content {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		padding-left: 90px;
		justify-content: center;
	}
	.radio-input {
		display: flex;
		align-items: center;
		.input {
			margin-right: 20px;
		}
	}
	.examples {
		display: flex;
		flex-direction: column;
		margin-top: 15px;
		margin-left: 20px;
		// .examples__name

		&__name {
			display: flex;
			font-size: 12px;
			color: $gray;
		}
	}
	.examples-number {
		justify-content: space-between;
		font-size: 12px;
		color: $gray;
		span {
			padding-right: 10px;
		}
	}

	.modal.number-format {
	}
</style>
