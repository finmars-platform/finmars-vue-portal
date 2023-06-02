/**
 * Created by szhitenev on 30.12.2021.
 */

import transactionTypeService from '../../services/transactionTypeService'

export default function ($scope, $mdDialog, data) {
	var vm = this

	vm.title = 'Instrument Event Action Parameter Dialog'

	var eventParameters = []

	//region MULTIPLE PARAMETER LOGIC

	vm.optionsForMultipleParameters = {}

	vm.getOptionsForAttributeKey = function (valueType) {
		var valueTypeInt = parseInt(valueType, 10)

		var result = []

		var attrs = eventParameters.filter(function (item) {
			if (parseInt(item.value_type, 10) === valueTypeInt) {
				return true
			}

			return false
		})

		result = result.concat(attrs)

		return result
	}

	//endregion MULTIPLE PARAMETER LOGIC

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.agree = function (responseData) {
		if (!vm.action.data) {
			vm.action.data = {}
		}

		if (!vm.action.data.parameters) {
			vm.action.data.parameters = []
		}

		vm.transactionType.context_parameters.forEach(function (parameter) {
			vm.action.data.parameters.push({
				order: parameter.order,
				name: parameter.name,
				value_type: parameter.value_type,
				event_parameter_name: parameter.event_parameter_name,
			})
		})

		$mdDialog.hide({
			status: 'agree',
			data: {
				item: vm.action,
			},
		})
	}

	vm.init = function () {
		if (!data.item) {
			console.error('Invalid event action')
			throw data.item
		}

		if (!data.item.transaction_type) {
			throw 'Transaction type required'
		}

		vm.processsing = true

		transactionTypeService
			.getListLightWithInputs({
				filters: {
					user_code: data.item.transaction_type,
				},
			})
			.then(function (res) {
				vm.processsing = false

				if (res.results.length) {
					vm.transactionType = res.results[0]
				} else {
					console.error(
						"Transaction type with user code '" +
							data.item.transaction_type +
							"' does not exist"
					)
					$mdDialog.hide({ status: 'disagree' })
				}

				if (Array.isArray(data.eventParameters)) {
					eventParameters = JSON.parse(angular.toJson(data.eventParameters))
				}

				vm.action = JSON.parse(angular.toJson(data.item))

				if (vm.transactionType.context_parameters_notes) {
					vm.title = vm.transactionType.context_parameters_notes
				}

				vm.optionsForMultipleParameters[10] = vm.getOptionsForAttributeKey(10)
				vm.optionsForMultipleParameters[20] = vm.getOptionsForAttributeKey(20)
				vm.optionsForMultipleParameters[40] = vm.getOptionsForAttributeKey(40)

				console.log(
					'vm.optionsForMultipleParameters',
					vm.optionsForMultipleParameters
				)

				if (vm.action.data && vm.action.data.parameters) {
					vm.transactionType.context_parameters.forEach(function (parameter) {
						vm.action.data.parameters.forEach(function (action_parameter) {
							if (parameter.order === action_parameter.order) {
								parameter.event_parameter_name =
									action_parameter.event_parameter_name
							}
						})
					})
				}

				$scope.$apply()
			})
	}

	vm.init()
}
