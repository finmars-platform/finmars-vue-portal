/**
 * Created by mevstratov on 28.01.2020.
 */

import metaService from '../services/metaService'
import layoutService from '../services/entity-data-constructor/layoutService'

export default function ($mdDialog) {
	return {
		restrict: 'E',
		scope: {
			fixedArea: '=',
			fieldsTree: '=', // if it is fieldsTree with tabs transfer vm.fieldsTree[tab.tabOrder]
			tabs: '=',
			tabOrder: '@',
			field: '=',
		},
		templateUrl: 'views/directives/layout-constructor-field-view.html',
		link: function (scope, elem, attr) {
			var choices = metaService.getTypeCaptions()

			scope.item = {
				column: scope.column,
				row: scope.row,
				colspan: 1,
				editMode: false,
			}

			scope.fieldUsesBackgroundColor = false
			scope.fieldBackgroundColor = '#000000'

			scope.specialOptionTemplate = ''

			scope.fieldType = null
			scope.editMode = false
			scope.entityType = scope.$parent.vm.entityType

			scope.attrs = scope.$parent.vm.attrs || []
			scope.entityAttrs = scope.$parent.vm.entityAttrs || []
			scope.userInputs = scope.$parent.vm.userInputs || []

			scope.layoutAttrs = layoutService.getLayoutAttrs()

			var entityAttrsKeys = []
			scope.entityAttrs.forEach(function (entityAttr) {
				entityAttrsKeys.push(entityAttr.key)
			})
			var layoutAttrsKeys = []
			scope.layoutAttrs.forEach(function (layoutAttr) {
				layoutAttrsKeys.push(layoutAttr.key)
			})

			scope.$watch('fieldsTree', function () {
				if (scope.fieldsTree) {
					setFieldDefaultSettings()

					scope.row = scope.field.row
					scope.column = scope.field.column

					if (scope.tabOrder === 'fixedArea') {
						scope.rowsInTotal = scope.fixedArea.layout.rows
						scope.colsInTotal = scope.fixedArea.layout.columns
					} else {
						scope.rowsInTotal = scope.tabs[scope.tabOrder].layout.rows
						scope.colsInTotal = scope.tabs[scope.tabOrder].layout.columns
					}

					setTimeout(function () {
						// set min height to prevent row disappearance on card drag
						setCardContainerMinHeight()
					}, 100)
				}
			})

			function setFieldDefaultSettings() {
				scope.item = JSON.parse(angular.toJson(scope.field))

				if (scope.item.backgroundColor) {
					scope.fieldUsesBackgroundColor = true
					scope.fieldBackgroundColor = scope.item.backgroundColor
				} else {
					scope.fieldUsesBackgroundColor = false
					scope.fieldBackgroundColor = '#000000'
				}

				if (
					scope.item.attribute &&
					scope.item.attribute.value_type !== 'decoration'
				) {
					if (scope.item.editable === false) {
						scope.item.editable = false
					} else {
						scope.item.editable = true
					}
				}

				if (!scope.item.options) {
					scope.item.options = {}
				}

				findAttribute()
			}

			function findAttribute() {
				var attrFound = false

				var i, l, e, u

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
						if (scope.entityAttrs[e].name === scope.item.name) {
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
					/*for (var i = 0; i < scope.fixedArea.layout.fields.length; i = i + 1) {
                            if (scope.fixedArea.layout.fields[i].row === scope.item.row &&
                                scope.fixedArea.layout.fields[i].column === scope.item.column) {

                                scope.fixedArea.layout.fields[i].colspan = JSON.parse(JSON.stringify(colspan));
                                saveColspanTimeOutId = null;
                                break;

                            }
                        }*/

					// for fixed area
					scope.fieldsTree[scope.row][scope.column].colspan = JSON.parse(
						JSON.stringify(colspan)
					)
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
				scope.fieldsTree[scope.row][scope.column].colspan = colspan
			}

			function addRow() {
				scope.fixedArea.layout.rows = scope.fixedArea.layout.rows + 1
				var newRowNumber = scope.fixedArea.layout.rows
				scope.fieldsTree[newRowNumber] = {}

				var c
				for (c = 0; c < scope.fixedArea.layout.columns; c = c + 1) {
					scope.fixedArea.layout.fields.push({
						row: newRowNumber,
						column: c + 1,
						colspan: 1,
						type: 'empty',
					})

					scope.fieldsTree[newRowNumber][c] = {
						row: newRowNumber,
						column: c + 1,
						colspan: 1,
						type: 'empty',
					}
				}
			}

			scope.cancel = function () {
				var i
				var originalFieldSettings

				for (i = 0; i < scope.fixedArea.layout.fields.length; i = i + 1) {
					if (
						scope.fixedArea.layout.fields[i].row === scope.row &&
						scope.fixedArea.layout.fields[i].column === scope.column
					) {
						scope.fixedArea.layout.fields[i].editMode = false
						originalFieldSettings = JSON.parse(
							JSON.stringify(scope.fixedArea.layout.fields[i])
						)
						break
					}
				}

				scope.item = originalFieldSettings
				scope.fieldsTree[scope.row][scope.column] = originalFieldSettings // needed to reset colspan
				scope.item.editMode = false

				if (scope.item.backgroundColor) {
					scope.fieldUsesBackgroundColor = true
					scope.fieldBackgroundColor = scope.item.backgroundColor
				} else {
					scope.fieldUsesBackgroundColor = false
					scope.fieldBackgroundColor = '#000000'
				}

				scope.$parent.vm.updateDrakeContainers()
			}

			scope.toggleEditMode = function () {
				/*var i;
                    for (i = 0; i < scope.tab.layout.fields.length; i = i + 1) {
                        scope.tab.layout.fields[i].editMode = false;
                    }*/
				var i, c
				for (i = 1; i <= scope.rowsInTotal; i++) {
					for (c = 1; c <= scope.colsInTotal; c++) {
						scope.fieldsTree[i][c].editMode = false
					}
				}

				scope.field.editMode = true
				scope.item.editMode = true
			}

			scope.saveField = function () {
				var i
				for (i = 0; i < scope.fixedArea.layout.fields.length; i = i + 1) {
					if (
						scope.fixedArea.layout.fields[i].row === scope.item.row &&
						scope.fixedArea.layout.fields[i].column === scope.item.column
					) {
						if (layoutAttrsKeys.indexOf(scope.item.attribute.key) !== -1) {
							scope.fixedArea.layout.fields[i].attribute_class =
								'decorationAttr'
						} else if (
							entityAttrsKeys.indexOf(scope.item.attribute.key) !== -1
						) {
							scope.fixedArea.layout.fields[i].attribute_class = 'entityAttr'
						} else if (scope.item.attribute.id) {
							scope.fixedArea.layout.fields[i].attribute_class = 'attr'
							scope.fixedArea.layout.fields[i].id = scope.item.attribute.id
						} else {
							scope.fixedArea.layout.fields[i].attribute_class = 'userInput'
						}

						if (scope.item.options) {
							scope.fixedArea.layout.fields[i].options = scope.item.options
						}

						scope.fixedArea.layout.fields[i].name = scope.item.attribute.name
						scope.fixedArea.layout.fields[i].type = 'field'
						scope.fixedArea.layout.fields[i].colspan = scope.item.colspan
						scope.fixedArea.layout.fields[i].attribute = scope.item.attribute

						if (scope.item.editable !== false) {
							// its important
							scope.fixedArea.layout.fields[i].editable = true
						} else {
							scope.fixedArea.layout.fields[i].editable = false
						}

						if (scope.fieldUsesBackgroundColor) {
							scope.fixedArea.layout.fields[i].backgroundColor =
								scope.fieldBackgroundColor
						} else {
							scope.fixedArea.layout.fields[i].backgroundColor = null
						}

						if (
							scope.fixedArea.layout.fields[i].row ===
							scope.fixedArea.layout.rows
						) {
							addRow()
						}
					}
				}

				scope.item.editMode = false

				scope.$parent.vm.createFixedAreaFieldsTree()
				scope.$parent.vm.syncItems()
			}

			function findEmptyRows() {
				var i, r, columnsIsEmpty
				var emptyRows = []
				// checking all rows except first 4
				rowsLoop: for (r = scope.fixedArea.layout.rows; r >= 5; r = r - 1) {
					columnsIsEmpty = true

					for (i = 0; i < scope.fixedArea.layout.fields.length; i = i + 1) {
						if (scope.fixedArea.layout.fields[i].row == r) {
							if (scope.fixedArea.layout.fields[i].type === 'field') {
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

				for (i = scope.fixedArea.layout.rows; i > 5; i = i - 1) {
					// Delete all empty rows except first 5

					for (e = 0; e < emptyRows.length - 1; e = e + 1) {
						// {emptyRows.length - 1} is needed to prevent deleting of last empty row

						var emptyRowOrderNumber = emptyRows[e]
						if (i === emptyRowOrderNumber) {
							var f
							for (f = 0; f < scope.fixedArea.layout.fields.length; f = f + 1) {
								if (
									scope.fixedArea.layout.fields[f].row ==
									scope.fixedArea.layout.rows
								) {
									scope.fixedArea.layout.fields.splice(f, 1)
									f = f - 1
								}
							}

							scope.fixedArea.layout.rows = scope.fixedArea.layout.rows - 1
						}
					}
				}
			}

			scope.getCols = function () {
				var colsLeft = [1]
				var row = scope.fieldsTree[scope.row]

				var i
				var c = 1
				for (i = scope.column + 1; i <= scope.colsInTotal; i++) {
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

			scope.deleteField = function () {
				var i
				scope.item.id = null
				scope.item.key = null
				scope.item.attribute = null
				scope.item.attribute_class = null
				scope.item.disabled = false
				scope.item.options = null
				scope.item.editable = null
				scope.item.colspan = 1

				for (i = 0; i < scope.fixedArea.layout.fields.length; i = i + 1) {
					if (scope.fixedArea.layout.fields[i].row === scope.item.row) {
						if (scope.fixedArea.layout.fields[i].column === scope.item.column) {
							scope.fixedArea.layout.fields[i].id = null
							scope.fixedArea.layout.fields[i].key = null
							scope.fixedArea.layout.fields[i].attribute = null
							scope.fixedArea.layout.fields[i].attribute_class = null
							scope.fixedArea.layout.fields[i].disabled = false
							scope.fixedArea.layout.fields[i].colspan = 1
							scope.fixedArea.layout.fields[i].name = ''
							scope.fixedArea.layout.fields[i].backgroundColor = null
							scope.fixedArea.layout.fields[i].type = 'empty'
							findEmptyRows()
							break
						}
					}
				}

				scope.fieldUsesBackgroundColor = false
				scope.fieldBackgroundColor = '#000000'

				if (scope.tabOrder === 'fixedArea') {
					scope.$parent.vm.createFixedAreaFieldsTree()
				} else {
					scope.$parent.vm.createFieldsTree()
				}

				scope.$parent.vm.syncItems()
			}

			var isAttrDisabled = function (attr, attrType) {
				var i, f
				for (i = 0; i < scope.tabs.length; i++) {
					var tab = scope.tabs[i]

					for (f = 0; f < tab.layout.fields.length; f++) {
						var field = tab.layout.fields[f]

						if (field.type === 'field') {
							if (attrType === 'dynamicAttribute') {
								if (attr.user_code === field.attribute.user_code) {
									return true
								}
							} else {
								// for entity attrs and user inputs

								if (attr.key === field.attribute.key) {
									return true
								}
							}
						}
					}
				}

				if (scope.fixedArea.isActive) {
					var a
					for (a = 0; a < scope.fixedArea.layout.fields.length; a++) {
						var field = scope.fixedArea.layout.fields[a]

						if (field.type === 'field') {
							if (attrType === 'dynamicAttribute') {
								if (attr.user_code === field.attribute.user_code) {
									return true
								}
							} else {
								// for entity attrs and user inputs

								if (attr.key === field.attribute.key) {
									return true
								}
							}
						}
					}
				}

				return false
			}

			scope.findAttrsLeft = function () {
				scope.attrs.forEach(function (attr) {
					attr.disabled = isAttrDisabled(attr, 'dynamicAttribute')

					/*scope.tabs.forEach(function (tab) {
                            tab.layout.fields.forEach(function (item) {
                                if (item.type === 'field') {
                                    if (attr.id === item.id) {
                                        attr.disabled = true;
                                    }
                                }
                            })
                        })*/
				})

				scope.entityAttrs.forEach(function (entityAttr) {
					entityAttr.disabled = isAttrDisabled(entityAttr, 'entityAttribute')

					/*scope.tabs.forEach(function (tab) {
                            tab.layout.fields.forEach(function (item) {
                                if (item.type === 'field') {
                                    if (entityAttr.key === item.attribute.key) {
                                        entityAttr.disabled = true;
                                    }
                                }
                            })
                        })*/
				})

				scope.userInputs.forEach(function (userInput) {
					userInput.disabled = isAttrDisabled(userInput, 'userInput')

					/*scope.tabs.forEach(function (tab) {
                            tab.layout.fields.forEach(function (item) {
                                if (item.type === 'field') {
                                    if (userInput.key === item.attribute.key) {
                                        userInput.disabled = true;
                                        return false;
                                    }
                                }
                            })
                        })*/
				})
			}

			scope.bindAttrName = function (item) {
				if (item.hasOwnProperty('attribute')) {
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
				//console.log(fields, val);

				if (fields && val) {
					if (fields.join(' ') === val.join(' ')) {
						return true
					}
				}

				return false
			}

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
						scope.item.attribute['value_type'] === 'field' &&
						metaService
							.getRestrictedEntitiesWithTypeField()
							.indexOf(scope.item.attribute.key) === -1
					) {
						scope.specialOptionTemplate = 'views/attribute-options/field.html'
						return true
					}

					if (scope.item.attribute['value_type'] === 40) {
						scope.specialOptionTemplate = 'views/attribute-options/date.html'
						return true
					}

					if (
						scope.item.attribute['value_type'] === 20 ||
						scope.item.attribute['value_type'] === 'float'
					) {
						scope.specialOptionTemplate = 'views/attribute-options/number.html'
						return true
					}

					if (
						scope.item.attribute['value_type'] === 'decoration' &&
						scope.item.attribute.key === 'layoutLineWithLabel'
					) {
						scope.specialOptionTemplate =
							'views/attribute-options/labeled-line.html'
						return true
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
			}

			scope.setFieldBackgroundColor = function (color) {
				scope.fieldBackgroundColor = color
			}

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
							console.log('number format scope.item', scope.item)
						}
					})
			}
		},
	}
}
