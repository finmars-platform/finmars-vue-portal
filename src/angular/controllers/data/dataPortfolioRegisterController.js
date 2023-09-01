/**
 * Created by szhitenev on 15.06.2016.
 */

import portfolioRegisterService from '../../services/portfolioRegisterService'

export default function ($scope) {
	var vm = this

	vm.entityType = 'portfolio-register' // deprecated
	vm.contentType = 'portfolios.portfolioregister'
	vm.entityRaw = []

	vm.readyStatus = { content: false }

	vm.entityViewer = { extraFeatures: [] }

	// portfolioService.getList().then(function (data) {
	//     vm.entityRaw = data.results;
	//     vm.readyStatus.content = true;
	//     $scope.$apply();
	// });

	vm.getList = function (options) {
		return portfolioRegisterService.getList(options).then(function (data) {
			return data
		})
	}

	vm.init = function () {
		vm.readyStatus.content = true
	}

	vm.init()
}
