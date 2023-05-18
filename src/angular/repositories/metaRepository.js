/**
 * Created by szhitenev on 04.05.2016.
 */

import evRequiredAttrs from '@/angular/vocabulary/requiredEntityViewerAttrs'

var getMenu = async function () {
	let res = await window.fetch('portal/content/json/menu.json')
	return await res.json()
}

var getBaseAttrs = function () {
	return [
		//{
		//    "key": "name",
		//    "name": "Name",
		//    "value_type": 10
		//},
		//{
		//    "key": "short_name",
		//    "name": "Short name",
		//    "value_type": 10
		//},
		//{
		//    "key": "notes",
		//    "name": "Notes",
		//    "value_type": 10
		//}
	]
}

// DEPRECATED start look at metaRestrictionRepository

var getEntitiesWithoutBaseAttrsList = function () {
	return [
		'price-history',
		'currency-history',
		'transaction',
		'complex-transaction',
		'transaction-report',
		'cash-flow-projection-report',
		'performance-report',
		'balance-report',
		'pl-report',
		'audit-transaction',
		'audit-instrument',
	]
}

// DEPRECATED end look at metaRestrictionRepository

var getEntitiesWithoutDynAttrsList = function () {
	return [
		'price-history',
		'currency-history',
		'transaction',
		'pricing-policy',
		'strategy-1-group',
		'strategy-2-group',
		'strategy-3-group',
		'strategy-1-subgroup',
		'strategy-2-subgroup',
		'strategy-3-subgroup',
		'audit-transaction',
		'audit-instrument',
		'generated-event',
	]
}

var getEntityAttrs = function (entity) {
	var entityAttrs = {
		portfolio: require('../models/portfolioPropsModel').getAttributes(),
		'portfolio-register':
			require('../models/portfolioRegisterPropsModel').getAttributes(),
		'portfolio-register-record':
			require('../models/portfolioRegisterRecordPropsModel').getAttributes(),
		'audit-transaction':
			require('../models/auditTransactionPropsModel').getAttributes(),
		'audit-instrument':
			require('../models/auditInstrumentPropsModel').getAttributes(),
		account: require('../models/accountPropsModel').getAttributes(),
		tag: require('../models/tagPropsModel').getAttributes(),
		'account-type': require('../models/accountTypePropsModel').getAttributes(),
		counterparty: require('../models/counterpartyPropsModel').getAttributes(),
		'counterparty-group':
			require('../models/counterpartyGroupPropsModel').getAttributes(),
		responsible: require('../models/responsiblePropsModel').getAttributes(),
		'responsible-group':
			require('../models/responsibleGroupPropsModel').getAttributes(),
		'pricing-policy':
			require('../models/pricingPolicyPropsModel').getAttributes(),
		'instrument-type':
			require('../models/instrumentTypePropsModel').getAttributes(),
		instrument: require('../models/instrumentPropsModel').getAttributes(),
		'generated-event':
			require('../models/generatedEventPropsModel').getAttributes(),
		transaction: require('../models/transactionPropsModel').getAttributes(),
		'transaction-type-group':
			require('../models/transactionTypeGroupPropsModel').getAttributes(),
		'transaction-type':
			require('../models/transactionTypePropsModel').getAttributes(),
		currency: require('../models/currencyPropsModel').getAttributes(),
		'currency-history':
			require('../models/currencyHistoryPropsModel').getAttributes(),
		'price-history':
			require('../models/priceHistoryPropsModel').getAttributes(),
		'strategy-1': require('../models/strategy1PropsModel').getAttributes(),
		'strategy-2': require('../models/strategy2PropsModel').getAttributes(),
		'strategy-3': require('../models/strategy3PropsModel').getAttributes(),
		'strategy-1-subgroup':
			require('../models/strategy1subgroupPropsModel').getAttributes(),
		'strategy-2-subgroup':
			require('../models/strategy2subgroupPropsModel').getAttributes(),
		'strategy-3-subgroup':
			require('../models/strategy3subgroupPropsModel').getAttributes(),
		'strategy-1-group':
			require('../models/strategy1groupPropsModel').getAttributes(),
		'strategy-2-group':
			require('../models/strategy2groupPropsModel').getAttributes(),
		'strategy-3-group':
			require('../models/strategy3groupPropsModel').getAttributes(),
		'balance-report':
			require('../models/balanceReportPropsModel').getAttributes(),
		'report-addon-performance':
			require('../models/reportAddonPerformancePropsModel').getAttributes(),
		'report-addon-performance-pnl':
			require('../models/reportAddonPerformancePnlPropsModel').getAttributes(),
		'report-mismatch':
			require('../models/reportMismatchPropsModel').getAttributes(),
		'pl-report': require('../models/pnlReportPropsModel').getAttributes(),
		'transaction-report':
			require('../models/transactionReportPropsModel').getAttributes(),
		'cash-flow-projection-report':
			require('../models/cashFlowProjectionReportPropsModel').getAttributes(),
		'performance-report':
			require('../models/performanceReportPropsModel').getAttributes(),
		'complex-transaction':
			require('../models/complexTransactionPropsModel').getAttributes(),
		'instrument-scheme':
			require('../models/instrumentSchemePropsModel').getAttributes(),
	}

	return entityAttrs[entity]
}

