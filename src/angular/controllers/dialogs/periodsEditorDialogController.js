export default function ($scope, $mdDialog, options) {
	var vm = this

	vm.periods = options.periods

	vm.agree = function () {
		$mdDialog.hide({ status: 'agree' })
	}
}
