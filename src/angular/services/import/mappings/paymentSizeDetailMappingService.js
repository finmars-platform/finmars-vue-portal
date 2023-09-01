/**
 * Created by szhitenev on 19.08.2016.
 */

import paymentSizeDetailMappingRepository from '@/angularpositories/import/mappings/paymentSizeDetailMappingRepository'

var getList = function (options) {
	return paymentSizeDetailMappingRepository.getList(options)
}

var getByKey = function (id) {
	return paymentSizeDetailMappingRepository.getByKey(id)
}

var create = function (map) {
	return paymentSizeDetailMappingRepository.create(map)
}

var update = function (id, map) {
	return paymentSizeDetailMappingRepository.update(id, map)
}

var deleteByKey = function (id) {
	return paymentSizeDetailMappingRepository.deleteByKey(id)
}

export default {
	getList: getList,
	getByKey: getByKey,
	create: create,
	update: update,
	deleteByKey: deleteByKey,
}
