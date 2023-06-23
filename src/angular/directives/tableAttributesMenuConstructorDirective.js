export default function ($mdDialog) {
	return {
		restriction: 'E',
		scope: {
			title: '@',
			dialogTitle: '@',
			model: '=',
			defaultAttrsKeys: '=',
			isReport: '@',
			availableAttrs: '<',
			nothingSelectedText: '@',
			onChangeCallback: '&?',
		},
		templateUrl:
			'views/directives/dialog-selector-input-with-tooltip-view.html',
		link: function (scope, elem, attr) {
			scope.isReport = !!scope.isReport

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

			scope.$watch(
				'defaultAttrsKeys',
				function () {
					if (scope.model || scope.defaultAttrsKeys) {
						updateSelectedAttrs()
					}

					setInputAndTooltipText()
				},
				true
			)

			scope.$watch('model', function () {
				setInputAndTooltipText()
			})

			var getDefaultAttrFromAvailable = function () {
				for (var i = 0; i < scope.availableAttrs.length; i++) {
					if (scope.availableAttrs[i].key === scope.defaultAttrsKeys) {
						return {
							attribute_data: JSON.parse(
								angular.toJson(scope.availableAttrs[i])
							),
							layout_name: '',
							is_default: true,
						}
					}
				}

				return false
			}

			var updateSelectedAttrs = function () {
				// update selected attributes if default attribute changed

				if (
					(!scope.model || scope.model.length === 0) &&
					scope.defaultAttrsKeys
				) {
					scope.model = []

					var defaultAttr = getDefaultAttrFromAvailable()

					if (defaultAttr) {
						scope.model.push(defaultAttr)
					}

					// If scope.model is not empty
				} else if (scope.defaultAttrsKeys) {
					if (scope.model[0].attribute_data.key === scope.defaultAttrsKeys) {
						scope.model[0].is_default = true
					} else {
						scope.model[0].is_default = false

						var defaultAttr = null

						// if default attribute is selected
						for (var i = 1; i < scope.model.length; i++) {
							if (
								scope.model[i].attribute_data.key === scope.defaultAttrsKeys
							) {
								defaultAttr = scope.model[i]
								defaultAttr.is_default = true
								scope.model.splice(i, 1)
								scope.model.unshift(defaultAttr)
								break
							}
						}

						// default attribute is not selected
						if (!defaultAttr) {
							defaultAttr = getDefaultAttrFromAvailable()
							scope.model.unshift(defaultAttr)
						}

						for (var i = 0; i < scope.model.length; i++) {
							scope.model[i].order = i
						}
					}
				} else {
					// if default attribute changed to empty
					scope.model[0].is_default = false
				}
			}

			$(elem).click(function (event) {
				event.preventDefault()
				event.stopPropagation()

				$mdDialog
					.show({
						controller: 'TableAttributesMenuConstructorDialogController as vm',
						templateUrl:
							'views/dialogs/table-attributes-menu-constructor-dialog-view.html',
						targetEvent: event,
						multiple: true,
						locals: {
							data: {
								title: scope.dialogTitle,
								isReport: scope.isReport,
								availableAttrs: scope.availableAttrs,
								selectedAttrs: scope.model,
								defaultAttrsKeys: scope.defaultAttrsKeys,
							},
						},
					})
					.then(function (res) {
						if (res.status === 'agree') {
							scope.model = res.selectedAttrs

							setInputAndTooltipText()

							if (scope.onChangeCallback) {
								setTimeout(function () {
									scope.onChangeCallback()
								}, 500)
							}
						}
					})
			})
		},
	}
}
