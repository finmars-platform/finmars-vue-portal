/**
 * Created by szhitenev on 08.06.2016.
 */

export default function ($scope, $mdDialog, uiService, data) {


	var vm = this

	vm.layout = Object.assign({}, data.layout)

	vm.delete = function () {
		uiService
			.deleteConfigurationExportLayoutByKey(vm.layout.id)
			.then(function () {
				$mdDialog.hide({ status: 'agree' })
			})
	}

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.save = function () {
		if (vm.layout.id) {
			uiService
				.updateConfigurationExportLayout(vm.layout.id, vm.layout)
				.then(function () {
					$mdDialog.hide({ status: 'agree' })
				})
		} else {
			uiService.createConfigurationExportLayout(vm.layout).then(function () {
				$mdDialog.hide({ status: 'agree' })
			})
		}
	}

	vm.saveAs = function () {
		delete vm.layout.id

		uiService.createConfigurationExportLayout(vm.layout).then(
			function () {
				$mdDialog.hide({ status: 'agree' })
			},
			function (rej) {
				$mdDialog.hide()
			}
		)
	}
}
