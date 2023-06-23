/**
 * Created by mevstratov on 28.06.2019.
 */

export default function ecosystemDefaultSettingsController(
	$scope,
	$mdDialog,
	toastNotificationService,
	usersService,
	ecosystemDefaultService,
	fieldResolverService
) {
	var vm = this

	vm.readyStatus = { content: false, processing: false }
	vm.default = null

	vm.portfolio_fields = []

	vm.getRelation = function (entityType, key, fieldsKey) {
		console.log('entityType, key, fieldsKey', entityType, key, fieldsKey)
		console.log('vm', vm)

		if (vm[fieldsKey].length <= 1) {
			fieldResolverService
				.getFields(key, {
					entityType: entityType,
					key: key,
				})
				.then(function (res) {
					vm[fieldsKey] = res.data
					$scope.$apply()
				})
		}
	}

	vm.getList = function () {
		vm.readyStatus.content = false

		ecosystemDefaultService.getList().then(function (data) {
			console.log('data', data)

			if (data.results.length) {
				vm.default = data.results[0]

				Object.keys(vm.default).forEach(function (key) {
					if (key.indexOf('_object') !== -1) {
						// e.g. portfolio_object becomes just portfolio
						var field = key.split('_object')[0]

						// create a new property portfolio_fields and set it to a value from portfolio_object
						vm[field + '_fields'] = [vm.default[key]]
					}
				})
			}

			vm.readyStatus.content = true

			$scope.$apply()
		})
	}

	vm.save = function () {
		vm.readyStatus.processing = true

		ecosystemDefaultService
			.update(vm.default.id, vm.default)
			.then(function (data) {
				vm.readyStatus.processing = false

				toastNotificationService.success('Success! Changes have been saved')
			})
			.catch(function (error) {
				$mdDialog({
					controller: 'WarningDialogController as vm',
					templateUrl: 'views/dialogs/warning-dialog-view.html',
					clickOutsideToClose: false,
					locals: {
						warning: {
							title: 'Error',
							description: 'Error occurred while trying to save fields',
						},
					},
				})
			})
	}

	vm.deleteUsercodeGroup = function ($event, item) {
		usersService.deleteUserCodePrefixByKey(item.id).then(function (data) {
			vm.getUsercodeGroups()
		})
	}

	vm.createNewUserCodeGroup = function ($event) {
		usersService
			.createUsercodePrefix({ value: vm.groupPrefix })
			.then(function (data) {
				vm.groupPrefix = ''

				vm.getUsercodeGroups()
			})
	}

	vm.getUsercodeGroups = function () {
		usersService.getUsercodePrefixList().then(function (data) {
			vm.usercodeGroups = data.results

			$scope.$apply()
		})
	}

	vm.init = function () {
		vm.getList()

		vm.getUsercodeGroups()
	}

	vm.init()
}
