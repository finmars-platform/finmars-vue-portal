export default function ($mdDialog) {
	return {
		restrict: 'E',
		scope: {
			palettesList: '=',
			model: '=',
			onPalettesChangeCallback: '&?',
		},
		templateUrl: 'views/directives/color-picker-view.html',
		link: function (scope, elem, attr) {
			scope.selectedPalette = {}
			scope.selectedColor = {}

			scope.getColorDivStyle = function () {
				var styleText

				if (scope.selectedColor.value) {
					styleText = 'background-color: ' + scope.selectedColor.value + ';'
				}

				return styleText
			}

			var findSelectedColor = function () {
				var paletteNotFound = true

				var i, a
				for (i = 0; i < scope.palettesList.length; i++) {
					if (scope.palettesList[i].user_code === scope.model.paletteUserCode) {
						scope.selectedPalette = scope.palettesList[i]
						paletteNotFound = false

						/*for (a = 0; a < scope.selectedPalette.colors.length; a++) {

                                if (scope.selectedPalette.colors[a].order === scope.model.colorOrder) {

                                    scope.selectedColor = JSON.parse(JSON.stringify(scope.palettesList[i].colors[a]));
                                    break loop1;

                                }

                            }*/

						scope.selectedColor = JSON.parse(
							JSON.stringify(
								scope.palettesList[i].colors[scope.model.colorOrder]
							)
						)
					}
				}

				if (paletteNotFound) {
					loop1: for (i = 0; i < scope.palettesList.length; i++) {
						if (scope.palettesList[i].user_code === 'Default Palette') {
							scope.selectedPalette = scope.palettesList[i]

							for (a = 0; a < scope.selectedPalette.colors.length; a++) {
								if (
									scope.selectedPalette.colors[a].order ===
									scope.model.colorOrder
								) {
									scope.selectedColor = JSON.parse(
										JSON.stringify(scope.palettesList[i].colors[a])
									)
									break loop1
								}
							}
						}
					}
				}
			}

			scope.openSelectColorDialog = function ($event) {
				$mdDialog
					.show({
						controller: 'SelectColorDialogController as vm',
						templateUrl: 'views/colorPicker/select-color-dialog-view.html',
						parent: angular.element(document.body),
						targetEvent: $event,
						multiple: true,
						locals: {
							data: {
								palette: scope.selectedPalette,
								color: scope.selectedColor,
								palettesList: scope.palettesList,
							},
						},
					})
					.then(function (res) {
						if (res.status === 'agree') {
							scope.selectedPalette = res.data.palette
							scope.selectedColor = res.data.color

							scope.model = {}

							scope.model.paletteUserCode = res.data.palette.user_code
							scope.model.colorOrder = res.data.color.order
							/*if (scope.onPalettesChangeCallback) {
                                setTimeout(function () {
                                    scope.onPalettesChangeCallback();
                                }, 100);
                            }*/
						}

						if (res.data && res.data.palettesList) {
							scope.palettesList = res.data.palettesList

							if (Object.keys(scope.selectedColor).length) {
								findSelectedColor()
							}

							if (scope.onPalettesChangeCallback) {
								setTimeout(function () {
									scope.onPalettesChangeCallback()
								}, 100)
							}
						}
					})
			}

			if (
				scope.model &&
				typeof scope.model === 'object' &&
				scope.model.paletteUserCode
			) {
				findSelectedColor()
			} else {
				scope.selectedPalette = JSON.parse(
					JSON.stringify(scope.palettesList[0])
				)
				scope.selectedColor = scope.selectedPalette.colors[0]
			}
		},
	}
}
