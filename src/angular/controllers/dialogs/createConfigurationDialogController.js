/**
 * Created by szhitenev on 08.06.2016.
 */

import uiService from '../../services/uiService'

export default function ($scope, $mdDialog) {
	var vm = this

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.configurationFileIsAvailable = function () {
		return vm.file !== null && vm.file !== undefined
	}

	vm.agree = function () {
		var reader = new FileReader()

		reader.readAsText(vm.file)

		reader.onload = function (evt) {
			try {
				var file = JSON.parse(evt.target.result)

				uiService
					.createConfiguration({
						name: vm.item.name,
						description: vm.item.description,
						data: file,
					})
					.then(function (value) {
						$mdDialog.hide({ status: 'agree' })
					})
			} catch (e) {
				vm.error = true
			}
		}
	}
}
