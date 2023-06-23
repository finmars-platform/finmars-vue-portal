/**
 * Created by szhitenev on 06.12.2019.
 */

export default function ($scope, $mdDialog, data) {
	var vm = this

	vm.item = data.item

	vm.addRow = function () {
		vm.item.fields.push({
			reference_name: '',
			description: '',
			value_text: '',
			value_float: '',
			value_date: '',
		})
	}

	vm.deleteRow = function ($index) {
		vm.item.fields.splice($index, 1)
	}

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.agree = function ($event) {
		$mdDialog.hide({ status: 'agree' })
	}

	vm.init = function () {}

	vm.init()
}
