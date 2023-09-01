/**
 * Created by szhitenev on 29.09.2016.
 */

import transactionClassRepository from '@/angular/repositories/transaction/transactionClassRepository'

var getList = function (options) {
	return transactionClassRepository.getList(options)
}

var getListSync = function () {
	return transactionClassRepository.getListSync()
}

export default {
	getList: getList,
	getListSync: getListSync,
}
