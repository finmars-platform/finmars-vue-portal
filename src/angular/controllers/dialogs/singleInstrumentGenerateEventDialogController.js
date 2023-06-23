/**
 * Created by szhitenev on 29.04.2020.
 */

import instrumentEventService from '../../services/instrumentEventService'

export default function singleInstrumentGenerateEventDialogController(
	$scope,
	$mdDialog,
	data
) {
	var vm = this

	vm.instrument = data.instrument
	vm.contextData = data.contextData

	vm.options = {}

	vm.pricingPolicies = []

	vm.pricingPolicyFilter = {}

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.requestEvents = function (sortingOptions) {
		return new Promise(function (resolve, reject) {
			var options = {}
			if (sortingOptions && sortingOptions.hasOwnProperty('sort')) {
				options.sort = {}
				options.sort = sortingOptions.sort
			}

			options.filters = {}
			options.filters.effective_date_0 = vm.options.effective_date_0
			options.filters.effective_date_1 = vm.options.effective_date_1
			options.filters.status = 1

			// options.filters = filters;
			instrumentEventService.getList(options).then(function (data) {
				vm.events = data.results

				resolve(vm.events)
			})
		})
	}

	vm.agree = function () {
		vm.options.instrument = vm.instrument.id

		instrumentEventService
			.generateEventsRangeForSingleInstrument(vm.options)
			.then(function (data) {
				setTimeout(function () {
					vm.requestEvents().then(function (data) {
						$mdDialog.hide({
							status: 'agree',
							data: {
								events: vm.events,
							},
						})
					})
				}, 2000)
			})
	}

	vm.init = function () {}

	vm.init()
}
