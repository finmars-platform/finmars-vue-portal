/**
 * Created by szhitenev on 15.06.2016.
 */

import currencyService from '../../services/currencyService'

export default function ($scope) {


	var vm = this

	vm.entityType = 'currency' // deprecated
	vm.contentType = 'currencies.currency'
	vm.entityRaw = []

	vm.readyStatus = { content: false }

	vm.entityViewer = { extraFeatures: [] }

	// currencyService.getList().then(function (data) {
	//     vm.entityRaw = data.results;
	//     vm.readyStatus.content = true;
	//     $scope.$apply();
	// });

	vm.getList = function (options) {
		return currencyService.getList(options).then(function (data) {
			return data
		})
	}

	vm.init = function () {
		vm.readyStatus.content = true
	}

	vm.init()
}
