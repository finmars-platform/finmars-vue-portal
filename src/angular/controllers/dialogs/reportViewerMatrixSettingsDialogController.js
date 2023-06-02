/**
 * Created by mevstratov on 09.08.2019
 */

export default function ($scope, $mdDialog, data) {
	var vm = this

	vm.attributeDataService = data.attributeDataService
	vm.evDataService = data.evDataService

	vm.entityType = vm.evDataService.getEntityType()

	vm.settings = {}

	if (data.settings) {
		vm.settings = data.settings
	}

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.save = function () {
		$mdDialog.hide({ status: 'agree', data: { settings: vm.settings } })
	}

	vm.getAttributes = function () {
		vm.attributes = vm.attributeDataService.getAllAttributesByEntityType(
			vm.entityType
		)

		vm.numericAttributes = vm.attributes.filter(function (item) {
			return item.value_type === 20
		})
	}

	vm.openNumberFormatSettings = function ($event) {
		$mdDialog
			.show({
				controller: 'NumberFormatSettingsDialogController as vm',
				templateUrl: 'views/dialogs/number-format-settings-dialog-view.html',
				targetEvent: $event,
				multiple: true,
				locals: {
					data: {
						settings: vm.settings.number_format,
					},
				},
			})
			.then(function (res) {
				if (res.status === 'agree') {
					vm.settings.number_format = res.data

					console.log(res)
				}
			})
	}

	vm.init = function () {
		vm.getAttributes()
	}

	vm.init()
}
