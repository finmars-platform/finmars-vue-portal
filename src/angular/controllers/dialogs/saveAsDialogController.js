/**
 * Created by szhitenev on 08.06.2016.
 */

export default function ($scope, $mdDialog, data) {
	console.log('data', data)

	var vm = this

	vm.data = data

	vm.name = vm.data.name

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.agree = function () {
		vm.data.name = vm.name

		$mdDialog.hide({ status: 'agree', data: vm.data })
	}
}
