/**
 * Created by mevstratov on 08.06.2016.
 */

export default function ($scope, $mdDialog, data) {
	var vm = this

	vm.schemeErrors = data.errorsInScheme

	vm.close = function () {
		$mdDialog.hide()
	}
}
