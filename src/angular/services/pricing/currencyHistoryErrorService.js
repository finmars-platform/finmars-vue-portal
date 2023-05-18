/**
 * Created by szhitenev on 03.03.2020.
 */

import currencyHistoryErrorRepository from '../../repositories/pricing/currencyHistoryErrorRepository'

var getList = function (options) {
	return currencyHistoryErrorRepository.getList(options)
}

var getByKey = function (id) {
	return currencyHistoryErrorRepository.getByKey(id)
}

var update = function (id, account) {
	return currencyHistoryErrorRepository.update(id, account)
}

var deleteByKey = function (id) {
	return currencyHistoryErrorRepository.deleteByKey(id)
}

var deleteBulk = function (data) {
	return currencyHistoryErrorRepository.deleteBulk(data)
}

export default {
	getList: getList,
	getByKey: getByKey,
	update: update,
	deleteByKey: deleteByKey,
	deleteBulk: deleteBulk,
}
