/**
 * Created by szhitenev on 31.08.2021.
 */

import importInstrumentCbondsService from '../../services/import/importInstrumentCbondsService'
import toastNotificationService from '@/angular/core/services/toastNotificationService'

export default function instrumentDownloadCbondsController($scope, $mdDialog) {
	var vm = this

	vm.readyStatus = {
		processing: false,
	}
	vm.dataIsImported = false

	vm.config = {
		instrument_code: '',
		mode: 1,
	}

	vm.load = function ($event) {
		vm.readyStatus.processing = true
		//vm.config.task = 81;
		importInstrumentCbondsService
			.download(vm.config)
			.then(function (data) {
				vm.readyStatus.processing = false

				if (data.errors.length) {
					$mdDialog.show({
						controller: 'InfoDialogController as vm',
						templateUrl: 'views/dialogs/info-dialog-view.html',
						parent: angular.element(document.body),
						targetEvent: $event,
						clickOutsideToClose: false,
						locals: {
							info: {
								title: 'Error',
								description: data.errors[0],
							},
						},
						preserveScope: true,
						autoWrap: true,
						skipHide: true,
						multiple: true,
					})
				} else {
					toastNotificationService.success(
						'Instrument ' + vm.config.instrument_code + ' was imported'
					)
				}

				$scope.$apply()
			})
			.catch(function (reason) {
				console.log('reason %s', reason)

				$mdDialog.show({
					controller: 'WarningDialogController as vm',
					templateUrl: 'views/dialogs/warning-dialog-view.html',
					parent: angular.element(document.body),
					targetEvent: $event,
					clickOutsideToClose: false,
					locals: {
						warning: {
							title: 'Unhandle Exception',
							description: reason,
						},
					},
					preserveScope: true,
					autoWrap: true,
					skipHide: true,
					multiple: true,
				})

				vm.readyStatus.processing = false

				$scope.$apply()
			})
	}

	vm.init = function () {}

	vm.init()
}
