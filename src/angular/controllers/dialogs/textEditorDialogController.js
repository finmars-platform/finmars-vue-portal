export default function ($scope, $mdDialog, data) {
	var vm = this

	vm.dialogTitle = data.title
	vm.text = ''

	if (data.text) {
		vm.text = data.text
	}

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.agree = function () {
		$mdDialog.hide({ status: 'agree', text: vm.text })
	}

	setTimeout(function () {
		vm.dialogElemToResize = document.querySelector(
			'.textEditorDialogElemToResize'
		)
		$scope.$apply()
	}, 100)
}
