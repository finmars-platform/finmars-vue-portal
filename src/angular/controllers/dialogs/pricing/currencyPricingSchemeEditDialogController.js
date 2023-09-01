/**
 * Created by szhitenev on 30.01.2020.
 */

import currencyPricingSchemeService from '@/angular/services/pricing/currencyPricingSchemeService'
import attributeTypeService from '@/angular/services/attributeTypeService'

export default function ($scope, $mdDialog, data) {


	var vm = this

	vm.itemId = data.item.id

	vm.item = {}
	vm.types = []
	vm.attributeTypes = []

	vm.optionsForPrimaryParameter = []
	vm.optionsForMultipleParameters = {}

	vm.readyStatus = { types: false, item: false, attributeTypes: false }

	vm.switchState = 'default_value'

	vm.primaryParameterValueTypeUpdate = function () {
		vm.optionsForPrimaryParameter = vm.getOptionsForAttributeKey(
			vm.item.type_settings.value_type
		)
	}

	vm.multipleParameterValueTypeUpdate = function (index) {
		var value_type = vm.item.type_settings.data.parameters[index].value_type

		vm.optionsForMultipleParameters[index] =
			vm.getOptionsForAttributeKey(value_type)
	}

	vm.getOptionsForAttributeKey = function (valueType) {
		var valueTypeInt = parseInt(valueType, 10)

		var result = []



		var attrs = vm.attributeTypes
			.filter(function (item) {
				if (item.value_type === valueTypeInt) {
					return true
				}

				return false
			})
			.map(function (item) {
				return {
					name: item.name,
					user_code: 'attributes.' + item.user_code,
				}
			})

		result = result.concat(attrs)

		return result
	}

	vm.getAttributeTypes = function () {
		return new Promise(function (resolve, reject) {
			var entityType = 'currency'

			attributeTypeService
				.getList(entityType, { pageSize: 1000 })
				.then(function (data) {
					vm.attributeTypes = data.results

					vm.optionsForPrimaryParameter = vm.getOptionsForAttributeKey(
						vm.item.type_settings.value_type
					)

					vm.readyStatus.attributeTypes = true

					resolve()
				})
		})
	}

	vm.getTypes = function () {
		currencyPricingSchemeService.getTypes().then(function (data) {
			var deprecatedTypes = [2] // manual pricing

			vm.types = data.results.filter(function (item) {
				return deprecatedTypes.indexOf(item.id) === -1
			})



			vm.readyStatus.types = true

			$scope.$apply()
		})
	}

	vm.getItem = function () {
		currencyPricingSchemeService.getByKey(vm.itemId).then(function (data) {
			vm.item = data

			if (vm.item.type_settings) {
				if (vm.item.type_settings.attribute_key) {
					vm.switchState = 'attribute_key'
				}
			}

			vm.readyStatus.item = true



			vm.getAttributeTypes().then(function () {
				if (vm.item.type_settings.data) {
					if (vm.item.type_settings.data.parameters) {
						vm.item.type_settings.data.parameters.forEach(function (
							item,
							index
						) {
							if (item.attribute_key) {
								item.___switch_state = 'attribute_key'
							}

							vm.optionsForMultipleParameters[index] =
								vm.getOptionsForAttributeKey(item.value_type)
						})
					}
				}

				console.log(
					'vm.optionsForMultipleParameters',
					vm.optionsForMultipleParameters
				)

				$scope.$apply()
			})
		})
	}

	vm.addParameter = function ($event) {
		if (!vm.item.type_settings.data) {
			vm.item.type_settings.data = {
				parameters: [],
			}
		}

		var index = vm.item.type_settings.data.parameters.length

		index = index + 1

		vm.item.type_settings.data.parameters.push({
			index: index,
			___switch_state: 'default_value',
		})
	}

	vm.switchParameter = function ($event, item) {
		if (item.___switch_state === 'default_value') {
			item.___switch_state = 'attribute_key'
		} else {
			item.___switch_state = 'default_value'
		}

		item.default_value = null
		item.attribute_key = null
	}

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.agree = function () {
		currencyPricingSchemeService
			.update(vm.item.id, vm.item)
			.then(function (data) {


				$mdDialog.hide({ status: 'agree', data: { item: vm.item } })
			})
	}

	vm.generateFunctionsForExpressionBuilder = function () {
		var result = []

		result.push({
			name: 'Context Instrument',
			description: '-',
			groups: 'context_var',
			func: 'context_instrument',
			validation: {
				func: 'context_instrument',
			},
		})

		result.push({
			name: 'Context Pricing Policy',
			description: '-',
			groups: 'context_var',
			func: 'context_pricing_policy',
			validation: {
				func: 'context_pricing_policy',
			},
		})

		result.push({
			name: 'Context Date',
			description: '-',
			groups: 'context_var',
			func: 'context_date',
			validation: {
				func: 'context_date',
			},
		})

		return result
	}

	vm.init = function () {
		vm.getItem()
		vm.getTypes()

		vm.expressionBuilderFunctions = vm.generateFunctionsForExpressionBuilder()
	}

	vm.init()
}
