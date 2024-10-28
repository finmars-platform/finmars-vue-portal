/** @module:evAttributesData **/
/*export class UseEvAttributesData {
	// entityAttrs are systemAttrs from evAttributesStore
	constructor(entityAttrs) {
		this.entityAttributesData = entityAttrs
	}

	reportsContentTypes = ['reports.balancereport', 'reports.plreport', 'reports.transactionreport'];

	entityAttributesData = {
		"reports.balancereport": null,
		"reports.plreport": null,
		"reports.transactionreport": null,
	}

	customFieldsData = {};

	dynamicAttributesData = {};

	instrumentUserFieldsData = [];
	transactionUserFieldsData = [];

	reconciliationAttributes = [];

	attributesAvailableForColumns = [];

	getEntityAttributes(contentType) {

		if ( this.entityAttributesData[contentType] ) {
			return JSON.parse(JSON.stringify( this.entityAttributesData[contentType] ));
		}

		return [];

	}

	getDynamicAttributes(contentType) {

		if ( this.dynamicAttributesData.hasOwnProperty(contentType) ) {
			return JSON.parse(JSON.stringify( this.dynamicAttributesData[contentType] ));
		}

		return []
	}

	getCustomFields(contentType) {

		if ( this.customFieldsData.hasOwnProperty(contentType) ) {
			return JSON.parse(JSON.stringify( this.customFieldsData[contentType] ));
		}

		return []
	}

	getAttributesRecursive(result, currentLevel, contentType, parentKey, parentName, options) {

		// console.log('contentType', contentType);

		const attributes = this.getEntityAttributes(contentType);
		const getAttributesRecursive = this.getAttributesRecursive;

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

	}

	/!**
	 * Get list of entity attributes and all children attributes.
	 * @param {string} rootContentType - content type (e.g. instruments.instrument).
	 * @param {string} rootKey - key prefix for root level attributes.
	 * @param {string} rootName - name prefix for root level attributes.
	 * @param {object} options - all other options.
	 * @return {Object[]} Array of Attributes.
	 *!/
	getAllAttributesAsFlatList(rootContentType, rootKey, rootName, options) {

		let result = [];
		const defaultOptions = {
			maxDepth: 1
		};

		const _options = Object.assign({}, defaultOptions, options);

		let currentLevel = 0;

		this.getAttributesRecursive(result, currentLevel, rootContentType, rootKey, rootName, _options);

		// console.log('currentLevel', currentLevel);
		// console.log('result', result);

		return result;

	}

	/!**
	 * Get list of entity attribute types.
	 * @param {object[]} attributes - source list of attribute types.
	 * @param {string} contentType - content type
	 * @param {string} rootKey - key prefix for root level attributes.
	 * @param {string} rootName - name prefix for root level attributes.
	 * @return {Object[]} Array of Attributes.
	 *!/
	formatAttributeTypes(attributes, contentType, rootKey, rootName) {

		return attributes.map(function (attribute) {

			let result = {};

			result.attribute_type = Object.assign({}, attribute);
			result.value_type = attribute.value_type;
			result.content_type = contentType;

			const key = attribute.user_code.split(':').pop(); // remove configuration_code and content_type
			result.key = rootKey + '.attributes.' + key;

			result.name = rootName + '. ' + attribute.name;

			return result

		});

	}

	getBalanceReportAttributes() {

		let result = [];

		let balanceAttrs = this.getAllAttributesAsFlatList('reports.balancereport', '', 'Balance', {maxDepth: 1});

		const balanceMismatchAttrs = this.getAllAttributesAsFlatList('reports.balancereportmismatch', '', 'Mismatch', {maxDepth: 1});

		const balancePerformanceAttrs = this.getAllAttributesAsFlatList('reports.balancereportperformance', '', 'Performance', {maxDepth: 1});

		const allocationAttrs = this.getAllAttributesAsFlatList('instruments.instrument', 'allocation', 'Allocation', {maxDepth: 1});

		const instrumentAttrs = this.getAllAttributesAsFlatList('instruments.instrument', 'instrument', 'Instrument', {maxDepth: 1});

		const linkedInstrumentAttrs = this.getAllAttributesAsFlatList('instruments.instrument', 'linked_instrument', 'Linked Instrument', {maxDepth: 1});

		const currencyAttrs = this.getAllAttributesAsFlatList('currencies.currency', 'currency', 'Currency', {maxDepth: 1});

		const accountAttrs = this.getAllAttributesAsFlatList('accounts.account', 'account', 'Account', {maxDepth: 1});

		const portfolioAttrs = this.getAllAttributesAsFlatList('portfolios.portfolio', 'portfolio', 'Portfolio', {maxDepth: 1});

		const strategy1attrs = this.getAllAttributesAsFlatList('strategies.strategy1', 'strategy1', 'Strategy 1', {maxDepth: 1});

		const strategy2attrs = this.getAllAttributesAsFlatList('strategies.strategy2', 'strategy2', 'Strategy 2', {maxDepth: 1});

		const strategy3attrs = this.getAllAttributesAsFlatList('strategies.strategy3', 'strategy3', 'Strategy 3', {maxDepth: 1});

		const custom = this.getCustomFields('reports.balancereport').map(function (customItem) {

			customItem.custom_field = Object.assign({}, customItem);

			customItem.key = 'custom_fields.' + customItem.user_code;
			customItem.name = 'Custom Field. ' + customItem.name;

			return customItem

		});

		var portfolioDynamicAttrs = this.getDynamicAttributes('portfolio');
		var accountDynamicAttrs = this.getDynamicAttributes('account');
		var instrumentDynamicAttrs = this.getDynamicAttributes('instrument');
		var allocationDynamicAttrs = this.getDynamicAttributes('instrument');
		var linkedInstrumentDynamicAttrs = this.getDynamicAttributes('instrument');

		var portfolioDynamicAttrsFormatted = this.formatAttributeTypes(portfolioDynamicAttrs, 'portfolios.portfolio', 'portfolio', 'Portfolio');
		var accountDynamicAttrsFormatted = this.formatAttributeTypes(accountDynamicAttrs, 'accounts.account', 'account', 'Account');
		var currencyDynamicAttrsFormatted = this.formatAttributeTypes(accountDynamicAttrs, 'currencies.currency', 'currency', 'Currency');
		var instrumentDynamicAttrsFormatted = this.formatAttributeTypes(instrumentDynamicAttrs, 'instruments.instrument', 'instrument', 'Instrument');
		var allocationDynamicAttrsFormatted = this.formatAttributeTypes(allocationDynamicAttrs, 'instruments.instrument', 'allocation', 'Allocation');
		var linkedInstrumentDynamicAttrsFormatted = this.formatAttributeTypes(linkedInstrumentDynamicAttrs, 'instruments.instrument', 'linked_instrument', 'Linked Instrument');

		// remove attributes that area already inside currency from balance
		balanceAttrs = balanceAttrs.filter(function (bAttr) {
			return !!!currencyAttrs.find(function (cAttr) {return cAttr.key === bAttr.key});
		});

		result = result.concat(balanceAttrs);
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

		result = result.concat(portfolioDynamicAttrsFormatted);
		result = result.concat(accountDynamicAttrsFormatted);
		result = result.concat(currencyDynamicAttrsFormatted);
		result = result.concat(instrumentDynamicAttrsFormatted);
		result = result.concat(allocationDynamicAttrsFormatted);
		result = result.concat(linkedInstrumentDynamicAttrsFormatted);

		return result

	}

	async fetchAttributeTypes(getPromise, contentType) {

		const res = await getPromise;

		if (res._$error) {
			throw new Error("Got error loading attribute types with contentType: " + contentType)
		}

		this.dynamicAttributesData[contentType] = res.results;

		return JSON.parse(JSON.stringify( this.dynamicAttributesData[contentType] ));

	}

	appendEntityAttribute(contentType, attr) {

		if (this.entityAttributesData[contentType]) {
			this.entityAttributesData[contentType].push(attr);
		} else {
			console.warn('Cant append attribute: ' + attr);
		}

	}

}*/

