/**
 * Created by szhitenev on 15.06.2016.
 */

export default function ($scope, currencyHistoryService) {
	console.log(
		'{"controller": "DataCurrencyHistoryController", status: "initialized"}'
	)

	var vm = this

	vm.entityType = 'currency-history' // deprecated
	vm.contentType = 'currencies.currencyhistory'
	vm.entityRaw = []

	vm.readyStatus = { content: false }

	vm.entityViewer = { extraFeatures: [] }

	// currencyHistoryService.getList().then(function(data){
	//     vm.entityRaw = data.results;
	//     vm.readyStatus.content = true;
	//     $scope.$apply();
	// });

	vm.getList = function (options) {
		return currencyHistoryService.getList(options).then(function (data) {
			return data
		})
	}

	vm.init = function () {
		vm.readyStatus.content = true
	}

	vm.init()
}
