export default function ($scope, $mdDialog, data) {
	var vm = this

	vm.title = data.title

	vm.firstInputData = {
		value: '',
		smallOptions: {
			noIndicatorBtn: true,
		},
	}

	vm.secondInputData = {
		value: '',
		smallOptions: {
			noIndicatorBtn: true,
		},
	}

	vm.eventObj = {}

	if (data.firstInput) {
		vm.firstInputData = Object.assign(vm.firstInputData, data.firstInput)
	}

	if (data.secondInput) {
		vm.secondInputData = Object.assign(vm.secondInputData, data.secondInput)
	}

	if (data.palettesList) {
		vm.palettesList = JSON.parse(angular.toJson(data.palettesList))
	}

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.agree = function () {
		var savingAllowed = true

		if (!vm.secondInputData.value) {
			vm.eventObj = {
				key: 'error',
				error: 'This field should not be empty',
			}
			savingAllowed = false
		} else if (vm.palettesList) {
			for (var i = 0; i < vm.palettesList.length; i++) {
				if (vm.palettesList[i].user_code === vm.secondInputData.value) {
					vm.eventObj = {
						key: 'error',
						error: 'There is already palette with such user code.',
					}

					savingAllowed = false

					break
				}
			}
		}

		if (savingAllowed) {
			$mdDialog.hide({
				status: 'agree',
				data: {
					text: vm.firstInputData.value,
					text2: vm.secondInputData.value,
				},
			})
		}
	}

	setTimeout(function () {
		vm.dialogElemToResize = document.querySelector(
			'.twoInputsDialogElemToResize'
		)
		$scope.$apply()
	}, 100)
}
