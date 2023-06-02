/**
 * Created by szhitenev on 25.08.2016.
 */

import pricingPolicyRepository from '../repositories/pricingPolicyRepository'

var getList = function (options) {
	return pricingPolicyRepository.getList(options)
}

var getListLight = function (options) {
	return pricingPolicyRepository.getListLight(options)
}

var getByKey = function (id) {
	return pricingPolicyRepository.getByKey(id)
}

var create = function (policy) {
	return pricingPolicyRepository.create(policy)
}

var update = function (id, policy) {
	return pricingPolicyRepository.update(id, policy)
}

var deleteByKey = function (id) {
	return pricingPolicyRepository.deleteByKey(id)
}

var deleteBulk = function (data) {
	return pricingPolicyRepository.deleteBulk(data)
}

//region PRICING tab
var pricingDefaultValueFieldTypes = {
	fieldTypesList: [
		{
			model: '',
			fieldType: 'textInput',
			isDefault: true,
			isActive: false,
			sign: '<div class="multitype-field-type-letter type-with-constant">T</div>',
			value_type: 10,
			fieldData: {
				smallOptions: { dialogParent: '.dialog-containers-wrap' },
			},
		},
		{
			model: null,
			fieldType: 'dropdownSelect',
			isDefault: true,
			isActive: false,
			sign: '<div class="multitype-field-type-letter">L</div>',
			value_type: 70,
			fieldData: {
				menuOptions: [],
				smallOptions: { dialogParent: '.dialog-containers-wrap' },
				sorted: true,
			},
		},
	],
}

//region Pricing Policies table

var commonPPCols = [
	{
		key: 'pricing_policy',
		columnName: 'Pricing Policy',
		cellType: 'readonly_text',
		settings: {
			value: null,
		},
		styles: {},
		classes: 'pricing-policy',
	},
	{
		key: 'pricing_scheme',
		objPath: ['pricing_scheme'],
		columnName: 'Pricing Scheme',
		cellType: 'selector',
		settings: {
			value: null,
			selectorOptions: [],
		},
		styles: {},
		classes: 'pricing-scheme',
	},
	{
		key: 'pricing_scheme_clarification',
		objPath: ['pricing_scheme_object', 'notes_for_users'],
		columnName: 'Pricing Scheme Clarification',
		order: 2,
		cellType: 'readonly_text',
		settings: {
			value: null,
		},
		styles: {},
		classes: 'gt-cell-multi-lined-text gt-cell-plain-text',
	},
	{
		key: 'edit_default_parameters',
		objPath: ['default_value'],
		columnName: 'Edit Default Parameters',
		order: 3,
		cellType: 'multitypeField',
		settings: {
			value: null,
			fieldTypesData: [],
		},
		styles: {},
		classes: 'edit-default-parameters',
	},
	{
		key: 'multiple_parameters',
		columnName: 'Multiple Parameters',
		cellType: 'readonly_text',
		settings: {
			value: '-',
		},
		styles: {},
	},
]

//region Columns
var parameterClarificationCol = {
	key: 'parameter_clarification',
	objPath: ['pricing_scheme_object', 'notes_for_parameter'],
	columnName: 'Parameter Clarification',
	order: 4,
	cellType: 'readonly_text',
	settings: {
		value: null,
	},
	styles: {},
	classes: 'gt-cell-multi-lined-text gt-cell-plain-text',
}

var overridePricingSchemeDefaultParamsCol = {
	key: 'overwrite_default_parameters',
	objPath: ['overwrite_default_parameters'],
	columnName: 'Override Pricing Scheme Default Parameters',
	order: 5,
	cellType: 'checkbox',
	settings: {
		value: null,
	},
	styles: {},
	classes: 'gt-cell-multi-lined-text gt-cell-plain-text',
}

var editSchemeCol = {
	key: 'edit_scheme',
	columnName: 'Edit scheme',
	cellType: 'button',
	settings: {
		value: null,
	},
	styles: {},
	classes: 'gt-cell-multi-lined-text gt-cell-plain-text',
}

var notesCol = {
	key: 'notes',
	objPath: ['notes'],
	columnName: 'Notes',
	cellType: 'text',
	settings: {
		value: null,
	},
	styles: {},
	classes: 'gt-cell-multi-lined-text gt-cell-plain-text',
}

var applyPricingToAllInstrsCol = {
	key: 'apply_pricing_to_instruments',
	columnName: 'Apply for All Instruments of This Type',
	cellType: 'button',
	settings: {
		value: null,
	},
	styles: {},
	classes: 'gt-cell-multi-lined-text gt-cell-plain-text',
}
//endregion Columns

/**
 * Returns template row for grid table of pricing policies
 *
 * @param entityType {string}
 * @returns {{columns: Array<Object>, isActive: boolean}}
 */
var getPpGtTemplateRow = function (entityType) {
	var templateRowData = {
		isActive: false,
		columns: commonPPCols,
	}

	if (entityType === 'instrument-type') {
		templateRowData.columns.splice(4, 0, parameterClarificationCol)
		templateRowData.columns.splice(5, 0, overridePricingSchemeDefaultParamsCol)
		templateRowData.columns.splice(8, 0, editSchemeCol)
		templateRowData.columns.splice(9, 0, notesCol)
		templateRowData.columns.splice(11, 0, applyPricingToAllInstrsCol)
	}
	/* else if (entityType === 'currency') {

			// Insert columns for pricing policy table for currency

		} */

	templateRowData.columns = templateRowData.columns.map(function (col, index) {
		col.order = index
		return col
	})

	return templateRowData
}

var openPricingMultipleParametersDialog = function (
	$mdDialog,
	pricingPolicy,
	entityType,
	attributeTypes
) {
	$mdDialog
		.show({
			controller: 'PricingMultipleParametersDialogController as vm',
			templateUrl:
				'views/dialogs/pricing/pricing-multiple-parameter-dialog-view.html',
			parent: angular.element(document.body),
			// targetEvent: $event,
			clickOutsideToClose: false,
			preserveScope: true,
			autoWrap: true,
			skipHide: true,
			multiple: true,
			locals: {
				data: {
					item: pricingPolicy,
					entityType: entityType,
					attributeTypes: attributeTypes,
				},
			},
		})
		.then(function (res) {
			if (res.status === 'agree') {
				pricingPolicy.data = res.data.item.data
			}
		})
}
//endregion Pricing Policies table

//endregion PRICING tab

export default {
	getList: getList,
	getListLight: getListLight,
	getByKey: getByKey,
	create: create,
	update: update,
	deleteByKey: deleteByKey,

	deleteBulk: deleteBulk,

	pricingDefaultValueFieldTypes: pricingDefaultValueFieldTypes,
	getPpGtTemplateRow: getPpGtTemplateRow,
	openPricingMultipleParametersDialog: openPricingMultipleParametersDialog,
}
