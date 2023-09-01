/**
 * Created by szhitenev on 30.12.2021.
 */

import metaHelper from '../../helpers/meta.helper'

export default function ($scope, $mdDialog, data) {
	var vm = this

	vm.changeOnlyValue = !!data.changeOnlyValue

	//region MULTIPLE PARAMETER LOGIC

	vm.optionsForMultipleParameters = {}
	vm.attrsOptsSorted = true

	vm.getOptionsForAttributeKey = function (valueType) {
		var valueTypeInt = parseInt(valueType, 10)

		var result = []

		if (valueTypeInt === 10) {
			result.push({
				name: 'Reference for pricing',
				// user_code: 'reference_for_pricing'
				id: 'reference_for_pricing',
			})
		} else if (valueTypeInt === 20) {
			result.push({
				name: 'Default Price',
				// user_code: 'default_price'
				id: 'default_price',
			})
		} else if (valueTypeInt === 40) {
			result.push({
				name: 'Maturity Date',
				// user_code: 'maturity_date'
				id: 'maturity_date',
			})
		}

		var attrs = vm.instrumentAttrTypes
			.filter(function (attr) {
				if (attr.value_type === valueTypeInt) {
					return true
				}

				return false
			})
			.map(function (attr) {
				/* return {
                    name: item.name,
                    user_code: 'attributes.' + item.user_code
                } */
				return {
					name: attr.name,
					id: 'attributes.' + attr.user_code,
				}
			})

		attrs = metaHelper.textWithDashSort(attrs, 'name')

		result = result.concat(attrs)

		return result
	}

	vm.multipleParameterValueTypeUpdate = function (item, num) {
		var index = num - 1

		var value_type = item.data.parameters[index].value_type

		vm.optionsForMultipleParameters[value_type] =
			vm.getOptionsForAttributeKey(value_type)
	}

	vm.addParameter = function ($event, item) {
		/* if (!item.data) {
                item.data = {}
            }

            if (!item.data.parameters) {
                item.data.parameters = []
            } */

		var index = item.data.parameters.length

		index = index + 1

		item.data.parameters.push({
			index: index,
			___switch_state: 'default_value',
		})
	}

	vm.switchParameter = function ($event, item, parameter) {
		if (parameter.___switch_state === 'default_value') {
			parameter.___switch_state = 'attribute_key'
		} else {
			parameter.___switch_state = 'default_value'
		}

		parameter.default_value = null
		parameter.attribute_key = null
	}

	//endregion MULTIPLE PARAMETER LOGIC

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.agree = function (responseData) {
		$mdDialog.hide({
			status: 'agree',
			data: {
				item: JSON.parse(angular.toJson(vm.item)), // using angular.toJson to remove angular properties
			},
		})
	}

	vm.init = function () {
		vm.instrumentAttrTypes = data.instrumentAttrTypes

		if (!data.item || typeof data.item !== 'object') {
			console.error('Invalid event passed', data.item)
			throw data.item
		}

		vm.item = JSON.parse(angular.toJson(data.item))

		if (!vm.item.data) vm.item.data = {}

		if (!Array.isArray(vm.item.data.parameters)) {
			vm.item.data.parameters = []
		}

		vm.optionsForMultipleParameters[10] = vm.getOptionsForAttributeKey(10)
		vm.optionsForMultipleParameters[20] = vm.getOptionsForAttributeKey(20)
		vm.optionsForMultipleParameters[40] = vm.getOptionsForAttributeKey(40)
	}

	vm.init()
}
