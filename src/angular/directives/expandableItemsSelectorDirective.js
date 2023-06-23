export default function ($mdDialog) {
	return {
		restriction: 'E',
		scope: {
			title: '@',
			dialogTitle: '@',
			model: '=',
			items: '=',
			isDisabled: '=',
			onChangeCallback: '&?',
		},
		templateUrl: 'views/directives/dialog-selectors-basic-input-view.html',
		link: function (scope, elem, attr) {
			var setInputText = function () {
				if (scope.model && scope.items) {
					for (var i = 0; i < scope.items.length; i++) {
						if (scope.items[i].id === scope.model) {
							scope.inputText = scope.items[i].name
						}
					}
				} else {
					scope.inputText = ''
				}
			}

			scope.$watch('items', function () {
				setInputText()
			})

			scope.$watch('model', function () {
				setInputText()
			})

			$(elem).click(function (event) {
				event.preventDefault()
				event.stopPropagation()

				if (!scope.isDisabled) {
					$mdDialog
						.show({
							controller: 'ExpandableItemsSelectorDialogController as vm',
							templateUrl:
								'views/dialogs/expandable-items-selector-dialog-view.html',
							targetEvent: event,
							multiple: true,
							locals: {
								data: {
									dialogTitle: scope.dialogTitle,
									selectedItem: scope.model,
									items: scope.items,
								},
							},
						})
						.then(function (res) {
							if (res.status === 'agree' && scope.model !== res.selected.id) {
								scope.model = res.selected.id
								setInputText()

								if (scope.onChangeCallback) {
									setTimeout(function () {
										scope.onChangeCallback()
									}, 100)
								}
							}
						})
				}
			})
		},
	}
}
