/**
 * Created by szhitenev on 30.01.2020.
 */

import instrumentPricingSchemeService from '@/angular/services/pricing/instrumentPricingSchemeService'
import attributeTypeService from '@/angular/services/attributeTypeService'

export default function instrumentPricingSchemeAddDialogController(
	$scope,
	$mdDialog,
	data
) {
	var vm = this

	vm.item = {
		type_settings: {},
	}

	vm.types = []
	vm.switchState = 'default_value'

	vm.optionsForPrimaryParameter = []
	vm.optionsForMultipleParameters = {}

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

	vm.readyStatus = { types: false }

	vm.getAttributeTypes = function () {
		var entityType = 'instrument'

		attributeTypeService
			.getList(entityType, { pageSize: 1000 })
			.then(function (data) {
				vm.attributeTypes = data.results

				vm.readyStatus.attributeTypes = true

				$scope.$apply()
			})
	}

	vm.getTypes = function () {
		instrumentPricingSchemeService.getTypes().then(function (data) {
			var deprecatedTypes = [2] // manual pricing

			vm.types = data.results.filter(function (item) {
				return deprecatedTypes.indexOf(item.id) === -1
			})

			console.log('vm.types', vm.types)

			vm.readyStatus.types = true

			console.log('vm.readyStatus', vm.readyStatus)

			$scope.$apply()
		})
	}

	vm.getOptionsForAttributeKey = function (valueType) {
		var valueTypeInt = parseInt(valueType, 10)

		var result = []

		if (valueTypeInt === 10) {
			result.push({
				name: 'Reference for pricing',
				user_code: 'reference_for_pricing',
			})
		}

		if (valueTypeInt === 20) {
			result.push({
				name: 'Default Price',
				user_code: 'default_price',
			})
		}

		if (valueTypeInt === 40) {
			result.push({
				name: 'Maturity Date',
				user_code: 'maturity_date',
			})
		}

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

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.agree = function () {
		console.log('vm.item', vm.item)

		instrumentPricingSchemeService.create(vm.item).then(function (data) {
			console.log('data', data)

			$mdDialog.hide({ status: 'agree' })
		})
	}

	vm.switch = function ($event) {
		if (vm.switchState === 'default_value') {
			vm.switchState = 'attribute_key'
		} else {
			vm.switchState = 'default_value'
		}

		if (!vm.item.type_settings) {
			vm.item.type_settings = {}
		}

		vm.item.type_settings.default_value = null
		vm.item.type_settings.attribute_key = null
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

	vm.removeTenor = function ($event, item) {
		vm.item.type_settings.data.tenors.splice(item.index - 1, 1)

		vm.refreshTenorIndexes()
	}

	vm.addTenor = function () {
		if (!vm.item.type_settings.data) {
			vm.item.type_settings.data = {
				tenors: [],
			}
		}

		if (!vm.item.type_settings.data.tenors) {
			vm.item.type_settings.data.tenors = []
		}

		vm.item.type_settings.data.tenors.push({
			tenor_type: 'overnight',
			price_ticker: null,
		})

		vm.refreshTenorIndexes()
	}

	vm.refreshTenorIndexes = function () {
		vm.item.type_settings.data.tenors = vm.item.type_settings.data.tenors.map(
			function (item, index) {
				item.index = index + 1

				return item
			}
		)
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
		vm.getTypes()
		vm.getAttributeTypes()
		vm.expressionBuilderFunctions = vm.generateFunctionsForExpressionBuilder()
	}

	vm.init()
}
