/**
 * Created by szhitenev on 15.06.2016.
 */

import responsibleService from '../../services/responsibleService'

export default function ($scope) {
	console.log(
		'{"controller": "DataResponsibleController", status: "initialized"}'
	)

	var vm = this

	vm.entityType = 'responsible' // deprecated
	vm.contentType = 'counterparties.responsible'

	vm.entityRaw = []

	vm.readyStatus = { content: false }

	vm.entityViewer = { extraFeatures: [] }

	// responsibleService.getList().then(function(data){
	//     vm.entityRaw = data.results;
	//     vm.readyStatus.content = true;
	//     $scope.$apply();
	// });

	vm.getList = function (options) {
		return responsibleService.getList(options).then(function (data) {
			return data
		})
	}

	vm.init = function () {
		vm.readyStatus.content = true
	}

	vm.init()
}
