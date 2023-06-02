import renderHelper from '../../helpers/render.helper'

export default function ($mdDialog) {
	return {
		restrict: 'E',
		scope: {
			label: '@',
			placeholderText: '@',
			model: '=',
			numberFormat: '<',
			customButtons: '=',
			customStyles: '<',
			// setedFromOutside: '=',
			eventSignal: '=',
			smallOptions: '<',
			isDisabled: '=',
			onChangeCallback: '&?',
		},
		templateUrl: 'views/directives/customInputs/number-input-view.html',
		link: function (scope, elem, attr) {
			// scope.placeholderText = "0";
			scope.placeholder = scope.placeholderText || '0'
			scope.error = ''

			var inputLoaded = false // prevents not null inputs highlight from start
			var stylePreset

			// TIPS
			// scope.smallOptions probable properties
			// onlyPositive: whether field should accept only positive number
			// tooltipText: custom tolltip text
			// notNull: turn on error mode if field is not filled
			// dialogParent: 'string' - querySelector content for element to insert mdDialog into

			if (scope.smallOptions) {
				scope.onlyPositive = scope.smallOptions.onlyPositive
				scope.tooltipText = scope.smallOptions.tooltipText
				scope.dialogParent = scope.smallOptions.dialogParent
				scope.noIndicatorBtn = scope.smallOptions.noIndicatorBtn
			}

			var inputContainer = elem[0].querySelector('.numberInputContainer')
			var inputElem = elem[0].querySelector('.numberInputElem')

			scope.getInputContainerClasses = function () {
				var classes = ''

				if (scope.isDisabled) {
					classes += 'custom-input-is-disabled'
				} else if (scope.error) {
					classes = 'custom-input-error'
				} else if (stylePreset) {
					classes = 'custom-input-preset' + stylePreset
				} else if (scope.valueIsValid) {
					classes = 'custom-input-is-valid'
				}

				if (scope.noIndicatorBtn) {
					classes += ' no-indicator-btn'
				}

				return classes
			}

			var onChangeIndex

			scope.onValueChange = function () {
				clearTimeout(onChangeIndex)

				scope.setedFromOutside = false
				scope.valueIsValid = false

				// scope.error = '';
				var error = ''
				var modelValue = ''
				stylePreset = ''

				scope.numberToShow = scope.numberToShow.replace(',', '.')
				var changedValue = scope.numberToShow

				if (changedValue === '') {
					modelValue = null

					if (scope.smallOptions && scope.smallOptions.notNull) {
						error = 'Field should not be null'
					}

					if (scope.smallOptions && scope.smallOptions.onlyPositive) {
						error = 'Field should have positive number'
					}
				} else if (!isNaN(changedValue) && changedValue !== null) {
					changedValue = Number.isInteger(changedValue)
						? parseInt(changedValue)
						: parseFloat(changedValue)

					// negative numbers processing

					if (changedValue < 0) {
						if (
							scope.numberFormat &&
							scope.numberFormat.negative_color_format_id === 1
						) {
							inputElem.classList.add('red-text')
						}

						if (scope.onlyPositive) {
							error = 'Field should have positive number'
							modelValue = null
						} else {
							modelValue = changedValue
						}
					} else {
						inputContainer.classList.remove('custom-input-error')
						inputElem.classList.remove('red-text')
						modelValue = changedValue
					}
					// < negative numbers processing >
				} else {
					error = 'Invalid character used'
					modelValue = null
				}

				scope.model = modelValue

				/* if (scope.onChangeCallback) {
						setTimeout(function () {
							scope.onChangeCallback();
						}, 0);
					} */
				onChangeIndex = setTimeout(() => {
					scope.error = error

					if ((scope.model || scope.model === 0) && !scope.error) {
						scope.valueIsValid = true
					}

					scope.$apply()

					if (scope.onChangeCallback) scope.onChangeCallback()
				}, 500)
			}

			var applyNumberFormatToInput = function () {
				if (
					scope.numberFormat &&
					(scope.numberToShow || scope.numberToShow === 0)
				) {
					scope.numberToShow = renderHelper.formatValue(
						{
							value: scope.model,
						},
						{
							key: 'value',
							report_settings: scope.numberFormat,
						}
					)
				}
			}

			scope.openCalculatorDialog = function ($event) {
				var calculatorTitle = 'Calculator for: ' + scope.label

				var dialogParent = angular.element(document.body)

				if (scope.dialogParent) {
					var dialogParentElem = document.querySelector(scope.dialogParent)

					if (dialogParentElem) {
						dialogParent = dialogParentElem
					}
				}

				$mdDialog
					.show({
						controller: 'CalculatorDialogController as vm',
						templateUrl: 'views/dialogs/calculator-dialog-view.html',
						targetEvent: $event,
						parent: dialogParent,
						multiple: true,
						locals: {
							data: {
								numberValue: scope.model,
								calculatorTitle: calculatorTitle,
							},
						},
					})
					.then(function (res) {
						if (res.status === 'agree') {
							stylePreset = ''
							scope.model = res.numberValue

							scope.numberToShow = res.numberValue
							applyNumberFormatToInput()

							if (scope.onChangeCallback) {
								setTimeout(() => {
									scope.onChangeCallback()
								}, 0)
							}
						}
					})
			}

			scope.callFnForCustomBtn = function (actionData) {
				if (actionData.parameters) {
					actionData.callback(actionData.parameters)
				} else {
					actionData.callback()
				}
			}

			var applyCustomStyles = function () {
				Object.keys(scope.customStyles).forEach(function (className) {
					var elemClass = '.' + className
					var elemToApplyStyles = elem[0].querySelectorAll(elemClass)

					if (elemToApplyStyles.length) {
						elemToApplyStyles.forEach(function (htmlNode) {
							htmlNode.style.cssText = scope.customStyles[className]
						})
					}
				})
			}

			var initScopeWatchers = function () {
				scope.$watch('model', function () {
					if (!inputContainer.classList.contains('custom-input-focused')) {
						scope.numberToShow = scope.model
					}

					if (scope.model || scope.model === 0) {
						scope.error = ''

						if (isNaN(scope.model)) {
							scope.error = 'Invalid character used'
						}

						// Victor 2021.06.16 #115 I transfer scope.numberToShow changing to  upper because model===null not change scope.numberToShow to 0
						// scope.numberToShow = JSON.parse(JSON.stringify(scope.model));

						if (!inputContainer.classList.contains('custom-input-focused')) {
							applyNumberFormatToInput()
						}
					} else if (
						!scope.numberToShow &&
						scope.numberToShow !== 0 &&
						inputLoaded
					) {
						if (scope.smallOptions && scope.smallOptions.notNull) {
							scope.error = 'Field should not be null'
						}
					}

					inputLoaded = true
				})

				if (scope.eventSignal) {
					// this if prevents watcher below from running without need

					scope.$watch('eventSignal', function () {
						if (scope.eventSignal && scope.eventSignal.key) {
							switch (scope.eventSignal.key) {
								case 'mark_not_valid_fields':
									if (
										scope.smallOptions &&
										!scope.numberToShow &&
										scope.numberToShow !== 0
									) {
										if (scope.smallOptions.notNull) {
											scope.error = 'Field should not be null'
										} else if (scope.onlyPositive) {
											scope.error = 'field should have positive number'
										}
									}

									break

								case 'set_style_preset1':
									stylePreset = 1
									break

								case 'set_style_preset2':
									stylePreset = 2
									break
							}

							scope.eventSignal = {}
						}
					})
				}
			}

			var initEventListeners = function () {
				elem[0].addEventListener('mouseover', function () {
					inputContainer.classList.add('custom-input-hovered')
				})

				elem[0].addEventListener('mouseleave', function () {
					inputContainer.classList.remove('custom-input-hovered')
				})

				inputElem.addEventListener('focus', function () {
					inputContainer.classList.add('custom-input-focused')

					if (!scope.error && (scope.model || scope.model === 0)) {
						scope.numberToShow = scope.model
						scope.$apply()
					}
				})

				inputElem.addEventListener('blur', function () {
					inputContainer.classList.remove('custom-input-focused')

					setTimeout(function () {
						// without timeout changes will be discarded on fast blur

						if (!scope.error && (scope.model || scope.model === 0)) {
							applyNumberFormatToInput()
							scope.$apply()
						}
					}, 250)
				})
			}

			var init = function () {
				initScopeWatchers()

				initEventListeners()

				if (scope.numberFormat && scope.placeholderText === undefined) {
					switch (scope.numberFormat.round_format_id) {
						case 0:
						case 1:
							scope.placeholderText = '0'
							break

						case 2:
							scope.placeholderText = '0.0'
							break

						case 3:
							scope.placeholderText = '0.00'
							break

						case 4:
							scope.placeholderText = '0.0000'
							break
					}

					if (scope.numberFormat.number_prefix) {
						scope.placeholderText =
							scope.numberFormat.number_prefix + scope.placeholderText
					}

					if (scope.numberFormat.number_suffix) {
						scope.placeholderText =
							scope.placeholderText + scope.numberFormat.number_suffix
					}
				}

				if (scope.customStyles) {
					applyCustomStyles()
				}

				/*if (scope.smallOptions && scope.smallOptions.notNull &&
                        !scope.numberToShow && scope.numberToShow !== 0) {

                        scope.error = 'Field should not be null';

                    }*/
			}

			init()
		},
	}
}
