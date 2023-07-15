/**
 * Created by mevstratov on 22.04.2019.
 */

export default function ($scope, data, $mdDialog) {
	var vm = this

	var evDataService = {}

	var isEmptyLayout = false
	var entityType = undefined

	if (data) {
		evDataService = data.evDataService
		entityType = data.entityType
	}

	vm.saveLayout = function ($event) {

		if (data) {
			var listLayout = evDataService.getListLayout()

			if (!listLayout.hasOwnProperty('id')) {
				$mdDialog
					.show({
						controller: 'UiLayoutSaveAsDialogController as vm',
						templateUrl: 'views/dialogs/ui/ui-layout-save-as-view.html',
						parent: angular.element(document.body),
						targetEvent: $event,
						clickOutsideToClose: false,
						multiple: true,
						locals: {
							options: {
								complexSaveAsLayoutDialog: {
									entityType: entityType,
								},
							},
						},
					})
					.then(function (res) {
						if (res.status === 'agree') {
							$mdDialog.hide({
								status: 'save_layout',
								data: {
									layoutName: res.data.name,
									layoutUserCode: res.data.user_code,
								},
							})
						}
					})
			} else {
				$mdDialog.hide({ status: 'save_layout' })
			}
		} else {
			$mdDialog.hide({ status: 'save_layout' })
		}
	}

	vm.dontSave = function () {
		$mdDialog.hide({ status: 'do_not_save_layout' })
	}

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}
}
