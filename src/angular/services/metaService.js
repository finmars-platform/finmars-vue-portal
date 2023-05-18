/**
 * Created by szhitenev on 04.05.2016.
 */

import metaRepository from '../repositories/metaRepository'

var getMenu = function () {
	return metaRepository.getMenu()
}

var getBaseAttrs = function () {
	return metaRepository.getBaseAttrs()
}

var getEntityAttrs = function (entity) {
	return metaRepository.getEntityAttrs(entity)
}

var getRequiredEntityAttrs = function (entityType) {
	return metaRepository.getRequiredEntityAttrs(entityType)
}

var getEntityViewerFormComponentsValueTypes = function () {
	return metaRepository.getEntityViewerFormComponentsValueTypes()
}

var getEntitiesWithoutBaseAttrsList = function () {
	return metaRepository.getEntitiesWithoutBaseAttrsList()
}

var getEntitiesWithoutDynAttrsList = function () {
	return metaRepository.getEntitiesWithoutDynAttrsList()
}

var getRestrictedEntitiesWithTypeField = function () {
	return metaRepository.getRestrictedEntitiesWithTypeField()
}

var getTypeCaptions = function () {
	var filteredValueTypes = getEntityViewerFormComponentsValueTypes()
	/* var filteredValueTypes = getValueTypes().filter(function (item) {
        	// return item.value !== 'field' && item.value !== 'decoration';
        	return item.value !== 'field';
        }); */
	var typeCaptions = filteredValueTypes.map(function (item) {
		switch (item['display_name']) {
			case 'Number':
				// item['caption_name'] = 'Integer';
				item['caption_name'] = 'Whole number'
				break
			case 'Float':
				item['caption_name'] = 'Number with decimals'
				break
			case 'Classifier':
				item['caption_name'] = 'Classification'
				break
			case 'Field':
				item['caption_name'] = 'Reference'
				break
			case 'String':
				item['caption_name'] = 'Text'
				break
			case 'Boolean':
				item['caption_name'] = 'True/False'
				break
			case 'Decoration':
				item['caption_name'] = 'Decoration'
				break
			case 'Button':
				item['caption_name'] = 'Button'
				break
			case 'Table':
				item['caption_name'] = 'Table'
				break
			default:
				item['caption_name'] = item['display_name']
				break
		}
		return item
	})
	//console.log(typeCaptions);
	return typeCaptions
}

var groups = {
	groupOne: '400px',
	groupTwo: '600px',
	groupThree: '300px',
	groupFour: '450px',
	groupFive: '200px',
	newColumnAdded: false,
}

var getDynamicAttrsValueTypes = function () {
	return metaRepository.getDynamicAttrsValueTypes()
}

var getDynamicAttrsValueTypesCaptions = function () {
	var filteredValueTypes = getDynamicAttrsValueTypes()
	//var filteredValueTypes = getValueTypes().filter(function (item) {
	//	// return item.value !== 'field' && item.value !== 'decoration';
	//	return item.value !== 'field';
	//});
	var typeCaptions = filteredValueTypes.map(function (item) {
		switch (item['display_name']) {
			case 'Number':
				item['caption_name'] = 'Number with decimals'
				break
			case 'Classifier':
				item['caption_name'] = 'Classification'
				break
			case 'Date':
				item['caption_name'] = 'Date'
				break
			case 'String':
				item['caption_name'] = 'Text'
				break
		}
		return item
	})
	//console.log(typeCaptions);
	return typeCaptions
}

var columnsWidthGroups = function (newColumn) {
	if (typeof newColumn === 'boolean') {
		groups['newColumnAdded'] = newColumn
	} else {
		return groups
	}
}

var checkRestrictedEntityTypesForAM = function (entityType) {
	switch (entityType) {
		case 'portfolio':
		case 'portfolio-registry':
		case 'account':
		case 'strategy-1':
		case 'strategy-2':
		case 'strategy-3':
		case 'account-type':
		case 'counterparty':
		case 'responsible':
		case 'currency':
		case 'instrument':
		case 'instrument-type':
		case 'transaction':
		case 'transaction-type':
		case 'complex-transaction':
		case 'strategies':
			return true
		default:
			return false
	}
}

var getEntityTabs = function (entityType) {
	return metaRepository.getEntityTabs(entityType)
}

var getEntitiesWithSimpleFields = function () {
	return metaRepository.getEntitiesWithSimpleFields()
}

var getFieldsWithTagGrouping = function () {
	return metaRepository.getFieldsWithTagGrouping()
}

