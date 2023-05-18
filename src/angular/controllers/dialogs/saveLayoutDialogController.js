export default function ($scope, $mdDialog) {
	var vm = this

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}
}
