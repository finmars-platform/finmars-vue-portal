/**
 * Created by szhitenev on 20.05.2020.
 */

import bloombergDataProviderService from '@/angular/services/data-providers/bloombergDataProviderService'

export default function settingsGeneralDataProvidersBloombergController(
	$scope,
	$stateParams,
	$mdDialog,
	$state
) {
	var vm = this

	vm.itemId = $stateParams.id

	vm.item = {}

	vm.readyStatus = { item: false }

	vm.checkExtension = function ($event) {
		vm.wronExtensions = true

		if (vm.item && vm.item.p12cert) {
			var extension = vm.item.p12cert.name.split('.')[1]
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
							vm.item.p12cert = null
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

		formData.append('p12cert', vm.item.p12cert)
		formData.append('password', vm.item.password)

		if (!vm.wronExtensions) {
			if (vm.item.id) {
				bloombergDataProviderService
					.updateCredential(vm.item.id, formData)
					.then(function (data) {
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
				bloombergDataProviderService
					.createCredential(formData)
					.then(function (data) {
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
			}
		}
	}

	vm.getItem = function () {
		bloombergDataProviderService
			.getCredentialByKey(vm.itemId)
			.then(function (data) {
				vm.item = data

				vm.readyStatus.item = true
				$scope.$apply()
			})
	}

	vm.init = function () {
		if (vm.itemId === 'new') {
			vm.readyStatus.item = true
		} else {
			vm.getItem()
		}
	}

	vm.init()
}