var isReport = function (entityType) {
	return (
		[
			'balance-report',
			'cash-flow-projection-report',
			'performance-report',
			'pl-report',
			'transaction-report',
		].indexOf(entityType) !== -1
	)
}

var getCurrentLocation = function ($state) {
	var result = ''

	if ($state.current.name.indexOf('app.forum') !== -1) {
		result = 'Forum'
	}

	if ($state.current.name.indexOf('app.portal.settings') !== -1) {
		result = 'Settings'
	}

	switch ($state.current.name) {
		case 'app.portal.dashboard':
			result = 'Dashboard'
			break
		case 'app.portal.data.portfolio':
			result = 'Portfolio'
			break
		case 'app.portal.data.account':
			result = 'Account'
			break
		case 'app.portal.data.counterparty':
			result = 'Counterparty'
			break
		case 'app.portal.data.counterparty-group':
			result = 'Counterparty group'
			break
		case 'app.portal.data.responsible':
			result = 'Responsible'
			break
		case 'app.portal.data.responsible-group':
			result = 'Responsible group'
			break
		case 'app.portal.data.instrument':
			result = 'Instrument'
			break
		case 'app.portal.data.transaction':
			result = 'Transaction'
			break
		case 'app.portal.data.price-history':
			result = 'Price history'
			break
		case 'app.portal.data.currency-history':
			result = 'Currency history'
			break
		case 'app.portal.data.strategy':
			result = 'Strategy'
			break
		case 'app.portal.data.strategy-subgroup':
			result = 'Strategy subgroup'
			break
		case 'app.portal.data.strategy-group':
			result = 'Strategy group'
			break
		case 'app.portal.data.account-type':
			result = 'Account types'
			break
		case 'app.portal.data.instrument-type':
			result = 'Instrument types'
			break
		/* case 'app.portal.data.pricing-policy':
                result = "Pricing policy";
                break; */
		case 'app.portal.data.transaction-type':
			result = 'Transaction type'
			break
		case 'app.portal.data.transaction-type-group':
			result = 'Transaction type groups'
			break
		case 'app.portal.data.currency':
			result = 'Currency'
			break
		case 'app.portal.data.complex-transaction':
			result = 'Transaction'
			break
		case 'app.portal.reports.balance-report':
			result = 'Balance report'
			break
		case 'app.portal.reports.pl-report':
			result = 'P&L report'
			break
		case 'app.portal.reports.transaction-report':
			result = 'Transaction report'
			break
		case 'app.portal.reports.cash-flow-projection-report':
			result = 'Cash flow projection report'
			break
		case 'app.portal.reports.performance-report':
			result = 'Performance report'
			break
		case 'app.portal.actions':
			result = 'Actions'
			break
		case 'app.portal.system.notifications':
			break
		case 'app.portal.system.transactions':
			result = 'Audit transactions'
			break
		case 'app.portal.system.instruments':
			result = 'Audit instruments'
			break
		case 'app.portal.settings.users-groups':
			result = 'Users & Groups'
			break
		default:
			result = ''
			break
	}

	return result
}

