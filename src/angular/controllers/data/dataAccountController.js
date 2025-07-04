/**
 * Created by szhitenev on 15.06.2016.
 */

import accountService from '../../services/accountService'

export default function ($scope) {


	var vm = this

	vm.entityType = 'account'
	vm.contentType = 'accounts.account'
	vm.entityRaw = []

	vm.readyStatus = { content: false }

	vm.entityViewer = { extraFeatures: [] }

	// accountService.getList().then(function (data) {
	//     vm.entityRaw = data.results;
	//     vm.readyStatus.content = true;
	//     ;
	//     $scope.$apply();
	// });

	vm.getList = function (options) {
		return accountService.getList(options).then(function (data) {
			return data
		})
	}

	vm.init = function () {
		vm.readyStatus.content = true
	}

	vm.init()
}
