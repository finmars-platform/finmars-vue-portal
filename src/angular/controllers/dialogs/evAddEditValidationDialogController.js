export default function ($scope, $mdDialog, data) {
	var vm = this

	vm.errors = []
	vm.tableErrors = []

	if (data.errorsList && data.errorsList.length) {
		data.errorsList.forEach((error) => {
			if (error.hasOwnProperty('tableName')) {
				vm.tableErrors.push(error)
			} else {
				vm.errors.push(error)
			}
		})
	}

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.agree = function () {
		$mdDialog.hide({ status: 'agree' })
	}

	var init = function () {
		setTimeout(function () {
			vm.dialogElemToResize = document.querySelector(
				'.evValidationDialogElemToResize'
			)
		}, 100)
	}

	init()
}
