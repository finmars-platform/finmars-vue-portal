//import colorPalettesService from '../../services/colorPalettesService';

export default function ($scope, $mdDialog, data) {
	var vm = this

	vm.selectedPalette = {}
	vm.openedPalette = {}
	vm.openedPaletteId = null
	vm.selectedColor = {}

	vm.palettesList = []
	vm.readyStatus = false
	vm.palettesList = []

	var palettesListChanged = false

	var openDefaultPalette = function () {
		for (var i = 0; i < vm.palettesList.length; i++) {
			if (vm.palettesList[i].is_default) {
				vm.openedPalette = vm.palettesList[i]
				vm.openedPaletteId = vm.palettesList[i].id
				break
			}
		}
	}

	/*var getPalettesList = function () {

            colorPalettesService.getList({pageSize: 1000}).then(function (data) {

                vm.palettesList = data.results;

                openDefaultPalette();

                vm.readyStatus = true;
                $scope.$apply();
            });
        }*/

	vm.changeShowingPalette = function () {
		for (var i = 0; i < vm.palettesList.length; i++) {
			if (vm.palettesList[i].id === vm.openedPaletteId) {
				vm.openedPalette = vm.palettesList[i]
				break
			}
		}
	}

	vm.openPaletteSettings = function ($event) {
		$mdDialog
			.show({
				controller: 'ColorPalettesSettingsController as vm',
				templateUrl:
					'views/colorPicker/color-palettes-settings-dialog-view.html',
				parent: angular.element(document.body),
				targetEvent: $event,
				multiple: true,
				locals: {
					data: {
						openedInside: 'dialog',
					},
				},
			})
			.then(function (res) {
				// if (res && res.data) {
				if (res.status === 'agree') {
					vm.palettesList = res.data.palettesList
					palettesListChanged = true
				}
			})
	}

	vm.isColorSelected = function (palette, color) {
		if (
			palette.user_code === vm.selectedPalette.user_code &&
			color.order === vm.selectedColor.order
		) {
			return true
		}

		return false
	}

	vm.selectColor = function (color) {
		if (color && color.order !== vm.selectedColor.order) {
			vm.selectedPalette = JSON.parse(angular.toJson(vm.openedPalette))
			vm.selectedColor = color
		}
	}

	vm.selectColorAndClose = function (color) {
		vm.selectColor(color)
		vm.agree()
	}

	vm.cancel = function () {
		var resObj = {
			status: 'disagree',
		}

		if (palettesListChanged) {
			resObj.data = {
				palettesList: vm.palettesList,
			}
		}

		$mdDialog.hide(resObj)
	}

	vm.agree = function () {
		var resObj = {
			status: 'agree',
			data: {
				palette: vm.selectedPalette,
				color: vm.selectedColor,
			},
		}

		if (palettesListChanged) {
			resObj.data.palettesList = vm.palettesList
		}

		$mdDialog.hide(resObj)
	}

	var init = function () {
		vm.palettesList = data.palettesList

		if (Object.keys(data.palette).length) {
			//openPalette(data.palette);
			vm.openedPalette = data.palette
			vm.openedPaletteId = data.palette.id

			/*for (var i = 0; i < vm.selectedPalette.colors.length; i++) {
                    if (vm.selectedPalette.colors[i].order === data.color.order) {
                        vm.selectedColor = vm.selectedPalette.colors[i];
                    }
                }*/

			vm.selectedPalette = data.palette
			vm.selectedColor = data.color
		} else {
			openDefaultPalette()
		}

		vm.readyStatus = true
		//getPalettesList();
	}

	init()
}
