/**
 * Created by szhitenev on 17.08.2016.
 */

import uiService from '@/angular/services/uiService'

export default function ($scope, $mdDialog) {
	var vm = this

	vm.items = []

	vm.readyStatus = { content: false }

	vm.getList = function () {
		vm.readyStatus.content = false

		uiService.getConfigurationList().then(function (data) {
			vm.items = data.results

			vm.readyStatus.content = true

			$scope.$apply()
		})
	}

	vm.editItem = function ($event, item) {
		$mdDialog
			.show({
				controller: 'EditConfigurationDialogController as vm',
				templateUrl: 'views/dialogs/edit-configuration-dialog-view.html',
				targetEvent: $event,
				preserveScope: true,
				locals: {
					item: item,
				},
				autoWrap: true,
				skipHid: true,
			})
			.then(function (res) {
				if (res.status === 'agree') {
					vm.getList()
				}
			})
	}

	vm.deleteItem = function ($event, item) {
		$mdDialog
			.show({
				controller: 'WarningDialogController as vm',
				templateUrl: 'views/dialogs/warning-dialog-view.html',
				targetEvent: $event,
				locals: {
					warning: {
						title: 'Warning!',
						description: 'Are you sure to delete ' + item.name,
					},
				},
				preserveScope: true,
				autoWrap: true,
				skipHide: true,
				multiple: true,
			})
			.then(function (res) {
				if (res.status === 'agree') {
					uiService.deleteConfigurationByKey(item.id)
					setTimeout(function () {
						vm.getList()
					}, 100)
				}
			})
	}

	vm.addItem = function ($event) {
		$mdDialog
			.show({
				controller: 'CreateConfigurationDialogController as vm',
				templateUrl: 'views/dialogs/create-configuration-dialog-view.html',
				targetEvent: $event,
				preserveScope: true,
				autoWrap: true,
				skipHid: true,
			})
			.then(function (res) {
				if (res.status === 'agree') {
					vm.getList()
				}
			})
	}

	vm.init = function () {
		vm.getList()
	}

	vm.init()
}
