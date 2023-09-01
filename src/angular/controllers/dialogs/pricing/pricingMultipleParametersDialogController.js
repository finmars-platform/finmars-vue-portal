/**
 * Created by szhitenev on 21.02.2020.
 */

export default function ($scope, $mdDialog, data) {
	var vm = this

	vm.item = JSON.parse(JSON.stringify(data.item))
	vm.entityType = data.entityType
	vm.attributeTypes = data.attributeTypes

	vm.schemeParameters = []
	vm.items = []

	vm.optionsForMultipleParameters = {}

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



	if (vm.item.pricing_scheme_object) {
		if (
			vm.item.pricing_scheme_object.type_settings.data &&
			vm.item.pricing_scheme_object.type_settings.data.parameters
		) {
			vm.schemeParameters =
				vm.item.pricing_scheme_object.type_settings.data.parameters
		}
	}

	vm.getVerboseValueType = function (valueType) {
		valueType = parseInt(valueType, 10)

		if (valueType === 10) {
			return 'Text'
		}

		if (valueType === 20) {
			return 'Number'
		}

		if (valueType === 40) {
			return 'Date'
		}
	}

	vm.switch = function ($event, item) {
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
		if (!vm.item.data) {
			vm.item.data = {}
		}

		vm.item.data.parameters = vm.items



		$mdDialog.hide({ status: 'agree', data: { item: vm.item } })
	}

	const getFieldTypeData = (item) => {
		switch (+item.value_type) {
			case 10:
				return {
					fieldType: 'textInput',
					sign: 'T',
					valueType: +item.value_type,
				}
			case 20:
				return {
					fieldType: 'numberInput',
					sign: 'N',
					valueType: +item.value_type,
				}
			case 40:
				return {
					fieldType: 'dateInput',
					sign: 'D',
					valueType: +item.value_type,
				}
			case 70:
				return {
					fieldType: 'dropdownSelect',
					sign: 'L',
					valueType: +item.value_type,
				}
		}
	}

	vm.onValueChange = (item) => {
		const activeFieldType = item.___fieldTypesData.find(
			(field) => field.isActive
		)

		if (activeFieldType.value_type === 70) {
			item.attribute_key = activeFieldType.model
			item.default_value = null
			item.___switch_state = 'attribute_key'
		} else {
			item.attribute_key = null
			item.default_value = activeFieldType.model
			item.___switch_state = 'default_value'
		}
	}

	vm.syncStructure = function () {
		if (vm.item.data) {
			if (vm.item.data.parameters) {
				vm.items = vm.item.data.parameters.map(function (item) {
					return item
				})
			}
		}

		if (vm.schemeParameters) {
			vm.schemeParameters.forEach(function (param) {
				var exist = false



				vm.items.forEach(function (item) {


					if (param.index === item.index) {
						exist = true
					}
				})

				if (!exist) {
					vm.items.push(param)
				}
			})
		}

		vm.items.forEach(function (item) {
			var value_type = item.value_type

			vm.optionsForMultipleParameters[item.index] =
				vm.getOptionsForAttributeKey(value_type)
		})

		vm.items.forEach((item) => {
			const { fieldType, sign, valueType } = getFieldTypeData(item)
			item.___default_value = item.default_value
			item.___attribute_key = item.attribute_key
			item.___fieldTypesData = [
				{
					model: item.___default_value,
					fieldType: fieldType,
					isDefault: true,
					isActive: item.___switch_state === 'default_value',
					sign: `<div class="multitype-field-type-letter type-with-constant">${sign}</div>`,
					value_type: valueType,
					fieldData: {
						smallOptions: { dialogParent: '.dialog-containers-wrap' },
					},
				},
				{
					model: item.___attribute_key,
					fieldType: 'dropdownSelect',
					isDefault: false,
					isActive: item.___switch_state === 'attribute_key',
					sign: '<div class="multitype-field-type-letter">L</div>',
					value_type: 70,
					fieldData: {
						smallOptions: { dialogParent: '.dialog-containers-wrap' },
						menuOptions: vm.optionsForMultipleParameters[item.index].map(
							({ name, user_code }) => ({ name, id: user_code })
						),
					},
				},
			]
		})
	}

	vm.init = function () {
		vm.syncStructure()
	}

	vm.init()
}
