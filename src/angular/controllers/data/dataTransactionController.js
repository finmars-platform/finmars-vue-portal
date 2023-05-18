/**
 * Created by szhitenev on 15.06.2016.
 */

import transactionService from '../../services/transactionService'

export default function ($scope) {
	console.log(
		'{"controller": "DataTransactionController", status: "initialized"}'
	)

	var vm = this

	vm.entityType = 'transaction' // deprecated
	vm.contentType = 'transactions.transaction'
	vm.entityRaw = []

	vm.readyStatus = { content: false }

	vm.entityViewer = { extraFeatures: [] }

	// transactionService.getList().then(function(data){
	//     vm.entityRaw = data.results;
	//     vm.readyStatus.content = true;
	//     $scope.$apply();
	// });

	vm.getList = function (options) {
		return transactionService.getList(options).then(function (data) {
			return data
		})
	}

	vm.init = function () {
		vm.readyStatus.content = true
	}

	vm.init()
}
