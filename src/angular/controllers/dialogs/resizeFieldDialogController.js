/**
 * Created by mevstratov on 25.11.2019.
 */

export default function ($scope, $mdDialog, data) {
	console.log('data', data)

	var vm = this

	vm.data = data

	vm.columnSize = parseInt(vm.data.style.width)

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.agree = function () {
		vm.data.style.width = vm.columnSize + 'px'

		$mdDialog.hide({ status: 'agree', data: vm.data })
	}
}
