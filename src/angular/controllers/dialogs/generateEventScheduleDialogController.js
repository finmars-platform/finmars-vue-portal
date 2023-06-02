/**
 * Created by mevstratov on 30.01.2019.
 */

export default function ($scope, $mdDialog) {
	var vm = this

	vm.agree = function () {
		$mdDialog.hide({ status: 'agree' })
	}

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}
}
