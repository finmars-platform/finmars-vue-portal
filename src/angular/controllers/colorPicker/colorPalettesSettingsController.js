import objectComparisonHelper from '../../helpers/objectsComparisonHelper'
import colorPalettesService from '../../services/colorPalettesService'
import toastNotificationService from '@/angular/core/services/toastNotificationService'

export default function ($scope, $mdDialog, data) {
	var vm = this

	if (data && data.openedInside) {
		vm.openedInside = data.openedInside
	}

	vm.openedPalette = null
	vm.openedPaletteId = null
	var openedPaletteOriginal = null

	vm.palettesList = []
	vm.readyStatus = false
	vm.palettesList = []

	var openPalette = function (property, value) {
		let isLookedForPalette = (palette) => {
			if (property === 'is_default') {
				return palette.is_default
			} else {
				return palette[property] === value
			}
		}

		for (var i = 0; i < vm.palettesList.length; i++) {
			if (isLookedForPalette(vm.palettesList[i])) {
				vm.openedPalette = vm.palettesList[i]
				openedPaletteOriginal = JSON.parse(JSON.stringify(vm.palettesList[i]))
				vm.openedPaletteId = vm.palettesList[i].id
				break
			}
		}
	}

	/* var selectPaletteByUserCode = function (paletteToSelectUC) {

            for (var i = 0; i < vm.palettesList.length; i++) {
                if (vm.palettesList[i].user_code === paletteToSelectUC) {

                    vm.openedPalette = vm.palettesList[i];
                    vm.openedPaletteId = vm.palettesList[i].id;
                    break;

                }
            }

        } */

	var getPalettesList = function (paletteToSelectUC) {
		colorPalettesService.getList({ pageSize: 1000 }).then(function (data) {
			vm.palettesList = data.results

			if (paletteToSelectUC) {
				openPalette('user_code', paletteToSelectUC)
			} else {
				openPalette('is_default')
			}

			vm.readyStatus = true
			$scope.$apply()
		})
	}

	vm.changeShowingPalette = function () {
		for (var i = 0; i < vm.palettesList.length; i++) {
			if (vm.palettesList[i].id === vm.openedPaletteId) {
				vm.openedPalette = vm.palettesList[i]
				break
			}
		}
	}

	vm.renamePalette = function ($event) {
		var selPaletteText = vm.openedPalette.name
		var selPaletteUserCode = vm.openedPalette.user_code

		$mdDialog
			.show({
				controller: 'TwoInputsDialogController as vm',
				templateUrl: 'views/dialogs/two-inputs-dialog-view.html',
				parent: angular.element(document.body),
				targetEvent: $event,
				multiple: true,
				locals: {
					data: {
						title: 'Choose palette name and user code.',
						firstInput: {
							value: selPaletteText,
							label: 'Name',
						},
						secondInput: {
							value: selPaletteUserCode,
							label: 'User code',
							smallOptions: {
								noIndicatorBtn: true,
								disabled: true,
							},
						},
					},
				},
			})
			.then(function (res) {
				if (res.status === 'agree') {
					if (
						vm.openedPalette.name !== res.data.text ||
						vm.openedPalette.user_code !== res.data.text2
					) {
						vm.openedPalette.name = res.data.text
						vm.openedPalette.user_code = res.data.text2
						/* var paletteToUpdate = JSON.parse(angular.toJson(vm.openedPalette));
                        colorPalettesService.updateById(vm.openedPalette.id, paletteToUpdate); */
					}
				}
			})
	}

	vm.makePaletteCopy = function ($event) {
		var paletteCopy = JSON.parse(angular.toJson(vm.openedPalette))

		paletteCopy.name = paletteCopy.name + ' (copy)'
		paletteCopy.user_code = paletteCopy.user_code + ' (copy)'

		delete paletteCopy.id
		paletteCopy.is_default = false

		var paletteCopyName = paletteCopy.name
		var paletteCopyUserCode = paletteCopy.user_code

		$mdDialog
			.show({
				controller: 'TwoInputsDialogController as vm',
				templateUrl: 'views/dialogs/two-inputs-dialog-view.html',
				parent: angular.element(document.body),
				targetEvent: $event,
				multiple: true,
				locals: {
					data: {
						title: 'Enter name and user code for new palette.',
						firstInput: {
							value: paletteCopyName,
							label: 'Name',
						},
						secondInput: {
							value: paletteCopyUserCode,
							label: 'User code',
						},
						palettesList: vm.palettesList,
					},
				},
			})
			.then(async function (res) {
				if (res.status === 'agree') {
					var actionBeforeCopying = await vm.beforeShowingPaletteChange()

					if (actionBeforeCopying !== 'disagree') {
						paletteCopy.name = res.data.text
						paletteCopy.user_code = res.data.text2

						colorPalettesService.create(paletteCopy).then(function () {
							vm.readyStatus = false
							getPalettesList(paletteCopy.user_code)
						})
					}
				}
			})
	}

	vm.deletePalette = function () {
		var selPaletteName = vm.openedPalette.name

		colorPalettesService.deleteById(vm.openedPalette.id).then(function () {
			toastNotificationService.success(
				'Palette ' + selPaletteName + 'was deleted'
			)

			vm.readyStatus = false
			getPalettesList()
		})
	}

	vm.renameColor = function (color, $event) {
		var colorName = color.name
		var tooltipText = color.tooltip

		$mdDialog
			.show({
				controller: 'TwoInputsDialogController as vm',
				templateUrl: 'views/dialogs/two-inputs-dialog-view.html',
				parent: angular.element(document.body),
				targetEvent: $event,
				multiple: true,
				locals: {
					data: {
						title: 'Choose color name and tooltip.',
						firstInput: {
							value: colorName,
							label: 'Name',
						},
						secondInput: {
							value: tooltipText,
							label: 'Tooltip',
							smallOptions: {
								noIndicatorBtn: true,
								disabled: true,
							},
						},
					},
				},
			})
			.then(function (res) {
				if (res.status === 'agree') {
					if (colorName !== res.data.text || tooltipText !== res.data.text2) {
						color.name = res.data.text
						color.tooltip = res.data.text2
						// vm.onColorChange();
					}
				}
			})
	}

	//vm.openColorPicker = function (paletteId, colorOrder) {
	vm.openColorPicker = function (color, $event) {
		/* var selectorValue = ".colorPaletteColorPicker[data-color-palette='" + paletteId + "'][data-color-order='" + colorOrder + "']";
            var colorInput = document.querySelector(selectorValue);

            colorInput.click(); */
		var colorValue = color.value

		$mdDialog
			.show({
				controller: 'ColorPickerDialogController as vm',
				templateUrl: 'views/colorPicker/color-picker-dialog-view.html',
				parent: angular.element(document.body),
				targetEvent: $event,
				multiple: true,
				locals: {
					data: {
						color: colorValue,
					},
				},
			})
			.then(function (res) {
				if (res.status === 'agree') {
					if (color.value !== res.data.color) {
						color.value = res.data.color
						// vm.onColorChange();
					}
				}
			})
	}

	/* vm.onColorChange = function () {
            var paletteToUpdate = JSON.parse(angular.toJson(vm.openedPalette));
            colorPalettesService.updateById(vm.openedPalette.id, paletteToUpdate);
        }; */

	vm.beforeShowingPaletteChange = function (paletteId, $event) {
		vm.openedPaletteId = paletteId
		var paletteToUpdate = JSON.parse(angular.toJson(vm.openedPalette))

		return new Promise(function (resolve) {
			if (
				objectComparisonHelper.areObjectsTheSame(
					paletteToUpdate,
					openedPaletteOriginal
				)
			) {
				openPalette('id', vm.openedPaletteId)
				resolve('no_changes')
			} else {
				let warningDescription =
					'All unsaved changes for ' +
					openedPaletteOriginal.name +
					' will be lost after switch. Do you still want to proceed?'

				$mdDialog
					.show({
						controller: 'WarningDialogController as vm',
						templateUrl: 'views/dialogs/warning-dialog-view.html',
						parent: angular.element(document.body),
						targetEvent: $event,
						clickOutsideToClose: false,
						locals: {
							warning: {
								title: 'Warning',
								description: warningDescription,
								actionsButtons: [
									{
										name: 'Save Layout',
										response: { status: 'save' },
									},
									{
										name: "Don't Save",
										response: { status: 'do_not_save' },
									},
									{
										name: 'Cancel',
										response: { status: 'disagree' },
									},
								],
							},
						},
					})
					.then(function (res) {
						switch (res.status) {
							case 'save':
								vm.savePaletteSettings()

							case 'do_not_save':
								openPalette('id', vm.openedPaletteId)

								break

							case 'disagree':
								vm.openedPaletteId = openedPaletteOriginal.id
								break
						}

						resolve(res.status)
					})
					.catch(function () {
						resolve('disagree')
					})
			}
		})
	}

	vm.savePaletteSettings = function () {
		var paletteToUpdate = JSON.parse(angular.toJson(vm.openedPalette))
		colorPalettesService
			.updateById(vm.openedPalette.id, paletteToUpdate)
			.then(function () {
				toastNotificationService.success(
					'Palette ' + vm.openedPalette.name + 'was saved'
				)
			})
	}

	if (vm.openedInside === 'dialog') {
		vm.cancel = function () {
			$mdDialog.hide({ status: 'disagree' })
		}

		vm.agree = function () {
			vm.savePaletteSettings()
			$mdDialog.hide({
				status: 'agree',
				data: { palettesList: vm.palettesList },
			})
		}
	}

	var init = function () {
		getPalettesList()
	}

	init()
}
