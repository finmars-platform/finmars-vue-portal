/**
 * Created by szhitenev on 18.08.2022.
 */

import baseUrlService from '../../services/baseUrlService'
import toastNotificationService from '@/angular/core/services/toastNotificationService'

var baseUrl = baseUrlService.resolve()

export default function updateCenterController(
	$scope,
	authorizerService,
	globalDataService
) {
	var vm = this

	vm.items = []
	vm.readyStatus = { data: false }

	vm.latestVersion = null

	vm.getVersions = function () {
		authorizerService.getVersions().then(function (data) {
			vm.versions = data.results

			vm.readyStatus.data = true

			if (vm.versions.length) {
				vm.latestVersion = vm.versions[0]

				vm.versions.forEach(function (version) {
					if (version.is_latest) {
						vm.latestVersion = version
					}
				})
			}

			$scope.$apply()
		})
	}

	vm.toggleAutoUpdate = function () {
		vm.currentMasterUser.auto_update = !vm.currentMasterUser.auto_update

		authorizerService
			.updateMasterUser(vm.currentMasterUser.id, vm.currentMasterUser)
			.then(function () {
				toastNotificationService.info('Saved')
			})
	}

	vm.updateFinmars = function () {
		vm.processing = true

		authorizerService
			.updateFinmars(vm.currentMasterUser.base_api_url, vm.latestVersion.name)
			.then(function (data) {
				vm.processing = false

				toastNotificationService.info('Update Initialized')

				$scope.$apply()
			})
	}

	vm.init = function () {
		vm.getVersions()

		vm.currentMasterUser = globalDataService.getMasterUser()
	}

	vm.init()
}
