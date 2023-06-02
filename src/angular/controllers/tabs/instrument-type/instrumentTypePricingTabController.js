/**
 * Created by m.evstratov on 2022-02-09.
 */

'use strict'

import pricingPolicyService from '@/angular/services/pricingPolicyService'
import instrumentTypeService from '@/angular/services/instrumentTypeService'
import instrumentPricingSchemeService from '@/angular/services/pricing/instrumentPricingSchemeService'
import attributeTypeService from '@/angular/services/attributeTypeService'

import GridTableDataService from '@/angular/services/gridTableDataService'
import GridTableEventService from '@/angular/services/gridTableEventService'
import gridTableEvents from '@/angular/services/gridTableEvents'

import metaHelper from '@/angularlpers/meta.helper'

export default function InstrmentTypePricingTabController($scope, $mdDialog) {
	var vm = this

	// const gridTableHelperService = new GridTableHelperService();

	vm.readyStatus = false
	vm.instrumentPricingSchemes = null

	vm.entity = $scope.$parent.vm.entity
	vm.entityType = $scope.$parent.vm.entityType // 'instrument' or 'instrument-type'
	vm.currencies = $scope.$parent.vm.currencies
	vm.pricingConditions = $scope.$parent.vm.pricingConditions

	//region Inherit from a parent controller

	vm.attributeTypesByValueTypes = $scope.$parent.vm.attributeTypesByValueTypes // Parent controller can be entityViewerEditDialogController, entityViewerAddDialogController, instrumentTypeEditDialogController, instrumentTypeAddDialogController
	// Methods below are located one level above because of currency entity viewer
	vm.pricingSchemeChange = $scope.$parent.vm.pricingSchemeChange
	vm.switchPricingPolicyParameter =
		$scope.$parent.vm.switchPricingPolicyParameter

	vm.contextData = $scope.$parent.vm.contextData
	vm.entityAttrs = $scope.$parent.vm.entityAttrs

	vm.evEditorDataService = $scope.$parent.vm.evEditorDataService
	vm.evEditorEventService = $scope.$parent.vm.evEditorEventService
	vm.entityChange = $scope.$parent.vm.entityChange
	//endregion

	vm.editPricingScheme = function ($event, item) {
		$mdDialog.show({
			controller: 'InstrumentPricingSchemeEditDialogController as vm',
			templateUrl:
				'views/dialogs/pricing/instrument-pricing-scheme-edit-dialog-view.html',
			parent: angular.element(document.body),
			targetEvent: $event,
			clickOutsideToClose: false,
			preserveScope: true,
			autoWrap: true,
			skipHide: true,
			multiple: true,
			locals: {
				data: {
					item: item,
				},
			},
		})
	}

	vm.openPricingMultipleParametersDialog = function (pricingPolicy) {
		pricingPolicyService.openPricingMultipleParametersDialog(
			$mdDialog,
			pricingPolicy,
			vm.entityType,
			vm.instrAttributeTypes
		)
	}

	//region Pricing policies grid table

	/* const pricingDefaultValueFieldTypes = pricingPolicyService.pricingDefaultValueFieldTypes;

	var getPpTemplateRow = function () {

		let templateRow = pricingPolicyService.getPpGtTemplateRow(vm.entityType);

		let pricingPolicyCell = gridTableHelperService.getCellFromRowByKey(templateRow, 'pricing_policy');
		pricingPolicyCell.styles['grid-table-cell-elem'] = {'width': '10%'};

		let pricingScheme = gridTableHelperService.getCellFromRowByKey(templateRow, 'pricing_scheme');
		pricingScheme.styles['grid-table-cell-elem'] = {'width': '20%'};

		let pricingSchemeClarification = gridTableHelperService.getCellFromRowByKey(templateRow, 'pricing_scheme_clarification');
		pricingSchemeClarification.styles['grid-table-cell-elem'] = {'width': '40%'};

		let defaultParameters = gridTableHelperService.getCellFromRowByKey(templateRow, 'edit_default_parameters');
		defaultParameters.styles['grid-table-cell-elem'] = {'width': '20%'};

		let multipleParameters = gridTableHelperService.getCellFromRowByKey(templateRow, 'multiple_parameters');
		multipleParameters.styles['grid-table-cell-elem'] = {'width': '10%'};

		return templateRow;

	};

	vm.pricingPoliciesGridTableData = {
		header: {
			order: 'header',
			columns: []
		},
		body:[],
		templateRow: getPpTemplateRow(),

		tableMethods: {
			addRow: '' //onEventsTableAddRow
		},

		components: {
			topPanel: false,
			rowCheckboxes: false
		}

	};

	var getOptionsForPPDefaultValueSel = function (typesList, pricingPolicy) {

		if (pricingPolicy.pricing_scheme_object &&
			pricingPolicy.pricing_scheme_object.type_settings &&
			pricingPolicy.pricing_scheme_object.type_settings.value_type) {

			const selectorType = typesList.find(type => type.fieldType === 'dropdownSelect');
			selectorType.fieldData.menuOptions = vm.attributeTypesByValueTypes[pricingPolicy.pricing_scheme_object.type_settings.value_type] || [];

		}

		return typesList;

	};

	var getDefaultParametersVal = function (policy) {

		var value, valueType;

		if (policy.default_value) { // text input

			value = policy.default_value;
			valueType = 10;

		} else { // selector

			value = policy.attribute_key;
			valueType = 70

		}

		return [value, valueType];

	};

	var setUpDefaultParametersAsMultitypeCell = function (pricingPolicy, defaultParametersCell) {

		defaultParametersCell.cellType = 'multitypeField'; // needed when function called on pricing_scheme change

		let typesList = JSON.parse(JSON.stringify(pricingDefaultValueFieldTypes.fieldTypesList));

		const [defaultValue, fieldValueType] = getDefaultParametersVal(pricingPolicy);

		// if (fieldValueType === 70) typesList = getOptionsForPPDefaultValueSel(typesList, policy);
		typesList = getOptionsForPPDefaultValueSel(typesList, pricingPolicy);

		const fieldData = gridTableHelperService.getMultitypeFieldDataForCell(typesList, defaultParametersCell, defaultValue, fieldValueType);

		defaultParametersCell = fieldData.cell;

		return defaultParametersCell;

	};

	var setUpMultipleParametersAsButtonCell = function (pricingPolicy, multipleParametersCell) {

		multipleParametersCell.cellType = 'button';
		multipleParametersCell.settings = {
			buttonContent: '<span class="material-icons multiple-parameters-button">more_horiz</span>'
		};

		multipleParametersCell.methods = {
			onClick: () => openPricingMultipleParametersDialog(pricingPolicy)
		};

		multipleParametersCell.classes = ['gt-more-btn'];

		return multipleParametersCell;

	};

	var formatDataForPricingGridTable = function () {

		//region assemble header columns
		var rowObj = metaHelper.recursiveDeepCopy(vm.pricingPoliciesGridTableData.templateRow, true);

		vm.pricingPoliciesGridTableData.header.columns = rowObj.columns.map(function (column) {

			var headerData = {
				key: column.key,
				columnName: column.columnName,
				order: column.order,
				sorting: true,
				styles: {
					'grid-table-cell-elem': {'width': column.styles['grid-table-cell-elem'].width}
				},
				classes: column.classes
			};

			return headerData;

		});
		//endregion

		//region assemble body rows
		if (!Array.isArray(vm.entity.pricing_policies)) vm.entity.pricing_policies = [];

		vm.entity.pricing_policies.forEach(function (policy, policyIndex) {

			policy.order = policyIndex;

			rowObj = metaHelper.recursiveDeepCopy(vm.pricingPoliciesGridTableData.templateRow, true);
			rowObj.key = policy.id;
			rowObj.order = policy.order;

			const pricingPolicyCell = gridTableHelperService.getCellFromRowByKey(rowObj, 'pricing_policy');
			pricingPolicyCell.settings.value = policy.pricing_policy_object.name;

			const pricingScheme = gridTableHelperService.getCellFromRowByKey(rowObj, 'pricing_scheme');
			if (policy.pricing_scheme_object) {
				pricingScheme.settings.value = policy.pricing_scheme_object.id;
			}

			pricingScheme.settings.selectorOptions = vm.instrumentPricingSchemes;

			const pricingSchemeClarification = gridTableHelperService.getCellFromRowByKey(rowObj, 'pricing_scheme_clarification');
			if (policy.pricing_scheme_object) {
				pricingSchemeClarification.settings.value = policy.pricing_scheme_object.notes_for_users;
			}

			//region Default parameters column
			let defaultParameters = gridTableHelperService.getCellFromRowByKey(rowObj, 'edit_default_parameters');

			defaultParameters = setUpDefaultParametersAsMultitypeCell(policy, defaultParameters);

			gridTableHelperService.setCellInsideRow(rowObj, defaultParameters);
			//endregion Default parameters column

			//region Multiple parameters column
			if (policy.pricing_scheme_object && policy.pricing_scheme_object.type_object.input_type == 3) {

				let multipleParameters = gridTableHelperService.getCellFromRowByKey(rowObj, 'multiple_parameters');

				setUpMultipleParametersAsButtonCell(policy, multipleParameters);

			}
			//endregion Multiple parameters column

			vm.pricingPoliciesGridTableData.body.push(rowObj);

		});
		//endregion assemble body rows

	};

	var initGridTableEvents = function () {

		vm.pricingPoliciesGridTableEventService.addEventListener(gridTableEvents.CELL_VALUE_CHANGED, argObj => {

			const row = argObj.row;
			const column = argObj.column

			if (column.key === 'edit_default_parameters') { // for cell with multitypeField

				const cell = vm.pricingPoliciesGridTableDataService.getCell(row.order, column.order);
				const activeType = cell.settings.fieldTypesData.find(type => type.isActive);

				const matchingProp = activeType.value_type === 10 ? 'default_value' : 'attribute_key';
				const propToClear = activeType.value_type === 10 ? 'attribute_key' : 'default_value';

				vm.entity.pricing_policies[row.order][matchingProp] = cell.settings.value;
				vm.entity.pricing_policies[row.order][propToClear] = null;

			}
			else if (column.key === 'pricing_scheme') { // 'pricing_policy' cell

				const pricingSchemeCell = vm.pricingPoliciesGridTableDataService.getCellByKey(row.order, 'pricing_scheme');

				gridTableHelperService.onGridTableCellChange(vm.entity.pricing_policies, vm.pricingPoliciesGridTableDataService, row.order, column.order);

				vm.pricingSchemeChange(vm.entity.pricing_policies[row.order]);
				// reassigning variable changedPolicy after vm.entity.pricing_policies array recreation inside vm.pricingSchemeChange()
				const changedPolicy = vm.entity.pricing_policies[row.order];

				let pricingSchemeClarCell = vm.pricingPoliciesGridTableDataService.getCellByKey(row.order, 'pricing_scheme_clarification');
				pricingSchemeClarCell.settings.value = null;

				if (changedPolicy.pricing_scheme_object && changedPolicy.pricing_scheme_object.notes_for_users) {
					pricingSchemeClarCell.settings.value = changedPolicy.pricing_scheme_object.notes_for_users;
				}

				//region Default parameters column
				let defaultValueCell = vm.pricingPoliciesGridTableDataService.getCellByKey(row.order, 'edit_default_parameters');

				const selectedPricingScheme = vm.instrumentPricingSchemes.find(ipScheme => {
					return ipScheme.id === pricingSchemeCell.settings.value;
				});

				if (selectedPricingScheme.type === 1) {

					defaultValueCell.cellType = 'readonly_text';
					defaultValueCell.settings = {
						value: '-'
					};

				} else {
					defaultValueCell = setUpDefaultParametersAsMultitypeCell(changedPolicy, defaultValueCell);
				}
				//endregion Default parameters column

				//region Multiple parameters column
				let multipleParameters = vm.pricingPoliciesGridTableDataService.getCellByKey(row.order, 'multiple_parameters');
				if (changedPolicy.pricing_scheme_object && changedPolicy.pricing_scheme_object.type_object.input_type == 3) {

					multipleParameters = setUpMultipleParametersAsButtonCell(changedPolicy, multipleParameters);

				} else {

					multipleParameters.cellType = 'readonly_text';
					multipleParameters.settings.value = '-';
					delete multipleParameters.methods;

				}
				//endregion Multiple parameters column

			}

		});

	}; */
	//endregion Pricing policies grid table

	vm.applyPricingToAllInstruments = function ($event, item) {
		instrumentTypeService
			.updatePricing(vm.entity.id, item)
			.then(function (data) {
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
							description: 'New Pricing Settings were applied',
						},
					},
				})
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
			var attrsList = vm.instrAttributeTypes
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

	const getInstrAttributeTypes = attributeTypeService
		.getList('instrument', { pageSize: 1000 })
		.then(function (data) {
			vm.instrAttributeTypes = data.results
		})

	vm.init = function () {
		/* vm.pricingPoliciesGridTableDataService = new GridTableDataService();
		vm.pricingPoliciesGridTableEventService = new GridTableEventService();

		initGridTableEvents(); */

		Promise.all([getInstrumentPricingSchemes, getInstrAttributeTypes]).then(
			function () {
				generateInstrumentAttributeTypesByValueTypes()
				/* formatDataForPricingGridTable();

			vm.pricingPoliciesGridTableDataService.setTableData(vm.pricingPoliciesGridTableData); */
				vm.readyStatus = true
			}
		)
	}

	vm.init()
}
