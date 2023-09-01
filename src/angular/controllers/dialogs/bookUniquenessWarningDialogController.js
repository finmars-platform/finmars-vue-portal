/**
 * Created by szhitenev on 17.09.2020.
 */

export default function ($scope, $mdDialog, data) {
	var vm = this

	vm.errorData = data.errorData

	vm.cancel = function () {
		$mdDialog.hide({ reaction: 'cancel' })
	}

	vm.skip = function () {
		$mdDialog.hide({ reaction: 'skip' })
	}

	vm.bookWithoutUniqueCode = function () {
		$mdDialog.hide({ reaction: 'book_without_unique_code' })
	}

	vm.overwrite = function () {
		$mdDialog.hide({ reaction: 'overwrite' })
	}
}
