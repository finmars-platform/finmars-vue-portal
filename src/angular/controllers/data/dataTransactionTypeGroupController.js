/**
 * Created by szhitenev on 15.06.2016.
 */

import transactionTypeGroupService from '../../services/transaction/transactionTypeGroupService'

export default function ($scope) {
	console.log(
		'{"controller": "DataTransactionTypeGroupController", status: "initialized"}'
	)

	var vm = this

	vm.readyStatus = { content: false }

	vm.entityType = 'transaction-type-group' // deprecated
	vm.contentType = 'transactions.transactiontypegroup'
	vm.entityRaw = []

	vm.entityViewer = { extraFeatures: [] }

	// transactionTypeGroupService.getList().then(function(data){
	//     vm.entityRaw = data.results;
	//     vm.readyStatus.content = true;
	//     $scope.$apply();
	// });

	vm.getList = function (options) {
		return transactionTypeGroupService.getList(options).then(function (data) {
			return data
		})
	}

	vm.init = function () {
		vm.readyStatus.content = true
	}

	vm.init()
}