var getRequiredEntityAttrs = function (entityType) {
	switch (entityType) {
		case 'portfolio':
		case 'account':
		case 'currency':
		case 'account-type':
		case 'pricing-policy':
			return evRequiredAttrs.requiredAttrs

		case 'counterparty':
		case 'responsible':
			return evRequiredAttrs.requiredAttrs2

		case 'strategy-1':
		case 'strategy-2':
		case 'strategy-3':
			return evRequiredAttrs.strategiesAttrs

		case 'instrument':
			return evRequiredAttrs.instrumentAttrs

		case 'instrument-type':
			return evRequiredAttrs.instrumentTypeAttrs

		case 'price-history':
			return evRequiredAttrs.pricesAttrs

		case 'currency-history':
			return evRequiredAttrs.currenciesAttrs

		default:
			return []
	}
}

var getEntityViewerFormComponentsValueTypes = function () {
	return [
		{
			value: 20,
			display_name: 'Number',
		},
		{
			value: 10,
			display_name: 'String',
		},
		{
			value: 40,
			display_name: 'Date',
		},
		{
			value: 30,
			display_name: 'Classifier',
		},
		{
			value: 110,
			display_name: 'Selector',
		},
		{
			value: 80,
			display_name: 'Datetime',
		},
		{
			value: 120,
			display_name: 'Button',
		},
		{
			value: 'decoration',
			display_name: 'Decoration',
		},
		{
			value: 'field',
			display_name: 'Field',
		},
		{
			value: 'mc_field',
			display_name: 'Multiple choice field',
		},
		{
			value: 50,
			display_name: 'Boolean',
		},
		{
			value: 'float',
			display_name: 'Float',
		},
		{
			value: 'table',
			display_name: 'Table',
		},
	]
}

var getDynamicAttrsValueTypes = function () {
	return [
		{
			value: 20,
			display_name: 'Number',
		},
		{
			value: 10,
			display_name: 'String',
		},
		{
			value: 40,
			display_name: 'Date',
		},
		{
			value: 30,
			display_name: 'Classifier',
		},
	]
}

var getRestrictedEntitiesWithTypeField = function () {
	return [
		'daily_pricing_model',
		'payment_size_detail',
		'accrued_currency',
		'pricing_currency',
	]
}