import reportViewerController from "~/angular/controllers/entityViewer/reportViewerController";

const reportContentTypes = ['reports.balancereport', 'reports.plreport', 'reports.transactionreport'];
export function isReport (contentType) {
	return reportContentTypes.includes(contentType);
}

export const getDefaultEvRvFilterType = function (valueType) {

	const defaultFt = "contains";
	const defaultNumberFt = "equal";

	return ( [10, 30, 'field'].includes(valueType) ) ? defaultFt : defaultNumberFt;

}

/**
 * Turn table attribute into group, column or filter
 * @param {string} form - In what form get attribute. Can be 'column', 'group', 'filter'.
 * @param {object} attrInstance - Object with attribute data on which attribute form will be based
 * @return {object} Return attribute in form of group, column or filter
 */
export const getEvRvAttrInFormOf = function (form, attrInstance) {
	let attrTypeToAdd = {};

	attrTypeToAdd.key = attrInstance.key;

	if (form === 'group' || form === 'column') {

		if ( attrInstance.hasOwnProperty('entity') ) {
			attrTypeToAdd.entity = attrInstance.entity;
		}

		if ( attrInstance.hasOwnProperty('id') ) {
			attrTypeToAdd.id = attrInstance.id;
		}

	}

	if ( attrInstance.hasOwnProperty('groups') ) {
		attrTypeToAdd.groups = attrInstance.groups;
	}

	if ( attrInstance.hasOwnProperty('columns') ) {
		attrTypeToAdd.columns = attrInstance.columns;
	}

	if ( attrInstance.hasOwnProperty('filters') ) {
		attrTypeToAdd.filters = attrInstance.filters;
	}

	attrTypeToAdd.name = attrInstance.name;
	attrTypeToAdd.value_type = attrInstance.value_type;

	if (attrInstance.layout_name) {
		attrTypeToAdd.layout_name = attrInstance.layout_name;
	}

	if (!attrTypeToAdd.options) {
		attrTypeToAdd.options = {};
	}

	switch (form) {

		case 'group':
			attrTypeToAdd.groups = true;

			attrTypeToAdd.options.sort = null;
			attrTypeToAdd.options.sort_settings = {};

			break;

		case 'column':

			attrTypeToAdd.columns = true;

			attrTypeToAdd.options.sort = null;
			attrTypeToAdd.options.sort_settings = {};

			break;

		case 'filter':

			attrTypeToAdd.filters = true;

			if (!attrTypeToAdd.options.filter_type) {
				attrTypeToAdd.options.filter_type = getDefaultEvRvFilterType(attrTypeToAdd.value_type);
			}

			if (!attrTypeToAdd.options.filter_values) {
				attrTypeToAdd.options.filter_values = [];
			}

			// if (!attrTypeToAdd.options.hasOwnProperty('exclude_empty_cells')) {
			// 	attrTypeToAdd.options.exclude_empty_cells = false;
			// }

			break;
	}

	if (form === 'group' || form === 'column') {

		attrTypeToAdd.style = {
			width: evDataHelper.getColumnWidth(attrTypeToAdd)
		}

	}

	return attrTypeToAdd;

}

