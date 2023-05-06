import { defineStore } from "pinia";

/** Attributes from balance report that belong to group "reports.balancereportperformance" */
const balancePerformanceKeys = [
	"net_position_return",
	"net_position_return_loc",
	"position_return",
	"position_return_loc",
	"daily_price_change",
	"mtd_price_change",
	"principal_fx","principal_fx_loc",
	"principal_fixed",
	"principal_fixed_loc",
	"carry_fx",
	"carry_fx_loc",
	"carry_fixed",
	"carry_fixed_loc",
	"overheads_fx",
	"overheads_fx_loc",
	"overheads_fixed",
	"overheads_fixed_loc",
	"principal",
	"carry",
	"overheads",
	"total",
	"principal_loc",
	"carry_loc",
	"overheads_loc",
	"total_loc",
	"total_fx",
	"total_fx_loc",
	"total_fixed",
	"total_fixed_loc",
];
/** Attributes from balance report that belong to group "reports.balancereportmismatch" */
const balanceMismatchKeys = ["mismatch","mismatch_portfolio","mismatch_account"];

const dynamicAttrsRouteOpts = {
	'portfolios.portfolio': 'portfolioAttrTypeList',
	'accounts.account': 'accountAttrTypeList',
	'instruments.instrument': 'instrumentAttrTypeList',
	'counterparties.responsible': 'responsibleAttrTypeList',
	'counterparties.counterparty': 'counterpartyAttrTypeList',
	'transactions.transactiontype': 'transactionTypeAttrTypeList',
	'transactions.complextransaction': 'complexTransactionAttrTypeList',
}

const customFieldsRouteOpts = {
	'reports.balancereport': 'balanceReportCustomFieldList',
	'reports.plreport': 'plReportCustomFieldList',
	'reports.transactionreport': 'transactionReportCustomFieldList',
}

const ttypeUserFields  = [
	'complex_transaction.transaction_type.user_text_1', 'complex_transaction.transaction_type.user_text_2', 'complex_transaction.transaction_type.user_text_3', 'complex_transaction.transaction_type.user_text_4', 'complex_transaction.transaction_type.user_text_5',
	'complex_transaction.transaction_type.user_text_6', 'complex_transaction.transaction_type.user_text_7', 'complex_transaction.transaction_type.user_text_8', 'complex_transaction.transaction_type.user_text_9', 'complex_transaction.transaction_type.user_text_10',
	'complex_transaction.transaction_type.user_text_11', 'complex_transaction.transaction_type.user_text_12', 'complex_transaction.transaction_type.user_text_13', 'complex_transaction.transaction_type.user_text_14', 'complex_transaction.transaction_type.user_text_15',
	'complex_transaction.transaction_type.user_text_16', 'complex_transaction.transaction_type.user_text_17', 'complex_transaction.transaction_type.user_text_18', 'complex_transaction.transaction_type.user_text_19', 'complex_transaction.transaction_type.user_text_20',
	'complex_transaction.transaction_type.user_text_21', 'complex_transaction.transaction_type.user_text_22', 'complex_transaction.transaction_type.user_text_23', 'complex_transaction.transaction_type.user_text_24', 'complex_transaction.transaction_type.user_text_25',
	'complex_transaction.transaction_type.user_text_26', 'complex_transaction.transaction_type.user_text_27', 'complex_transaction.transaction_type.user_text_28', 'complex_transaction.transaction_type.user_text_29', 'complex_transaction.transaction_type.user_text_30',

	'complex_transaction.transaction_type.user_number_1', 'complex_transaction.transaction_type.user_number_2', 'complex_transaction.transaction_type.user_number_3', 'complex_transaction.transaction_type.user_number_4',
	'complex_transaction.transaction_type.user_number_5', 'complex_transaction.transaction_type.user_number_6', 'complex_transaction.transaction_type.user_number_7', 'complex_transaction.transaction_type.user_number_8',
	'complex_transaction.transaction_type.user_number_9', 'complex_transaction.transaction_type.user_number_10', 'complex_transaction.transaction_type.user_number_11', 'complex_transaction.transaction_type.user_number_12',
	'complex_transaction.transaction_type.user_number_13', 'complex_transaction.transaction_type.user_number_14', 'complex_transaction.transaction_type.user_number_15', 'complex_transaction.transaction_type.user_number_16',
	'complex_transaction.transaction_type.user_number_17', 'complex_transaction.transaction_type.user_number_18', 'complex_transaction.transaction_type.user_number_19', 'complex_transaction.transaction_type.user_number_20',

	'complex_transaction.transaction_type.user_date_1', 'complex_transaction.transaction_type.user_date_2', 'complex_transaction.transaction_type.user_date_3', 'complex_transaction.transaction_type.user_date_4', 'complex_transaction.transaction_type.user_date_5'
];