var getHeaderTitleForCurrentLocation = function ($state) {
	var name = ''

	if ($state.current.name.startsWith('app.portal.data.')) {
		name = 'Data: '
	} else if ($state.current.name.startsWith('app.portal.settings.')) {
		name = 'Settings: '
	} else if ($state.current.name.startsWith('app.portal.reports.')) {
		name = 'Report: '
	} else if ($state.current.name.startsWith('app.portal.import.')) {
		name = 'Import: '
	}

	if ($state.current.name.indexOf('app.forum') !== -1) {
		name = 'FORUM'
	} else {
		switch ($state.current.name) {
			case 'app.portal.home':
				name = 'Home page'
				break

			//<editor-fold desc="Report: ">
			case 'app.portal.reports.balance-report':
				name += 'Balance'
				break
			case 'app.portal.reports.pl-report':
				name += 'P&L'
				break
			case 'app.portal.reports.transaction-report':
				name += 'Transaction'
				break
			case 'app.portal.reports.check-for-events':
				name += 'Events'
				break
			//</editor-fold>

			//<editor-fold desc="Data: ">
			case 'app.portal.data.portfolio':
				name += 'Portfolios'
				break
			case 'app.portal.data.portfolio-register':
				name += 'Registers'
				break
			case 'app.portal.data.account':
				name += 'Accounts'
				break
			case 'app.portal.data.instrument':
				name += 'Instruments'
				break
			case 'app.portal.data.counterparty':
				name += 'Counterparties'
				break
			case 'app.portal.data.responsible':
				name += 'Responsibles'
				break
			case 'app.portal.data.currency':
				name += 'Currencies'
				break
			case 'app.portal.data.strategy':
				name += 'Strategies'
				break
			case 'app.portal.data.generated-event':
				name += 'Events'
				break
			//</editor-fold>

			case 'app.portal.data.complex-transaction':
				name = 'Transactions: Transactions'
				break
			case 'app.portal.data.transaction':
				name = 'Transactions: Base transactions'
				break
			case 'app.portal.data.portfolio-register-record':
				name = 'Transactions: Register Records'
				break

			case 'app.portal.data.price-history':
				name = 'Valuations: Prices'
				break
			case 'app.portal.data.price-history-error':
				name = 'Valuations: Prices Journal'
				break
			case 'app.portal.data.currency-history':
				name = 'Valuations: FX Rates'
				break
			case 'app.portal.data.currency-history-error':
				name = 'Valuations: FX Rates Journal'
				break

			//<editor-fold desc="Import: ">
			case 'app.portal.import.simple-entity':
				name += 'Data'
				break
			case 'app.portal.import.transaction':
				name += 'Transactions'
				break
			case 'app.portal.import.complex-import':
				name += 'Data and transactions'
				break
			case 'app.portal.import.instrument':
				name += 'Instrument'
				break
			case 'app.portal.import.instrument-cbonds':
				name += 'Instrument (from CBONDS)'
				break
			case 'app.portal.import.prices':
				name += 'Prices/fx'
				break
			case 'app.portal.import.mapping-tables':
				name += 'Mapping tables'
				break
			//</editor-fold>

			case 'app.portal.system.instruments':
				name = 'Journal: Instruments audit'
				break
			case 'app.portal.system.transactions':
				name = 'Journal: Transactions audit'
				break

			case 'app.portal.developer-panel':
				name = 'Developer panel'
				break
			case 'app.portal.dashboard':
				name = 'Dashboard'
				break
			case 'app.portal.dashboard-constructor':
				name = 'Dashboard constructor'
				break

			case 'app.portal.dashboard-layout-manager':
				name = 'Settings: Dashboard layouts'
				break
			//<editor-fold desc="Settings: ">
			case 'app.portal.settings.forms':
				name += 'Forms'
				break
			case 'app.portal.settings.layouts':
				name += 'Layouts'
				break
			case 'app.portal.settings.notifications':
				name += 'Notifications'
				break
			case 'app.portal.settings.interface-access':
				name += 'Interface complexity'
				break
			//</editor-fold>

			case 'app.portal.data.account-type':
				name = 'Data types: ACCOUNT TYPES'
				break
			case 'app.portal.data.instrument-type':
				name = 'Data types: INSTRUMENT TYPES'
				break
			case 'app.portal.data.transaction-type':
				name = 'Data types: TRANSACTION TYPES'
				break
			/* case 'app.portal.data.pricing-policy':
                    name = 'Data types: PRICING TYPES';
                    break; */

			//<editor-fold desc="Settings: ">
			case 'app.portal.settings.entities-custom-attributes':
				name += 'Data Types: User attributes'
				break
			case 'app.portal.import.reference-tables':
				name += 'Data Types: Reference table'
				break
			case 'app.portal.template-layout-manager':
				name += 'Data Types: Templates'
				break

			case 'app.portal.settings.price-download-scheme':
				name += 'Import from providers: PRICE SCHEMES'
				break
			case 'app.portal.settings.instrument-import':
				name += 'Import from providers: INSTRUMENT IMPORT'
				break
			case 'app.portal.settings.simple-entity-import':
				name += 'Import from files: DATA IMPORT'
				break
			case 'app.portal.settings.transaction-import':
				name += 'Import from files: TRANSACTION IMPORT'
				break
			case 'app.portal.settings.complex-import':
				name += 'Import from files: COMPLEX IMPORT'
				break

			case 'app.portal.settings.template-fields':
				name += 'Aliases'
				break
			case 'app.portal.settings.import-configuration':
				name += 'Configuration: Import'
				break
			case 'app.portal.settings.export-configuration':
				name += 'Configuration: Export'
				break
			case 'app.portal.settings.data-providers':
			case 'app.portal.settings.data-providers-config':
				name += 'Data providers'
				break
			case 'app.portal.settings.init-configuration':
				name += 'NEW USER SETUP'
				break
			case 'app.portal.settings.users-groups':
				name += 'Permissions'
				break
			case 'app.portal.settings.ecosystem-default-settings':
				name += 'DEFAULT SETTINGS'
				break
			//</editor-fold>
			case 'app.portal.processes':
				name = 'Settings: Active processes'
				break
			case 'app.portal.schedules':
				name = 'Settings: Pricing: Schedules'
				break
		}
	}

	return name
}

