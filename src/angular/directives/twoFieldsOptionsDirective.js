import ScrollHelper from '../helpers/scrollHelper'

var scrollHelper = new ScrollHelper()

export default function () {
	return {
		restrict: 'E',
		scope: {
			allOptions: '=',
			selectedOptions: '=',
			nameProperty: '@',
			classes: '=',
			orderOptions: '=', // object with properties: options, selectedOptions
			strictOrder: '=', // enable order change for selected items
			optionsCheckboxes: '=', // contains object with properties optionsCheckbox, selectedOptions
		},
		templateUrl: 'views/directives/two-fields-options-view.html',
		link: function (scope, elem, attr) {
			scope.selOptionsFilter = ''
			scope.initDnDEnabled = scope.strictOrder // if true scope.selOptionsDragAndDrop.init() will be called
			scope.optionsOrderSettings = scope.nameProperty
			scope.selOptionsOrderSettings = scope.nameProperty

			scope.availableOptionsCheckboxes = false
			scope.selOptionsCheckboxes = false

			if (scope.optionsCheckboxes) {
				scope.availableOptionsCheckboxes =
					scope.optionsCheckboxes.availableOptions
				scope.selOptionsCheckboxes = scope.optionsCheckboxes.selectedOptions
			}

			let dragIconGrabbed = false

			scope.highlightOption = function (ev) {
				var clickedOption = ev.currentTarget

				if ($(clickedOption).hasClass('active-option')) {
					$(clickedOption).removeClass('active-option')
				} else {
					$(clickedOption).addClass('active-option')
				}
			}

			let resetDnD = function () {
				if (scope.selOptionsDragAndDrop.initialized) {
					scope.selOptionsDragAndDrop.destroy()

					setTimeout(function () {
						scope.selOptionsDragAndDrop.init()
					}, 500)
				}
			}

			// switch options to selected
			scope.switchOptions = function (mode) {
				var optionsType = ''
				var removeFrom = []
				var addTo = []

				switch (mode) {
					case 'select':
						optionsType = '.two-fields-available-option'
						removeFrom = scope.allOptions
						addTo = scope.selectedOptions
						break
					case 'deselect':
						optionsType = '.two-fields-selected-option'
						removeFrom = scope.selectedOptions
						addTo = scope.allOptions
						break
					default:
						return false
				}

				// var fieldOptions = elem.find('.active-option' + optionsType);
				var fieldOptions = elem[0].querySelectorAll(
					optionsType + '.active-option'
				)

				if (fieldOptions && fieldOptions.length > 0) {
					for (var i = 0; i < fieldOptions.length; i++) {
						var hOption = fieldOptions[i]
						var hOptionId = hOption.dataset.optionId

						removeFrom.forEach(function (option, optionIndex) {
							option.isActive = false

							if (option.id == hOptionId) {
								addTo.push(option) // add options to selected
								removeFrom.splice(optionIndex, 1) //remove options from available
							}
						})
					}

					resetDnD()
				}
			}

			scope.switchOptionOnDoubleClick = function (mode, optionToSwitchId) {
				var removeFrom = []
				var addTo = []

				switch (mode) {
					case 'select':
						removeFrom = scope.allOptions
						addTo = scope.selectedOptions
						break
					case 'deselect':
						removeFrom = scope.selectedOptions
						addTo = scope.allOptions
						break
					default:
						return false
				}

				var i
				for (i = 0; i < removeFrom.length; i++) {
					var option = removeFrom[i]

					if (optionToSwitchId === option.id) {
						option.isActive = false

						addTo.push(option)
						removeFrom.splice(i, 1)
					}
				}

				resetDnD()
			}

			scope.selectAll = function () {
				scope.selectedOptions = scope.selectedOptions.concat(scope.allOptions)
				scope.selectedOptions.forEach(function (options) {
					options.isActive = false
				})

				scope.allOptions = []

				resetDnD()
			}

			scope.deselectAll = function () {
				scope.allOptions = scope.allOptions.concat(scope.selectedOptions)
				scope.allOptions.forEach(function (options) {
					options.isActive = false
				})

				scope.selectedOptions = []

				resetDnD()
			}

			let changeItemOrder = function (activeOption, changingOrder) {
				let activeOptionsId = activeOption.dataset.optionId

				for (let i = 0; i < scope.selectedOptions.length; i++) {
					if (scope.selectedOptions[i].id == activeOptionsId) {
						let moveFromItem = Object.assign({}, scope.selectedOptions[i])

						// !moveToItem.isActive check prevents active option from moving adjacent active options
						if (changingOrder === 'up') {
							// move up the order

							let moveToIndex = i - 1
							let moveToItem = scope.selectedOptions[moveToIndex]

							if (moveToIndex >= 0 && !moveToItem.isActive) {
								moveToItem = Object.assign({}, moveToItem)
								scope.selectedOptions[i] = moveToItem
								scope.selectedOptions[moveToIndex] = moveFromItem
							}
						} else {
							// move down the order

							let moveToIndex = i + 1
							let moveToItem = scope.selectedOptions[moveToIndex]

							if (moveToItem && !moveToItem.isActive) {
								moveToItem = Object.assign({}, moveToItem)
								scope.selectedOptions[i] = moveToItem
								scope.selectedOptions[moveToIndex] = moveFromItem
							}
						}

						break
					}
				}
			}

			scope.changeOrder = function (changingOrder) {
				let selOptionsElems = elem[0].querySelectorAll(
					'.two-fields-selected-option.active-option'
				)

				let i

				// if decreasing options index, start from the end of nodeList to make adjacent options change correctly
				if (changingOrder === 'up') {
					for (i = 0; i < selOptionsElems.length; i++) {
						changeItemOrder(selOptionsElems[i], changingOrder)
					}
				} else {
					for (i = selOptionsElems.length - 1; i >= 0; i--) {
						changeItemOrder(selOptionsElems[i], changingOrder)
					}
				}

				/* selOptionsElems.forEach(function (soElem) {

                        for (let i = 0; i < scope.selectedOptions.length; i++) {

                            if (scope.selectedOptions[i].id == soElem.id) {

                                let moveFromItem = Object.assign({}, scope.selectedOptions[i]);

                                if (changingOrder === 'up') {

                                    let moveToIndex = i + 1;

                                    if (scope.selectedOptions[moveToIndex]) {

                                        let moveToItem = Object.assign({}, scope.selectedOptions[moveToIndex]);

                                        scope.selectedOptions[i] = moveToItem
                                        scope.selectedOptions[moveToIndex] = moveFromItem

                                    }

                                    break;

                                } else {

                                    let moveToIndex = i - 1;

                                    if (moveToIndex >= 0) {

                                        let moveToItem = Object.assign({}, scope.selectedOptions[moveToIndex]);

                                        scope.selectedOptions[i] = moveToItem
                                        scope.selectedOptions[moveToIndex] = moveFromItem

                                    }

                                    break;

                                }

                            }

                        }

                    }); */
			}

			let turnOffDragging = function () {
				dragIconGrabbed = false
			}

			scope.turnOnDragging = function () {
				dragIconGrabbed = true
				document.body.addEventListener('mouseup', turnOffDragging, {
					once: true,
				})
			}

			scope.selOptionsDragAndDrop = {
				initialized: false,

				init: function () {
					this.dragulaInit()
					this.eventListeners()

					scope.initDnDEnabled = true
					this.initialized = true
				},

				eventListeners: function () {
					var drake = this.dragula

					drake.on('drag', function () {
						scrollHelper.enableDnDWheelScroll()
					})

					drake.on('drop', function (elem, target, source, nextSibling) {
						let selItemId = elem.dataset.optionId
						let siblingId = null

						if (nextSibling) {
							siblingId = nextSibling.dataset.optionId
						}

						let itemToInsert
						let selItemOrder
						for (
							selItemOrder = 0;
							selItemOrder < scope.selectedOptions.length;
							selItemOrder++
						) {
							if (scope.selectedOptions[selItemOrder].id == selItemId) {
								itemToInsert = Object.assign(
									{},
									scope.selectedOptions[selItemOrder]
								)
								break
							}
						}

						scope.selectedOptions.splice(selItemOrder, 1)

						if (siblingId) {
							// insert dragged item before next sibling
							for (let i = 0; i < scope.selectedOptions.length; i++) {
								if (scope.selectedOptions[i].id == siblingId) {
									scope.selectedOptions.splice(i, 0, itemToInsert)
									break
								}
							}
						} else {
							scope.selectedOptions.push(itemToInsert)
						}
					})

					drake.on('dragend', function (elem) {
						scrollHelper.disableDnDWheelScroll()
					})
				},

				dragulaInit: function () {
					let items = [elem[0].querySelector('.twoFieldsSelRowsContainer')]

					this.dragula = dragula(items, {
						moves: function () {
							// drag and drop works if filter is inactive
							if (dragIconGrabbed && !scope.selOptionsFilter) {
								return true
							}

							return false
						},
						revertOnSpill: true,
					})
				},

				destroy: function () {
					scope.initDnDEnabled = false
					this.initialized = false

					this.dragula.destroy()
				},
			}

			let init = function () {
				setTimeout(function () {
					var DnDScrollElem = elem[0].querySelector(
						'.twoFieldsSelRowsContainer'
					)
					scrollHelper.setDnDScrollElem(DnDScrollElem)
				}, 500)

				if (scope.orderOptions) {
					// disable order if it is specifically set so

					if (scope.orderOptions.options === false) {
						scope.optionsOrderSettings = null
					}

					if (scope.orderOptions.selectedOptions === false) {
						scope.selOptionsOrderSettings = null
					}
				}

				if (scope.strictOrder) {
					scope.selOptionsOrderSettings = null
				}

				scope.allOptions.forEach(function (allOption) {
					allOption.isActive = false
				})

				scope.selectedOptions.forEach(function (allOption) {
					allOption.isActive = false
				})
			}

			init()

			scope.$on('$destroy', function () {
				if (scope.selOptionsDragAndDrop.initialized) {
					scope.selOptionsDragAndDrop.destroy()
				}
			})
		},
	}
}
