export default function () {
	return {
		restrict: 'E',
		scope: {
			label: '@',
			model: '=',
			placeholderText: '@',
			customButtons: '=',
			customStyles: '=',
			elemsStyles: '=',
			eventSignal: '=',
			smallOptions: '=',
			isDisabled: '=',
			isReadonly: '=',
			emptyInputButton: '@',
			onChangeCallback: '&?',
		},
		templateUrl: 'views/directives/customInputs/date-input-view.html',
		link: function (scope, elem, attr) {
			scope.error = ''
			// scope.placeholderText = "yyyy-mm-dd";
			scope.placeholder = scope.placeholderText || 'yyyy-mm-dd'

			scope.dateValue = '' // prevents from calling on change method when date changed to the same date

			var onChangeDelay = 800 // should be same as debounce of input.date-input
			var stylePreset
			// var pickmeupChangeTimeout;

			// TIPS
			// scope.smallOptions probable properties
			// tooltipText: custom tolltip text
			// notNull: turn on error mode if field is not filled
			// noIndicatorBtn: whether to show button at the right part of input

			var inputContainer = elem[0].querySelector('.dateInputContainer')
			var inputElem = elem[0].querySelector('.dateInputElem')

			var inputLoaded = false // prevents not null inputs highlight from start
			// var dateChangedFromOutside = true;

			var doNotShowDatepicker = true // used to prevent datepicker show on click
			var position = 'right'
			var defaultDate = false

			if (scope.smallOptions) {
				scope.tooltipText = scope.smallOptions.tooltipText

				if (scope.smallOptions.position) position = scope.position
				if (scope.smallOptions.defaultDate) defaultDate = scope.defaultDate

				scope.noIndicatorBtn = scope.smallOptions.noIndicatorBtn
			}

			/**
			 * Prevents entering number that is more than max number
			 *
			 * @param str {string}
			 * @param max {number} - maximum number allowed
			 * @returns {string}
			 */
			function checkValue(str, max) {
				if (str.charAt(0) !== '0' || str == '00') {
					var num = parseInt(str)
					var numIsInvalid = isNaN(num) || num <= 0 || num > max
					if (numIsInvalid) num = 1

					str = num.toString()

					var tensMoreThanMax =
						num > parseInt(max.toString().charAt(0)) &&
						num.toString().length == 1
					if (tensMoreThanMax) {
						str = '0' + num
					}
				}

				return str
			}

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
			/**
			 * Change date to YYYY-MM-DD format
			 * @param dateText {string}
			 */
			var formatDateValue = function (dateText) {
				if (/\D\/$/.test(dateText))
					dateText = dateText.substr(0, dateText.length - 3)

				var values = dateText.split('-').map(function (v) {
					// prevent writing of non digits
					return v.replace(/\D/g, '')
				})

				if (values[1]) values[1] = checkValue(values[1], 12)
				if (values[2]) values[2] = checkValue(values[2], 31)

				var output = values.map(function (v, i) {
					if (v.length == 4 && i == 0) {
						return v + '-'
					} else if (v.length == 2 && i == 1) {
						return v + '-'
					} else {
						return v
					}
				})

				// this.value = output.join('').substr(0, 14);
				scope.dateValue = output.join('').substr(0, 14)

				return scope.dateValue
			}

			var onChangeIndex
			var prevDateValue = ''
			/** @param dateValue {string} - entered by user */
			scope.onDateChange = function (dateValue) {
				// scope.error = "";
				var error = '',
					model,
					valueIsValid
				stylePreset = ''

				var onChangeEnd = function () {
					// dateChangedFromOutside = false;

					clearTimeout(onChangeIndex)

					onChangeIndex = setTimeout(() => {
						scope.valueIsValid = valueIsValid
						scope.error = error

						scope.$apply()

						if (scope.onChangeCallback) scope.onChangeCallback()
					}, onChangeDelay)
				}

				if (dateValue) {
					var characterAdded =
						!!!prevDateValue || dateValue.length > prevDateValue.length

					if (characterAdded) dateValue = formatDateValue(dateValue)

					if (dateValue !== scope.model) {
						if (moment(dateValue, 'YYYY-MM-DD', true).isValid()) {
							valueIsValid = true
							model = dateValue
						} else {
							valueIsValid = false
							error =
								'Date has wrong format. Use one of these formats instead: YYYY-MM-DD.'
							model = null
						}

						/* if (scope.onChangeCallback) {

                                setTimeout(function () {
                                    scope.onChangeCallback();
                                }, 0);

                            } */
						if (model !== scope.model) {
							// don't signal change if invalid value changed on another invalid value or null

							scope.model = model
							onChangeEnd()
						}
					}
				} else if (scope.model !== null) {
					// if dateValue === null || dateValue === undefined || dateValue === ''

					valueIsValid = false
					scope.model = null

					if (scope.smallOptions && scope.smallOptions.notNull) {
						error = 'Field should not be null'
					}

					onChangeEnd()
					/* if (scope.onChangeCallback) {

                            setTimeout(function () {
                                scope.onChangeCallback();
                            }, 0);

                        } */
				}

				prevDateValue = dateValue
			}

			/* var onDateBlur = function () {

                    scope.error = "";
                    stylePreset = "";

            if (scope.dateValue) {

                if (scope.dateValue !== scope.model) {

                    if (moment(scope.dateValue, "YYYY-MM-DD", true).isValid()) {

                        scope.valueIsValid = true;
                        scope.model = JSON.parse(JSON.stringify(scope.dateValue));

                    } else {

                        scope.valueIsValid = false;
                        scope.error ="Date has wrong format. Use one of these formats instead: YYYY-MM-DD.";
                        scope.model = null;

                    }

                    if (scope.onChangeCallback) {

                        setTimeout(function () {
                            scope.onChangeCallback();
                        }, 0);

                    }

                }

            } else if (scope.dateValue !== scope.model) {

                scope.valueIsValid = false;
                scope.model = null;

                if (scope.smallOptions && scope.smallOptions.notNull) {
                    scope.error = "Field should not be null";
                }

                if (scope.onChangeCallback) {

                    setTimeout(function () {
                        scope.onChangeCallback();
                    }, 0);

                }

            }
                }; */

			scope.callFnForCustomBtn = function (actionData) {
				if (actionData.parameters) {
					actionData.callback(actionData.parameters)
				} else {
					actionData.callback()
				}
			}

			scope.focusDateInput = function () {
				inputElem.focus()
				doNotShowDatepicker = false

				pickmeup(inputElem).show()
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

			scope.emptyInput = function () {
				scope.dateValue = null
				scope.onDateChange(scope.dateValue)
			}

			var prepareCustomButtons = function () {
				scope.plussMinusButtons = []
				scope.usualCustomButtons = []

				scope.customButtons.forEach(function (cBtn) {
					if (
						cBtn.classes &&
						cBtn.classes.indexOf('date-input-specific-btns') > -1
					) {
						scope.plussMinusButtons.push(cBtn)
					} else {
						scope.usualCustomButtons.push(cBtn)
					}
				})
			}

			var initEventListeners = function () {
				elem[0].addEventListener('mouseover', function () {
					inputContainer.classList.add('custom-input-hovered')
				})

				elem[0].addEventListener('mouseleave', function () {
					inputContainer.classList.remove('custom-input-hovered')
				})

				inputElem.addEventListener('focus', function () {
					doNotShowDatepicker = true
					inputContainer.classList.add('custom-input-focused')
				})

				/* inputElem.addEventListener('input', function (e) {
                        this.type = 'text';
                        var input = this.value;
                        if (/\D\/$/.test(input)) input = input.substr(0, input.length - 3);
                        var values = input.split('-').map(function (v) {
                            return v.replace(/\D/g, '')
                        });

                        if (values[1]) values[1] = checkValue(values[1], 12);
                        if (values[2]) values[2] = checkValue(values[2], 31);

                        var output = values.map(function (v, i) {
                            if (v.length == 4 && i == 0) {
                                return v + '-'
                            }
                            else if (v.length == 2 && i == 1) {
                                return v + '-'
                            }
                            else {
                                return v
                            }
                        });


                        this.value = output.join('').substr(0, 14);
                    }); */

				inputElem.addEventListener('blur', function () {
					inputContainer.classList.remove('custom-input-focused')

					setTimeout(function () {
						// without timeout changes will be discarded on fast blur
						// onDateBlur();
						scope.$apply()
					}, 250)

					/*this.type = 'text';
                        var input = this.value;
                        var values = input.split('-').map(function (v, i) { // parse
                            return v.replace(/\D/g, '')
                        });*/

					var values = scope.dateValue.split('-').map(function (v, i) {
						// parse
						return v.replace(/\D/g, '')
					})
					var output = ''

					if (values.length === 3) {
						var year =
							values[0].length !== 4
								? parseInt(values[0]) + 2000
								: parseInt(values[0])
						var month = parseInt(values[1]) - 1
						var day = parseInt(values[2])
						var dateVal = new Date(year, month, day)

						if (!isNaN(dateVal)) {
							// var dates = [dateVal.getMonth() + 1, dateVal.getDate(), dateVal.getFullYear()];
							var dates = [
								dateVal.getFullYear(),
								dateVal.getMonth() + 1,
								dateVal.getDate(),
							]

							output = dates
								.map(function (v) {
									v = v.toString()
									return v.length == 1 ? '0' + v : v
								})
								.join('-')
						}
					}

					// this.value = output;
					if (output && scope.model !== output) {
						scope.model = output
						scope.$apply()

						if (scope.onChangeCallback) scope.onChangeCallback()
					}
				})

				inputElem.addEventListener('pickmeup-show', function (event) {
					if (doNotShowDatepicker) event.preventDefault()
				})

				inputElem.addEventListener('pickmeup-change', function (event) {
					scope.dateValue = event.detail.formatted_date
					scope.$apply()

					/* clearTimeout(pickmeupChangeTimeout);

                        pickmeupChangeTimeout = setTimeout(function () {
                            scope.onDateChange();
                        }, onChangeDelay); */
					scope.onDateChange(scope.dateValue)
				})

				inputElem.addEventListener('pickmeup-hide', function (event) {
					doNotShowDatepicker = true
				})
			}

			var initScopeWatchers = function () {
				scope.$watch('model', function () {
					//if (scope.model && scope.model.value) {
					// if (dateChangedFromOutside) { // don't execute if date was entered into input manually
					if (!inputContainer.classList.contains('custom-input-focused')) {
						if (scope.model) {
							if (scope.model !== scope.dateValue) {
								scope.error = ''
								scope.dateValue = scope.model
								prevDateValue = scope.dateValue

								if (!moment(scope.dateValue, 'YYYY-MM-DD', true).isValid()) {
									scope.valueIsValid = false
									scope.error =
										'Date has wrong format. Use one of these formats instead: YYYY-MM-DD.'
									scope.model = null
								}
							}
						} else {
							if (scope.dateValue) {
								if (!scope.error) {
									scope.dateValue = ''
									prevDateValue = scope.dateValue
								}
							} else if (
								scope.smallOptions &&
								scope.smallOptions.notNull &&
								inputLoaded
							) {
								scope.error = 'Field should not be null'
							}
						}

						inputLoaded = true
					}

					// dateChangedFromOutside = true;
				})

				if (scope.eventSignal) {
					// this if prevents watcher below from running without need

					scope.$watch('eventSignal', function () {
						if (scope.eventSignal && scope.eventSignal.key) {
							switch (scope.eventSignal.key) {
								case 'mark_not_valid_fields':
									/*if (scope.smallOptions && scope.smallOptions.notNull) {

                                                if (!scope.model && !scope.dateValue) {
                                                        scope.error = 'Field should not be null';
                                                }

                                        }*/

									if (!scope.model && !scope.dateValue) {
										scope.error = 'Field should not be null'
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

			var init = function () {
				if (scope.customButtons) {
					prepareCustomButtons()
				}

				if (scope.dateValue) {
					pickmeup(inputElem, {
						date: new Date(scope.dateValue),
						current: new Date(scope.dateValue),
						position: position,
						default_date: defaultDate,
						hide_on_select: true,
						format: 'Y-m-d',
					})
				} else {
					pickmeup(inputElem, {
						position: position,
						default_date: defaultDate,
						hide_on_select: true,
						format: 'Y-m-d',
					})
				}

				initScopeWatchers()

				initEventListeners()

				if (scope.customStyles) {
					applyCustomStyles()
				}
			}

			init()
		},
	}
}
