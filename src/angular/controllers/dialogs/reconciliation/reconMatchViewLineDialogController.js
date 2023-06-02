/**
 * Created by szhitenev on 18.12.2019.
 */

export default function ($scope, $mdDialog, data) {
	var vm = this

	vm.item = data.item

	vm.attributes = []

	console.log('View Line', vm.item)

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.agree = function () {
		$mdDialog.hide({ status: 'agree' })
	}

	vm.init = function () {
		console.log('vm', vm)

		vm.system_fields = [
			'ignore_fields',
			'auto_matched_fields',
			'matched_fields',
			'resolved_fields',
			'conflicts_fields',
			'new_fields',
			'fields',
			'results',
		]

		Object.keys(vm.item).forEach(function (key) {
			if (key.indexOf('___') === -1) {
				if (vm.system_fields.indexOf(key) === -1) {
					vm.attributes.push({
						key: key,
						value: vm.item[key],
					})
				}
			}
		})
	}

	vm.init()
}
