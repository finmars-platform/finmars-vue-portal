/**
 /**
 * Created by szhitenev on 05.05.2016.
 */

import AutosaveLayoutService from '@/angular/services/autosaveLayoutService'
import evHelperService from '@/angular/services/entityViewerHelperService'
import entityResolverService from '@/angular/services/entityResolverService'
import uiService from '@/angular/services/uiService'
import instrumentService from '@/angular/services/instrumentService'

import localStorageService from '@/angular/shell/scripts/app/services/localStorageService'
import evEvents from '@/angular/services/entityViewerEvents'

import complexTransactionService from '@/angular/services/transaction/complexTransactionService'

import EntityViewerDataService from '@/angular/services/entityViewerDataService'
import EntityViewerEventService from '@/angular/services/eventService'
import SplitPanelExchangeService from '@/angular/services/groupTable/exchangeWithSplitPanelService'
import AttributeDataService from '@/angular/services/attributeDataService'

import evDataProviderService from '@/angular/services/ev-data-provider/ev-data-provider.service'

import evRvLayoutsHelperInst from '../../helpers/evRvLayoutsHelper'
import globalDataServiceInst from '../../shell/scripts/app/services/globalDataService'
import middlewareServiceInst from '../../shell/scripts/app/services/middlewareService'

// portal.controller('EntityViewerController', [
// 	'$scope',
// 	'$mdDialog',
// 	'$state',
// 	'$transitions',
// 	'$urlService',
// 	'$customDialog',
// 	'$bigDrawer',
// 	'middlewareService',
// 	'globalDataService',
// 	'toastNotificationService',
// 	'metaContentTypesService',
// 	'instrumentService',
// 	'customFieldService',
// 	'attributeTypeService',
// 	'entityResolverService',
// 	'uiService',
// 	'evRvLayoutsHelper',
// 	require('./app/controllers/entityViewer/entityViewerController'),
// ])

