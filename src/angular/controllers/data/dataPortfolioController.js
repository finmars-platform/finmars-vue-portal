/**
 * Created by szhitenev on 15.06.2016.
 */

import portfolioService from '../../services/portfolioService'

export default function ($scope) {
	var vm = this

	vm.entityType = 'portfolio' // deprecated
	vm.contentType = 'portfolios.portfolio'
	vm.entityRaw = []

	vm.readyStatus = { content: false }

	vm.entityViewer = { extraFeatures: [] }

	// portfolioService.getList().then(function (data) {
	//     vm.entityRaw = data.results;
	//     vm.readyStatus.content = true;
	//     $scope.$apply();
	// });

	vm.getList = function (options) {
		return portfolioService.getList(options).then(function (data) {
			return data
		})
	}

	vm.init = function () {
		vm.readyStatus.content = true
	}

	vm.init()
}
