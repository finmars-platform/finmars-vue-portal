import AutosaveLayoutService from '../../services/autosaveLayoutService'
import evHelperService from '../../services/entityViewerHelperService'
import uiService from '../../services/uiService'
import evEvents from '../../services/entityViewerEvents'
import localStorageService from "@/angular/shell/scripts/app/services/localStorageService";

import metaService from '../../services/metaService'

import RvSharedLogicHelper from '../../helpers/rvSharedLogicHelper'
import EntityViewerDataService from '../../services/entityViewerDataService'
import EntityViewerEventService from '../../services/eventService'
import SplitPanelExchangeService from '../../services/groupTable/exchangeWithSplitPanelService'
import AttributeDataService from '../../services/attributeDataService'

import evRvLayoutsHelperInst from '../../helpers/evRvLayoutsHelper'
import globalDataServiceInst from '../../shell/scripts/app/services/globalDataService'
import middlewareServiceInst from '../../shell/scripts/app/services/middlewareService'
import metaContentTypesServiceInst from '../../services/metaContentTypesService'
import attributeTypeService from '../../services/attributeTypeService'
import xhrService from '../../shell/scripts/app/services/xhrService'
import cookieService from '../../shell/scripts/app/services/cookieService'
import pricesCheckerServiceInst from '../../services/reports/pricesCheckerService'
import GroupsService from '@/angular/services/rv-data-provider/groups.service'
import ObjectsService from '@/angular/services/rv-data-provider/objects.service';
import rvDataProviderServiceInst from '@/angular/services/rv-data-provider/rv-data-provider.service'
import reportHelperInst from '../../helpers/reportHelper'
import entityResolverServiceNew from '../../services/entityResolverServiceNew'
import reportServiceInst from '../../services/reportService'
import customFieldServiceInst from '../../services/reports/customFieldService'

