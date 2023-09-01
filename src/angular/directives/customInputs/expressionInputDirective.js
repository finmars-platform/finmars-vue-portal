import helpExpressionsService from '../../services/helpExpressionsService'
;('use strict')

export default function ($mdDialog) {
	return {
		restrict: 'E',
		scope: {
			label: '@',
			model: '=',
			data: '=',
			//customStyles: '<',
			eventSignal: '=',
			smallOptions: '=',
			isDisabled: '=',
			onChangeCallback: '&?',
			onBlurCallback: '&?',
		},
		templateUrl: 'views/directives/customInputs/expression-input-view.html',
		link: function (scope, elem, attr) {
			var inputContainer = elem[0].querySelector('.textInputContainer')
			var inputElem = elem[0].querySelector('.textInputElem')
			var stylePreset

			/* TEXTAREA CODE
				var fullTextElem = elem[0].querySelector('.customInputFullText');
				var fullTextTextarea = fullTextElem.querySelector('textarea'); */

			scope.isReadonly = false
			scope.fullTextEnabled = false

			// TIPS
			// scope.smallOptions probable properties
			// tooltipText: custom tolltip text
			// notNull: turn on error mode if field is not filled
			// noIndicatorBtn: whether to show button at the right part of input
			// readonly: making input readonly
			// dialogParent: 'string' - querySelector content for element to insert mdDialog into

			if (scope.smallOptions) {
				scope.tooltipText = scope.smallOptions.tooltipText
				scope.isReadonly = scope.smallOptions.readonly
				scope.dialogParent = scope.smallOptions.dialogParent

				if (scope.smallOptions.noIndicatorBtn) {
					scope.noIndicatorBtn = true
				}
			}

			scope.getInputContainerClasses = function () {
				var classes = ''

				if (scope.isDisabled) {
					classes += 'custom-input-is-disabled'
				} else if (scope.error) {
					classes = 'custom-input-error'
				} else if (stylePreset) {
					classes = 'custom-input-preset' + stylePreset
				} /* else if (scope.valueIsValid) {
						classes = 'custom-input-is-valid';

					}*/

				if (scope.noIndicatorBtn) {
					classes += ' no-indicator-btn'
				}

				return classes
			}

			var onChangeIndex

			scope.onInputChange = function () {
				clearTimeout(onChangeIndex)

				onChangeIndex = setTimeout(function () {
					stylePreset = ''
					scope.valueIsValid = false

					if (scope.model) {
						scope.valueIsValid = true
					} else {
						if (scope.smallOptions && scope.smallOptions.notNull) {
							scope.error = 'Field should not be null'
						}
					}

					scope.$apply()

					if (scope.onChangeCallback) scope.onChangeCallback()
				}, 500)

				/* if (scope.onChangeCallback) {
                        setTimeout(function () {
                            scope.onChangeCallback();
                        }, 0);
                    } */
			}

			/*var applyCustomStyles = function () {

                    /!*
                        {
                          'class-of-element-to-which-styles-added': 'string with styles content',
                          'another-class-of-another-element': 'string with styles content'
                        }
                    *!/
                    Object.keys(scope.customStyles).forEach(function (className) {

                        var elemClass = '.' + className;
                        var elemToApplyStyles = elem[0].querySelector(elemClass);

                        if (elemToApplyStyles) {
                            elemToApplyStyles.style.cssText = scope.customStyles[className];
                        }

                    });

                };*/

			scope.openExpressionBuilder = function ($event) {
				var dialogParent = angular.element(document.body)

				if (scope.dialogParent) {
					var dialogParentElem = document.querySelector(scope.dialogParent)

					if (dialogParentElem) {
						dialogParent = dialogParentElem
					}
				}

				$mdDialog
					.show({
						controller: 'ExpressionEditorDialogController as vm',
						templateUrl: 'views/dialogs/expression-editor-dialog-view.html',
						parent: dialogParent,
						targetEvent: $event,
						preserveScope: true,
						multiple: true,
						autoWrap: true,
						skipHide: true,
						locals: {
							item: { expression: scope.model },
							data: scope.data,
						},
					})
					.then(function (res) {
						if (res.status === 'agree') {
							scope.model = res.data.item.expression
						}
					})
			}

			var setErrorBasedOnStatus = function (errorStatus) {
				switch (errorStatus) {
					case 'error':
						scope.error = 'Invalid expression'
						break

					case 'functions-error':
						scope.error = 'Not all variables are identified expression'
						break

					case 'inputs-error':
						scope.error = 'Not all variables are identified inputs'
						break

					case 'bracket-error':
						scope.error = 'Mismatch in the opening and closing braces'
						break
				}
			}

			var validateExpressionSyntax = function () {
				helpExpressionsService
					.validateExpression({ expression: scope.model }, scope.data)
					.then(function (data) {
						if (data.status) {
							setErrorBasedOnStatus(data.status)
							scope.$apply()
						}
					})
					.catch(function (res) {
						scope.error = 'Invalid expression'

						if (res.htmlExpressionData && res.htmlExpressionData.status) {
							setErrorBasedOnStatus(res.htmlExpressionData.status)
						}

						scope.$apply()
					})
			}

			var initScopeWatchers = function () {
				scope.$watch('model', function () {
					if (scope.error && scope.model) {
						scope.error = ''
					}
				})

				if (scope.eventSignal) {
					// this if prevents watcher below from running without need

					scope.$watch('eventSignal', function () {
						if (scope.eventSignal && scope.eventSignal.key) {
							switch (scope.eventSignal.key) {
								case 'mark_not_valid_fields':
									if (
										scope.smallOptions &&
										scope.smallOptions.notNull &&
										!scope.model
									) {
										scope.error = 'Field should not be null'
									}

									break

								case 'error':
									scope.error = JSON.parse(
										JSON.stringify(scope.eventSignal.error)
									)
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

				/* TEXTAREA CODE
					inputElem.addEventListener('focus', function () {

						inputContainer.classList.add('custom-input-full-text-focused');

						fullTextTextarea.focus();

                    }); */

				/* TEXTAREA CODE
                    fullTextTextarea.addEventListener('blur', function () {

                        inputContainer.classList.remove('custom-input-full-text-focused');

                        if (scope.model && !scope.error) {
                            validateExpressionSyntax();
                        }

                    }); */

				inputElem.addEventListener('blur', function () {
					if (scope.model && !scope.error) {
						validateExpressionSyntax()
					}
				})
			}

			var init = function () {
				initScopeWatchers()

				initEventListeners()

				/*if (scope.customStyles) {
                        applyCustomStyles();
                    }*/
			}

			init()
		},
	}
}
