export default function ($scope, $mdDialog, data) {
	var vm = this

	vm.colorName = ''
	vm.tooltipText = ''

	if (data.name) {
		vm.colorName = data.name
	}

	if (data.tooltip) {
		vm.tooltipText = data.tooltip
	}

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.agree = function () {
		$mdDialog.hide({
			status: 'agree',
			data: { name: vm.colorName, tooltipText: vm.tooltipText },
		})
	}

	setTimeout(function () {
		vm.dialogElemToResize = document.querySelector(
			'.colorRenameDialogElemToResize'
		)
		$scope.$apply()
	}, 100)
}
