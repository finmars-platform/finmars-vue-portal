export default function ($scope, $mdDialog, data) {
	var vm = this
	var pickr = null

	vm.selectedColor = ''

	if (data.color) {
		vm.selectedColor = data.color
	}

	vm.chooseColor = function (color) {
		var currentColorRepresentation = pickr.getColorRepresentation()
		pickr.setColor(color, true)
		pickr.setColorRepresentation(currentColorRepresentation)
	}

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.agree = function () {
		if (pickr) {
			pickr.applyColor()
			var selectedColor = pickr.getColor().toHEXA().toString()
			vm.selectedColor = selectedColor

			$mdDialog.hide({ status: 'agree', data: { color: vm.selectedColor } })
		} else {
			$mdDialog.hide({ status: 'agree', data: { color: null } })
		}
	}

	var init = function () {
		setTimeout(function () {
			var pickrObj = {
				el: '.replaceWithColorPicker',
				theme: 'classic',
				swatches: null,
				defaultRepresentation: 'RGBA',

				components: {
					// Main components
					preview: true,
					opacity: false,
					hue: true,

					// Input / output Options
					interaction: {
						hex: true,
						rgba: true,
						hsla: false,
						hsva: false,
						cmyk: false,
						input: true,
						clear: false,
						save: false,
					},
				},

				useAsButton: true,
				inline: true,
				showAlways: true,
			}

			if (vm.selectedColor) {
				pickrObj.default = vm.selectedColor
			}

			pickr = new Pickr(pickrObj)
		}, 100)
	}

	init()

	setTimeout(function () {
		vm.dialogElemToResize = document.querySelector(
			'.colorPickerDialogElemToResize'
		)
		$scope.$apply()
	}, 100)
}
