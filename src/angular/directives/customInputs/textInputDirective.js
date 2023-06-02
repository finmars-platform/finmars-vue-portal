import stringHelper from '../../helpers/stringHelper'
import metaHelper from '../../helpers/meta.helper'

export default function ($mdDialog) {
	return {
		restrict: 'E',
		scope: {
			label: '@',
			placeholderText: '@',
			model: '=',
			customButtons: '=',
			customStyles: '=',
			eventSignal: '=',
			smallOptions: '=',

			isDisabled: '=',
			isLocked: '@',
			renderHyperlinks: '=',

			onChangeCallback: '&?',
			onBlurCallback: '&?',
			// onFocus: "=" // I can't bind as "&?" because onFocus need event argument
		},
		templateUrl: 'views/directives/customInputs/text-input-view.html',
		link: function (scope, elem, attr) {
			let inputContainer // = elem[0].querySelector(".textInputContainer");

			let inputElem // = elem[0].querySelector(".textInputElem");
			let stylePreset

			/* TEXTAREA CODE

				var fullTextWrapper;
				var fullTextElem;

				scope.isReadonly = false;
				scope.fullTextEnabled = false;
				scope.fullText = {value: scope.model};*/

			/*
				TIPS
				customButtons
					iconObj,
                    tooltip: string with tooltip text,
                    caption: string,
                    classes: string with classes for elem,
                    action: Object
                    	key: identifier for an action
                    	callback: function
                    	parameters: parameter object for callback function

				scope.smallOptions probable properties
					tooltipText: custom tooltip text
					notNull: turn on error mode if field is not filled
					noIndicatorBtn: whether to show button at the right part of input
					readonly: making input readonly
					dialogParent: 'string' - querySelector content for element to insert mdDialog into
				*/
			if (scope.smallOptions) {
				scope.tooltipText = scope.smallOptions.tooltipText
				scope.isReadonly = scope.smallOptions.readonly
				scope.dialogParent = scope.smallOptions.dialogParent
				scope.noIndicatorBtn = scope.smallOptions.noIndicatorBtn
			}

			scope.locked = scope.isLocked === 'true'

			scope.getInputContainerClasses = function () {
				var classes = ''

				if (scope.disabled()) {
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

				if (scope.renderHyperlinks) {
					classes += ' render-hyperlinks'
				}

				return classes
			}

			scope.unlockInput = function () {
				scope.locked = false
			}

			scope.disabled = function () {
				return scope.isDisabled || scope.locked
			}

			var onChangeIndex

			scope.onInputChange = function (modelVal) {
				if (modelVal !== undefined) {
					// needed for textarea.customInputFullText
					scope.model = modelVal
				}

				clearTimeout(onChangeIndex)

				onChangeIndex = setTimeout(() => {
					scope.error = ''
					stylePreset = ''
					scope.valueIsValid = false

					if (scope.model) {
						scope.valueIsValid = true
					} else {
						if (scope.smallOptions && scope.smallOptions.notNull) {
							scope.error = 'Field should not be null'
						}
					}

					/* if (scope.onChangeCallback) {
							 setTimeout(function () {
								scope.onChangeCallback();
							}, 0);
						} */
					scope.$apply()

					if (scope.onChangeCallback) scope.onChangeCallback()
				}, 500)
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

			scope.callFnForCustomBtn = function (actionData) {
				if (actionData.parameters) {
					actionData.callback(actionData.parameters)
				} else {
					actionData.callback()
				}
			}

			scope.getHyperlinks = () => {
				return stringHelper.parseAndInsertHyperlinks(
					scope.model,
					"class='openLinkInNewTab'"
				)
			}

			scope.openTextInDialog = function ($event) {
				var dialogParent = angular.element(document.body)

				if (scope.dialogParent) {
					var dialogParentElem = document.querySelector(scope.dialogParent)

					if (dialogParentElem) {
						dialogParent = dialogParentElem
					}
				}

				$mdDialog
					.show({
						controller: 'TextEditorDialogController as vm',
						templateUrl: 'views/dialogs/text-editor-dialog-view.html',
						parent: dialogParent,
						targetEvent: $event,
						multiple: true,
						locals: {
							data: {
								title: 'Text',
								text: scope.model,
							},
						},
					})
					.then(function (res) {
						if (res.status === 'agree') {
							stylePreset = ''
							scope.model = res.text

							if (scope.onChangeCallback) {
								setTimeout(function () {
									scope.onChangeCallback()
								}, 0)
							}
						}
					})
			}

			scope.onInputBlur = function () {
				if (scope.onBlurCallback) {
					setTimeout(function () {
						// without timeout changes will be discarded on fast blur
						scope.onBlurCallback()
					}, 250)
				}
			}

			let initScopeWatchers = function () {
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

								case 'reset': // reset changes done by eventSignal
									scope.error = ''
									stylePreset = ''

									break
							}

							scope.eventSignal = {}
						}
					})
				}
			}

			/* TEXTAREA CODE

				let closeFulltext = function () {

					inputContainer.classList.remove("custom-input-full-text-focused");

					// for hyperlink mode
					inputElem.blur();
					document.removeEventListener("keypress", closeFulltext);
					// < for hyperlink mode >

					if (scope.onBlurCallback) {

						setTimeout(function () {
							// without timeout changes will be discarded on fast blur
							scope.onBlurCallback();
						}, 250);

					}

				};*/

			let initEventListeners = function () {
				elem[0].addEventListener('mouseover', function () {
					inputContainer.classList.add('custom-input-hovered')
				})

				elem[0].addEventListener('mouseleave', function () {
					inputContainer.classList.remove('custom-input-hovered')
				})

				if (scope.renderHyperlinks) {
					inputElem.addEventListener('click', function (event) {
						if (event.target.classList.contains('openLinkInNewTab')) {
							metaHelper.openLinkInNewTab(event)
						} /* TEXTAREA CODE
							else {

								inputContainer.classList.add("custom-input-full-text-focused");

								fullTextElem.focus();

								if (scope.renderHyperlinks) {
									document.addEventListener("keyup", closeFulltext);
								}

							} */
					})

					/* TEXTAREA CODE

						fullTextWrapper.addEventListener("mouseleave", closeFulltext);
						fullTextElem.addEventListener("click", metaHelper.openLinkInNewTab); */
				}
				/* TEXTAREA CODE
					else {

						inputElem.addEventListener("focus", function () {

							inputContainer.classList.add("custom-input-full-text-focused");



							fullTextElem.focus();

						});

						fullTextElem.addEventListener("blur", closeFulltext);

					} */

				/* TEXTAREA CODE

					fullTextElem.addEventListener("blur", function () {

						if (typeof scope.onFocus === "function") {

							fullTextElem.removeEventListener("focus", scope.onFocus);

						}

						inputContainer.classList.remove("custom-input-full-text-focused");

						if (scope.onBlurCallback) {

							setTimeout(function () {
								// without timeout changes will be discarded on fast blur
								scope.onBlurCallback();
							}, 250);

						}

					});

					if (typeof scope.onFocus === "function") {

						fullTextElem.addEventListener("focus", scope.onFocus);

					} */

				inputElem.addEventListener('focus', function () {
					inputContainer.classList.add('custom-input-focused')
				})

				inputElem.addEventListener('blur', function () {
					inputContainer.classList.remove('custom-input-focused')
				})
			}

			/* TEXTAREA CODE

				let elemsInintedNum = 0;

				scope.elemInited = function () {

					elemsInintedNum++;

					if (elemsInintedNum === 2) { // textInputElem, customInputFullText
						scope.init();
					}

				}; */

			scope.init = function () {
				// called from view by ngInit

				inputContainer = elem[0].querySelector('.textInputContainer')
				inputElem = elem[0].querySelector('.textInputElem')

				/* TEXTAREA CODE

					fullTextWrapper = elem[0].querySelector(".customInputFullTextWrapper");
					fullTextElem = fullTextWrapper.querySelector(".customInputFullText");*/

				initScopeWatchers()

				initEventListeners()

				if (scope.customStyles) {
					applyCustomStyles()
				}
			}
		},
	}
}
