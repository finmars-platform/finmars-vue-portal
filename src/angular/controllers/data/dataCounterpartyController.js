/**
 * Created by szhitenev on 15.06.2016.
 */

import counterpartyService from '../../services/counterpartyService'

export default function ($scope) {
	console.log(
		'{"controller": "DataCounterpartytController", status: "initialized"}'
	)

	var vm = this

	vm.entityType = 'counterparty'
	vm.contentType = 'counterparties.counterparty'
	vm.entityRaw = []

	vm.readyStatus = { content: false }

	vm.entityViewer = { extraFeatures: [] }

	// counterpartyService.getList().then(function(data){
	//     vm.entityRaw = data.results;
	//     vm.readyStatus.content = true;
	//     $scope.$apply();
	// });

	vm.getList = function (options) {
		return counterpartyService.getList(options).then(function (data) {
			return data
		})
	}

	vm.init = function () {
		vm.readyStatus.content = true
	}

	vm.init()
}
