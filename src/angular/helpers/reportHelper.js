/**
 * Created by szhitenev on 13.02.2017.
 */

import modelService from '../services/modelService'
/**
 * Report Viewer Helper.
 * @module reportHelper
 */
export default function (expressionService) {
	var models = modelService.getModelsWithAttributes()

	function findEntityObject(report, propertyName, id) {
		var result = null

		if (report[propertyName]) {
			report[propertyName].forEach(function (item) {
				if (propertyName === 'transaction_classes') {
					if (item.value === id) {
						result = item
					}
				} else {
					if (item.id === id) {
						result = item
					}
				}
			})
		}

		return result
	}

	var injectIntoItems = function (items, reportOptions, entityType) {
		items.forEach(function (item) {
			//console.error('item', item);

			if (item.instrument && reportOptions.item_instruments.length) {
				item.instrument_object = findEntityObject(
					reportOptions,
					'item_instruments',
					item.instrument
				)

				if (item.instrument_object.instrument_type) {
					item.instrument_object.instrument_type_object = findEntityObject(
						reportOptions,
						'item_instrument_types',
						item.instrument_object.instrument_type
					)
				}

				if (item.instrument_object.pricing_currency) {
					item.instrument_object.pricing_currency_object = findEntityObject(
						reportOptions,
						'item_currencies',
						item.instrument_object.pricing_currency
					)
				}

				if (item.instrument_object.accrued_currency) {
					item.instrument_object.accrued_currency_object = findEntityObject(
						reportOptions,
						'item_currencies',
						item.instrument_object.accrued_currency
					)
				}
			}

			if (item.linked_instrument && reportOptions.item_instruments.length) {
				item.linked_instrument_object = findEntityObject(
					reportOptions,
					'item_instruments',
					item.linked_instrument
				)

				if (item.linked_instrument_object.instrument_type) {
					item.linked_instrument_object.instrument_type_object =
						findEntityObject(
							reportOptions,
							'item_instrument_types',
							item.linked_instrument_object.instrument_type
						)
				}
			}

			if (item.entry_instrument && reportOptions.item_instruments.length) {
				item.entry_instrument_object = findEntityObject(
					reportOptions,
					'item_instruments',
					item.entry_instrument
				)

				if (item.entry_instrument_object.instrument_type) {
					item.entry_instrument_object.instrument_type_object =
						findEntityObject(
							reportOptions,
							'item_instrument_types',
							item.entry_instrument_object.instrument_type
						)
				}
			}

			if (item.allocation_balance && reportOptions.item_instruments.length) {
				item.allocation_balance_object = findEntityObject(
					reportOptions,
					'item_instruments',
					item.allocation_balance
				)

				if (item.allocation_balance_object.instrument_type) {
					item.allocation_balance_object.instrument_type_object =
						findEntityObject(
							reportOptions,
							'item_instrument_types',
							item.allocation_balance_object.instrument_type
						)
				}
			}

			if (item.allocation && reportOptions.item_instruments.length) {
				item.allocation_object = findEntityObject(
					reportOptions,
					'item_instruments',
					item.allocation
				)

				if (item.allocation_object.instrument_type) {
					item.allocation_object.instrument_type_object = findEntityObject(
						reportOptions,
						'item_instrument_types',
						item.allocation_object.instrument_type
					)
				}
			}

			if (item.allocation_pl && reportOptions.item_instruments.length) {
				item.allocation_pl_object = findEntityObject(
					reportOptions,
					'item_instruments',
					item.allocation_pl
				)

				if (item.allocation_pl_object.instrument_type) {
					item.allocation_pl_object.instrument_type_object = findEntityObject(
						reportOptions,
						'item_instrument_types',
						item.allocation_pl_object.instrument_type
					)
				}
			}

			//item.instrument_pricing_currency_history_object = findEntityObject(reportOptions, 'item_currencies');
			//item.instrument_price_history_object = findEntityObject(reportOptions, 'item_currencies');

			if (item.account && reportOptions.item_accounts.length) {
				item.account_object = findEntityObject(
					reportOptions,
					'item_accounts',
					item.account
				)

				if (item.account_object.type) {
					item.account_object.type_object = findEntityObject(
						reportOptions,
						'item_account_types',
						item.account_object.type
					)
				}
			}
			if (item.account_cash && reportOptions.item_accounts.length) {
				item.account_cash_object = findEntityObject(
					reportOptions,
					'item_accounts',
					item.account_cash
				)
			}
			if (item.account_interim && reportOptions.item_accounts.length) {
				item.account_interim_object = findEntityObject(
					reportOptions,
					'item_accounts',
					item.account_interim
				)
			}
			if (item.account_position && reportOptions.item_accounts.length) {
				item.account_position_object = findEntityObject(
					reportOptions,
					'item_accounts',
					item.account_position
				)
			}
			if (item.counterparty && reportOptions.item_counterparties.length) {
				item.counterparty_object = findEntityObject(
					reportOptions,
					'item_counterparties',
					item.counterparty
				)
			}
			if (item.responsible && reportOptions.item_responsibles.length) {
				item.responsible_object = findEntityObject(
					reportOptions,
					'item_responsibles',
					item.responsible
				)
			}

			// entry

			if (item.entry_account && reportOptions.item_accounts.length) {
				item.entry_account_object = findEntityObject(
					reportOptions,
					'item_accounts',
					item.entry_account
				)
			}

			if (item.entry_strategy && reportOptions.item_strategies1.length) {
				item.entry_strategy_object = findEntityObject(
					reportOptions,
					'item_strategies1',
					item.entry_strategy
				)
			}

			if (
				item.complex_transaction &&
				reportOptions.item_complex_transactions.length
			) {
				item.complex_transaction_object = findEntityObject(
					reportOptions,
					'item_complex_transactions',
					item.complex_transaction
				)
			}

			if (
				item.transaction_class &&
				reportOptions.item_transaction_classes.length
			) {
				item.transaction_class_object = findEntityObject(
					reportOptions,
					'item_transaction_classes',
					item.transaction_class
				)
			}

			if (item.portfolio && reportOptions.item_portfolios.length) {
				item.portfolio_object = findEntityObject(
					reportOptions,
					'item_portfolios',
					item.portfolio
				)
			}

			if (item.transaction_currency && reportOptions.item_currencies.length) {
				item.transaction_currency_object = findEntityObject(
					reportOptions,
					'item_currencies',
					item.transaction_currency
				)
			}
			if (item.settlement_currency && reportOptions.item_currencies.length) {
				item.settlement_currency_object = findEntityObject(
					reportOptions,
					'item_currencies',
					item.settlement_currency
				)
			}

			if (item.currency && reportOptions.item_currencies.length) {
				item.currency_object = findEntityObject(
					reportOptions,
					'item_currencies',
					item.currency
				)
			}

			if (item.entry_currency && reportOptions.item_currencies.length) {
				item.entry_currency_object = findEntityObject(
					reportOptions,
					'item_currencies',
					item.entry_currency
				)
			}

			if (item.exposure_currency && reportOptions.item_currencies.length) {
				item.exposure_currency_object = findEntityObject(
					reportOptions,
					'item_currencies',
					item.exposure_currency
				)
			}

			if (item.pricing_currency && reportOptions.item_currencies.length) {
				item.pricing_currency_object = findEntityObject(
					reportOptions,
					'item_currencies',
					item.pricing_currency
				)
			}

			if (item.accrued_currency && reportOptions.item_currencies.length) {
				item.accrued_currency_object = findEntityObject(
					reportOptions,
					'item_currencies',
					item.accrued_currency
				)
			}

			//item.pricing_currency_object = findEntityObject(reportOptions, 'item_currencies');
			//item.pricing_currency_history_object = findEntityObject(reportOptions, 'item_currencies');
			//item.report_currency_history_object = findEntityObject(reportOptions, 'item_currencies');

			if (item.strategy1 && reportOptions.item_strategies1.length) {
				item.strategy1_object = findEntityObject(
					reportOptions,
					'item_strategies1',
					item.strategy1
				)

				console.log('Strategy injected')
			}

			if (item.strategy2 && reportOptions.item_strategies2.length) {
				item.strategy2_object = findEntityObject(
					reportOptions,
					'item_strategies2',
					item.strategy2
				)
			}
			if (item.strategy3 && reportOptions.item_strategies3.length) {
				item.strategy3_object = findEntityObject(
					reportOptions,
					'item_strategies3',
					item.strategy3
				)
			}
			if (item.strategy1_cash && reportOptions.item_strategies1.length) {
				item.strategy1_cash_object = findEntityObject(
					reportOptions,
					'item_strategies1',
					item.strategy1_cash
				)
			}
			if (item.strategy1_position && reportOptions.item_strategies1.length) {
				item.strategy1_position_object = findEntityObject(
					reportOptions,
					'item_strategies1',
					item.strategy1_position
				)
			}
			if (item.strategy2_cash && reportOptions.item_strategies2.length) {
				item.strategy2_cash_object = findEntityObject(
					reportOptions,
					'item_strategies2',
					item.strategy2_cash
				)
			}
			if (item.strategy2_position && reportOptions.item_strategies2.length) {
				item.strategy2_position_object = findEntityObject(
					reportOptions,
					'item_strategies2',
					item.strategy2_position
				)
			}
			if (item.strategy3_cash && reportOptions.item_strategies3.length) {
				item.strategy3_cash_object = findEntityObject(
					reportOptions,
					'item_strategies3',
					item.strategy3_cash
				)
			}
			if (item.strategy3_position && reportOptions.item_strategies3.length) {
				item.strategy3_position_object = findEntityObject(
					reportOptions,
					'item_strategies3',
					item.strategy3_position
				)
			}

			if (item.custom_fields) {
				item.custom_fields_object = []

				item.custom_fields.forEach(function (localCustomField) {
					reportOptions.custom_fields_object.forEach(function (
						reportCustomField
					) {
						if (reportCustomField.id == localCustomField.custom_field) {
							item.custom_fields_object.push(reportCustomField)
						}
					})
				})
			}

			if (entityType === 'balance-report') {
				item.date = reportOptions.report_date
			} else if (entityType === 'pl-report') {
				item.pl_first_date = reportOptions.pl_first_date
				item.report_date = reportOptions.report_date
			}
		})

		// console.log('INJECTED', items);

		return items
	}

	var unwrapRelationsAsFlatDicts = function (items) {
		var result = {}

		for (const item of items) {
			var result_item = Object.assign({}, item)

			if (item.hasOwnProperty('attributes')) {
				var resultKey = 'attributes'
				var localResultKey

				item.attributes.forEach(function (attribute) {
					// localResultKey = resultKey + '.' + attribute.attribute_type;
					localResultKey =
						resultKey + '.' + attribute.attribute_type_object.user_code

					result_item[localResultKey] = null

					if (attribute.attribute_type_object.value_type === 10) {
						result_item[localResultKey] = attribute.value_string
					}

					if (attribute.attribute_type_object.value_type === 20) {
						result_item[localResultKey] = attribute.value_float
					}

					if (attribute.attribute_type_object.value_type === 30) {
						if (attribute.classifier_object) {
							result_item[localResultKey] = attribute.classifier_object.name
						}
					}

					if (attribute.attribute_type_object.value_type === 40) {
						result_item[localResultKey] = attribute.value_date
					}
				})
			}

			result[item.id] = result_item
		}

		return result
	}

	var joinFlatRelationToItem = function (item, key, relation) {
		// console.log('joinFlatRelationToItem.key', key)
		// console.log('joinFlatRelationToItem.item', item[key])

		if (relation) {
			Object.keys(relation).forEach(function (relation_key) {
				item[key + '.' + relation_key] = relation[relation_key]
			})
		}

		return item
	}

	var injectIntoItemsV2 = function (items, reportOptions, entityType) {
		// reportOptions.item_instruments

		var instruments_as_dict = unwrapRelationsAsFlatDicts(
			reportOptions.item_instruments
		)
		var accounts_as_dict = unwrapRelationsAsFlatDicts(
			reportOptions.item_accounts
		)
		var currencies_as_dict = unwrapRelationsAsFlatDicts(
			reportOptions.item_currencies
		)
		var portfolios_as_dict = unwrapRelationsAsFlatDicts(
			reportOptions.item_portfolios
		)

		console.log('portfolios_as_dict', portfolios_as_dict)

		var counterparties_as_dict = null
		if (reportOptions.item_counterparties) {
			counterparties_as_dict = unwrapRelationsAsFlatDicts(
				reportOptions.item_counterparties
			)
		}
		var responsibles_as_dict = null
		if (reportOptions.item_counterparties) {
			responsibles_as_dict = unwrapRelationsAsFlatDicts(
				reportOptions.item_responsibles
			)
		}
		var strategies1_as_dict = unwrapRelationsAsFlatDicts(
			reportOptions.item_strategies1
		)
		var strategies2_as_dict = unwrapRelationsAsFlatDicts(
			reportOptions.item_strategies2
		)
		var strategies3_as_dict = unwrapRelationsAsFlatDicts(
			reportOptions.item_strategies3
		)
		var transaction_classes_as_dict = null

		if (reportOptions.item_transaction_classes) {
			transaction_classes_as_dict = unwrapRelationsAsFlatDicts(
				reportOptions.item_transaction_classes
			)
		}

		items.forEach(function (item) {
			if (item.instrument) {
				joinFlatRelationToItem(
					item,
					'instrument',
					instruments_as_dict[item.instrument]
				)
			}

			if (item.allocation) {
				joinFlatRelationToItem(
					item,
					'allocation',
					instruments_as_dict[item.allocation]
				)
			}

			if (item.allocation_pl) {
				joinFlatRelationToItem(
					item,
					'allocation_pl',
					instruments_as_dict[item.allocation_pl]
				)
			}

			if (item.allocation_balance) {
				joinFlatRelationToItem(
					item,
					'allocation_balance',
					instruments_as_dict[item.allocation_balance]
				)
			}

			if (item.linked_instrument) {
				joinFlatRelationToItem(
					item,
					'linked_instrument',
					instruments_as_dict[item.linked_instrument]
				)
			}

			// Accounts

			if (item.account) {
				joinFlatRelationToItem(item, 'account', accounts_as_dict[item.account])
			}

			if (item.account_cash) {
				joinFlatRelationToItem(
					item,
					'account_cash',
					accounts_as_dict[item.account_cash]
				)
			}

			if (item.account_interim) {
				joinFlatRelationToItem(
					item,
					'account_interim',
					accounts_as_dict[item.account_interim]
				)
			}

			if (item.account_position) {
				joinFlatRelationToItem(
					item,
					'account_position',
					accounts_as_dict[item.account_position]
				)
			}

			// Currencies

			if (item.currency) {
				joinFlatRelationToItem(
					item,
					'currency',
					currencies_as_dict[item.currency]
				)
			}

			if (item.transaction_currency) {
				joinFlatRelationToItem(
					item,
					'transaction_currency',
					currencies_as_dict[item.transaction_currency]
				)
			}

			if (item.settlement_currency) {
				joinFlatRelationToItem(
					item,
					'settlement_currency',
					currencies_as_dict[item.settlement_currency]
				)
			}

			if (item.accrued_currency) {
				joinFlatRelationToItem(
					item,
					'accrued_currency',
					currencies_as_dict[item.accrued_currency]
				)
			}

			if (item.pricing_currency) {
				joinFlatRelationToItem(
					item,
					'pricing_currency',
					currencies_as_dict[item.pricing_currency]
				)
			}

			if (item.exposure_currency) {
				joinFlatRelationToItem(
					item,
					'exposure_currency',
					currencies_as_dict[item.exposure_currency]
				)
			}

			// entry (in transaction report)

			if (item.entry_account) {
				joinFlatRelationToItem(
					item,
					'entry_account',
					accounts_as_dict[item.entry_account]
				)
			}

			if (item.entry_strategy) {
				joinFlatRelationToItem(
					item,
					'entry_strategy',
					strategies1_as_dict[item.entry_strategy]
				)
			}

			if (item.entry_currency) {
				joinFlatRelationToItem(
					item,
					'entry_currency',
					currencies_as_dict[item.entry_currency]
				)
			}

			if (item.entry_instrument) {
				joinFlatRelationToItem(
					item,
					'entry_instrument',
					instruments_as_dict[item.entry_instrument]
				)
			}

			// Other

			if (item.transaction_class && transaction_classes_as_dict) {
				joinFlatRelationToItem(
					item,
					'transaction_class',
					transaction_classes_as_dict[item.transaction_class]
				)
			}

			if (item.counterparty && counterparties_as_dict) {
				joinFlatRelationToItem(
					item,
					'counterparty',
					counterparties_as_dict[item.counterparty]
				)
			}

			if (item.responsible && responsibles_as_dict) {
				joinFlatRelationToItem(
					item,
					'responsible',
					responsibles_as_dict[item.responsible]
				)
			}

			if (item.portfolio) {
				joinFlatRelationToItem(
					item,
					'portfolio',
					portfolios_as_dict[item.portfolio]
				)
			}

			if (item.strategy1) {
				joinFlatRelationToItem(
					item,
					'strategy1',
					strategies1_as_dict[item.strategy1]
				)
			}

			if (item.strategy1_cash) {
				joinFlatRelationToItem(
					item,
					'strategy1_cash',
					strategies1_as_dict[item.strategy1_cash]
				)
			}

			if (item.strategy1_position) {
				joinFlatRelationToItem(
					item,
					'strategy1_position',
					strategies1_as_dict[item.strategy1_position]
				)
			}

			if (item.strategy2) {
				joinFlatRelationToItem(
					item,
					'strategy2',
					strategies2_as_dict[item.strategy2]
				)
			}

			if (item.strategy2_cash) {
				joinFlatRelationToItem(
					item,
					'strategy2_cash',
					strategies2_as_dict[item.strategy2_cash]
				)
			}

			if (item.strategy2_position) {
				joinFlatRelationToItem(
					item,
					'strategy2_position',
					strategies2_as_dict[item.strategy2_position]
				)
			}

			if (item.strategy3) {
				joinFlatRelationToItem(
					item,
					'strategy3',
					strategies3_as_dict[item.strategy3]
				)
			}

			if (item.strategy3_cash) {
				joinFlatRelationToItem(
					item,
					'strategy3_cash',
					strategies3_as_dict[item.strategy3_cash]
				)
			}

			if (item.strategy3_position) {
				joinFlatRelationToItem(
					item,
					'strategy3_position',
					strategies3_as_dict[item.strategy3_position]
				)
			}

			if (item.custom_fields) {
				item.custom_fields.forEach(function (localCustomField) {
					item['custom_fields.' + localCustomField.user_code] =
						localCustomField.value
				})
			}

			//console.error('item', item);

			if (entityType === 'balance-report') {
				item.date = reportOptions.report_date
			} else if (entityType === 'pl-report') {
				item.pl_first_date = reportOptions.pl_first_date
				item.report_date = reportOptions.report_date
			}
		})

		// console.log('INJECTED', items);

		return items
	}

	function calculateMarketValueAndExposurePercents(items, reportOptions) {
		var groups = {}

		items.forEach(function (item) {
			var key = '-'

			// TODO wtf magic is here????
			// NEED REFACTOR AND ANALYSIS
			// if (item[reportOptions.calculationGroup]) {
			//     key = item[reportOptions.calculationGroup];
			// }
			//
			if (!groups.hasOwnProperty(key)) {
				groups[key] = []
			}

			groups[key].push(item)
		})

		var groupsTotalMarketValue = {}
		var groupsTotalExposure = {}

		Object.keys(groups).forEach(function (key) {
			console.log('key', key)

			groups[key].forEach(function (item) {
				if (!groupsTotalMarketValue.hasOwnProperty(key)) {
					groupsTotalMarketValue[key] = 0
				}

				if (!groupsTotalExposure.hasOwnProperty(key)) {
					groupsTotalExposure[key] = 0
				}

				if (item.market_value) {
					groupsTotalMarketValue[key] =
						groupsTotalMarketValue[key] + parseFloat(item.market_value)
				}

				if (item.exposure) {
					groupsTotalExposure[key] =
						groupsTotalExposure[key] + parseFloat(item.exposure)
				}
			})
		})

		console.log('calculateMarketValueAndExposurePercents.groups', groups)
		console.log(
			'calculateMarketValueAndExposurePercents.groupsTotalMarketValue',
			groupsTotalMarketValue
		)

		return items.map(function (item) {
			var key = '-'

			// if (item[reportOptions.calculationGroup]) {
			//     key = item[reportOptions.calculationGroup];
			// }

			if (item.market_value) {
				var percent = (
					(item.market_value / groupsTotalMarketValue[key]) *
					100
				).toFixed(10)
				item.market_value_percent = parseFloat(percent)
			} else {
				item.market_value_percent = 0
			}

			if (item.exposure) {
				var percent = (
					(item.exposure / groupsTotalExposure[key]) *
					100
				).toFixed(10)
				item.exposure_percent = parseFloat(percent)
			} else {
				item.exposure_percent = 0
			}

			return item
		})
	}

	function getContentTypesWithDynamicAttributes() {
		return [
			'accounts.account',
			'counterparties.counterparty',
			'counterparties.responsible',
			'currencies.currency',
			'instruments.instrument',
			'portfolios.portfolio',
			'transactions.complextransaction',
		]
	}

	var contentTypesWithDynamicAttributes = getContentTypesWithDynamicAttributes()

	/**
	 * Save to result object all props from relation key in source object
	 * @param {object} result - result flat object.
	 * @param {string} parentKey - parent key (e.g. instrument.instrument_type).
	 * @param {string} contentType - content type.
	 * @param {object} source - original item instance.
	 * @return {Object[]} Flat object.
	 * @memberof module:reportHelper
	 */
	var recursiveUnwrapRelation = function (
		result,
		parentKey,
		contentType,
		source,
		level
	) {
		// var attributes = modelService.getAttributesByContentType(contentType);

		// console.log('contentType', contentType)
		var attributes = models[contentType] // Performance improvement trick,
		var resultKey

		if (models.hasOwnProperty(contentType)) {
			attributes.forEach(function (attribute) {
				resultKey = parentKey + '.' + attribute.key

				if (
					attribute.value_type === 'field' &&
					attribute.code === 'user_code' &&
					source[attribute.key] &&
					source[attribute.key + '_object']
				) {
					result[resultKey + '.id'] = source[attribute.key + '_object'].id

					// level = level + 1
					//
					// if (level < 2) {
					//     recursiveUnwrapRelation(result, resultKey, attribute.value_content_type, source[attribute.key + '_object'], level)
					// }
				} else {
					if (
						attribute.value_type === 'field' &&
						attribute.code === 'user_code' &&
						source[attribute.key] &&
						source[attribute.key + '_object']
					) {
						result[resultKey + '.name'] = source[attribute.key + '_object'].name
					} else {
						if (attribute.value_type !== 'mc_field') {
							result[resultKey] = source[attribute.key]
						}
					}
				}
			})

			// var contentTypesWithDynamicAttributes = getContentTypesWithDynamicAttributes(); # performance trick

			if (contentTypesWithDynamicAttributes.indexOf(contentType) !== -1) {
				unwrapDynamicAttributes(result, parentKey, contentType, source)
			}
		}
	}

	var unwrapDynamicAttributes = function (
		result,
		parentKey,
		contentType,
		source
	) {
		// console.log('unwrapDynamicAttributes.source', source);

		if (source.hasOwnProperty('attributes')) {
			var resultKey = parentKey + '.attributes'
			var localResultKey

			source.attributes.forEach(function (attribute) {
				// localResultKey = resultKey + '.' + attribute.attribute_type;
				localResultKey =
					resultKey + '.' + attribute.attribute_type_object.user_code

				result[localResultKey] = null

				if (attribute.attribute_type_object.value_type === 10) {
					result[localResultKey] = attribute.value_string
				}

				if (attribute.attribute_type_object.value_type === 20) {
					result[localResultKey] = attribute.value_float
				}

				if (attribute.attribute_type_object.value_type === 30) {
					if (attribute.classifier_object) {
						result[localResultKey] = attribute.classifier_object.name
					}
				}

				if (attribute.attribute_type_object.value_type === 40) {
					result[localResultKey] = attribute.value_date
				}
			})
		}
	}

	var unwrapCustomFields = function (result) {
		if (result.hasOwnProperty('custom_fields')) {
			result.custom_fields.forEach(function (customField) {
				var key = 'custom_fields.' + customField.user_code

				result[key] = customField.value
			})
		}

		return result
	}

	/**
	 * Convert single object to a flat object.
	 * @param {object} item.
	 * @return {Object[]} Flat object.
	 * @memberof module:reportHelper
	 */
	var unwrapItem = function (item) {
		var result = {}
		var keys = Object.keys(item)

		var keysToUnwrap = {
			instrument: 'instruments.instrument',
			entry_instrument: 'instruments.instrument',
			allocation: 'instruments.instrument',
			allocation_balance: 'instruments.instrument',
			allocation_pl: 'instruments.instrument',
			linked_instrument: 'instruments.instrument',
			account: 'accounts.account',
			entry_account: 'accounts.account',
			account_cash: 'accounts.account',
			account_interim: 'accounts.account',
			account_position: 'accounts.account',
			currency: 'currencies.currency',
			entry_currency: 'currencies.currency',
			pricing_currency: 'currencies.currency',
			exposure_currency: 'currencies.currency',
			accrued_currency: 'currencies.currency',
			settlement_currency: 'currencies.currency',
			transaction_currency: 'currencies.currency',
			portfolio: 'portfolios.portfolio',
			complex_transaction: 'transactions.complextransaction',
			transaction_class: 'transactions.transactionclass',
			responsible: 'counterparties.responsible',
			counterparty: 'counterparties.counterparty',
			entry_strategy: 'strategies.strategy1',
			strategy1: 'strategies.strategy1',
			strategy2: 'strategies.strategy2',
			strategy3: 'strategies.strategy3',
			strategy1_cash: 'strategies.strategy1',
			strategy1_position: 'strategies.strategy1',
			strategy2_cash: 'strategies.strategy2',
			strategy2_position: 'strategies.strategy2',
			strategy3_cash: 'strategies.strategy3',
			strategy3_position: 'strategies.strategy3',
			//TODO add more keys to map
		}

		var level = 0

		keys.forEach(function (key) {
			if (
				keysToUnwrap.hasOwnProperty(key) &&
				item[key] &&
				item[key + '_object']
			) {
				result[key + '.id'] = item[key]

				recursiveUnwrapRelation(
					result,
					key,
					keysToUnwrap[key],
					item[key + '_object'],
					level
				)
			} else {
				result[key] = item[key]
			}
		})

		result = unwrapCustomFields(result)

		return result
	}

	/**
	 * Get list of entity attributes and all children attributes.
	 * @param {Object[]} items - that were received from REST API.
	 * @param {object} reportOptions - report options.
	 * @return {Object[]} Array of flat objects.
	 * @memberof module:reportHelper
	 */
	var convertItemsToFlat = function (items) {
		items = items.map(function (item) {
			return unwrapItem(item)
		})

		return items
	}

	var extendAttributes = function (items, attributeExtensions) {
		if (attributeExtensions) {
			items = items.map(function (item) {
				attributeExtensions.forEach(function (extension) {
					var contentType
					var oppositeContentType
					var base
					var oppositeBase

					if (item.item_type === 1) {
						// instrument extension

						contentType = 'instruments.instrument'
						oppositeContentType = 'currencies.currency'
						base = 'instrument'
						oppositeBase = 'currency'

						if (extension.content_type_from === oppositeContentType) {
							if (extension.key_to) {
								item[oppositeBase + '.' + extension.key_from] =
									item[base + '.' + extension.key_to]
							} else {
								if (extension.value_to) {
									item[oppositeBase + '.' + extension.key_from] =
										extension.value_to
								}
							}
						}
					}

					if (item.item_type === 2) {
						// currency extension

						contentType = 'currencies.currency'
						oppositeContentType = 'instruments.instrument'
						base = 'currency'
						oppositeBase = 'instrument'

						if (extension.content_type_from === oppositeContentType) {
							if (extension.key_to) {
								item[oppositeBase + '.' + extension.key_from] =
									item[base + '.' + extension.key_to]
							} else {
								if (extension.value_to) {
									item[oppositeBase + '.' + extension.key_from] =
										extension.value_to
								}
							}
						}
					}
				})

				return item
			})
		}

		return items
	}

	/*var reportOptionsTemporaryPropsList = [
        'items',
        'item_complex_transactions',
        'item_transaction_classes',
        'item_counterparties',
        'item_responsibles',
        'item_strategies3',
        'item_strategies2',
        'item_strategies1',
        'item_portfolios',
        'item_instruments',
        'item_instrument_types',
        'item_instrument_pricings',
        'item_instrument_accruals',
        'item_currency_fx_rates',
        'item_currencies',
        'item_accounts',
        'item_account_types',
        'custom_fields',
        'custom_fields_object',
        'save_report',
        'report_uuid',
    ];*/
	const reportOptionsConstantProps = [
		'account_mode',
		'accounts',
		'accounts_cash',
		'accounts_cash_object',
		'accounts_object',
		'accounts_position',
		'accounts_position_object',
		'allocation_detailing',
		'allocation_mode',
		'approach_multiplier',
		'calculate_pl',
		'calculationGroup',
		'complex_transaction_statuses_filter',
		'cost_method',
		'cost_method_object',
		'custom_fields_to_calculate',
		'date_field',
		'depth_level',
		'filters',
		'pl_include_zero',
		'portfolio_mode',
		'portfolios',
		'portfolios_object',
		'pricing_policy',
		'pricing_policy_object',
		'report_currency',
		'report_currency_object',
		'pl_first_date',
		'report_date',
		'begin_date',
		'end_date',
		'report_type',
		'show_balance_exposure_details',
		'show_transaction_details',
		'strategies1',
		'strategies1_object',
		'strategies2',
		'strategies2_object',
		'strategies3',
		'strategies3_object',
		'strategy1_mode',
		'strategy2_mode',
		'strategy3_mode',
		'table_font_size',
		'transaction_classes',
		'transaction_classes_object',
		'end_date',
		'begin_date',
	]

	/**
	 * Delete temporary properties from report options.
	 * @param reportOptions {Object}
	 * @return reportOptions {Object}
	 */
	var cleanReportOptionsFromTmpProps = function (reportOptions) {
		/*reportOptionsTemporaryPropsList.forEach(propName => {
            delete reportOptions[propName]
        });*/
		Object.keys(reportOptions).forEach((prop) => {
			if (!reportOptionsConstantProps.includes(prop)) {
				delete reportOptions[prop]
			}
		})

		return reportOptions
	}

	const reportDateProperties = {
		'reports.balancereport': [null, 'report_date'],
		'reports.plreport': ['pl_first_date', 'report_date'],
		'reports.transactionreport': ['begin_date', 'end_date'],
	}

	/**
	 *
	 * @param {String} entityType
	 * @returns {Array}
	 * @memberof module:reportHelper
	 */
	const getDateProperties = function (entityType) {
		return reportDateProperties[entityType]
	}

	/**
	 *
	 * @param reportOptions
	 * @param reportLayoutOptions
	 * @param {string} dateKey - name of property where date stored
	 * @returns {Promise<string|null>}
	 * @memberof module:reportHelper
	 */
	var getReportDate = function (reportOptions, reportLayoutOptions, dateKey) {
		var dateFromKeys = ['begin_date', 'pl_first_date']
		var dateToKeys = ['report_date', 'end_date']

		var dateFrom = dateFromKeys.indexOf(dateKey) > -1
		var dateTo = dateToKeys.indexOf(dateKey) > -1
		var dateExpr

		if (!dateFrom && !dateTo) {
			console.error('key is not report date key: ' + dateKey)

			return new Promise(function (resolve) {
				resolve(null)
			})
		}

		if (reportLayoutOptions && reportLayoutOptions.datepickerOptions) {
			if (dateFrom) {
				dateExpr =
					reportLayoutOptions.datepickerOptions.reportFirstDatepicker.expression
			} else if (dateTo) {
				dateExpr =
					reportLayoutOptions.datepickerOptions.reportLastDatepicker.expression
			}

			if (dateExpr) {
				return new Promise(function (resolve) {
					expressionService
						.getResultOfExpression({ expression: dateExpr })
						.then(function (data) {
							resolve(data.result)
						})
						.catch(function (error) {
							console.error(
								'Error occurred while trying to evaluate: ' + dateExpr,
								error
							)
							resolve(null)
						})
				})
			}
		}

		return new Promise(function (resolve) {
			resolve(reportOptions[dateKey])
		})
	}

	return {
		convertItemsToFlat: convertItemsToFlat,
		injectIntoItems: injectIntoItems,
		injectIntoItemsV2: injectIntoItemsV2,
		extendAttributes: extendAttributes,
		calculateMarketValueAndExposurePercents:
			calculateMarketValueAndExposurePercents,
		cleanReportOptionsFromTmpProps: cleanReportOptionsFromTmpProps,

		getDateProperties: getDateProperties,
		getReportDate: getReportDate,
	}
}
