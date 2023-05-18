import importInstrumentCbondsService from '../../services/import/importInstrumentCbondsService'
import instrumentDatabaseSearchService from '../../services/instrument/instrumentDatabaseSearchService'

export default function (
	$mdDialog,
	toastNotificationService,
	instrumentService
) {
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
			sorted: '=',
			onChangeCallback: '&?',
			itemName: '=',
			itemObject: '=',
		},
		templateUrl: 'views/directives/customInputs/instrument-select-view.html',
		link: function (scope, elem, attr) {
			scope.error = ''
			scope.inputValue = ''
			//scope.placeholderText = 'Relation';
			scope.dropdownMenuShown = false
			scope.dropdownMenuFilter = ''
			scope.processing = false

			scope.localInstrumentsTotal = 0
			scope.databaseInstrumentsTotal = 0
			scope.hoverInstrument = null

			scope.inputText = ''

			if (scope.itemName) {
				// itemName and inputText needed for resetting selected option name
				scope.inputText = JSON.parse(JSON.stringify(scope.itemName))
			}

			/* TIPS
                scope.smallOptions probable properties
                    tooltipText: custom tolltip text
                    indicatorBtnIcon: sets icon for indicator button
                    dialogParent: 'string' - querySelector content for element to insert mdDialog into */

			if (scope.smallOptions) {
				scope.tooltipText = scope.smallOptions.tooltipText

				/* if (scope.smallOptions.indicatorBtnIcon) {
                        var indicatorBtnIcon = scope.smallOptions.indicatorBtnIcon;
                    } */

				scope.dialogParent = scope.smallOptions.dialogParent
			}

			var stylePreset

			var inputContainer = elem[0].querySelector(
				'.instrumentSelectInputContainer'
			)
			var inputElem = elem[0].querySelector('.instrumentSelectInputElem')

			/*var entityIndicatorIcons = {
                    'type1': {
                        type: 'class',
                        icon: 'fas fa-align-justify'
                    }
                }*/

			scope.clearHoverInstrument = function () {
				setTimeout(function () {
					scope.hoverInstrument = null
					console.log('scope.hoverInstrument', scope.hoverInstrument)

					scope.$apply()
				}, 0)
			}

			scope.setHoverInstrument = function ($event, option) {
				scope.dropdownMenuShown = true

				setTimeout(function () {
					scope.hoverInstrument = option

					scope.hoverInstrument.available_for_update = true

					if (scope.hoverInstrument.id) {
						if (
							scope.hoverInstrument.instrument_type_object.user_code ===
								'bonds' ||
							scope.hoverInstrument.instrument_type_object.user_code ===
								'stocks'
						) {
							let regexp = /^([A-Z]{2})([A-Z0-9]{9})([0-9]{1})/g

							let result = scope.hoverInstrument.user_code.match(regexp)

							if (!result) {
								scope.hoverInstrument.available_for_update = false
							}
						} else {
							scope.hoverInstrument.available_for_update = false
						}
					} else {
						// instrument that is not yet downloaded
						scope.hoverInstrument.available_for_update = false
					}

					console.log('scope.hoverInstrument', scope.hoverInstrument)

					scope.$apply()
				}, 100)
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

			scope.callFnForCustomBtn = function (actionData) {
				if (actionData.parameters) {
					actionData.callback(actionData.parameters)
				} else {
					actionData.callback()
				}
			}

			scope.selectLocalInstrument = function (item) {
				console.log('selectLocalInstrument.item', item)

				closeDropdownMenu()

				// Local instrument, just put ID

				if (item.id !== scope.model) {
					stylePreset = ''
					scope.error = ''

					scope.model = item.id
					scope.itemObject = item
					scope.valueIsValid = true

					scope.itemName = item.name
					scope.inputText = item.name

					setTimeout(function () {
						if (scope.onChangeCallback) scope.onChangeCallback()

						scope.$apply()
					}, 0)
				}
			}

			scope.selectDatabaseInstrument = function (item) {
				console.log('selectDatabaseInstrument.item', item)

				closeDropdownMenu()

				// Download here?

				stylePreset = ''
				scope.error = ''

				var config = {
					instrument_code: item.referenceId,
					instrument_name: item.issueName,
					instrument_type_code: item.instrumentType,
					mode: 1,
				}

				scope.itemName = item.issueName
				scope.inputText = item.issueName

				scope.processing = true
				scope.isDisabled = true

				importInstrumentCbondsService
					.download(config)
					.then(function (data) {
						console.log('data', data)

						scope.isDisabled = false
						scope.processing = false

						if (data.errors && data.errors.length) {
							toastNotificationService.error(data.errors[0])

							scope.model = null

							scope.itemName = ''
							scope.inputText = ''

							setTimeout(function () {
								if (scope.onChangeCallback) scope.onChangeCallback()

								scope.$apply()
							}, 100)
						} else {
							stylePreset = ''
							scope.error = ''

							scope.model = data.result_id
							scope.itemObject = {
								id: data.result_id,
								name: data.instrument_name,
								user_code: data.instrument_code,
							}

							scope.itemName = data.instrument_name
							scope.inputText = data.instrument_name

							scope.valueIsValid = true

							scope.$apply()

							// scope.getList();

							setTimeout(function () {
								if (scope.onChangeCallback) {
									scope.onChangeCallback()

									scope.$apply()
								}
							}, 1)
						}
					})
					.catch(function (e) {
						console.log('selectDatabaseInstrument.error ', e)

						scope.processing = false
						scope.isDisabled = false

						scope.model = null

						scope.itemName = ''
						scope.inputText = ''

						scope.$apply()
					})
			}

			scope.onInputTextChange = function () {
				// scope.dropdownMenuFilter = scope.inputText;

				if (!scope.dropdownMenuShown) {
					onCustomInputFocus()
				}

				scope.getList()
			}

			scope.onInputFocus = function () {
				inputElem.focus()
				scope.getList()
			}

			var closeDropdownMenu = function (updateScope) {
				inputContainer.classList.remove('custom-input-focused')

				if (scope.itemName)
					scope.inputText = JSON.parse(JSON.stringify(scope.itemName))

				scope.dropdownMenuShown = false

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
				// TODO fix ALT + TAB closes
				// var pressedKey = event.key;
				// console.log('pressedKey', pressedKey)
				//
				// if (pressedKey === "Tab") {
				//     closeDropdownMenu(true);
				// }
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

			scope.updateLocalInstrument = function (item) {
				var config = {
					instrument_code: item.user_code,
					mode: 1,
				}

				scope.isUpdatingInstrument = true

				importInstrumentCbondsService.download(config).then(function (data) {
					scope.isUpdatingInstrument = false

					scope.$apply()

					if (data.errors.length) {
						toastNotificationService.error(data.errors[0])
					} else {
						toastNotificationService.success(
							'Instrument ' + item.user_code + ' was updated'
						)
					}
				})
			}

			scope.openSelectorDialog = function ($event) {
				closeDropdownMenu()
				// Victor 2020.11.09 If body is parent, then modal window under popup
				// var dialogParent = angular.element(document.body);
				var dialogParent = document.querySelector('.dialog-containers-wrap')

				if (scope.dialogParent) {
					var dialogParentElem = document.querySelector(scope.dialogParent)

					if (dialogParentElem) {
						dialogParent = dialogParentElem
					}
				}

				$mdDialog
					.show({
						controller: 'InstrumentSelectDatabaseDialogController as vm',
						templateUrl:
							'views/dialogs/instrument-select-database-dialog-view.html',
						targetEvent: $event,
						parent: dialogParent,
						multiple: true,
						locals: {
							data: {
								inputText: scope.inputText,
							},
						},
					})
					.then(function (res) {
						if (res.status === 'agree') {
							scope.model = res.data.item.id
							scope.itemObject = res.data.item

							scope.itemName = res.data.item.name
							scope.inputText = res.data.item.name

							setTimeout(function () {
								if (scope.onChangeCallback) scope.onChangeCallback()

								scope.$apply()
							}, 0)
						}
					})
			}

			var initScopeWatchers = function () {
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

				scope.$watch('itemName', function () {
					console.log('scope.model', scope.model)

					if (scope.itemName) {
						// itemName = scope.itemName;
						scope.inputText = scope.itemName

						// scope.selectedItem = {id: scope.model, name: scope.itemName, user_code: scope.itemName}
					} else {
						// itemName = '';
						scope.inputText = ''
					}
				})
			}

			var onCustomInputFocus = function () {
				// scope.inputText = "";
				inputContainer.classList.add('custom-input-focused')

				scope.dropdownMenuShown = true

				window.addEventListener('click', closeDDMenuOnClick)
				document.addEventListener('keydown', onTabKeyPress)

				scope.$apply()
			}

			var initEventListeners = function () {
				elem[0].addEventListener('mouseover', function () {
					inputContainer.classList.add('custom-input-hovered')
				})

				elem[0].addEventListener('mouseleave', function () {
					inputContainer.classList.remove('custom-input-hovered')
				})

				inputElem.addEventListener('focus', onCustomInputFocus, false)

				/* inputElem.addEventListener('blur', function (event) {

                        inputContainer.classList.remove('custom-input-focused');

                        if (scope.itemName) {

                        	scope.inputText = JSON.parse(JSON.stringify(scope.itemName));
                            scope.$apply();

                        }

                    }); */
			}

			scope.getHighlighted = function (value) {
				var inputTextPieces = scope.inputText.split(' ')

				var resultValue

				// Regular expression for multiple highlighting case insensitive results
				var reg = new RegExp(
					'(?![^<]+>)(' + inputTextPieces.join('|') + ')',
					'ig'
				)

				resultValue = value.replace(reg, '<span class="highlight">$1</span>')

				return resultValue
			}

			scope.selectFirst = function ($event) {
				if ($event.which === 13) {
					if (scope.localInstruments.length) {
						scope.selectLocalInstrument(scope.localInstruments[0])
					} else {
						if (scope.databaseInstruments.length) {
							scope.selectDatabaseInstrument(scope.databaseInstruments[0])
						}
					}
				}
			}

			scope.getList = function () {
				scope.processing = true

				var promises = []

				if (scope.inputText.length > 2) {
					promises.push(
						new Promise(function (resolve, reject) {
							instrumentDatabaseSearchService
								.getList(scope.inputText)
								.then(function (data) {
									scope.databaseInstrumentsTotal = data.resultCount

									scope.databaseInstruments = data.foundItems

									scope.databaseInstruments = scope.databaseInstruments.map(
										function (item) {
											item.pretty_date = moment(item.last_cbnnds_update).format(
												'DD.MM.YYYY'
											)

											return item
										}
									)

									resolve()
								})
								.catch(function (error) {
									console.log('Instrument Database error occurred', error)

									scope.databaseInstruments = []

									resolve()
								})
						})
					)
				}

				promises.push(
					new Promise(function (resolve, reject) {
						instrumentService
							.getListForSelect({
								pageSize: 500,
								filters: {
									query: scope.inputText,
								},
							})
							.then(function (data) {
								scope.localInstrumentsTotal = data.count

								scope.localInstruments = data.results

								scope.localInstruments = scope.localInstruments.map(function (
									item
								) {
									item.pretty_date = moment(item.modified).format('DD.MM.YYYY')

									return item
								})

								resolve()
							})
					})
				)

				Promise.all(promises).then(function (data) {
					scope.databaseInstruments = scope.databaseInstruments.filter(
						function (databaseInstrument) {
							var exist = false

							scope.localInstruments.forEach(function (localInstrument) {
								if (
									localInstrument.user_code === databaseInstrument.referenceId
								) {
									exist = true
								}

								if (
									localInstrument.reference_for_pricing ===
									databaseInstrument.referenceId
								) {
									exist = true
								}
							})

							return !exist
						}
					)

					scope.processing = false

					scope.$apply()

					setTimeout(function () {
						$('.instrument-select-options-group-title').on(
							'click',
							function () {
								$(this)
									.next()[0]
									.scrollIntoView({ block: 'start', behavior: 'smooth' })
							}
						)
					}, 100)
				})
			}

			var init = function () {
				scope.databaseInstruments = []
				scope.localInstruments = []

				initScopeWatchers()
				initEventListeners()

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