var getEntityTabs = function (entityType) {
	switch (entityType) {
		case 'portfolio':
			return [
				{
					label: 'Performance',
					type: 'system_tab',
					templateUrl: 'views/tabs/portfolio/performance-tab-view.html',
				},
			]
		case 'currency':
			return [
				{
					label: 'Pricing',
					type: 'system_tab',
					templateUrl: 'views/tabs/currency/pricing-view.html',
				},
				// {
				//     label: 'Pricing (Old)',
				//     templateUrl: 'views/tabs/currency/pricing-view-old.html'
				// }
			]
		case 'instrument':
			return [
				{
					label: 'Accruals',
					type: 'system_tab',
					templateUrl:
						'views/tabs/instrument/accrual-calculation-schedules-view.html',
				},
				{
					label: 'Events',
					type: 'system_tab',
					templateUrl: 'views/tabs/instrument/events-schedules-tab-view.html',
				},
				{
					label: 'Exposure',
					type: 'system_tab',
					templateUrl: 'views/tabs/instrument/exposure-view.html',
				},
				// {
				//     label: 'Pricing (old)',
				//     templateUrl: 'views/tabs/instrument/manual-pricing-formulas-view.html'
				// },
				{
					label: 'Factors',
					type: 'system_tab',
					templateUrl: 'views/tabs/instrument/factor-schedule-view.html',
				},
				{
					label: 'Pricing',
					type: 'system_tab',
					templateUrl: 'views/tabs/instrument/pricing-view.html',
				},
			]
		case 'instrument-type':
			return [
				{
					label: 'Pricing',
					type: 'system_tab',
					templateUrl: 'views/tabs/instrument-type/pricing-view.html',
				},
				{
					label: 'Accruals',
					type: 'system_tab',
					templateUrl: 'views/tabs/instrument-type/accruals-view.html',
				},
				{
					label: 'Events',
					type: 'system_tab',
					templateUrl: 'views/tabs/instrument-type/events-view.html',
				},
				{
					label: 'Factors',
					type: 'system_tab',
					templateUrl: 'views/tabs/instrument-type/factors-view.html',
				},
				{
					label: 'Exposure',
					type: 'system_tab',
					templateUrl: 'views/tabs/instrument-type/exposure-view.html',
				},
				{
					label: 'User attributes',
					type: 'system_tab',
					templateUrl: 'views/tabs/instrument-type/user-attributes-view.html',
				},
				{
					label: 'Layout Settings',
					type: 'system_tab',
					templateUrl: 'views/tabs/instrument-type/layout-settings-view.html',
				},
			]
		case 'transaction-type':
			return [
				{
					label: 'General',
					type: 'system_tab',
					templateUrl:
						'views/tabs/transaction-type/transaction-type-general-tab-view.html',
				},
				{
					label: 'Inputs',
					type: 'system_tab',
					templateUrl:
						'views/tabs/transaction-type/transaction-type-inputs-tab-view.html',
				},
				{
					label: 'Actions',
					type: 'system_tab',
					templateUrl:
						'views/tabs/transaction-type/transaction-type-actions-tab-view.html',
				},
			]
		case 'complex-transaction':
			return [
				{
					label: 'Fields',
					type: 'system_tab',
					templateUrl:
						'views/tabs/complex-transaction/complex-transaction-fields-tab.html',
				},
				{
					label: 'Inputs',
					type: 'system_tab',
					templateUrl:
						'views/tabs/complex-transaction/complex-transaction-inputs-tab.html',
				},
				{
					label: 'Base Transactions',
					type: 'system_tab',
					templateUrl:
						'views/tabs/complex-transaction/complex-transaction-base-transactions-tab.html',
				},
				{
					label: 'Reconciliation',
					type: 'system_tab',
					templateUrl:
						'views/tabs/complex-transaction/complex-transaction-reconciliation-tab.html',
				},
				{
					label: 'Execution Log',
					type: 'system_tab',
					templateUrl:
						'views/tabs/complex-transaction/complex-transaction-execution-log-tab.html',
				},
				{
					label: 'Source',
					type: 'system_tab',
					templateUrl:
						'views/tabs/complex-transaction/complex-transaction-source-tab.html',
				},
			]
		default:
			return []
	}
}

var getEntitiesWithSimpleFields = function () {
	// e.g. both of responsible-group, counterparty group
	// have save property group, so its hard to resolve proper service
	return [
		'responsible',
		'counterparty',
		'strategy-1',
		'strategy-2',
		'strategy-3',
		'transaction-type',
		'transaction-type-group',
		'strategy-1-group',
		'strategy-2-group',
		'strategy-3-group',
		'strategy-1-subgroup',
		'strategy-2-subgroup',
		'strategy-3-subgroup',
	]
}

var getFieldsWithTagGrouping = function () {
	return [
		'instrument_type',
		'type',
		'transaction_type',
		'instrument_types',
		'transaction_types',
		'account_types',
	]
}

var getContentGroups = function (typeOfGrouping) {
	var path = ''

	switch (typeOfGrouping) {
		case 'entityLayoutsGroups':
			path = 'portal/content/json/groups/bookmarks_groups_list.json'
			break
		case 'exportImportConfigGroups':
			path =
				'portal/content/json/groups/configuration_export_import_files_groups_list.json'
			break
	}

	return window.fetch(path).then(function (data) {
		return data.json()
	})
}

export default {
	getMenu: getMenu,
	getBaseAttrs: getBaseAttrs,
	getEntityAttrs: getEntityAttrs,
	getRequiredEntityAttrs: getRequiredEntityAttrs,
	getEntityViewerFormComponentsValueTypes:
		getEntityViewerFormComponentsValueTypes,
	getDynamicAttrsValueTypes: getDynamicAttrsValueTypes,
	getEntitiesWithoutDynAttrsList: getEntitiesWithoutDynAttrsList,
	getEntityTabs: getEntityTabs,
	getEntitiesWithoutBaseAttrsList: getEntitiesWithoutBaseAttrsList,
	getRestrictedEntitiesWithTypeField: getRestrictedEntitiesWithTypeField,
	getEntitiesWithSimpleFields: getEntitiesWithSimpleFields,
	getFieldsWithTagGrouping: getFieldsWithTagGrouping,
	getContentGroups: getContentGroups,
}
