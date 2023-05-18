/**
 * Created by szhitenev on 08.06.2016.
 */

export default function ($scope, $mdDialog, data) {
	console.log('data', data)

	var vm = this

	vm.data = data

	vm.layout_name = vm.data.layout_name

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.agree = function () {
		vm.data.layout_name = vm.layout_name

		$mdDialog.hide({ status: 'agree', data: vm.data })
	}
}
