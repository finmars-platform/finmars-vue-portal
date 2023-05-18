/**
 * Created by szhitenev on 30.05.2016.
 */

import metaService from '../services/metaService'
import layoutService from '../services/entity-data-constructor/layoutService'

export default function ($mdDialog) {
	return {
		restrict: 'E',
		scope: {
			tab: '=',
			row: '<',
			column: '<',
			tabFieldsTree: '=',
			palettesList: '=',
		},
		templateUrl: 'views/directives/layout-constructor-field-view.html',
		link: function (scope, elem, attr) {
			var entityDataConstructorVm = scope.$parent.vm
			var choices = metaService.getTypeCaptions()

			scope.item = {
				column: scope.column,
				row: scope.row,
				colspan: 1,
				editMode: false,
			}

			scope.colsInTotal = scope.tab.layout.columns

			scope.fieldUsesBackgroundColor = false
			scope.backgroundColor = {
				color: {},
			}

			scope.specialOptionTemplate = ''

			scope.fieldType = null
			scope.editMode = false
			scope.entityType = entityDataConstructorVm.entityType

			scope.attrs = entityDataConstructorVm.attrs || []
			scope.entityAttrs = entityDataConstructorVm.entityAttrs || []
			scope.userInputs = entityDataConstructorVm.userInputs || []

			scope.layoutAttrs = layoutService.getLayoutAttrs()

			scope.palettesObj = {
				palettesList: scope.palettesList,
			}

			var entityAttrsKeys = []
			scope.entityAttrs.forEach(function (entityAttr) {
				entityAttrsKeys.push(entityAttr.key)
			})

			var layoutAttrsKeys = []
			scope.layoutAttrs.forEach(function (layoutAttr) {
				layoutAttrsKeys.push(layoutAttr.key)
			})

			var tabs = entityDataConstructorVm.tabs

			function findItem() {
				scope.item = JSON.parse(
					JSON.stringify(scope.tabFieldsTree[scope.row][scope.column])
				)

				if (scope.item.backgroundColor) {
					scope.fieldUsesBackgroundColor = true
					scope.backgroundColor.color = scope.item.backgroundColor
				} else {
					scope.fieldUsesBackgroundColor = false
					scope.backgroundColor.color = {}
				}

				if (
					scope.item.attribute &&
					scope.item.attribute.value_type !== 'decoration'
				) {
					scope.item.editable = scope.item.editable !== false
					/*if () {
                            scope.item.editable = false;
                        } else {
                            scope.item.editable = true;
                        }*/
				}

				if (!scope.item.options) {
					scope.item.options = {}
				}

				findAttribute()
			}

			function findAttribute() {
				var attrFound = false

				var i, b, l, e, u
				for (i = 0; i < scope.attrs.length; i = i + 1) {
					if (scope.attrs[i].id && scope.item.id) {
						if (scope.attrs[i].id === scope.item.id) {
							scope.item.attribute = scope.attrs[i]
							attrFound = true
							break
						}
					}
				}

				if (!attrFound) {
					for (e = 0; e < scope.entityAttrs.length; e = e + 1) {
						if (scope.entityAttrs[e].key === scope.item.key) {
							scope.item.attribute = scope.entityAttrs[e]
							attrFound = true
							break
						}
					}
				}

				if (!attrFound) {
					for (u = 0; u < scope.userInputs.length; u = u + 1) {
						if (scope.userInputs[u].name === scope.item.name) {
							scope.item.attribute = scope.userInputs[u]
							attrFound = true
							break
						}
					}
				}

				if (!scope.item.attribute) {
					for (l = 0; l < scope.layoutAttrs.length; l = l + 1) {
						if (scope.layoutAttrs[l].name === scope.item.name) {
							scope.item.attribute = scope.layoutAttrs[l]
							break
						}
					}
				}
			}

			function setCardContainerMinHeight() {
				var draggableCardContainer = elem[0].querySelector(
					'.form-constructor-draggable-card'
				)

				if (draggableCardContainer) {
					var dccHeight = draggableCardContainer.clientHeight
					draggableCardContainer.style.minHeight = dccHeight + 'px'
				}
			}

			var saveColspanTimeOutId

			var saveColspanChanges = function (colspan) {
				if (saveColspanTimeOutId) {
					clearTimeout(saveColspanTimeOutId)
				}

				saveColspanTimeOutId = setTimeout(function () {
					for (var i = 0; i < scope.tab.layout.fields.length; i = i + 1) {
						if (
							scope.tab.layout.fields[i].row === scope.item.row &&
							scope.tab.layout.fields[i].column === scope.item.column
						) {
							scope.tab.layout.fields[i].colspan = JSON.parse(
								JSON.stringify(colspan)
							)
							saveColspanTimeOutId = null
							break
						}
					}
				}, 400)
			}

			scope.increaseColspan = function (item) {
				var colspansList = scope.getCols()
				var maxColspan = colspansList[colspansList.length - 1]

				if (item.colspan < maxColspan) {
					item.colspan += 1
					scope.changeFieldColspan(item.colspan)
					saveColspanChanges(item.colspan)
				}
			}

			scope.decreaseColspan = function (item) {
				if (item.colspan > 1) {
					item.colspan -= 1
					scope.changeFieldColspan(item.colspan)
					saveColspanChanges(item.colspan)
				}
			}

			scope.changeFieldColspan = function (colspan) {
				scope.tabFieldsTree[scope.row][scope.column].colspan = colspan
			}

			function addRow() {
				var c
				scope.tab.layout.rows = scope.tab.layout.rows + 1
				for (c = 0; c < scope.tab.layout.columns; c = c + 1) {
					scope.tab.layout.fields.push({
						row: scope.tab.layout.rows,
						column: c + 1,
						colspan: 1,
						type: 'empty',
					})
				}
			}

			scope.cancel = function () {
				var i
				var originalFieldSettings

				for (i = 0; i < scope.tab.layout.fields.length; i = i + 1) {
					if (
						scope.tab.layout.fields[i].row === scope.row &&
						scope.tab.layout.fields[i].column === scope.column
					) {
						scope.tab.layout.fields[i].editMode = false
						originalFieldSettings = JSON.parse(
							JSON.stringify(scope.tab.layout.fields[i])
						)
						break
					}
				}

				scope.item = originalFieldSettings
				scope.tabFieldsTree[scope.row][scope.column] = originalFieldSettings // needed to reset colspan
				scope.item.editMode = false

				if (scope.item.backgroundColor) {
					scope.fieldUsesBackgroundColor = true
					//scope.fieldBackgroundColor = scope.item.backgroundColor;
					scope.backgroundColor.color = scope.item.backgroundColor
				} else {
					scope.fieldUsesBackgroundColor = false
					//scope.fieldBackgroundColor = '#000000';
					scope.backgroundColor.color = {}
				}

				entityDataConstructorVm.updateDrakeContainers()
			}

			var toggleGeneralEditMode = function () {
				var i
				for (i = 0; i < scope.tab.layout.fields.length; i = i + 1) {
					scope.tab.layout.fields[i].editMode = false
				}

				scope.item.editMode = true
			}

			var openEditModeInDialog = function ($event) {
				$mdDialog
					.show({
						// controller: 'EvFormInstrumentAccrualsSettingsDialogController as vm',
						controller: 'EvFormInstrumentTableSettingsDialogController as vm',
						templateUrl:
							'views/dialogs/ev-form-instrument-table-settings-dialog-view.html',
						targetEvent: $event,
						multiple: true,
						locals: {
							data: {
								dialogLabel: editModeDialogLabel,
								label: scope.item.options.label,
								tableData: scope.item.options.tableData,
							},
						},
					})
					.then((res) => {
						if (res.status === 'agree') {
							scope.item.options.label = res.data.label
							scope.item.options.tableData = res.data.tableData

							scope.saveField()
						}
					})
			}

			scope.saveField = function () {
				// if attribute occupies whole row,
				var column = scope.item.column
				var colspan = scope.item.colspan

				if (scope.item.occupiesWholeRow) {
					column = 1 // move attribute to the start of row
					colspan = scope.tab.layout.columns
				}

				var i
				for (i = 0; i < scope.tab.layout.fields.length; i = i + 1) {
					if (
						scope.tab.layout.fields[i].row === scope.item.row &&
						scope.tab.layout.fields[i].column === column
					) {
						/* if (scope.item.attribute.frontOptions &&
								scope.item.attribute.frontOptions.attribute_class) {

								scope.tab.layout.fields[i].attribute_class = scope.item.attribute.frontOptions.attribute_class;

							} else if (layoutAttrsKeys.indexOf(scope.item.attribute.key) !== -1) {
								scope.tab.layout.fields[i].attribute_class = 'decorationAttr';

							} else if (entityAttrsKeys.indexOf(scope.item.attribute.key) !== -1) {
								scope.tab.layout.fields[i].attribute_class = 'entityAttr';

							} else if (scope.item.attribute.id) {

								scope.tab.layout.fields[i].attribute_class = 'attr';
								scope.tab.layout.fields[i].id = scope.item.attribute.id;

							} */
						scope.tab.layout.fields[i].attribute_class =
							entityDataConstructorVm.getAttributeClass(scope.item)

						if (scope.item.options) {
							scope.tab.layout.fields[i].options = JSON.parse(
								JSON.stringify(scope.item.options)
							)
						}

						var attributeData = JSON.parse(JSON.stringify(scope.item.attribute))
						delete attributeData.frontOptions // have to be after calling entityDataConstructorVm.getAttributeClass();

						scope.tab.layout.fields[i].name = scope.item.attribute.name
						scope.tab.layout.fields[i].type = scope.item.type
						scope.tab.layout.fields[i].colspan = colspan
						scope.tab.layout.fields[i].attribute = attributeData
						scope.tab.layout.fields[i].occupiesWholeRow =
							scope.item.occupiesWholeRow

						scope.tab.layout.fields[i].editable = scope.item.editable !== false
						scope.tab.layout.fields[i].required = scope.item.required

						scope.tab.layout.fields[i].backgroundColor = null

						if (scope.fieldUsesBackgroundColor) {
							scope.tab.layout.fields[i].backgroundColor =
								scope.backgroundColor.color
						}

						/* if (scope.item.hasOwnProperty("settings")) {

								var settings = scope.item.settings;

								if (settings && typeof settings === 'object') {
									settings = JSON.parse(angular.toJson(settings));
								}

								scope.tab.layout.fields[i].settings = settings;

							} */

						if (scope.tab.layout.fields[i].row === scope.tab.layout.rows) {
							addRow()
						}

						break
					}
				}

				// After moving whole row attribute to first column, empty socket where it was originally dropped
				if (scope.item.occupiesWholeRow && scope.item.column !== 1) {
					scope.item = {
						colspan: 1,
						column: scope.item.column,
						editMode: false,
						row: scope.item.row,
						type: 'empty',
					}
				}

				scope.item.editMode = false

				entityDataConstructorVm.createFieldsTree()
				entityDataConstructorVm.syncItems()
			}

			function findEmptyRows() {
				var i, r, columnsIsEmpty
				var emptyRows = []
				// checking all rows except first 4
				rowsLoop: for (r = scope.tab.layout.rows; r >= 5; r = r - 1) {
					columnsIsEmpty = true

					for (i = 0; i < scope.tab.layout.fields.length; i = i + 1) {
						if (scope.tab.layout.fields[i].row == r) {
							if (scope.tab.layout.fields[i].type !== 'empty') {
								columnsIsEmpty = false
								break rowsLoop
							}
						}
					}
					if (columnsIsEmpty) {
						emptyRows.push(r)
					}
				}

				if (emptyRows.length > 1) {
					deleteEmptyRows(emptyRows)
				}
			}

			function deleteEmptyRows(emptyRows) {
				var i, e

				for (i = scope.tab.layout.rows; i > 5; i = i - 1) {
					// Delete all empty rows except first 5

					for (e = 0; e < emptyRows.length - 1; e = e + 1) {
						// {emptyRows.length - 1} is needed to prevent deleting of last empty row

						var emptyRowOrderNumber = emptyRows[e]
						if (i === emptyRowOrderNumber) {
							var f
							for (f = 0; f < scope.tab.layout.fields.length; f = f + 1) {
								if (scope.tab.layout.fields[f].row == scope.tab.layout.rows) {
									scope.tab.layout.fields.splice(f, 1)
									f = f - 1
								}
							}

							scope.tab.layout.rows = scope.tab.layout.rows - 1
						}
					}
				}
			}

			scope.getCols = function () {
				var colsLeft = [1]
				var row = scope.tabFieldsTree[scope.row]
				var columnsInTotal = scope.tab.layout.columns

				var i
				var c = 1
				for (i = scope.column + 1; i <= columnsInTotal; i++) {
					if (row[i].type !== 'empty') {
						break
					} else {
						c = c + 1
						colsLeft.push(c)
					}
				}

				return colsLeft
			}

			/*scope.changeModel = function (item) {
                    scope.item.attribute = item;
                };*/
			var resetSocketData = function (field) {
				field.id = null
				field.key = null
				field.attribute = null
				field.attribute_class = null
				field.disabled = false
				field.colspan = 1
				field.name = ''
				field.type = 'empty'

				delete field.backgroundColor
				delete field.occupiesWholeRow
				delete field.options
			}

			scope.deleteField = function () {
				/* scope.item.id = null;
                    scope.item.key = null;
                    scope.item.attribute = null;
                    scope.item.attribute_class = null;
                    scope.item.disabled = false;
                    scope.item.options = null;
                    scope.item.editable = null;
                    scope.item.colspan = 1;
					delete scope.item.occupiesWholeRow; */
				resetSocketData(scope.item)

				/* var i;
                    for (i = 0; i < scope.tab.layout.fields.length; i = i + 1) {
                        if (scope.tab.layout.fields[i].row === scope.item.row) {
                            if (scope.tab.layout.fields[i].column === scope.item.column) {

                            	/!* scope.tab.layout.fields[i].id = null;
                                scope.tab.layout.fields[i].key = null;
                                scope.tab.layout.fields[i].attribute = null;
                                scope.tab.layout.fields[i].attribute_class = null;
                                scope.tab.layout.fields[i].disabled = false;
                                scope.tab.layout.fields[i].options = null;
                                scope.tab.layout.fields[i].colspan = 1;
                                scope.tab.layout.fields[i].name = '';
                                scope.tab.layout.fields[i].backgroundColor = null;
                                scope.tab.layout.fields[i].type = 'empty';
                                delete scope.tab.layout.fields[i].occupiesWholeRow; *!/

								resetSocketData(scope.tab.layout.fields[i]);
                                findEmptyRows();

                                break;

                            }
                        }
                    } */
				var itemFieldIndex = scope.tab.layout.fields.findIndex((field) => {
					return (
						field.row === scope.item.row && field.column === scope.item.column
					)
				})

				resetSocketData(scope.tab.layout.fields[itemFieldIndex])

				scope.fieldUsesBackgroundColor = false
				//scope.fieldBackgroundColor = '#000000';
				scope.backgroundColor.color = {}

				entityDataConstructorVm.createFieldsTree()
				entityDataConstructorVm.syncItems()
			}

			scope.findAttrsLeft = function () {
				/* scope.attrs.forEach(function (attr) {
                        attr.disabled = false;
                        tabs.forEach(function (tab) {
                            tab.layout.fields.forEach(function (item) {
                                if (item.type !== 'empty') {
                                    if (attr.user_code === item.attribute.user_code) {
                                        attr.disabled = true;
                                    }
                                }
                            })
                        })
                	}); */
				var isAttrDisabled = function (attr, keyProp) {
					var rowIsNotEmpty = !entityDataConstructorVm.isRowEmpty(
						scope.tab.tabOrder,
						scope.row,
						scope.tab.layout.columns
					)
					var attrOccupiesWholeRow = !!(
						attr.frontOptions && attr.frontOptions.occupiesWholeRow
					)

					if (rowIsNotEmpty && attrOccupiesWholeRow) {
						return true
					}

					loop: for (var tab of tabs) {
						for (var field of tab.layout.fields) {
							if (
								field.type !== 'empty' &&
								attr[keyProp] === field.attribute[keyProp]
							) {
								return true
							}
						}
					}

					return false
				}

				scope.attrs.forEach(function (attr) {
					attr.disabled = isAttrDisabled(attr, 'user_code')
				})

				/* scope.entityAttrs.forEach(function (entityAttr) {
                        entityAttr.disabled = false;
                        tabs.forEach(function (tab) {
                            tab.layout.fields.forEach(function (item) {
                                if (item.type !== 'empty') {
                                    if (entityAttr.key === item.attribute.key) {
                                        entityAttr.disabled = true;
                                    }
                                }
                            })
                        })
                    }); */

				scope.entityAttrs.forEach(function (entityAttr) {
					entityAttr.disabled = isAttrDisabled(entityAttr, 'key')
				})

				/* scope.userInputs.forEach(function (userInput) {
                        userInput.disabled = false;
                        tabs.forEach(function (tab) {
                            tab.layout.fields.forEach(function (item) {
                                if (item.type !== 'empty') {
                                    if (userInput.key === item.attribute.key) {
                                        userInput.disabled = true;
                                    }
                                }
                            })
                        })
                    }); */

				scope.userInputs.forEach(function (userInput) {
					userInput.disabled = isAttrDisabled(userInput, 'name')
				})
			}

			scope.onAttributeSelect = function () {
				scope.item.type =
					scope.item.attribute.value_type === 'table' ? 'table' : 'field'
				scope.item.occupiesWholeRow = false

				if (scope.item.type === 'table') {
					var defaultSettings = entityDataConstructorVm.getTableDefaultSettings(
						scope.item.attribute.key
					)

					if (defaultSettings) {
						scope.item.options = {
							...scope.item.options.options,
							...defaultSettings,
						}
					}
				}

				if (
					scope.item.attribute.frontOptions &&
					scope.item.attribute.frontOptions.occupiesWholeRow
				) {
					scope.item.occupiesWholeRow = true
				}
			}

			scope.bindAttrName = function (item) {
				if (item.attribute) {
					// when adding row between occupied rows, this method triggers for empty rows

					if (
						item.attribute.key === 'subgroup' &&
						item.attribute.name === 'Sub Group'
					) {
						return 'Group'
					} else {
						if (item.attribute.hasOwnProperty('verbose_name')) {
							return item.attribute.verbose_name
						}

						return item.attribute.name
					}
				}
			}

			scope.renameStrategySubgroup = function (item) {
				if (
					item.key === 'subgroup' &&
					item.value_content_type.indexOf('strategies.strategy') !== -1
				) {
					return 'Group'
				}

				return item.name
			}

			scope.bindTypeByValueType = function (valueType) {
				var i
				for (i = 0; i < choices.length; i = i + 1) {
					if (valueType === choices[i].value) {
						return choices[i]['caption_name']
					}
				}
			}

			scope.findSelected = function (fields, val) {
				if (fields && val) {
					if (fields.join(' ') === val.join(' ')) {
						return true
					}
				}

				return false
			}

			/* scope.copyFromValue = function (attr) {
                    if (attr.id) {
                        return JSON.stringify({id: attr.id});
                    }
                    return JSON.stringify({key: attr.key});
                }; */

			scope.findStringAttributes = function () {
				var b, a, e
				var stringAttrs = []

				for (a = 0; a < scope.attrs.length; a = a + 1) {
					if (scope.attrs[a]['value_type'] === 10) {
						stringAttrs.push(scope.attrs[a])
					}
				}

				for (e = 0; e < scope.entityAttrs.length; e = e + 1) {
					if (scope.entityAttrs[e]['value_type'] === 10) {
						stringAttrs.push(scope.entityAttrs[e])
					}
				}

				return stringAttrs
			}

			scope.checkForSpecialOptions = function () {
				if (scope.item.attribute) {
					if (scope.item.attribute.name === 'Notes') {
						scope.specialOptionTemplate = 'views/attribute-options/notes.html'
						return true
					}

					if (scope.item.attribute['value_type'] === 10) {
						scope.specialOptionTemplate = 'views/attribute-options/string.html'
						return true
					}

					if (
						scope.item.attribute['value_type'] === 20 ||
						scope.item.attribute['value_type'] === 'float'
					) {
						scope.specialOptionTemplate = 'views/attribute-options/number.html'
						return true
					}

					if (scope.item.attribute['value_type'] === 30) {
						scope.specialOptionTemplate =
							'views/attribute-options/classifier.html'
						return true
					}

					if (scope.item.attribute['value_type'] === 40) {
						scope.specialOptionTemplate = 'views/attribute-options/date.html'
						return true
					}

					if (
						scope.item.attribute['value_type'] === 'field' &&
						metaService
							.getRestrictedEntitiesWithTypeField()
							.indexOf(scope.item.attribute.key) === -1
					) {
						scope.specialOptionTemplate = 'views/attribute-options/field.html'
						return true
					}

					if (scope.item.attribute['value_type'] === 'decoration') {
						if (scope.item.attribute.key === 'layoutLineWithLabel') {
							scope.specialOptionTemplate =
								'views/attribute-options/labeled-line.html'
							return true
						}

						if (scope.item.attribute.key === 'layoutPlainText') {
							scope.specialOptionTemplate =
								'views/attribute-options/plain-text.html'
							return true
						}

						if (scope.item.attribute.key === 'layoutCalculatedText') {
							scope.specialOptionTemplate =
								'views/attribute-options/calculated-text.html'
							return true
						}
					}
				}

				return false
			}

			scope.hasBackgroundColorInput = function () {
				if (
					!scope.item.attribute ||
					scope.item.type === 'empty' ||
					scope.item.attribute.value_type === 'decoration'
				) {
					return false
				}

				return true
			}

			scope.toggleBackgroundColor = function () {
				scope.fieldUsesBackgroundColor = !scope.fieldUsesBackgroundColor

				if (scope.fieldUsesBackgroundColor) {
					if (
						!scope.backgroundColor ||
						!Object.keys(scope.backgroundColor.color).length
					) {
						scope.backgroundColor = {
							color: { colorOrder: 0, paletteUserCode: 'Default Palette' },
						}
					}
				}
			}

			/* scope.setFieldBackgroundColor = function (color) {
                    scope.fieldBackgroundColor = color;
                }; */

			scope.hasEditablesToggle = function () {
				if (
					(scope.entityType == 'transaction-type' ||
						scope.entityType == 'complex-transaction') &&
					scope.item.attribute &&
					scope.item.attribute.value_type !== 'decoration'
				) {
					return true
				}

				return false
			}

			scope.openNumberFormatSettings = function ($event) {
				$mdDialog
					.show({
						controller: 'NumberFormatSettingsDialogController as vm',
						templateUrl:
							'views/dialogs/number-format-settings-dialog-view.html',
						targetEvent: $event,
						multiple: true,
						locals: {
							data: {
								settings: scope.item.options.number_format,
							},
						},
					})
					.then(function (res) {
						if (res.status === 'agree') {
							scope.item.options.number_format = res.data
						}
					})
			}

			scope.onPalettesChange = function () {
				scope.palettesList = scope.palettesObj.palettesList
				entityDataConstructorVm.palettesList = scope.palettesList
			}

			var editModeDialogLabel

			scope.$watch('tabFieldsTree', function () {
				if (scope.tabFieldsTree) {
					findItem()

					if (scope.item.type === 'table') {
						scope.toggleEditMode = openEditModeInDialog

						switch (scope.item.attribute.key) {
							case 'event_schedules':
								editModeDialogLabel =
									'Instrument events schedules table settings'
								break
							case 'accrual_calculation_schedules':
								editModeDialogLabel =
									'Instrument accruals schedules table settings'
								break
							default:
								editModeDialogLabel = 'Table settings'
								break
						}
					} else {
						scope.toggleEditMode = toggleGeneralEditMode
					}

					setTimeout(function () {
						// set min height to prevent row disappearance on card drag
						setCardContainerMinHeight()
					}, 100)
				}
			})

			scope.$watch('palettesList', function () {
				scope.palettesObj.palettesList = scope.palettesList
			})
		},
	}
}
