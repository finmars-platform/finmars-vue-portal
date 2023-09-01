/**
 * Created by szhitenev on 15.06.2016.
 */

import counterpartyGroupService from '../../services/counterpartyGroupService'

export default function ($scope) {
	console.log(
		'{"controller": "DataCounterpartyGroupController", status: "initialized"}'
	)

	var vm = this

	vm.entityType = 'counterparty-group' // deprecated
	vm.contentType = 'counterparties.counterpartygroup'
	vm.entityRaw = []

	vm.readyStatus = { content: false }

	vm.entityViewer = { extraFeatures: [] }

	// counterpartyGroupService.getList().then(function(data){
	//     vm.entityRaw = data.results;
	//     vm.readyStatus.content = true;
	//     $scope.$apply();
	// });

	vm.getList = function (options) {
		return counterpartyGroupService.getList(options).then(function (data) {
			return data
		})
	}

	vm.init = function () {
		vm.readyStatus.content = true
	}

	vm.init()
}
