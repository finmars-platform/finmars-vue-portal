/**
 * Created by szhitenev on 09.08.2016.
 */

import logService from '@/angular/core/services/logService'

import strategyGroupService from '../../services/strategyGroupService'

export default function ($scope, $stateParams) {
	logService.controller('DataStrategyGroupController', 'initialized')

	console.log('$stateParams', $stateParams)

	var vm = this

	vm.readyStatus = { content: false }

	vm.strategyNumber = $stateParams.strategyNumber // deprecated
	vm.contentType = 'strategies.strategy' + vm.strategyNumber

	vm.entityType = 'strategy-' + vm.strategyNumber + '-group'
	vm.entityRaw = []

	vm.entityViewer = { extraFeatures: [] }

	// strategyGroupService.getList(vm.strategyNumber).then(function(data){
	//     vm.entityRaw = data.results;
	//     vm.readyStatus.content = true;
	//     console.log('vm.entityRaw', vm.entityRaw);
	//     $scope.$apply();
	// });

	vm.getList = function (options) {
		return strategyGroupService
			.getList(vm.strategyNumber, options)
			.then(function (data) {
				return data
			})
	}

	vm.init = function () {
		vm.readyStatus.content = true
	}

	vm.init()
}
