export default function ($mdDialog) {
	return {
		restriction: 'E',
		scope: {
			title: '@',
			dialogTitle: '@',
			model: '=',
			items: '=',
		},
		templateUrl:
			'views/directives/dialog-selector-input-with-tooltip-view.html',
		link: function (scope, elem, attr) {
			/*var setInputText = function () {

                    if (scope.model && scope.items) {

                        for (var i = 0; i < scope.items.length; i++) {

                            if (scope.items[i].id === scope.model) {
                                scope.inputText = scope.items[i].name;
                            }

                        }

                    } else {
                        scope.inputText = "";
                    }

                };*/

			var setInputAndTooltipText = function () {
				if (scope.model && scope.model.length > 0) {
					var selectedAttrsString = ''

					scope.model.forEach(function (attribute) {
						if (selectedAttrsString) {
							selectedAttrsString += ', '
						}

						if (attribute.layout_name) {
							selectedAttrsString += attribute.layout_name
						} else {
							selectedAttrsString += attribute.attribute_data.name
						}
					})

					scope.inputText = '[' + selectedAttrsString + ']'
					scope.tooltipText = 'Values selected: ' + selectedAttrsString
				} else if (scope.nothingSelectedText) {
					scope.inputText = scope.nothingSelectedText
				} else {
					scope.inputText = '[ ]'
				}
			}

			/*scope.$watch('items', function () {
                    setInputText();
                });*/

			$(elem).click(function (event) {
				event.preventDefault()
				event.stopPropagation()

				$mdDialog
					.show({
						controller: 'ExpandableItemsMultiselectorDialogController as vm',
						templateUrl:
							'views/dialogs/expandable-items-multiselector-dialog-view.html',
						targetEvent: event,
						multiple: true,
						locals: {
							data: {
								dialogTitle: scope.dialogTitle,
								selectedItem: scope.model,
								availableItems: scope.items,
							},
						},
					})
					.then(function (res) {
						if (res.status === 'agree') {
							scope.model = res.selectedItems
						}
					})
			})
		},
	}
}
