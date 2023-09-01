/**
 * Created by szhitenev on 15.06.2016.
 */

import transactionTypeService from '../../services/transactionTypeService'

export default function ($scope) {
	console.log(
		'{"controller": "DataTransactionController", status: "initialized"}'
	)

	var vm = this

	vm.readyStatus = { content: false }

	vm.entityType = 'transaction-type' // deprecated
	vm.contentType = 'transactions.transactiontype'
	vm.entityRaw = []

	vm.entityViewer = { extraFeatures: [] }

	// transactionTypeService.getListLight().then(function(data){
	//     vm.entityRaw = data.results;
	//     vm.readyStatus.content = true;
	//     $scope.$apply();
	// });

	vm.getList = function (options) {
		return transactionTypeService.getListLight(options).then(function (data) {
			return data
		})
	}

	vm.init = function () {
		vm.readyStatus.content = true
	}

	vm.init()
}