var getContentGroups = function (typeOfGroups) {
	return metaRepository.getContentGroups(typeOfGroups)
}

var getEntityViewerFixedFieldsAttributes = function (entityType) {
	switch (entityType) {
		case 'instrument':
			return [
				'name',
				'short_name',
				'user_code',
				'instrument_type',
				'public_name',
			]
			break

		case 'account':
			return ['name', 'short_name', 'user_code', 'type', 'public_name']
			break

		case 'portfolio':
			return ['name', 'short_name', 'user_code', null, 'public_name']
			break

		case 'counterparty':
		case 'responsible':
			return ['name', 'short_name', 'user_code', 'group', 'public_name']
			break

		case 'strategy-1':
		case 'strategy-2':
		case 'strategy-3':
			// return ['name', 'short_name', 'user_code', null, 'public_name'];
			return ['name', 'short_name', 'user_code', 'subgroup', 'public_name']
			break

		case 'currency':
			return ['name', 'short_name', 'user_code']
			break

		case 'account-type':
			return [
				'name',
				'short_name',
				'user_code',
				'transaction_details_expr',
				'public_name',
			]
			break

		case 'instrument-type':
			return [
				'name',
				'short_name',
				'user_code',
				'instrument_class',
				'public_name',
			]
			break

		default:
			return []
	}
}

/**
 *
 * @param {function} dataRequest - asynchronous method that returns array of items
 * @param {array} argumentsList - array of arguments for dataRequest method. Must contain argument with options {pageSize: 1000, page: 1}
 * @param {array} [dataList] - array where requested data will be placed
 * @returns {Promise<unknown>}
 */
var loadDataFromAllPages = function (dataRequest, argumentsList, dataList) {
	if (!Array.isArray(dataList)) dataList = []

	let optionsArg = argumentsList.find((arg) => {
		return typeof arg === 'object' && arg.hasOwnProperty('page')
	})

	if (!optionsArg)
		throw new Error(
			'No options with page number were specified in argumentsList'
		)

	var loadAllPages = (resolve, reject) => {
		dataRequest(...argumentsList)
			.then(function (data) {
				dataList = dataList.concat(data.results)

				if (data.next) {
					optionsArg.page = optionsArg.page + 1 // number of page to request
					loadAllPages(resolve, reject)
				} else {
					resolve(dataList)
				}
			})
			.catch((error) => reject(error))
	}

	return new Promise((resolve, reject) => {
		loadAllPages(resolve, reject)
	})
}

/**
 *
 * @param promisesResultList {Array}
 * @param errorPremise {string=} - string to go before data from promise rejection
 */
var logRejectedPromisesAfterAllSettled = function (
	promisesResultList,
	errorPremise
) {
	promisesResultList.forEach((result) => {
		if (result.status === 'rejected') {
			var errorArgs = []

			if (errorPremise) errorArgs.push(errorPremise)

			errorArgs.push(result.reason)

			console.error(...errorArgs)
		}
	})
}

export default {
	isReport: isReport,
	getMenu: getMenu,
	getBaseAttrs: getBaseAttrs,
	getEntityAttrs: getEntityAttrs,
	getRequiredEntityAttrs: getRequiredEntityAttrs,
	getEntityViewerFormComponentsValueTypes:
		getEntityViewerFormComponentsValueTypes,
	getDynamicAttrsValueTypes: getDynamicAttrsValueTypes,
	getDynamicAttrsValueTypesCaptions: getDynamicAttrsValueTypesCaptions,
	getEntitiesWithoutBaseAttrsList: getEntitiesWithoutBaseAttrsList,
	getEntitiesWithoutDynAttrsList: getEntitiesWithoutDynAttrsList,
	getRestrictedEntitiesWithTypeField: getRestrictedEntitiesWithTypeField,
	getTypeCaptions: getTypeCaptions,
	columnsWidthGroups: columnsWidthGroups,
	getEntityTabs: getEntityTabs,
	getEntitiesWithSimpleFields: getEntitiesWithSimpleFields,
	checkRestrictedEntityTypesForAM: checkRestrictedEntityTypesForAM,
	getFieldsWithTagGrouping: getFieldsWithTagGrouping,
	getCurrentLocation: getCurrentLocation,
	getHeaderTitleForCurrentLocation: getHeaderTitleForCurrentLocation,
	getContentGroups: getContentGroups,
	getEntityViewerFixedFieldsAttributes: getEntityViewerFixedFieldsAttributes,

	logRejectedPromisesAfterAllSettled: logRejectedPromisesAfterAllSettled,

	loadDataFromAllPages: loadDataFromAllPages,
}
