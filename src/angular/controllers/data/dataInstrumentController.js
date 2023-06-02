/**
 * Created by szhitenev on 15.06.2016.
 */

export default function ($scope, instrumentService) {
	console.log(
		'{"controller": "DataInstrumentController", status: "initialized"}'
	)

	var vm = this

	vm.entityType = 'instrument' // deprecated
	vm.contentType = 'instruments.instrument'
	vm.entityRaw = []

	vm.readyStatus = { content: false }

	vm.entityViewer = { extraFeatures: [] }

	//vm.entityViewer.extraFeatures.push({
	//    id: 1,
	//    caption: 'Open timetable editor',
	//    icon: 'schedule',
	//    templateUrl: 'views/',
	//    isOpened: false
	//});

	// instrumentService.getList().then(function (data) {
	//     vm.entityRaw = data.results;
	//     vm.readyStatus.content = true;
	//     $scope.$apply();
	// });

	vm.getList = function (options) {
		return instrumentService.getList(options).then(function (data) {
			return data
		})
	}

	vm.init = function () {
		vm.readyStatus.content = true
	}

	vm.init()
}
