/**
 * Created by mevstratov on 09.08.2019
 *
 * Deprecated.
 *
 */

export default function ($scope, $mdDialog, data) {
	var vm = this

	vm.settings = data.settings
	vm.title = data.title

	if (!vm.settings) {
		vm.settings = {}
	}

	vm.settings = JSON.parse(JSON.stringify(vm.settings))

	if (!vm.settings.zero_format_id) {
		vm.settings.zero_format_id = 0
	}

	if (!vm.settings.negative_format_id) {
		vm.settings.negative_format_id = 0
	}

	if (!vm.settings.negative_color_format_id) {
		vm.settings.negative_color_format_id = 0
	}

	if (!vm.settings.round_format_id) {
		vm.settings.round_format_id = 0
	}

	if (!vm.settings.thousands_separator_format_id) {
		vm.settings.thousands_separator_format_id = 0
	}

	if (!vm.settings.percentage_format_id) {
		vm.settings.percentage_format_id = 0
	}

	if (!vm.settings.number_multiplier) {
		vm.settings.number_multiplier = null
	}

	if (!vm.settings.number_suffix) {
		vm.settings.number_suffix = ''
	}

	if (!vm.settings.number_prefix) {
		vm.settings.number_prefix = ''
	}

	vm.onRoundingChange = function () {
		if (vm.settings.round_format_id !== 0) {
			vm.settings.percentage_format_id = 0

			vm.settings.number_multiplier = null
			vm.settings.number_suffix = ''
			vm.settings.number_prefix = ''
		}
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
	}

	vm.onInputsChange = function () {
		if (
			vm.settings.number_multiplier === 100 &&
			vm.settings.number_prefix === '' &&
			vm.settings.number_suffix === '%'
		) {
			vm.settings.percentage_format_id = 1
		} else if (
			vm.settings.number_multiplier === 10000 &&
			vm.settings.number_prefix === '' &&
			vm.settings.number_suffix === 'bps'
		) {
			vm.settings.percentage_format_id = 4
		} else {
			vm.settings.percentage_format_id = 0
		}
	}

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.save = function () {
		$mdDialog.hide({ status: 'agree', data: { settings: vm.settings } })
	}
}
