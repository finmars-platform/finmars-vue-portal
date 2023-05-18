import attributeTypeService from '../../services/attributeTypeService'

export default function ($mdDialog) {
	return {
		restrict: 'E',
		require: '?ngModel',
		scope: {
			label: '@',
			placeholderText: '@',
			model: '=',
			modelProp: '@', // 'id', 'name'. Default 'id'.
			//menuOptions: '=',
			customStyles: '=',
			eventSignal: '=',
			smallOptions: '=',
			isDisabled: '=',
			itemName: '=',

			classifierAttr: '=', // object of classifier attribute
			classifierValue: '=',
			entityType: '=',

			onChangeCallback: '&?',
		},
		templateUrl: 'views/directives/customInputs/classifier-select-view.html',
		link: function (scope, elem, attr) {
			scope.error = ''
			scope.inputValue = ''
			scope.dropdownMenuHidden = false
			scope.dropdownMenuFilter = ''
			scope.menuOptions = []

			var dialogParent
			/*
				TIPS
				scope.smallOptions probable properties
					tooltipText: custom tooltip text
					notNull: turn on error mode if field is not filled
					noIndicatorBtn: whether to show button at the right part of input
					readonly: making input readonly
					dialogParent: 'string' - querySelector content for element to insert mdDialog into
				*/
			if (scope.smallOptions) {
				scope.tooltipText = scope.smallOptions.tooltipText
				scope.noIndicatorBtn = scope.smallOptions.noIndicatorBtn
				dialogParent = scope.smallOptions.dialogParent
			}

			if (!scope.modelProp) scope.modelProp = 'id'

			var itemName = scope.itemName || ''

			if (scope.itemName) {
				// itemName and inputText needed for resetting selected option name
				scope.inputText = itemName
			}

			var stylePreset

			var inputContainer = elem[0].querySelector('.classifierInputContainer')
			var inputElem = elem[0].querySelector('.dropdownSelectInputElem')

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

			scope.callFnForCustomBtn = function (actionData) {
				if (actionData.parameters) {
					actionData.callback(actionData.parameters)
				} else {
					actionData.callback()
				}
			}

			scope.selectOption = function (item) {
				if (item[scope.modelProp] !== scope.model) {
					stylePreset = ''
					scope.error = ''

					scope.model = item[scope.modelProp]
					scope.valueIsValid = true

					/*if (typeof scope.itemName !== 'undefined') {
                            scope.itemName = item.name;
                        }*/
					itemName = item.name
					scope.inputText = itemName

					closeDropdownMenu()

					setTimeout(function () {
						if (scope.onChangeCallback) {
							scope.onChangeCallback()
						}

						scope.$apply()
					}, 0)
				}
			}

			scope.onInputTextChange = function () {
				scope.dropdownMenuFilter = scope.inputText
			}

			var closeDropdownMenu = function (updateScope) {
				inputContainer.classList.remove('custom-input-focused')

				scope.inputText = itemName

				scope.dropdownMenuHidden = false

				window.removeEventListener('click', closeDDMenuOnClick)
				document.removeEventListener('keydown', onTabKeyPress)

				if (updateScope) scope.$apply()
			}

			var closeDDMenuOnClick = function (event) {
				var targetElem = event.target

				scope.dropdownMenuFilter = null

				if (!inputContainer.contains(targetElem)) {
					closeDropdownMenu(true)
				}
			}

			var onTabKeyPress = function (event) {
				var pressedKey = event.key

				if (pressedKey === 'Tab') {
					closeDropdownMenu(true)
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

			scope.openSelectorDialog = function ($event) {
				var parent = angular.element(document.body)

				if (dialogParent) {
					var parentElem = document.querySelector(dialogParent)

					if (parentElem) {
						parent = parentElem
					}
				}

				$mdDialog
					.show({
						controller: 'ClassifierSelectDialogController as vm',
						templateUrl: 'views/classifier-select-dialog-view.html',
						parent: parent,
						targetEvent: $event,
						preserveScope: true,
						autoWrap: true,
						multiple: true,
						skipHide: true,
						locals: {
							data: {
								classifier: scope.classifierAttr,
								classifierId: scope.classifierValue,
								entityType: scope.entityType,
							},
						},
					})
					.then(function (res) {
						if (res.status === 'agree') {
							scope.model = res.data.item

							if (scope.modelProp === 'name') {
								scope.model = res.data.name
							}

							if (typeof scope.itemName !== 'undefined') {
								scope.itemName = res.data.name
							}

							scope.inputText = res.data.name

							getTree()

							setTimeout(function () {
								if (scope.onChangeCallback) {
									scope.onChangeCallback()
								}
							}, 0)
						}
					})
			}

			var initScopeWatchers = function () {
				scope.$watch('model', function () {
					if (scope.model && scope.menuOptions && scope.menuOptions.length) {
						for (var i = 0; i < scope.menuOptions.length; i++) {
							if (scope.menuOptions[i][scope.modelProp] === scope.model) {
								itemName = scope.menuOptions[i].name
								scope.inputText = itemName
								scope.valueIsValid = true
								break
							}
						}
					} else {
						itemName = ''
						scope.inputText = itemName
						scope.valueIsValid = false
					}
				})

				if (scope.eventSignal) {
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

							scope.eventSignal = {} // reset signal
						}
					})
				}

				scope.$watch('itemName', function () {
					if (scope.itemName) {
						itemName = scope.itemName
					} else {
						itemName = ''
					}

					scope.inputText = itemName
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
					scope.inputText = ''
					inputContainer.classList.add('custom-input-focused')

					scope.dropdownMenuHidden = true

					window.addEventListener('click', closeDDMenuOnClick)
					document.addEventListener('keydown', onTabKeyPress)

					scope.$apply()
				})

				/* inputElem.addEventListener('blur', function (event) {

                        inputContainer.classList.remove('custom-input-focused');

                        if (scope.itemName) {
                            scope.inputText = JSON.parse(JSON.stringify(scope.itemName));
                            scope.$apply();
                        }

                    }); */
			}

			/**
			 * Convert classifier data tree into flat list
			 *
			 * @param classifiers {Array}
			 */
			const recursiveFlat = (classifiers) => {
				return classifiers.reduce((acc, classifier) => {
					if (classifier.children.length > 0) {
						return [...acc, classifier, ...recursiveFlat(classifier.children)]
					}

					return [...acc, classifier]
				}, [])
			}

			var getTree = function () {
				var classifierId = scope.classifierAttr.id

				attributeTypeService
					.getByKey(scope.entityType, classifierId)
					.then(function (data) {
						scope.menuOptions = recursiveFlat(data.classifiers)

						for (var i = 0; i < scope.menuOptions.length; i++) {
							if (scope.menuOptions[i][scope.modelProp] === scope.model) {
								/*if (typeof scope.itemName !== 'undefined') {
                                    scope.itemName = scope.menuOptions[i].name;
                                }*/
								itemName = scope.menuOptions[i].name
								scope.inputText = itemName

								break
							}
						}

						scope.$apply()
					})
			}

			var init = function () {
				if (scope.classifierAttr && scope.classifierAttr.id) {
					getTree()
				}

				initScopeWatchers()

				initEventListeners()

				/*scope.iconData = entityIndicatorIcons[indicatorBtnIcon];*/

				if (scope.customStyles) {
					applyCustomStyles()
				}
			}

			init()

			scope.$on('$destroy', function () {
				window.removeEventListener('click', closeDDMenuOnClick)
				document.removeEventListener('keydown', onTabKeyPress)
			})
		},
	}
}
