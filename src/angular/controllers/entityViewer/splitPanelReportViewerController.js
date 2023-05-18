/**
 /**
 * Created by szhitenev on 05.05.2016.
 */

'use strict'

import AutosaveLayoutService from '../../services/autosaveLayoutService'
import evHelperService from '../../services/entityViewerHelperService'
import evEvents from '../../services/entityViewerEvents'

/* import uiService from '../../services/uiService';
    import evEvents from '../../services/entityViewerEvents';
    import evHelperService from '../../services/entityViewerHelperService'; */

import RvSharedLogicHelper from '../../helpers/rvSharedLogicHelper'
import EntityViewerDataService from '../../services/entityViewerDataService'
import EntityViewerEventService from '../../services/eventService'
import AttributeDataService from '../../services/attributeDataService'

// import middlewareService from '../../services/middlewareService';

export default function (
	$scope,
	$mdDialog,
	$transitions,
	globalDataService,
	priceHistoryService,
	currencyHistoryService,
	metaContentTypesService,
	customFieldService,
	attributeTypeService,
	rvDataProviderService,
	uiService,
	pricesCheckerService,
	expressionService,
	reportHelper,
	parentEntityViewerDataService,
	parentEntityViewerEventService,
	splitPanelExchangeService
) {
	var vm = this

	var sharedLogicHelper = new RvSharedLogicHelper(
		vm,
		$scope,
		$mdDialog,
		globalDataService,
		priceHistoryService,
		currencyHistoryService,
		metaContentTypesService,
		pricesCheckerService,
		expressionService,
		rvDataProviderService,
		reportHelper
	)

	console.log('parentEntityViewerDataService', parentEntityViewerDataService)
	console.log('parentEntityViewerEventService', parentEntityViewerEventService)
	vm.parentEntityViewerEventService = parentEntityViewerEventService // used inside RvSharedLogicHelper

	vm.readyStatus = {
		attributes: false,
		layout: false,
	}

	vm.entityViewerDataService = null
	vm.entityViewerEventService = null

	var autosaveLayoutService
	var autosaveLayoutOn = globalDataService.isAutosaveLayoutOn()
	var useDateFromAbove
	/** Used to remove eventListeners from parentEntityViewerEventService **/
	var parentEvEventListeners = {}
	//region Functions for context menu

	/* var updateTableAfterEntityChanges = function (res) {

            //  vm.entityViewerDataService.setActiveObjectAction(null);
            // vm.entityViewerDataService.setActiveObjectActionData(null);
            vm.entityViewerDataService.setRowsActionData(null);

            if (res && res.res === 'agree') {

                vm.entityViewerDataService.resetData();
                vm.entityViewerDataService.resetRequestParameters();

                var rootGroup = vm.entityViewerDataService.getRootGroupData();

                vm.entityViewerDataService.setActiveRequestParametersId(rootGroup.___id);

                vm.entityViewerEventService.dispatchEvent(evEvents.UPDATE_TABLE);
                parentEntityViewerEventService.dispatchEvent(evEvents.UPDATE_TABLE);

            }

        };

        var getContextDataForComplexTransaction = function (reportOptions, activeObject) {

            var report_date = null;
            var report_start_date = null;

            if (vm.entityType === 'balance-report') {
                report_date = reportOptions.report_date;
            }

            if (vm.entityType === 'pl-report') {
                report_date = reportOptions.report_date;
                report_start_date = reportOptions.pl_first_date;
            }

            if (vm.entityType === 'transaction-report') {
                report_date = reportOptions.end_date;
                report_start_date = reportOptions.begin_date;
            }

            var contextData = {
                effective_date: reportOptions.report_date,
                position: null,
                pricing_currency: null,
                accrued_currency: null,
                instrument: null,
                portfolio: null,
                account: null,
                strategy1: null,
                strategy2: null,
                strategy3: null,


                currency: null,
                report_date: report_date,
                report_start_date: report_start_date,
                pricing_policy: null,
                allocation_balance: null,
                allocation_pl: null

            };

            if (activeObject.item_type === 2) { // currency

                contextData.currency = activeObject['currency.id'];
                contextData.currency_object = {
                    id: activeObject['currency_object.id'],
                    name: activeObject['currency_object.name'],
                    user_code: activeObject['currency_object.user_code'],
                    content_type: "currencies.currency"
                };

            }

            if (activeObject['position_size']) {
                contextData.position = activeObject['position_size'];
            }

            if (reportOptions['pricing_policy']) {
                contextData.pricing_policy = reportOptions.pricing_policy;
                contextData.pricing_policy_object = Object.assign({}, reportOptions.pricing_policy_object)
            }

            if (activeObject['pricing_currency.id']) {
                contextData.pricing_currency = activeObject['pricing_currency.id'];
                contextData.pricing_currency_object = {
                    id: activeObject['pricing_currency.id'],
                    name: activeObject['pricing_currency.name'],
                    user_code: activeObject['pricing_currency.user_code'],
                    content_type: "currencies.currency"
                };
            }

            if (activeObject['instrument.accrued_currency.id']) {
                contextData.accured_currency = activeObject['instrument.accrued_currency.id'];
                contextData.accured_currency_object = {
                    id: activeObject['instrument.accrued_currency.id'],
                    name: activeObject['instrument.accrued_currency.name'],
                    user_code: activeObject['instrument.accrued_currency.user_code'],
                    content_type: "currencies.currency"
                };
            }

            if (activeObject['instrument.id']) {
                contextData.instrument = activeObject['instrument.id'];
                contextData.instrument_object = {
                    id: activeObject['instrument.id'],
                    name: activeObject['instrument.name'],
                    user_code: activeObject['instrument.user_code'],
                    content_type: "instruments.instrument"
                };
            }

            if (activeObject['allocation_balance.id']) {
                contextData.allocation_balance = activeObject['allocation_balance.id'];
                contextData.allocation_balance_object = {
                    id: activeObject['allocation_balance.id'],
                    name: activeObject['allocation_balance.name'],
                    user_code: activeObject['allocation_balance.user_code'],
                    content_type: "instruments.instrument"
                };
            }

            if (activeObject['allocation_pl.id']) {
                contextData.allocation_pl = activeObject['allocation_pl.id'];
                contextData.allocation_pl_object = {
                    id: activeObject['allocation_pl.id'],
                    name: activeObject['allocation_pl.name'],
                    user_code: activeObject['allocation_pl.user_code'],
                    content_type: "instruments.instrument"
                };
            }

            if (activeObject['portfolio.id']) {
                contextData.portfolio = activeObject['portfolio.id'];
                contextData.portfolio_object = {
                    id: activeObject['portfolio.id'],
                    name: activeObject['portfolio.name'],
                    user_code: activeObject['portfolio.user_code'],
                    content_type: "portfolios.portfolio"
                };
            }

            if (activeObject['account.id']) {
                contextData.account = activeObject['account.id'];
                contextData.account_object = {
                    id: activeObject['account.id'],
                    name: activeObject['account.name'],
                    user_code: activeObject['account.user_code'],
                    content_type: "accounts.account"
                };
            }

            if (activeObject['strategy1.id']) {
                contextData.strategy1 = activeObject['strategy1.id'];
                contextData.strategy1_object = {
                    id: activeObject['strategy1.id'],
                    name: activeObject['strategy1.name'],
                    user_code: activeObject['strategy1.user_code'],
                    content_type: "strategies.strategy1"
                };
            }

            if (activeObject['strategy2.id']) {
                contextData.strategy2 = activeObject['strategy2.id'];
                contextData.strategy2_object = {
                    id: activeObject['strategy2.id'],
                    name: activeObject['strategy2.name'],
                    user_code: activeObject['strategy2.user_code'],
                    content_type: "strategies.strategy2"
                };
            }

            if (activeObject['strategy3.id']) {
                contextData.strategy3 = activeObject['strategy3.id'];
                contextData.strategy3_object = {
                    id: activeObject['strategy3.id'],
                    name: activeObject['strategy3.name'],
                    user_code: activeObject['strategy3.user_code'],
                    content_type: "strategies.strategy3"
                };
            }

            return contextData;
        };

        var createEntity = function (activeObject, locals) {

            var dialogController = 'EntityViewerAddDialogController as vm';
            var dialogTemplateUrl = 'views/entity-viewer/entity-viewer-add-dialog-view.html';

            if (locals.entityType && locals.entityType === 'complex-transaction') {
                dialogController = 'ComplexTransactionAddDialogController as vm';
                dialogTemplateUrl = 'views/entity-viewer/complex-transaction-add-dialog-view.html';
            }

            $mdDialog.show({
                controller: dialogController,
                templateUrl: dialogTemplateUrl,
                parent: angular.element(document.body),
                targetEvent: activeObject.event,
                locals: locals
            }).then(function (res) {

                updateTableAfterEntityChanges(res);

            });

        };
        var createEntity = function (activeObject, locals) {

            var dialogController = 'EntityViewerAddDialogController as vm';
            var dialogTemplateUrl = 'views/entity-viewer/entity-viewer-add-dialog-view.html';

            if (locals.entityType && locals.entityType === 'complex-transaction') {
                dialogController = 'ComplexTransactionAddDialogController as vm';
                dialogTemplateUrl = 'views/entity-viewer/complex-transaction-add-dialog-view.html';
            }

            $mdDialog.show({
                controller: dialogController,
                templateUrl: dialogTemplateUrl,
                parent: angular.element(document.body),
                targetEvent: activeObject.event,
                locals: locals
            }).then(function (res) {

                updateTableAfterEntityChanges(res);

            });

        };

        var editEntity = function (activeObject, locals) {

            var dialogController = 'EntityViewerEditDialogController as vm';
            var dialogTemplateUrl = 'views/entity-viewer/entity-viewer-edit-dialog-view.html';

            locals.openedIn = 'modal';

            if (locals.entityType && locals.entityType === 'complex-transaction') {
                dialogController = 'ComplexTransactionEditDialogController as vm';
                dialogTemplateUrl = 'views/entity-viewer/complex-transaction-edit-dialog-view.html';
            }

            $mdDialog.show({
                controller: dialogController,
                templateUrl: dialogTemplateUrl,
                parent: angular.element(document.body),
                targetEvent: activeObject.event,
                locals: locals

            }).then(function (res) {

                if (vm.autoRefreshState) {
                    vm.entityViewerEventService.dispatchEvent(evEvents.REQUEST_REPORT);
                }

                updateTableAfterEntityChanges(res);

            });

        };

        var offerToCreateEntity = function (activeObject, warningDescription, createEntityLocals) {

            $mdDialog.show({
                controller: 'WarningDialogController as vm',
                templateUrl: 'views/dialogs/warning-dialog-view.html',
                parent: angular.element(document.body),
                targetEvent: activeObject.event,
                preserveScope: true,
                autoWrap: true,
                multiple: true,
                skipHide: true,
                locals: {
                    warning: {
                        title: 'Warning',
                        description: warningDescription
                    }
                }

            }).then(function (res) {
                if (res.status === 'agree') {

                    createEntity(activeObject, createEntityLocals);

                }
            });

        }; */

	//endregion Functions for context menu

	var applyDatesFromParentLayout = function () {
		var ct = parentEntityViewerDataService.getContentType()
		var ro = parentEntityViewerDataService.getReportOptions()
		var rlo = parentEntityViewerDataService.getReportLayoutOptions()

		return sharedLogicHelper.applyDatesFromAnotherLayout(ct, ro, rlo)
	}

	var onParentRoChange = async function () {
		await applyDatesFromParentLayout()
		vm.entityViewerEventService.dispatchEvent(evEvents.REPORT_OPTIONS_CHANGE)
	}

	// var procIndex;

	vm.setEventListeners = function () {
		parentEvEventListeners['ACTIVE_OBJECT_CHANGE'] =
			parentEntityViewerEventService.addEventListener(
				evEvents.ACTIVE_OBJECT_CHANGE,
				function () {
					var activeObject = parentEntityViewerDataService.getActiveObject()

					// transaction report must ignore active object from groups for now
					if (
						vm.entityType === 'transaction-report' &&
						activeObject &&
						activeObject.___type === 'group'
					) {
						return
					}

					var columns = parentEntityViewerDataService.getColumns()

					vm.entityViewerDataService.setActiveObjectFromAbove(activeObject)
					vm.entityViewerDataService.setAttributesFromAbove(columns)

					vm.entityViewerEventService.dispatchEvent(
						evEvents.ACTIVE_OBJECT_FROM_ABOVE_CHANGE
					)
				}
			)

		parentEvEventListeners['UPDATE_SPLIT_PANEL_TABLE_VIEWPORT'] =
			parentEntityViewerEventService.addEventListener(
				evEvents.UPDATE_SPLIT_PANEL_TABLE_VIEWPORT,
				function () {
					vm.entityViewerEventService.dispatchEvent(
						evEvents.UPDATE_TABLE_VIEWPORT
					)
				}
			)

		parentEvEventListeners['TOGGLE_FILTER_AREA'] =
			parentEntityViewerEventService.addEventListener(
				evEvents.TOGGLE_FILTER_AREA,
				function () {
					vm.entityViewerEventService.dispatchEvent(
						evEvents.UPDATE_FILTER_AREA_SIZE
					)
				}
			)

		vm.entityViewerEventService.addEventListener(
			evEvents.UPDATE_TABLE,
			function () {
				rvDataProviderService.createDataStructure(
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
				// TODO fix when getView finishes too fast, group table directives (gTableComponent, gTopPartDirective etc.) not reinitialized and init methods inside them not called
				var spActiveLayout =
					vm.entityViewerDataService.getSplitPanelLayoutToOpen()

				parentEntityViewerDataService.setSplitPanelLayoutToOpen(spActiveLayout)

				autosaveLayoutService.removeChangesTrackingEventListeners(
					vm.entityViewerEventService
				)
				vm.getView()
			}
		)

		vm.entityViewerEventService.addEventListener(
			evEvents.SPLIT_PANEL_DEFAULT_LIST_LAYOUT_CHANGED,
			function () {
				var spDefaultLayout =
					vm.entityViewerDataService.getSplitPanelDefaultLayout()
				var additions = parentEntityViewerDataService.getAdditions()

				additions.layoutData.layoutId = spDefaultLayout.layoutId
				additions.layoutData.name = spDefaultLayout.name
				additions.layoutData.content_type = spDefaultLayout.content_type
				additions.layoutData.user_code = spDefaultLayout.user_code

				parentEntityViewerDataService.setAdditions(additions)
				parentEntityViewerEventService.dispatchEvent(evEvents.ADDITIONS_CHANGE)
			}
		)

		vm.entityViewerEventService.addEventListener(
			evEvents.ROWS_ACTION_FIRED,
			sharedLogicHelper.executeRowAction
		)

		//# region Events that dispatch events inside parent
		/* Probably for old report viewer interface
            vm.entityViewerEventService.addEventListener(evEvents.TOGGLE_FILTER_AREA, function () {

                parentEntityViewerEventService.dispatchEvent(evEvents.UPDATE_FILTER_AREA_SIZE);

            });*/
		//# endregion

		var parentLayout = parentEntityViewerDataService.getListLayout()
		var parentAdditions = parentEntityViewerDataService.getAdditions()

		// parentLayout.content_type !== parentAdditions.content_type prevents two layouts from overriding each other by auto saving
		if (parentLayout.content_type !== parentAdditions.layoutData.content_type) {
			parentEvEventListeners['TOGGLE_AUTOSAVE'] =
				parentEntityViewerEventService.addEventListener(
					evEvents.TOGGLE_AUTOSAVE,
					function () {
						autosaveLayoutOn = globalDataService.isAutosaveLayoutOn()

						if (autosaveLayoutOn) {
							autosaveLayoutService.initListenersForAutosaveLayout(
								vm.entityViewerDataService,
								vm.entityViewerEventService,
								true
							)

							var layoutHasChanges = evHelperService.checkRootLayoutForChanges(
								vm.entityViewerDataService,
								true
							)

							if (layoutHasChanges) {
								autosaveLayoutService.forceAutosaveLayout()
							}
						} else {
							autosaveLayoutService.removeChangesTrackingEventListeners(
								vm.entityViewerEventService
							)
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
							true
						)
						vm.entityViewerEventService.removeEventListener(
							evEvents.ACTIVE_LAYOUT_CONFIGURATION_CHANGED,
							alcIndex
						)
					}
				)
			}
		}

		vm.entityViewerEventService.addEventListener(
			evEvents.TOGGLE_USE_REPORT_DATE_FROM_ABOVE,
			async function () {
				var reportLayoutOptions =
					vm.entityViewerDataService.getReportLayoutOptions()

				// useDateFromAbove variable assures that parent report dates calculated only when useDateFromAbove activated
				/*var useDateFromAboveChanged = reportLayoutOptions.useDateFromAbove !== useDateFromAbove;

                if (useDateFromAboveChanged) {

                    useDateFromAbove = reportLayoutOptions.useDateFromAbove;

                    if (reportLayoutOptions.useDateFromAbove) {

                        await applyDatesFromParentLayout();
                        procIndex = parentEntityViewerEventService.addEventListener(evEvents.REPORT_OPTIONS_CHANGE, onParentRoChange);

                    } else {

                        await sharedLogicHelper.calculateReportDatesExprs();
                        parentEntityViewerEventService.removeEventListener(evEvents.REPORT_OPTIONS_CHANGE, procIndex);

                    }

                    vm.entityViewerEventService.dispatchEvent(evEvents.REQUEST_REPORT);

                }*/
				useDateFromAbove = reportLayoutOptions.useDateFromAbove

				if (reportLayoutOptions.useDateFromAbove) {
					vm.entityViewerDataService.stashReportDates()

					await applyDatesFromParentLayout()

					parentEvEventListeners['REPORT_OPTIONS_CHANGE'] =
						parentEntityViewerEventService.addEventListener(
							evEvents.REPORT_OPTIONS_CHANGE,
							onParentRoChange
						)
				} else {
					var reportOptions = vm.entityViewerDataService.getReportOptions()
					/* var reportDatesData = vm.entityViewerDataService.getStashedReportDates();

                    if (reportDatesData.dateFrom) {
                        reportOptions[reportDatesData.dateFrom.key] = reportDatesData.dateFrom.value;
                    }

                    reportOptions[reportDatesData.dateTo.key] = reportDatesData.dateTo.value;*/
					vm.entityViewerDataService.applyStashedReportDates(reportOptions)

					await sharedLogicHelper.calculateReportDatesExprs()
					parentEntityViewerEventService.removeEventListener(
						evEvents.REPORT_OPTIONS_CHANGE,
						parentEvEventListeners['REPORT_OPTIONS_CHANGE']
					)
					delete parentEvEventListeners['REPORT_OPTIONS_CHANGE']
				}

				vm.entityViewerEventService.dispatchEvent(
					evEvents.REPORT_OPTIONS_CHANGE
				)
				vm.entityViewerEventService.dispatchEvent(evEvents.REQUEST_REPORT)
			}
		)
	}

	var getLayoutChanges = function () {
		var activeLayoutConfig =
			vm.entityViewerDataService.getActiveLayoutConfiguration()

		if (activeLayoutConfig && activeLayoutConfig.data) {
			var currentLayoutConfig =
				vm.entityViewerDataService.getLayoutCurrentConfiguration(true)

			if (
				!evHelperService.checkForLayoutConfigurationChanges(
					activeLayoutConfig,
					currentLayoutConfig,
					true
				)
			) {
				return currentLayoutConfig
			}
		}

		return false
	}

	splitPanelExchangeService.setSplitPanelLayoutChangesCheckFn(getLayoutChanges)

	/* vm.downloadAttributes = function(){

            var promises = [];

            promises.push(vm.attributeDataService.downloadCustomFieldsByEntityType('balance-report'));
            promises.push(vm.attributeDataService.downloadCustomFieldsByEntityType('pl-report'));
            promises.push(vm.attributeDataService.downloadCustomFieldsByEntityType('transaction-report'));

            promises.push(vm.attributeDataService.downloadDynamicAttributesByEntityType('portfolio'));
            promises.push(vm.attributeDataService.downloadDynamicAttributesByEntityType('account'));
            promises.push(vm.attributeDataService.downloadDynamicAttributesByEntityType('instrument'));
            promises.push(vm.attributeDataService.downloadDynamicAttributesByEntityType('responsible'));
            promises.push(vm.attributeDataService.downloadDynamicAttributesByEntityType('counterparty'));
            promises.push(vm.attributeDataService.downloadDynamicAttributesByEntityType('transaction-type'));
            promises.push(vm.attributeDataService.downloadDynamicAttributesByEntityType('complex-transaction'));

            if (vm.entityType === 'balance-report') {
                promises.push(vm.attributeDataService.downloadInstrumentUserFields());
            }

            if (vm.entityType === 'pl-report') {
                promises.push(vm.attributeDataService.downloadInstrumentUserFields());
            }

            if (vm.entityType === 'transaction-report') {
                promises.push(vm.attributeDataService.downloadInstrumentUserFields());
                promises.push(vm.attributeDataService.downloadTransactionUserFields());
            }

            Promise.all(promises).then(function (data) {

                vm.readyStatus.attributes = true;
                $scope.$apply();

            })

        }; */
	vm.setLayout = function (layout, spDefaultLayoutData) {
		return new Promise(async function (resolve, reject) {
			if (
				typeof layout.data.reportLayoutOptions.useDateFromAbove !== 'boolean'
			) {
				layout.data.reportLayoutOptions.useDateFromAbove = true
			}

			vm.entityViewerDataService.setSplitPanelDefaultLayout(spDefaultLayoutData)
			vm.entityViewerDataService.setLayoutCurrentConfiguration(
				layout,
				uiService,
				true
			)

			// var reportOptions = vm.entityViewerDataService.getReportOptions();
			var reportLayoutOptions =
				vm.entityViewerDataService.getReportLayoutOptions()

			// Check if there is need to solve report datepicker expression
			if (reportLayoutOptions && reportLayoutOptions.datepickerOptions) {
				if (reportLayoutOptions.useDateFromAbove !== false) {
					vm.entityViewerDataService.stashReportDates()

					await applyDatesFromParentLayout()
				} else {
					await sharedLogicHelper.calculateReportDatesExprs()
				}

				sharedLogicHelper.onSetLayoutEnd()
				resolve()

				// < Check if there is need to solve report datepicker expression >
			} else {
				sharedLogicHelper.onSetLayoutEnd()
				resolve()
			}
		})
	}

	var getLayoutForSp = function (additions) {
		/**
		 * @type Number
		 * ID of a layout set by gLayoutsManager to be opened
		 **/
		var splitPanelLayoutToOpen =
			parentEntityViewerDataService.getSplitPanelLayoutToOpen()

		if (splitPanelLayoutToOpen) {
			return uiService.getListLayoutByKey(splitPanelLayoutToOpen)
		} else {
			// open default for split panel layout

			if (additions.layoutData && additions.layoutData.layoutId) {
				if (additions.layoutData.user_code) {
					return new Promise(function (resolve, reject) {
						uiService
							.getListLayoutByUserCode(
								vm.entityType,
								additions.layoutData.user_code
							)
							.then(function (resData) {
								if (resData.results.length) {
									var layoutData = resData.results[0]

									resolve(layoutData)
								} else {
									reject(
										new Error(
											"Layout with user_code: '" +
												additions.layoutData.user_code +
												"' was not found"
										)
									)
								}
							})
							.catch(function (e) {
								reject(e)
							})
					})
				} else if (additions.layoutData.layoutId) {
					return uiService.getListLayoutByKey(additions.layoutData.layoutId)
				}
			}
		}
	}

	vm.getView = function () {
		// middlewareService.setNewSplitPanelLayoutName(false); // reset split panel layout name

		vm.readyStatus.layout = false // switched to true by sharedLogicHelper.onSetLayoutEnd()

		vm.entityViewerDataService = new EntityViewerDataService(reportHelper)
		vm.entityViewerEventService = new EntityViewerEventService()
		vm.attributeDataService = new AttributeDataService(
			metaContentTypesService,
			customFieldService,
			attributeTypeService,
			uiService
		)

		console.log('scope, ', $scope)

		vm.entityType = $scope.$parent.vm.entityType
		/* vm.entityViewerDataService.setEntityType($scope.$parent.vm.entityType);
            vm.entityViewerDataService.setContentType($scope.$parent.vm.contentType);
            vm.entityViewerDataService.setRootEntityViewer(false);
            vm.entityViewerDataService.setUseFromAbove(true);
            vm.entityViewerDataService.setViewContext('split_panel');
            vm.entityViewerDataService.setRowHeight(36); */
		sharedLogicHelper.setLayoutDataForView()
		vm.entityViewerDataService.setViewContext('split_panel')

		var downloadAttrsProm = sharedLogicHelper.downloadAttributes()

		var columns = parentEntityViewerDataService.getColumns()
		var additions = parentEntityViewerDataService.getAdditions()
		var member = parentEntityViewerDataService.getCurrentMember()
		var rootWrapElemData = parentEntityViewerDataService.getRootWrapElemData()

		if (rootWrapElemData) {
			vm.entityViewerDataService.setRootWrapElemData(rootWrapElemData)
		}

		vm.entityViewerDataService.setCurrentMember(member)

		var spDefaultLayoutData = {
			layoutId: additions.layoutData.layoutId,
			name: additions.layoutData.name,
			content_type: additions.layoutData.content_type,
		}

		/*var defaultLayoutId;

            if (splitPanelLayoutToOpen) {
                defaultLayoutId = splitPanelLayoutToOpen;

            } else { // open default for split panel layout

                defaultLayoutId = additions.layoutId; // needed in order for old system layouts to work

                if (additions.layoutData && additions.layoutData.layoutId) {
                    defaultLayoutId = additions.layoutData.layoutId;
                }

            }*/

		vm.entityViewerDataService.setAttributesFromAbove(columns)

		vm.setEventListeners()

		// uiService.getListLayoutByKey(defaultLayoutId).then(function (spLayoutData) {
		getLayoutForSp(additions).then(function (spLayoutData) {
			var setLayoutProm = vm.setLayout(spLayoutData, spDefaultLayoutData)

			Promise.allSettled([downloadAttrsProm, setLayoutProm]).then(function () {
				var reportLayoutOptions =
					vm.entityViewerDataService.getReportLayoutOptions()

				if (reportLayoutOptions.useDateFromAbove) {
					// should be called after vm.setLayout()
					parentEvEventListeners['REPORT_OPTIONS_CHANGE'] =
						parentEntityViewerEventService.addEventListener(
							evEvents.REPORT_OPTIONS_CHANGE,
							onParentRoChange
						)
				}

				$scope.$apply()
			})
		})
	}

	vm.init = function () {
		autosaveLayoutService = new AutosaveLayoutService(
			metaContentTypesService,
			uiService,
			reportHelper
		)

		vm.getView()
	}

	vm.init()

	$scope.$on('$destroy', function () {
		Object.keys(parentEvEventListeners).forEach(function (eventName) {
			var eventIndex = parentEvEventListeners[eventName]

			parentEntityViewerEventService.removeEventListener(eventName, eventIndex)
		})
	})
}
