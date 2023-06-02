/**
 * Created by szhitenev on 15.06.2016.
 */

import complexTransactionService from '../../services/transaction/complexTransactionService'

export default function ($scope) {
	console.log(
		'{"controller": "DataComplexTransactionController", status: "initialized"}'
	)

	var vm = this

	vm.entityType = 'complex-transaction'
	vm.contentType = 'transactions.complextransaction'
	vm.entityRaw = []

	vm.readyStatus = { content: false }

	vm.entityViewer = { extraFeatures: [] }

	// complexTransactionService.getList().then(function(data){
	//     vm.entityRaw = data.results;
	//     vm.readyStatus.content = true;
	//     $scope.$apply();
	// });

	vm.getList = function (options) {
		return complexTransactionService.getList(options).then(function (data) {
			return data
		})
	}

	vm.init = function () {
		vm.readyStatus.content = true
	}

	vm.init()
}
