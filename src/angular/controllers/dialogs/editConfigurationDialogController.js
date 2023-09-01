/**
 * Created by szhitenev on 08.06.2016.
 */

import uiService from '../../services/uiService'

export default function ($scope, $mdDialog, item) {
	var vm = this

	vm.item = Object.assign({}, item)

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.agree = function () {
		if (vm.file) {
			var reader = new FileReader()

			reader.readAsText(vm.file)

			reader.onload = function (evt) {
				try {
					var file = JSON.parse(evt.target.result)

					uiService
						.updateConfiguration(vm.item.id, {
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
		} else {
			uiService
				.updateConfiguration(vm.item.id, {
					name: vm.item.name,
					description: vm.item.description,
					data: vm.item.data,
				})
				.then(function (value) {
					$mdDialog.hide({ status: 'agree' })
				})
		}
	}
}
