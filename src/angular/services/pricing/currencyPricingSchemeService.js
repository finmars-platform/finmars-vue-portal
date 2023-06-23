/**
 * Created by szhitenev on 04.05.2016.
 */

import currencyPricingSchemeRepository from '../../repositories/pricing/currencyPricingSchemeRepository'

var getTypes = function (options) {
	return currencyPricingSchemeRepository.getTypes(options)
}

var getList = function (options) {
	return currencyPricingSchemeRepository.getList(options)
}

var getByKey = function (id) {
	return currencyPricingSchemeRepository.getByKey(id)
}

var create = function (account) {
	return currencyPricingSchemeRepository.create(account)
}

var update = function (id, account) {
	return currencyPricingSchemeRepository.update(id, account)
}

var deleteByKey = function (id) {
	return currencyPricingSchemeRepository.deleteByKey(id)
}

export default {
	getTypes: getTypes,

	getList: getList,
	getByKey: getByKey,
	create: create,
	update: update,
	deleteByKey: deleteByKey,
}
