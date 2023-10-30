/**
 * Created by szhitenev on 04.05.2016.
 */

import evRequiredAttrs from '@/angular/vocabulary/requiredEntityViewerAttrs'

import auditTransactionPropsModel from '../models/auditTransactionPropsModel'
import auditInstrumentPropsModel from '../models/auditInstrumentPropsModel'
import accountPropsModel from '../models/accountPropsModel'
import tagPropsModel from '../models/tagPropsModel'
import accountTypePropsModel from '../models/accountTypePropsModel'
import counterpartyPropsModel from '../models/counterpartyPropsModel'
import counterpartyGroupPropsModel from '../models/counterpartyGroupPropsModel'
import responsiblePropsModel from '../models/responsiblePropsModel'
import responsibleGroupPropsModel from '../models/responsibleGroupPropsModel'
import pricingPolicyPropsModel from '../models/pricingPolicyPropsModel'
import instrumentTypePropsModel from '../models/instrumentTypePropsModel'
import instrumentPropsModel from '../models/instrumentPropsModel'
import generatedEventPropsModel from '../models/generatedEventPropsModel'
import transactionPropsModel from '../models/transactionPropsModel'
import transactionTypeGroupPropsModel from '../models/transactionTypeGroupPropsModel'
import transactionTypePropsModel from '../models/transactionTypePropsModel'
import currencyPropsModel from '../models/currencyPropsModel'
import currencyHistoryPropsModel from '../models/currencyHistoryPropsModel'
import priceHistoryPropsModel from '../models/priceHistoryPropsModel'
import strategy1PropsModel from '../models/strategy1PropsModel'
import strategy2PropsModel from '../models/strategy2PropsModel'
import strategy3PropsModel from '../models/strategy3PropsModel'

import strategy1subgroupPropsModel from '../models/strategy1subgroupPropsModel'
import strategy2subgroupPropsModel from '../models/strategy2subgroupPropsModel'
import strategy3subgroupPropsModel from '../models/strategy3subgroupPropsModel'

import strategy1groupPropsModel from '../models/strategy1groupPropsModel'
import strategy2groupPropsModel from '../models/strategy2groupPropsModel'
import strategy3groupPropsModel from '../models/strategy3groupPropsModel'

import complexTransactionPropsModel from '../models/complexTransactionPropsModel'
import instrumentSchemePropsModel from '../models/instrumentSchemePropsModel'
import balanceReportPropsModel from '../models/balanceReportPropsModel'
import reportAddonPerformancePropsModel from '../models/reportAddonPerformancePropsModel'
import reportMismatchPropsModel from '../models/reportMismatchPropsModel'
import pnlReportPropsModel from '../models/pnlReportPropsModel'
import reportAddonPerformancePnlPropsModel from '../models/reportAddonPerformancePnlPropsModel'
import reportMismatchPnlPropsModel from '../models/reportMismatchPnlPropsModel'
import transactionReportPropsModel from '../models/transactionReportPropsModel'
import cashFlowProjectionReportPropsModel from '../models/cashFlowProjectionReportPropsModel'
import performanceReportPropsModel from '../models/performanceReportPropsModel'
import portfolioPropsModel from '../models/portfolioPropsModel'

import countryPropsModel from '../models/countryPropsModel'
import transactionClassPropsModel from '../models/transactionClassPropsModel'

import currencyHistoryErrorPropsModel from '../models/currencyHistoryErrorPropsModel'
import priceHistoryErrorPropsModel from '../models/priceHistoryErrorPropsModel'
import complextransactionStatusPropsModel from '../models/complextransactionStatusPropsModel'
import portfolioRegisterRecordPropsModel from '../models/portfolioRegisterRecordPropsModel'
import portfolioRegisterPropsModel from '../models/portfolioRegisterPropsModel'

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
		portfolio: portfolioPropsModel.getAttributes(),
		'portfolio-register': portfolioRegisterPropsModel.getAttributes(),
		'portfolio-register-record':
			portfolioRegisterRecordPropsModel.getAttributes(),
		'audit-transaction': auditTransactionPropsModel.getAttributes(),
		'audit-instrument': auditInstrumentPropsModel.getAttributes(),
		account: accountPropsModel.getAttributes(),
		tag: tagPropsModel.getAttributes(),
		'account-type': accountTypePropsModel.getAttributes(),
		counterparty: counterpartyPropsModel.getAttributes(),
		'counterparty-group': counterpartyGroupPropsModel.getAttributes(),
		responsible: responsiblePropsModel.getAttributes(),
		'responsible-group': responsibleGroupPropsModel.getAttributes(),
		'pricing-policy': pricingPolicyPropsModel.getAttributes(),
		'instrument-type': instrumentTypePropsModel.getAttributes(),
		instrument: instrumentPropsModel.getAttributes(),
		'generated-event': generatedEventPropsModel.getAttributes(),

		transaction: transactionPropsModel.getAttributes(),
		'transaction-type-group': transactionTypeGroupPropsModel.getAttributes(),
		'transaction-type': transactionTypePropsModel.getAttributes(),
		currency: currencyPropsModel.getAttributes(),
		'currency-history': currencyHistoryPropsModel.getAttributes(),
		'price-history': priceHistoryPropsModel.getAttributes(),
		'strategy-1': strategy1PropsModel.getAttributes(),
		'strategy-2': strategy2PropsModel.getAttributes(),
		'strategy-3': strategy3PropsModel.getAttributes(),
		'strategy-1-subgroup': strategy1subgroupPropsModel.getAttributes(),
		'strategy-2-subgroup': strategy2subgroupPropsModel.getAttributes(),
		'strategy-3-subgroup': strategy3subgroupPropsModel.getAttributes(),
		'strategy-1-group': strategy1groupPropsModel.getAttributes(),
		'strategy-2-group': strategy2groupPropsModel.getAttributes(),
		'strategy-3-group': strategy3groupPropsModel.getAttributes(),
		'complex-transaction': complexTransactionPropsModel.getAttributes(),
		'instrument-scheme': instrumentSchemePropsModel.getAttributes(),
		'balance-report': balanceReportPropsModel.getAttributes(),

		'pl-report': pnlReportPropsModel.getAttributes(),

		'transaction-report': transactionReportPropsModel.getAttributes(),
		'cash-flow-projection-report':
			cashFlowProjectionReportPropsModel.getAttributes(),
		'performance-report': performanceReportPropsModel.getAttributes(),

		'transaction-class': transactionClassPropsModel.getAttributes(),
		'report-addon-performance-pnl':
			reportAddonPerformancePnlPropsModel.getAttributes(),
		'report-addon-performance':
			reportAddonPerformancePropsModel.getAttributes(),
		'report-mismatch': reportMismatchPropsModel.getAttributes(),
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