export const useGetMdDialogData = () => {

	return {
		modals: reactive({}),
		show(opts) {
			return new Promise((resolve, reject) => {
				window.$mdDialog.modals[opts.controller.replace(' as vm', '')] = {
					resolve,
					reject,
					...opts.locals,
				}
			})
		},
	}

}

/**
 *
 * @param {String} contentType
 * @param {Object} evAttrsStore - useEvAttributesStore
 * @param {Object} reportViewerOptions
 * 	@param {Object} reportViewerOptions.$scope
 * 	@param {Object} reportViewerOptions.$stateParams
 * 	@param {Object} [reportViewerOptions.priceHistoryService]
 * 	@param {Object} [reportViewerOptions.currencyHistoryService]
 * 	@param {Object} [reportViewerOptions.expressionService]
 * @return {Promise<default>} - resolves into vm of an instance of reportViewerController
 */
export const useReportViewerController = async function (contentType, evAttrsStore, reportViewerOptions) {

	await evAttrsStore.fetchCustomFields(contentType);

	return new reportViewerController(reportViewerOptions);

}

const _getParent = function (parentId, evDataService, results) {

	var item = evDataService.getData(parentId);

	results.push(item);

	if (item.___parentId !== null) {

		_getParent(item.___parentId, evDataService, results);

	}

	return results;

};

export const useGetEvRvParents = function (parentId, evDataService) {

	var results = [];

	results = _getParent(parentId, evDataService, results);

	return results;

};
