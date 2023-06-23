/**
 * Created by szhitenev on 03.03.2020.
 */

import priceHistoryErrorService from '../../services/pricing/priceHistoryErrorService'

export default function ($scope) {
	var vm = this

	vm.entityType = 'price-history-error' // deprecated
	vm.contentType = 'pricing.pricehistoryerror'

	vm.entityRaw = []

	vm.readyStatus = { content: false }

	vm.entityViewer = { extraFeatures: [] }

	vm.getList = function (options) {
		return priceHistoryErrorService.getList(options).then(function (data) {
			return data
		})
	}

	vm.init = function () {
		vm.readyStatus.content = true
	}

	vm.init()
}
