/**
 * Attribute Data Service.
 * @module attributeDataService
 */

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

export default function (
	metaContentTypesService,
	customFieldService,
	attributeTypeService,
	uiService
) {
	var reportsEntityTypes = ['balance-report', 'pl-report', 'transaction-report']

	var entityAttributesData = {
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
		'balance-report-performance':
			reportAddonPerformancePropsModel.getAttributes(),
		'balance-report-mismatch': reportMismatchPropsModel.getAttributes(),
		'pl-report': pnlReportPropsModel.getAttributes(),
		'pl-report-performance':
			reportAddonPerformancePnlPropsModel.getAttributes(),
		'pl-report-mismatch': reportMismatchPnlPropsModel.getAttributes(),
		'transaction-report': transactionReportPropsModel.getAttributes(),
		'cash-flow-projection-report':
			cashFlowProjectionReportPropsModel.getAttributes(),
		'performance-report': performanceReportPropsModel.getAttributes(),
		'currency-history-error': currencyHistoryErrorPropsModel.getAttributes(),
		'price-history-error': priceHistoryErrorPropsModel.getAttributes(),

		'transaction-class': transactionClassPropsModel.getAttributes(),
		'complex-transaction-status':
			complextransactionStatusPropsModel.getAttributes(),
		country: countryPropsModel.getAttributes(),
	}

	var customFieldsData = {}

	var dynamicAttributesData = {}

	var instrumentUserFieldsData = []
	var transactionUserFieldsData = []

	var reconciliationAttributes = []

	var attributesAvailableForColumns = []

	function _getBalanceReportAttributes() {
		var result = []

		var balanceAttrs = getAllAttributesAsFlatList(
			'reports.balancereport',
			'',
			'Balance',
			{ maxDepth: 1 }
		)

		var balanceMismatchAttrs = getAllAttributesAsFlatList(
			'reports.balancereportmismatch',
			'',
			'Mismatch',
			{ maxDepth: 1 }
		)

		var balancePerformanceAttrs = getAllAttributesAsFlatList(
			'reports.balancereportperformance',
			'',
			'Performance',
			{ maxDepth: 1 }
		)

		var allocationAttrs = getAllAttributesAsFlatList(
			'instruments.instrument',
			'allocation',
			'Allocation',
			{ maxDepth: 1 }
		)

		var instrumentAttrs = getAllAttributesAsFlatList(
			'instruments.instrument',
			'instrument',
			'Instrument',
			{ maxDepth: 1 }
		)

		var linkedInstrumentAttrs = getAllAttributesAsFlatList(
			'instruments.instrument',
			'linked_instrument',
			'Linked Instrument',
			{ maxDepth: 1 }
		)

		var currencyAttrs = getAllAttributesAsFlatList(
			'currencies.currency',
			'currency',
			'Currency',
			{ maxDepth: 1 }
		)

		var accountAttrs = getAllAttributesAsFlatList(
			'accounts.account',
			'account',
			'Account',
			{ maxDepth: 1 }
		)

		var portfolioAttrs = getAllAttributesAsFlatList(
			'portfolios.portfolio',
			'portfolio',
			'Portfolio',
			{ maxDepth: 1 }
		)

		var strategy1attrs = getAllAttributesAsFlatList(
			'strategies.strategy1',
			'strategy1',
			'Strategy 1',
			{ maxDepth: 1 }
		)

		var strategy2attrs = getAllAttributesAsFlatList(
			'strategies.strategy2',
			'strategy2',
			'Strategy 2',
			{ maxDepth: 1 }
		)

		var strategy3attrs = getAllAttributesAsFlatList(
			'strategies.strategy3',
			'strategy3',
			'Strategy 3',
			{ maxDepth: 1 }
		)

		var custom = getCustomFieldsByEntityType('balance-report').map(function (
			customItem
		) {
			customItem.custom_field = Object.assign({}, customItem)

			customItem.key = 'custom_fields.' + customItem.user_code
			customItem.name = 'Custom Field. ' + customItem.name

			return customItem
		})

		var portfolioDynamicAttrs = getDynamicAttributesByEntityType('portfolio')
		var accountDynamicAttrs = getDynamicAttributesByEntityType('account')
		var instrumentDynamicAttrs = getDynamicAttributesByEntityType('instrument')
		var allocationDynamicAttrs = getDynamicAttributesByEntityType('instrument')
		var linkedInstrumentDynamicAttrs =
			getDynamicAttributesByEntityType('instrument')

		var portfolioDynamicAttrsFormatted = formatAttributeTypes(
			portfolioDynamicAttrs,
			'portfolios.portfolio',
			'portfolio',
			'Portfolio'
		)
		var accountDynamicAttrsFormatted = formatAttributeTypes(
			accountDynamicAttrs,
			'accounts.account',
			'account',
			'Account'
		)
		var currencyDynamicAttrsFormatted = formatAttributeTypes(
			accountDynamicAttrs,
			'currencies.currency',
			'currency',
			'Currency'
		)
		var instrumentDynamicAttrsFormatted = formatAttributeTypes(
			instrumentDynamicAttrs,
			'instruments.instrument',
			'instrument',
			'Instrument'
		)
		var allocationDynamicAttrsFormatted = formatAttributeTypes(
			allocationDynamicAttrs,
			'instruments.instrument',
			'allocation',
			'Allocation'
		)
		var linkedInstrumentDynamicAttrsFormatted = formatAttributeTypes(
			linkedInstrumentDynamicAttrs,
			'instruments.instrument',
			'linked_instrument',
			'Linked Instrument'
		)

		// remove attributes that area already inside currency from balance
		balanceAttrs = balanceAttrs.filter(function (bAttr) {
			return !!!currencyAttrs.find(function (cAttr) {
				return cAttr.key === bAttr.key
			})
		})

		result = result.concat(balanceAttrs)
		result = result.concat(balanceMismatchAttrs)
		result = result.concat(balancePerformanceAttrs)
		result = result.concat(allocationAttrs)
		result = result.concat(instrumentAttrs)
		result = result.concat(linkedInstrumentAttrs)
		result = result.concat(currencyAttrs)
		result = result.concat(accountAttrs)
		result = result.concat(portfolioAttrs)
		result = result.concat(strategy1attrs)
		result = result.concat(strategy2attrs)
		result = result.concat(strategy3attrs)

		result = result.concat(custom)

		result = result.concat(portfolioDynamicAttrsFormatted)
		result = result.concat(accountDynamicAttrsFormatted)
		result = result.concat(currencyDynamicAttrsFormatted)
		result = result.concat(instrumentDynamicAttrsFormatted)
		result = result.concat(allocationDynamicAttrsFormatted)
		result = result.concat(linkedInstrumentDynamicAttrsFormatted)

		return result
	}

	function _getPlReportAttributes() {
		var result = []

		var balanceAttrs = getAllAttributesAsFlatList(
			'reports.plreport',
			'',
			'Balance',
			{ maxDepth: 1 }
		)

		var balanceMismatchAttrs = getAllAttributesAsFlatList(
			'reports.plreportmismatch',
			'',
			'Mismatch',
			{ maxDepth: 1 }
		)

		var balancePerformanceAttrs = getAllAttributesAsFlatList(
			'reports.plreportperformance',
			'',
			'Performance',
			{ maxDepth: 1 }
		)

		var allocationAttrs = getAllAttributesAsFlatList(
			'instruments.instrument',
			'allocation',
			'Allocation',
			{ maxDepth: 1 }
		)

		var instrumentAttrs = getAllAttributesAsFlatList(
			'instruments.instrument',
			'instrument',
			'Instrument',
			{ maxDepth: 1 }
		)

		var linkedInstrumentAttrs = getAllAttributesAsFlatList(
			'instruments.instrument',
			'linked_instrument',
			'Linked Instrument',
			{ maxDepth: 1 }
		)

		var accountAttrs = getAllAttributesAsFlatList(
			'accounts.account',
			'account',
			'Account',
			{ maxDepth: 1 }
		)

		var portfolioAttrs = getAllAttributesAsFlatList(
			'portfolios.portfolio',
			'portfolio',
			'Portfolio',
			{ maxDepth: 1 }
		)

		var strategy1attrs = getAllAttributesAsFlatList(
			'strategies.strategy1',
			'strategy1',
			'Strategy 1',
			{ maxDepth: 1 }
		)

		var strategy2attrs = getAllAttributesAsFlatList(
			'strategies.strategy2',
			'strategy2',
			'Strategy 2',
			{ maxDepth: 1 }
		)

		var strategy3attrs = getAllAttributesAsFlatList(
			'strategies.strategy3',
			'strategy3',
			'Strategy 3',
			{ maxDepth: 1 }
		)

		var custom = getCustomFieldsByEntityType('pl-report').map(function (
			customItem
		) {
			customItem.custom_field = Object.assign({}, customItem)

			customItem.key = 'custom_fields.' + customItem.user_code
			customItem.name = 'Custom Field. ' + customItem.name

			return customItem
		})

		var portfolioDynamicAttrs = getDynamicAttributesByEntityType('portfolio')
		var accountDynamicAttrs = getDynamicAttributesByEntityType('account')
		var instrumentDynamicAttrs = getDynamicAttributesByEntityType('instrument')
		var allocationDynamicAttrs = getDynamicAttributesByEntityType('instrument')
		var linkedInstrumentDynamicAttrs =
			getDynamicAttributesByEntityType('instrument')

		var portfolioDynamicAttrsFormatted = formatAttributeTypes(
			portfolioDynamicAttrs,
			'portfolios.portfolio',
			'portfolio',
			'Portfolio'
		)
		var accountDynamicAttrsFormatted = formatAttributeTypes(
			accountDynamicAttrs,
			'accounts.account',
			'account',
			'Account'
		)
		var instrumentDynamicAttrsFormatted = formatAttributeTypes(
			instrumentDynamicAttrs,
			'instruments.instrument',
			'instrument',
			'Instrument'
		)
		var allocationDynamicAttrsFormatted = formatAttributeTypes(
			allocationDynamicAttrs,
			'instruments.instrument',
			'allocation',
			'Allocation'
		)
		var linkedInstrumentDynamicAttrsFormatted = formatAttributeTypes(
			linkedInstrumentDynamicAttrs,
			'instruments.instrument',
			'linked_instrument',
			'Linked Instrument'
		)

		result = result.concat(balanceAttrs)
		result = result.concat(balanceMismatchAttrs)
		result = result.concat(balancePerformanceAttrs)
		result = result.concat(allocationAttrs)
		result = result.concat(instrumentAttrs)
		result = result.concat(linkedInstrumentAttrs)
		result = result.concat(accountAttrs)
		result = result.concat(portfolioAttrs)
		result = result.concat(strategy1attrs)
		result = result.concat(strategy2attrs)
		result = result.concat(strategy3attrs)

		result = result.concat(custom)

		result = result.concat(portfolioDynamicAttrsFormatted)
		result = result.concat(accountDynamicAttrsFormatted)
		result = result.concat(instrumentDynamicAttrsFormatted)
		result = result.concat(allocationDynamicAttrsFormatted)
		result = result.concat(linkedInstrumentDynamicAttrsFormatted)

		return result
	}

	function _getTransactionReportAttributes() {
		var result = []

		var transactionAttrs = getAllAttributesAsFlatList(
			'reports.transactionreport',
			'',
			'Transaction',
			{ maxDepth: 1 }
		)

		var complexTransactionAttrs = getAllAttributesAsFlatList(
			'transactions.complextransaction',
			'complex_transaction',
			'Complex Transaction',
			{ maxDepth: 1 }
		)

		var portfolioAttrs = getAllAttributesAsFlatList(
			'portfolios.portfolio',
			'portfolio',
			'Portfolio',
			{ maxDepth: 1 }
		)

		var instrumentAttrs = getAllAttributesAsFlatList(
			'instruments.instrument',
			'instrument',
			'Instrument',
			{ maxDepth: 1 }
		)

		var responsibleAttrs = getAllAttributesAsFlatList(
			'counterparties.responsible',
			'responsible',
			'Responsible',
			{ maxDepth: 1 }
		)

		var counterpartyAttrs = getAllAttributesAsFlatList(
			'counterparties.counterparty',
			'counterparty',
			'Counterparty',
			{ maxDepth: 1 }
		)

		// instruments

		var linkedInstrumentAttrs = getAllAttributesAsFlatList(
			'instruments.instrument',
			'linked_instrument',
			'Linked Instrument',
			{ maxDepth: 1 }
		)

		var allocationBalanceAttrs = getAllAttributesAsFlatList(
			'instruments.instrument',
			'allocation_balance',
			'Allocation Balance',
			{ maxDepth: 1 }
		)

		var allocationPlAttrs = getAllAttributesAsFlatList(
			'instruments.instrument',
			'allocation_pl',
			'Allocation P&L',
			{ maxDepth: 1 }
		)

		// currencies

		var transactionCurrencyAttrs = getAllAttributesAsFlatList(
			'currencies.currency',
			'transaction_currency',
			'Transaction currency',
			{ maxDepth: 1 }
		)

		var settlementCurrencyAttrs = getAllAttributesAsFlatList(
			'currencies.currency',
			'settlement_currency',
			'Settlement currency',
			{ maxDepth: 1 }
		)

		// accounts

		var accountPositionAttrs = getAllAttributesAsFlatList(
			'accounts.account',
			'account_position',
			'Account Position',
			{ maxDepth: 1 }
		)

		var accountCashAttrs = getAllAttributesAsFlatList(
			'accounts.account',
			'account_cash',
			'Account Cash',
			{ maxDepth: 1 }
		)

		var accountInterimAttrs = getAllAttributesAsFlatList(
			'accounts.account',
			'account_interim',
			'Account Interim',
			{ maxDepth: 1 }
		)

		// strategies

		var strategy1cashAttrs = getAllAttributesAsFlatList(
			'strategies.strategy1',
			'strategy1_cash',
			'Strategy 1 Cash',
			{ maxDepth: 1 }
		)

		var strategy1positionAttrs = getAllAttributesAsFlatList(
			'strategies.strategy1',
			'strategy1_position',
			'Strategy 1 Position',
			{ maxDepth: 1 }
		)

		var strategy2cashAttrs = getAllAttributesAsFlatList(
			'strategies.strategy2',
			'strategy2_cash',
			'Strategy 2 Cash',
			{ maxDepth: 1 }
		)

		var strategy2positionAttrs = getAllAttributesAsFlatList(
			'strategies.strategy2',
			'strategy2_position',
			'Strategy 2 Position',
			{ maxDepth: 1 }
		)

		var strategy3cashAttrs = getAllAttributesAsFlatList(
			'strategies.strategy3',
			'strategy3_cash',
			'Strategy 3 Cash',
			{ maxDepth: 1 }
		)

		var strategy3positionAttrs = getAllAttributesAsFlatList(
			'strategies.strategy3',
			'strategy3_position',
			'Strategy 3 Position',
			{ maxDepth: 1 }
		)

		var custom = getCustomFieldsByEntityType('transaction-report').map(
			function (customItem) {
				customItem.custom_field = Object.assign({}, customItem)

				customItem.key = 'custom_fields.' + customItem.user_code
				customItem.name = 'Custom Field. ' + customItem.name

				return customItem
			}
		)

		var portfolioDynamicAttrs = getDynamicAttributesByEntityType('portfolio')
		var complexTransactionDynamicAttrs = getDynamicAttributesByEntityType(
			'complex-transaction'
		)
		var transactionTypeDynamicAttrs =
			getDynamicAttributesByEntityType('transaction-type')
		var responsibleDynamicAttrs =
			getDynamicAttributesByEntityType('responsible')
		var counterpartyDynamicAttrs =
			getDynamicAttributesByEntityType('counterparty')

		var instrumentDynamicAttrs = getDynamicAttributesByEntityType('instrument')
		var linkedInstrumentDynamicAttrs =
			getDynamicAttributesByEntityType('instrument')
		var allocationBalanceDynamicAttrs =
			getDynamicAttributesByEntityType('instrument')
		var allocationPlDnymaicAttrs =
			getDynamicAttributesByEntityType('instrument')

		var accountPositionDynamicAttrs =
			getDynamicAttributesByEntityType('account')
		var accountCashDynamicAttrs = getDynamicAttributesByEntityType('account')
		var accountInterimDynamicAttrs = getDynamicAttributesByEntityType('account')

		var portfolioDynamicAttrsFormatted = formatAttributeTypes(
			portfolioDynamicAttrs,
			'portfolios.portfolio',
			'portfolio',
			'Portfolio'
		)
		var complexTransactionDynamicAttrsFormatted = formatAttributeTypes(
			complexTransactionDynamicAttrs,
			'transactions.complextransaction',
			'complex_transaction',
			'Complex Transaction'
		)
		var transactionTypeDynamicAttrsFormatted = formatAttributeTypes(
			transactionTypeDynamicAttrs,
			'transactions.transactiontype',
			'transaction_type',
			'Transaction Type'
		)
		var responsibleDynamicAttrsFormatted = formatAttributeTypes(
			responsibleDynamicAttrs,
			'counterparties.responsible',
			'responsible',
			'Responsible'
		)
		var counterpartyDynmicAttrsFormatted = formatAttributeTypes(
			counterpartyDynamicAttrs,
			'counterparties.counterparty',
			'counterparty',
			'Counterparty'
		)

		var instrumentDynamicAttrsFormatted = formatAttributeTypes(
			instrumentDynamicAttrs,
			'instruments.instrument',
			'instrument',
			'Instrument'
		)
		var linkedInstrumentDynamicAttrsFormatted = formatAttributeTypes(
			linkedInstrumentDynamicAttrs,
			'instruments.instrument',
			'linked_instrument',
			'Linked Instrument'
		)
		var allocationBalanceDynamicAttrsFormatted = formatAttributeTypes(
			allocationBalanceDynamicAttrs,
			'instruments.instrument',
			'allocation_balance',
			'Allocation Balance'
		)
		var allocationPlDnymaicAttrsFormatted = formatAttributeTypes(
			allocationPlDnymaicAttrs,
			'instruments.instrument',
			'allocation_pl',
			'Allocation P&L'
		)

		var accountPositionDynamicAttrsFormatted = formatAttributeTypes(
			accountPositionDynamicAttrs,
			'accounts.account',
			'account_position',
			'Account Position'
		)
		var accountCashDynamicAttrsFormatted = formatAttributeTypes(
			accountCashDynamicAttrs,
			'accounts.account',
			'account_cash',
			'Account Cash'
		)
		var accountInterimDynamicAttrsFormatted = formatAttributeTypes(
			accountInterimDynamicAttrs,
			'accounts.account',
			'account_interim',
			'Account Interim'
		)

		result = result.concat(transactionAttrs)
		result = result.concat(complexTransactionAttrs)
		result = result.concat(portfolioAttrs)
		result = result.concat(instrumentAttrs)
		result = result.concat(responsibleAttrs)
		result = result.concat(counterpartyAttrs)

		result = result.concat(linkedInstrumentAttrs)
		result = result.concat(allocationBalanceAttrs)
		result = result.concat(allocationPlAttrs)

		result = result.concat(transactionCurrencyAttrs)
		result = result.concat(settlementCurrencyAttrs)

		result = result.concat(accountPositionAttrs)
		result = result.concat(accountCashAttrs)
		result = result.concat(accountInterimAttrs)

		result = result.concat(strategy1cashAttrs)
		result = result.concat(strategy1positionAttrs)
		result = result.concat(strategy2cashAttrs)
		result = result.concat(strategy2positionAttrs)
		result = result.concat(strategy3cashAttrs)
		result = result.concat(strategy3positionAttrs)

		result = result.concat(custom)

		result = result.concat(portfolioDynamicAttrsFormatted)
		result = result.concat(complexTransactionDynamicAttrsFormatted)
		result = result.concat(transactionTypeDynamicAttrsFormatted)
		result = result.concat(responsibleDynamicAttrsFormatted)
		result = result.concat(counterpartyDynmicAttrsFormatted)

		result = result.concat(instrumentDynamicAttrsFormatted)
		result = result.concat(linkedInstrumentDynamicAttrsFormatted)
		result = result.concat(allocationBalanceDynamicAttrsFormatted)
		result = result.concat(allocationPlDnymaicAttrsFormatted)

		result = result.concat(accountPositionDynamicAttrsFormatted)
		result = result.concat(accountCashDynamicAttrsFormatted)
		result = result.concat(accountInterimDynamicAttrsFormatted)

		return result
	}

	// TODO come up with more efficient way of returning new copy of data

	function getEntityAttributesByEntityType(entityType) {
		if (entityAttributesData[entityType]) {
			return JSON.parse(JSON.stringify(entityAttributesData[entityType]))
		}

		return []
	}

	function getCustomFieldsByEntityType(entityType) {
		if (customFieldsData.hasOwnProperty(entityType)) {
			return JSON.parse(JSON.stringify(customFieldsData[entityType]))
		}

		return []
	}

	function getDynamicAttributesByEntityType(entityType) {
		if (dynamicAttributesData.hasOwnProperty(entityType)) {
			return JSON.parse(JSON.stringify(dynamicAttributesData[entityType]))
		}

		return []
	}

	function getAllAttributesByEntityType(entityType) {
		var result = []

		if (reportsEntityTypes.indexOf(entityType) === -1) {
			var entityAttributes = getEntityAttributesByEntityType(entityType)
			var dynamicAttributes = getDynamicAttributesByEntityType(entityType)
			var contentType =
				metaContentTypesService.findContentTypeByEntity(entityType)

			dynamicAttributes = dynamicAttributes.map(function (attribute) {
				var result = {}

				result.attribute_type = Object.assign({}, attribute)
				result.value_type = attribute.value_type
				result.content_type = contentType
				result.key = 'attributes.' + attribute.user_code
				result.name = attribute.name

				return result
			})

			result.concat(entityAttributes)
			result.concat(dynamicAttributes)
		} else {
			if (entityType === 'balance-report') {
				result = _getBalanceReportAttributes()
			}

			if (entityType === 'pl-report') {
				result = _getPlReportAttributes()
			}

			if (entityType === 'transaction-report') {
				result = _getTransactionReportAttributes()
			}
		}

		return result
	}

	function getInstrumentUserFields() {
		if (instrumentUserFieldsData) {
			return instrumentUserFieldsData
		}

		return []
	}

	function getTransactionUserFields() {
		if (transactionUserFieldsData) {
			return transactionUserFieldsData
		}

		return []
	}

	function downloadAllAttributesByEntityType(entityType) {
		return new Promise(function (resolve, reject) {
			var result = []

			var promises = []

			if (reportsEntityTypes.indexOf(entityType) === -1) {
				promises.push(downloadDynamicAttributesByEntityType(entityType))
			} else {
				promises.push(downloadCustomFieldsByEntityType(entityType))
				promises.push(downloadDynamicAttributesByEntityType('portfolio'))
				promises.push(downloadDynamicAttributesByEntityType('account'))
				promises.push(downloadDynamicAttributesByEntityType('instrument'))

				if (entityType === 'transaction-report') {
					promises.push(downloadDynamicAttributesByEntityType('responsible'))
					promises.push(downloadDynamicAttributesByEntityType('counterparty'))
					promises.push(
						downloadDynamicAttributesByEntityType('transaction-type')
					)
					promises.push(
						downloadDynamicAttributesByEntityType('complex-transaction')
					)
				}
			}

			Promise.all(promises).then(function (data) {
				result = data

				resolve(result)
			})
		})
	}

	function downloadCustomFieldsByEntityType(entityType) {
		return new Promise(function (resolve, reject) {
			var result = []

			customFieldService.getList(entityType).then(function (data) {
				result = data.results

				customFieldsData[entityType] = result

				resolve(result)
			})
		})
	}

	function downloadDynamicAttributesByEntityType(entityType) {
		return new Promise(function (resolve, reject) {
			var result = []

			attributeTypeService
				.getList(entityType, { pageSize: 1000 })
				.then(function (data) {
					result = data.results

					dynamicAttributesData[entityType] = result

					resolve(result)
				})
		})
	}

	function downloadInstrumentUserFields() {
		return new Promise(function (resolve, reject) {
			var result = []

			uiService.getInstrumentFieldList().then(function (data) {
				result = data.results

				instrumentUserFieldsData = result

				resolve(result)
			})
		})
	}

	function downloadTransactionUserFields() {
		return new Promise(function (resolve, reject) {
			var result = []

			uiService
				.getTransactionFieldList({ pageSize: 1000 })
				.then(function (data) {
					result = data.results

					transactionUserFieldsData = result

					resolve(result)
				})
		})
	}

	function appendEntityAttribute(entityType, field) {
		if (entityAttributesData[entityType]) {
			entityAttributesData[entityType].push(field)
		} else {
			console.log('Cant append field')
		}
	}

	/**
	 * Get list of entity attributes and all children attributes.
	 * @param {string} rootContentType - content type (e.g. instruments.instrument).
	 * @param {string} rootKey - key prefix for root level attributes.
	 * @param {string} rootName - name prefix for root level attributes.
	 * @param {object} options - all other options.
	 * @return {Object[]} Array of Attributes.
	 * @memberof module:attributeDataService
	 */

	function getAllAttributesAsFlatList(
		rootContentType,
		rootKey,
		rootName,
		options
	) {
		var result = []
		var defaultOptions = {
			maxDepth: 1,
		}

		var _options = Object.assign({}, defaultOptions, options)

		var currentLevel = 0

		_getAttributesRecursive(
			result,
			currentLevel,
			rootContentType,
			rootKey,
			rootName,
			_options
		)

		// console.log('currentLevel', currentLevel);
		// console.log('result', result);

		return result
	}

	function _getAttributesRecursive(
		result,
		currentLevel,
		contentType,
		parentKey,
		parentName,
		options
	) {
		// console.log('contentType', contentType);

		var entityType =
			metaContentTypesService.findEntityByContentType(contentType)

		var attributes = getEntityAttributesByEntityType(entityType)

		var key
		var name
		var resultAttr

		if (attributes) {
			attributes.forEach(function (attribute) {
				name = parentName + '. ' + attribute.name

				if (parentKey) {
					key = parentKey + '.' + attribute.key
				} else {
					key = attribute.key
				}

				if (
					attribute.value_type === 'field' &&
					attribute.code === 'user_code'
				) {
					if (currentLevel < options.maxDepth) {
						// console.log('attribute', attribute);

						_getAttributesRecursive(
							result,
							currentLevel + 1,
							attribute.value_content_type,
							key,
							name,
							options
						)
					}
				} else {
					if (
						attribute.value_type === 'field' &&
						attribute.code === 'user_code'
					) {
						resultAttr = Object.assign({}, attribute)

						resultAttr.content_type = contentType
						resultAttr.name = name + '. Name'
						resultAttr.key = key + '.name'

						result.push(resultAttr)
					} else {
						if (attribute.value_type !== 'mc_field') {
							resultAttr = Object.assign({}, attribute)

							resultAttr.content_type = contentType
							resultAttr.name = name
							resultAttr.key = key

							result.push(resultAttr)
						}
					}
				}
			})
		} else {
			console.warn("Can't find attributes for content type: " + contentType)
		}
	}

	/**
	 * Get list of entity attribute types.
	 * @param {object[]} attributes - source list of attribute types.
	 * @param {string} contentType - content type
	 * @param {string} rootKey - key prefix for root level attributes.
	 * @param {string} rootName - name prefix for root level attributes.
	 * @return {Object[]} Array of Attributes.
	 * @memberof module:attributeDataService
	 */

	function formatAttributeTypes(attributes, contentType, rootKey, rootName) {
		return attributes.map(function (attribute) {
			var result = {}

			result.attribute_type = Object.assign({}, attribute)
			result.value_type = attribute.value_type
			result.content_type = contentType
			result.key = rootKey + '.attributes.' + attribute.user_code
			result.name = rootName + '. ' + attribute.name

			return result
		})
	}

	function setReconciliationAttributes(attributesList) {
		reconciliationAttributes = attributesList
	}

	function getReconciliationAttributes() {
		return reconciliationAttributes
	}

	function setAttributesAvailableForColumns(attributesList) {
		attributesAvailableForColumns = attributesList
	}

	function getAttributesAvailableForColumns() {
		return attributesAvailableForColumns
	}
	function getForAttributesSelector(entityType, viewContext) {
		var attrs = getAllAttributesByEntityType(entityType, viewContext)

		return attrs.filter(function (attr) {
			return attr.value_type !== 'mc_field'
		})
	}

	return {
		// Remember! Download Custom Fields and Dynamic Attributes and User Fields before .get() them

		downloadAllAttributesByEntityType: downloadAllAttributesByEntityType,

		downloadCustomFieldsByEntityType: downloadCustomFieldsByEntityType,
		downloadDynamicAttributesByEntityType:
			downloadDynamicAttributesByEntityType,

		downloadInstrumentUserFields: downloadInstrumentUserFields,
		downloadTransactionUserFields: downloadTransactionUserFields,

		// Get method belows

		getAllAttributesByEntityType: getAllAttributesByEntityType,
		getForAttributesSelector: getForAttributesSelector,

		getInstrumentUserFields: getInstrumentUserFields,
		getTransactionUserFields: getTransactionUserFields,

		getBalanceReportAttributes: _getBalanceReportAttributes,
		getPlReportAttributes: _getPlReportAttributes,
		getTransactionReportAttributes: _getTransactionReportAttributes,

		getEntityAttributesByEntityType: getEntityAttributesByEntityType,
		getCustomFieldsByEntityType: getCustomFieldsByEntityType,
		getDynamicAttributesByEntityType: getDynamicAttributesByEntityType,

		getAllAttributesAsFlatList: getAllAttributesAsFlatList,

		setReconciliationAttributes: setReconciliationAttributes,
		getReconciliationAttributes: getReconciliationAttributes,

		setAttributesAvailableForColumns: setAttributesAvailableForColumns,
		getAttributesAvailableForColumns: getAttributesAvailableForColumns,

		// Append methods

		appendEntityAttribute: appendEntityAttribute,

		// Format Methods

		formatAttributeTypes: formatAttributeTypes,
	}
}
