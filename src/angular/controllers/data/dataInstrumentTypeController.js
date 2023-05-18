/**
 * Created by szhitenev on 15.06.2016.
 */

import instrumentTypeService from '../../services/instrumentTypeService'

export default function ($scope) {
	console.log(
		'{"controller": "DataInstrumentTypeController", status: "initialized"}'
	)

	var vm = this

	vm.entityType = 'instrument-type' // deprecated
	vm.contentType = 'instruments.instrumenttype'
	vm.entityRaw = []

	vm.readyStatus = { content: false }

	vm.entityViewer = { extraFeatures: [] }

	// instrumentTypeService.getList().then(function (data) {
	//     vm.entityRaw = data.results;
	//     vm.readyStatus.content = true;
	//     $scope.$apply();
	// });

	vm.getList = function (options) {
		return instrumentTypeService.getList(options).then(function (data) {
			return data
		})
	}

	vm.init = function () {
		vm.readyStatus.content = true
	}

	vm.init()
}
