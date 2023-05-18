import evRvCommonHelper from './ev-rv-common.helper'

const noLineGroups = function (evDataService) {
	const groups = evDataService.getGroups()

	let result = true

	groups.forEach(function (group) {
		if (group.report_settings.subtotal_type === 'line') {
			result = false
		}
	})

	return result
}

const isFirst = function (evDataService, obj) {
	const flatList = evDataService.getFlatList()

	let isFirst = true

	const len = flatList.length

	for (var i = 0; i < len; i = i + 1) {
		if (i >= obj.___flat_list_index) {
			break
		}

		if (
			flatList[i].___level === obj.___level &&
			flatList[i].___parentId === obj.___parentId
		) {
			isFirst = false
		}
	}

	return isFirst
}

const getAreaGroupsBefore = function (evDataService, level) {
	var groups = evDataService.getGroups()

	// console.log('getAreaGroupsBefore.groups', groups);

	var groupsBefore = groups.filter(function (group, index) {
		return index + 1 < level
	})

	var areaGroupsBefore = []
	var i

	// console.log('getAreaGroupsBefore.groupsBefore', groupsBefore);

	for (i = groupsBefore.length - 1; i >= 0; i = i - 1) {
		if (groupsBefore[i].report_settings.subtotal_type === 'line') {
			break
		}

		if (groupsBefore[i].report_settings.subtotal_type === 'area') {
			areaGroupsBefore.push(i + 1)
		}
	}

	return areaGroupsBefore
}

const lookUpForSubtotal = function (evDataService, obj, column, columnNumber) {
	var result

	var flatList = evDataService.getFlatList()
	var parents = evRvCommonHelper.getParents(obj.___parentId, evDataService)

	var firstOpenParent
	var i

	for (i = 0; i < parents.length; i = i + 1) {
		if (parents[i].___is_open === true) {
			firstOpenParent = parents[i - 1]
			break
		}
	}

	for (i = obj.___flat_list_index; i >= 0; i = i - 1) {
		if (
			flatList[i].___type === 'subtotal' &&
			flatList[i].___parentId === firstOpenParent.___id
		) {
			result = flatList[i]
			break
		}
	}

	return result
}

