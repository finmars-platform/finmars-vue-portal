/**
 * Created by szhitenev on 17.08.2016.
 */

import logService from '@/angular/../core/services/logService'

import dataProvidersService from '@/angular/services/import/dataProvidersService'

export default function ($scope, $stateParams, $mdDialog, $state) {
	logService.controller(
		'SettingsGeneralDataProvidersConfigController',
		'initialized'
	)

	var vm = this

	vm.providerId = $stateParams.dataProviderId

	vm.provider = {}

	vm.readyStatus = { provider: false }

	dataProvidersService.getConfig(vm.providerId).then(function (data) {
		vm.provider = data.results[0]

		vm.readyStatus.provider = true
		$scope.$apply()
	})

	vm.checkExtension = function ($event) {
		vm.wronExtensions = true

		if (vm.provider && vm.provider.p12cert) {
			var extension = vm.provider.p12cert.name.split('.')[1]
			var allowedExtensions = ['pem', 'p12']

			if (allowedExtensions.indexOf(extension) === -1) {
				$mdDialog
					.show({
						controller: 'SuccessDialogController as vm',
						templateUrl: 'views/dialogs/success-dialog-view.html',
						targetEvent: $event,
						locals: {
							success: {
								title: 'Warning!',
								description: 'You are trying to load incorrect file',
							},
						},
						multiple: true,
						preserveScope: true,
						autoWrap: true,
						skipHide: true,
					})
					.then(function (res) {
						if (res.status === 'agree') {
							vm.provider.p12cert = null
						}
					})
			} else {
				vm.wronExtensions = false
			}
		}
	}

	vm.saveConfig = function ($event) {
		$event.preventDefault()
		$event.stopPropagation()

		var formData = new FormData()

		if (!vm.provider.provider) {
			vm.provider.provider = 1
		}

		formData.append('p12cert', vm.provider.p12cert)
		formData.append('password', vm.provider.password)
		formData.append('provider', vm.provider.provider)

		if (!vm.wronExtensions) {
			if (vm.provider.id) {
				dataProvidersService
					.setConfig(vm.provider.id, formData)
					.then(function (data) {
						console.log('test!', data)

						$mdDialog
							.show({
								controller: 'SuccessDialogController as vm',
								templateUrl: 'views/dialogs/success-dialog-view.html',
								targetEvent: $event,
								locals: {
									success: {
										title: '',
										description:
											'You have you have successfully add sertificate',
									},
								},
								multiple: true,
								preserveScope: true,
								autoWrap: true,
								skipHide: true,
							})
							.then(function () {
								$state.go('app.portal.settings.general.data-providers')
							})
					})
			} else {
				dataProvidersService.createConfig(formData).then(function (data) {
					$mdDialog
						.show({
							controller: 'SuccessDialogController as vm',
							templateUrl: 'views/dialogs/success-dialog-view.html',
							targetEvent: $event,
							locals: {
								success: {
									title: '',
									description: 'You have you have successfully add sertificate',
								},
							},
							multiple: true,
							preserveScope: true,
							autoWrap: true,
							skipHide: true,
						})
						.then(function () {
							$state.go('app.portal.settings.general.data-providers')
						})
				})
			}
		}
	}
}
