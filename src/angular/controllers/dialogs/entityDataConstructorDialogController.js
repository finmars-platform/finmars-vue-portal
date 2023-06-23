/**
 * Created by szhitenev on 30.05.2016.
 */

import entityResolverService from '../../services/entityResolverService'
import metaService from '../../services/metaService'

import gridHelperService from '../../services/gridHelperService'
import ScrollHelper from '../../helpers/scrollHelper'
import layoutService from '../../services/entity-data-constructor/layoutService'

import transactionTypeService from '../../services/transactionTypeService'
import colorPalettesService from '../../services/colorPalettesService'

import metaHelper from '../../helpers/meta.helper'

var scrollHelper = new ScrollHelper()

export default function (
	$scope,
	$stateParams,
	$state,
	$mdDialog,
	toastNotificationService,
	metaContentTypesService,
	attributeTypeService,
	uiService,
	entityDataConstructorService,
	data
) {
	var vm = this

	vm.boxColumns = [1, 2, 3, 4, 5, 6]
	vm.readyStatus = { constructor: false }
	vm.formLayoutIsNew = false

	vm.attrs = []
	vm.entityAttrs = []
	vm.userInputs = []

	vm.items = []

	vm.tabs = []
	vm.fieldsTree = {}
	vm.fixedArea = null

	vm.entityType = data.entityType
	vm.targetContentType = metaContentTypesService.findContentTypeByEntity(
		vm.entityType,
		'ui'
	)

	vm.instanceId = data.hasOwnProperty('instanceId') ? data.instanceId : null
	vm.layoutId = data.layoutId ? data.layoutId : null
	vm.layoutUserCode = ''

	var fullRowUserInputsList = entityDataConstructorService.fullRowUserInputsList
	var dialogParent = document.querySelector('.dialog-containers-wrap')

	vm.fromEntityType = undefined
	if (data.hasOwnProperty('fromEntityType')) {
		vm.fromEntityType = data.fromEntityType
	}

	var hideManageAttributesButton = false
	if (data.hasOwnProperty('hideManageAttributesButton')) {
		hideManageAttributesButton = data.hideManageAttributesButton
	}

	var choices = metaService.getTypeCaptions()

	var fixTab = function (tab, numberOfRows, numberOfCols, fieldsList) {
		var i, c
		for (i = 1; i <= numberOfRows; i++) {
			var row = tab[i]

			for (c = 1; c <= numberOfCols; c++) {
				if (!row[c]) {
					var missingSocket = {
						colspan: 1,
						column: c,
						editMode: false,
						row: i,
						type: 'empty',
					}

					fieldsList.push(missingSocket)
				}
			}
		}
	}

	var fixTabs = function () {
		vm.createFieldsTree()

		if (Object.keys(vm.fieldsTree).length) {
			Object.keys(vm.fieldsTree).forEach(function (tabNumber, tabIndex) {
				var tab = vm.fieldsTree[tabIndex]
				var numberOfRows = vm.tabs[tabIndex].layout.rows
				var numberOfCols = vm.tabs[tabIndex].layout.columns

				fixTab(tab, numberOfRows, numberOfCols, vm.tabs[tabIndex].layout.fields)
			})
		}

		if (vm.fixedArea.isActive) {
			vm.createFixedAreaFieldsTree()

			if (Object.keys(vm.fixedAreaFieldsTree).length) {
				var numberOfRows = vm.fixedArea.layout.rows
				var numberOfCols = vm.fixedArea.layout.columns

				fixTab(
					vm.fixedAreaFieldsTree,
					numberOfRows,
					numberOfCols,
					vm.fixedArea.layout.fields
				)
			}
		}
	}

	/*
        weirdo stuff
        we took edit layout by instance id instead of entity content_type
        but it can be taken from different entity
        e.g. transaction -> transaction-type.book_transaction_layout
        */

	var setDataConstructorLayout = function () {
		if (Array.isArray(vm.ui.data)) {
			vm.tabs = vm.ui.data || []
		} else {
			vm.tabs = vm.ui.data.tabs || []
			vm.fixedArea = vm.ui.data.fixedArea
		}

		vm.tabs.forEach(function (tab, index) {
			tab.tabOrder = index

			tab.layout.fields.forEach(function (field) {
				field.editMode = false
			})
		})

		if (!vm.fixedArea) {
			vm.fixedArea = {
				isActive: false,
				layout: {
					rows: 0,
					columns: 1,
					fields: [],
				},
			}
		}

		fixTabs()

		addRowsForTabs()
	}

	vm.getLayout = function () {
		return new Promise((resolve, reject) => {
			var resolveLayout = function () {
				setDataConstructorLayout()

				vm.layoutUserCode = vm.ui.user_code

				resolve({ tabs: vm.tabs, fixedArea: vm.fixedArea })
			}

			if (vm.formLayoutIsNew) {
				// There is no layout yet, so create one

				vm.ui = {
					data: {},
				}

				resolveLayout()
			} else {
				// for complex transaction edit layout stored inside transaction type object
				if (vm.entityType === 'complex-transaction') {
					if (vm.instanceId || vm.instanceId === 0) {
						transactionTypeService
							.getByKey(vm.instanceId)
							.then((data) => {
								if (data.book_transaction_layout) {
									vm.ui = data.book_transaction_layout
								} else {
									vm.formLayoutIsNew = true

									vm.ui = {
										data: {},
									}
									// vm.ui = uiService.getDefaultEditLayout(vm.entityType)[0];
								}

								resolveLayout()
							})
							.catch((error) => reject(error))
					}
				} else {
					if (vm.layoutId || vm.layoutId === 0) {
						uiService
							.getEditLayoutByKey(vm.layoutId)
							.then((data) => {
								vm.ui = data
								resolveLayout()
							})
							.catch((error) => reject(error))
					} else {
						// if no edit layout id was specified, get default edit layout

						uiService
							.getDefaultEditLayout(vm.entityType)
							.then((data) => {
								if (data.results.length) {
									vm.ui = data.results[0]
								} else {
									// There is no layout yet, so create one
									vm.formLayoutIsNew = true
									vm.ui = {
										data: {},
									}
								}

								resolveLayout()
							})
							.catch((error) => reject(error))
					}
				}
			}
		})
	}

	/* CODE FOR FIXED AREA INSIDE INPUT FORM EDITOR

			vm.toggleFixedArea = function () {
				vm.fixedArea.isActive = !vm.fixedArea.isActive;

				if (vm.fixedArea.isActive) {
					addRows(vm.fixedArea);

					vm.createFixedAreaFieldsTree();
					vm.updateDrakeContainers();

				} else {

					vm.fixedArea.layout = {
						rows: 0,
						columns: 1,
						fields: []
					};

					vm.updateDrakeContainers();
					vm.syncItems();

				}
			};

			< CODE FOR FIXED AREA INSIDE INPUT FORM EDITOR >
        */

	vm.openTabsEditor = function ($event) {
		var tabs = JSON.parse(angular.toJson(vm.tabs))

		$mdDialog
			.show({
				controller: 'TabsEditorDialogController as vm',
				templateUrl: 'views/dialogs/tabs-editor-dialog-view.html',
				parent: dialogParent,
				multiple: true,
				targetEvent: $event,
				locals: {
					tabs: tabs,
					data: {
						trackByProp: 'name',
					},
				},
			})
			.then(function (res) {
				if (res.status === 'agree') {
					vm.tabs = []
					vm.tabs = res.data.tabs

					vm.tabs.forEach(function (tab, index) {
						tab.tabOrder = index
					})

					vm.createFieldsTree()
					vm.updateDrakeContainers()
				}
			})
	}

	vm.onLayoutUserCodeChange = function () {
		/*vm.formLayoutIsNew = false;
            if (vm.layoutUserCode !== vm.ui.user_code) vm.formLayoutIsNew = true;*/
	}

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.checkColspan = function (tab, row, column) {
		if (tab === 'fixedArea') {
			var fieldRow = vm.fixedAreaFieldsTree[row]
		} else {
			var fieldTab = vm.fieldsTree[tab.tabOrder]
			var fieldRow = fieldTab[row]
		}

		var colspanSizeToHide = 2

		for (var i = column - 1; i > 0; i--) {
			// check if previous columns have enough colspan to cover current one

			if (fieldRow[i] && parseInt(fieldRow[i].colspan) >= colspanSizeToHide) {
				return false
			}

			colspanSizeToHide = colspanSizeToHide + 1
		}

		return true
	}

	vm.range = gridHelperService.range

	function addRowsForTabs() {
		var i
		for (i = 0; i < vm.tabs.length; i = i + 1) {
			addRows(vm.tabs[i])
		}

		if (vm.fixedArea.isActive) {
			addRows(vm.fixedArea)
		}
	}

	function addRows(tab) {
		// calculating how much rows needs creating in addition to first five
		var rowsToAdd = 5 - tab.layout.rows
		if (rowsToAdd <= 0) {
			// if rows already 5 or more, functions should add 1 empty row
			rowsToAdd = 1
		}

		var r, c
		var field = {}
		for (r = 0; r < rowsToAdd; r = r + 1) {
			tab.layout.rows = tab.layout.rows + 1

			for (c = 0; c < tab.layout.columns; c = c + 1) {
				field = {
					row: tab.layout.rows,
					column: c + 1,
					colspan: 1,
					type: 'empty',
				}

				tab.layout.fields.push(field)
			}
		}
	}

	function removeLastRow(tab) {
		var f
		for (f = 0; f < tab.layout.fields.length; f = f + 1) {
			if (tab.layout.fields[f].row === tab.layout.rows) {
				tab.layout.fields.splice(f, 1)
				f = f - 1
			}
		}

		tab.layout.rows = tab.layout.rows - 1
	}

	vm.setLayoutColumns = function (tab, columns, ev) {
		if (columns < tab.layout.columns) {
			var willBeLostColumns = []
			var i
			for (i = columns; i < tab.layout.columns; i = i + 1) {
				willBeLostColumns.push(i + 1)
			}

			var description
			if (willBeLostColumns.length > 1) {
				description =
					'If you switch to less number of columns you lose data of ' +
					willBeLostColumns.join(', ') +
					' columns'
			} else {
				description =
					'If you switch to less number of columns you lose data of ' +
					willBeLostColumns.join(', ') +
					' column'
			}

			$mdDialog
				.show({
					controller: 'WarningDialogController as vm',
					templateUrl: 'views/dialogs/warning-dialog-view.html',
					parent: dialogParent,
					targetEvent: ev,
					clickOutsideToClose: false,
					locals: {
						warning: {
							title: 'Warning',
							description: description,
						},
					},
					preserveScope: true,
					autoWrap: true,
					skipHide: true,
					multiple: true,
				})
				.then(function (res) {
					if (res.status === 'agree') {
						/* var i, r, c;
                        for (i = 0; i < tab.layout.fields.length; i = i + 1) {
                            for (r = 0; r < tab.layout.rows; r = r + 1) {
                                for (c = columns; c < tab.layout.columns; c = c + 1) {
                                    if (tab.layout.fields[i].row == r + 1 && tab.layout.fields[i].column == c + 1) {
                                        tab.layout.fields.splice(i, 1);
                                    }
                                }
                            }
                        } */

						tab.layout.fields = tab.layout.fields.filter((field) => {
							if (field.colspan > columns || field.occupiesWholeRow)
								field.colspan = columns
							return field.column <= columns
						})

						tab.layout.columns = columns

						if (tab.isActive) {
							// is fixed area
							vm.createFixedAreaFieldsTree()
						} else {
							vm.createFieldsTree()
						}

						vm.syncItems()
						vm.updateDrakeContainers()
					}
				})
		} else {
			var r, c

			for (r = 1; r <= tab.layout.rows; r = r + 1) {
				for (c = tab.layout.columns + 1; c <= columns; c = c + 1) {
					tab.layout.fields.push({
						row: r,
						column: c,
						colspan: 1,
						type: 'empty',
					})
				}
			}

			tab.layout.fields.forEach((field) => {
				if (field.occupiesWholeRow) field.colspan = columns
			})

			tab.layout.columns = columns

			if (tab.isActive) {
				// is fixed area
				vm.createFixedAreaFieldsTree()
			} else {
				vm.createFieldsTree()
			}

			vm.updateDrakeContainers()
		}
	}

	vm.insertRow = function (tab, row) {
		var rwoToAddNumber = row + 1

		var r
		for (r = 0; r < tab.layout.fields.length; r++) {
			// increase counts of rows that follows new one by 1

			if (tab.layout.fields[r].row > row) {
				tab.layout.fields[r].row = tab.layout.fields[r].row + 1
			}
		}

		tab.layout.rows = tab.layout.rows + 1

		var field = {}

		var c
		for (c = 0; c < tab.layout.columns; c = c + 1) {
			field = {
				row: rwoToAddNumber,
				column: c + 1,
				colspan: 1,
				type: 'empty',
			}
			tab.layout.fields.push(field)
		}

		if (tab.isActive) {
			vm.createFixedAreaFieldsTree()
		} else {
			vm.createFieldsTree()
		}

		vm.updateDrakeContainers()
	}

	vm.isFARowEmtpty = function (rowNumber) {
		var isEmpty = true

		for (var i = 1; i <= vm.fixedArea.layout.columns; i++) {
			var socket = vm.fixedAreaFieldsTree[rowNumber][i]

			if (socket && socket.type !== 'empty') {
				isEmpty = false
				break
			}
		}

		return isEmpty
	}

	vm.isRowEmpty = function (tabOrder, rowNumber, colsTotalNumber) {
		var isEmpty = true

		if (tabOrder === 'fixedArea') {
			var tabLayout = vm.fixedAreaFieldsTree[rowNumber]
		} else {
			var tabLayout = vm.fieldsTree[tabOrder][rowNumber]
		}

		for (var i = 1; i <= colsTotalNumber; i++) {
			var socket = tabLayout[i]

			if (socket && socket.type !== 'empty') {
				isEmpty = false
				break
			}
		}

		return isEmpty
	}

	vm.deleteRow = function (tab, row) {
		tab.layout.fields = tab.layout.fields.filter(function (field) {
			if (field.row > row) {
				field.row = field.row - 1
			} else if (field.row === row) {
				return false
			}

			return true
		})

		tab.layout.rows = tab.layout.rows - 1

		if (tab.isActive) {
			vm.createFixedAreaFieldsTree()
		} else {
			vm.createFieldsTree()
		}

		vm.updateDrakeContainers()
	}

	vm.saveLayout = function () {
		vm.processing = true

		var notSavedTabExist = false
		for (var i = 0; i < vm.tabs.length; i = i + 1) {
			if (vm.tabs[i].hasOwnProperty('editState') && vm.tabs[i].editState) {
				notSavedTabExist = true
				break
			}
		}

		if (!notSavedTabExist) {
			for (var i = 0; i < vm.tabs.length; i = i + 1) {
				removeLastRow(vm.tabs[i])
			}

			/* CODE FOR FIXED AREA INSIDE INPUT FORM EDITOR
					if (vm.fixedArea.isActive) {
						removeLastRow(vm.fixedArea);
					}
				< CODE FOR FIXED AREA INSIDE INPUT FORM EDITOR >
                */

			vm.ui.data = {
				tabs: [],
				fixedArea: {},
			}

			if (vm.tabs) {
				vm.ui.data.tabs = JSON.parse(angular.toJson(vm.tabs))
			}

			vm.ui.data.fixedArea = JSON.parse(JSON.stringify(vm.fixedArea))

			var onSavingEnd = function (responseData) {
				vm.processing = false
				$scope.$apply() // update scope in case of error from backend

				var layoutId = vm.formLayoutIsNew ? responseData.id : vm.ui.id

				$mdDialog.hide({
					status: 'agree',
					data: {
						id: layoutId,
						user_code: vm.ui.user_code,
						name: vm.ui.name,
						is_default: vm.ui.is_default,
					},
				})
			}

			if (vm.entityType === 'complex-transaction') {
				if (vm.instanceId || vm.instanceId === 0) {
					transactionTypeService
						.patch(vm.instanceId, { book_transaction_layout: vm.ui })
						.then(onSavingEnd)
				} else {
					toastNotificationService.error('Id of transaction type not found')
				}
			} else {
				if (vm.formLayoutIsNew) {
					uiService.createEditLayout(vm.entityType, vm.ui).then(onSavingEnd)
				} else {
					uiService.updateEditLayout(vm.ui.id, vm.ui).then(onSavingEnd)
				}
			}
		} else {
			vm.processing = false

			$mdDialog.show({
				controller: 'WarningDialogController as vm',
				templateUrl: 'views/dialogs/warning-dialog-view.html',
				parent: dialogParent,
				clickOutsideToClose: false,
				multiple: true,
				locals: {
					warning: {
						title: 'Warning',
						description:
							'There is tab that is not saved. Please, save or delete it before saving input form configuration.',
					},
				},
			})
		}
	}

	vm.bindFlex = function (tab, row, column) {
		var totalColspans = 0
		var i
		var field

		if (tab === 'fixedArea') {
			for (i = 0; i < vm.fixedAreaFieldsTree[row].length; i++) {
				var colFromRow = vm.fixedAreaFieldsTree[row][i]
				totalColspans = totalColspans + parseInt(colFromRow.colspan, 10)
			}

			field = vm.fixedAreaFieldsTree[row][column]

			var flexUnit = 100 / vm.fixedArea.layout.columns
		} else {
			// TODO this line get throw
			// Error: [$interpolate:interr] Can't interpolate: {{vm.bindFlex(tab, row, column)}}
			// vm.fieldsTree[tab.tabOrder] have not property [row]
			for (i = 0; i < vm.fieldsTree[tab.tabOrder][row].length; i++) {
				var colFromRow = vm.fieldsTree[tab.tabOrder][row][i]
				totalColspans = totalColspans + parseInt(colFromRow.colspan, 10)
			}

			field = vm.fieldsTree[tab.tabOrder][row][column]

			var flexUnit = 100 / tab.layout.columns
		}

		if (field) {
			if (field.occupiesWholeRow) {
				return 100
			}

			return Math.floor(field.colspan * flexUnit)
		}

		return Math.floor(flexUnit)
	}

	vm.deleteTab = function (tab) {
		var i
		for (i = 0; i < vm.tabs.length; i = i + 1) {
			if (tab.name === vm.tabs[i].name) {
				vm.tabs.splice(i, 1)
				break
			}
		}

		vm.createFieldsTree()
		vm.syncItems()
	}

	vm.addTab = function () {
		if (!vm.tabs) {
			vm.tabs = []
		}

		if (vm.tabs.length > 0) {
			var notSavedTabExist = false

			var i
			for (i = 0; i < vm.tabs.length; i = i + 1) {
				if (vm.tabs[i].hasOwnProperty('editState') && vm.tabs[i].editState) {
					notSavedTabExist = true
					break
				}
			}

			if (!notSavedTabExist) {
				vm.tabs.push({
					name: '',
					editState: true,
					tabOrder: vm.tabs.length,
					layout: {
						rows: 0,
						columns: 1,
						fields: [],
					},
				})

				addRows(vm.tabs[vm.tabs.length - 1])

				vm.createFieldsTree()
				vm.updateDrakeContainers()
			} else {
				$mdDialog.show({
					controller: 'WarningDialogController as vm',
					templateUrl: 'views/dialogs/warning-dialog-view.html',
					parent: dialogParent,
					clickOutsideToClose: false,
					multiple: true,
					locals: {
						warning: {
							title: 'Warning',
							description:
								'There is tab that is not saved. Please, save or delete it before creating new one.',
						},
					},
				})
			}
		} else {
			vm.tabs.push({
				name: '',
				editState: true,
				tabOrder: vm.tabs.length,
				layout: {
					rows: 0,
					columns: 1,
					fields: [],
				},
			})

			addRows(vm.tabs[0])

			vm.createFieldsTree()
			vm.updateDrakeContainers()
		}

		setTimeout(function () {
			allowSpacesInTabName()
		}, 100)
	}

	var tabNameInput = null

	var removeKeydownListener = function () {
		document.removeEventListener('keydown', addSpaceIntoTabName)
	}

	var addSpaceIntoTabName = function (kDownEv) {
		if (kDownEv.key === ' ') {
			var tabNewName = metaHelper.insertSpaceIntoElementText(tabNameInput)

			for (var i = 0; i < vm.tabs.length; i++) {
				if (vm.tabs[i].name === tabNewName) {
					vm.tabs[i].captionName = tabNewName
					break
				}
			}
		}
	}

	var allowSpacesInTabName = function () {
		tabNameInput = document.querySelector('input.tabNameInput')

		tabNameInput.addEventListener('focus', function () {
			document.addEventListener('keydown', addSpaceIntoTabName)
			tabNameInput.addEventListener('blur', removeKeydownListener, {
				once: true,
			})
		})
	}

	vm.toggleEditTab = function (tab, action, $index) {
		if (!tab.editState) {
			tab.editState = false
		}

		if (!tab.captionName) {
			tab.captionName = tab.name
		}

		if (action === 'back') {
			if (!tab.captionName && tab.name === '') {
				vm.tabs.splice($index, 1)
			} else {
				tab.captionName = tab.name
			}
		}

		tab.editState = !tab.editState

		if (tab.editState) {
			setTimeout(function () {
				allowSpacesInTabName()
			}, 100)
		}
	}

	vm.saveEditedTab = function (tab) {
		var tabIsReadyToSave = true

		if (tab.captionName && tab.captionName !== '') {
			vm.tabs.forEach(function (singleTab) {
				if (tab.captionName.toLowerCase() === singleTab.name.toLowerCase()) {
					tabIsReadyToSave = false
				}
			})

			if (tabIsReadyToSave) {
				tab.name = tab.captionName
				tab.editState = !tab.editState
			}
		} else {
			tabIsReadyToSave = false
		}

		if (!tabIsReadyToSave) {
			$mdDialog.show({
				controller: 'WarningDialogController as vm',
				templateUrl: 'views/dialogs/warning-dialog-view.html',
				// targetEvent: $event,
				parent: dialogParent,
				autoWrap: true,
				skipHide: true,
				multiple: true,
				locals: {
					warning: {
						title: 'Warning!',
						description: 'Name of the tab must make a unique character set.',
					},
				},
			})
		}
	}

	vm.attributesAvailable = function (entityType) {
		if (
			!metaService.checkRestrictedEntityTypesForAM(entityType) ||
			hideManageAttributesButton
		) {
			return false
		}

		return true
	}

	vm.manageAttrs = function ($event) {
		/*var entityAddress = {entityType: vm.entityType};
            if (vm.fromEntityType) {
                entityAddress = {entityType: vm.fromEntityType, from: vm.fromEntityType, instanceId: vm.instanceId};
            }
            $state.go('app.portal.attributesManager', entityAddress);*/
		$mdDialog
			.show({
				controller: 'AttributesManagerDialogController as vm',
				templateUrl: 'views/dialogs/attributes-manager-dialog-view.html',
				targetEvent: $event,
				parent: dialogParent,
				multiple: true,
				preserveScope: false,
				locals: {
					data: {
						entityType: vm.entityType,
					},
				},
			})
			.then(function (res) {
				if (res.status === 'agree') {
					attributeTypeService
						.getList(vm.entityType, {
							pageSize: 1000,
							filters: {
								kind: 1,
							},
						})
						.then(function (data) {
							vm.readyStatus.constructor = false

							vm.attrs = data.results

							emptySocketsWithoutAttrFromLayout()

							vm.createFieldsTree()

							vm.readyStatus.constructor = true

							vm.updateDrakeContainers()
							vm.syncItems()

							$scope.$apply()
						})
				}
			})
	}

	vm.editLayout = function () {
		var entityAddress = { entityType: vm.entityType }
		if (vm.fromEntityType) {
			var entityType = vm.entityType
			if (vm.fromEntityType === 'transaction-type') {
				entityType = 'complex-transaction'
			}
			entityAddress = {
				entityType: entityType,
				from: vm.fromEntityType,
				instanceId: vm.instanceId,
			}
		}
		$state.go('app.portal.data-constructor', entityAddress)
	}

	var emptyTabSocketsWithoutAttrs = function (tab) {
		var i, u
		tab.layout.fields.forEach(function (field, fieldIndex) {
			if (field && field.type !== 'empty') {
				var attrFound = false

				if (field.attribute_class === 'attr') {
					for (i = 0; i < vm.attrs.length; i = i + 1) {
						if (field.key) {
							if (field.key === vm.attrs[i].user_code) {
								attrFound = true
								break
							}
						} else {
							if (field.attribute.user_code) {
								if (field.attribute.user_code === vm.attrs[i].user_code) {
									attrFound = true
									break
								}
							}
						}
					}

					if (!attrFound) {
						var fieldCol = field.column
						var fieldRow = field.row

						tab.layout.fields[fieldIndex] = {
							colspan: 1,
							column: fieldCol,
							editMode: false,
							row: fieldRow,
							type: 'empty',
						}
					}
				} else if (field.attribute_class === 'userInput') {
					for (u = 0; u < vm.userInputs.length; u = u + 1) {
						if (field.name === vm.userInputs[u].name) {
							attrFound = true
							break
						}
					}

					if (!attrFound) {
						var fieldCol = field.column
						var fieldRow = field.row

						tab.layout.fields[fieldIndex] = {
							colspan: 1,
							column: fieldCol,
							editMode: false,
							row: fieldRow,
							type: 'empty',
						}
					}
				}
			}
		})
	}

	var emptySocketsWithoutAttrFromLayout = function () {
		vm.tabs.forEach(function (tab) {
			emptyTabSocketsWithoutAttrs(tab)
		})

		if (vm.fixedArea.isActive) {
			emptyTabSocketsWithoutAttrs(vm.fixedArea)
		}
	}

	var fixTabSockets = function (tab) {
		tab.layout.fields.forEach(function (field, fieldIndex) {
			if (field.type === 'table') {
				var rowsKeys = field.options.tableData.map(function (row) {
					return row.key
				})

				var defaultTableSettings = vm.getTableDefaultSettings(
					field.attribute.key
				)
				defaultTableSettings.tableData.forEach(function (row, index) {
					if (rowsKeys.indexOf(row.key) < 0) {
						row.to_show = false
						field.options.tableData.splice(index, 0, row)
					}
				})
			}
		})

		return tab
	}

	var fixSocketsInsideLayout = function () {
		vm.tabs.forEach(function (tab, index) {
			vm.tabs[index] = fixTabSockets(tab)
		})

		if (vm.fixedArea.isActive) {
			vm.fixedArea = fixTabSockets(vm.fixedArea)
		}
	}

	/**
	 * Get items for sockets of form's layout
	 *
	 * @returns {Promise<undefined>}
	 */
	vm.getItems = function () {
		return new Promise((resolve, reject) => {
			var promises = []

			var attrsProm = new Promise((res, rej) => {
				attributeTypeService
					.getList(vm.entityType, {
						pageSize: 1000,
						filters: {
							kind: 1,
						},
					})
					.then(function (data) {
						vm.attrs = data.results
						/* if (vm.instanceId && vm.entityType === 'complex-transaction') {

                            entityResolverService.getByKey('transaction-type', vm.instanceId).then(function (data) {

                                var inputs = data.inputs;

                                inputs.forEach(function (input) {

                                    var input_value_type = input.value_type;

                                    if (input.value_type === 100) {
                                        input_value_type = 'field';
                                    }

                                    var contentType;

                                    if (input.content_type && input.content_type !== undefined) {

                                        contentType = input.content_type.split('.')[1];

                                        if (contentType === 'eventclass') {
                                            contentType = 'event_class';
                                        }

                                        if (contentType === 'notificationclass') {
                                            contentType = 'notification_class';
                                        }

                                        if (contentType === 'accrualcalculationmodel') {
                                            contentType = 'accrual_calculation_model';
                                        }

                                        if (contentType === 'pricingpolicy') {
                                            contentType = 'pricing_policy';
                                        }

                                    } else {
                                        contentType = input.name.split(' ').join('_').toLowerCase();
                                    }

                                    var userInputObj = {
                                        key: contentType,
                                        name: input.name,
                                        reference_table: input.reference_table,
                                        verbose_name: input.verbose_name,
                                        content_type: input.content_type,
                                        value_type: input_value_type,
                                        frontOptions: {
                                            attribute_class: 'userInput',
                                            occupiesWholeRow: fullRowUserInputsList.includes(contentType)
                                        }
                                    }

                                    vm.userInputs.push(userInputObj);

                                });

                                emptySocketsWithoutAttrFromLayout();

                                vm.syncItems();

                                vm.readyStatus.constructor = true;

                                resolve();

                            }).catch(() => reject('error on getting complex transaction'));

                        }

                        else {

                            emptySocketsWithoutAttrFromLayout();

                            vm.syncItems();

                            vm.readyStatus.constructor = true;

                            resolve();

                        } */
						res()
					})
					.catch((error) => rej('error on getting dynamic attributes'))
			})

			promises.push(attrsProm)

			if (vm.instanceId && vm.entityType === 'complex-transaction') {
				var transactionInputsProm = new Promise((res, rej) => {
					entityResolverService
						.getByKey('transaction-type', vm.instanceId)
						.then(function (data) {
							var inputs = data.inputs

							inputs.forEach(function (input) {
								var input_value_type = input.value_type

								if (input.value_type === 100) {
									input_value_type = 'field'
								}

								/* var contentType;

                                if (input.content_type && input.content_type !== undefined) {

                                    contentType = input.content_type.split('.')[1];

                                    if (contentType === 'eventclass') {
                                        contentType = 'event_class';
                                    }

                                    if (contentType === 'notificationclass') {
                                        contentType = 'notification_class';
                                    }

                                    if (contentType === 'accrualcalculationmodel') {
                                        contentType = 'accrual_calculation_model';
                                    }

                                    if (contentType === 'pricingpolicy') {
                                        contentType = 'pricing_policy';
                                    }

                                } else {
                                    contentType = input.name.split(' ').join('_').toLowerCase();
                                } */

								var userInputObj = {
									// key: contentType,
									name: input.name,
									reference_table: input.reference_table,
									verbose_name: input.verbose_name,
									content_type: input.content_type,
									value_type: input_value_type,
									frontOptions: {
										attribute_class: 'userInput',
										// occupiesWholeRow: fullRowUserInputsList.includes(contentType)
										occupiesWholeRow: fullRowUserInputsList.includes(
											input.name
										),
									},
								}

								vm.userInputs.push(userInputObj)
							})

							res()
						})
						.catch((error) =>
							rej({
								custom_message: 'error on getting complex transaction',
								error: error,
							})
						)
				})

				promises.push(transactionInputsProm)
			}

			//region Get entity attrs
			var entityAttrs = metaService.getEntityAttrs(vm.entityType)
			var doNotShowAttrs = []

			switch (vm.entityType) {
				case 'complex-transaction':
				case 'transaction-type':
					doNotShowAttrs = [
						'transaction_type',
						'code',
						'date',
						'status',
						'text',
						'user_text_1',
						'user_text_2',
						'user_text_3',
						'user_text_4',
						'user_text_5',
						'user_text_6',
						'user_text_7',
						'user_text_8',
						'user_text_9',
						'user_text_10',
						'user_text_1',
						'user_text_11',
						'user_text_12',
						'user_text_13',
						'user_text_14',
						'user_text_15',
						'user_text_16',
						'user_text_17',
						'user_text_18',
						'user_text_19',
						'user_text_20',
						'user_text_21',
						'user_text_22',
						'user_text_23',
						'user_text_24',
						'user_text_25',
						'user_text_26',
						'user_text_27',
						'user_text_28',
						'user_text_29',
						'user_text_30',

						'user_number_1',
						'user_number_2',
						'user_number_3',
						'user_number_4',
						'user_number_5',
						'user_number_6',
						'user_number_7',
						'user_number_8',
						'user_number_9',
						'user_number_10',
						'user_number_11',
						'user_number_12',
						'user_number_13',
						'user_number_14',
						'user_number_15',
						'user_number_16',
						'user_number_17',
						'user_number_18',
						'user_number_19',
						'user_number_20',
						'user_date_1',
						'user_date_2',
						'user_date_3',
						'user_date_4',
						'user_date_5',
					]

					break

				case 'strategy-1':
				case 'strategy-2':
				case 'strategy-3':
				case 'responsible':
				case 'counterparty':
					doNotShowAttrs = ['group', 'subgroup']
					break

				/* case 'instrument':

                        doNotShowAttrs = ['accrued_currency', 'payment_size_detail',
                            'accrued_multiplier', 'default_accrued',
                            'pricing_currency', 'price_multiplier',
                            'default_price', 'daily_pricing_model',
                            'price_download_scheme', 'reference_for_pricing',
                            'maturity_date', 'maturity_price'];

                        break; */

				default:
					vm.entityAttrs = entityAttrs
					break
			}

			var keysOfFixedFieldsAttrs =
				metaService.getEntityViewerFixedFieldsAttributes(vm.entityType)
			doNotShowAttrs = doNotShowAttrs.concat(keysOfFixedFieldsAttrs)

			if (doNotShowAttrs.length) {
				vm.entityAttrs = entityAttrs.filter(
					(entity) => !doNotShowAttrs.includes(entity.key)
				)
			}

			if (vm.entityType === 'instrument') {
				var customizableAccrualsTable = {
					name: 'Accruals schedules table',
					key: 'accrual_calculation_schedules',
					value_type: 'table',
					frontOptions: {
						occupiesWholeRow: true,
					},
				}

				var accrualsTableDataProm =
					entityDataConstructorService.loadOptionsForAccrualsTable()

				var customizableEventsTable = {
					name: 'Events schedules table',
					key: 'event_schedules',
					value_type: 'table',
					frontOptions: {
						occupiesWholeRow: true,
					},
				}

				var eventsTableDataProm =
					entityDataConstructorService.loadOptionsForEventsTable()

				vm.entityAttrs.push(customizableAccrualsTable, customizableEventsTable)

				promises.push(accrualsTableDataProm, eventsTableDataProm)
			}
			//endregion

			vm.layoutAttrs = layoutService.getLayoutAttrs()

			Promise.all(promises)
				.then(() => {
					emptySocketsWithoutAttrFromLayout()

					vm.syncItems()

					vm.readyStatus.constructor = true

					resolve()
				})
				.catch((error) => reject(error))
		})
	}

	vm.createFieldsTree = function () {
		var tabs = JSON.parse(JSON.stringify(vm.tabs))

		vm.fieldsTree = {}

		tabs.forEach(function (tab) {
			vm.fieldsTree[tab.tabOrder] = {}

			var f
			for (f = 0; f < tab.layout.fields.length; f++) {
				var treeTab = vm.fieldsTree[tab.tabOrder]

				var field = tab.layout.fields[f]
				var fRow = field.row
				var fCol = field.column

				if (!treeTab[fRow]) {
					treeTab[fRow] = {}
				}

				treeTab[fRow][fCol] = field
			}
		})
	}

	vm.createFixedAreaFieldsTree = function () {
		var fixedAreaFields = JSON.parse(JSON.stringify(vm.fixedArea.layout.fields))
		vm.fixedAreaFieldsTree = {}

		var i
		for (i = 0; i < fixedAreaFields.length; i++) {
			var field = fixedAreaFields[i]
			var fRow = field.row
			var fCol = field.column

			if (!vm.fixedAreaFieldsTree[fRow]) {
				vm.fixedAreaFieldsTree[fRow] = {}
			}

			vm.fixedAreaFieldsTree[fRow][fCol] = field
		}
	}

	vm.getDrakeContainers = function () {
		var items = []

		var emptyFieldsElem = document.querySelectorAll('.ec-attr-empty')
		for (var i = 0; i < emptyFieldsElem.length; i = i + 1) {
			items.push(emptyFieldsElem[i])
		}

		var cardsElem = document.querySelectorAll(
			'.form-constructor-draggable-card'
		)
		for (var i = 0; i < cardsElem.length; i = i + 1) {
			items.push(cardsElem[i])
		}

		console.log('emptyFieldsElem', emptyFieldsElem)

		return items
	}
	/**
	 * Also called inside layoutConstructorFieldDirective.
	 *
	 * @param item {Object} - filled sockeet data
	 * @returns {string} - attribute class
	 */
	vm.getAttributeClass = function (item) {
		if (
			item.attribute.frontOptions &&
			item.attribute.frontOptions.attribute_class
		) {
			// must have for determining userInputs

			var attributeClass = item.attribute.frontOptions.attribute_class
			return attributeClass // returns: 'userInput'

			// } else if (attrsKeys.includes(item.attribute.key)) {
		} else if (
			vm.attrs.findIndex(
				(dAttr) => dAttr.user_code === item.attribute.user_code
			) > -1
		) {
			return 'attr'
		} else if (
			vm.entityAttrs.findIndex((eAttr) => eAttr.key === item.attribute.key) > -1
		) {
			return 'entityAttr'
		} else if (
			vm.layoutAttrs.findIndex((lAttr) => lAttr.key === item.attribute.key) > -1
		) {
			return 'decorationAttr'
		}
	}
	/**
	 *
	 * @param attrKey {string}
	 * @returns {Object|null}
	 */
	vm.getTableDefaultSettings = function (attrKey) {
		const entityTablesData =
			entityDataConstructorService.dataOfAttributes[vm.entityType]

		if (entityTablesData && entityTablesData.hasOwnProperty(attrKey)) {
			return JSON.parse(JSON.stringify(entityTablesData[attrKey]))
		}

		return null
	}

	var occupyWholeRow = function (field, columnsNumber) {
		field.colspan = columnsNumber
		field.occupiesWholeRow = true
		field.type = 'table'
	}

	var onDropFromSocket = function (
		elem,
		targetTab,
		targetRow,
		targetColumn,
		targetColspan,
		occupiesWholeRow
	) {
		var draggedFromTabOrder = elem.dataset.tabOrder
		var draggedFromRow = parseInt(elem.dataset.row, 10)
		var draggedFromColumn = parseInt(elem.dataset.col, 10)

		if (draggedFromTabOrder === 'fixedArea') {
			var draggedFromTab = vm.fixedArea
		} else {
			var draggedFromTab = vm.tabs[draggedFromTabOrder]
		}

		var a
		for (a = 0; a < targetTab.layout.fields.length; a++) {
			var field = targetTab.layout.fields[a]

			if (field.column === targetColumn && field.row === targetRow) {
				if (draggedFromTabOrder === 'fixedArea') {
					var draggedFromTab = vm.fixedArea
					var draggedFromFieldData = JSON.parse(
						JSON.stringify(
							vm.fixedAreaFieldsTree[draggedFromRow][draggedFromColumn]
						)
					)
				} else {
					var draggedFromTab = vm.tabs[draggedFromTabOrder]
					var draggedFromFieldData = JSON.parse(
						JSON.stringify(
							vm.fieldsTree[draggedFromTabOrder][draggedFromRow][
								draggedFromColumn
							]
						)
					)
				}

				targetTab.layout.fields[a] = draggedFromFieldData
				targetTab.layout.fields[a].colspan = targetColspan
				targetTab.layout.fields[a].column = targetColumn
				targetTab.layout.fields[a].row = targetRow

				if (occupiesWholeRow) {
					occupyWholeRow(field, targetTab.layout.columns)
				}

				break
			}
		}

		//region Make socket we dragged from empty
		var i
		for (i = 0; i < draggedFromTab.layout.fields.length; i++) {
			var field = draggedFromTab.layout.fields[i]

			if (field.column === draggedFromColumn && field.row === draggedFromRow) {
				var emptyFieldData = {
					colspan: 1,
					column: draggedFromColumn,
					editMode: false,
					row: draggedFromRow,
					type: 'empty',
				}

				draggedFromTab.layout.fields[i] = emptyFieldData

				break
			}
		}
		//endregion
	}

	var onDropFromAttributesList = function (
		elem,
		targetTab,
		targetRow,
		targetColumn,
		occupiesWholeRow
	) {
		var a
		for (a = 0; a < targetTab.layout.fields.length; a++) {
			var field = targetTab.layout.fields[a]

			if (field.column === targetColumn && field.row === targetRow) {
				// dragging from attributes list

				var itemIndex = parseInt(elem.dataset.index, 10)
				var attr = JSON.parse(JSON.stringify(vm.items[itemIndex]))

				field.attribute = attr
				field.editable = attr.editable
				field.name = field.attribute.name
				field.type = 'field'
				field.colspan = 1

				/*var entityAttrsKeys = vm.entityAttrs.map(entityAttr => entityAttr.key);
                    var attrsKeys = vm.attrs.map(attr => attr.key);
                    var layoutAttrsKeys = vm.layoutAttrs.map(layoutAttr => layoutAttr.key);*/

				/* if (vm.items[itemIndex].frontOptions &&
                        vm.items[itemIndex].frontOptions.attribute_class === 'userInput') {

                        field.attribute_class = 'userInput';

                    }

                    else if (field.attribute.hasOwnProperty('id') || // old dynamic attributes didn't have key
                        attrsKeys.includes(field.attribute.key)) {

                        field.attribute_class = 'attr';
                        field.id = field.attribute.id;

                    }

                    else if (entityAttrsKeys.includes(field.attribute.key)) {
                        field.attribute_class = 'entityAttr';
                    }

                    else if (layoutAttrsKeys.includes(field.attribute.key)) {
                        field.attribute_class = 'decorationAttr';
                    } */

				field.attribute_class = vm.getAttributeClass(field)

				if (field.attribute_class === 'attr') {
					field.id = field.attribute.id
				}

				if (attr.value_type === 'table') {
					var defaultSettings = vm.getTableDefaultSettings(attr.key)

					if (defaultSettings) {
						field.options = { ...field.options, ...defaultSettings }
					}
				}

				if (occupiesWholeRow) {
					occupyWholeRow(field, targetTab.layout.columns)
				}

				if (field.attribute) delete field.attribute.frontOptions // have to be after calling vm.getAttributeClass();

				break
			}
		}
	}

	vm.dragAndDrop = {
		init: function () {
			this.selectDragulaContainers()
			this.eventListeners()
		},

		selectDragulaContainers: function () {
			var items = vm.getDrakeContainers()

			this.dragula = dragula(items, {
				moves: function (el) {
					return !el.classList.contains('ec-attr-empty-btn')
				},
				accepts: function (el, target, source, sibling) {
					return target.classList.contains('ec-attr-empty')
				},
				copy: function (el, source) {
					return !el.classList.contains('ec-attr-occupied')
				},
				revertOnSpill: true,
			})
		},

		eventListeners: function () {
			var drake = this.dragula

			drake.on('over', function (elem, container, source) {
				$(container).addClass('active')
				$(container).on('mouseleave', function () {
					$(this).removeClass('active')
				})
			})

			drake.on('drag', function () {
				scrollHelper.enableDnDWheelScroll()
			})

			drake.on('out', function (elem, container, source) {
				$(container).removeClass('active')
			})

			drake.on('drop', function (elem, target) {
				$(target).removeClass('active')

				if (target) {
					var targetTabOrder = target.dataset.tabOrder
					var targetRow = parseInt(target.dataset.row, 10)
					var targetColumn = parseInt(target.dataset.col, 10)
					var targetColspan = parseInt(target.dataset.colspan, 10)
					var occupiesWholeRow = elem.dataset.occupiesWholeRow === 'true'

					if (occupiesWholeRow) {
						targetColumn = 1
					}

					var targetTab =
						targetTabOrder === 'fixedArea'
							? vm.fixedArea
							: vm.tabs[targetTabOrder]

					if (
						occupiesWholeRow &&
						!vm.isRowEmpty(
							targetTab.tabOrder,
							targetRow,
							targetTab.layout.columns
						)
					) {
						$mdDialog.show({
							controller: 'WarningDialogController as vm',
							templateUrl: 'views/dialogs/warning-dialog-view.html',
							parent: dialogParent,
							clickOutsideToClose: false,
							locals: {
								warning: {
									title: 'Warning',
									description: 'Row should be empty to contain this attribute.',
								},
							},
							multiple: true,
						})
					} else {
						if (elem.classList.contains('ec-attr-occupied')) {
							onDropFromSocket(
								elem,
								targetTab,
								targetRow,
								targetColumn,
								targetColspan,
								occupiesWholeRow
							)
						} else {
							onDropFromAttributesList(
								elem,
								targetTab,
								targetRow,
								targetColumn,
								occupiesWholeRow
							)
						}

						if (targetRow === targetTab.layout.rows) {
							addRows(targetTab)
						}

						vm.createFieldsTree()

						if (vm.fixedArea.isActive) {
							vm.createFixedAreaFieldsTree()
						}

						vm.syncItems()

						$scope.$apply()
					}

					drake.cancel()
				}
			})

			drake.on('dragend', function (el) {
				scrollHelper.disableDnDWheelScroll()

				$scope.$apply()
				drake.remove()
			})
		},

		destroy: function () {
			// console.log('this.dragula', this.dragula)
			this.dragula.destroy()
		},
	}

	vm.updateDrakeContainers = function () {
		if (vm.dragAndDrop.dragula) {
			setTimeout(function () {
				vm.dragAndDrop.dragula.containers = []
				vm.dragAndDrop.dragula.containers = vm.getDrakeContainers()
			}, 500)
		}
	}

	/**
	 *
	 * @param attr {Object} - is an entity attribute, dynamic attribute, user input or decoration attribute
	 * @param attributeClass {String} - can be 'entityAttr', 'attr', 'userInput', 'decorationAttr'
	 * @param socket {Object} - data of socket inside tab
	 * @returns {boolean}
	 */
	var attributeOccupiesThisSocket = function (attr, attributeClass, socket) {
		if (socket.attribute_class !== attributeClass) {
			return false
		}

		switch (socket.attribute_class) {
			case 'entityAttr':
				return socket.attribute.key === attr.key

			case 'attr': // dynamic attribute
				if (socket.key) {
					// legacy input form editor layout
					return socket.key === attr.user_code
				} else {
					if (socket.attribute.user_code) {
						return socket.attribute.user_code === attr.user_code
					}

					return false
				}

			case 'userInput':
				return socket.name === attr.name

			case 'decorationAttr':
				if (socket.attribute.hasOwnProperty('key')) {
					return socket.attribute.key === attr.key
				}

				return socket.name === attr.name // for legacy input form editor layouts
		}

		return false
	}

	vm.syncItems = function () {
		vm.items = []

		var showItemInAttrsList = function (item, attributeClass) {
			if (
				item.key === 'object_permissions_user' ||
				item.key === 'object_permissions_group'
			) {
				return false
			}

			var i, a
			for (i = 0; i < vm.tabs.length; i++) {
				var tab = vm.tabs[i]

				for (a = 0; a < tab.layout.fields.length; a++) {
					var field = tab.layout.fields[a]

					if (attributeOccupiesThisSocket(item, attributeClass, field)) {
						return false
					}
				}
			}

			return true
		}

		/* vm.items = vm.items.concat(vm.attrs);
            vm.items = vm.items.concat(vm.entityAttrs);
            vm.items = vm.items.concat(vm.userInputs);
            vm.items = vm.items.concat(vm.layoutAttrs);

            vm.items = vm.items.filter(function (item) {

                var result = true;

                vm.tabs.forEach(function (tab) {
                    tab.layout.fields.forEach(function (field) {
                        if (field.name === item.name) {

                            result = false;

                            if (item.hasOwnProperty('key')) {
                                if (item.key === 'layoutLine' || item.key === 'layoutLineWithLabel' || item.key === 'layoutPlainText') {
                                    result = true;
                                }
                            }

                        }

                    })
                });

                if (vm.fixedArea.isActive) {

                    var i;
                    for (i = 0; i < vm.fixedArea.layout.fields.length; i++) {
                        var field = vm.fixedArea.layout.fields[i];

                        if (field.type !== 'empty' && field.name === item.name) {
                            result = false;
                            break;
                        }

                    }

                }

                if (item.key === 'object_permissions_user' || item.key === 'object_permissions_group') {
                    result = false;
                }

                return result;

            }); */

		var availableAttrs = vm.attrs.filter(function (attr) {
			return showItemInAttrsList(attr, 'attr')
		})

		var availableEntityAttrs = vm.entityAttrs.filter(function (eAttr) {
			return showItemInAttrsList(eAttr, 'entityAttr')
		})

		var availableUserInputs = vm.userInputs.filter(function (input) {
			return showItemInAttrsList(input, 'userInput')
		})

		vm.items = vm.items.concat(availableAttrs)
		vm.items = vm.items.concat(availableEntityAttrs)
		vm.items = vm.items.concat(availableUserInputs)
		vm.items = vm.items.concat(vm.layoutAttrs)

		// set all items to Editable = True state by default
		vm.items = vm.items.map(function (item) {
			if (item.editable !== false) {
				item.editable = true
			}

			return item
		})

		vm.updateDrakeContainers()
	}

	vm.getFieldName = function (item) {
		if (
			item.key === 'subgroup' &&
			item.value_content_type.indexOf('strategies.strategy') !== -1
		) {
			return 'Group'
		}

		return item.name
	}

	vm.getFieldType = function (valueType) {
		var i
		for (i = 0; i < choices.length; i = i + 1) {
			if (valueType === choices[i].value) {
				return choices[i]['caption_name']
			}
		}
	}

	vm.doesAttrOccupiesWholeRow = function (attr) {
		return attr.frontOptions && attr.frontOptions.occupiesWholeRow
			? 'true'
			: 'false'
	}

	vm.openFormPreview = function ($event) {
		var tabs = JSON.parse(angular.toJson(vm.tabs))

		var previewController = 'EntityViewerFormsPreviewDialogController as vm'
		var previewData = { entityType: vm.entityType }

		if (vm.entityType === 'complex-transaction') {
			previewController = 'ComplexTransactionFormsPreviewDialogController as vm'
			previewData.transactionTypeId = vm.instanceId
		}

		$mdDialog.show({
			controller: previewController,
			templateUrl:
				'views/dialogs/data-constructor-forms-preview-dialog-view.html',
			parent: dialogParent,
			targetEvent: $event,
			clickOutsideToClose: false,
			multiple: true,
			locals: {
				inputFormTabs: tabs,
				data: previewData,
			},
		})
	}

	vm.setTabsHolderHeight = function () {
		var elemThatSetsMaxHeight = document.querySelector('.mdDialogContent')
		var tabsHolderElem = document.querySelector('.tabsHolderElem')

		tabsHolderElem.style.height = elemThatSetsMaxHeight.clientHeight + 'px'
	}

	vm.init = function () {
		window.addEventListener('resize', vm.setTabsHolderHeight)

		if (data.isCreateNew) {
			vm.formLayoutIsNew = data.isCreateNew
		}

		vm.getLayout().then(function () {
			var palettesPromise = new Promise(function (res, rej) {
				colorPalettesService
					.getList({ pageSize: 1000 })
					.then(function (paletteData) {
						vm.palettesList = paletteData.results
						res()
					})
					.catch((error) => rej(error))
			})

			Promise.all([vm.getItems(), palettesPromise]).then(function () {
				fixSocketsInsideLayout()
				vm.createFieldsTree()

				if (vm.fixedArea.isActive) {
					vm.createFixedAreaFieldsTree()
				}

				$scope.$apply(function () {
					setTimeout(function () {
						vm.dragAndDrop.init()
					}, 500)
				})

				var scrollElem = document.querySelector(
					'.entity-data-constructor-dialog .scrollElemOnDrag'
				)
				scrollHelper.setDnDScrollElem(scrollElem)
			})
		})
	}

	vm.init()

	$scope.$on('$destroy', function () {
		window.removeEventListener('resize', vm.setTabsHolderHeight)
		vm.dragAndDrop.destroy()
	})
}
