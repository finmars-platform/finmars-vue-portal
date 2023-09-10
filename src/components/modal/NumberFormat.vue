<template>
	<BaseModal title="Number format">
		<div style="padding: 5px 0 20px">
			<div class="header">
				<FmSelect
					v-model="vm.currentPresetName"
					label="Select Preset"
					:items="vm.presetSelectorData.options"
				></FmSelect>

				<div class="examples">
					<div class="examples__name">Examples:</div>
					<div class="examples-number">
						<span>{{ vm.positiveNumberExample }}</span>
						<span>{{ vm.zeroExample }}</span>
						<span>{{ vm.negativeNumberExample }}</span>
					</div>
				</div>
			</div>

			<div class="content">
				<FmExpansionPanel title="Zero">
					<div
						class="panel-content"
						v-for="(item, index) in vm.zeroFormats"
						:key="index"
					>
						<div class="radio-input">
							<input
								type="radio"
								class="input"
								name="Zero"
								:value="item.id"
								v-model="vm.settings.zero_format_id"
								@input="
									$emit(
										'update:vm.settings.zero_format_id',
										vm.onNumberFormatChange()
									)
								"
							/>
							<label>{{ item?.name }}</label>
						</div>
						<!-- vm.settings.zero_format_id  -->
						<!-- @update:v-modal="vm.onNumberFormatChange()" -->
						<!-- id=`'ZeroBase' + ${item?.id}` for="ZeroBase" -->
					</div>
				</FmExpansionPanel>
				<FmExpansionPanel title="Negative">
					<divs
						class="panel-content"
						v-for="(item, index) in vm.negativeFormats"
						:key="index"
					>
						<div class="radio-input">
							<input
								type="radio"
								class="input"
								name="Negative"
								v-bind:value="item.id"
								v-model="vm.negativeFormat"
								@update:v-modal="vm.onNegativeFormatChange()"
								@input="
									$emit('update:vm.negativeFormat', vm.onNegativeFormatChange())
								"
							/>
							<label>{{ item?.name }}</label>
						</div>
						<!-- @update:v-modal="vm.onNegativeFormatChange()" -->
						<!-- id=`'ZeroBase' + ${item?.id}` for="ZeroBase" -->
					</divs>
				</FmExpansionPanel>
				<FmExpansionPanel title="Rounding">
					<div
						class="panel-content"
						v-for="(item, index) in vm.percentageFormats"
						:key="index"
					>
						<div class="radio-input">
							<input
								type="radio"
								class="input"
								name="Rounding"
								v-bind:value="item.id"
								v-model="vm.settings.round_format_id"
								@input="
									$emit(
										'update:vm.settings.round_format_id',
										vm.onRoundingChange()
									)
								"
							/>
							<label>{{ item?.name }}</label>
						</div>
						<!-- @update:v-modal="vm.onRoundingChange()" -->
						<!-- id=`'ZeroBase' + ${item?.id}` for="ZeroBase" -->
					</div>
				</FmExpansionPanel>
				<FmExpansionPanel title="Thousands separation">
					<div
						class="panel-content"
						v-for="(item, index) in vm.separationFormats"
						:key="index"
					>
						<div class="radio-input">
							<input
								type="radio"
								class="input"
								name="ThousandsSeparation"
								v-bind:value="item.id"
								v-model="vm.settings.thousands_separator_format_id"
								@input="
									$emit(
										'update:vm.settings.thousands_separator_format_id',
										vm.onNumberFormatChange()
									)
								"
							/>
							<label>{{ item?.name }}</label>
						</div>
						<!-- @update:v-modal="vm.onNumberFormatChange()" -->
						<!-- id=`'ZeroBase' + ${item?.id}` for="ZeroBase" -->
					</div>
				</FmExpansionPanel>

				<FmExpansionPanel title="Percentage">
					<div
						class="panel-content"
						v-for="(item, index) in vm.percentageFormats"
						:key="index"
					>
						<div class="radio-input">
							<input
								type="radio"
								class="input"
								name="percentageFormats"
								v-bind:value="item.id"
								v-model="vm.settings.percentage_format_id"
								@input="
									$emit(
										'update:vm.settings.percentage_format_id',
										vm.onPercentageChange()
									)
								"
							/>
							<label>{{ item?.name }}</label>
						</div>
						<!-- 	@update:v-modal="vm.onPercentageChange()" -->
						<!-- id=`'ZeroBase' + ${item?.id}` for="ZeroBase" -->
					</div>
				</FmExpansionPanel>
				<FmExpansionPanel title="Suffix">
					<div class="panel-content">
						<FmInputText
							label="Suffix"
							@update:v-modal="vm.onNumberFormatChange()"
							v-modal="SuffixActive"
						></FmInputText>
					</div>
				</FmExpansionPanel>
				<FmExpansionPanel title="Prefix">
					<div class="panel-content">
						<FmInputText
							label="Prefix"
							@update:v-modal="vm.onNumberFormatChange()"
							v-model="vm.settings.number_suffix"
						></FmInputText>
					</div>
				</FmExpansionPanel>
				<FmExpansionPanel title="Multiplier">
					<div class="panel-content">
						<FmInputText
							label="Multiplier"
							v-model="vm.settings.number_prefix"
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
	let vm = reactive({
		settings: props.settings,
		presetSelectorData: {options: { id: String, name: String, isActive: Boolean }},
		// selectOption: (option, _$popup) => void
	})
	console.log('vm:', vm)
	console.log('props.settings:', props.settings)

	const activeZero = ref([])
	const activeNegative = ref([])
	const activeRounding = ref([])
	const activeThousandsSeparation = ref([])
	const activePercentageFormats = ref([])
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
	if (vm) {
		const report_settings = JSON.parse(JSON.stringify(props.settings))
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

	function save() {
		emits('save', { status: 'agree', data: props.settings })
	}

	const isObjectContain = function (obj, targetObj) {
		return Object.keys(targetObj).every((key) => targetObj[key] === obj[key])
	}

	const getActivePreset = function () {
		const selectedPreset = vm.presetSelectorData.options.find((option) => {
			const requiredProps = presetsSettings[option.id]
			const currentProps = vm.settings
			// console.log(requiredProps, 'getActivePreset ')
			// console.log(vm.settings, 'vm.settings')
			// console.log(isObjectContain(currentProps, requiredProps), 'isObjectContain(currentProps, requiredProps)')
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
		console.log(currentPreset, 'currentPreset onNumberFormatChange ')
		console.log(currentPreset.name, 'currentPreset.name onNumberFormatChange')
		setTimeout(() => $scope.$apply())
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

	// watch(
	// 	vm.settings.zero_format_id,
	// 	(newValue, oldValue) => {
	// 		if (oldValue[0] === 0) {
	// 			console.log(
	// 				'vm.settings.zero_format_id внутри первый',
	// 				vm.settings.zero_format_id,
	// 				vm.settings.zero_format_id === 0
	// 			)
	// 		} else {
	// 			console.log(
	// 				'vm.settings.zero_format_id внутри второй',
	// 				vm.settings.zero_format_id,
	// 				vm.settings.zero_format_id === 0
	// 			)
	// 			vm.onNumberFormatChange()
	// 			// disabledBtn.value = false
	// 		}
	// 	},
	// 	{ deep: true }
	// )

	// const init = function () {
	// 	vm.onNumberFormatChange()

	// 	// const animatedContainers =
	// 	// 	$element[0].querySelectorAll('.cb1-resizing-wrap')
	// 	// setTimeout(() => setContainersHeight(animatedContainers)) // for height animation
	// }

	// init()
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