/**
 *
 * @param {string} contentType
 * @param {Object} routeOptsObj - route_opts for each content type
 * @param {string} method - 'get', 'put', 'post', 'delete'
 * @returns {string} - parameter 'route_opt' for method useApi
 */
function resolveRouteOpt(contentType, routeOptsObj, method) {
	if ( !routeOptsObj.hasOwnProperty(contentType) ) {
		throw new Error("There is no api for content_type: " + contentType)
	}

	return routeOptsObj[contentType] + '.' + method;
}

/*async function fetchAttributeTypes(contentType) {

	const res = await useApi( resolveDynamicAttrsRouteOpt(contentType, 'get') );

	if (res.error) {
		throw res.error;
	}

	return res.results;

}*/
function getAttrsCopy(attrs) {
	if (!attrs || !attrs.length) return [];

	return JSON.parse(JSON.stringify( attrs ));
}

/** Format custom fields to use in reports */
function formatCustomFields(customFields) {

	customFields = getAttrsCopy(customFields);

	customFields = customFields.map(field => {

		field.custom_field = Object.assign({}, field);

		field.key = 'custom_fields.' + field.user_code;
		field.name = 'Custom Field. ' + field.name;

		return field;

	});

	return customFields;

}

// Used by state._getCommonDynamicAttrs() in calling state.getDynamicAttrs()
const reportCommonDynamicAttrs = {
	'portfolioDAttrs': ['portfolios.portfolio', 'portfolio', 'Portfolio'],
	'accountDAttrs': ['accounts.account', 'account', 'Account'],
	'instrumentDAttrs': ['instruments.instrument', 'instrument', 'Instrument'],
	'linkedInstrumentDAttrs': ['instruments.instrument', 'linked_instrument', 'Linked Instrument'],
	/*'allocationInstrumentDAttrs': ['instruments.instrument', 'allocation', 'Allocation'],*/
}