const getContextDataForRowAction = function (
	reportOptions,
	rowObject,
	entityType
) {
	let effective_date = reportOptions.report_date
	let report_date = null
	let report_start_date = null

	if (entityType === 'balance-report') {
		report_date = reportOptions.report_date
	}

	if (entityType === 'pl-report') {
		report_date = reportOptions.report_date
		report_start_date = reportOptions.pl_first_date
	}

	if (entityType === 'transaction-report') {
		report_date = reportOptions.end_date
		report_start_date = reportOptions.begin_date
		effective_date = rowObject['accounting_date']
	}

	let contextData = {
		effective_date: effective_date,
		position_size: null,
		pricing_currency: null,
		accrued_currency: null,
		instrument: null,
		portfolio: null,
		account: null,
		strategy1: null,
		strategy2: null,
		strategy3: null,

		currency: null,
		report_date: report_date,
		report_start_date: report_start_date,
		pricing_policy: null,
		allocation_balance: null,
		allocation_pl: null,
	}

	if (rowObject.item_type === 2) {
		// currency

		contextData.currency = rowObject['currency.id']
		contextData.currency_object = {
			id: rowObject['currency_object.id'],
			name: rowObject['currency_object.name'],
			user_code: rowObject['currency_object.user_code'],
			content_type: 'currencies.currency',
		}
	}

	if (rowObject['position_size']) {
		contextData.position_size = rowObject['position_size']
	}

	if (reportOptions['pricing_policy']) {
		contextData.pricing_policy = reportOptions.pricing_policy
		contextData.pricing_policy_object = Object.assign(
			{},
			reportOptions.pricing_policy_object
		)
	}

	/* if (rowObject['pricing_currency.id']) {
			contextData.pricing_currency = rowObject['pricing_currency.id'];
			contextData.pricing_currency_object = {
				id: rowObject['pricing_currency.id'],
				name: rowObject['pricing_currency.name'],
				user_code: rowObject['pricing_currency.user_code'],
				content_type: "currencies.currency"
			};
		} */

	if (rowObject['instrument.pricing_currency.id']) {
		contextData.pricing_currency = rowObject['instrument.pricing_currency.id']
		contextData.pricing_currency_object = {
			id: rowObject['instrument.pricing_currency.id'],
			name: rowObject['instrument.pricing_currency.name'],
			user_code: rowObject['instrument.pricing_currency.user_code'],
			content_type: 'currencies.currency',
		}
	}

	if (rowObject['instrument.accrued_currency.id']) {
		contextData.accrued_currency = rowObject['instrument.accrued_currency.id']
		contextData.accrued_currency_object = {
			id: rowObject['instrument.accrued_currency.id'],
			name: rowObject['instrument.accrued_currency.name'],
			user_code: rowObject['instrument.accrued_currency.user_code'],
			content_type: 'currencies.currency',
		}
	}

	if (rowObject['instrument.id']) {
		contextData.instrument = rowObject['instrument.id']
		contextData.instrument_object = {
			id: rowObject['instrument.id'],
			name: rowObject['instrument.name'],
			user_code: rowObject['instrument.user_code'],
			content_type: 'instruments.instrument',
		}
	}

	if (rowObject['allocation_balance.id']) {
		contextData.allocation_balance = rowObject['allocation_balance.id']
		contextData.allocation_balance_object = {
			id: rowObject['allocation_balance.id'],
			name: rowObject['allocation_balance.name'],
			user_code: rowObject['allocation_balance.user_code'],
			content_type: 'instruments.instrument',
		}
	}

	if (rowObject['allocation_pl.id']) {
		contextData.allocation_pl = rowObject['allocation_pl.id']
		contextData.allocation_pl_object = {
			id: rowObject['allocation_pl.id'],
			name: rowObject['allocation_pl.name'],
			user_code: rowObject['allocation_pl.user_code'],
			content_type: 'instruments.instrument',
		}
	}

	if (rowObject['portfolio.id']) {
		contextData.portfolio = rowObject['portfolio.id']
		contextData.portfolio_object = {
			id: rowObject['portfolio.id'],
			name: rowObject['portfolio.name'],
			user_code: rowObject['portfolio.user_code'],
			content_type: 'portfolios.portfolio',
		}
	}

	if (rowObject['account.id']) {
		contextData.account = rowObject['account.id']
		contextData.account_object = {
			id: rowObject['account.id'],
			name: rowObject['account.name'],
			user_code: rowObject['account.user_code'],
			content_type: 'accounts.account',
		}
	}

	if (rowObject['strategy1.id']) {
		contextData.strategy1 = rowObject['strategy1.id']
		contextData.strategy1_object = {
			id: rowObject['strategy1.id'],
			name: rowObject['strategy1.name'],
			user_code: rowObject['strategy1.user_code'],
			content_type: 'strategies.strategy1',
		}
	}

	if (rowObject['strategy2.id']) {
		contextData.strategy2 = rowObject['strategy2.id']
		contextData.strategy2_object = {
			id: rowObject['strategy2.id'],
			name: rowObject['strategy2.name'],
			user_code: rowObject['strategy2.user_code'],
			content_type: 'strategies.strategy2',
		}
	}

	if (rowObject['strategy3.id']) {
		contextData.strategy3 = rowObject['strategy3.id']
		contextData.strategy3_object = {
			id: rowObject['strategy3.id'],
			name: rowObject['strategy3.name'],
			user_code: rowObject['strategy3.user_code'],
			content_type: 'strategies.strategy3',
		}
	}

	return contextData
}

export default {
	isFirst: isFirst,
	noLineGroups: noLineGroups,
	getAreaGroupsBefore: getAreaGroupsBefore,
	lookUpForSubtotal: lookUpForSubtotal,

	getContextDataForRowAction: getContextDataForRowAction,
}
