/**
 * Created by szhitenev on 05.05.2016.
 */


	import logService from '@/angular/core/services/logService'

	import evEvents from '../../services/entityViewerEvents'

	import metaService from '../../services/metaService'

	import evDataHelper from '../../helpers/ev-data.helper'

	import GModalSharedLogicHelper from '../../helpers/entityViewer/sharedLogic/gModalSharedLogicHelper'

	import evHelperService from '../../services/entityViewerHelperService'

	export default function (
		$scope,
		$mdDialog,
		entityViewerDataService,
		entityViewerEventService,
		attributeDataService,
		contentWrapElement
	) {
		var vm = this

		var gModalSharedLogicHelper = new GModalSharedLogicHelper(vm)

		vm.readyStatus = { content: false }

		vm.entityViewerDataService = entityViewerDataService
		vm.entityViewerEventService = entityViewerEventService
		vm.attributeDataService = attributeDataService

		vm.contentWrapElement = contentWrapElement

		vm.entityType = vm.entityViewerDataService.getEntityType()

		logService.property('vm.entityType', vm.entityType)

		vm.general = []
		vm.attrs = []
		vm.custom = []

		vm.instrumentDynamicAttrs = []
		vm.accountDynamicAttrs = []
		vm.portfolioDynamicAttrs = []

		vm.cardsDividedIntoTabs = true

		var columns = vm.entityViewerDataService.getColumns()
		var filters = vm.entityViewerDataService.getFilters()
		var groups = vm.entityViewerDataService.getGroups()

		vm.attrsList = []

		$('body').addClass('drag-dialog') // hide backdrop

		var complexTransactionAttrsComp = [
			'complex_transaction.code',
			'complex_transaction.date',
			'complex_transaction.text',
			'complex_transaction.transaction_unique_code',
			'complex_transaction.is_canceled',
			'complex_transaction.is_locked',
		]

		var userFieldsComp = [
			'complex_transaction.user_text_1',
			'complex_transaction.user_text_2',
			'complex_transaction.user_text_3',
			'complex_transaction.user_text_4',
			'complex_transaction.user_text_5',
			'complex_transaction.user_text_6',
			'complex_transaction.user_text_7',
			'complex_transaction.user_text_8',
			'complex_transaction.user_text_9',
			'complex_transaction.user_text_10',
			'complex_transaction.user_text_11',
			'complex_transaction.user_text_12',
			'complex_transaction.user_text_13',
			'complex_transaction.user_text_14',
			'complex_transaction.user_text_15',
			'complex_transaction.user_text_16',
			'complex_transaction.user_text_17',
			'complex_transaction.user_text_18',
			'complex_transaction.user_text_19',
			'complex_transaction.user_text_20',
			'complex_transaction.user_number_1',
			'complex_transaction.user_number_2',
			'complex_transaction.user_number_3',
			'complex_transaction.user_number_4',
			'complex_transaction.user_number_5',
			'complex_transaction.user_number_6',
			'complex_transaction.user_number_7',
			'complex_transaction.user_number_8',
			'complex_transaction.user_number_9',
			'complex_transaction.user_number_10',
			'complex_transaction.user_number_11',
			'complex_transaction.user_number_12',
			'complex_transaction.user_number_13',
			'complex_transaction.user_number_14',
			'complex_transaction.user_number_15',
			'complex_transaction.user_number_16',
			'complex_transaction.user_number_17',
			'complex_transaction.user_number_18',
			'complex_transaction.user_number_19',
			'complex_transaction.user_number_20',
			'complex_transaction.user_date_1',
			'complex_transaction.user_date_2',
			'complex_transaction.user_date_3',
			'complex_transaction.user_date_4',
			'complex_transaction.user_date_5',
		]

		var transactionAttrsComp = [
			'transaction_code',
			'transaction_class.name',
			'position_size_with_sign',
			'cash_consideration',
			'principal_with_sign',
			'carry_with_sign',
			'overheads_with_sign',
			'accounting_date',
			'cash_date',
			'reference_fx_rate',
			'is_locked',
			'is_canceled',
			'factor',
			'trade_price',
			'notes',

			'entry_account',
			'entry_strategy',
			'entry_item_name',
			'entry_item_short_name',
			'entry_item_user_code',
			'entry_item_public_name',
			'entry_amount',
			'entry_item_type_name',
			'entry_currency.user_code',
			'entry_currency.name',
			'entry_currency.short_name',
			'entry_instrument.user_code',
			'entry_instrument.name',
			'entry_instrument.short_name',
		]

		var transactionClassAttrsComp = ['transaction_class.name']

		var complexTransactionStatusAttrsComp = ['complex_transaction.status.name']

		var transactionTypeAttrsComp = [
			'complex_transaction.transaction_type.name',
			'complex_transaction.transaction_type.short_name',
			'complex_transaction.transaction_type.user_code',
			'complex_transaction.transaction_type.group',
		]

		var instrumentAttrsComp = [
			'instrument.name',
			'instrument.short_name',
			'instrument.user_code',
			'instrument.public_name',
			'instrument.instrument_type.name',
			'instrument.instrument_type.short_name',
			'instrument.instrument_type.user_code',
			'instrument.instrument_type.public_name',
			'instrument.is_active',
			'instrument.price_multiplier',
			'instrument.accrued_currency.name',
			'instrument.accrued_currency.short_name',
			'instrument.accrued_currency.user_code',
			'instrument.maturity_date',
			'instrument.maturity_price',
			'instrument.accrued_multiplier',
			'instrument.user_text_1',
			'instrument.user_text_2',
			'instrument.user_text_3',
		]

		var linkedInstrumentAttrsComp = [
			'linked_instrument.name',
			'linked_instrument.short_name',
			'linked_instrument.user_code',
			'linked_instrument.user_text_1',
			'linked_instrument.user_text_2',
			'linked_instrument.user_text_3',
		]

		var accountAttrsComp = [
			'account_position.name',
			'account_position.short_name',
			'account_position.user_code',
			'account_position.public_name',
			'account_position.type.name',
			'account_position.type.short_name',
			'account_position.type.public_name',
			'account_position.type.user_code',
			'account_cash.name',
			'account_cash.short_name',
			'account_cash.user_code',
			'account_cash.public_name',
			'account_cash.type.name',
			'account_cash.type.short_name',
			'account_cash.type.public_name',
			'account_cash.type.user_code',
			'account_interim.name',
			'account_interim.short_name',
			'account_interim.user_code',
			'account_interim.public_name',
			'account_interim.type.name',
			'account_interim.type.short_name',
			'account_interim.type.public_name',
			'account_interim.type.user_code',
		]

		var currenciesAttrsComp = [
			'transaction_currency.name',
			'transaction_currency.short_name',
			'transaction_currency.user_code',
			'settlement_currency.name',
			'settlement_currency.short_name',
			'settlement_currency.user_code',
		]

		var strategiesAttrsComp = [
			'strategy1_cash.name',
			'strategy1_cash.short_name',
			'strategy1_cash.user_code',
			'strategy1_cash.subgroup.name',
			'strategy1_position.name',
			'strategy1_position.short_name',
			'strategy1_position.user_code',
			'strategy1_position.subgroup.name',
			'strategy2_cash.name',
			'strategy2_cash.short_name',
			'strategy2_cash.user_code',
			'strategy2_cash.subgroup.name',
			'strategy2_position.name',
			'strategy2_position.short_name',
			'strategy2_position.user_code',
			'strategy2_position.subgroup.name',
			'strategy3_cash.name',
			'strategy3_cash.short_name',
			'strategy3_cash.user_code',
			'strategy3_cash.subgroup.name',
			'strategy3_position.name',
			'strategy3_position.short_name',
			'strategy3_position.user_code',
			'strategy3_position.subgroup.name',
		]

		var composeAttrsInsideTab = function (
			vmAttrsKey,
			attrsToShow,
			filteredAttrsKey
		) {
			vm[vmAttrsKey].forEach(function (attr) {
				if (attrsToShow.indexOf(attr.key) !== -1) {
					attr.orderNumber__ = attrsToShow.indexOf(attr.key)

					if (filteredAttrsKey) {
						vm[filteredAttrsKey].push(attr)
					} else {
						vm[vmAttrsKey + 'Filtered'].push(attr)
					}
				}
			})
		}

		vm.getAttributes = function () {
			// contains attributes to show inside tab
			vm.transactionAttrsFiltered = []
			vm.complexTransactionAttrsFiltered = []
			vm.complexTransactionStatusAttrsFiltered = []
			vm.transactionTypeAttrsFiltered = []
			vm.userFieldsFiltered = []
			vm.portfolioAttrsFiltered = []
			vm.instrumentAttrsFiltered = []
			vm.responsibleAttrsFiltered = []
			vm.counterpartyAttrsFiltered = []
			// instruments
			vm.linkedInstrumentAttrsFiltered = []
			vm.allocationBalanceAttrsFiltered = []
			vm.allocationPlAttrsFiltered = []
			// currencies
			vm.transactionCurrencyAttrsFiltered = []
			vm.settlementCurrencyAttrsFiltered = []
			// accounts
			vm.accountPositionAttrsFiltered = []
			vm.accountCashAttrsFiltered = []
			vm.accountInterimAttrsFiltered = []
			// strategies
			vm.strategy1cashAttrsFiltered = []
			vm.strategy1positionAttrsFiltered = []
			vm.strategy2cashAttrsFiltered = []
			vm.strategy2positionAttrsFiltered = []
			vm.strategy3cashAttrsFiltered = []
			vm.strategy3positionAttrsFiltered = []

			vm.transactionAttrs = attributeDataService.getAllAttributesAsFlatList(
				'reports.transactionreport',
				'',
				'Transaction',
				{ maxDepth: 1 }
			)

			vm.transactionClassAttrs =
				attributeDataService.getAllAttributesAsFlatList(
					'transactions.transactionclass',
					'',
					'Transaction Class',
					{ maxDepth: 1 }
				)

			vm.complexTransactionAttrs =
				attributeDataService.getAllAttributesAsFlatList(
					'transactions.complextransaction',
					'complex_transaction',
					'Complex Transaction',
					{ maxDepth: 1 }
				)

			vm.complexTransactionStatusAttrs =
				attributeDataService.getAllAttributesAsFlatList(
					'transactions.complextransactionstatus',
					'complex_transaction',
					'Complex Transaction status',
					{ maxDepth: 1 }
				)

			vm.portfolioAttrs = attributeDataService.getAllAttributesAsFlatList(
				'portfolios.portfolio',
				'portfolio',
				'Portfolio',
				{ maxDepth: 1 }
			)

			vm.instrumentAttrs = attributeDataService.getAllAttributesAsFlatList(
				'instruments.instrument',
				'instrument',
				'Instrument',
				{ maxDepth: 1 }
			)

			vm.responsibleAttrs = attributeDataService.getAllAttributesAsFlatList(
				'counterparties.responsible',
				'responsible',
				'Responsible',
				{ maxDepth: 1 }
			)

			vm.counterpartyAttrs = attributeDataService.getAllAttributesAsFlatList(
				'counterparties.counterparty',
				'counterparty',
				'Counterparty',
				{ maxDepth: 1 }
			)

			// instruments

			vm.linkedInstrumentAttrs =
				attributeDataService.getAllAttributesAsFlatList(
					'instruments.instrument',
					'linked_instrument',
					'Linked Instrument',
					{ maxDepth: 1 }
				)

			vm.allocationBalanceAttrs =
				attributeDataService.getAllAttributesAsFlatList(
					'instruments.instrument',
					'allocation_balance',
					'Allocation Balance',
					{ maxDepth: 1 }
				)

			vm.allocationPlAttrs = attributeDataService.getAllAttributesAsFlatList(
				'instruments.instrument',
				'allocation_pl',
				'Allocation P&L',
				{ maxDepth: 1 }
			)

			// currencies

			vm.transactionCurrencyAttrs =
				attributeDataService.getAllAttributesAsFlatList(
					'currencies.currency',
					'transaction_currency',
					'Transaction currency',
					{ maxDepth: 1 }
				)

			vm.settlementCurrencyAttrs =
				attributeDataService.getAllAttributesAsFlatList(
					'currencies.currency',
					'settlement_currency',
					'Settlement currency',
					{ maxDepth: 1 }
				)

			// accounts

			vm.accountPositionAttrs = attributeDataService.getAllAttributesAsFlatList(
				'accounts.account',
				'account_position',
				'Account Position',
				{ maxDepth: 1 }
			)

			vm.accountCashAttrs = attributeDataService.getAllAttributesAsFlatList(
				'accounts.account',
				'account_cash',
				'Account Cash',
				{ maxDepth: 1 }
			)

			vm.accountInterimAttrs = attributeDataService.getAllAttributesAsFlatList(
				'accounts.account',
				'account_interim',
				'Account Interim',
				{ maxDepth: 1 }
			)

			// strategies

			vm.strategy1cashAttrs = attributeDataService.getAllAttributesAsFlatList(
				'strategies.strategy1',
				'strategy1_cash',
				'Strategy 1 Cash',
				{ maxDepth: 1 }
			)

			vm.strategy1positionAttrs =
				attributeDataService.getAllAttributesAsFlatList(
					'strategies.strategy1',
					'strategy1_position',
					'Strategy 1 Position',
					{ maxDepth: 1 }
				)

			vm.strategy2cashAttrs = attributeDataService.getAllAttributesAsFlatList(
				'strategies.strategy2',
				'strategy2_cash',
				'Strategy 2 Cash',
				{ maxDepth: 1 }
			)

			vm.strategy2positionAttrs =
				attributeDataService.getAllAttributesAsFlatList(
					'strategies.strategy2',
					'strategy2_position',
					'Strategy 2 Position',
					{ maxDepth: 1 }
				)

			vm.strategy3cashAttrs = attributeDataService.getAllAttributesAsFlatList(
				'strategies.strategy3',
				'strategy3_cash',
				'Strategy 3 Cash',
				{ maxDepth: 1 }
			)

			vm.strategy3positionAttrs =
				attributeDataService.getAllAttributesAsFlatList(
					'strategies.strategy3',
					'strategy3_position',
					'Strategy 3 Position',
					{ maxDepth: 1 }
				)

			var transactionUserFields =
				attributeDataService.getTransactionUserFields()

			transactionUserFields.forEach(function (field) {
				vm.complexTransactionAttrs = vm.complexTransactionAttrs.filter(
					function (entityAttr) {
						if (entityAttr.key === 'complex_transaction.' + field.key) {
							return field.is_active
						}

						return true
					}
				)

				userFieldsComp = userFieldsComp.filter(function (item) {
					if (item === 'complex_transaction.' + field.key) {
						return field.is_active
					}

					return true
				})



				vm.complexTransactionAttrs = vm.complexTransactionAttrs.map(function (
					entityAttr,
					index
				) {
					if (entityAttr.key === 'complex_transaction.' + field.key) {
						entityAttr.name = 'Complex Transaction. ' + field.name
					}

					return entityAttr
				})
			})

			vm.transactionTypeAttrs = []
			vm.complexTransactionStatusAttrs = []



			vm.complexTransactionAttrs = vm.complexTransactionAttrs.filter(function (
				entityAttr
			) {
				if (
					entityAttr.key.indexOf('complex_transaction.transaction_type.') !== -1
				) {
					if (
						entityAttr.key.indexOf(
							'complex_transaction.transaction_type.user_text_'
						) === -1 &&
						entityAttr.key.indexOf(
							'complex_transaction.transaction_type.user_number_'
						) === -1 &&
						entityAttr.key.indexOf(
							'complex_transaction.transaction_type.user_date_'
						) === -1
					) {
						vm.transactionTypeAttrs.push(entityAttr)
					}

					return false
				} else if (
					entityAttr.key.indexOf('complex_transaction.status.name') !== -1
				) {
					vm.complexTransactionStatusAttrs.push(entityAttr)

					return false
				} else {
					return true
				}
			})

			console.log(
				'complexTransactionStatusAttrs',
				vm.complexTransactionStatusAttrs
			)

			var instrumentUserFields = attributeDataService.getInstrumentUserFields()

			instrumentUserFields.forEach(function (field) {
				vm.instrumentAttrs = vm.instrumentAttrs.map(function (
					entityAttr,
					index
				) {
					if (entityAttr.key === 'instrument.' + field.key) {
						entityAttr.name = 'Instrument. ' + field.name
					}

					return entityAttr
				})

				vm.linkedInstrumentAttrs = vm.linkedInstrumentAttrs.map(function (
					entityAttr,
					index
				) {
					if (entityAttr.key === 'linked_instrument.' + field.key) {
						entityAttr.name = 'Linked Instrument. ' + field.name
					}

					return entityAttr
				})

				vm.allocationBalanceAttrs = vm.allocationBalanceAttrs.map(function (
					entityAttr,
					index
				) {
					if (entityAttr.key === 'allocation_balance.' + field.key) {
						entityAttr.name = 'Allocation Balance. ' + field.name
					}

					return entityAttr
				})

				vm.allocationPlAttrs = vm.allocationPlAttrs.map(function (
					entityAttr,
					index
				) {
					if (entityAttr.key === 'allocation_pl.' + field.key) {
						entityAttr.name = 'Allocation P&L. ' + field.name
					}

					return entityAttr
				})
			})

			vm.custom = attributeDataService.getCustomFieldsByEntityType(
				vm.entityType
			)

			vm.custom = vm.custom.map(function (customItem) {
				customItem.custom_field = Object.assign({}, customItem)

				customItem.key = 'custom_fields.' + customItem.user_code
				customItem.name = 'Custom Field. ' + customItem.name

				return customItem
			})

			var portfolioDynamicAttrs =
				attributeDataService.getDynamicAttributesByEntityType('portfolio')
			var transactionTypeDynamicAttrs =
				attributeDataService.getDynamicAttributesByEntityType(
					'transaction-type'
				)
			var complexTransactionDynamicAttrs =
				attributeDataService.getDynamicAttributesByEntityType(
					'complex-transaction'
				)
			var responsibleDynamicAttrs =
				attributeDataService.getDynamicAttributesByEntityType('responsible')
			var counterpartyDynamicAttrs =
				attributeDataService.getDynamicAttributesByEntityType('counterparty')

			var instrumentDynamicAttrs =
				attributeDataService.getDynamicAttributesByEntityType('instrument')

			var accountDynamicAttrs =
				attributeDataService.getDynamicAttributesByEntityType('account')

			vm.portfolioDynamicAttrs = attributeDataService.formatAttributeTypes(
				portfolioDynamicAttrs,
				'portfolios.portfolio',
				'portfolio',
				'Portfolio'
			)
			vm.complexTransactionDynamicAttrs =
				attributeDataService.formatAttributeTypes(
					complexTransactionDynamicAttrs,
					'transactions.complextransaction',
					'complex_transaction',
					'Complex Transaction'
				)
			vm.transactionTypeDynamicAttrs =
				attributeDataService.formatAttributeTypes(
					transactionTypeDynamicAttrs,
					'transactions.transactiontype',
					'transaction_type',
					'Transaction Type'
				)
			vm.responsibleDynamicAttrs = attributeDataService.formatAttributeTypes(
				responsibleDynamicAttrs,
				'counterparties.responsible',
				'responsible',
				'Responsible'
			)
			vm.counterpartyDynmicAttrs = attributeDataService.formatAttributeTypes(
				counterpartyDynamicAttrs,
				'counterparties.counterparty',
				'counterparty',
				'Counterparty'
			)

			vm.instrumentDynamicAttrs = attributeDataService.formatAttributeTypes(
				instrumentDynamicAttrs,
				'instruments.instrument',
				'instrument',
				'Instrument'
			)
			vm.linkedInstrumentDynamicAttrs =
				attributeDataService.formatAttributeTypes(
					instrumentDynamicAttrs,
					'instruments.instrument',
					'linked_instrument',
					'Linked Instrument'
				)
			vm.allocationBalanceDynamicAttrs =
				attributeDataService.formatAttributeTypes(
					instrumentDynamicAttrs,
					'instruments.instrument',
					'allocation_balance',
					'Allocation Balance'
				)
			vm.allocationPlDnymaicAttrs = attributeDataService.formatAttributeTypes(
				instrumentDynamicAttrs,
				'instruments.instrument',
				'allocation_pl',
				'Allocation PL'
			)

			vm.accountPositionDynamicAttrs =
				attributeDataService.formatAttributeTypes(
					accountDynamicAttrs,
					'accounts.account',
					'account_position',
					'Account Position'
				)
			vm.accountCashDynamicAttrs = attributeDataService.formatAttributeTypes(
				accountDynamicAttrs,
				'accounts.account',
				'account_cash',
				'Account Cash'
			)
			vm.accountInterimDynamicAttrs = attributeDataService.formatAttributeTypes(
				accountDynamicAttrs,
				'accounts.account',
				'account_interim',
				'Account Interim'
			)

			//vm.entityAttrs = metaService.getEntityAttrs(vm.entityType);

			vm.attrsList = vm.attrsList.concat(vm.transactionAttrs)
			vm.attrsList = vm.attrsList.concat(vm.complexTransactionAttrs)
			vm.attrsList = vm.attrsList.concat(vm.transactionTypeAttrs)
			vm.attrsList = vm.attrsList.concat(vm.complexTransactionStatusAttrs)
			vm.attrsList = vm.attrsList.concat(vm.portfolioAttrs)
			vm.attrsList = vm.attrsList.concat(vm.instrumentAttrs)
			vm.attrsList = vm.attrsList.concat(vm.responsibleAttrs)
			vm.attrsList = vm.attrsList.concat(vm.counterpartyAttrs)

			vm.attrsList = vm.attrsList.concat(vm.portfolioDynamicAttrs)
			vm.attrsList = vm.attrsList.concat(vm.complexTransactionDynamicAttrs)
			vm.attrsList = vm.attrsList.concat(vm.transactionTypeDynamicAttrs)
			vm.attrsList = vm.attrsList.concat(vm.responsibleDynamicAttrs)
			vm.attrsList = vm.attrsList.concat(vm.counterpartyDynmicAttrs)
			vm.attrsList = vm.attrsList.concat(vm.custom)

			// instruments

			vm.attrsList = vm.attrsList.concat(vm.linkedInstrumentAttrs)
			vm.attrsList = vm.attrsList.concat(vm.allocationBalanceAttrs)
			vm.attrsList = vm.attrsList.concat(vm.allocationPlAttrs)

			vm.attrsList = vm.attrsList.concat(vm.instrumentDynamicAttrs)
			vm.attrsList = vm.attrsList.concat(vm.linkedInstrumentDynamicAttrs)
			vm.attrsList = vm.attrsList.concat(vm.allocationBalanceDynamicAttrs)
			vm.attrsList = vm.attrsList.concat(vm.allocationPlDnymaicAttrs)

			// currencies

			vm.attrsList = vm.attrsList.concat(vm.transactionCurrencyAttrs)
			vm.attrsList = vm.attrsList.concat(vm.settlementCurrencyAttrs)

			// accounts

			vm.attrsList = vm.attrsList.concat(vm.accountPositionAttrs)
			vm.attrsList = vm.attrsList.concat(vm.accountCashAttrs)
			vm.attrsList = vm.attrsList.concat(vm.accountInterimAttrs)

			vm.attrsList = vm.attrsList.concat(vm.accountPositionDynamicAttrs)
			vm.attrsList = vm.attrsList.concat(vm.accountCashDynamicAttrs)
			vm.attrsList = vm.attrsList.concat(vm.accountInterimDynamicAttrs)

			// strategies

			vm.attrsList = vm.attrsList.concat(vm.strategy1cashAttrs)
			vm.attrsList = vm.attrsList.concat(vm.strategy1positionAttrs)
			vm.attrsList = vm.attrsList.concat(vm.strategy2cashAttrs)
			vm.attrsList = vm.attrsList.concat(vm.strategy2positionAttrs)
			vm.attrsList = vm.attrsList.concat(vm.strategy3cashAttrs)
			vm.attrsList = vm.attrsList.concat(vm.strategy3positionAttrs)

			composeAttrsInsideTab(
				'complexTransactionAttrs',
				complexTransactionAttrsComp
			)
			composeAttrsInsideTab(
				'complexTransactionAttrs',
				userFieldsComp,
				'userFieldsFiltered'
			)
			composeAttrsInsideTab('transactionAttrs', transactionAttrsComp)
			composeAttrsInsideTab('transactionClassAttrs', transactionClassAttrsComp)
			composeAttrsInsideTab('transactionTypeAttrs', transactionTypeAttrsComp)
			composeAttrsInsideTab(
				'complexTransactionStatusAttrs',
				complexTransactionStatusAttrsComp
			)
			// instrument
			composeAttrsInsideTab('instrumentAttrs', instrumentAttrsComp)
			composeAttrsInsideTab('linkedInstrumentAttrs', linkedInstrumentAttrsComp)
			// account
			composeAttrsInsideTab('accountPositionAttrs', accountAttrsComp)
			composeAttrsInsideTab('accountCashAttrs', accountAttrsComp)
			composeAttrsInsideTab('accountInterimAttrs', accountAttrsComp)
			// currency
			composeAttrsInsideTab('transactionCurrencyAttrs', currenciesAttrsComp)
			composeAttrsInsideTab('settlementCurrencyAttrs', strategiesAttrsComp)
			// strategies
			composeAttrsInsideTab('strategy1cashAttrs', strategiesAttrsComp)
			composeAttrsInsideTab('strategy1positionAttrs', strategiesAttrsComp)
			composeAttrsInsideTab('strategy2cashAttrs', strategiesAttrsComp)
			composeAttrsInsideTab('strategy2positionAttrs', strategiesAttrsComp)
			composeAttrsInsideTab('strategy3cashAttrs', strategiesAttrsComp)
			composeAttrsInsideTab('strategy3positionAttrs', strategiesAttrsComp)

			vm.syncAttrs()
			getSelectedAttrs()

			vm.readyStatus.content = true
		}

		vm.getCustomAttrs = function () {
			vm.custom = attributeDataService.getCustomFieldsByEntityType(
				vm.entityType
			)
			vm.custom = vm.custom.map(function (customItem) {
				customItem.custom_field = Object.assign({}, customItem)

				customItem.key = 'custom_fields.' + customItem.user_code
				customItem.name = 'Custom Field. ' + customItem.name

				return customItem
			})

			vm.attrsList = []

			vm.attrsList = vm.attrsList.concat(vm.transactionAttrs)
			vm.attrsList = vm.attrsList.concat(vm.complexTransactionAttrs)
			vm.attrsList = vm.attrsList.concat(vm.transactionTypeAttrs)
			vm.attrsList = vm.attrsList.concat(vm.complexTransactionStatusAttrs)
			vm.attrsList = vm.attrsList.concat(vm.portfolioAttrs)
			vm.attrsList = vm.attrsList.concat(vm.instrumentAttrs)
			vm.attrsList = vm.attrsList.concat(vm.responsibleAttrs)
			vm.attrsList = vm.attrsList.concat(vm.counterpartyAttrs)

			vm.attrsList = vm.attrsList.concat(vm.portfolioDynamicAttrs)
			vm.attrsList = vm.attrsList.concat(vm.complexTransactionDynamicAttrs)
			vm.attrsList = vm.attrsList.concat(vm.transactionTypeDynamicAttrs)
			vm.attrsList = vm.attrsList.concat(vm.responsibleDynamicAttrs)
			vm.attrsList = vm.attrsList.concat(vm.counterpartyDynmicAttrs)
			vm.attrsList = vm.attrsList.concat(vm.custom)

			// instruments

			vm.attrsList = vm.attrsList.concat(vm.linkedInstrumentAttrs)
			vm.attrsList = vm.attrsList.concat(vm.allocationBalanceAttrs)
			vm.attrsList = vm.attrsList.concat(vm.allocationPlAttrs)

			vm.attrsList = vm.attrsList.concat(vm.instrumentDynamicAttrs)
			vm.attrsList = vm.attrsList.concat(vm.linkedInstrumentDynamicAttrs)
			vm.attrsList = vm.attrsList.concat(vm.allocationBalanceDynamicAttrs)
			vm.attrsList = vm.attrsList.concat(vm.allocationPlDnymaicAttrs)

			// currencies

			vm.attrsList = vm.attrsList.concat(vm.transactionCurrencyAttrs)
			vm.attrsList = vm.attrsList.concat(vm.settlementCurrencyAttrs)

			// accounts

			vm.attrsList = vm.attrsList.concat(vm.accountPositionAttrs)
			vm.attrsList = vm.attrsList.concat(vm.accountCashAttrs)
			vm.attrsList = vm.attrsList.concat(vm.accountInterimAttrs)

			vm.attrsList = vm.attrsList.concat(vm.accountPositionDynamicAttrs)
			vm.attrsList = vm.attrsList.concat(vm.accountCashDynamicAttrs)
			vm.attrsList = vm.attrsList.concat(vm.accountInterimDynamicAttrs)

			// strategies

			vm.attrsList = vm.attrsList.concat(vm.strategy1cashAttrs)
			vm.attrsList = vm.attrsList.concat(vm.strategy1positionAttrs)
			vm.attrsList = vm.attrsList.concat(vm.strategy2cashAttrs)
			vm.attrsList = vm.attrsList.concat(vm.strategy2positionAttrs)
			vm.attrsList = vm.attrsList.concat(vm.strategy3cashAttrs)
			vm.attrsList = vm.attrsList.concat(vm.strategy3positionAttrs)

			vm.updateAttrs(vm.custom)
		}

		vm.checkAreaAccessibility = function (item, type) {
			if (type === 'group') {
				if (
					[
						'notes',
						'accounts',
						'responsibles',
						'counterparties',
						'transaction_types',
						'portfolios',
						'content_types',
					].indexOf(item.key) !== -1
				) {
					return true
				}
				return false
			} else {
				if (['notes'].indexOf(item.key) !== -1) {
					return true
				}
				return false
			}
		}

		vm.syncAttrs = function () {
			syncTypeAttrs(vm.transactionAttrs)
			syncTypeAttrs(vm.complexTransactionAttrs)
			syncTypeAttrs(vm.transactionTypeAttrs)
			syncTypeAttrs(vm.complexTransactionStatusAttrs)
			syncTypeAttrs(vm.complexTransactionDynamicAttrs)
			syncTypeAttrs(vm.transactionTypeDynamicAttrs)

			syncTypeAttrs(vm.portfolioAttrs)
			syncTypeAttrs(vm.portfolioDynamicAttrs)

			syncTypeAttrs(vm.instrumentAttrs)
			syncTypeAttrs(vm.instrumentDynamicAttrs)

			syncTypeAttrs(vm.responsibleAttrs)
			syncTypeAttrs(vm.responsibleDynamicAttrs)

			syncTypeAttrs(vm.counterpartyAttrs)
			syncTypeAttrs(vm.counterpartyDynmicAttrs)

			syncTypeAttrs(vm.linkedInstrumentAttrs)
			syncTypeAttrs(vm.linkedInstrumentDynamicAttrs)

			syncTypeAttrs(vm.allocationBalanceAttrs)
			syncTypeAttrs(vm.allocationBalanceDynamicAttrs)

			syncTypeAttrs(vm.allocationPlAttrs)
			syncTypeAttrs(vm.allocationPlDnymaicAttrs)

			syncTypeAttrs(vm.transactionCurrencyAttrs)
			syncTypeAttrs(vm.settlementCurrencyAttrs)

			syncTypeAttrs(vm.accountPositionAttrs)
			syncTypeAttrs(vm.accountPositionDynamicAttrs)

			syncTypeAttrs(vm.accountCashAttrs)
			syncTypeAttrs(vm.accountCashDynamicAttrs)

			syncTypeAttrs(vm.accountInterimAttrs)
			syncTypeAttrs(vm.accountInterimDynamicAttrs)

			syncTypeAttrs(vm.strategy1cashAttrs)
			syncTypeAttrs(vm.strategy1positionAttrs)

			syncTypeAttrs(vm.strategy2cashAttrs)
			syncTypeAttrs(vm.strategy2positionAttrs)

			syncTypeAttrs(vm.strategy3cashAttrs)
			syncTypeAttrs(vm.strategy3positionAttrs)

			syncTypeAttrs(vm.custom)
		}

		function syncTypeAttrs(attrs) {
			var i
			for (i = 0; i < attrs.length; i = i + 1) {
				attrs[i].columns = false
				attrs[i].filters = false
				attrs[i].groups = false

				columns.forEach(function (item) {
					if (attrs[i].entity === item.entity) {
						if (attrs[i].key === item.key) {
							attrs[i].columns = true
						}
					}
				})

				filters.forEach(function (item) {
					if (attrs[i].entity === item.entity) {
						if (attrs[i].key === item.key) {
							attrs[i].filters = true
						}
					}
				})

				groups.forEach(function (item) {
					if (attrs[i].entity === item.entity) {
						if (attrs[i].key === item.key) {
							attrs[i].groups = true
						}
					}
				})
			}
		}

		function updateTypeAttrs(attrs) {
			var c, g, f
			var columnExist, groupExist, filterExist

			attrs.forEach(function (attr) {
				columnExist = false
				groupExist = false
				filterExist = false

				for (c = 0; c < columns.length; c = c + 1) {
					if (attr.entity === columns[c].entity) {
						if (attr.key === columns[c].key) {
							columnExist = true
							if (attr.columns === false) {
								columns.splice(c, 1)
								c = c - 1
							}
							break
						}
					}
				}

		@/angularroups

				for (g = 0; g < groups.length; g = g + 1) {
					if (attr.entity === groups[g].entity) {
						if (attr.key === groups[g].key) {
							groupExist = true
							if (attr.groups === false) {
								groups.splice(g, 1)
								g = g - 1
							}
							break
						}
					}
				}

		@/angularILTERING

				for (f = 0; f < filters.length; f = f + 1) {
					if (attr.entity === filters[f].entity) {
						if (attr.key === filters[f].key) {
							filterExist = true
							if (attr.filters === false) {
								filters.splice(f, 1)
								f = f - 1
							}
							break
						}
					}
				}

				if (!columnExist && attr.columns === true) {
					columns.push(evHelperService.getTableAttrInFormOf('column', attr))
				}

				if (!groupExist && attr.groups === true) {
					groups.push(evHelperService.getTableAttrInFormOf('group', attr))
				}

				if (!filterExist && attr.filters === true) {
					filters.push(evHelperService.getTableAttrInFormOf('filter', attr))
				}
			})

			vm.entityViewerDataService.setColumns(columns)
			vm.entityViewerDataService.setGroups(groups)
			vm.entityViewerDataService.setFilters(filters)
		}

		vm.updateAttrs = function (attrs) {
			updateTypeAttrs(attrs)

			evDataHelper.updateColumnsIds(vm.entityViewerDataService)
			evDataHelper.setColumnsDefaultWidth(vm.entityViewerDataService)

			vm.entityViewerEventService.dispatchEvent(evEvents.COLUMNS_CHANGE)
			vm.entityViewerEventService.dispatchEvent(evEvents.FILTERS_CHANGE)
			vm.entityViewerEventService.dispatchEvent(evEvents.GROUPS_CHANGE)

			vm.entityViewerEventService.dispatchEvent(evEvents.REDRAW_TABLE)
		}

		// format data for SELECTED tab
		vm.selectedGroups = []
		vm.selectedColumns = []
		vm.selectedFilters = []

		var getSelectedAttrs = function () {
			const attributes = [
				'transactionAttrs',
				'complexTransactionAttrs',
				'transactionTypeAttrs',
				'complexTransactionStatusAttrs',
				'complexTransactionDynamicAttrs',
				'transactionTypeDynamicAttrs',

				'portfolioAttrs',
				'portfolioDynamicAttrs',

				'instrumentAttrs',
				'instrumentDynamicAttrs',

				'responsibleAttrs',
				'responsibleDynamicAttrs',

				'counterpartyAttrs',
				'counterpartyDynmicAttrs',

				'linkedInstrumentAttrs',
				'linkedInstrumentDynamicAttrs',

				'allocationBalanceAttrs',
				'allocationBalanceDynamicAttrs',

				'allocationPlAttrs',
				'allocationPlDnymaicAttrs',

				'transactionCurrencyAttrs',
				'settlementCurrencyAttrs',

				'accountPositionAttrs',
				'accountPositionDynamicAttrs',

				'accountCashAttrs',
				'accountCashDynamicAttrs',

				'accountInterimAttrs',
				'accountInterimDynamicAttrs',

				'strategy1cashAttrs',
				'strategy1positionAttrs',

				'strategy2cashAttrs',
				'strategy2positionAttrs',

				'strategy3cashAttrs',
				'strategy3positionAttrs',

				'custom',
			]

			const attrGroups = { groups, columns, filters } // Victor 2020.12.10 I need variables: groups, columns, filters in gModalSharedLogicHelper

			gModalSharedLogicHelper.getSelectedAttrs(attributes, attrGroups)
		}
		// < format data for SELECTED tab >

		vm.onSelectedAttrsChange = function (attributesList, selectedAttr) {
			for (var i = 0; i < attributesList.length; i++) {
				if (attributesList[i].key === selectedAttr.key) {
					attributesList[i].groups = selectedAttr.groups
					attributesList[i].columns = selectedAttr.columns
					attributesList[i].filters = selectedAttr.filters
					break
				}
			}

			vm.updateAttrs(attributesList)
		}

		vm.openCustomFieldsManager = function ($event) {
			$mdDialog.show({
				controller: 'CustomFieldDialogController as vm',
				templateUrl: 'views/dialogs/custom-field/custom-field-dialog-view.html',
				parent: angular.element(document.body),
				targetEvent: $event,
				clickOutsideToClose: false,
				multiple: true,
				autoWrap: true,
				skipHide: true,
				locals: {
					attributeDataService: attributeDataService,
					entityViewerEventService: entityViewerEventService,
					data: {
						entityType: vm.entityType,
					},
				},
			})
		}

		vm.selectAttribute = function (selectedGroup, event) {
			var availableAttrs
			var dialogTitle

			switch (selectedGroup) {
				case 'group':
					dialogTitle = 'Choose column to add'
					availableAttrs = vm.attrsList.filter(function (attr) {
						return !attr.groups
					})
					break
				case 'column':
					dialogTitle = 'Choose column to add'
					availableAttrs = vm.attrsList.filter(function (attr) {
						return !attr.columns
					})
					break
				case 'filter':
					dialogTitle = 'Choose filter to add'
					availableAttrs = vm.attrsList.filter(function (attr) {
						return !attr.filters
					})
					break
			}

			$mdDialog
				.show({
					controller: 'TableAttributeSelectorDialogController as vm',
					templateUrl:
						'views/dialogs/table-attribute-selector-dialog-view.html',
					targetEvent: event,
					multiple: true,
					locals: {
						data: {
							availableAttrs: availableAttrs,
							title: dialogTitle,
							isReport: true,
							multiselector: true,
						},
					},
				})
				.then(function (res) {
					if (res && res.status === 'agree') {
						for (var j = 0; j < res.data.items.length; j++) {
							for (var i = 0; i < vm.attrsList.length; i++) {
								if (vm.attrsList[i].key === res.data.items[j].key) {
									switch (selectedGroup) {
										case 'group':
											vm.attrsList[i].groups = true
											break
										case 'column':
											vm.attrsList[i].columns = true
											break
										case 'filter':
											vm.attrsList[i].filters = true
											break
									}

									break
								}
							}
						}

						vm.updateAttrs(vm.attrsList)
					}
				})
		}

		vm.cancel = function () {
			$('body').removeClass('drag-dialog')
			$mdDialog.hide()
		}

		/*vm.openCustomFieldsManager = function () {

            $mdDialog.show({
                controller: 'CustomFieldDialogController as vm',
                templateUrl: 'views/dialogs/custom-field/custom-field-dialog-view.html',
                parent: angular.element(document.body),
                clickOutsideToClose: false,
                preserveScope: true,
                multiple: true,
                autoWrap: true,
                skipHide: true,
                locals: {
                    data: {
                        entityType: vm.entityType
                    }
                }
            })

        };*/

		vm.MABtnVisibility = function (entityType) {
			return metaService.checkRestrictedEntityTypesForAM(entityType)
		}

		var init = function () {
			vm.getAttributes()

			vm.entityViewerEventService.addEventListener(
				evEvents.COLUMNS_CHANGE,
				function () {
					columns = vm.entityViewerDataService.getColumns()
					vm.syncAttrs()
					getSelectedAttrs()
				}
			)

			vm.entityViewerEventService.addEventListener(
				evEvents.GROUPS_CHANGE,
				function () {
					groups = vm.entityViewerDataService.getGroups()
					vm.syncAttrs()
					getSelectedAttrs()
				}
			)

			vm.entityViewerEventService.addEventListener(
				evEvents.FILTERS_CHANGE,
				function () {
					filters = vm.entityViewerDataService.getFilters()
					vm.syncAttrs()
					getSelectedAttrs()
				}
			)

			vm.entityViewerEventService.addEventListener(
				evEvents.DYNAMIC_ATTRIBUTES_CHANGE,
				function () {
					vm.getCustomAttrs()
				}
			)
		}

		init()
	}

