/**
 * Created by szhitenev on 17.08.2016.
 */

import dataProvidersService from '@/angular/services/import/dataProvidersService'

import bloombergDataProviderService from '@/angular/services/data-providers/bloombergDataProviderService'

export default function settingsGeneralDataProvidersController(
	$scope,
	$mdDialog
) {
	var vm = this

	vm.dataProviders = []
	vm.personalDataProviders = []

	vm.testCertificateConfig = {}
	vm.testCertificateProcessing = false

	vm.readyStatus = {
		dataProviders: false,
		configs: false,
		personalDataProviders: false,
		credentials: false,
	}

	vm.getProviders = function () {
		dataProvidersService.getList().then(function (data) {
			vm.dataProviders = data
			vm.readyStatus.dataProviders = true

			vm.getConfigs()

			$scope.$apply()
		})
	}

	vm.getConfigs = function () {
		dataProvidersService.getConfigs().then(function (data) {
			vm.configs = data.results
			vm.readyStatus.configs = true

			vm.dataProviders.forEach(function (provider) {
				provider.has_p12cert = false

				vm.configs.forEach(function (config) {
					if (provider.id === config.provider) {
						provider.has_p12cert = config.has_p12cert
					}

					if (provider.id === config.provider) {
						provider.is_valid = config.is_valid
					}
				})
			})

			$scope.$apply()
		})
	}

	vm.getPersonalProvidersList = function () {
		dataProvidersService.getPersonalProvidersList().then(function (data) {
			vm.personalDataProviders = data
			vm.readyStatus.personalDataProviders = true

			vm.getCredentials()
		})
	}

	vm.getCredentials = function () {
		dataProvidersService.getCredentials().then(function (data) {
			vm.credentials = data.results
			vm.readyStatus.credentials = true

			vm.personalDataProviders.forEach(function (provider) {
				var lastModifiedCredential = vm.credentials
					.filter(function (credential) {
						return credential.provider === provider.id
					})
					.sort(function (first, second) {
						var firstDate = new Date(first.modified)
						var secondDate = new Date(second.modified)

						if (firstDate === secondDate) {
							return 0
						}

						return firstDate > secondDate ? -1 : 1
					})[0]

				provider.credential = lastModifiedCredential
			})

			$scope.$apply()
		})
	}

	vm.requestTestCertificate = function (resolve) {
		dataProvidersService
			.bloombergTestCertificate(vm.testCertificateConfig)
			.then(function (data) {
				vm.testCertificateConfig = data

				console.log('data', data)

				if (data.task_object.status === 'D') {
					resolve({ status: 'success' })
				} else if (data.task_object.status === 'E') {
					resolve({ status: 'error' })
				} else {
					setTimeout(function () {
						vm.requestTestCertificate(resolve)
					}, 1000)
				}
			})
	}

	vm.testBloombergCall = function ($event) {
		vm.testCertificateConfig = {}
		vm.testCertificateProcessing = true

		new Promise(function (resolve, reject) {
			vm.requestTestCertificate(resolve, {})
		}).then(function (data) {
			console.log('testBloombergCall data', data)

			vm.testCertificateProcessing = false
			$scope.$apply()

			if (data.status === 'success') {
				vm.getBloombergCredentialList()
			}

			if (data.status === 'error') {
				$mdDialog.show({
					controller: 'InfoDialogController as vm',
					templateUrl: 'views/dialogs/info-dialog-view.html',
					parent: angular.element(document.body),
					targetEvent: $event,
					preserveScope: true,
					autoWrap: true,
					multiple: true,
					skipHide: true,
					locals: {
						info: {
							title: 'Warning',
							description: 'Something wrong with Certificate/Password.',
						},
					},
				})
			}
		})
	}

	vm.getBloombergCredentialList = function () {
		vm.readyStatus.bloombergCredentials = false

		bloombergDataProviderService.getCredentialList().then(function (data) {
			vm.bloombergCredentials = data.results

			vm.readyStatus.bloombergCredentials = true

			if (!vm.bloombergCredentials.length) {
				vm.bloombergCredentials = [
					{
						id: 'new',
					},
				]
			}

			console.log('vm.bloombergCredentials', vm.bloombergCredentials)

			$scope.$apply()
		})
	}

	vm.editPersonalProvider = function ($event, provider) {
		$mdDialog
			.show({
				controller: 'SettingsPersonalDataProviderController as vm',
				templateUrl:
					'views/settings/personal-data-provider-config-settings-view.html',
				parent: angular.element(document.body),
				locals: {
					provider: provider,
				},
				targetEvent: $event,
				preserveScope: true,
				autoWrap: true,
				multiple: true,
				skipHide: true,
			})
			.then(function (status) {
				if (status === 'agree') {
					vm.getPersonalProvidersList()
				}
			})
	}

	vm.init = function () {
		vm.getProviders()
		vm.getBloombergCredentialList()
		vm.getPersonalProvidersList()
	}

	vm.init()
}
