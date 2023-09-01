/**
 * Created by szhitenev on 30.05.2016.
 */

export default function (
	$scope,
	$mdDialog,
	customFieldService,
	data,
	attributeDataService
) {
	var vm = this

	vm.entityType = data.entityType
	vm.customField = {}
	vm.attributeDataService = attributeDataService

	vm.readyStatus = {
		content: true,
	}

	vm.inputsGroups = [
		{
			name: '<b>Columns</b>',
			key: 'input',
		},
		{
			name: '<b>Custom Columns</b>',
			key: 'custom_field',
		},
	]

	vm.inputsFunctions = []

	vm.valueTypes = [
		{
			name: 'Number',
			value: 20,
		},
		{
			name: 'Text',
			value: 10,
		},
		{
			name: 'Date',
			value: 40,
		},
	]

	vm.validateUserCode = function () {
		var expression = /^\w+$/

		if (expression.test(vm.customField.user_code)) {
			vm.userCodeError = false
		} else {
			vm.userCodeError = true
		}
	}

	vm.setupConfig = function ($event) {
		$mdDialog
			.show({
				controller: 'CustomFieldsConfigDialogController as vm',
				templateUrl:
					'views/dialogs/custom-field/custom-fields-config-dialog-view.html',
				parent: angular.element(document.body),
				targetEvent: $event,
				locals: {
					data: {
						customField: vm.attribute,
					},
				},
				preserveScope: true,
				autoWrap: true,
				skipHide: true,
			})
			.then(function (res) {


				if (res.status === 'agree') {
					vm.attribute.expr = res.data.expression
					vm.attribute.layout = res.data.layout
				}
			})
	}

	vm.agree = function ($event) {
		customFieldService
			.create(vm.entityType, vm.customField)
			.then(function (value) {
				$mdDialog.hide({ status: 'agree' })
			})
			.catch(function (reason) {
				$mdDialog.show({
					controller: 'InfoDialogController as vm',
					templateUrl: 'views/info-dialog-view.html',
					parent: angular.element(document.body),
					targetEvent: $event,
					clickOutsideToClose: true,
					locals: {
						info: {
							title: 'Warning',
							description:
								'Custom Field with <b>' +
								vm.customField.user_code +
								'</b> already exist.',
						},
					},
					preserveScope: true,
					autoWrap: true,
					skipHide: true,
					multiple: true,
				})
			})
	}

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.getBalanceReportAttrs = function () {
		return new Promise(function (resolve, reject) {
			var result = []
			var attrsList = []

			var balanceAttrs = attributeDataService.getAllAttributesAsFlatList(
				'reports.balancereport',
				'',
				'Balance',
				{ maxDepth: 1 }
			)

			var balanceMismatchAttrs =
				attributeDataService.getAllAttributesAsFlatList(
					'reports.balancereportmismatch',
					'',
					'Mismatch',
					{ maxDepth: 1 }
				)

			var balancePerformanceAttrs =
				attributeDataService.getAllAttributesAsFlatList(
					'reports.balancereportperformance',
					'',
					'Performance',
					{ maxDepth: 1 }
				)

			var allocationAttrs = attributeDataService.getAllAttributesAsFlatList(
				'instruments.instrument',
				'allocation',
				'Allocation',
				{ maxDepth: 1 }
			)

			var instrumentAttrs = attributeDataService.getAllAttributesAsFlatList(
				'instruments.instrument',
				'instrument',
				'Instrument',
				{ maxDepth: 1 }
			)

			var accountAttrs = attributeDataService.getAllAttributesAsFlatList(
				'accounts.account',
				'account',
				'Account',
				{ maxDepth: 1 }
			)

			var portfolioAttrs = attributeDataService.getAllAttributesAsFlatList(
				'portfolios.portfolio',
				'portfolio',
				'Portfolio',
				{ maxDepth: 1 }
			)

			var strategy1attrs = attributeDataService.getAllAttributesAsFlatList(
				'strategies.strategy1',
				'strategy1',
				'Strategy 1',
				{ maxDepth: 1 }
			)

			var strategy2attrs = attributeDataService.getAllAttributesAsFlatList(
				'strategies.strategy2',
				'strategy2',
				'Strategy 2',
				{ maxDepth: 1 }
			)

			var strategy3attrs = attributeDataService.getAllAttributesAsFlatList(
				'strategies.strategy3',
				'strategy3',
				'Strategy 3',
				{ maxDepth: 1 }
			)

			var portfolioDynamicAttrs =
				attributeDataService.getDynamicAttributesByEntityType('portfolio')
			var accountDynamicAttrs =
				attributeDataService.getDynamicAttributesByEntityType('account')
			var instrumentDynamicAttrs =
				attributeDataService.getDynamicAttributesByEntityType('instrument')

			var portfolioDynamicAttrsFormatted =
				attributeDataService.formatAttributeTypes(
					portfolioDynamicAttrs,
					'portfolios.portfolio',
					'portfolio',
					'Portfolio'
				)
			var accountDynamicAttrsFormatted =
				attributeDataService.formatAttributeTypes(
					accountDynamicAttrs,
					'accounts.account',
					'account',
					'Account'
				)
			var instrumentDynamicAttrsFormatted =
				attributeDataService.formatAttributeTypes(
					instrumentDynamicAttrs,
					'instruments.instrument',
					'instrument',
					'Instrument'
				)
			var allocationDynamicAttrsFormatted =
				attributeDataService.formatAttributeTypes(
					instrumentDynamicAttrs,
					'instruments.instrument',
					'allocation',
					'Allocation'
				)

			attrsList = attrsList.concat(balanceAttrs)
			attrsList = attrsList.concat(allocationAttrs)
			attrsList = attrsList.concat(allocationDynamicAttrsFormatted)

			attrsList = attrsList.concat(balancePerformanceAttrs)
			attrsList = attrsList.concat(balanceMismatchAttrs)

			attrsList = attrsList.concat(instrumentAttrs)
			attrsList = attrsList.concat(instrumentDynamicAttrsFormatted)

			attrsList = attrsList.concat(accountAttrs)
			attrsList = attrsList.concat(accountDynamicAttrsFormatted)

			attrsList = attrsList.concat(portfolioAttrs)
			attrsList = attrsList.concat(portfolioDynamicAttrsFormatted)

			attrsList = attrsList.concat(strategy1attrs)
			attrsList = attrsList.concat(strategy2attrs)
			attrsList = attrsList.concat(strategy3attrs)

			var captions = {
				10: 'String',
				20: 'Number',
				30: 'String',
				40: 'Date',
			}

			result = attrsList.map(function (attr) {
				return {
					name: 'Column: ' + attr.name + ' (' + attr.key + ')',
					description:
						'Column Name: ' +
						attr.name +
						'\nReference (key ID): ' +
						attr.key +
						'\nValue Type: ' +
						captions[attr.value_type],
					groups: 'input',
					func: attr.key,
					validation: {
						func: attr.key,
					},
				}
			})

			resolve(result)
		})
	}

	vm.getTransactionReportAttrs = function () {
		return new Promise(function (resolve, reject) {
			var result = []
			var attrsList = []

			var transactionAttrs = attributeDataService.getAllAttributesAsFlatList(
				'reports.transactionreport',
				'',
				'Transaction',
				{ maxDepth: 1 }
			)

			var complexTransactionAttrs =
				attributeDataService.getAllAttributesAsFlatList(
					'transactions.complextransaction',
					'complex_transaction',
					'Complex Transaction',
					{ maxDepth: 1 }
				)

			var portfolioAttrs = attributeDataService.getAllAttributesAsFlatList(
				'portfolios.portfolio',
				'portfolio',
				'Portfolio',
				{ maxDepth: 1 }
			)

			var instrumentAttrs = attributeDataService.getAllAttributesAsFlatList(
				'instruments.instrument',
				'instrument',
				'Instrument',
				{ maxDepth: 1 }
			)

			var responsibleAttrs = attributeDataService.getAllAttributesAsFlatList(
				'counterparties.responsible',
				'responsible',
				'Responsible',
				{ maxDepth: 1 }
			)

			var counterpartyAttrs = attributeDataService.getAllAttributesAsFlatList(
				'counterparties.counterparty',
				'counterparty',
				'Counterparty',
				{ maxDepth: 1 }
			)

			// instruments

			var linkedInstrumentAttrs =
				attributeDataService.getAllAttributesAsFlatList(
					'instruments.instrument',
					'linked_instrument',
					'Linked Instrument',
					{ maxDepth: 1 }
				)

			var allocationBalanceAttrs =
				attributeDataService.getAllAttributesAsFlatList(
					'instruments.instrument',
					'allocation_balance',
					'Allocation balance',
					{ maxDepth: 1 }
				)

			var allocationPlAttrs = attributeDataService.getAllAttributesAsFlatList(
				'instruments.instrument',
				'allocation_pl',
				'Allocation P&L',
				{ maxDepth: 1 }
			)

			// currencies

			var transactionCurrencyAttrs =
				attributeDataService.getAllAttributesAsFlatList(
					'currencies.currency',
					'transaction_currency',
					'Transaction currency',
					{ maxDepth: 1 }
				)

			var settlementCurrencyAttrs =
				attributeDataService.getAllAttributesAsFlatList(
					'currencies.currency',
					'settlement_currency',
					'Settlement currency',
					{ maxDepth: 1 }
				)

			// accounts

			var accountPositionAttrs =
				attributeDataService.getAllAttributesAsFlatList(
					'accounts.account',
					'account_position',
					'Account Position',
					{ maxDepth: 1 }
				)

			var accountCashAttrs = attributeDataService.getAllAttributesAsFlatList(
				'accounts.account',
				'account_cash',
				'Account Cash',
				{ maxDepth: 1 }
			)

			var accountInterimAttrs = attributeDataService.getAllAttributesAsFlatList(
				'accounts.account',
				'account_interim',
				'Account Interim',
				{ maxDepth: 1 }
			)

			// strategies

			var strategy1cashAttrs = attributeDataService.getAllAttributesAsFlatList(
				'strategies.strategy1',
				'strategy1_cash',
				'Strategy 1 Cash',
				{ maxDepth: 1 }
			)

			var strategy1positionAttrs =
				attributeDataService.getAllAttributesAsFlatList(
					'strategies.strategy1',
					'strategy1_position',
					'Strategy 1 Position',
					{ maxDepth: 1 }
				)

			var strategy2cashAttrs = attributeDataService.getAllAttributesAsFlatList(
				'strategies.strategy2',
				'strategy2_cash',
				'Strategy 2 Cash',
				{ maxDepth: 1 }
			)

			var strategy2positionAttrs =
				attributeDataService.getAllAttributesAsFlatList(
					'strategies.strategy2',
					'strategy2_position',
					'Strategy 2 Position',
					{ maxDepth: 1 }
				)

			var strategy3cashAttrs = attributeDataService.getAllAttributesAsFlatList(
				'strategies.strategy3',
				'strategy3_cash',
				'Strategy 3 Cash',
				{ maxDepth: 1 }
			)

			var strategy3positionAttrs =
				attributeDataService.getAllAttributesAsFlatList(
					'strategies.strategy3',
					'strategy3_position',
					'Strategy 3 Position',
					{ maxDepth: 1 }
				)

			var portfolioDynamicAttrs =
				attributeDataService.getDynamicAttributesByEntityType('portfolio')
			var accountDynamicAttrs =
				attributeDataService.getDynamicAttributesByEntityType('account')
			var instrumentDynamicAttrs =
				attributeDataService.getDynamicAttributesByEntityType('instrument')
			var responsibleDynamicAttrs =
				attributeDataService.getDynamicAttributesByEntityType('responsible')
			var counterpartyDynamicAttrs =
				attributeDataService.getDynamicAttributesByEntityType('counterparty')
			var complexTransactionDynamicAttrs =
				attributeDataService.getDynamicAttributesByEntityType(
					'complex-transaction'
				)

			var portfolioDynamicAttrsFormatted =
				attributeDataService.formatAttributeTypes(
					portfolioDynamicAttrs,
					'portfolios.portfolio',
					'portfolio',
					'Portfolio'
				)
			var complexTransactionDynamicAttrsFormatted =
				attributeDataService.formatAttributeTypes(
					complexTransactionDynamicAttrs,
					'transactions.complextransaction',
					'complex_transaction',
					'Complex Transaction'
				)
			var responsibleDynamicAttrsFormatted =
				attributeDataService.formatAttributeTypes(
					responsibleDynamicAttrs,
					'counterparties.responsible',
					'responsible',
					'Responsible'
				)
			var counterpartyDynmicAttrsFormatted =
				attributeDataService.formatAttributeTypes(
					counterpartyDynamicAttrs,
					'counterparties.counterparty',
					'counterparty',
					'Counterparty'
				)

			var instrumentDynamicAttrsFormatted =
				attributeDataService.formatAttributeTypes(
					instrumentDynamicAttrs,
					'instruments.instrument',
					'instrument',
					'Instrument'
				)
			var linkedInstrumentDynamicAttrsFormatted =
				attributeDataService.formatAttributeTypes(
					instrumentDynamicAttrs,
					'instruments.instrument',
					'linked_instrument',
					'Linked Instrument'
				)
			var allocationBalanceDynamicAttrsFormatted =
				attributeDataService.formatAttributeTypes(
					instrumentDynamicAttrs,
					'instruments.instrument',
					'allocation_balance',
					'Allocation Balance'
				)
			var allocationPlDnymaicAttrsFormatted =
				attributeDataService.formatAttributeTypes(
					instrumentDynamicAttrs,
					'instruments.instrument',
					'allocation_pl',
					'Allocation PL'
				)

			var accountPositionDynamicAttrsFormatted =
				attributeDataService.formatAttributeTypes(
					accountDynamicAttrs,
					'accounts.account',
					'account_position',
					'Account Position'
				)
			var accountCashDynamicAttrsFormatted =
				attributeDataService.formatAttributeTypes(
					accountDynamicAttrs,
					'accounts.account',
					'account_cash',
					'Account Cash'
				)
			var accountInterimDynamicAttrsFormatted =
				attributeDataService.formatAttributeTypes(
					accountDynamicAttrs,
					'accounts.account',
					'account_interim',
					'Account Interim'
				)

			attrsList = attrsList.concat(transactionAttrs)
			attrsList = attrsList.concat(complexTransactionAttrs)
			attrsList = attrsList.concat(portfolioAttrs)
			attrsList = attrsList.concat(instrumentAttrs)
			attrsList = attrsList.concat(responsibleAttrs)
			attrsList = attrsList.concat(counterpartyAttrs)

			attrsList = attrsList.concat(portfolioDynamicAttrsFormatted)
			attrsList = attrsList.concat(complexTransactionDynamicAttrsFormatted)
			attrsList = attrsList.concat(responsibleDynamicAttrsFormatted)
			attrsList = attrsList.concat(counterpartyDynmicAttrsFormatted)

			// instruments

			attrsList = attrsList.concat(linkedInstrumentAttrs)
			attrsList = attrsList.concat(allocationBalanceAttrs)
			attrsList = attrsList.concat(allocationPlAttrs)

			attrsList = attrsList.concat(instrumentDynamicAttrsFormatted)
			attrsList = attrsList.concat(linkedInstrumentDynamicAttrsFormatted)
			attrsList = attrsList.concat(allocationBalanceDynamicAttrsFormatted)
			attrsList = attrsList.concat(allocationPlDnymaicAttrsFormatted)

			// currencies

			attrsList = attrsList.concat(transactionCurrencyAttrs)
			attrsList = attrsList.concat(settlementCurrencyAttrs)

			// accounts

			attrsList = attrsList.concat(accountPositionAttrs)
			attrsList = attrsList.concat(accountCashAttrs)
			attrsList = attrsList.concat(accountInterimAttrs)

			attrsList = attrsList.concat(accountPositionDynamicAttrsFormatted)
			attrsList = attrsList.concat(accountCashDynamicAttrsFormatted)
			attrsList = attrsList.concat(accountInterimDynamicAttrsFormatted)

			// strategies

			attrsList = attrsList.concat(strategy1cashAttrs)
			attrsList = attrsList.concat(strategy1positionAttrs)
			attrsList = attrsList.concat(strategy2cashAttrs)
			attrsList = attrsList.concat(strategy2positionAttrs)
			attrsList = attrsList.concat(strategy3cashAttrs)
			attrsList = attrsList.concat(strategy3positionAttrs)

			var captions = {
				10: 'String',
				20: 'Number',
				30: 'String',
				40: 'Date',
			}

			result = attrsList.map(function (attr) {
				return {
					name: 'Column: ' + attr.name + ' (' + attr.key + ')',
					description:
						'Column Name: ' +
						attr.name +
						'\nReference (key ID): ' +
						attr.key +
						'\nValue Type: ' +
						captions[attr.value_type],
					groups: 'input',
					func: attr.key,
					validation: {
						func: attr.key,
					},
				}
			})

			resolve(result)
		})
	}

	vm.getCustomFields = function () {
		return new Promise(function (resolve, reject) {
			customFieldService.getList(vm.entityType).then(function (data) {
				var captions = {
					10: 'String',
					20: 'Number',
					30: 'String',
					40: 'Date',
				}

				var result = data.results.map(function (item) {
					return {
						name: 'Custom Column: ' + item.name,
						description:
							'Custom Column: ' +
							item.name +
							' (' +
							item.user_code +
							') :: ' +
							captions[item.value_type] +
							'\n' +
							item.notes +
							'\nExpression: \n' +
							item.expr,
						groups: 'custom_field',
						func: 'custom_fields.' + item.user_code,
						validation: {
							func: 'custom_fields.' + item.user_code,
						},
					}
				})

				resolve(result)
			})
		})
	}

	vm.getInputFunctions = function (entityType) {
		return new Promise(function (resolve, reject) {
			var promises = []

			if (entityType === 'balance-report') {
				promises.push(vm.getBalanceReportAttrs())
			}

			if (entityType === 'pl-report') {
				promises.push(vm.getBalanceReportAttrs())
			}

			if (entityType === 'transaction-report') {
				promises.push(vm.getTransactionReportAttrs())
			}

			promises.push(vm.getCustomFields())

			Promise.all(promises).then(function (data) {
				resolve(data)
			})
		})
	}

	vm.init = function () {
		vm.getInputFunctions(vm.entityType).then(function (data) {
			vm.inputsFunctions = data



			vm.readyStatus.content = true

			$scope.$apply()
		})
	}

	vm.init()
}
