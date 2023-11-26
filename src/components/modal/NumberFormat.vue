<template>
	<BaseModal title="Number format">
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
			<div class="flex sb">
				<FmBtn type="text" @click="cancel">CANCEL</FmBtn>

				<FmBtn type="primary" @click="save">save</FmBtn>
			</div>
		</template>
	</BaseModal>
</template>

<script setup>
	import renderHelper from '~~/src/angular/helpers/render.helper'

	const props = defineProps({
		settings: {
			type: Object,
		},
	})
	const emits = defineEmits(['save'])
	const isOpenDeleteCustomColumns = ref(false)
	const isOpenEditCustomColumns = ref(false)
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

	let vm = reactive({ settings: props.settings })
	console.log('vm:', vm)

	function save() {
		emits('save', { status: 'agree', data: props.settings })
	}
	const setContainersHeight = function (containers) {
		containers.forEach((container) => {
			const contentElement = container.querySelector(
				'.numberFormatAccordionHeight'
			)

			if (contentElement) {
				container.style.height = contentElement.clientHeight + 'px'
			}
		})
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
			selectedPreset.isActive = true
		}

		return selectedPreset
	}

	const clearAllPresetSelection = function () {
		vm.presetSelectorData.options.forEach((it) => (it.isActive = false))
	}

	// Negative format in new design differ from settings structure
	const getNegativeFormat = function (reportSettings) {
		// 0 0 -> 0
		// 0 1 -> 1
		// 1 0 -> 2
		// 1 1 -> 3
		const { negative_format_id, negative_color_format_id } = reportSettings

		return parseInt('' + negative_format_id + negative_color_format_id, 2)
	}

	vm.onNegativeFormatChange = function () {
		vm.settings.negative_format_id = vm.negativeFormat < 2 ? 0 : 1
		vm.settings.negative_color_format_id = vm.negativeFormat % 2
		vm.onNumberFormatChange()
	}

	vm.onRoundingChange = function () {
		if (vm.settings.round_format_id !== 0) {
			vm.settings.percentage_format_id = 0

			vm.settings.number_multiplier = null
			vm.settings.number_suffix = ''
			vm.settings.number_prefix = ''
		}

		vm.onNumberFormatChange()
	}

	vm.onPercentageChange = function () {
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

	vm.onNumberFormatChange = function () {
		vm.positiveNumberExample = vm.formatValue(4878.2308)
		vm.zeroExample = vm.formatValue(0)
		vm.negativeNumberExample = vm.formatValue(-9238.1294)

		vm.negativeFormat = getNegativeFormat(vm.settings)

		clearAllPresetSelection()
		const currentPreset = getActivePreset()
		vm.currentPresetName = currentPreset ? currentPreset.name : 'Select Preset'
	}

	vm.getZeroName = function () {
		return vm.zeroFormats[vm.settings.zero_format_id].name
	}

	vm.getNegativeName = function () {
		return vm.negativeFormats[vm.negativeFormat].name
	}

	vm.getRoundingName = function () {
		return vm.settings.round_format_id === 0
			? 'No rounding'
			: vm.formatRounding(0)
	}

	vm.getSeparationName = function () {
		return vm.separationFormats[vm.settings.thousands_separator_format_id].name
	}

	vm.getPercentageName = function () {
		return vm.percentageFormats[vm.settings.percentage_format_id].name
	}

	vm.formatRounding = (value) =>
		renderHelper.formatRounding(value, { report_settings: vm.settings })

	vm.formatValue = (value) =>
		renderHelper.formatValue(
			{ example: value },
			{ key: 'example', report_settings: vm.settings }
		)

	vm.presetSelectorData = {
		options: [
			{ id: 'price', name: `Price (0)`, isActive: false },
			{ id: 'market_value', name: `Market Value (000'000)`, isActive: false },
			{ id: 'amount', name: `Amount (000'000.00)`, isActive: false },
			{ id: 'exposure', name: `Exposure (0.0%)`, isActive: false },
			{ id: 'return', name: `Return (0.00%)`, isActive: false },
		],
		selectOption: (option, _$popup) => {
			_$popup.cancel()

			vm.presetSelectorData.options.forEach(
				(it) => (it.isActive = it === option)
			)

			const numberFormat = presetsSettings[option.id]
			Object.assign(vm.settings, numberFormat)

			vm.onNumberFormatChange()
		},
	}

	const init = function () {
		vm.onNumberFormatChange()

		// const animatedContainers =
		// 	$element[0].querySelectorAll('.cb1-resizing-wrap')
		// setTimeout(() => setContainersHeight(animatedContainers)) // for height animation
	}

	init()
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
