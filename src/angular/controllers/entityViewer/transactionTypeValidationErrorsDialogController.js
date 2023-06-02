/**
 * Created by szhitenev on 08.06.2016.
 */

export default function ($scope, $mdDialog, data) {
	var vm = this

	vm.actionErrors = data.actionErrors
	vm.entityErrors = data.entityErrors
	//vm.inputsErrors = data.inputsErrors;

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.agree = function () {
		$mdDialog.hide({ status: 'agree' })
	}
}