export default function ({
	$scope,
	$stateParams,
	priceHistoryService,
	currencyHistoryService,
	expressionService,
}) {
	var vm = this

	let middlewareService = new middlewareServiceInst()
	let pricesCheckerService = new pricesCheckerServiceInst()
	let reportService = new reportServiceInst()
	let entityResolverService = new entityResolverServiceNew({ reportService })
	let customFieldService = new customFieldServiceInst()
	window.reportHelper = new reportHelperInst()
	const groupsService = new GroupsService();
	const objectsService = new ObjectsService();


	let rvDataProviderService = new rvDataProviderServiceInst(
		entityResolverService,
		pricesCheckerService,
		window.reportHelper,
		groupsService,
		objectsService,
	)

	// Globals HACK
	window.metaContentTypesService = new metaContentTypesServiceInst()
	window.globalDataService = new globalDataServiceInst()
	window.xhrService = new xhrService()
	window.cookieService = new cookieService()
	window.evRvLayoutsHelper = new evRvLayoutsHelperInst()

	var sharedLogicHelper = new RvSharedLogicHelper(
		vm,
		$scope,
		$mdDialog,
		window.globalDataService,
		priceHistoryService,
		currencyHistoryService,
		window.metaContentTypesService,
		pricesCheckerService,
		rvDataProviderService,
		window.reportHelper
	)

	vm.readyStatus = reactive({
		attributes: false,
		layout: false, // changed by rvSharedLogicHelper.onSetLayoutEnd();
	})

	var onLogoutIndex, onUserChangeIndex

	// var doNotCheckLayoutChanges = false;
	var autosaveLayoutService
	var autosaveLayoutOn = window.globalDataService.isAutosaveLayoutOn()
	// Functions for context menu

	vm.setEventListeners = function () {
		vm.entityViewerEventService.addEventListener(
			evEvents.UPDATE_TABLE,
			function () {
				rvDataProviderService.updateDataStructure(
					vm.entityViewerDataService,
					vm.entityViewerEventService
				)
			}
		)

		vm.entityViewerEventService.addEventListener(
			evEvents.COLUMN_SORT_CHANGE,
			function () {
				rvDataProviderService.sortObjects(
					vm.entityViewerDataService,
					vm.entityViewerEventService
				)
			}
		)

		vm.entityViewerEventService.addEventListener(
			evEvents.GROUP_TYPE_SORT_CHANGE,
			function () {
				rvDataProviderService.sortGroupType(
					vm.entityViewerDataService,
					vm.entityViewerEventService
				)
			}
		)

		vm.entityViewerEventService.addEventListener(
			evEvents.REQUEST_REPORT,
			function () {
				rvDataProviderService.requestReport(
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
			}
		)

		vm.entityViewerEventService.addEventListener(
			evEvents.ROWS_ACTION_FIRED,
			sharedLogicHelper.executeRowAction
		)

		vm.entityViewerEventService.addEventListener(
			evEvents.USER_REQUEST_AN_ACTION,
			sharedLogicHelper.executeUserRequestedAction
		)

		if (autosaveLayoutOn) {

			const alccHandler = () => {

				autosaveLayoutService.initListenersForAutosaveLayout(
					vm.entityViewerDataService,
					vm.entityViewerEventService,
					true
				)

				vm.entityViewerEventService.removeEventListener(
					evEvents.ACTIVE_LAYOUT_CONFIGURATION_CHANGED,
					alcIndex
				)

			}

			const alcIndex = vm.entityViewerEventService.addEventListener(
				evEvents.ACTIVE_LAYOUT_CONFIGURATION_CHANGED,
				alccHandler
			)

		}
	}

	vm.isLayoutFromUrl = function () {
		return window.location.href.indexOf('?layout=') !== -1
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

	vm.closeGroupsAndContinueReportGeneration = function () {

		var localStorageReportData = localStorageService.getReportData();

		var layout = vm.entityViewerDataService.getListLayout();
		var contentType = vm.entityViewerDataService.getContentType();

		delete localStorageReportData[contentType][layout.user_code]

		var groups = vm.entityViewerDataService.getGroups();

		groups.forEach(function (group) {

			if (!group.report_settings) {
				group.report_settings = {}
			}

			group.report_settings.is_level_folded = true;

		})

		vm.entityViewerDataService.setGroups(groups);

		localStorageService.cacheReportData(localStorageReportData);

		vm.possibleToRequestReport = true;

		rvDataProviderService.updateDataStructure(vm.entityViewerDataService, vm.entityViewerEventService);

	}

	vm.continueReportGeneration = function () {

		vm.possibleToRequestReport = true;

		rvDataProviderService.updateDataStructure(vm.entityViewerDataService, vm.entityViewerEventService);
	}

	vm.setFiltersValuesFromQueryParameters = function () {
		var activeObject = vm.getActiveObjectFromQueryParameters()

		if (activeObject) {
			var filters = vm.entityViewerDataService.getFilters()

			filters.forEach(function (item) {
				if (activeObject.hasOwnProperty(item.key)) {
					item.options.filter_values = [activeObject[item.key]]
				}
			})
		}
	}

	/* var calculateReportDateExpr = function (dateExpr, reportOptions, reportDateIndex, dateExprsProms) {

            var reportDateProperties = {
                'balance-report': [null, 'report_date'],
                'pl-report': ['pl_first_date', 'report_date'],
                'transaction-report': ['begin_date', 'end_date']
            };

            var dateProp = reportDateProperties[vm.entityType][reportDateIndex];

            var result = expressionService.getResultOfExpression({"expression": dateExpr}).then(function (data) {
                reportOptions[dateProp] = data.result
            });

            dateExprsProms.push(result);

        }; */

	var checkLayoutsForChanges = function () {
		// called on attempt to change or reload page

		/* return new Promise(function (resolve, reject) {

                var checkForLayoutChanges = vm.entityViewerDataService.isLayoutChangesLossWarningNeeded();

                if (checkForLayoutChanges) {

                    var activeLayoutConfig = vm.entityViewerDataService.getActiveLayoutConfiguration();
                    var spChangedLayout = false;
                    var additions = vm.entityViewerDataService.getAdditions();

                    if (additions.isOpen) {
                        spChangedLayout = vm.splitPanelExchangeService.getSplitPanelChangedLayout();
                    }

                    var layoutIsUnchanged = true;
                    if (activeLayoutConfig && activeLayoutConfig.data) {
                        var layoutCurrentConfig = vm.entityViewerDataService.getLayoutCurrentConfiguration(true);

                        layoutIsUnchanged = evHelperService.checkForLayoutConfigurationChanges(activeLayoutConfig, layoutCurrentConfig, true);
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

                                if (activeLayoutConfig && !layoutIsUnchanged) {

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
		var checkForLayoutChanges =
			vm.entityViewerDataService.isLayoutChangesLossWarningNeeded()

		if (checkForLayoutChanges) {
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

            var layoutIsUnchanged = true;
            if (activeLayoutConfig && activeLayoutConfig.data) {
                var layoutCurrentConfig = vm.entityViewerDataService.getLayoutCurrentConfiguration(true);

                layoutIsUnchanged = evHelperService.checkForLayoutConfigurationChanges(activeLayoutConfig, layoutCurrentConfig, true);
            }

            var spChangedLayout = false;
            var additions = vm.entityViewerDataService.getAdditions();
            if (additions.isOpen) {
                spChangedLayout = vm.splitPanelExchangeService.getSplitPanelChangedLayout();
            }

            if (!layoutIsUnchanged || spChangedLayout) { */

		/* var layoutHasChanges = checkRootLayoutForChanges();
            var spChangedLayout = checkSplitPanelForChanges(); */
		var layoutHasChanges = evHelperService.checkRootLayoutForChanges(
			vm.entityViewerDataService,
			true
		)
		var spChangedLayout = evHelperService.checkSplitPanelForChanges(
			vm.entityViewerDataService,
			vm.splitPanelExchangeService
		)

		if (layoutHasChanges || spChangedLayout) {

			event.preventDefault();

			(event || window.event).returnValue =
				'All unsaved changes of layout will be lost.';

		}
	}

	var initTransitionListeners = function () {
		window.addEventListener('beforeunload', warnAboutLayoutChangesLoss)
	}

	var removeTransitionListeners = function () {
		window.removeEventListener('beforeunload', warnAboutLayoutChangesLoss)
	}

	/**
	 * Integrates report viewer layout into front end. Called from module:entityViewerHelperService by callbacks getLayoutByUserCode or getDefaultLayout.
	 *
	 * @param layout {Object}
	 * @returns {Promise<unknown>}
	 */
	vm.setLayout = function (layout) {
		return new Promise(async function (resolve, reject) {

            if (typeof layout.data.reportLayoutOptions?.useDateFromAbove !== 'boolean') {
                layout.data.reportLayoutOptions.useDateFromAbove = true;
            }

			vm.entityViewerDataService.setLayoutCurrentConfiguration(
				layout,
				uiService,
				true
			)
			vm.setFiltersValuesFromQueryParameters()

			// var reportOptions = vm.entityViewerDataService.getReportOptions();
			var reportLayoutOptions =
				vm.entityViewerDataService.getReportLayoutOptions()

			var additions = vm.entityViewerDataService.getAdditions()
			var interfaceLayout = vm.entityViewerDataService.getInterfaceLayout()

			if (
				additions.isOpen &&
				interfaceLayout.splitPanel.height &&
				interfaceLayout.splitPanel.height > 0
			) {
				try {

					await uiService.pingListLayoutByKey(
                        additions.layoutData.layoutId,
                        {
                            notifyError: false,
                        }
					)

					vm.entityViewerDataService.setSplitPanelStatus(true)

				} catch (error) {
					// layout for split panel was not found

                    console.error('Error on getting layout with an id: ' + additions.layoutData.layoutId + ' for split panel');
					if (error.response?.status === 404) {
						/* interfaceLayout.splitPanel.height = 0;
                            vm.entityViewerDataService.setInterfaceLayout(interfaceLayout);

                            additions.isOpen = false;
                            additions.type = '';
                            delete additions.layoutData;

                            vm.entityViewerDataService.setAdditions(additions);

                            vm.entityViewerDataService.setSplitPanelStatus(false);*/
						evRvLayoutsHelper.clearSplitPanelAdditions(
							vm.entityViewerDataService
						)
					}
				}
			}

			interfaceLayout.filterArea.width = 0

			// Check if there is need to solve report datepicker expression
			if (reportLayoutOptions && reportLayoutOptions.datepickerOptions) {

				await sharedLogicHelper.calculateReportDatesExprs()
				vm.readyStatus.layout = sharedLogicHelper.onSetLayoutEnd()

				var activeColumnSortProm = new Promise(function (
					sortResolve,
					sortReject
				) {
					var activeColumnSort =
						vm.entityViewerDataService.getActiveColumnSort()

					if (activeColumnSort?.options.sort_settings.layout_user_code) {

						uiService.getColumnSortDataList({
                            filters: {
                                user_code: activeColumnSort.options.sort_settings.layout_user_code,
                            },
						})
							.then(function (data) {
								if (data.results.length) {
									var layout = data.results[0]

									vm.entityViewerDataService.setColumnSortData(
										activeColumnSort.key,
										layout.data
									)
								} else {
									toastNotificationService.error(
										'Manual Sort is not configured'
									)

									activeColumnSort.options.sort_settings.layout_user_code = null
								}

								sortResolve()
							})
					} else {
						sortResolve()
					}
				})

				Promise.all([activeColumnSortProm]).then(function () {
					resolve()
				})
			} else {
				vm.readyStatus.layout = sharedLogicHelper.onSetLayoutEnd()
			}

			resolve()
		})
	}

	vm.getView = function () {
		// middlewareService.setNewSplitPanelLayoutName(false); // reset split panel layout name

		vm.readyStatus.layout = false // switched to true by sharedLogicHelper.onSetLayoutEnd()

		vm.entityViewerDataService = new EntityViewerDataService(
			window.reportHelper
		)

		vm.entityViewerEventService = new EntityViewerEventService()

		vm.splitPanelExchangeService = new SplitPanelExchangeService()
		vm.attributeDataService = new AttributeDataService(
			window.metaContentTypesService,
			customFieldService,
			attributeTypeService,
			uiService
		)

		vm.entityType = $scope.entityType
		vm.contentType = $scope.contentType
		vm.viewContext = $scope.viewContext
		vm.layout = $scope.layout

		// calls setEntityType, setIsReport etc
		sharedLogicHelper.setLayoutDataForView()

		vm.entityViewerDataService.setRootEntityViewer(true)
		vm.entityViewerDataService.setViewContext(vm.viewContext)

		vm.entityViewerDataService.setLayoutChangesLossWarningState(true)

		/* let rowTypeFilters = localStorage.getItem("row_type_filter");

            if (rowTypeFilters) {

                rowTypeFilters = JSON.parse(rowTypeFilters);
                const rowFilterColor = rowTypeFilters.markedRowFilters;
                vm.entityViewerDataService.setRowTypeFilters(rowFilterColor);

            } */

		var downloadAttrsProm = sharedLogicHelper.downloadAttributes()
		var setLayoutProm

		vm.setEventListeners()

		middlewareService.onAutosaveLayoutToggle(function () {
			autosaveLayoutOn = window.globalDataService.isAutosaveLayoutOn()

			if (autosaveLayoutOn) {
				autosaveLayoutService.initListenersForAutosaveLayout(
					vm.entityViewerDataService,
					vm.entityViewerEventService,
					true
				)
				removeTransitionListeners()

				var layoutHasChanges = evHelperService.checkRootLayoutForChanges(
					vm.entityViewerDataService,
					true
				)
				// var spChangedLayout = evHelperService.checkSplitPanelForChanges(vm.entityViewerDataService, vm.splitPanelExchangeService);

				if (layoutHasChanges) {
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

		var layoutUserCode

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
						layoutUserCode = layoutUserCode.replace(/%20/g, " ")
					}
				}
			})

			// vm.getLayoutByUserCode(layoutUserCode);
			setLayoutProm = evHelperService.getLayoutByUserCode(
				vm,
				layoutUserCode,
				$mdDialog
			)
		} else if ($stateParams.layoutUserCode) {

			layoutUserCode = $stateParams.layoutUserCode
			// vm.getLayoutByUserCode(layoutUserCode);
			setLayoutProm = evHelperService.getLayoutByUserCode(
				vm,
				layoutUserCode,
				$mdDialog
			)

		} else {
			setLayoutProm = evHelperService.getDefaultLayout(vm)
		}

            Promise.allSettled([
                downloadAttrsProm,
                setLayoutProm
            ])
                .then(function (getViewData) {

                    metaService.logRejectedPromisesAfterAllSettled(
                        getViewData, 'report viewer get view'
                    );

                });
	}

	vm.init = function () {

		autosaveLayoutService = new AutosaveLayoutService(
			window.metaContentTypesService, uiService, reportHelper, window.globalDataService
		);

		onUserChangeIndex = middlewareService.onMasterUserChanged(function () {
			vm.entityViewerDataService.setLayoutChangesLossWarningState(false)
			removeTransitionListeners()
		})

		onLogoutIndex = middlewareService.addListenerOnLogOut(function () {
			vm.entityViewerDataService.setLayoutChangesLossWarningState(false)
			removeTransitionListeners()
		})

		if (!autosaveLayoutOn) {
			initTransitionListeners()
		}

		vm.getView()
	}

	this.$onDestroy = function () {
		middlewareService.removeOnUserChangedListeners(onUserChangeIndex)
		middlewareService.removeOnLogOutListener(onLogoutIndex)

		removeTransitionListeners()
	}

	vm.init()
}
