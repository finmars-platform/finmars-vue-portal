/**
 * Created by vzubr on 30.12.2020.
 */

import instrumentPricingSchemeService from '@/angular/services/pricing/instrumentPricingSchemeService'
import attributeTypeService from '@/angular/services/attributeTypeService'
import evEditorEvents from '@/angular/services/ev-editor/entityViewerEditorEvents'

import GridTableDataService from '@/angular/services/gridTableDataService'
import GridTableEventService from '@/angular/services/gridTableEventService'
import gridTableEvents from '@/angular/services/gridTableEvents'

import metaHelper from '@/angularlpers/meta.helper'

import pricingPolicyService from '@/angular/services/pricingPolicyService'

export default function InstrmentPricingTabController(
	$scope,
	$mdDialog,
	gridTableHelperService
) {
	var vm = this

	vm.readyStatus = false
	vm.instrumentPricingSchemes = null

	vm.entity = $scope.$parent.vm.entity
	vm.entityType = $scope.$parent.vm.entityType // 'instrument' or 'instrument-type'
	vm.currencies = $scope.$parent.vm.currencies
	vm.pricingConditions = $scope.$parent.vm.pricingConditions

	//region Inherit from a parent controller

	vm.attributeTypesByValueTypes = $scope.$parent.vm.attributeTypesByValueTypes // Parent controller can be entityViewerEditDialogController, entityViewerAddDialogController, instrumentTypeEditDialogController, instrumentTypeAddDialogController
	vm.pricingSchemeChange = $scope.$parent.vm.pricingSchemeChange // Have to leave pricingSchemeChange one level above because of currency entity viewer

	vm.contextData = $scope.$parent.vm.contextData
	vm.entityAttrs = $scope.$parent.vm.entityAttrs

	vm.evEditorDataService = $scope.$parent.vm.evEditorDataService
	vm.evEditorEventService = $scope.$parent.vm.evEditorEventService
	vm.entityChange = $scope.$parent.vm.entityChange
	//endregion

	vm.pricingCurrencyAttr = vm.entityAttrs.find(
		(eAttr) => eAttr.key === 'pricing_currency'
	)

	/*const pricingDefaultValueFieldTypes = {
			fieldTypesList: [
				{
					'model': "",
					'fieldType': 'textInput',
					'isDefault': true,
					'isActive': false,
					'sign': '<div class="multitype-field-type-letter type-with-constant">T</div>',
					'value_type': 10,
					'fieldData': {
						'smallOptions': {'dialogParent': '.dialog-containers-wrap'}
					}
				},
				{
					'model': null,
					'fieldType': 'dropdownSelect',
					'isDefault': true,
					'isActive': false,
					'sign': '<div class="multitype-field-type-letter">L</div>',
					'value_type': 70,
					'fieldData': {
						'menuOptions': [],
						'smallOptions': {'dialogParent': '.dialog-containers-wrap'},
						'sorted': true
					}
				}
			]
		};*/

	const pricingDefaultValueFieldTypes =
		pricingPolicyService.pricingDefaultValueFieldTypes

	//region Pricing policies grid table

	var getPpTemplateRow = function () {
		let templateRow = pricingPolicyService.getPpGtTemplateRow(vm.entityType)

		let pricingPolicyCell = gridTableHelperService.getCellFromRowByKey(
			templateRow,
			'pricing_policy'
		)
		pricingPolicyCell.styles['grid-table-cell-elem'] = { width: '10%' }

		let pricingScheme = gridTableHelperService.getCellFromRowByKey(
			templateRow,
			'pricing_scheme'
		)
		pricingScheme.styles['grid-table-cell-elem'] = { width: '20%' }

		let pricingSchemeClarification = gridTableHelperService.getCellFromRowByKey(
			templateRow,
			'pricing_scheme_clarification'
		)
		pricingSchemeClarification.styles['grid-table-cell-elem'] = {
			width: '40%',
		}

		let defaultParameters = gridTableHelperService.getCellFromRowByKey(
			templateRow,
			'edit_default_parameters'
		)
		defaultParameters.styles['grid-table-cell-elem'] = { width: '20%' }

		let multipleParameters = gridTableHelperService.getCellFromRowByKey(
			templateRow,
			'multiple_parameters'
		)
		multipleParameters.styles['grid-table-cell-elem'] = { width: '10%' }

		return templateRow
	}

	const pricingPoliciesGridTableData = {
		header: {
			order: 'header',
			columns: [],
		},
		body: [],
		templateRow: getPpTemplateRow(),
		/* {
				isActive: false,
                columns: [
                    {
                        key: 'pricing_policy',
                        columnName: 'Pricing Policy',
                        order: 0,
                        cellType: 'readonly_text',
                        settings: {
                            value: null,
                        },
                        styles: {
                            'grid-table-cell-elem': {'width': '10%'}
                        },
                        classes: 'pricing-policy'
                    },
                    {
                        key: 'pricing_scheme',
                        objPath: ['pricing_scheme'],
                        columnName: 'Pricing Scheme',
                        order: 1,
                        cellType: 'selector',
                        settings: {
                            value: null,
                            selectorOptions: [],
                        },
                        styles: {
                            'grid-table-cell-elem': {'width': '20%'}
                        },
                        classes: 'pricing-scheme'
                    },
                    {
                        key: 'pricing_scheme_clarification',
						objPath: ['pricing_scheme_object', 'notes_for_users'],
                        columnName: 'Pricing Scheme Clarification',
                        order: 2,
                        cellType: 'readonly_text',
                        settings: {
                            value: null
                        },
                        styles: {
                            'grid-table-cell-elem': {'width': '40%'}
                        },
                        classes: 'gt-cell-multi-lined-text gt-cell-plain-text'
                    },
                    {
                        key: 'edit_default_parameters',
                        objPath: ['default_value'],
                        columnName: 'Edit Default Parameters',
                        order: 3,
                        cellType: 'multitypeField',
                        settings: {
                            value: null,
							fieldTypesData: []
                        },
                        styles: {
                            'grid-table-cell-elem': {'width': '20%'}
                        },
                        classes: 'edit-default-parameters'
                    },
                    {
                        key: 'multiple_parameters',
                        // objPath: ['default_value'],
                        columnName: 'Multiple Parameters',
                        order: 4,
                        cellType: 'readonly_text',
                        settings: {
                            value: '-'
                        },
                        styles: {
                            'grid-table-cell-elem': {'width': '10%'}
                        },
                        // classes: 'edit-default-parameters'
                    },

                ],
                styles: {'grid-table-row': {'cursor': 'pointer'}}
            }, */

		tableMethods: {
			addRow: '', //onEventsTableAddRow
		},

		components: {
			topPanel: false,
			rowCheckboxes: false,
		},
	}

	var getOptionsForPPDefaultValueSel = function (typesList, pricingPolicy) {
		// menuOptions for selector inside edit_default_parameters column received based on selected pricing scheme
		if (
			pricingPolicy.pricing_scheme_object &&
			pricingPolicy.pricing_scheme_object.type_settings &&
			pricingPolicy.pricing_scheme_object.type_settings.value_type
		) {
			const selectorType = typesList.find(
				(type) => type.fieldType === 'dropdownSelect'
			)
			selectorType.fieldData.menuOptions =
				vm.attributeTypesByValueTypes[
					pricingPolicy.pricing_scheme_object.type_settings.value_type
				] || []
		}

		return typesList
	}

	/**
	 *
	 * @param policy {object} - pricing policy
	 * @returns {[*, number]} - value and value_type for default parameters of pricing policy
	 */
	var getDefaultParametersVal = function (policy) {
		var value, valueType

		if (policy.default_value) {
			// text input

			value = policy.default_value
			valueType = 10
		} else {
			// selector

			value = policy.attribute_key
			valueType = 70
		}

		return [value, valueType]
	}

	/* const openPricingMultipleParametersDialog = (policy) => {

            $mdDialog.show({
                controller: 'PricingMultipleParametersDialogController as vm',
                templateUrl: 'views/dialogs/pricing/pricing-multiple-parameter-dialog-view.html',
                parent: angular.element(document.body),
                // targetEvent: $event,
                clickOutsideToClose: false,
                preserveScope: true,
                autoWrap: true,
                skipHide: true,
                multiple: true,
                locals: {
                    data: {
                        item: policy,
                        entityType: vm.entityType,
                        attributeTypes: vm.attributeTypes
                    }

                }
            }).then(function (res) {

                if (res.status === 'agree') {
                    policy.data = res.data.item.data
                }

            })
        } */
	const openPricingMultipleParametersDialog = (pricingPolicy) => {
		pricingPolicyService.openPricingMultipleParametersDialog(
			$mdDialog,
			pricingPolicy,
			vm.entityType,
			vm.attributeTypes
		)
	}

	var setUpDefaultParametersAsMultitypeCell = function (
		pricingPolicy,
		defaultParametersCell
	) {
		defaultParametersCell.cellType = 'multitypeField' // needed when function called on pricing_scheme change

		let typesList = JSON.parse(
			JSON.stringify(pricingDefaultValueFieldTypes.fieldTypesList)
		)

		const [defaultValue, fieldValueType] =
			getDefaultParametersVal(pricingPolicy)

		// if (fieldValueType === 70) typesList = getOptionsForPPDefaultValueSel(typesList, policy);
		typesList = getOptionsForPPDefaultValueSel(typesList, pricingPolicy)

		const fieldData = gridTableHelperService.getMultitypeFieldDataForCell(
			typesList,
			defaultParametersCell,
			defaultValue,
			fieldValueType
		)

		defaultParametersCell = fieldData.cell

		return defaultParametersCell
	}

	var setUpMultipleParametersAsButtonCell = function (
		pricingPolicy,
		multipleParametersCell
	) {
		multipleParametersCell.cellType = 'button'
		multipleParametersCell.settings = {
			buttonContent: '<span class="material-icons more-btn">more_horiz</span>',
		}

		multipleParametersCell.methods = {
			onClick: () => openPricingMultipleParametersDialog(pricingPolicy),
		}

		multipleParametersCell.classes = ['gt-more-btn']

		return multipleParametersCell
	}

	var formatDataForPricingGridTable = function () {
		vm.pricingPoliciesGridTableData = JSON.parse(
			JSON.stringify(pricingPoliciesGridTableData)
		)

		//region assemble header columns
		var rowObj = metaHelper.recursiveDeepCopy(
			vm.pricingPoliciesGridTableData.templateRow,
			true
		)

		vm.pricingPoliciesGridTableData.header.columns = rowObj.columns.map(
			function (column) {
				var headerData = {
					key: column.key,
					columnName: column.columnName,
					order: column.order,
					sorting: column.key !== 'multiple_parameters',
					styles: {
						'grid-table-cell-elem': {
							width: column.styles['grid-table-cell-elem'].width,
						},
					},
					classes: column.classes,
				}

				return headerData
			}
		)
		//endregion

		//region assemble body rows
		if (!Array.isArray(vm.entity.pricing_policies))
			vm.entity.pricing_policies = []

		vm.entity.pricing_policies.forEach(function (policy, policyIndex) {
			policy.order = policyIndex

			rowObj = metaHelper.recursiveDeepCopy(
				vm.pricingPoliciesGridTableData.templateRow,
				true
			)

			/* var rowKey = policy.id;

            	if (!rowKey && rowKey !== 0) {
					rowKey = metaHelper.generateUniqueId(policyIndex);
				} */

			// using user_code of pricing policy helps with row's mapping after change of instrument type
			rowObj.key = policy.pricing_policy_object.user_code
			rowObj.order = policy.order

			const pricingPolicyCell = gridTableHelperService.getCellFromRowByKey(
				rowObj,
				'pricing_policy'
			)
			pricingPolicyCell.settings.value = policy.pricing_policy_object.name

			const pricingScheme = gridTableHelperService.getCellFromRowByKey(
				rowObj,
				'pricing_scheme'
			)
			if (policy.pricing_scheme_object) {
				pricingScheme.settings.value = policy.pricing_scheme_object.id
			}

			pricingScheme.settings.selectorOptions = vm.instrumentPricingSchemes

			const pricingSchemeClarification =
				gridTableHelperService.getCellFromRowByKey(
					rowObj,
					'pricing_scheme_clarification'
				)
			if (policy.pricing_scheme_object) {
				pricingSchemeClarification.settings.value =
					policy.pricing_scheme_object.notes_for_users
			}

			//region Default parameters column
			let defaultParameters = gridTableHelperService.getCellFromRowByKey(
				rowObj,
				'edit_default_parameters'
			)

			defaultParameters = setUpDefaultParametersAsMultitypeCell(
				policy,
				defaultParameters
			)

			gridTableHelperService.setCellInsideRow(rowObj, defaultParameters)
			//endregion Default parameters column

			//region Multiple parameters column
			if (
				policy.pricing_scheme_object &&
				policy.pricing_scheme_object.type_object.input_type == 3
			) {
				let multipleParameters = gridTableHelperService.getCellFromRowByKey(
					rowObj,
					'multiple_parameters'
				)
				/* multipleParameters.cellType = 'button';
					multipleParameters.settings = {
						buttonContent: '<span class="material-icons multiple-parameters-button">more_horiz</span>'
					};

					multipleParameters.methods = {
						onClick: () => openPricingMultipleParametersDialog(policy)
					};

					multipleParameters.classes = ['gt-more-btn']; */

				setUpMultipleParametersAsButtonCell(policy, multipleParameters)
			}
			//endregion Multiple parameters column

			vm.pricingPoliciesGridTableData.body.push(rowObj)
		})
		//endregion assemble body rows

		return vm.pricingPoliciesGridTableData
	}
	//endregion Pricing policies grid table

	var initGridTableEvents = function () {
		vm.pricingPoliciesGridTableEventService.addEventListener(
			gridTableEvents.CELL_VALUE_CHANGED,
			(argObj) => {
				const row = argObj.row
				const column = argObj.column

				if (column.key === 'edit_default_parameters') {
					// for cell with multitypeField

					const cell = vm.pricingPoliciesGridTableDataService.getCell(
						row.order,
						column.order
					)
					const activeType = cell.settings.fieldTypesData.find(
						(type) => type.isActive
					)

					const matchingProp =
						activeType.value_type === 10 ? 'default_value' : 'attribute_key'
					const propToClear =
						activeType.value_type === 10 ? 'attribute_key' : 'default_value'

					vm.entity.pricing_policies[row.order][matchingProp] =
						cell.settings.value
					vm.entity.pricing_policies[row.order][propToClear] = null
				} else if (column.key === 'pricing_scheme') {
					// 'pricing_policy' cell

					const pricingSchemeCell =
						vm.pricingPoliciesGridTableDataService.getCellByKey(
							row.order,
							'pricing_scheme'
						)

					gridTableHelperService.onGridTableCellChange(
						vm.entity.pricing_policies,
						vm.pricingPoliciesGridTableDataService,
						row.order,
						column.order
					)

					vm.pricingSchemeChange(vm.entity.pricing_policies[row.order])
					// reassigning variable changedPolicy after vm.entity.pricing_policies array recreation inside vm.pricingSchemeChange()
					const changedPolicy = vm.entity.pricing_policies[row.order]

					let pricingSchemeClarCell =
						vm.pricingPoliciesGridTableDataService.getCellByKey(
							row.order,
							'pricing_scheme_clarification'
						)
					pricingSchemeClarCell.settings.value = null

					if (
						changedPolicy.pricing_scheme_object &&
						changedPolicy.pricing_scheme_object.notes_for_users
					) {
						pricingSchemeClarCell.settings.value =
							changedPolicy.pricing_scheme_object.notes_for_users
					}

					//region Default parameters column
					let defaultValueCell =
						vm.pricingPoliciesGridTableDataService.getCellByKey(
							row.order,
							'edit_default_parameters'
						)

					const selectedPricingScheme = vm.instrumentPricingSchemes.find(
						(ipScheme) => {
							return ipScheme.id === pricingSchemeCell.settings.value
						}
					)

					if (selectedPricingScheme.type === 1) {
						defaultValueCell.cellType = 'readonly_text'
						defaultValueCell.settings = {
							value: '-',
						}
					} else {
						/* defaultValueCell.cellType = 'multitypeField';
						const [defaultValue, fieldValueType] = getDefaultParametersVal(changedPolicy);
						if (fieldValueType === 70) {
							defaultValueCell.settings.fieldTypesData = getOptionsForPPDefaultValueSel(defaultValueCell.settings.fieldTypesData, changedPolicy);
						}

						const fieldData = gridTableHelperService.getMultitypeFieldDataForCell(defaultValueCell.settings.fieldTypesData, defaultValueCell, defaultValue, fieldValueType);
						defaultValueCell.settings = {...defaultValueCell.settings, ...fieldData.cell.settings}; */

						defaultValueCell = setUpDefaultParametersAsMultitypeCell(
							changedPolicy,
							defaultValueCell
						)
					}
					//endregion Default parameters column

					//region Multiple parameters column
					let multipleParameters =
						vm.pricingPoliciesGridTableDataService.getCellByKey(
							row.order,
							'multiple_parameters'
						)
					if (
						changedPolicy.pricing_scheme_object &&
						changedPolicy.pricing_scheme_object.type_object.input_type == 3
					) {
						/*multipleParameters.cellType = 'button';
						multipleParameters.settings = {
							buttonContent: '<span class="material-icons multiple-parameters-button">more_horiz</span>'
						};
						multipleParameters.methods = {
							onClick: () => openPricingMultipleParametersDialog(changedPolicy)
						}*/
						multipleParameters = setUpMultipleParametersAsButtonCell(
							changedPolicy,
							multipleParameters
						)
						vm.pricingPoliciesGridTableEventService.dispatchEvent(
							gridTableEvents.REDRAW_TABLE
						) // apply class to multiple_parameters cell
					} else {
						multipleParameters.cellType = 'readonly_text'
						multipleParameters.settings.value = '-'
						delete multipleParameters.methods
					}
					//endregion Multiple parameters column
				}
			}
		)
	}

	vm.runPricingInstrument = function ($event) {
		$mdDialog
			.show({
				controller: 'RunPricingInstrumentDialogController as vm',
				templateUrl:
					'views/dialogs/pricing/run-pricing-instrument-dialog-view.html',
				parent: angular.element(document.body),
				targetEvent: $event,
				clickOutsideToClose: false,
				preserveScope: true,
				autoWrap: true,
				skipHide: true,
				multiple: true,
				locals: {
					data: {
						instrument: vm.entity,
						contextData: vm.contextData,
					},
				},
			})
			.then(function (res) {
				if (res.status === 'agree') {
					$mdDialog.show({
						controller: 'InfoDialogController as vm',
						templateUrl: 'views/info-dialog-view.html',
						parent: angular.element(document.body),
						targetEvent: $event,
						clickOutsideToClose: false,
						preserveScope: true,
						autoWrap: true,
						skipHide: true,
						multiple: true,
						locals: {
							info: {
								title: 'Success',
								description: 'Pricing Process Initialized.',
							},
						},
					})
				}
			})
	}

	const generateInstrumentAttributeTypesByValueTypes = function () {
		vm.attributeTypesByValueTypes = {
			10: [
				{
					name: 'Reference For Pricing',
					id: 'reference_for_pricing',
				},
			],
			20: [
				{
					name: 'Default Price',
					id: 'default_price',
				},
			],
			40: [
				{
					name: 'Maturity Date',
					id: 'maturity_date',
				},
			],
		}

		var getAttributesByValueType = function (valueType) {
			var attrsList = vm.attributeTypes
				.filter(function (item) {
					return item.value_type === valueType
				})
				.map(function (item) {
					return {
						name: item.name,
						id: 'attributes.' + item.user_code,
					}
				})

			attrsList = metaHelper.textWithDashSort(attrsList, 'name')

			return attrsList
		}

		/*vm.attributeTypesByValueTypes[10] = vm.attributeTypesByValueTypes[10].concat(vm.attributeTypes.filter(function (item) {
                return item.value_type === 10;
            }).map(function (item) {

                return {
                    name: item.name,
                    id: 'attributes.' + item.id
                }

            }));*/
		vm.attributeTypesByValueTypes[10] =
			vm.attributeTypesByValueTypes[10].concat(getAttributesByValueType(10))

		/*vm.attributeTypesByValueTypes[20] = vm.attributeTypesByValueTypes[20].concat(vm.attributeTypes.filter(function (item) {
                return item.value_type === 20;
            }).map(function (item) {

                return {
                    name: item.name,
					id: 'attributes.' + item.id
                }

            }));*/
		vm.attributeTypesByValueTypes[20] =
			vm.attributeTypesByValueTypes[20].concat(getAttributesByValueType(20))

		/*vm.attributeTypesByValueTypes[40] = vm.attributeTypesByValueTypes[40].concat(vm.attributeTypes.filter(function (item) {
                return item.value_type === 40;
            }).map(function (item) {

                return {
                    name: item.name,
					id: 'attributes.' + item.id
                }

            }));*/
		vm.attributeTypesByValueTypes[40] =
			vm.attributeTypesByValueTypes[40].concat(getAttributesByValueType(40))
	}

	const getInstrumentPricingSchemes = instrumentPricingSchemeService
		.getList()
		.then((data) => {
			vm.instrumentPricingSchemes = data.results
		})

	const getAttributeTypes = attributeTypeService
		.getList(vm.entityType, { pageSize: 1000 })
		.then(function (data) {
			vm.attributeTypes = data.results
		})

	const entityUpdateId = vm.evEditorEventService.addEventListener(
		evEditorEvents.ENTITY_UPDATED,
		function () {
			vm.pricingPoliciesGridTableData = formatDataForPricingGridTable()
			vm.pricingPoliciesGridTableDataService.setTableData(
				vm.pricingPoliciesGridTableData
			)

			vm.pricingPoliciesGridTableEventService.dispatchEvent(
				gridTableEvents.REDRAW_TABLE
			)
		}
	)

	vm.init = function () {
		vm.pricingPoliciesGridTableDataService = new GridTableDataService()
		vm.pricingPoliciesGridTableEventService = new GridTableEventService()

		initGridTableEvents()

		Promise.all([getInstrumentPricingSchemes, getAttributeTypes]).then(
			function () {
				generateInstrumentAttributeTypesByValueTypes()
				vm.pricingPoliciesGridTableData = formatDataForPricingGridTable()

				vm.pricingPoliciesGridTableDataService.setTableData(
					vm.pricingPoliciesGridTableData
				)
				vm.readyStatus = true
			}
		)
	}

	vm.init()

	$scope.$on('$destroy', function () {
		vm.evEditorEventService.removeEventListener(
			evEditorEvents.ENTITY_UPDATED,
			entityUpdateId
		)
	})
}
