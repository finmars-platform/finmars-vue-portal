/**
 * Created by szhitenev on 05.05.2016.
 */

import md5Helper from '../helpers/md5.helper'
import metaHelper from '../helpers/meta.helper'

import DashboardConstructorDataService from '../services/dashboard-constructor/dashboardConstructorDataService'
import DashboardConstructorEventService from '../services/dashboard-constructor/dashboardConstructorEventService'

import AttributeDataService from '../services/attributeDataService'

import dashboardConstructorEvents from '../services/dashboard-constructor/dashboardConstructorEvents'

export default function (
	$scope,
	$stateParams,
	$state,
	$mdDialog,
	toastNotificationService,
	metaContentTypesService,
	customFieldService,
	attributeTypeService,
	uiService
) {
	var vm = this

	vm.readyStatus = {
		data: false,
		attributes: false,
		tabs: false,
	}

	vm.dashboardConstructorDataService = null
	vm.dashboardConstructorEventService = null

	vm.availableComponentsTypes = []

	vm.layout = {
		name: '',
		data: {
			layout_type: null,
			fixed_area: {
				status: 'disabled',
				position: 'top',
				layout: {
					rows_count: null,
					columns_count: null,
					rows: [],
				},
			},
			tabs: [],
			components_types: [],
		},
	}

	vm.selectLayoutType = function (layoutType) {
		vm.layout.data.layout_type = layoutType
	}

	vm.getColumnsCount = function () {
		var result = 10

		if (vm.layout.data.layout_type) {
			if (vm.layout.data.layout_type === 'desktop') {
				result = 10
			}

			if (vm.layout.data.layout_type === 'tablet') {
				result = 6
			}

			if (vm.layout.data.layout_type === 'mobile') {
				result = 4
			}
		}

		return result
	}

	vm.getRowsCount = function () {
		var result = 10

		if (vm.layout.data.layout_type) {
			if (vm.layout.data.layout_type === 'desktop') {
				result = 20
			}

			if (vm.layout.data.layout_type === 'tablet') {
				result = 10
			}

			if (vm.layout.data.layout_type === 'mobile') {
				result = 10
			}
		}

		return result
	}

	vm.activateTopPanel = function ($event) {
		vm.layout.data.fixed_area.status = 'active'
		vm.layout.data.fixed_area.layout = {
			rows_count: null,
			columns_count: null,
			rows: [],
		}

		var columns_count = vm.getColumnsCount()
		var rows_count = 1

		for (var r = 0; r < rows_count; r = r + 1) {
			vm.layout.data.fixed_area.layout.rows[r] = {
				row_number: r,
				columns: [],
			}

			for (var c = 0; c < columns_count; c = c + 1) {
				vm.layout.data.fixed_area.layout.rows[r].columns[c] = {
					column_number: c,
					cell_type: 'empty',
					colspan: 1,
					rowspan: 1,
					data: {},
				}
			}
		}

		vm.layout.data.fixed_area.layout.rows_count = rows_count
		vm.layout.data.fixed_area.layout.columns_count = columns_count

		vm.dashboardConstructorEventService.dispatchEvent(
			dashboardConstructorEvents.UPDATE_DASHBOARD_CONSTRUCTOR
		)
		setTimeout(function () {
			vm.dashboardConstructorEventService.dispatchEvent(
				dashboardConstructorEvents.UPDATE_GRID_CELLS_SIZE
			)
		}, 0)
	}

	vm.deactivateTopPanel = function ($event) {
		$mdDialog
			.show({
				controller: 'WarningDialogController as vm',
				templateUrl: 'views/dialogs/warning-dialog-view.html',
				parent: angular.element(document.body),
				targetEvent: $event,
				clickOutsideToClose: false,
				locals: {
					warning: {
						title: 'Warning',
						description: 'Are you sure you want to deactivate Top Panel?',
					},
				},
				autoWrap: true,
				skipHide: true,
				multiple: true,
			})
			.then(function (res) {
				if (res.status === 'agree') {
					vm.layout.data.fixed_area.status = 'disabled'
					vm.layout.data.fixed_area.layout = {
						rows_count: null,
						columns_count: null,
						rows: [],
					}

					vm.dashboardConstructorEventService.dispatchEvent(
						dashboardConstructorEvents.UPDATE_DASHBOARD_CONSTRUCTOR
					)
				}
			})
	}

	vm.generateId = function (str) {
		return md5Helper.md5(str)
	}

	vm.deleteTab = function (tab) {
		var i
		for (i = 0; i < vm.layout.data.tabs.length; i = i + 1) {
			if (tab.tab_number === vm.layout.data.tabs[i].tab_number) {
				vm.layout.data.tabs.splice(i, 1)
				break
			}
		}

		vm.layout.data.tabs = vm.layout.data.tabs.map(function (tab, index) {
			tab.tab_number = index

			return tab
		})

		vm.dashboardConstructorEventService.dispatchEvent(
			dashboardConstructorEvents.UPDATE_DASHBOARD_CONSTRUCTOR
		)
	}

	vm.addTab = function () {
		var id = vm.generateId(
			new Date().getTime() + '_' + vm.layout.data.tabs.length
		)

		var tab = {
			name: '',
			editState: true,
			id: id,
			tab_number: vm.layout.data.tabs.length,
			layout: {
				rows_count: null,
				columns_count: null,
				rows: [],
			},
		}

		var columns_count = vm.getColumnsCount()
		var rows_count = vm.getRowsCount()

		// console.log('rows_count', rows_count);

		for (var r = 0; r < rows_count; r = r + 1) {
			tab.layout.rows[r] = {
				row_number: r,
				columns: [],
			}

			for (var c = 0; c < columns_count; c = c + 1) {
				tab.layout.rows[r].columns[c] = {
					column_number: c,
					cell_type: 'empty',
					colspan: 1,
					rowspan: 1,
					data: {},
				}
			}
		}

		tab.layout.rows_count = rows_count
		tab.layout.columns_count = columns_count

		vm.layout.data.tabs.push(tab)

		vm.dashboardConstructorDataService.setData(vm.layout)

		vm.dashboardConstructorEventService.dispatchEvent(
			dashboardConstructorEvents.UPDATE_DASHBOARD_CONSTRUCTOR
		)
		setTimeout(function () {
			vm.dashboardConstructorEventService.dispatchEvent(
				dashboardConstructorEvents.UPDATE_GRID_CELLS_SIZE
			)

			allowSpacesInTabName()
		}, 100)
	}

	vm.openTabsEditor = function ($event) {
		var tabs = JSON.parse(angular.toJson(vm.layout.data.tabs))

		$mdDialog
			.show({
				controller: 'TabsEditorDialogController as vm',
				templateUrl: 'views/dialogs/tabs-editor-dialog-view.html',
				multiple: true,
				locals: {
					tabs: tabs,
					data: {
						trackByProp: 'id',
					},
				},
			})
			.then(function (res) {
				if (res.status === 'agree') {
					vm.layout.data.tabs = []
					vm.layout.data.tabs = res.data.tabs

					vm.dashboardConstructorDataService.setData(vm.layout)
					vm.dashboardConstructorEventService.dispatchEvent(
						dashboardConstructorEvents.UPDATE_DASHBOARD_CONSTRUCTOR
					)

					vm.dashboardConstructorEventService.dispatchEvent(
						dashboardConstructorEvents.UPDATE_GRID_CELLS_SIZE
					)
				}
			})
	}

	vm.openAccordionEditor = function ($event) {
		$mdDialog
			.show({
				controller: 'DashboardConstructorAccordionEditorDialogController as vm',
				templateUrl:
					'views/dialogs/dashboard-constructor/dashboard-constructor-accordion-editor-dialog-view.html',
				multiple: true,
				locals: {
					data: {
						layout: vm.layout,
					},
				},
			})
			.then(function (res) {
				if (res.status === 'agree') {
					vm.layout = res.data.layout

					vm.dashboardConstructorDataService.setData(vm.layout)

					vm.updateProxyAccordions()

					vm.dashboardConstructorEventService.dispatchEvent(
						dashboardConstructorEvents.UPDATE_DASHBOARD_CONSTRUCTOR
					)

					vm.dashboardConstructorEventService.dispatchEvent(
						dashboardConstructorEvents.UPDATE_GRID_CELLS_SIZE
					)
				} else {
					vm.updateProxyAccordions()
				}
			})
	}

	var tabNameInput = null

	var removeKeydownListener = function () {
		document.removeEventListener('keydown', addSpaceIntoTabName)
	}

	var addSpaceIntoTabName = function (kDownEv) {
		if (kDownEv.key === ' ') {
			var tabNewName = metaHelper.insertSpaceIntoElementText(tabNameInput)

			var tabId = tabNameInput.dataset.tabId
			for (var i = 0; i < vm.layout.data.tabs.length; i++) {
				if (vm.layout.data.tabs[i].id === tabId) {
					vm.layout.data.tabs[i].captionName = tabNewName
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
				vm.layout.data.tabs.splice($index, 1)
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
			vm.layout.data.tabs.forEach(function (singleTab) {
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
				autoWrap: true,
				skipHide: true,
				preserveScope: true,
				multiple: true,
				locals: {
					warning: {
						title: 'Warning!',
						description: 'Name of the tab must make a unique character set.',
					},
				},
			})
		}

		vm.dashboardConstructorEventService.dispatchEvent(
			dashboardConstructorEvents.UPDATE_GRID_CELLS_SIZE
		)
	}

	vm.getVerboseType = function (item) {
		var verboseName = 'Unknown'

		switch (item.type) {
			case 'report_viewer':
			case 'report_viewer_split_panel':
				verboseName = 'Report Viewer'
				break
			/*case 'report_viewer_split_panel':
                    verboseName = 'Report Viewer Split Panel';
                    break;*/
			case 'report_viewer_grand_total':
				verboseName = 'Report Viewer Grand Total'
				break
			case 'report_viewer_bars_chart':
			case 'report_viewer_pie_chart':
				verboseName = 'Report Viewer Charts'
				break
			case 'report_viewer_matrix':
				verboseName = 'Report Viewer Matrix'
				break
			case 'report_viewer_table_chart':
				verboseName = 'Report Viewer Table Chart'
				break
			case 'entity_viewer':
				verboseName = 'Entity Viewer'
				break
			case 'entity_viewer_split_panel':
				verboseName = 'Entity Viewer Split Panel'
				break
			case 'input_form':
				verboseName = 'Input Form'
				break
			case 'control':
				verboseName = 'Control'
				break
			case 'accordion':
				verboseName = 'Accordion'
				break
			case 'button_set':
				verboseName = 'Button Set'
				break
			case 'superset_dashboard':
				verboseName = 'Superset Dashboard'
				break
			case 'finmars_widget':
				verboseName = 'Finmars Widget'
				break
		}

		return verboseName
	}

	vm.goToDashboard = function () {
		$state.go('app.portal.dashboard')
	}

	var emptySocketInsideTab = function (tabNumber, rowNumber, columnNumber) {
		var dcRow = vm.layout.data.tabs[tabNumber].layout.rows[rowNumber]

		/*var dcColspan = dcRow.columns[columnNumber].colspan;
            var dcRowspan = dcRow.columns[columnNumber].rowspan;

            dcRow.columns[columnNumber] = {
                cell_type: "empty",
                colspan: dcColspan,
                column_number: columnNumber,
                data: {},
                editMode: false,
                rowspan: dcRowspan
            }*/
		dcRow.columns[columnNumber].cell_type = 'empty'
		dcRow.columns[columnNumber].colspan = 1
		dcRow.columns[columnNumber].data = {}
		dcRow.columns[columnNumber].rowspan = 1
	}

	var emptySocketInsideFixedArea = function (rowNumber, columnNumber) {
		var dcRow = vm.layout.data.fixed_area.layout.rows[rowNumber]

		/*var dcColspan = dcRow.columns[columnNumber].colspan;
            var dcRowspan = dcRow.columns[columnNumber].rowspan;

            dcRow.columns[columnNumber] = {
                cell_type: "empty",
                colspan: dcColspan,
                column_number: columnNumber,
                data: {},
                editMode: false,
                rowspan: dcRowspan
            }*/
		dcRow.columns[columnNumber].cell_type = 'empty'
		dcRow.columns[columnNumber].colspan = 1
		dcRow.columns[columnNumber].data = {}
		dcRow.columns[columnNumber].rowspan = 1
	}

	var clearSocketSpan = function (
		tabNumber,
		rowNumber,
		rowSpan,
		colNumber,
		colSpan
	) {
		var tab
		var row
		var item

		if (tabNumber === 'fixed_area') {
			tab = vm.layout.data.fixed_area
		} else {
			tab = vm.layout.data.tabs[tabNumber]
		}

		for (var r = rowNumber; r < rowNumber + rowSpan; r = r + 1) {
			row = tab.layout.rows[r]

			for (var c = colNumber; c < colNumber + colSpan; c = c + 1) {
				item = row.columns[c]

				if (item.is_hidden === true) {
					/*if (item.hidden_by.row_number === rowNumber &&
                            item.hidden_by.column_number === colNumber) {

                            delete item.is_hidden;
                            delete item.hidden_by;

                        }*/
					delete item.is_hidden
					delete item.hidden_by
				}
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
				accepts: function (el, target, source, sibling) {
					if (
						target.classList.contains('dashboard-constructor-draggable-card')
					) {
						return false
					}

					return true
				},
				copy: true,
			})
		},

		eventListeners: function () {
			var drake = this.dragula

			drake.on('over', function (elem, container, source) {
				if (
					!container.classList.contains('dashboard-constructor-draggable-card')
				) {
					$(container).addClass('active')
					$(container).on('mouseleave', function () {
						$(this).removeClass('active')
					})
				}
			})

			drake.on('out', function (elem, container, source) {
				$(container).removeClass('active')
			})

			drake.on('drop', function (elem, target) {
				console.log('target', { target: target })
				console.log('elem', { elem: elem })
				var draggedFromSocket = false

				$(target).removeClass('active')

				if (target) {
					if (target.classList.contains('dashboard-constructor-empty-cell')) {
						draggedFromSocket = true

						var layout = vm.dashboardConstructorDataService.getData()
						var component_id = elem.dataset.componentId
						var data_source = target.parentElement.parentElement // root of the cell (.dashboard-constructor-cell)
						var tab_number

						if (data_source.dataset.tab == 'fixed_area') {
							tab_number = data_source.dataset.tab
						} else {
							tab_number = parseInt(data_source.dataset.tab, 10)
						}

						var row_number = parseInt(data_source.dataset.row, 10)
						var column_number = parseInt(data_source.dataset.column, 10)

						if (elem.classList.contains('dashboard-socket-card')) {
							// when dragged from socket

							var dc_row_number = parseInt(elem.dataset.row, 10)
							var dc_column_number = parseInt(elem.dataset.column, 10)
							var dc_tab_number = elem.dataset.tabNumber

							if (dc_tab_number === 'fixed_area') {
								var dcTab = layout.data.fixed_area
							} else {
								dc_tab_number = parseInt(elem.dataset.tabNumber, 10)
								var dcTab = layout.data.tabs[dc_tab_number]
							}

							var dcRow = dcTab.layout.rows[dc_row_number]
							var dcCol = dcRow.columns[dc_column_number]

							var newColComponentType = dcCol.data.type
							var newColComponentId = dcCol.data.id

							if (tab_number === 'fixed_area') {
								var targetRow = layout.data.fixed_area.layout.rows[row_number]
							} else {
								// when dragged from area with available cards
								var targetRow =
									layout.data.tabs[tab_number].layout.rows[row_number]
							}

							if (newColComponentType === 'accordion') {
								column_number = 0
							}

							targetRow.columns[column_number].cell_type = 'component'
							targetRow.columns[column_number].data.type = newColComponentType
							targetRow.columns[column_number].data.id = newColComponentId

							var dcRowspan = dcCol.rowspan
							var dcColspan = dcCol.colspan

							clearSocketSpan(
								dc_tab_number,
								dc_row_number,
								dcRowspan,
								dc_column_number,
								dcColspan
							)

							if (dc_tab_number === 'fixed_area') {
								emptySocketInsideFixedArea(dc_row_number, dc_column_number)
							} else {
								emptySocketInsideTab(
									dc_tab_number,
									dc_row_number,
									dc_column_number
								)
							}
						} else {
							// when dragged from area with cards

							var component =
								vm.dashboardConstructorDataService.getComponentById(
									component_id
								)

							if (tab_number === 'fixed_area') {
								var targetRow = layout.data.fixed_area.layout.rows[row_number]
							} else {
								// when dragged from area with available cards
								var targetRow =
									layout.data.tabs[tab_number].layout.rows[row_number]
							}

							if (component.type === 'accordion') {
								column_number = 0
							}

							targetRow.columns[column_number].cell_type = 'component'
							targetRow.columns[column_number].data.type = JSON.parse(
								JSON.stringify(component.type)
							)
							targetRow.columns[column_number].data.id = component_id
						}

						vm.dashboardConstructorDataService.setData(layout)

						vm.dashboardConstructorEventService.dispatchEvent(
							dashboardConstructorEvents.UPDATE_DASHBOARD_CONSTRUCTOR
						)

						if (draggedFromSocket) {
							vm.dashboardConstructorEventService.dispatchEvent(
								dashboardConstructorEvents.UPDATE_GRID_CELLS_SIZE
							)
						}

						$scope.$apply()
					}
				}

				$scope.$apply()
			})

			drake.on('dragend', function (el) {
				$scope.$apply()
				$(el).remove()
			})
		},

		destroy: function () {
			// console.log('this.dragula', this.dragula)
			this.dragula.destroy()
		},
	}

	vm.getDrakeContainers = function () {
		var items = []

		var emptyFieldsElem = document.querySelectorAll(
			'.dashboard-constructor-empty-cell'
		)
		for (i = 0; i < emptyFieldsElem.length; i = i + 1) {
			items.push(emptyFieldsElem[i])
		}

		var i
		var cardsElem = document.querySelectorAll(
			'.dashboard-constructor-draggable-card'
		)
		for (i = 0; i < cardsElem.length; i = i + 1) {
			items.push(cardsElem[i])
		}

		return items
	}

	vm.updateDrakeContainers = function () {
		if (vm.dragAndDrop.dragula) {
			setTimeout(function () {
				vm.dragAndDrop.dragula.containers = []
				vm.dragAndDrop.dragula.containers = vm.getDrakeContainers()
			}, 500)
		}
	}

	vm.updateAvailableComponentsTypes = function () {
		var componentsInUse = []

		if (
			vm.layout.data.fixed_area.layout &&
			vm.layout.data.fixed_area.layout.rows
		) {
			vm.layout.data.fixed_area.layout.rows.forEach(function (row) {
				row.columns.forEach(function (column) {
					if (column.cell_type === 'component') {
						componentsInUse.push(column.data.id)
					}
				})
			})
		}

		vm.layout.data.tabs.forEach(function (tab) {
			tab.layout.rows.forEach(function (row) {
				row.columns.forEach(function (column) {
					if (column.cell_type === 'component') {
						componentsInUse.push(column.data.id)
					}
				})
			})
		})

		vm.availableComponentsTypes = vm.layout.data.components_types.filter(
			function (component) {
				return componentsInUse.indexOf(component.id) === -1
			}
		)
	}

	vm.isRowAddableFixedArea = function (row) {
		var row_number = row.row_number

		var result = true
		var layout_row
		var item

		for (
			var r = 0;
			r < vm.layout.data.fixed_area.layout.rows.length;
			r = r + 1
		) {
			layout_row = vm.layout.data.fixed_area.layout.rows[r]

			if (layout_row.row_number <= row_number) {
				for (var i = 0; i < layout_row.columns.length; i = i + 1) {
					item = layout_row.columns[i]

					if (layout_row.row_number + item.rowspan - 1 > row_number) {
						result = false
						break
					}
				}
			}

			if (!result) {
				break
			}
		}

		return result
	}

	vm.isRowAddable = function (tab, row) {
		var row_number = row.row_number

		var result = true
		var layout_row
		var item

		for (var r = 0; r < tab.layout.rows.length; r = r + 1) {
			layout_row = tab.layout.rows[r]

			if (layout_row.row_number <= row_number) {
				for (var i = 0; i < layout_row.columns.length; i = i + 1) {
					item = layout_row.columns[i]

					if (layout_row.row_number + item.rowspan - 1 > row_number) {
						result = false
						break
					}
				}
			}

			if (!result) {
				break
			}
		}

		return result
	}

	vm.isRowEmpty = function (row) {
		var result = true

		row.columns.forEach(function (column) {
			if (column.cell_type !== 'empty') {
				result = false
			}

			if (column.is_hidden === true) {
				result = false
			}
		})

		return result
	}

	vm.deleteRowFixedArea = function (row) {
		var layout = vm.dashboardConstructorDataService.getData()

		layout.data.fixed_area.layout.rows =
			layout.data.fixed_area.layout.rows.filter(function (tabRow) {
				return row.row_number !== tabRow.row_number
			})

		layout.data.fixed_area.layout.rows = layout.data.fixed_area.layout.rows.map(
			function (row, index) {
				row.row_number = index

				return row
			}
		)

		layout.data.fixed_area.layout.rows_count =
			layout.data.fixed_area.layout.rows.length

		vm.dashboardConstructorDataService.setData(layout)

		vm.dashboardConstructorEventService.dispatchEvent(
			dashboardConstructorEvents.UPDATE_DASHBOARD_CONSTRUCTOR
		)
		vm.dashboardConstructorEventService.dispatchEvent(
			dashboardConstructorEvents.UPDATE_GRID_CELLS_SIZE
		)
	}

	vm.deleteRow = function (tab, row) {
		var layout = vm.dashboardConstructorDataService.getData()

		layout.data.tabs = layout.data.tabs.map(function (layoutTab) {
			if (tab.id === layoutTab.id) {
				tab.layout.rows = tab.layout.rows.filter(function (tabRow) {
					return row.row_number !== tabRow.row_number
				})

				tab.layout.rows = tab.layout.rows.map(function (row, index) {
					row.row_number = index

					return row
				})

				tab.layout.rows_count = tab.layout.rows.length
			}

			return layoutTab
		})

		vm.dashboardConstructorDataService.setData(layout)

		vm.dashboardConstructorEventService.dispatchEvent(
			dashboardConstructorEvents.UPDATE_DASHBOARD_CONSTRUCTOR
		)
		vm.dashboardConstructorEventService.dispatchEvent(
			dashboardConstructorEvents.UPDATE_GRID_CELLS_SIZE
		)
	}

	vm.insertRowFixedArea = function (row) {
		var layout = vm.dashboardConstructorDataService.getData()

		var newRow = {
			row_number: row.row_number + 1,
			columns: [],
		}

		for (
			var c = 0;
			c < layout.data.fixed_area.layout.columns_count;
			c = c + 1
		) {
			newRow.columns[c] = {
				column_number: c,
				cell_type: 'empty',
				colspan: 1,
				rowspan: 1,
				data: {},
			}
		}

		layout.data.fixed_area.layout.rows.splice(newRow.row_number, 0, newRow)

		layout.data.fixed_area.layout.rows = layout.data.fixed_area.layout.rows.map(
			function (row, index) {
				row.row_number = index

				return row
			}
		)

		layout.data.fixed_area.layout.rows_count =
			layout.data.fixed_area.layout.rows.length

		vm.dashboardConstructorDataService.setData(layout)

		vm.dashboardConstructorEventService.dispatchEvent(
			dashboardConstructorEvents.UPDATE_DASHBOARD_CONSTRUCTOR
		)
		vm.dashboardConstructorEventService.dispatchEvent(
			dashboardConstructorEvents.UPDATE_GRID_CELLS_SIZE
		)
	}

	vm.insertRow = function (tab, row) {
		var layout = vm.dashboardConstructorDataService.getData()

		layout.data.tabs = layout.data.tabs.map(function (layoutTab) {
			if (tab.id === layoutTab.id) {
				var newRow = {
					row_number: row.row_number + 1,
					columns: [],
				}

				for (var c = 0; c < layoutTab.layout.columns_count; c = c + 1) {
					newRow.columns[c] = {
						column_number: c,
						cell_type: 'empty',
						colspan: 1,
						rowspan: 1,
						data: {},
					}
				}

				layoutTab.layout.rows.splice(newRow.row_number, 0, newRow)

				layoutTab.layout.rows = layoutTab.layout.rows.map(function (
					row,
					index
				) {
					row.row_number = index

					return row
				})

				layoutTab.layout.rows_count = layoutTab.layout.rows.length
			}

			return layoutTab
		})

		vm.dashboardConstructorDataService.setData(layout)

		vm.dashboardConstructorEventService.dispatchEvent(
			dashboardConstructorEvents.UPDATE_DASHBOARD_CONSTRUCTOR
		)
		vm.dashboardConstructorEventService.dispatchEvent(
			dashboardConstructorEvents.UPDATE_GRID_CELLS_SIZE
		)
	}

	vm.getLayout = function () {
		vm.readyStatus.data = false

		uiService.getDashboardLayoutByKey(vm.layout.id).then(function (data) {
			vm.layout = data

			vm.dashboardConstructorDataService.setData(vm.layout)
			vm.dashboardConstructorDataService.setComponents(
				vm.layout.data.components_types
			)

			vm.updateAvailableComponentsTypes()

			vm.readyStatus.data = true

			vm.dashboardConstructorEventService.dispatchEvent(
				dashboardConstructorEvents.UPDATE_GRID_CELLS_SIZE
			)

			vm.updateProxyAccordions()

			console.log('vm.layout', JSON.parse(angular.toJson(vm.layout)))

			$scope.$apply(function () {
				setTimeout(function () {
					// vm.initDragAndDrop();
					vm.dragAndDrop.init()
				}, 500)
			})
		})
	}

	vm.saveLayout = function () {
		var layout = JSON.parse(angular.toJson(vm.layout)) // removing angular properties

		vm.clearProxyAccordions(layout)

		var components = vm.dashboardConstructorDataService.getComponents()
		layout.data.components_types = components

		if (layout.id) {
			uiService
				.updateDashboardLayout(layout.id, layout)
				.then(function (data) {
					vm.layout.modified = data.modified

					toastNotificationService.success(
						'Dashboard layout ' + layout.name + ' was successfully saved'
					)
				})
				.catch(function (error) {
					toastNotificationService.error(
						'Error occurred while saving layout ' + layout.name
					)
				})
		} else {
			uiService
				.getDashboardLayoutList()
				.then(function (data) {
					if (!data.results || !data.results.length) {
						layout.is_default = true
					}

					uiService
						.createDashboardLayout(layout)
						.then(function (data) {
							vm.layout = data

							vm.dashboardConstructorDataService.setData(vm.layout)
							vm.dashboardConstructorDataService.setComponents(
								vm.layout.data.components_types
							)

							/*$mdDialog.show({
                            controller: 'InfoDialogController as vm',
                            templateUrl: 'views/info-dialog-view.html',
                            parent: angular.element(document.body),
                            targetEvent: $event,
                            clickOutsideToClose: false,
                            locals: {
                                info: {
                                    title: 'Success',
                                    description: "Dashboard Layout is Saved"
                                }
                            }
                        });*/
							toastNotificationService.success(
								'Dashboard layout ' + layout.name + ' was successfully saved'
							)

							vm.dashboardConstructorEventService.dispatchEvent(
								dashboardConstructorEvents.UPDATE_GRID_CELLS_SIZE
							)
						})
						.catch(function (error) {
							toastNotificationService.error(
								'Error occurred while saving layout ' + layout.name
							)
						})
				})
				.catch(function (error) {
					toastNotificationService.error(
						'Error occurred while saving layout ' + layout.name
					)
				})
		}
	}

	vm.makeCopy = function ($event) {
		var layout = JSON.parse(JSON.stringify(vm.layout))

		delete layout.id
		layout.name = layout.name + ' (Copy)'
		layout.user_code = layout.user_code + ' (Copy)'

		uiService.createDashboardLayout(layout).then(function (data) {
			$state.go('app.portal.dashboard-constructor', {
				id: data.id,
			})
		})
	}

	// Components Types Section Start

	var dashboardComponentsTypesData = {
		control: {
			editorController:
				'DashboardConstructorControlComponentDialogController as vm',
			editorTemplateUrl:
				'views/dialogs/dashboard-constructor/dashboard-constructor-control-component-dialog-view.html',
		},
		accordion: {
			editorController:
				'DashboardConstructorAccordionComponentDialogController as vm',
			editorTemplateUrl:
				'views/dialogs/dashboard-constructor/dashboard-constructor-accordion-component-dialog-view.html',
		},
		report_viewer: {
			editorController:
				'DashboardConstructorReportViewerComponentDialogController as vm',
			editorTemplateUrl:
				'views/dialogs/dashboard-constructor/dashboard-constructor-report-viewer-component-dialog-view.html',
		},
		report_viewer_split_panel: {
			// for legacy dashboard layouts
			editorController:
				'DashboardConstructorReportViewerComponentDialogController as vm',
			editorTemplateUrl:
				'views/dialogs/dashboard-constructor/dashboard-constructor-report-viewer-component-dialog-view.html',
		},
		/*report_viewer_split_panel: {
                editorController: 'DashboardConstructorReportViewerSplitPanelComponentDialogController as vm',
                editorTemplateUrl: 'views/dialogs/dashboard-constructor/dashboard-constructor-report-viewer-split-panel-component-dialog-view.html'
            },*/
		report_viewer_grand_total: {
			editorController:
				'DashboardConstructorReportViewerGrandTotalComponentDialogController as vm',
			editorTemplateUrl:
				'views/dialogs/dashboard-constructor/dashboard-constructor-report-viewer-grand-total-component-dialog-view.html',
		},
		report_viewer_bars_chart: {
			editorController:
				'DashboardConstructorReportViewerChartsComponentDialogController as vm',
			editorTemplateUrl:
				'views/dialogs/dashboard-constructor/dashboard-constructor-report-viewer-charts-component-dialog-view.html',
		},
		report_viewer_pie_chart: {
			editorController:
				'DashboardConstructorReportViewerChartsComponentDialogController as vm',
			editorTemplateUrl:
				'views/dialogs/dashboard-constructor/dashboard-constructor-report-viewer-charts-component-dialog-view.html',
		},
		report_viewer_table_chart: {
			editorController:
				'DashboardConstructorReportViewerTableChartComponentDialogController as vm',
			editorTemplateUrl:
				'views/dialogs/dashboard-constructor/dashboard-constructor-report-viewer-table-chart-component-dialog-view.html',
		},
		report_viewer_matrix: {
			editorController:
				'DashboardConstructorReportViewerMatrixComponentDialogController as vm',
			editorTemplateUrl:
				'views/dialogs/dashboard-constructor/dashboard-constructor-report-viewer-matrix-component-dialog-view.html',
		},
		entity_viewer: {
			editorController:
				'DashboardConstructorEntityViewerComponentDialogController as vm',
			editorTemplateUrl:
				'views/dialogs/dashboard-constructor/dashboard-constructor-entity-viewer-component-dialog-view.html',
		},
		entity_viewer_split_panel: {
			editorController:
				'DashboardConstructorEntityViewerSplitPanelComponentDialogController as vm',
			editorTemplateUrl:
				'views/dialogs/dashboard-constructor/dashboard-constructor-entity-viewer-split-panel-component-dialog-view.html',
		},
		button_set: {
			editorController:
				'DashboardConstructorButtonSetComponentDialogController as vm',
			editorTemplateUrl:
				'views/dialogs/dashboard-constructor/dashboard-constructor-button-set-component-dialog-view.html',
		},
		input_form: {
			editorController:
				'DashboardConstructorInputFormComponentDialogController as vm',
			editorTemplateUrl:
				'views/dialogs/dashboard-constructor/dashboard-constructor-input-form-component-dialog-view.html',
		},
		superset_dashboard: {
			editorController:
				'DashboardConstructorSupersetDashboardComponentDialogController as vm',
			editorTemplateUrl:
				'views/dialogs/dashboard-constructor/dashboard-constructor-superset-dashboard-component-dialog-view.html',
		},
		finmars_widget: {
			editorController:
				'DashboardConstructorFinmarsWidgetComponentDialogController as vm',
			editorTemplateUrl:
				'views/dialogs/dashboard-constructor/dashboard-constructor-finmars-widget-component-dialog-view.html',
		},
	}

	vm.createComponent = function (componentType, $event) {
		$mdDialog
			.show({
				controller:
					dashboardComponentsTypesData[componentType].editorController,
				templateUrl:
					dashboardComponentsTypesData[componentType].editorTemplateUrl,
				targetEvent: $event,
				multiple: true,
				autoWrap: true,
				skipHide: true,
				locals: {
					item: null,
					dataService: vm.dashboardConstructorDataService,
					eventService: vm.dashboardConstructorEventService,
					attributeDataService: vm.attributeDataService,
					data: {},
				},
			})
			.then(function (res) {
				vm.dashboardConstructorEventService.dispatchEvent(
					dashboardConstructorEvents.UPDATE_DASHBOARD_CONSTRUCTOR
				)
			})
	}

	var openComponentImportDialog = function (ev, dashboardsComponents) {
		$mdDialog
			.show({
				controller: 'ItemsSelectorWithGroupsDialogController as vm',
				templateUrl:
					'views/dialogs/selectors/items-selector-with-groups-dialog-view.html',
				targetEvent: ev,
				multiple: true,
				locals: {
					data: {
						groups: dashboardsComponents,
						title: 'Select component types to import',
						options: {
							multiselector: true,
						},
					},
				},
			})
			.then(function (res) {
				if (res.status === 'agree' && res.data.selected.length) {
					var components = vm.dashboardConstructorDataService.getComponents()
					var coppiedComponents = []

					/* res.data.selectedItems.forEach(function (selLayout) { // find corresponding dashboard layout

                        var i, a;
                        for (i = 0; i < dashboardLayouts.length; i++) {

                            var dLayout = dashboardLayouts[i];

                            if (dLayout.id === selLayout.id) {

                                selLayout.content.forEach(function (selComp) { // find corresponding component type

                                    for (a = 0; a < dLayout.data.components_types.length; a++) {

                                        var compType = dLayout.data.components_types[a];

                                        if (compType.id === selComp.id) {

                                            var selCompCopy = JSON.parse(JSON.stringify(selComp));
                                            delete selCompCopy.id;
                                            selCompCopy.name = selCompCopy.name + ' (copied from ' + dLayout.name + ')';

                                            components.push(selCompCopy);
                                            coppiedComponents.push(selCompCopy);
                                            break;

                                        }

                                    }

                                });

                                break;
                            }

                        }

                    }); */

					res.data.selected.forEach(function (selItem) {
						var compIdPattern = new Date().getTime() + '_' + components.length
						selItem.itemData.id =
							vm.dashboardConstructorDataService.___generateId(compIdPattern)

						components.push(selItem.itemData)
						coppiedComponents.push(selItem.itemData)
					})

					vm.dashboardConstructorDataService.setComponents(components)
					vm.dashboardConstructorEventService.dispatchEvent(
						dashboardConstructorEvents.UPDATE_DASHBOARD_CONSTRUCTOR
					)
				}
			})
	}

	var formatLayoutsComponentsForSelector = function (dashboardLayouts) {
		var dashboardsComponents = []

		dashboardLayouts.forEach(function (dLayout, dLayoutIndex) {
			var group = {
				id: dLayout.id,
				name: dLayout.name,
				content: [],
			}

			dLayout.data.components_types.forEach(function (compType) {
				var itemName = compType.name + ': ' + vm.getVerboseType(compType)
				var compCopy = JSON.parse(JSON.stringify(compType))

				delete compCopy.id
				compCopy.settings.linked_components = {}
				compCopy.name =
					compCopy.name + ' (copied from dashboard: ' + dLayout.name + ')'

				var item = {
					id: compType.id,
					name: itemName,
					itemData: compCopy,
				}

				group.content.push(item)
			})

			dashboardsComponents.push(group)
		})

		return dashboardsComponents
	}

	vm.importComponent = function ($event) {
		/*if (dashboardsComponents && dashboardsComponents.length) {
                openComponentImportDialog($event, dashboardsComponents);

            } else {

                uiService.getDashboardLayoutList().then(function (data) {

                    var dashboardLayouts = data.results;

                    formatLayoutsComponentsForSelector(dashboardLayouts);
                    console.log("components import dashboardsComponents", dashboardsComponents);
                    openComponentImportDialog($event, dashboardsComponents);

                });

            }*/

		uiService.getDashboardLayoutList().then(function (data) {
			var dashboardLayouts = data.results
			var dashboardsComponents =
				formatLayoutsComponentsForSelector(dashboardLayouts)

			openComponentImportDialog($event, dashboardsComponents, dashboardLayouts)
		})
	}

	vm.editComponentType = function ($event, item) {
		$mdDialog
			.show({
				controller: dashboardComponentsTypesData[item.type].editorController,
				templateUrl: dashboardComponentsTypesData[item.type].editorTemplateUrl,
				targetEvent: $event,
				multiple: true,
				autoWrap: true,
				skipHide: true,
				locals: {
					item: JSON.parse(JSON.stringify(item)),
					dataService: vm.dashboardConstructorDataService,
					eventService: vm.dashboardConstructorEventService,
					attributeDataService: vm.attributeDataService,
					data: {},
				},
			})
			.then(function (value) {
				vm.dashboardConstructorEventService.dispatchEvent(
					dashboardConstructorEvents.UPDATE_DASHBOARD_CONSTRUCTOR
				)
			})
	}

	vm.deleteComponentType = function ($event, item) {
		$mdDialog
			.show({
				controller: 'WarningDialogController as vm',
				templateUrl: 'views/dialogs/warning-dialog-view.html',
				targetEvent: $event,
				autoWrap: true,
				skipHide: true,
				multiple: true,
				locals: {
					warning: {
						title: 'Warning!',
						description:
							'Are you sure you want to delete Component ' + item.name + '?',
					},
				},
			})
			.then(function (res) {
				if (res.status === 'agree') {
					/*var componentTypes = vm.dashboardConstructorDataService.getComponents();

                    componentTypes = componentTypes.filter(function (componentType) {
                        return componentType.id !== item.id;
                    });

                    vm.dashboardConstructorDataService.setComponents(componentTypes);*/

					vm.dashboardConstructorDataService.deleteComponentById(item.id)

					vm.dashboardConstructorEventService.dispatchEvent(
						dashboardConstructorEvents.UPDATE_DASHBOARD_CONSTRUCTOR
					)
				}
			})
	}

	// Components Types Section End

	vm.initEventListeners = function () {
		vm.dashboardConstructorEventService.addEventListener(
			dashboardConstructorEvents.UPDATE_DASHBOARD_CONSTRUCTOR,
			function () {
				console.log('here?')

				vm.layout = vm.dashboardConstructorDataService.getData()

				vm.updateAvailableComponentsTypes()
				vm.updateDrakeContainers()
			}
		)
	}

	vm.downloadAttributes = function () {
		var promises = []

		promises.push(
			vm.attributeDataService.downloadCustomFieldsByEntityType('balance-report')
		)
		promises.push(
			vm.attributeDataService.downloadCustomFieldsByEntityType('pl-report')
		)
		promises.push(
			vm.attributeDataService.downloadCustomFieldsByEntityType(
				'transaction-report'
			)
		)

		promises.push(
			vm.attributeDataService.downloadDynamicAttributesByEntityType('portfolio')
		)
		promises.push(
			vm.attributeDataService.downloadDynamicAttributesByEntityType('account')
		)
		promises.push(
			vm.attributeDataService.downloadDynamicAttributesByEntityType(
				'instrument'
			)
		)
		promises.push(
			vm.attributeDataService.downloadDynamicAttributesByEntityType(
				'responsible'
			)
		)
		promises.push(
			vm.attributeDataService.downloadDynamicAttributesByEntityType(
				'counterparty'
			)
		)
		promises.push(
			vm.attributeDataService.downloadDynamicAttributesByEntityType(
				'transaction-type'
			)
		)
		promises.push(
			vm.attributeDataService.downloadDynamicAttributesByEntityType(
				'complex-transaction'
			)
		)

		var idAttribute = {
			key: 'id',
			name: 'Id',
			value_type: 20,
		}

		vm.attributeDataService.appendEntityAttribute(
			'portfolio',
			Object.assign({}, idAttribute)
		)
		vm.attributeDataService.appendEntityAttribute(
			'account',
			Object.assign({}, idAttribute)
		)
		vm.attributeDataService.appendEntityAttribute(
			'currency',
			Object.assign({}, idAttribute)
		)
		vm.attributeDataService.appendEntityAttribute(
			'instrument',
			Object.assign({}, idAttribute)
		)
		vm.attributeDataService.appendEntityAttribute(
			'responsible',
			Object.assign({}, idAttribute)
		)
		vm.attributeDataService.appendEntityAttribute(
			'counterparty',
			Object.assign({}, idAttribute)
		)
		vm.attributeDataService.appendEntityAttribute(
			'transaction-type',
			Object.assign({}, idAttribute)
		)
		vm.attributeDataService.appendEntityAttribute(
			'complex-transaction',
			Object.assign({}, idAttribute)
		)

		Promise.all(promises).then(function (data) {
			vm.readyStatus.attributes = true
			$scope.$apply()
		})
	}

	// DEPRECATED SINCE 01.2021
	vm.clearProxyAccordions = function (layout) {
		layout.data.tabs.forEach(function (tab) {
			if (tab.accordions) {
				tab.accordions = tab.accordions.filter(function (item) {
					return item.type === 'accordion'
				})

				tab.accordions.forEach(function (accordion) {
					delete accordion.type
				})
			}
		})
	}

	// DEPRECATED SINCE 01.2021
	vm.updateProxyAccordions = function () {
		vm.layout.data.tabs.forEach(function (tab) {
			if (tab.accordions) {
				var newAccordions = []

				tab.accordions.forEach(function (accordion) {
					accordion.type = 'accordion'
				})

				tab.layout.rows.forEach(function (row, index) {
					var isEmpty = true
					var findedAccordion = null

					tab.accordions.forEach(function (accordion) {
						if (index >= accordion.from && index <= accordion.to) {
							isEmpty = false

							if (index !== accordion.from) {
								findedAccordion = {
									type: 'proxy',
								}
							} else {
								findedAccordion = accordion
							}
						}
					})

					if (isEmpty) {
						newAccordions.push({
							type: 'proxy',
						})
					} else {
						newAccordions.push(findedAccordion)
					}
				})

				tab.accordions = newAccordions
			}
		})
	}

	// DEPRECATED SINCE 01.2021
	vm.isAccordionOverlapped = function (index, tab) {
		var overlappedIndexes = []

		tab.accordions.forEach(function (accordionItem) {
			for (var i = accordionItem.from; i <= accordionItem.to; i = i + 1) {
				overlappedIndexes.push(i)
			}
		})

		if (overlappedIndexes.indexOf(index) !== -1) {
			return true
		}

		return false
	}

	vm.init = function () {
		vm.dashboardConstructorDataService = new DashboardConstructorDataService()
		vm.dashboardConstructorEventService = new DashboardConstructorEventService()

		vm.attributeDataService = new AttributeDataService(
			metaContentTypesService,
			customFieldService,
			attributeTypeService,
			uiService
		)

		vm.downloadAttributes()

		vm.initEventListeners()

		if ($stateParams.id && $stateParams.id !== 'new') {
			vm.layout.id = $stateParams.id

			vm.getLayout()
		} else {
			vm.updateProxyAccordions()

			vm.dashboardConstructorDataService.setData(vm.layout)
			vm.dashboardConstructorDataService.setComponents(
				vm.layout.data.components_types
			)

			vm.readyStatus.data = true

			vm.dashboardConstructorEventService.dispatchEvent(
				dashboardConstructorEvents.UPDATE_GRID_CELLS_SIZE
			)

			setTimeout(function () {
				// vm.initDragAndDrop();
				vm.dragAndDrop.init()
			}, 500)

			console.log('vm.layout', vm.layout)
		}
	}

	vm.init()

	$scope.$on('$destroy', function () {
		vm.dragAndDrop.destroy()
	})
}
