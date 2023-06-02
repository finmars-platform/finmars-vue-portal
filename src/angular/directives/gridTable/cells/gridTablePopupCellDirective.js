import gtEvents from '@/angular/services/gridTableEvents'
;('use strict')

export default function ($compile, $mdDialog) {
	return {
		restrict: 'E',
		scope: {
			row: '=',
			column: '=',
			gtDataService: '=',
			gtEventService: '=',
			onLoadEnd: '&?',
		},
		template:
			'<div class="gt-cell-text-container">' +
			'<div class="gt-cell-text"><span data-ng-bind="column.settings.cellText"></span></div>' +
			'<div class="gt-cell-edit-btn" ng-if="!column.settings.isDisabled">' +
			'<span class="material-icons">edit</span>' +
			'</div>' +
			'</div>',
		link: function (scope, elem, attrs) {
			var cellMethods
			var bodyElem = document.querySelector('body')
			var cellTextContainer

			var popupBackdropElem = document.createElement('div')
			popupBackdropElem.classList.add('popup-area-backdrop')

			var popUpElem
			var popupContent
			var popupFooter =
				"<div class='popup-area-footer'>" +
				"<md-button class='m-l-0' data-ng-click='cancelPopupArea()'>Cancel</md-button>" +
				"<md-button class='m-r-0' data-ng-click='acceptPopupChanges()'>Agree</md-button>" +
				'</div>'

			//<editor-fold desc="Popup methods">
			var poupHtmlContentByCellType = {
				text:
					"<text-input label='{{column.columnName}}' " +
					"placeholder-text='{{column.columnName}}' " +
					"model='popupModel.value' " +
					'small-options=\'{dialogParent: ".dialog-containers-wrap"}\'>' +
					'</text-input>',

				number:
					"<number-input label='{{column.columnName}}' " +
					"model='popupModel.value' " +
					'small-options=\'{dialogParent: ".dialog-containers-wrap"}\'>' +
					'</number-input>',

				multitypeField:
					"<multitype-field field-types-data='fieldTypesData'></multitype-field>",
			}

			var getPopupHtmlContent = function () {
				var popupMain

				if (poupHtmlContentByCellType.hasOwnProperty(scope.column.cellType)) {
					popupMain = poupHtmlContentByCellType[scope.column.cellType]
				} else if (scope.column.cellType === 'customPopup') {
					if (scope.popupSettings.contentHtml.hasOwnProperty('main')) {
						popupMain = scope.popupSettings.contentHtml.main
					}
				}

				popupContent =
					"<div class='popup-area-container grid-table-popup'>" +
					"<div class='popup-area-main'>" +
					popupMain +
					'</div>' +
					popupFooter +
					'</div>'
			}

			var createPopup = function (posX, posY) {
				let popupClasses = ['popup-area']

				if (scope.popupSettings && scope.popupSettings.classes) {
					if (typeof scope.popupSettings.classes === 'string') {
						popupClasses = popupClasses.concat(
							scope.popupSettings.classes.split(' ')
						)
					} else {
						popupClasses = popupClasses.concat(scope.popupSettings.classes)
					}
				}

				popUpElem = document.createElement('div')
				popUpElem.classList.add(...popupClasses)

				popUpElem.innerHTML = popupContent

				$compile($(popUpElem))(scope)

				bodyElem.appendChild(popupBackdropElem)
				$(bodyElem).append($(popUpElem))

				scope.$apply()

				popUpElem.addEventListener('mouseenter', function (e) {
					e.stopPropagation()
				})

				setPopupPosition(posX, posY)

				document.addEventListener(
					'keyup',
					function (event) {
						if (event.key === 'Escape') closePopupArea()
					},
					{ once: true }
				)

				if (scope.column.settings.closeOnMouseOut) {
					popupBackdropElem.addEventListener('mouseenter', closePopupArea, {
						once: true,
					})
				}

				if (scope.column.settings.closeOnClick !== false) {
					popupBackdropElem.addEventListener('click', closePopupArea, {
						once: true,
					})
				}
			}

			var assignPopupValueToCell = function () {
				var popupValue = null

				if (scope.column.cellType === 'multitypeField') {
					scope.column.settings.fieldTypesData = scope.fieldTypesData

					var activeTypeData = scope.column.settings.fieldTypesData.find(
						(type) => type.isActive
					)
					popupValue = activeTypeData.model

					if (
						['dropdownSelect', 'entitySearch'].includes(
							activeTypeData.fieldType
						) &&
						popupValue
					) {
						var selectedOption = activeTypeData.fieldData.menuOptions.find(
							(option) => option.id === popupValue
						)
						scope.column.settings.cellText = selectedOption.name
					} else {
						scope.column.settings.cellText = popupValue
					}
					// for multiselector
					if (Array.isArray(popupValue))
						popupValue = JSON.parse(angular.toJson(popupValue))

					if (scope.column.hasOwnProperty('objPaths')) {
						// if we want capture multitype field value type outside of grid table

						scope.column.settings.value[0] = popupValue
						scope.column.settings.value[1] = activeTypeData.value_type
					} else {
						scope.column.settings.value = popupValue
					}
				} else {
					if (scope.popupModel.value || scope.popupModel.value === 0) {
						popupValue = scope.popupModel.value

						if (
							Array.isArray(scope.popupModel.value) ||
							typeof scope.popupModel.value === 'object'
						) {
							popupValue = JSON.parse(angular.toJson(scope.popupModel.value))
						}
					} else if (scope.column.cellType === 'text') {
						popupValue = ''
					}

					scope.column.settings.value = popupValue
					scope.column.settings.cellText = popupValue
				}
			}

			scope.acceptPopupChanges = function () {
				assignPopupValueToCell()

				var changedCellData = {
					row: {
						key: scope.row.key,
						order: scope.row.order,
					},
					column: {
						key: scope.column.key,
						order: scope.column.order,
					},
				}

				if (cellMethods && cellMethods.onChange) {
					cellMethods.onChange(
						changedCellData.row,
						changedCellData.column,
						scope.gtDataService,
						scope.gtEventService
					)
				}

				scope.gtEventService.dispatchEvent(
					gtEvents.CELL_VALUE_CHANGED,
					changedCellData
				)

				closePopupArea()
			}

			function closePopupArea() {
				bodyElem.removeChild(popupBackdropElem)
				bodyElem.removeChild(popUpElem)
			}

			scope.cancelPopupArea = function () {
				closePopupArea()

				if (scope.column.cellType === 'multitypeField') {
					scope.fieldTypesData = null
				} else {
					if (
						scope.column.settings.value &&
						typeof scope.column.settings.value === 'object'
					) {
						scope.popupModel.value = JSON.parse(
							JSON.stringify(scope.column.settings.value)
						)
					} else {
						scope.popupModel.value = scope.column.settings.value
					}
				}
			}

			var setPopupPosition = function (posX, posY) {
				// subtracting 50 to add space for mouse inside popup when it appears
				var positionX = posX - 50
				var positionY = posY - 50

				var popupHeight = popUpElem.clientHeight
				var popupWidth = popUpElem.clientWidth

				var windowHeight = document.body.clientHeight
				var windowWidth = document.body.clientWidth

				if (positionX + popupWidth > windowWidth) {
					popUpElem.style.right = '0'
				} else if (positionX < 20) {
					popUpElem.style.left = '0'
				} else {
					popUpElem.style.left = positionX + 'px'
				}

				if (positionY + popupHeight > windowHeight) {
					popUpElem.style.bottom = '0'
				} else if (positionY < 20) {
					popUpElem.style.top = '0'
				} else {
					popUpElem.style.top = positionY + 'px'
				}
			}
			//</editor-fold>

			//<editor-fold desc="Cell click functions">
			function onTextCellContainerClick(e) {
				var posX = e.pageX
				var posY = e.pageY

				if (scope.column.cellType === 'multitypeField') {
					// Sync cell.settings.value and active.model in case cell.settings.value was changed by script
					var activeType = scope.column.settings.fieldTypesData.find(
						(type) => type.isActive
					)
					if (!activeType)
						activeType = scope.column.settings.fieldTypesData.find(
							(type) => type.isDefault
						)

					if (activeType) {
						if (scope.column.hasOwnProperty('objPaths')) {
							activeType.model = scope.column.settings.value[0]
						} else {
							activeType.model = scope.column.settings.value
						}
					}
					// < Sync cell.settings.value and active.model in case cell.settings.value was changed by script >

					scope.fieldTypesData = JSON.parse(
						JSON.stringify(scope.column.settings.fieldTypesData)
					)
				} else {
					if (scope.column.settings.value) {
						if (
							scope.column.settings.value &&
							typeof scope.column.settings.value === 'object'
						) {
							scope.popupModel.value = JSON.parse(
								JSON.stringify(scope.column.settings.value)
							)
						} else {
							scope.popupModel.value = scope.column.settings.value
						}
					}
				}

				createPopup(posX, posY)
			}

			function onDateCellContainerClick() {
				pickmeup(cellTextContainer).show()
			}

			function onDateChange(e) {
				scope.column.settings.value = e.detail.formatted_date
				scope.column.settings.cellText = e.detail.formatted_date
				scope.$apply()

				var changedCellData = {
					row: {
						key: scope.row.key,
						order: scope.row.order,
					},
					column: {
						key: scope.column.key,
						order: scope.column.order,
					},
				}

				scope.gtEventService.dispatchEvent(
					gtEvents.CELL_VALUE_CHANGED,
					changedCellData
				)
			}

			function onExpressionCellClick(e) {
				$mdDialog
					.show({
						controller: 'ExpressionEditorDialogController as vm',
						templateUrl: 'views/dialogs/expression-editor-dialog-view.html',
						parent: angular.element(document.body),
						targetEvent: e,
						preserveScope: true,
						multiple: true,
						autoWrap: true,
						skipHide: true,
						locals: {
							item: { expression: scope.column.settings.value },
							data: scope.column.settings.exprData,
						},
					})
					.then(function (res) {
						if (res.status === 'agree') {
							scope.column.settings.cellText = res.data.item.expression
							scope.column.settings.value = res.data.item.expression

							var changedCellData = {
								row: {
									key: scope.row.key,
									order: scope.row.order,
								},
								column: {
									key: scope.column.key,
									order: scope.column.order,
								},
							}

							scope.gtEventService.dispatchEvent(
								gtEvents.CELL_VALUE_CHANGED,
								changedCellData
							)
						}
					})
			}
			//</editor-fold>

			var init = function () {
				scope.popupModel = {}
				scope.popupSettings = null

				cellMethods = scope.column.methods
				cellTextContainer = elem[0].querySelector('.gt-cell-text-container')

				if (!scope.column.settings.hasOwnProperty('cellText')) {
					if (scope.column.cellType === 'multitypeField') {
						const activeType = scope.column.settings.fieldTypesData.find(
							(type) => type.isActive
						)

						if (
							['textInput', 'numberInput', 'dateInput'].includes(
								activeType.fieldType
							)
						) {
							if (scope.column.hasOwnProperty('objPaths')) {
								// if column.settings.value === [value, value_type]
								scope.column.settings.cellText = scope.column.settings.value[0]
							} else {
								scope.column.settings.cellText = scope.column.settings.value
							}
						}
					} else {
						scope.column.settings.cellText = scope.column.settings.value
					}
				}

				if (scope.onLoadEnd) {
					scope.onLoadEnd()
				}

				/*if (scope.column.settings && scope.column.settings.value) {
                        scope.cellValue = scope.column.settings.value;
                    }*/

				if (!scope.column.settings.isDisabled) {
					// add handlers if column is enabled

					switch (scope.column.cellType) {
						case 'customPopup':
							scope.popupSettings = scope.column.settings.popupSettings

							if (scope.popupSettings.contentHtml.hasOwnProperty('footer')) {
								popupFooter = scope.popupSettings.contentHtml.footer
							}

							if (scope.popupSettings.popupData) {
								scope.popupData = scope.popupSettings.popupData
							}

						case 'text':
						case 'number':
						case 'multitypeField':
							getPopupHtmlContent()

							// Using named function to prevent duplicate listeners on repeated init() call
							cellTextContainer.addEventListener(
								'click',
								onTextCellContainerClick,
								false
							)

							break

						case 'date':
							// Using named function to prevent duplicate listeners on repeated init() call
							cellTextContainer.addEventListener(
								'click',
								onDateCellContainerClick
							)

							var dataVal = scope.column.settings.value

							if (dataVal) {
								pickmeup(cellTextContainer, {
									date: new Date(dataVal),
									current: new Date(dataVal),
									position: 'right',
									hide_on_select: true,
									format: 'Y-m-d',
								})
							} else {
								pickmeup(cellTextContainer, {
									position: 'right',
									hide_on_select: true,
									format: 'Y-m-d',
								})
							}

							cellTextContainer.addEventListener(
								'pickmeup-change',
								onDateChange
							)

							break

						case 'expression':
							cellTextContainer.addEventListener('click', onExpressionCellClick)

							break
					}
				}
			}

			init()

			scope.gtEventService.addEventListener(gtEvents.REDRAW_TABLE, function () {
				var row = scope.gtDataService.getRowByKey(scope.row.key)

				if (row)
					var cell = row.columns.find((col) => col.key === scope.column.key)

				if (row && cell) {
					scope.row = row
					scope.column = cell

					init()
				}
				/*
					If cellText calculated by cellMethods.onChange. Calculate cellText outside grid table.
					 */
			})
		},
	}
}
