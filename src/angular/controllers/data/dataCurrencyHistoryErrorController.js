/**
 * Created by szhitenev on 03.03.2020.
 */

import currencyHistoryErrorService from '../../services/pricing/currencyHistoryErrorService'

export default function ($scope) {
	var vm = this

	vm.entityType = 'currency-history-error' // deprecated
	vm.contentType = 'pricing.currencyhistoryerror'
	vm.entityRaw = []

	vm.readyStatus = { content: false }

	vm.entityViewer = { extraFeatures: [] }

	vm.getList = function (options) {
		return currencyHistoryErrorService.getList(options).then(function (data) {
			return data
		})
	}

	vm.init = function () {
		vm.readyStatus.content = true
	}

	vm.init()
}
