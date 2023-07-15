/**
 * Created by szhitenev on 17.08.2016.
 */

import logService from '@/angular/../core/services/logService'

import instrumentDownloadSchemeService from '@/angular/services/import/instrumentDownloadSchemeService'

export default function ($scope, $mdDialog) {
	logService.controller(
		'SettingsGeneralInstrumentImportController',
		'initialized'
	)

	var vm = this

	vm.readyStatus = { instrumentSchemes: false }
	vm.instrumentSchemes = []

	vm.getList = function () {
		vm.readyStatus.instrumentSchemes = false
		instrumentDownloadSchemeService.getList().then(function (data) {
			vm.instrumentSchemes = data.results
			vm.readyStatus.instrumentSchemes = true
			$scope.$apply()
		})
	}

	vm.getList()

	vm.addScheme = function ($event) {
		$mdDialog
			.show({
				controller: 'InstrumentDownloadSchemeAddDialogController as vm',
				templateUrl:
					'views/dialogs/instrument-download/instrument-download-scheme-dialog-view.html',
				targetEvent: $event,
			})
			.then(function (res) {
				if (res.status === 'agree') {

					vm.getList()
				}
			})
	}

	vm.editScheme = function ($event, item) {


		$mdDialog
			.show({
				controller: 'InstrumentDownloadSchemeEditDialogController as vm',
				templateUrl:
					'views/dialogs/instrument-download/instrument-download-scheme-dialog-view.html',
				targetEvent: $event,
				locals: {
					schemeId: item.id,
				},
			})
			.then(function (res) {
				if (res && res.status === 'agree') {

					instrumentDownloadSchemeService
						.update(item.id, res.data)
						.then(function () {
							vm.getList()
							$scope.$apply()
						})
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

					instrumentDownloadSchemeService.deleteByKey(item.id)
					setTimeout(function () {
						vm.getList()
					}, 100)
				}
			})
	}
}
