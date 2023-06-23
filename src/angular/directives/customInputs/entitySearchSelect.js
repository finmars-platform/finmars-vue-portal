/**
 * Created by szhitenev on 28.06.2016.
 */

import EventService from '../../services/eventService'
import popupEvents from '../../services/events/popupEvents'

import entityResolverService from '../../services/entityResolverService'

export default function ($mdDialog, metaContentTypesService) {
	return {
		restrict: 'E',
		scope: {
			label: '=',
			item: '=',
			itemName: '=',
			itemProperty: '@', // is 'id' by default
			itemObject: '=',
			entityType: '=',
			customButtons: '=',
			customStyles: '=',
			eventSignal: '=',
			smallOptions: '=',
			isDisabled: '=',

			onMenuOpen: '&?',
			onMenuClose: '&?',
			onChangeCallback: '&?',
		},
		templateUrl: 'views/directives/customInputs/entity-search-select-view.html',
		link: function (scope, elem, attrs) {
			scope.error = ''
			scope.inputValue = ''
			scope.placeholderText = 'Relation'
			//scope.tooltipText = 'Tooltip text';
			if (!scope.itemProperty) scope.itemProperty = 'id'
			let itemName = scope.itemName || ''

			if (scope.itemName) {
				// itemName and inputText needed for resetting selected option name
				scope.inputText = itemName
			}

			// TIPS
			// scope.smallOptions probable properties
			// tooltipText: custom tolltip text
			// notNull: turn on error mode if field is not filled
			// dialogParent: 'string' - querySelector content for element to insert mdDialog into

			if (scope.smallOptions) {
				scope.tooltipText = scope.smallOptions.tooltipText
				scope.dialogParent = scope.smallOptions.dialogParent
			}

			scope.popupEventService = new EventService()

			let stylePreset

			const inputContainer = elem[0].querySelector('.smartSearchInputContainer')
			const inputElem = elem[0].querySelector('.smartSearchInputElem')

			/*var entityIndicatorIcons = {
                    'account': {
                        type: 'class',
                        icon: 'fas fa-university'
                    },
                    'counterparty': {
                        type: 'class',
                        icon: 'far fa-id-badge'
                    },
                    'responsible': {
                        type: 'class',
                        icon: 'far fa-user'
                    },
                    'currency': {
                        type: 'class',
                        icon: 'far fa-money-bill-alt'
                    },
                    'instrument': {
                        type: 'class',
                        icon: 'fas fa-money-bill-alt'
                    },
                    'portfolio': {
                        type: 'class',
                        icon: 'fas fa-briefcase'
                    },
                    'strategy-1': {
                        type: 'class',
                        icon: 'fas fa-tag'
                    },
                    'strategy-2': {
                        type: 'class',
                        icon: 'fas fa-tag'
                    },
                    'strategy-3': {
                        type: 'class',
                        icon: 'fas fa-tag'
                    }

                }*/
			/* scope.menuOptionsPopupData = {
					options: [],
					selectOption: function (item, _$popup, $event) {

						_$popup.cancel();

						if (item.id !== scope.item) {

							stylePreset = '';
							scope.error = '';
							//scope.item.value = item.id;
							scope.item = item.id;

							if (scope.itemObject !== undefined) {
								scope.itemObject = item;
							}

							scope.valueIsValid = true;

							if (item.short_name) {
								itemName = item.short_name;
								scope.inputText = item.short_name;

							} else {
								itemName = item.name;
								scope.inputText = item.name;
							}

							closeDropdownMenu();

							setTimeout(function () {

								scope.onChangeCallback();
								scope.$apply();

							}, 0);

						}

					},
					focusInput: function () {
						setTimeout(() => {
							const filter = document.querySelector('input.popup-select-filter');
							filter.focus();
						}, 100);

					},
					onInit: async function () {

						// scope.inputText = "";
						inputContainer.classList.add('custom-input-focused');

						// scope.dropdownMenuShown = true;

						// window.addEventListener('click', closeDDMenuOnClick);
						document.addEventListener('keydown', onTabKeyPress);

						if (scope.loadMenuOptions) {
							// scope.menuOptions = await scope.loadMenuOptions();
							scope.menuOptionsPopupData.options = await scope.loadMenuOptions();

							setTimeout(function () {
								scope.$apply();
							}, 100);

						}

					}
				}; */

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

			scope.selectOption = function (item, _$popup) {
				if (_$popup) _$popup.cancel()

				if (item[scope.itemProperty] !== scope.item) {
					stylePreset = ''
					scope.error = ''
					//scope.item.value = item.id;
					scope.item = item[scope.itemProperty]

					if (scope.itemObject !== undefined) scope.itemObject = item

					scope.valueIsValid = true

					if (item.short_name) {
						itemName = item.short_name
						scope.inputText = item.short_name
					} else {
						itemName = item.name
						scope.inputText = item.name
					}

					/* DROPDOWN MENU
                        closeDropdownMenu();*/

					setTimeout(function () {
						if (scope.onChangeCallback) scope.onChangeCallback()
						scope.$apply()
					}, 0)
				}
			}

			var getOptionsList = function () {
				var options = {
					page: 1,
					pageSize: 1000,
				}

				if (scope.inputText) {
					var inputText = scope.inputText

					options.filters = {
						short_name: inputText,
					}
				}

				scope.menuOptionsPopupData.loadingOptions = true

				entityResolverService
					.getListLight(scope.entityType, options)
					.then(function (data) {
						// scope.selectorOptions = data.results;
						scope.menuOptionsPopupData.selectorOptions = data.results
						scope.popupEventService.dispatchEvent(popupEvents.OPEN_POPUP)

						/* DROPDOWN MENU
                        window.addEventListener('click', closeDDMenuOnClick);*/
						document.addEventListener('keydown', onTabKeyPress)

						scope.menuOptionsPopupData.loadingOptions = false

						scope.$apply()
					})
			}

			scope.onInputTextChange = function () {
				getOptionsList()
			}

			var closeDropdownMenu = function (updateScope) {
				/*scope.menuOptionsPopupData.selectorOptions = null;

                    window.removeEventListener('click', closeDDMenuOnClick);
                    document.removeEventListener('keydown', onTabKeyPress);

					if (scope.onMenuClose) {
						scope.onMenuClose();
					}

                    if (updateScope) {
                        scope.$apply();
                    }*/
			}

			var closeDDMenuOnClick = function (event) {
				var targetElem = event.target

				if (!inputContainer.contains(targetElem)) {
					closeDropdownMenu(true)
				}
			}

			scope.onMenuPopupClose = function () {
				document.removeEventListener('keydown', onTabKeyPress)

				if (scope.onMenuClose) {
					scope.onMenuClose()
				}
			}

			const onTabKeyPress = function (event) {
				var pressedKey = event.key

				if (pressedKey === 'Tab') {
					/* DROPDOWN MENU
                        closeDropdownMenu(true);*/
					scope.onMenuPopupClose()
					scope.popupEventService.dispatchEvent(popupEvents.CLOSE_POPUP)
				}
			}

			scope.openSmartSearch = function ($event) {
				$event.preventDefault()
				$event.stopPropagation()

				/* DROPDOWN MENU
                    closeDropdownMenu();*/

				if (!scope.isDisabled) {
					var dialogParent = angular.element(document.body)

					if (scope.dialogParent) {
						var dialogParentElem = document.querySelector(scope.dialogParent)

						if (dialogParentElem) {
							dialogParent = dialogParentElem
						}
					}

					$mdDialog
						.show({
							controller: 'EntitySearchDialogController as vm',
							templateUrl: 'views/dialogs/entity-search-dialog-view.html',
							parent: dialogParent,
							targetEvent: $event,
							preserveScope: false,
							autoWrap: true,
							skipHide: true,
							multiple: true,
							clickOutsideToClose: false,
							locals: {
								data: {
									entityType: scope.entityType,
									selectedItem: scope.item,
								},
							},
						})
						.then(function (res) {
							if (res.status === 'agree') {
								stylePreset = ''
								//scope.item.value = res.data.item.id;
								scope.item = res.data.item[scope.itemProperty]

								if (scope.itemObject !== undefined) {
									scope.itemObject = res.data.item
								}

								itemName = res.data.item.short_name
								scope.inputText = res.data.item.short_name

								scope.error = ''
								scope.valueIsValid = true

								setTimeout(function () {
									if (scope.onChangeCallback) scope.onChangeCallback()

									scope.$apply()
								}, 0)
							}
						})
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

					getOptionsList()

					if (scope.onMenuOpen) {
						scope.onMenuOpen()
					}
				})

				inputElem.addEventListener('blur', function (event) {
					inputContainer.classList.remove('custom-input-focused')

					if (itemName) {
						scope.inputText = itemName
						scope.$apply()
					}
				})
			}

			var initScopeWatchers = function () {
				if (scope.eventSignal) {
					scope.$watch('eventSignal', function () {
						if (scope.eventSignal && scope.eventSignal.key) {
							switch (scope.eventSignal.key) {
								case 'mark_not_valid_fields':
									if (
										scope.smallOptions &&
										scope.smallOptions.notNull &&
										!scope.item
									) {
										scope.error = 'Field should not be null'
									}

									break

								case 'set_style_preset1':
									stylePreset = 1

									if (scope.item) {
										scope.error = ''
									}

									break

								case 'set_style_preset2':
									stylePreset = 2

									if (scope.item) {
										scope.error = ''
									}

									break
							}

							scope.eventSignal = {} // reset signal
						}
					})
				}

				scope.$watch('itemName', function () {
					if (scope.itemName) {
						scope.inputText = JSON.parse(JSON.stringify(scope.itemName))
					} else {
						itemName = ''
						scope.inputText = ''
					}
				})

				scope.$watch('entityType', function () {
					changeIconAndPlaceholder(scope.entityType)
				})
			}

			var changeIconAndPlaceholder = function (entityType) {
				// scope.iconData = entityIndicatorIcons[scope.entityType];

				var entitiesData = metaContentTypesService.getList()

				for (var i = 0; i < entitiesData.length; i++) {
					if (entitiesData[i].entity === entityType) {
						scope.placeholderText = entitiesData[i].name
						break
					}
				}
			}

			var init = function () {
				initEventListeners()

				changeIconAndPlaceholder(scope.entityType)

				if (scope.customStyles) {
					applyCustomStyles()
				}

				initScopeWatchers()
			}

			// Victor 08.10.2020
			scope.createEntity = function (_$popup, $event) {
				$event.stopPropagation() // The closeDDMenuOnClick handler should not be called if pressed Create button

				if (_$popup) _$popup.cancel()

				$mdDialog
					.show({
						controller: 'EntityViewerAddDialogController as vm',
						templateUrl:
							'views/entity-viewer/entity-viewer-add-dialog-view.html',
						parent: angular.element(document.body),
						targetEvent: $event,
						multiple: true,
						locals: {
							entityType: scope.entityType,
							entity: {},
							data: {},
						},
					})
					.then(function (res) {
						if (res && res.status === 'agree') {
							var item = res.data
							scope.selectOption(item)
						}
					})
			}

			scope.downloadEntity = function (_$popup, $event) {
				$event.stopPropagation()

				if (_$popup) _$popup.cancel()

				console.log('scope.downloadEntity')

				$mdDialog
					.show({
						controller: 'InstrumentDownloadDialogController as vm',
						templateUrl:
							'views/dialogs/instrument-download/instrument-download-dialog-view.html',
						targetEvent: $event,
						multiple: true,
						locals: {
							data: {},
						},
					})
					.then(function (res) {
						var item = res.data
						scope.selectOption(item)
					})
			}

			scope.menuOptionsPopupData = {
				entityType: scope.entityType,
				selectorOptions: [],

				selectOption: scope.selectOption,
				createEntity: scope.createEntity,
				downloadEntity: scope.downloadEntity,
			}

			scope.selectFirst = function ($event) {
				if ($event.which === 13) {
					scope.selectOption(scope.menuOptionsPopupData.selectorOptions[0])
				}
			}

			init()

			scope.$on('$destroy', function () {
				// window.removeEventListener('click', closeDDMenuOnClick);
				document.removeEventListener('keydown', onTabKeyPress)
			})
		},
	}
}
