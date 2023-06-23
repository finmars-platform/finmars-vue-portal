/**
 /**
 * Created by szhitenev on 05.05.2016.
 */

import evEvents from '../../services/entityViewerEvents'
import evHelperService from '../../services/entityViewerHelperService'

import EntityViewerDataService from '../../services/entityViewerDataService'
import EntityViewerEventService from '../../services/eventService'
import AttributeDataService from '../../services/attributeDataService'

import importTransactionService from '../../services/import/importTransactionService'

import baseUrlService from '../../services/baseUrlService'

var baseUrl = baseUrlService.resolve()

export default function (
	$scope,
	$mdDialog,
	$transitions,
	metaContentTypesService,
	customFieldService,
	attributeTypeService,
	uiService,
	reconDataProviderService,
	parentEntityViewerDataService,
	parentEntityViewerEventService,
	splitPanelExchangeService
) {
	var vm = this

	console.log('Vertical Split Panel Report Viewer Controller init')

	console.log('parentEntityViewerDataService', parentEntityViewerDataService)
	console.log('parentEntityViewerEventService', parentEntityViewerEventService)

	// vm.readyStatus = {
	//     attributes: false,
	// };

	vm.entityViewerDataService = null
	vm.entityViewerEventService = null

	vm.reconciliationData = null // Needed because of evDataService.resetData;

	vm.matchAvailable = false

	vm.config = {
		delimiter: ',',
		mode: 1,
		missing_data_handler: 'throw_error',
		error_handling: 'break',
	}

	var horizontalSpIsActive

	vm.bookSelected = function () {
		console.log('Book Selected!')

		var flatList = vm.entityViewerDataService.getFlatList()

		var selectedRows = flatList.filter(function (item) {
			return item.___is_activated
		})

		console.log('selectedRows', selectedRows)

		var fileText = []

		vm.parsedFile = vm.entityViewerDataService.getReconciliationFile()

		console.log('vm.parsedFile', vm.parsedFile)

		fileText.push(vm.parsedFile[0]) // header;

		selectedRows.forEach(function (item) {
			fileText.push(vm.parsedFile[item.___file_index])
		})

		fileText = fileText.join('\n')

		console.log('file', fileText)

		var file = new File([fileText], 'tmp.csv', { type: 'text/plain' })

		var event = new Event('click')

		console.log('vm.reconciliationImportConfig', vm.reconciliationImportConfig)

		vm.config = Object.assign({}, vm.reconciliationImportConfig)
		vm.config.file = file
		delete vm.config.task_id

		vm.loadSelected(event)
	}

	vm.getFileUrl = function (id) {
		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return (
			baseUrl +
			'/' +
			prefix +
			'/' +
			apiVersion +
			'/' +
			'file-reports/file-report/' +
			id +
			'/view/'
		)
	}

	vm.loadSelected = function ($event) {
		vm.processing = true

		var formData = new FormData()

		if (vm.config.task_id) {
			formData.append('task_id', vm.config.task_id)
		} else {
			formData.append('file', vm.config.file)
			formData.append('scheme', vm.config.scheme)
			formData.append('error_handling', vm.config.error_handling)
			formData.append('delimiter', vm.config.delimiter)
			formData.append('missing_data_handler', vm.config.missing_data_handler)

			vm.fileLocal = vm.config.local
		}

		importTransactionService.startImport(formData).then(function (data) {
			console.log('data', data)

			vm.config = data

			vm.loaderData = {
				current: vm.config.processed_rows,
				total: vm.config.total_rows,
				text: 'Import Progress:',
				status: vm.config.task_status,
			}

			$scope.$apply()

			if (vm.config.task_status === 'SUCCESS') {
				var error_rows = data.error_rows.filter(function (item) {
					return item.level === 'error'
				})

				var description = ''

				if (!data.total_rows && error_rows.length === 0) {
					$mdDialog.show({
						controller: 'SuccessDialogController as vm',
						templateUrl: 'views/dialogs/success-dialog-view.html',
						targetEvent: $event,
						preserveScope: true,
						multiple: true,
						autoWrap: true,
						skipHide: true,
						locals: {
							success: {
								title: 'Warning',
								description: 'Nothing to import, check file format!',
							},
						},
					})
				} else {
					if (vm.config.error_handling === 'break') {
						if (data.error_row_index) {
							description =
								'<div>' +
								'<div>Rows total: ' +
								data.total_rows +
								'</div>' +
								'<div>Rows success import: ' +
								(data.error_row_index - 1) +
								'</div>' +
								'<div>Rows fail import: ' +
								error_rows.length +
								'</div>' +
								'</div><br/>'
						} else {
							description =
								'<div>' +
								'<div>Rows total: ' +
								data.total_rows +
								'</div>' +
								'<div>Rows success import: ' +
								data.total_rows +
								'</div>' +
								'<div>Rows fail import: ' +
								error_rows.length +
								'</div>' +
								'</div><br/>'
						}
					}

					if (vm.config.error_handling === 'continue') {
						description =
							'<div>' +
							'<div>Rows total: ' +
							data.total_rows +
							'</div>' +
							'<div>Rows success import: ' +
							(data.total_rows - error_rows.length) +
							'</div>' +
							'<div>Rows fail import: ' +
							error_rows.length +
							'</div>' +
							'</div><br/>'
					}

					description =
						description +
						'<div> You have successfully imported transactions file </div>'

					description =
						description +
						'<div><a href="' +
						vm.getFileUrl(data.stats_file_report) +
						'" download>Download Report File</a></div>'

					$mdDialog.show({
						controller: 'SuccessDialogController as vm',
						templateUrl: 'views/dialogs/success-dialog-view.html',
						targetEvent: $event,
						preserveScope: true,
						multiple: true,
						autoWrap: true,
						skipHide: true,
						locals: {
							success: {
								title: 'Success',
								description: description,
							},
						},
					})
				}

				vm.processing = false
				vm.dataIsImported = true
			} else {
				setTimeout(function () {
					vm.loadSelected($event)
				}, 1000)
			}
		})
	}

	vm.setEventListeners = function () {
		parentEntityViewerEventService.addEventListener(
			evEvents.ACTIVE_OBJECT_CHANGE,
			function () {
				var activeObject = parentEntityViewerDataService.getActiveObject()
				var columns = parentEntityViewerDataService.getColumns()

				vm.entityViewerDataService.setActiveObjectFromAbove(activeObject)
				vm.entityViewerDataService.setAttributesFromAbove(columns)

				vm.entityViewerEventService.dispatchEvent(
					evEvents.ACTIVE_OBJECT_FROM_ABOVE_CHANGE
				)
			}
		)

		parentEntityViewerEventService.addEventListener(
			evEvents.ADDITIONS_CHANGE,
			function () {
				horizontalSpIsActive =
					parentEntityViewerDataService.isSplitPanelActive()

				var parentInterfaceLayout =
					parentEntityViewerDataService.getInterfaceLayout()
				var interfaceLayout = vm.entityViewerDataService.getInterfaceLayout()

				interfaceLayout.splitPanel = Object.assign(
					{},
					parentInterfaceLayout.splitPanel
				)

				vm.entityViewerDataService.setInterfaceLayout(interfaceLayout)

				vm.entityViewerDataService.setSplitPanelStatus(horizontalSpIsActive)
			}
		)

		parentEntityViewerEventService.addEventListener(
			evEvents.UPDATE_SPLIT_PANEL_TABLE_VIEWPORT,
			function () {
				if (horizontalSpIsActive) {
					var parentInterfaceLayout =
						parentEntityViewerDataService.getInterfaceLayout()
					var interfaceLayout = vm.entityViewerDataService.getInterfaceLayout()

					interfaceLayout.splitPanel = Object.assign(
						{},
						parentInterfaceLayout.splitPanel
					)

					vm.entityViewerDataService.setInterfaceLayout(interfaceLayout)
				}

				vm.entityViewerEventService.dispatchEvent(
					evEvents.UPDATE_TABLE_VIEWPORT
				)
			}
		)

		parentEntityViewerEventService.addEventListener(
			evEvents.TOGGLE_FILTER_AREA,
			function () {
				vm.entityViewerEventService.dispatchEvent(
					evEvents.UPDATE_FILTER_AREA_SIZE
				)
			}
		)

		vm.entityViewerEventService.addEventListener(
			evEvents.RECON_BOOK_SELECTED,
			function () {
				vm.bookSelected()
			}
		)

		vm.entityViewerEventService.addEventListener(
			evEvents.ACTIVE_OBJECT_CHANGE,
			function () {
				var activeObject = vm.entityViewerDataService.getActiveObject()
				var action = vm.entityViewerDataService.getActiveObjectAction()

				if (activeObject) {
					if (action === 'recon_view_bank_file_line') {
						$mdDialog
							.show({
								controller: 'ReconMatchViewLineDialogController as vm',
								templateUrl:
									'views/dialogs/reconciliation/recon-match-view-line-dialog-view.html',
								parent: angular.element(document.body),
								targetEvent: activeObject.event,
								clickOutsideToClose: false,
								locals: {
									data: {
										item: activeObject,
									},
								},
								preserveScope: true,
								autoWrap: true,
								skipHide: true,
								multiple: true,
							})
							.then(function (res) {
								/* vm.entityViewerDataService.setActiveObjectAction(null);
                                vm.entityViewerDataService.setActiveObjectActionData(null); */
								vm.entityViewerDataService.setRowsActionData(null)
							})
					}

					if (action === 'recon_book_selected') {
						vm.bookSelected()
					}

					if (action === 'recon_hide') {
						var reconciliationData =
							vm.entityViewerDataService.getReconciliationData()

						/* console.log('activeObject', activeObject);
                            console.log('reconciliationData', reconciliationData); */

						reconciliationData = reconciliationData.filter(function (item) {
							return item.source_id !== activeObject.source_id
						})

						vm.reconciliationData = reconciliationData

						vm.entityViewerDataService.setReconciliationData(reconciliationData)

						reconDataProviderService.processData(
							vm.entityViewerDataService,
							vm.entityViewerEventService
						)
					}
				}
			}
		)

		vm.entityViewerEventService.addEventListener(
			evEvents.UPDATE_TABLE,
			function () {
				console.log('vm.reconciliationData', vm.reconciliationData)

				vm.entityViewerDataService.setReconciliationData(vm.reconciliationData) // needed because on GroupChange we do evDataService.resetData

				// reconDataProviderService.updateDataStructure(vm.entityViewerDataService, vm.entityViewerEventService);
				reconDataProviderService.createDataStructure(
					vm.entityViewerDataService,
					vm.entityViewerEventService
				)
			}
		)

		vm.entityViewerEventService.addEventListener(
			evEvents.COLUMN_SORT_CHANGE,
			function () {
				reconDataProviderService.sortObjects(
					vm.entityViewerDataService,
					vm.entityViewerEventService
				)
			}
		)

		vm.entityViewerEventService.addEventListener(
			evEvents.GROUP_TYPE_SORT_CHANGE,
			function () {
				reconDataProviderService.sortGroupType(
					vm.entityViewerDataService,
					vm.entityViewerEventService
				)
			}
		)

		vm.entityViewerEventService.addEventListener(
			evEvents.REQUEST_REPORT,
			function () {
				reconDataProviderService.processData(
					vm.entityViewerDataService,
					vm.entityViewerEventService
				)
			}
		)

		vm.entityViewerEventService.addEventListener(
			evEvents.LIST_LAYOUT_CHANGE,
			function () {
				var spActiveLayout =
					vm.entityViewerDataService.getSplitPanelLayoutToOpen()
				parentEntityViewerDataService.setSplitPanelLayoutToOpen(spActiveLayout)

				vm.getView()
			}
		)

		vm.entityViewerEventService.addEventListener(
			evEvents.SPLIT_PANEL_DEFAULT_LIST_LAYOUT_CHANGED,
			function () {
				var spDefaultLayout =
					vm.entityViewerDataService.getSplitPanelDefaultLayout()
				var additions = parentEntityViewerDataService.getAdditions()
				additions.layoutData.layoutId = spDefaultLayout
				parentEntityViewerDataService.setAdditions(additions)
			}
		)

		// Events that dispatch events inside parent
		vm.entityViewerEventService.addEventListener(
			evEvents.TOGGLE_FILTER_AREA,
			function () {
				parentEntityViewerEventService.dispatchEvent(
					evEvents.UPDATE_FILTER_AREA_SIZE
				)
			}
		)

		vm.entityViewerEventService.addEventListener(
			evEvents.RECON_TOGGLE_MATCH_EDITOR,
			function () {
				parentEntityViewerEventService.dispatchEvent(
					evEvents.RECON_TOGGLE_MATCH_EDITOR
				)
			}
		)
	}

	/* var getLayoutChanges = function () {
                var activeLayoutConfig = vm.entityViewerDataService.getActiveLayoutConfiguration();

                if (activeLayoutConfig && activeLayoutConfig.data) {
                    var currentLayoutConfig = vm.entityViewerDataService.getLayoutCurrentConfiguration(true);

                    if (!evHelperService.checkForLayoutConfigurationChanges(activeLayoutConfig, currentLayoutConfig, true)) {
                        return currentLayoutConfig;
                    }

                }

                return false
            };

            splitPanelExchangeService.setSplitPanelLayoutChangesCheckFn(getLayoutChanges); */

	vm.getView = function () {
		// middlewareService.setNewSplitPanelLayoutName(false); // reset split panel layout name

		// vm.readyStatus.layout = false;

		vm.entityViewerDataService = new EntityViewerDataService()
		vm.entityViewerEventService = new EntityViewerEventService()
		vm.attributeDataService = new AttributeDataService(
			metaContentTypesService,
			customFieldService,
			attributeTypeService,
			uiService
		)

		parentEntityViewerDataService.setReconciliationDataService(
			vm.entityViewerDataService
		)
		parentEntityViewerDataService.setReconciliationEventService(
			vm.entityViewerEventService
		)

		vm.entityViewerDataService.setParentDataService(
			parentEntityViewerDataService
		)
		vm.entityViewerDataService.setParentEventService(
			parentEntityViewerEventService
		)

		console.log('scope, ', $scope)

		vm.entityType = 'reconciliation'

		vm.entityViewerDataService.setEntityType(vm.entityType)
		vm.entityViewerDataService.setRootEntityViewer(false)
		vm.entityViewerDataService.setIsReport(false)
		vm.entityViewerDataService.setViewContext('reconciliation_viewer')
		vm.entityViewerDataService.setVirtualScrollStep(500)

		vm.entityViewerDataService.setRowHeight(36)

		var components = {
			columnArea: true,
			viewer: true,
			sidebar: true,
			groupingArea: true,
			columnAreaHeader: true,
			splitPanel: false,
			addEntityBtn: false,
			fieldManagerBtn: true,
			layoutManager: false,
			autoReportRequest: false,
		}

		vm.entityViewerDataService.setComponents(components)

		horizontalSpIsActive = parentEntityViewerDataService.isSplitPanelActive()
		vm.entityViewerDataService.setSplitPanelStatus(horizontalSpIsActive)

		var reconciliationData =
			parentEntityViewerDataService.getReconciliationData()
		var reconciliationImportConfig =
			parentEntityViewerDataService.getReconciliationImportConfig()
		var reconciliationFile =
			parentEntityViewerDataService.getReconciliationFile()

		vm.reconciliationData = JSON.parse(JSON.stringify(reconciliationData))
		vm.reconciliationImportConfig = JSON.parse(
			JSON.stringify(reconciliationImportConfig)
		)

		vm.entityViewerDataService.setReconciliationData(reconciliationData)
		vm.entityViewerDataService.setReconciliationFile(reconciliationFile)
		vm.entityViewerDataService.setReconciliationImportConfig(
			reconciliationImportConfig
		)

		console.log('Get View Vertical panel?', reconciliationData)

		var config = vm.entityViewerDataService.getReconciliationImportConfig()

		var scheme = config.scheme_object

		if (scheme.recon_layout) {
			var columns = scheme.recon_layout.data.columns
			var groups = scheme.recon_layout.data.grouping
			var filters = scheme.recon_layout.data.filters

			var attributes = JSON.parse(JSON.stringify(columns)) // prevent creation of reference to columns object
			vm.attributeDataService.setReconciliationAttributes(attributes)
			vm.entityViewerDataService.setColumns(columns)
			vm.entityViewerDataService.setGroups(groups)
			vm.entityViewerDataService.setFilters(filters)
		} else {
			var columns = []

			if (reconciliationData.length) {
				Object.keys(reconciliationData[0]).forEach(function (key) {
					var col = {}
					col.key = key
					col.name = key
					col.value_type = 10

					columns.push(col)
				})
			}

			var attributes = JSON.parse(JSON.stringify(columns)) // prevent creation of reference to columns object
			vm.attributeDataService.setReconciliationAttributes(attributes)
			vm.entityViewerDataService.setColumns(columns)
		}

		vm.setEventListeners()

		reconDataProviderService.processData(
			vm.entityViewerDataService,
			vm.entityViewerEventService
		)
	}

	vm.init = function () {
		vm.getView()
	}

	vm.init()
}
