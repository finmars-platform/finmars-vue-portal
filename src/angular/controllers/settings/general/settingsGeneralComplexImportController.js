/**
 * Created by szhitenev on 17.08.2016.
 */

import complexImportSchemeService from '@/angular/services/import/complexImportSchemeService'

export default function settingsGeneralComplexImportController(
	$scope,
	$mdDialog
) {
	var vm = this

	vm.readyStatus = { schemes: false }
	vm.schemes = []

	vm.getList = function () {
		vm.readyStatus.schemes = false
		complexImportSchemeService.getList().then(function (data) {
			vm.schemes = data.results
			vm.readyStatus.schemes = true
			$scope.$apply()
		})
	}

	vm.getList()

	vm.addScheme = function ($event) {
		$mdDialog
			.show({
				controller: 'ComplexImportSchemeCreateDialogController as vm',
				templateUrl:
					'views/dialogs/complex-import/complex-import-scheme-create-dialog-view.html',
				targetEvent: $event,
				locals: {
					data: {},
				},
			})
			.then(function (res) {
				console.log('res', res)

				if (res.status === 'agree') {
					console.log('res', res.data)
					vm.getList()
				}
			})
	}

	vm.editScheme = function ($event, item) {
		$mdDialog
			.show({
				controller: 'ComplexImportSchemeEditDialogController as vm',
				templateUrl:
					'views/dialogs/complex-import/complex-import-scheme-edit-dialog-view.html',
				targetEvent: $event,
				locals: {
					schemeId: item.id,
				},
			})
			.then(function (res) {
				if (res && res.status === 'agree') {
					console.log('res', res.data)

					vm.getList()
				}
			})
	}

	vm.deleteScheme = function ($event, item) {
		$mdDialog
			.show({
				controller: 'WarningDialogController as vm',
				templateUrl: 'views/dialogs/warning-dialog-view.html',
				targetEvent: $event,
				locals: {
					warning: {
						title: 'Warning!',
						description: 'Are you sure to delete ' + item['user_code'],
					},
				},
				preserveScope: true,
				autoWrap: true,
				skipHide: true,
				multiple: true,
			})
			.then(function (res) {
				if (res.status === 'agree') {
					console.log('res', res.data)
					complexImportSchemeService.deleteByKey(item.id)
					setTimeout(function () {
						vm.getList()
					}, 100)
				}
			})
	}
}
