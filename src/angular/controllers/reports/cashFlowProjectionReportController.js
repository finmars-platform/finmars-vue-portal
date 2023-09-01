/**
 * Created by szhitenev on 01.11.2016.
 */

export default function ($scope, reportService) {
	console.log(
		'{"controller": "CashFlowProjectionReportController", status: "initialized"}'
	)

	var vm = this

	vm.entityType = 'cash-flow-projection-report'
	vm.entityRaw = []

	vm.isReport = true

	vm.readyStatus = { content: false }

	vm.entityViewer = { extraFeatures: [] }

	vm.readyStatus.content = true

	//reportService.getList().then(function (data) {
	//    vm.entityRaw = data.items;
	//    vm.readyStatus.content = true;
	//    $scope.$apply();
	//});

	vm.getList = function (options) {
		return reportService.getList(options).then(function (data) {
			return data
		})
	}
}