export default defineStore({
	id: 'evAttributes',
	state: () => {
		return {
			systemAttrs: {},
			attrTypes: {},
			userFields: {}, // contains fields like user_text_1, user_number_3, etc. grouped by content type

			customFields: {
				'reports.balancereport': []
			}, // reports have them
		};
	},
	actions: {

		//# region Functions - helpers
		_getAttributesRecursive(result, currentLevel, contentType, parentKey, parentName, options) {

			// console.log('contentType', contentType);

			let attributes = getAttrsCopy( this.systemAttrs[contentType] );

			const getAttributesRecursive = this._getAttributesRecursive;

			let key;
			let name;
			let resultAttr;

			if ( !attributes ) {
				console.warn('Can\'t find attributes for content type: ' + contentType);
				return;
			}

			attributes.forEach(function (attribute) {

				name = parentName + '. ' + attribute.name;

				if (parentKey) {
					key = parentKey + '.' + attribute.key;
				} else {
					key = attribute.key;
				}

				if (attribute.value_type === 'field' && attribute.code === 'user_code') {

					if (currentLevel < options.maxDepth) {

						// console.log('attribute', attribute);

						getAttributesRecursive(result, currentLevel + 1, attribute.value_content_type, key, name, options)

					}

				} else {

					if (attribute.value_type === 'field' && attribute.code === 'user_code') {

						resultAttr = Object.assign({}, attribute);

						resultAttr.content_type = contentType;
						resultAttr.name = name + '. Name';
						resultAttr.key = key + '.name';

						result.push(resultAttr);

					} else {

						if (attribute.value_type !== 'mc_field') {

							resultAttr = Object.assign({}, attribute);

							resultAttr.content_type = contentType;
							resultAttr.name = name;
							resultAttr.key = key;

							result.push(resultAttr);

						}

					}

				}

			})

		},

		/**
		 * Get list of system attributes and all children attributes.
		 * @param {string} rootContentType - content type (e.g. instruments.instrument).
		 * @param {string} rootKey - key prefix for root level attributes.
		 * @param {string} rootName - name prefix for root level attributes.
		 * @param {object} options - all other options.
		 * @return {Object[]} Array of Attributes.
		 */
		getAllAttributesAsFlatList(rootContentType, rootKey, rootName, options) {

			let result = [];
			const defaultOptions = {
				maxDepth: 1
			};

			const _options = Object.assign({}, defaultOptions, options);

			let currentLevel = 0;

			this._getAttributesRecursive(result, currentLevel, rootContentType, rootKey, rootName, _options);

			return result;

		},

		getDynamicAttrs(contentType, rootKey, rootName) {

			if ( !this.attrTypes[contentType] ) {
				console.warn(`Attribute types for contentType: '${contentType}' not loaded`);
			}

			return getAttrsCopy( this.attrTypes[contentType] ).map(attribute => {

				let result = {};

				result.attribute_type = Object.assign({}, attribute);
				result.value_type = attribute.value_type;
				result.content_type = contentType;

				const key = attribute.user_code.split(':').pop(); // remove configuration_code and content_type
				result.key = rootKey + '.attributes.' + key;

				result.name = rootName + '. ' + attribute.name;

				return result

			});

		},

		/** Get dynamic attributes common between reports
		 * @return {Object} - data with applied dynamic attributes for portfolio, account, instrument, linked_instrument */
		_getCommonDynamicAttrs(attrsData) {
			Object.keys(reportCommonDynamicAttrs).forEach(key => {
				attrsData[key] = this.getDynamicAttrs( ...reportCommonDynamicAttrs[key] )
			})

			return attrsData;
		},

		_appendIdAttr(attrs, contentType) {

			const idAttribute = {
				"key": "id",
				"name": "Id",
				"value_type": 20
			};



			vm.attributeDataService.appendEntityAttribute('portfolio', Object.assign({}, idAttribute));
			vm.attributeDataService.appendEntityAttribute('account', Object.assign({}, idAttribute));
			vm.attributeDataService.appendEntityAttribute('currency', Object.assign({}, idAttribute));
			vm.attributeDataService.appendEntityAttribute('instrument', Object.assign({}, idAttribute));
			vm.attributeDataService.appendEntityAttribute('responsible', Object.assign({}, idAttribute));
			vm.attributeDataService.appendEntityAttribute('counterparty', Object.assign({}, idAttribute));
			vm.attributeDataService.appendEntityAttribute('transaction-type', Object.assign({}, idAttribute));
			vm.attributeDataService.appendEntityAttribute('complex-transaction', Object.assign({}, idAttribute));

		},
		//# endregion Functions - helpers

		//# region Loading attributes
		async fetchSystemAttributes() {
			let res = await useApi('systemAttributes.get');

			if (res.error) {
				throw res.error;
			}

			res['reports.balancereportperformance'] = [];
			res['reports.balancereportmismatch'] = [];

			res['reports.balancereport'] = res['reports.balancereport'].filter(attr => {

				if ( balancePerformanceKeys.includes(attr.key) ) {

					res['reports.balancereportperformance'].push(attr);
					return false;

				}

				if ( balanceMismatchKeys.includes(attr.key) ) {

					res['reports.balancereportperformance'].push(attr);
					return false;

				}

				return true;

			});

			this.systemAttrs = res;

		},
		/*getAttributeTypes(contentType) {
			if ( !this.attrTypes[contentType] ) {
				this.attrTypes[contentType] = fetchAttributeTypes(contentType)
			}

			return this.attrTypes[contentType];
		}*/
		async fetchAttributeTypes(contentType) {

			const res = await useApi( resolveRouteOpt(contentType, dynamicAttrsRouteOpts, 'get') );

			if (res.error) {
				throw res.error;
			}

			this.attrTypes[contentType] = res.results;

		},

		async getAttributeTypes(contentType) {
			if ( !this.attrTypes[contentType] ) {
				await this.fetchAttributeTypes(contentType);
			}

			return this.attrTypes[contentType];
		},

		async fetchCustomFields(contentType) {
			const res = await useApi( resolveRouteOpt(contentType, customFieldsRouteOpts, 'get') );

			if (res.error) {
				throw res.error;
			}

			this.customFields[contentType] = res.results;
		},

		async getCustomFields(contentType) {
			if ( !this.customFields[contentType] ) {
				return await this.fetchCustomFields(contentType);
			}

			return this.customFields[contentType];
		},

		async fetchUserFields(contentType) {
			const res = await useApi( resolveRouteOpt(contentType, userFieldsRouteOpts, 'get') );

			if (res.error) {
				throw res.error;
			}

			this.userFields[contentType] = res.results;
		},

		async getUserFields(contentType) {
			if ( !this.userFields[contentType] ) {
				return await this.fetchUserFields(contentType)
			}
		},
		//# endregion Loading attributes

		getBalanceReportAttributes() {

			let result = {};

			//# region System attributes
			result.balanceAttrs = this.getAllAttributesAsFlatList('reports.balancereport', '', 'Balance', {maxDepth: 1});

			result.balanceMismatchAttrs = this.getAllAttributesAsFlatList('reports.balancereportmismatch', '', 'Mismatch', {maxDepth: 1});

			result.balancePerformanceAttrs = this.getAllAttributesAsFlatList('reports.balancereportperformance', '', 'Performance', {maxDepth: 1});

			result.allocationAttrs = this.getAllAttributesAsFlatList('instruments.instrument', 'allocation', 'Allocation', {maxDepth: 1});

			result.instrumentAttrs = this.getAllAttributesAsFlatList('instruments.instrument', 'instrument', 'Instrument', {maxDepth: 1});

			result.linkedInstrumentAttrs = this.getAllAttributesAsFlatList('instruments.instrument', 'linked_instrument', 'Linked Instrument', {maxDepth: 1});

			result.currencyAttrs = this.getAllAttributesAsFlatList('currencies.currency', 'currency', 'Currency', {maxDepth: 1});

			result.accountAttrs = this.getAllAttributesAsFlatList('accounts.account', 'account', 'Account', {maxDepth: 1});

			result.portfolioAttrs = this.getAllAttributesAsFlatList('portfolios.portfolio', 'portfolio', 'Portfolio', {maxDepth: 1});

			result.strategy1attrs = this.getAllAttributesAsFlatList('strategies.strategy1', 'strategy1', 'Strategy 1', {maxDepth: 1});

			result.strategy2attrs = this.getAllAttributesAsFlatList('strategies.strategy2', 'strategy2', 'Strategy 2', {maxDepth: 1});

			result.strategy3attrs = this.getAllAttributesAsFlatList('strategies.strategy3', 'strategy3', 'Strategy 3', {maxDepth: 1});
			//# endregion

			result.custom = formatCustomFields( this.customFields['reports.balancereport'] );

			//# regions Dynamic attributes
			result = this._getCommonDynamicAttrs(result);
			result.allocationInstrumentDAttrs = this.getDynamicAttrs('instruments.instrument', 'allocation', 'Allocation');
			//# endregion

			// remove attributes that area already inside currency from balance
			result.balanceAttrs = result.balanceAttrs.filter(bAttr => {
				return !result.currencyAttrs.find(cAttr => cAttr.key === bAttr.key);
			});

			/*result = result.concat(balanceAttrs);
			result = result.concat(balanceMismatchAttrs);
			result = result.concat(balancePerformanceAttrs);
			result = result.concat(allocationAttrs);
			result = result.concat(instrumentAttrs);
			result = result.concat(linkedInstrumentAttrs);
			result = result.concat(currencyAttrs);
			result = result.concat(accountAttrs);
			result = result.concat(portfolioAttrs);
			result = result.concat(strategy1attrs);
			result = result.concat(strategy2attrs);
			result = result.concat(strategy3attrs);

			result = result.concat(custom);

			result = result.concat(portfolioDynamicAttrs);
			result = result.concat(accountDynamicAttrs);
			result = result.concat(currencyDynamicAttrs);
			result = result.concat(instrumentDynamicAttrs);
			result = result.concat(allocationDynamicAttrs);
			result = result.concat(linkedInstrumentDynamicAttrs);

			return result*/

			// assemble attributes into array
			return Object.keys(result).reduce(
				(accumulator, resultKey) => accumulator.concat( result[resultKey] ),
				[]
			)

		},

		getPlReportAttributes() {

			let result = {};

			//# regions System attributes
			result.balanceAttrs = this.getAllAttributesAsFlatList('reports.plreport', '', 'Balance', {maxDepth: 1});

			result.balanceMismatchAttrs = this.getAllAttributesAsFlatList('reports.plreportmismatch', '', 'Mismatch', {maxDepth: 1});

			result.balancePerformanceAttrs = this.getAllAttributesAsFlatList('reports.plreportperformance', '', 'Performance', {maxDepth: 1});

			result.instrumentAttrs = this.getAllAttributesAsFlatList('instruments.instrument', 'instrument', 'Instrument', {maxDepth: 1});
			result.instrumentAttrs = this.applyAliasesToAttrs(result.instrumentAttrs, 'instruments.instrument', 'instrument.', 'Instrument. ');

			result.linkedInstrumentAttrs = this.getAllAttributesAsFlatList('instruments.instrument', 'linked_instrument', 'Linked Instrument', {maxDepth: 1});
			result.linkedInstrumentAttrs = this.applyAliasesToAttrs(result.linkedInstrumentAttrs, 'instruments.instrument', 'linked_instrument.', 'Linked Instrument. ');

			result.allocationAttrs = this.getAllAttributesAsFlatList('instruments.instrument', 'allocation', 'Allocation', {maxDepth: 1});
			result.allocationAttrs = this.applyAliasesToAttrs(result.allocationAttrs, 'instruments.instrument', 'allocation.', 'Allocation. ');

			result.accountAttrs = this.getAllAttributesAsFlatList('accounts.account', 'account', 'Account', {maxDepth: 1});

			result.portfolioAttrs = this.getAllAttributesAsFlatList('portfolios.portfolio', 'portfolio', 'Portfolio', {maxDepth: 1});

			result.strategy1attrs = this.getAllAttributesAsFlatList('strategies.strategy1', 'strategy1', 'Strategy 1', {maxDepth: 1});

			result.strategy2attrs = this.getAllAttributesAsFlatList('strategies.strategy2', 'strategy2', 'Strategy 2', {maxDepth: 1});

			result.strategy3attrs = this.getAllAttributesAsFlatList('strategies.strategy3', 'strategy3', 'Strategy 3', {maxDepth: 1});
			//# endregion

			result.custom = formatCustomFields( this.customFields['reports.plreportmismatch'] );

			//# region Dynamic attributes
			result = this._getCommonDynamicAttrs(result);
			result.allocationInstrumentDAttrs = this.getDynamicAttrs('instruments.instrument', 'allocation', 'Allocation');
			//# endregion

			/*result = result.concat(balanceAttrs);
			result = result.concat(balanceMismatchAttrs);
			result = result.concat(balancePerformanceAttrs);
			result = result.concat(allocationAttrs);
			result = result.concat(instrumentAttrs);
			result = result.concat(linkedInstrumentAttrs);
			result = result.concat(accountAttrs);
			result = result.concat(portfolioAttrs);
			result = result.concat(strategy1attrs);
			result = result.concat(strategy2attrs);
			result = result.concat(strategy3attrs);

			result = result.concat(custom);

			result = result.concat(portfolioDynamicAttrs);
			result = result.concat(accountDynamicAttrs);
			result = result.concat(instrumentDynamicAttrs);
			result = result.concat(allocationDynamicAttrs);
			result = result.concat(linkedInstrumentDynamicAttrs);

			return result*/
			// assemble attributes into array
			return Object.keys(result).reduce(
				(accumulator, resultKey) => accumulator.concat( result[resultKey] ),
				[]
			);

		},

		getTransactionReportAttributes() {

			let result = {};

			//# region System attributes
			result.transactionAttrs = this.getAllAttributesAsFlatList('reports.transactionreport', '', 'Transaction', {maxDepth: 1});
			result.transactionAttrs = this.applyAliasesToAttrs(result.transactionAttrs, 'transactions.transaction', '', 'Transaction. ');

			result.complexTransactionAttrs = this.getAllAttributesAsFlatList('transactions.complextransaction', 'complex_transaction', 'Complex Transaction', {maxDepth: 1});

			result.complexTransactionAttrs = result.complexTransactionAttrs.filter(function (attr) {
				return ttypeUserFields.indexOf(attr.key) < 0;
			});

			result.complexTransactionAttrs = this.applyAliasesToAttrs(result.complexTransactionAttrs, 'transactions.complextransaction', 'complex_transaction.', 'Complex Transaction. ');

			result.portfolioAttrs = this.getAllAttributesAsFlatList('portfolios.portfolio', 'portfolio', 'Portfolio', {maxDepth: 1});

			result.instrumentAttrs = this.getAllAttributesAsFlatList('instruments.instrument', 'instrument', 'Instrument', {maxDepth: 1});
			result.instrumentAttrs = this.applyAliasesToAttrs(result.instrumentAttrs, 'instruments.instrument', 'instrument.', 'Instrument. ');

			result.responsibleAttrs = this.getAllAttributesAsFlatList('counterparties.responsible', 'responsible', 'Responsible', {maxDepth: 1});

			result.counterpartyAttrs = this.getAllAttributesAsFlatList('counterparties.counterparty', 'counterparty', 'Counterparty', {maxDepth: 1});

			// instruments

			result.linkedInstrumentAttrs = this.getAllAttributesAsFlatList('instruments.instrument', 'linked_instrument', 'Linked Instrument', {maxDepth: 1});
			result.linkedInstrumentAttrs = this.applyAliasesToAttrs(result.linkedInstrumentAttrs, 'instruments.instrument', 'linked_instrument.', 'Linked Instrument. ');

			result.allocationBalanceAttrs = this.getAllAttributesAsFlatList('instruments.instrument', 'allocation_balance', 'Allocation Balance', {maxDepth: 1});
			result.allocationBalanceAttrs = this.applyAliasesToAttrs(result.allocationBalanceAttrs, 'instruments.instrument', 'allocation_balance.', 'Allocation Balance. ');

			result.allocationPlAttrs = this.getAllAttributesAsFlatList('instruments.instrument', 'allocation_pl', 'Allocation P&L', {maxDepth: 1});
			result.allocationPlAttrs = this.applyAliasesToAttrs(result.allocationPlAttrs, 'instruments.instrument', 'allocation_pl.', 'Allocation P&L. ');

			// currencies

			result.transactionCurrencyAttrs = this.getAllAttributesAsFlatList('currencies.currency', 'transaction_currency', 'Transaction currency', {maxDepth: 1});

			result.settlementCurrencyAttrs = this.getAllAttributesAsFlatList('currencies.currency', 'settlement_currency', 'Settlement currency', {maxDepth: 1});

			// accounts

			result.accountPositionAttrs = this.getAllAttributesAsFlatList('accounts.account', 'account_position', 'Account Position', {maxDepth: 1});

			result.accountCashAttrs = this.getAllAttributesAsFlatList('accounts.account', 'account_cash', 'Account Cash', {maxDepth: 1});

			result.accountInterimAttrs = this.getAllAttributesAsFlatList('accounts.account', 'account_interim', 'Account Interim', {maxDepth: 1});

			// strategies

			result.strategy1cashAttrs = this.getAllAttributesAsFlatList('strategies.strategy1', 'strategy1_cash', 'Strategy 1 Cash', {maxDepth: 1});

			result.strategy1positionAttrs = this.getAllAttributesAsFlatList('strategies.strategy1', 'strategy1_position', 'Strategy 1 Position', {maxDepth: 1});

			result.strategy2cashAttrs = this.getAllAttributesAsFlatList('strategies.strategy2', 'strategy2_cash', 'Strategy 2 Cash', {maxDepth: 1});

			result.strategy2positionAttrs = this.getAllAttributesAsFlatList('strategies.strategy2', 'strategy2_position', 'Strategy 2 Position', {maxDepth: 1});

			result.strategy3cashAttrs = this.getAllAttributesAsFlatList('strategies.strategy3', 'strategy3_cash', 'Strategy 3 Cash', {maxDepth: 1});

			result.strategy3positionAttrs = this.getAllAttributesAsFlatList('strategies.strategy3', 'strategy3_position', 'Strategy 3 Position', {maxDepth: 1});
			//# endregion

			result.custom = formatCustomFields( this.customFields['reports.transactionreport'] );

			//# region Dynamic attributes
			/*var portfolioDynamicAttrs = getDynamicAttributesByEntityType('portfolio');
			var complexTransactionDynamicAttrs = getDynamicAttributesByEntityType('complex-transaction');
			var transactionTypeDynamicAttrs = getDynamicAttributesByEntityType('transaction-type');
			var responsibleDynamicAttrs = getDynamicAttributesByEntityType('responsible');
			var counterpartyDynamicAttrs = getDynamicAttributesByEntityType('counterparty');

			var instrumentDynamicAttrs = getDynamicAttributesByEntityType('instrument');
			var linkedInstrumentDynamicAttrs = getDynamicAttributesByEntityType('instrument');
			var allocationBalanceDynamicAttrs = getDynamicAttributesByEntityType('instrument');
			var allocationPlDnymaicAttrs = getDynamicAttributesByEntityType('instrument');

			var accountPositionDynamicAttrs = getDynamicAttributesByEntityType('account');
			var accountCashDynamicAttrs = getDynamicAttributesByEntityType('account');
			var accountInterimDynamicAttrs = getDynamicAttributesByEntityType('account');

			var portfolioDynamicAttrsFormatted = formatAttributeTypes(portfolioDynamicAttrs, 'portfolios.portfolio', 'portfolio', 'Portfolio');
			var complexTransactionDynamicAttrsFormatted = formatAttributeTypes(complexTransactionDynamicAttrs, 'transactions.complextransaction', 'complex_transaction', 'Complex Transaction');
			var transactionTypeDynamicAttrsFormatted = formatAttributeTypes(transactionTypeDynamicAttrs, 'transactions.transactiontype', 'transaction_type', 'Transaction Type');
			var responsibleDynamicAttrsFormatted = formatAttributeTypes(responsibleDynamicAttrs, 'counterparties.responsible', 'responsible', 'Responsible');
			var counterpartyDynmicAttrsFormatted = formatAttributeTypes(counterpartyDynamicAttrs, 'counterparties.counterparty', 'counterparty', 'Counterparty');

			var instrumentDynamicAttrsFormatted = formatAttributeTypes(instrumentDynamicAttrs, 'instruments.instrument', 'instrument', 'Instrument');
			var linkedInstrumentDynamicAttrsFormatted = formatAttributeTypes(linkedInstrumentDynamicAttrs, 'instruments.instrument', 'linked_instrument', 'Linked Instrument');
			var allocationBalanceDynamicAttrsFormatted = formatAttributeTypes(allocationBalanceDynamicAttrs, 'instruments.instrument', 'allocation_balance', 'Allocation Balance');
			var allocationPlDnymaicAttrsFormatted = formatAttributeTypes(allocationPlDnymaicAttrs, 'instruments.instrument', 'allocation_pl', 'Allocation P&L');

			var accountPositionDynamicAttrsFormatted = formatAttributeTypes(accountPositionDynamicAttrs, 'accounts.account', 'account_position', 'Account Position');
			var accountCashDynamicAttrsFormatted = formatAttributeTypes(accountCashDynamicAttrs, 'accounts.account', 'account_cash', 'Account Cash');
			var accountInterimDynamicAttrsFormatted = formatAttributeTypes(accountInterimDynamicAttrs, 'accounts.account', 'account_interim', 'Account Interim');*/
			result = this._getCommonDynamicAttrs(result);

			result.complexTransactionDAttrs = this.getDynamicAttrs('transactions.complextransaction', 'complex_transaction', 'Complex Transaction');
			result.transactionTypeDAttrs = this.getDynamicAttrs('transactions.transactiontype', 'transaction_type', 'Transaction Type');
			result.responsibleDAttrs = this.getDynamicAttrs('counterparties.responsible', 'responsible', 'Responsible');
			result.counterpartyDAttrs = this.getDynamicAttrs('counterparties.counterparty', 'counterparty', 'Counterparty');

			result.allocationBalanceDAttrs = this.getDynamicAttrs('instruments.instrument', 'allocation_balance', 'Allocation Balance');
			result.allocationPlDAttrs = this.getDynamicAttrs('instruments.instrument', 'allocation_pl', 'Allocation P&L');

			result.accountPositionDAttrs = this.getDynamicAttrs('accounts.account', 'account_position', 'Account Position');
			result.accountCashDAttrs = this.getDynamicAttrs('accounts.account', 'account_cash', 'Account Cash');
			result.accountInterimDAttrs = this.getDynamicAttrs('accounts.account', 'account_interim', 'Account Interim');

			//# endregion

			/*result = result.concat(transactionAttrs);
			result = result.concat(complexTransactionAttrs);
			result = result.concat(portfolioAttrs);
			result = result.concat(instrumentAttrs);
			result = result.concat(responsibleAttrs);
			result = result.concat(counterpartyAttrs);

			result = result.concat(linkedInstrumentAttrs);
			result = result.concat(allocationBalanceAttrs);
			result = result.concat(allocationPlAttrs);

			result = result.concat(transactionCurrencyAttrs);
			result = result.concat(settlementCurrencyAttrs);

			result = result.concat(accountPositionAttrs);
			result = result.concat(accountCashAttrs);
			result = result.concat(accountInterimAttrs);

			result = result.concat(strategy1cashAttrs);
			result = result.concat(strategy1positionAttrs);
			result = result.concat(strategy2cashAttrs);
			result = result.concat(strategy2positionAttrs);
			result = result.concat(strategy3cashAttrs);
			result = result.concat(strategy3positionAttrs);

			result = result.concat(custom);

			result = result.concat(portfolioDynamicAttrsFormatted);
			result = result.concat(complexTransactionDynamicAttrsFormatted);
			result = result.concat(transactionTypeDynamicAttrsFormatted);
			result = result.concat(responsibleDynamicAttrsFormatted);
			result = result.concat(counterpartyDynmicAttrsFormatted);

			result = result.concat(instrumentDynamicAttrsFormatted);
			result = result.concat(linkedInstrumentDynamicAttrsFormatted);
			result = result.concat(allocationBalanceDynamicAttrsFormatted);
			result = result.concat(allocationPlDnymaicAttrsFormatted);

			result = result.concat(accountPositionDynamicAttrsFormatted);
			result = result.concat(accountCashDynamicAttrsFormatted);
			result = result.concat(accountInterimDynamicAttrsFormatted);

			return result*/
			return Object.keys(result).reduce(
				(accumulator, resultKey) => accumulator.concat( result[resultKey] ),
				[]
			);

		},

		applyAliasesToAttrs(attributes, contentType, keyPrefix='', namePrefix='') {

			const customFieldsObj = {
				'transactions.transaction': this.customFields['transactions.transaction'],
				'transactions.complextransaction': this.customFields['transactions.complextransaction'],
				'instruments.instrument': this.customFields['instruments.instrument'],
			}

			if ( !customFieldsObj.hasOwnProperty(contentType) ) {
				throw new Error("There are no user fields for contentType: " + contentType)
			}

			customFieldsObj[contentType].forEach(function (field) {

				attributes = attributes.map(function (attr) {

					/*if (attr.key === 'complex_transaction.' + field.key) {
							attr.name = 'Complex Transaction. ' + field.name;
					}*/
					if (attr.key === keyPrefix + field.key) {
						attr.name = namePrefix + field.name;
					}

					return attr;

				})

			});

			return attributes;

		},

		getAllAttributesByContentType(contentType, viewContext) {

			let result;

			/*if (viewContext === 'reconciliation_viewer') {
				result = getReconciliationAttributes();

			}
			else {*/

			switch (contentType) {
					case 'reports.balancereport':
						result = this.getBalanceReportAttributes();
						break;

					case 'reports.plreport':
						result = this.getPlReportAttributes();
						break;

					case 'reports.transactionreport':
						result = this.getTransactionReportAttributes();
						break;

					default: // get attributes for entity viewer

						let entityAttrs = [];
						let dynamicAttrs = [];

						result = [];

						if ( this.systemAttrs[contentType] ) {
							entityAttrs = JSON.parse(JSON.stringify( this.systemAttrs[contentType] ))
						}

						if ( this.attrTypes[contentType] ) {
							dynamicAttrs = JSON.parse(JSON.stringify( this.attrTypes[contentType] ))
						}

						dynamicAttrs = dynamicAttrs.map(function (attribute) {

							var result = {};

							result.attribute_type = Object.assign({}, attribute);
							result.value_type = attribute.value_type;
							result.content_type = contentType;
							result.key = 'attributes.' + attribute.user_code;
							result.name = attribute.name;

							return result

						});

						result = result.concat(entityAttrs);
						result = result.concat(dynamicAttrs);

				}

			// }

			return result;
		},
		/**
		 * @param {String} contentType
		 * @param {String} [viewContext]
		 */
		getDataForAttributesSelector(contentType, viewContext) {
			const attrs = this.getAllAttributesByContentType(contentType, viewContext);

			return attrs.filter(attr => {
				return attr.value_type !== 'mc_field';
			})
		},

	},
	getters: {}
})
