export default function () {
	/**
	 * @param attrTypesList {Array} - dynamic attributes
	 * @param multitypeFields {Object} - data for multitypeFieldDirective
	 */
	const fillSelectorOptionsBasedOnValueType = function (
		attrTypesList,
		multitypeFields
	) {
		Object.keys(multitypeFields).forEach((key) => {
			const fieldData = multitypeFields[key]

			/* const selTypeIndex = fieldTypeObj.findIndex(type => type.fieldType === 'dropdownSelect');
				const notSelType = fieldTypeObj.find(type => type.fieldType !== 'dropdownSelect'); */
			const selectorType = fieldData.fieldTypesList.find(
				(type) => type.fieldType === 'dropdownSelect'
			)

			const formattedAttrTypes = attrTypesList
				.filter((attrType) => {
					return (
						attrType.value_type === fieldData.value_type &&
						!attrType.can_recalculate
					)
				})
				.map((attrType) => {
					return { id: attrType.user_code, name: attrType.short_name }
				})

			/* fieldTypesList[selTypeIndex].fieldData = {
					menuOptions: formattedAttrTypes || []
				}; */
			selectorType.fieldData = {
				menuOptions: formattedAttrTypes || [],
			}
		})
	}

	/**
	 * Set active type inside typesList based on activeValueType
	 *
	 * @param typesList {Array.<Object>} - Changed by function. Array of types for multitype field
	 * @param modelValue {*} - value of field
	 * @param activeValueType {number|*} - value type of active field
	 * @return {number} - returns active value_type
	 */
	const setActiveTypeByValueType = (typesList, modelValue, activeValueType) => {
		var activeTypeNotFound = true

		if (activeValueType && !isNaN(activeValueType)) {
			typesList.forEach((type) => {
				if (type.value_type === activeValueType) {
					type.model = modelValue
					type.isActive = true
					activeTypeNotFound = false
				} else {
					type.isActive = false
				}
			})

			if (activeTypeNotFound)
				console.error(
					'setActiveTypeByValueType: activeValueType does not match any type from typesList',
					activeValueType,
					typesList
				)
		}

		if (activeTypeNotFound) {
			// if wrong or no value_type was passed, make default type active

			typesList.forEach((type) => {
				if (type.isDefault) {
					type.model = modelValue
					type.isActive = true
					activeValueType = type.value_type
				} else {
					type.isActive = false
				}
			})
		}

		return activeValueType
	}

	const getReportLayoutsSelectorData = () => {
		return [
			{
				key: 'balance-report',
				model: '',
				fieldType: 'dropdownSelect',
				isDefault: true,
				isActive: false,
				sign: '<div class="multitype-field-type-letter">BS</div>',
				name: 'Balance',
				value_type: 100,
				fieldData: {
					smallOptions: { dialogParent: '.dialog-containers-wrap' },
					menuOptions: [],
				},
			},
			{
				key: 'pl-report',
				model: '',
				fieldType: 'dropdownSelect',
				isDefault: false,
				isActive: false,
				sign: '<div class="multitype-field-type-letter">PL</div>',
				name: 'Profit & Loss',
				value_type: 100,
				fieldData: {
					smallOptions: { dialogParent: '.dialog-containers-wrap' },
					menuOptions: [],
				},
			},
			{
				key: 'transaction-report',
				model: '',
				fieldType: 'dropdownSelect',
				isDefault: false,
				isActive: false,
				sign: '<div class="multitype-field-type-letter">TR</div>',
				name: 'Transactions',
				value_type: 100,
				fieldData: {
					smallOptions: { dialogParent: '.dialog-containers-wrap' },
					menuOptions: [],
				},
			},
		]
	}

	return {
		fillSelectorOptionsBasedOnValueType: fillSelectorOptionsBasedOnValueType,
		setActiveTypeByValueType: setActiveTypeByValueType,

		getReportLayoutsSelectorData: getReportLayoutsSelectorData,
	}
}