export default function (
	$state,
	$transitions,
	$urlService,
	$customDialog,
	$bigDrawer,
	toastNotificationService,
	metaContentTypesService,
	instrumentService,
	customFieldService,
	attributeTypeService,
	entityResolverService,
	uiService
) {
	var vm = this

	let evRvLayoutsHelper = new evRvLayoutsHelperInst()
	let globalDataService = new globalDataServiceInst()
	let middlewareService = new middlewareServiceInst()

	var checkLayoutChanges = true

	vm.readyStatus = {
		attributes: false,
		layout: false,
	}

	var onLogoutIndex, onUserChangeIndex

	vm.stateWithLayout =
		evRvLayoutsHelper.statesWithLayouts.indexOf($state.current.name) !== -1

	var deregisterOnBeforeTransitionHook
	var autosaveLayoutService
	var autosaveLayoutOn = globalDataService.isAutosaveLayoutOn()

	// $customDialog.show({
	//     controller: 'LoaderDialogController as vm',
	//     templateUrl: 'views/dialogs/loader-dialog-view.html',
	//     locals: {
	//         data: {}
	//     }
	// }).then(function (data) {
	//
	//     console.log('Resolved??', data);
	//
	// });

	var editEntity = async function (entityType, actionData) {
		/* var entitiesWithEditLayout = [
					'instrument',
					'portfolio',
					'account',
					'counterparty',
					'responsible',
					'currency',
					'strategy-1',
					'strategy-2',
					'strategy-3',
					'account-type',
					'instrument-type',
					'pricing-policy',
					'transaction',
					'complex-transaction'
				]; */
		let editLayout, dialogOptions
		switch (entityType) {
			case 'transaction-type':
				editLayout = await uiService.getDefaultEditLayout(vm.entityType)
				evHelperService.openTTypeEditDrawer(
					vm.entityViewerDataService,
					vm.entityViewerEventService,
					editLayout,
					$bigDrawer,
					entityType,
					actionData.object.id
				)
				break

			case 'instrument-type':
				editLayout = await uiService.getDefaultEditLayout(vm.entityType)
				evHelperService.openInstrumentTypeEditDrawer(
					vm.entityViewerDataService,
					vm.entityViewerEventService,
					editLayout,
					$bigDrawer,
					entityType,
					actionData.object.id
				)
				break

			case 'complex-transaction':
				/* // Waiting for transaction type to load add big delay

						const ttypeId = activeObject.transaction_type_object.id;

						try {
							const transactionType = await transactionTypeService.getByKey(ttypeId);
							editLayout = {results: [transactionType.book_transaction_layout]};

						} catch (error) {
							console.error('editEntity() transactionType with id: ' + ttypeId + ' not found');
						} */

				evHelperService.openComplexTransactionEditDrawer(
					vm.entityViewerDataService,
					vm.entityViewerEventService,
					$bigDrawer,
					actionData.object.id
				)

				/*						$bigDrawer.show({
							controller: 'ComplexTransactionEditDialogController as vm',
							templateUrl: 'views/entity-viewer/complex-transaction-edit-drawer-view.html',
							locals: {
								entityType: entityType,
								entityId: activeObject.id,
								data: {
									openedIn: 'big-drawer'
								}
							}

						}).then(function (res) {

							vm.entityViewerDataService.setActiveObjectAction(null);
							vm.entityViewerDataService.setActiveObjectActionData(null);

							if (res && res.res === 'agree') {

								if (res.data.action === 'delete') {

                                    evHelperService.updateTableAfterEntitiesDeletion(vm, [activeObject.id]);

								} else {

									var objects = vm.entityViewerDataService.getObjects();

									objects.forEach(function (obj) {

										if (res.data.complex_transaction.id === obj.id) {

											Object.keys(res.data.complex_transaction).forEach(function (key) {

												obj[key] = res.data.complex_transaction[key]

											});

											vm.entityViewerDataService.setObject(obj);

										}

									});

									vm.entityViewerEventService.dispatchEvent(evEvents.REDRAW_TABLE);

								}

							} else if (res && res.status === 'disagree' &&
								res.data && res.data.updateRowIcon) {

								var tIsLocked = res.data.updateRowIcon.is_locked;
								var tIsCanceled = res.data.updateRowIcon.is_canceled;
								var activeObject = vm.entityViewerDataService.getActiveObject();
								var transactionObj = vm.entityViewerDataService.getObject(activeObject.___id, activeObject.___parentId);

								transactionObj.is_locked = tIsLocked;
								transactionObj.is_canceled = tIsCanceled;
								vm.entityViewerDataService.setObject(transactionObj);

								vm.entityViewerEventService.dispatchEvent(evEvents.UPDATE_PROJECTION);
							}

						});*/

				break

			case 'price-history-error':
				dialogOptions = {
					controller: 'PriceHistoryErrorEditDialogController as vm',
					templateUrl:
						'views/entity-viewer/price-history-error-edit-dialog-view.html',
					parent: angular.element(document.body),
					targetEvent: actionData.event,
					locals: {
						entityId: actionData.object.id,
					},
				}

				if (actionData.event) dialogOptions.targetEvent = actionData.event

				$mdDialog.show(dialogOptions).then(function (res) {
					/*vm.entityViewerDataService.setActiveObjectAction(null);
							vm.entityViewerDataService.setActiveObjectActionData(null);*/
					vm.entityViewerDataService.setRowsActionData(null)

					if (res.status === 'agree') {
						var objects = vm.entityViewerDataService.getObjects()

						console.log('objects', objects)

						objects.forEach(function (obj) {
							if (res.data.ids.indexOf(obj.id) !== -1) {
								var parent = vm.entityViewerDataService.getData(obj.___parentId)

								parent.results = parent.results.filter(function (resultItem) {
									return res.data.ids.indexOf(resultItem.id) === -1
								})

								console.log('parent', parent)

								vm.entityViewerDataService.setData(parent)
							}
						})

						vm.entityViewerEventService.dispatchEvent(evEvents.REDRAW_TABLE)
					}
				})

				break

			case 'currency-history-error':
				dialogOptions = {
					controller: 'CurrencyHistoryErrorEditDialogController as vm',
					templateUrl:
						'views/entity-viewer/currency-history-error-edit-dialog-view.html',
					parent: angular.element(document.body),
					locals: {
						entityId: actionData.object.id,
					},
				}

				if (actionData.event) dialogOptions.targetEvent = actionData.event

				$mdDialog.show(dialogOptions).then(function (res) {
					/* vm.entityViewerDataService.setActiveObjectAction(null);
							vm.entityViewerDataService.setActiveObjectActionData(null); */
					vm.entityViewerDataService.setRowsActionData(null)

					if (res.status === 'agree') {
						var objects = vm.entityViewerDataService.getObjects()

						objects.forEach(function (obj) {
							if (res.data.ids.indexOf(obj.id) !== -1) {
								var parent = vm.entityViewerDataService.getData(obj.___parentId)

								parent.results = parent.results.filter(function (resultItem) {
									return res.data.ids.indexOf(resultItem.id) === -1
								})

								vm.entityViewerDataService.setData(parent)
							}
						})

						vm.entityViewerEventService.dispatchEvent(evEvents.REDRAW_TABLE)
					}
				})

				break

			default:
				// editLayout = await uiService.getDefaultEditLayout(vm.entityType);
				if (entityType === 'instrument') {
					editLayout = await instrumentService.getEditLayoutBasedOnUserCodes(
						actionData.object.instrument_type_object.instrument_form_layouts
					)
				} else {
					editLayout = await uiService.getDefaultEditLayout(entityType)
				}

				evHelperService.openEntityViewerEditDrawer(
					vm.entityViewerDataService,
					vm.entityViewerEventService,
					editLayout,
					$bigDrawer,
					entityType,
					actionData.object.id
				)

				/* var editLayout;

						if (entityType === 'instrument') {
							editLayout = await instrumentService.getEditLayoutBasedOnUserCodes(activeObject.instrument_type_object.instrument_form_layouts);

						} else {
							editLayout = await uiService.getDefaultEditLayout(entityType);
						}

						// editLayout = await uiService.getDefaultEditLayout(entityType);

						var bigDrawerWidthPercent;
						var fixedAreaColumns = 6;

						if (editLayout.results.length) {

							var tabs = Array.isArray(editLayout.results[0].data) ? editLayout.results[0].data : editLayout.results[0].data.tabs;

                            if (entityType !== 'instrument-type') {
                                fixedAreaColumns = evHelperService.getEditLayoutMaxColumns(entityType, tabs);
                            }

							bigDrawerWidthPercent = evHelperService.getBigDrawerWidthPercent(fixedAreaColumns);

							$bigDrawer.show({
								controller: 'EntityViewerEditDialogController as vm',
								templateUrl: 'views/entity-viewer/entity-viewer-edit-drawer-view.html',
								addResizeButton: true,
								drawerWidth: bigDrawerWidthPercent,
								locals: {
									entityType: entityType,
									entityId: activeObject.id,
									data: {
										openedIn: 'big-drawer',
										editLayout: editLayout
									}
								}

							}).then((res) => {

								postEditionActions(res, activeObject);

							});

						} else {
							console.error("edit layout for edit entity viewer was not found");
						} */

				/* $mdDialog.show({
							controller: 'EntityViewerEditDialogController as vm',
							templateUrl: 'views/entity-viewer/entity-viewer-edit-dialog-view.html',
							parent: angular.element(document.body),
							targetEvent: activeObject.event,
							//clickOutsideToClose: false,
							locals: {
								entityType: entityType,
								entityId: activeObject.id,
								data: {}
							}
						}).then(function (res) {

							vm.entityViewerDataService.setActiveObjectAction(null);
							vm.entityViewerDataService.setActiveObjectActionData(null);

							if (res && res.res === 'agree') {

								if (res.data.action === 'delete') {

									var objects = vm.entityViewerDataService.getObjects();

									objects.forEach(function (obj) {

										if (activeObject.id === obj.id) {

											var parent = vm.entityViewerDataService.getData(obj.___parentId);

											parent.results = parent.results.filter(function (resultItem) {
												return resultItem.id !== activeObject.id
											});

											vm.entityViewerDataService.setData(parent)

										}

									});

									vm.entityViewerEventService.dispatchEvent(evEvents.REDRAW_TABLE);

								} else {

									var objects = vm.entityViewerDataService.getObjects();

									objects.forEach(function (obj) {

										if (res.data.id === obj.id) {

											Object.keys(res.data).forEach(function (key) {

												obj[key] = res.data[key]

											});

											vm.entityViewerDataService.setObject(obj);

										}

									});

									vm.entityViewerEventService.dispatchEvent(evEvents.REDRAW_TABLE);
								}

							}

						}); */

				break
		}
	}

	var viewComplexTransaction = async function (entityType, actionData) {
		evHelperService.openComplexTransactionViewDrawer(
			vm.entityViewerDataService,
			vm.entityViewerEventService,
			$bigDrawer,
			$mdDialog,
			actionData.object.id
		)
	}

	var restoreDeletedEntities = function (event, entityType, entitiesToRestore) {
		$mdDialog
			.show({
				controller: 'EntityViewerRestoreDeletedBulkDialogController as vm',
				templateUrl:
					'views/entity-viewer/entity-viewer-entity-restore-deleted-bulk-dialog-view.html',
				parent: angular.element(document.body),
				targetEvent: event,
				//clickOutsideToClose: false,
				locals: {
					evDataService: vm.entityViewerDataService,
					evEventService: vm.entityViewerEventService,
					data: {
						entityType: entityType,
						items: entitiesToRestore,
					},
				},
			})
			.then(function (res) {
				/* vm.entityViewerDataService.setActiveObjectAction(null);
					vm.entityViewerDataService.setActiveObjectActionData(null); */
				vm.entityViewerDataService.setRowsActionData(null)

				if (res.status === 'agree') {
					var evOptions = vm.entityViewerDataService.getEntityViewerOptions()
					var objects = vm.entityViewerDataService.getObjects()
					var restoredEntitiesIds = res.data.itemsIds

					objects.forEach(function (obj) {
						if (restoredEntitiesIds.includes(obj.id)) {
							var parent = vm.entityViewerDataService.getData(obj.___parentId)
							var passesFilters =
								evOptions.entity_filters &&
								(evOptions.entity_filters.includes('active') ||
									evOptions.entity_filters.includes('enabled'))

							if (passesFilters) {
								// remove mark from restored entity inside ev table
								parent.results.forEach(function (resultItem) {
									if (restoredEntitiesIds.includes(resultItem.id)) {
										resultItem.is_deleted = false
									}
								})
							} else {
								// if entity does not pass filter, remove it from ev table

								parent.results = parent.results.filter(function (resultItem) {
									return !resultItem.includes(resultItem.id)
								})
							}

							vm.entityViewerDataService.setData(parent)
						}
					})

					vm.entityViewerEventService.dispatchEvent(evEvents.REDRAW_TABLE)
				}
			})
	}

	var setEventListeners = function () {
		vm.entityViewerEventService.addEventListener(
			evEvents.UPDATE_TABLE,
			function () {
				// difference from reportViewerController
				// here updateDataStructure called because method entityViewerDataService.resetData() not needed (loading only next pages)
				evDataProviderService.updateDataStructure(
					vm.entityViewerDataService,
					vm.entityViewerEventService,
					vm.attributeDataService
				)
			}
		)

		vm.entityViewerEventService.addEventListener(
			evEvents.COLUMN_SORT_CHANGE,
			function () {
				evDataProviderService.sortObjects(
					vm.entityViewerDataService,
					vm.entityViewerEventService,
					vm.attributeDataService
				)
			}
		)

		vm.entityViewerEventService.addEventListener(
			evEvents.GROUP_TYPE_SORT_CHANGE,
			function () {
				evDataProviderService.sortGroupType(
					vm.entityViewerDataService,
					vm.entityViewerEventService
				)
			}
		)

		vm.entityViewerEventService.addEventListener(
			evEvents.LIST_LAYOUT_CHANGE,
			function () {
				autosaveLayoutService.removeChangesTrackingEventListeners(
					vm.entityViewerEventService
				)
				vm.getView()
			}
		)

		vm.entityViewerEventService.addEventListener(
			evEvents.ROWS_ACTION_FIRED,
			function () {
				// var activeObject = vm.entityViewerDataService.getActiveObject();
				// var action = vm.entityViewerDataService.getActiveObjectAction();
				var actionData = vm.entityViewerDataService.getRowsActionData()
				var entitytype = vm.entityViewerDataService.getEntityType()
				var flatList = vm.entityViewerDataService.getFlatList()

				var activeRowIndex = flatList.findIndex(
					(object) => object.___is_activated
				)
				var activeRowExist = activeRowIndex > -1

				var manageTransactionsLockedAndCanceledProps = function (actionType) {
					var selectedRows = flatList.filter(function (row) {
						return row.___is_activated
					})

					selectedRows.forEach(function (row) {
						var transactionObj = vm.entityViewerDataService.getObject(
							row.___id,
							row.___parentId
						)

						switch (actionType) {
							case 'lock':
								if (!transactionObj.is_locked) {
									transactionObj.is_locked = true
									transactionObj.is_canceled = false

									complexTransactionService.updateProperties(
										transactionObj.id,
										{
											is_locked: transactionObj.is_locked,
											is_canceled: transactionObj.is_canceled,
										}
									)
								}

								break

							case 'unlock':
								if (transactionObj.is_locked) {
									transactionObj.is_locked = false

									complexTransactionService.updateProperties(
										transactionObj.id,
										{ is_locked: transactionObj.is_locked }
									)
								}

								break

							case 'ignore':
								if (!transactionObj.is_canceled) {
									transactionObj.is_locked = false
									transactionObj.is_canceled = true

									complexTransactionService.updateProperties(
										transactionObj.id,
										{
											is_locked: transactionObj.is_locked,
											is_canceled: transactionObj.is_canceled,
										}
									)
								}

								break

							case 'activate':
								if (transactionObj.is_canceled) {
									transactionObj.is_canceled = false

									complexTransactionService.updateProperties(
										transactionObj.id,
										{ is_canceled: transactionObj.is_canceled }
									)
								}

								break
						}

						vm.entityViewerDataService.setObject(transactionObj)
					})
				}

				var manageInstrumentProps = function (actionType) {
					var selectedRows = flatList.filter(function (row) {
						return row.___is_activated
					})

					selectedRows.forEach(function (row) {
						var obj = vm.entityViewerDataService.getObject(
							row.___id,
							row.___parentId
						)

						switch (actionType) {
							case 'deactivate':
								if (obj.is_active) {
									obj.is_active = false

									instrumentService.patch(obj.id, {
										is_active: obj.is_active,
									})
								}

								break

							case 'activate':
								if (!obj.is_active) {
									obj.is_active = true

									instrumentService.patch(obj.id, {
										is_active: obj.is_active,
									})
								}

								break
						}

						vm.entityViewerDataService.setObject(obj)
					})
				}

				console.log('actionData', actionData)

				if ((actionData.object && actionData.object.id) || activeRowExist) {
					switch (actionData.actionKey) {
						case 'delete':
							// in case of deleting row with ___is_active === false from context menu, add its id manually
							var idsToDelete = []
							if (actionData.object && actionData.object.id)
								idsToDelete.push(actionData.object.id)

							$mdDialog
								.show({
									controller: 'EntityViewerDeleteBulkDialogController as vm',
									templateUrl:
										'views/entity-viewer/entity-viewer-entity-delete-bulk-dialog-view.html',
									parent: angular.element(document.body),
									targetEvent: actionData.event,
									//clickOutsideToClose: false,
									locals: {
										evDataService: vm.entityViewerDataService,
										evEventService: vm.entityViewerEventService,
										data: {
											idsToDelete: idsToDelete,
										},
									},
								})
								.then(function (res) {
									/* vm.entityViewerDataService.setActiveObjectAction(null);
                                    vm.entityViewerDataService.setActiveObjectActionData(null); */
									vm.entityViewerDataService.setRowsActionData(null)

									if (res.status === 'agree') {
										evHelperService.updateTableAfterEntitiesDeletion(
											vm.entityViewerDataService,
											vm.entityViewerEventService,
											res.data.ids
										)
									}
								})

							break

						case 'bulk_restore_deleted':
							var objects = vm.entityViewerDataService.getObjects()
							var itemsToRestore = objects.filter(function (item) {
								return item.___is_activated && item.is_deleted
							})

							restoreDeletedEntities(
								actionData.event,
								entitytype,
								itemsToRestore
							)

							break

						case 'restore_deleted':
							restoreDeletedEntities(actionData.event, entitytype, [
								actionData.object,
							])
							break

						case 'edit':
							editEntity(entitytype, actionData)
							break

						case 'edit_instrument':
							/* $mdDialog.show({
									controller: 'EntityViewerEditDialogController as vm',
									templateUrl: 'views/entity-viewer/entity-viewer-edit-dialog-view.html',
									parent: angular.element(document.body),
									targetEvent: activeObject.event,
									locals: {
										entityType: 'instrument',
										entityId: activeObject.instrument,
										data: {}
									}
								}).then(function (res) {

									vm.entityViewerDataService.setActiveObjectAction(null);
									vm.entityViewerDataService.setActiveObjectActionData(null);

									if (res && res.res === 'agree') {
										vm.entityViewerEventService.dispatchEvent(evEvents.REDRAW_TABLE);

									}

								}); */

							$bigDrawer
								.show({
									controller: 'EntityViewerEditDialogController as vm',
									templateUrl:
										'views/entity-viewer/entity-viewer-edit-drawer-view.html',
									locals: {
										entityType: 'instrument',
										entityId: actionData.object.instrument,
										data: {
											openedIn: 'big-drawer',
										},
									},
								})
								.then(function (res) {
									/* vm.entityViewerDataService.setActiveObjectAction(null);
									vm.entityViewerDataService.setActiveObjectActionData(null); */
									vm.entityViewerDataService.setRowsActionData(null)

									if (res && res.status === 'agree') {
										vm.entityViewerEventService.dispatchEvent(
											evEvents.REDRAW_TABLE
										)
									}
								})

							break

						case 'view_transaction':
							viewComplexTransaction(entitytype, actionData)
							break
						case 'lock_transaction':
							manageTransactionsLockedAndCanceledProps('lock')
							break

						case 'unlock_transaction':
							manageTransactionsLockedAndCanceledProps('unlock')
							break

						case 'ignore_transaction':
							manageTransactionsLockedAndCanceledProps('ignore')
							break

						case 'activate_transaction':
							manageTransactionsLockedAndCanceledProps('activate')
							break

						case 'activate_instrument':
							manageInstrumentProps('activate')
							break
						case 'deactivate_instrument':
							manageInstrumentProps('deactivate')
							break
					}
				}
			}
		)

		if (autosaveLayoutOn) {
			const alcIndex = vm.entityViewerEventService.addEventListener(
				evEvents.ACTIVE_LAYOUT_CONFIGURATION_CHANGED,
				function () {
					autosaveLayoutService.initListenersForAutosaveLayout(
						vm.entityViewerDataService,
						vm.entityViewerEventService,
						false
					)
					vm.entityViewerEventService.removeEventListener(
						evEvents.ACTIVE_LAYOUT_CONFIGURATION_CHANGED,
						alcIndex
					)
				}
			)
		}
	}

	/** Separate front and back filters for old layouts */
	const separateEvFilters = function (filters) {
		let filterObj = { frontend: [], backend: [] }

		if (Array.isArray(filters)) {
			// old ev layout

			let frontFiltersList
			let backFiltersList = []

			frontFiltersList = filters.filter((filter) => {
				if (filter.options.is_frontend_filter) return true

				backFiltersList.push(filter)

				return false
			})

			filterObj.frontend = frontFiltersList
			filterObj.backend = backFiltersList
		} else {
			filterObj = filters
		}

		return filterObj
	}

	/**
	 * Called inside evHelperService.getLayoutByUserCode() or evHelperService.getDefaultLayout
	 *
	 * @param layoutData
	 */
	vm.setLayout = function (layoutData) {
		vm.layoutId = layoutData.id

		layoutData.data.filters = separateEvFilters(layoutData.data.filters)

		vm.entityViewerDataService.setLayoutCurrentConfiguration(
			layoutData,
			uiService,
			false
		)
		vm.setFiltersValuesFromQueryParameters()
		vm.readyStatus.layout = true

		evDataProviderService.updateDataStructure(
			vm.entityViewerDataService,
			vm.entityViewerEventService,
			vm.attributeDataService
		)

		var additions = vm.entityViewerDataService.getAdditions()
		var interfaceLayout = vm.entityViewerDataService.getInterfaceLayout()
		if (
			additions.isOpen &&
			interfaceLayout.splitPanel.height &&
			interfaceLayout.splitPanel.height > 0
		) {
			vm.entityViewerDataService.setSplitPanelStatus(true)
		}

		$scope.$apply()
	}

	vm.getActiveObjectFromQueryParameters = function () {
		var queryParameters = window.location.href.split('?')[1]

		var result = null

		if (queryParameters) {
			var parameters = queryParameters.split('&')

			result = {}

			parameters.forEach(function (parameter) {
				var pieces = parameter.split('=')
				var key = pieces[0]
				var value = pieces[1]

				result[key] = decodeURI(value)
			})

			return result
		}
	}

	vm.setFiltersValuesFromQueryParameters = function () {
		var activeObject = vm.getActiveObjectFromQueryParameters()

		console.log('vm.getView activeObject', activeObject)

		if (activeObject) {
			var filters = vm.entityViewerDataService.getFilters()
			var setFilterValue = function (item) {
				if (activeObject.hasOwnProperty(item.key)) {
					item.options.filter_values = [activeObject[item.key]]
				}
			}

			filters.frontend.forEach(setFilterValue)
			filters.backend.forEach(setFilterValue)
		}
	}

	vm.isLayoutFromUrl = function () {
		return window.location.href.indexOf('?layout=') !== -1
	}

	const openEditEntity = function (userCode) {
		const option = {
			pageSize: 1000,
			filters: {
				user_code: userCode,
			},
		}

		entityResolverService
			.getList(vm.entityType, option)
			.then(function (resData) {
				if (!resData.results.length) {
					return
				}

				var entityData = resData.results.find(
					(entity) => entity.user_code === userCode
				)

				var actionData = {
					object: {
						id: entityData.id,
					},
				}

				if (vm.entityType === 'instrument') {
					actionData.object.instrument_type_object =
						entityData.instrument_type_object
				}

				editEntity(vm.entityType, actionData)

				/*let urlWithoutQuery = $state.href($state.current.name, {entity: null}, {relative: true});
					urlWithoutQuery = urlWithoutQuery.slice(2); // remove #! part

					$urlService.url(urlWithoutQuery, true);*/
			})
			.catch((error) => {
				toastNotificationService.error('Entity not found')
				console.error(
					`There is no entity with entityType: ${vm.entityType} and id: ${$state.params.entity}`
				)
			})
	}

	vm.getView = function () {
		// middlewareService.setNewSplitPanelLayoutName(false); // reset split panel layout name
		vm.readyStatus.layout = false

		vm.entityViewerDataService = new EntityViewerDataService()
		vm.entityViewerEventService = new EntityViewerEventService()
		vm.splitPanelExchangeService = new SplitPanelExchangeService()
		vm.attributeDataService = new AttributeDataService(
			metaContentTypesService,
			customFieldService,
			attributeTypeService,
			uiService
		)

		vm.entityType = $scope.$parent.vm.entityType

		vm.contentType = $scope.$parent.vm.contentType
		vm.entityViewerDataService.setEntityType($scope.$parent.vm.entityType)
		vm.entityViewerDataService.setContentType($scope.$parent.vm.contentType)
		vm.entityViewerDataService.setIsReport(false)
		vm.entityViewerDataService.setViewContext('entity_viewer')
		vm.entityViewerDataService.setCurrentMember(vm.currentMember)
		vm.entityViewerDataService.setVirtualScrollStep(500)

		vm.entityViewerDataService.setRowHeight(36)

		/* var rowFilterColor = localStorageService.getRowTypeFilter(false, vm.entityType);
				var rowTypeFiltersData = vm.entityViewerDataService.getRowTypeFilters();
				rowTypeFiltersData.markedRowFilters = rowFilterColor; */
		var evSettings = globalDataService.getMemberEntityViewersSettings(
			false,
			vm.entityType
		)
		var rowTypeFiltersData = vm.entityViewerDataService.getRowTypeFilters()
		rowTypeFiltersData.markedRowFilters = evSettings.row_type_filter

		vm.entityViewerDataService.setRowTypeFilters(rowTypeFiltersData)

		vm.downloadAttributes()

		vm.entityViewerDataService.setRootEntityViewer(true)

		setEventListeners()

		if (vm.stateWithLayout) {
			middlewareService.onAutosaveLayoutToggle(function () {
				// vm.currentMember = globalDataService.getMember();
				autosaveLayoutOn = globalDataService.isAutosaveLayoutOn()
				console.log('autosave77 ev isAutosaveLayoutOn', autosaveLayoutOn)
				if (autosaveLayoutOn) {
					autosaveLayoutService.initListenersForAutosaveLayout(
						vm.entityViewerDataService,
						vm.entityViewerEventService,
						false
					)
					removeTransitionListeners()

					var layoutHasChanges = evHelperService.checkRootLayoutForChanges(
						vm.entityViewerDataService,
						false
					)
					var spChangedLayout = evHelperService.checkSplitPanelForChanges(
						vm.entityViewerDataService,
						vm.splitPanelExchangeService
					)

					if (layoutHasChanges || spChangedLayout) {
						autosaveLayoutService.forceAutosaveLayout()
					}
				} else {
					autosaveLayoutService.removeChangesTrackingEventListeners(
						vm.entityViewerEventService
					)
					initTransitionListeners()
				}

				vm.entityViewerEventService.dispatchEvent(evEvents.TOGGLE_AUTOSAVE)
			})
		}

		var layoutUserCode
		var getLayoutProm
		var stateParams = $state.params

		if (vm.isLayoutFromUrl()) {
			var queryParams = window.location.href.split('?')[1]
			var params = queryParams.split('&')

			params.forEach(function (param) {
				var pieces = param.split('=')
				var key = pieces[0]
				var value = pieces[1]

				if (key === 'layout') {
					layoutUserCode = value

					if (layoutUserCode.indexOf('%20') !== -1) {
						layoutUserCode = layoutUserCode.replace(/%20/g, ' ')
					}
				}
			})

			// vm.getLayoutByUserCode(layoutUserCode);
			getLayoutProm = evHelperService.getLayoutByUserCode(
				vm,
				layoutUserCode,
				$mdDialog,
				'entity_viewer'
			)
		} else if (stateParams.layoutUserCode) {
			layoutUserCode = stateParams.layoutUserCode

			// vm.getLayoutByUserCode(layoutUserCode);
			getLayoutProm = evHelperService.getLayoutByUserCode(
				vm,
				layoutUserCode,
				$mdDialog,
				'entity_viewer'
			)
		} else {
			// vm.getDefaultLayout();
			getLayoutProm = evHelperService.getDefaultLayout(vm, 'entity_viewer')
		}

		getLayoutProm.then(function () {
			if (stateParams.entity) {
				openEditEntity(stateParams.entity)
			}
		})
	}

	vm.downloadAttributes = function () {
		var promises = []

		promises.push(
			vm.attributeDataService.downloadDynamicAttributesByEntityType(
				vm.entityType
			)
		)

		if (vm.entityType === 'instrument') {
			promises.push(vm.attributeDataService.downloadInstrumentUserFields())
		}

		if (vm.entityType === 'complex-transaction') {
			promises.push(vm.attributeDataService.downloadTransactionUserFields())
		}

		if (vm.entityType === 'transaction-type') {
			promises.push(vm.attributeDataService.downloadTransactionUserFields())
		}

		Promise.all(promises).then(function (data) {
			vm.readyStatus.attributes = true
			$scope.$apply()
		})
	}

	/* vm.getCurrentMember = function () {

                return usersService.getMyCurrentMember().then(function (data) {

                    vm.currentMember = data;

                    $scope.$apply();

                });
            }; */

	var checkLayoutsForChanges = function (transition) {
		// called on attempt to change page
		console.log('autosave77 ev checkLayoutsForChanges ', autosaveLayoutOn)
		/* return new Promise(function (resolve, reject) {

                    if (!doNotCheckLayoutChanges) {

                        var activeLayoutConfig = vm.entityViewerDataService.getActiveLayoutConfiguration();

                        var spChangedLayout = false;
                        var additions = vm.entityViewerDataService.getAdditions();
                        if (additions.isOpen) {
                            spChangedLayout = vm.splitPanelExchangeService.getSplitPanelChangedLayout();
                        }

                        var layoutIsUnchanged = true;
                        if (activeLayoutConfig && activeLayoutConfig.data) {
                            var layoutCurrentConfig = vm.entityViewerDataService.getLayoutCurrentConfiguration(false);

                            layoutIsUnchanged = evHelperService.checkForLayoutConfigurationChanges(activeLayoutConfig, layoutCurrentConfig, false);
                        }

                        if (!layoutIsUnchanged || spChangedLayout) {

                            $mdDialog.show({
                                controller: 'LayoutChangesLossWarningDialogController as vm',
                                templateUrl: 'views/dialogs/layout-changes-loss-warning-dialog.html',
                                parent: angular.element(document.body),
                                preserveScope: true,
                                autoWrap: true,
                                multiple: true,
                                locals: {
                                    data: {
                                        evDataService: vm.entityViewerDataService,
                                        entityType: vm.entityType
                                    }
                                }
                            }).then(function (res, rej) {

                                if (res.status === 'save_layout') {

                                    var layoutsSavePromises = [];

                                    // if split panel layout changed, save it
                                    if (spChangedLayout) {

                                        var saveSPLayoutChanges = new Promise(function (spLayoutSaveRes, spLayoutSaveRej) {

                                            if (spChangedLayout.hasOwnProperty('id')) {

                                            	uiService.updateListLayout(spChangedLayout.id, spChangedLayout).then(function () {
                                                    spLayoutSaveRes(true);
                                                });

                                            } else {

                                            	uiService.createListLayout(vm.entityType, spChangedLayout).then(function () {
                                                    spLayoutSaveRes(true);
                                                });

                                            }

                                        });

                                        layoutsSavePromises.push(saveSPLayoutChanges);

                                    }
                                    // < if split panel layout changed, save it >

                                    if (!layoutIsUnchanged) {

                                        var saveLayoutChanges = new Promise(function (saveLayoutRes, saveLayoutRej) {

                                            if (layoutCurrentConfig.hasOwnProperty('id')) {

                                                uiService.updateListLayout(layoutCurrentConfig.id, layoutCurrentConfig).then(function () {
                                                    saveLayoutRes(true);
                                                });

                                            } else {

                                                if (res.data && res.data.layoutName) {
                                                    layoutCurrentConfig.name = res.data.layoutName;
                                                }

												uiService.createListLayout(vm.entityType, layoutCurrentConfig).then(function () {
													saveLayoutRes(true);
												});

                                            }

                                            layoutsSavePromises.push(saveLayoutChanges);

                                        });
                                    }

                                    Promise.all(layoutsSavePromises).then(function () {
                                        resolve(true);
                                    });

                                } else if (res.status === 'do_not_save_layout') {

                                    resolve(true);

                                } else {

                                    reject(false);

                                }

                            }).catch(function () {
                                reject(false);
                            });

                        } else {
                            resolve(true);
                        }

                    } else {
                        removeTransitionListeners();
                        resolve(true);
                    }

                }); */
		if (checkLayoutChanges) {
			return evHelperService.warnAboutChangesToLoose(
				vm.entityViewerDataService,
				vm.splitPanelExchangeService,
				$mdDialog
			)
		} else {
			removeTransitionListeners()

			return new Promise(function (resolve) {
				resolve(true)
			})
		}
	}

	var warnAboutLayoutChangesLoss = function (event) {
		/* var activeLayoutConfig = vm.entityViewerDataService.getActiveLayoutConfiguration();
                var layoutCurrentConfig = vm.entityViewerDataService.getLayoutCurrentConfiguration(false);

                var layoutIsUnchanged = true;
                if (activeLayoutConfig && activeLayoutConfig.data) {
                    layoutIsUnchanged = evHelperService.checkForLayoutConfigurationChanges(activeLayoutConfig, layoutCurrentConfig, false);
                }

                var spChangedLayout = false;
                var additions = vm.entityViewerDataService.getAdditions();
                if (additions.isOpen) {
                    spChangedLayout = vm.splitPanelExchangeService.getSplitPanelChangedLayout();
                } */
		var layoutHasChanges = evHelperService.checkRootLayoutForChanges(
			vm.entityViewerDataService,
			false
		)
		var spChangedLayout = evHelperService.checkSplitPanelForChanges(
			vm.entityViewerDataService,
			vm.splitPanelExchangeService
		)

		if (layoutHasChanges || spChangedLayout) {
			console.log('autosave77 ev warnAboutLayoutChangesLoss ', autosaveLayoutOn)
			event.preventDefault()
			;(event || window.event).returnValue =
				'All unsaved changes of layout will be lost.'
		}
	}

	// IMPORTANT
	var initTransitionListeners = function () {
		// deregisterOnBeforeTransitionHook = $transitions.onBefore(
		// 	{},
		// 	checkLayoutsForChanges
		// )
		window.addEventListener('beforeunload', warnAboutLayoutChangesLoss)
	}

	var removeTransitionListeners = function () {
		if (deregisterOnBeforeTransitionHook) {
			deregisterOnBeforeTransitionHook()
		}

		window.removeEventListener('beforeunload', warnAboutLayoutChangesLoss)
	}

	vm.init = function () {
		autosaveLayoutService = new AutosaveLayoutService(
			metaContentTypesService,
			uiService,
			null
		)

		/*if (vm.stateWithLayout) {

                	initTransitionListeners();

                    window.addEventListener('beforeunload', warnAboutLayoutChangesLoss);

                }*/
		vm.currentMember = globalDataService.getMember()

		if (vm.stateWithLayout) {
			onUserChangeIndex = middlewareService.onMasterUserChanged(function () {
				checkLayoutChanges = false
				removeTransitionListeners()
			})

			onLogoutIndex = middlewareService.addListenerOnLogOut(function () {
				checkLayoutChanges = false
				removeTransitionListeners()
			})

			if (!autosaveLayoutOn) {
				console.log(
					'autosave77 ev init initTransitionListeners',
					autosaveLayoutOn
				)
				initTransitionListeners()
			}
		}

		vm.getView()
	}

	vm.init()

	this.$onDestroy = function () {
		if (vm.stateWithLayout) {
			middlewareService.removeOnUserChangedListeners(onUserChangeIndex)
			middlewareService.removeOnLogOutListener(onLogoutIndex)

			removeTransitionListeners()
		}
	}
}
