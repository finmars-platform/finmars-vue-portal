/**
 * Created by vzubr on 10.09.2020.
 */

import dataProvidersService from '../../services/import/dataProvidersService'

var credentialTypes = {
	USERNAME_WITH_PASSWORD: 1,
	SSH_USERNAME_WITH_PRIVATE_KEY: 2,
	USERNAME_WITH_PASSWORD_AND_PRIVATE_KEY: 3,
}

export default function settingsGeneralDataProvidersController(
	$scope,
	$mdDialog,
	provider
) {
	var vm = this

	vm.provider = provider
	vm.userCodeIsTouched = false

	if (vm.provider.credential) {
		vm.id = vm.provider.credential.id
		vm.name = vm.provider.credential.name
		vm.user_code = vm.provider.credential.user_code
		vm.type = vm.provider.credential.type
		vm.username = vm.provider.credential.username
		vm.password = vm.provider.credential.password
		vm.key = vm.provider.credential.key
	} else {
		vm.id = null
		vm.name = 'Config for ' + vm.provider.name
		vm.user_code = 'Config for ' + vm.provider.name
		vm.type = credentialTypes.USERNAME_WITH_PASSWORD_AND_PRIVATE_KEY
		vm.username = ''
		vm.password = ''
		vm.key = ''
	}

	vm.cancel = function () {
		$mdDialog.hide('disagree')
	}

	vm.agree = function ($event) {
		var formData = new FormData()

		formData.append('name', vm.name)
		formData.append('user_code', vm.user_code)
		formData.append('type', vm.type)
		formData.append('provider', vm.provider.id)
		formData.append('username', vm.username)
		formData.append('password', vm.password)
		if (vm.public_key) {
			formData.append('path_to_public_key', vm.public_key)
		}
		if (vm.private_key) {
			formData.append('path_to_private_key', vm.private_key)
		}

		if (vm.id) {
			dataProvidersService.editCredential(vm.id, formData).then(function () {
				var message = 'Credential ' + vm.name + ' was saved'
				vm.info(message, $event)

				$mdDialog.hide('agree')
			})
		} else {
			dataProvidersService.createCredential(formData).then(function (res) {
				var message = 'Credential ' + vm.name + ' was created'
				vm.info(message, $event)

				$mdDialog.hide('agree')
			})
		}
	}

	vm.clear = function ($event) {
		var description = 'Are you sure to delete credential ' + vm.name + '?'

		$mdDialog
			.show({
				controller: 'WarningDialogController as vm',
				templateUrl: 'views/dialogs/warning-dialog-view.html',
				parent: angular.element(document.body),
				targetEvent: $event,
				clickOutsideToClose: false,
				locals: {
					warning: {
						title: 'Warning',
						description: description,
					},
				},
				preserveScope: true,
				autoWrap: true,
				skipHide: true,
				multiple: true,
			})
			.then(function (res) {
				if (res.status === 'agree') {
					dataProvidersService.deleteCredential(vm.id).then(function (res) {
						var message = 'Credential ' + vm.name + ' was deleted'
						vm.info(message, $event)

						$mdDialog.hide('agree')
					})
				}
			})
	}

	vm.info = function (message, $event) {
		return $mdDialog
			.show({
				controller: 'InfoDialogController as vm',
				templateUrl: 'views/info-dialog-view.html',
				parent: angular.element(document.body),
				targetEvent: $event,
				clickOutsideToClose: false,
				locals: {
					info: {
						title: 'Notification',
						description: message,
					},
				},
			})
			.then(function () {
				$mdDialog.hide('agree')
			})
	}

	vm.validateUserCode = function () {
		var expression = /^\w+$/

		if (expression.test(vm.user_code)) {
			vm.userCodeError = false
		} else {
			vm.userCodeError = true
		}
	}

	vm.init = function () {}

	vm.init()
}
