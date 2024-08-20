/**
 * Created by szhitenev on 05.05.2016.
 */

import localStorageService from '@/angular/shell/scripts/app/services/localStorageService'
import evEvents from '../../services/entityViewerEvents'
// import usersService from '../../services/usersService';
import objectComparison from '../../helpers/objectsComparisonHelper'

import RvSharedLogicHelper from '../../helpers/rvSharedLogicHelper'
import EntityViewerDataService from '../../services/entityViewerDataService'
import EntityViewerEventService from '../../services/eventService'
import AttributeDataService from '../../services/attributeDataService'

// import middlewareService from '../../services/middlewareService';

import rvDataHelper from '../../helpers/rv-data.helper'

import renderHelper from '../../helpers/render.helper'

import dashboardEvents from '../../services/dashboard/dashboardEvents'
import dashboardComponentStatuses from '../../services/dashboard/dashboardComponentStatuses'

export default function (
	$scope,
	$mdDialog,
	toastNotificationService,
	usersService,
	globalDataService,
	priceHistoryService,
	currencyHistoryService,
	metaContentTypesService,
	customFieldService,
	attributeTypeService,
	uiService,
	pricesCheckerService,
	expressionService,
	rvDataProviderService,
	reportHelper,
	gFiltersHelper,
	dashboardHelper
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

	vm.readyStatus = {
		attributes: false,
		layout: false,
	}

	vm.componentData = null
	vm.dashboardDataService = null
	vm.dashboardEventService = null
	vm.dashboardComponentDataService = null
	vm.dashboardComponentEventService = null
	vm.matrixSettings = null

	vm.grandTotalProcessing = true

	vm.linkedActiveObjects = {} // If we have several components linked to spit panel;
	var lastActiveComponentId
	var savedInterfaceLayout
	var savedAddtions

	var componentsForLinking = dashboardHelper.getComponentsForLinking()
	var gotActiveObjectFromLinkedDashboardComp = false

	var fillInModeEnabled = false

	if ($scope.$parent.vm.entityViewerDataService) {
		fillInModeEnabled = true
	}

	//region Functions for context menu
	var updateTableAfterEntityChanges = function (res) {
		/*vm.entityViewerDataService.setActiveObjectAction(null);
			vm.entityViewerDataService.setActiveObjectActionData(null);*/
		vm.entityViewerDataService.setRowsActionData(null)

		if (res && res.status === 'agree') {
			vm.entityViewerDataService.resetData()
			vm.entityViewerDataService.resetRequestParameters()

			var rootGroup = vm.entityViewerDataService.getRootGroupData()

			vm.entityViewerDataService.setActiveRequestParametersId(rootGroup.___id)

			vm.entityViewerEventService.dispatchEvent(evEvents.UPDATE_TABLE)
		}
	}

	/*var getContextData = function (reportOptions, activeObject) {

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
				position_size: null,
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
				contextData.position_size = activeObject['position_size'];
			}

			if (reportOptions['pricing_policy']) {
				contextData.pricing_policy = reportOptions.pricing_policy;
				contextData.pricing_policy_object = Object.assign({}, reportOptions.pricing_policy_object)
			}

			if (activeObject['instrument.pricing_currency.id']) {
				contextData.pricing_currency = activeObject['instrument.pricing_currency.id'];
				contextData.pricing_currency_object = {
					id: activeObject['instrument.pricing_currency.id'],
					name: activeObject['instrument.pricing_currency.name'],
					user_code: activeObject['instrument.pricing_currency.user_code'],
					content_type: "currencies.currency"
				};
			}

			if (activeObject['instrument.accrued_currency.id']) {
				contextData.accrued_currency = activeObject['instrument.accrued_currency.id'];
				contextData.accrued_currency_object = {
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
		};*/

	var createEntity = function (activeObject, locals) {
		var dialogController = 'EntityViewerAddDialogController as vm'
		var dialogTemplateUrl =
			'views/entity-viewer/entity-viewer-add-dialog-view.html'

		if (locals.entityType && locals.entityType === 'complex-transaction') {
			dialogController = 'ComplexTransactionAddDialogController as vm'
			dialogTemplateUrl =
				'views/entity-viewer/complex-transaction-add-dialog-view.html'
		}

		$mdDialog
			.show({
				controller: dialogController,
				templateUrl: dialogTemplateUrl,
				parent: angular.element(document.body),
				targetEvent: activeObject.event,
				locals: locals,
			})
			.then(function (res) {
				updateTableAfterEntityChanges(res)
			})
	}

	var editEntity = function (activeObject, locals) {
		var dialogController = 'EntityViewerEditDialogController as vm'
		var dialogTemplateUrl =
			'views/entity-viewer/entity-viewer-edit-dialog-view.html'

		if (locals.entityType && locals.entityType === 'complex-transaction') {
			dialogController = 'ComplexTransactionEditDialogController as vm'
			dialogTemplateUrl =
				'views/entity-viewer/complex-transaction-edit-dialog-view.html'
		}

		$mdDialog
			.show({
				controller: dialogController,
				templateUrl: dialogTemplateUrl,
				parent: angular.element(document.body),
				targetEvent: activeObject.event,
				locals: locals,
			})
			.then(function (res) {
				updateTableAfterEntityChanges(res)
			})
	}

	var offerToCreateEntity = function (
		activeObject,
		warningDescription,
		createEntityLocals
	) {
		$mdDialog
			.show({
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
						description: warningDescription,
					},
				},
			})
			.then(function (res) {
				if (res.status === 'agree') {
					createEntity(activeObject, createEntityLocals)
				}
			})
	}
	//endregion

	vm.hasFiltersArea = function () {
		return [
			'report_viewer_bars_chart',
			'report_viewer_pie_chart',
			'report_viewer_matrix',
			'report_viewer_table_chart',
		].includes(vm.componentData.type)
	}

	vm.updateGrandTotalComponent = function () {
		// vm.grandTotalError = false;

		rvDataProviderService.updateDataStructure(
			vm.entityViewerDataService,
			vm.entityViewerEventService
		)

		vm.grandTotalProcessing = false

		var rootGroup = vm.entityViewerDataService.getRootGroup()

		var flatList = rvDataHelper.getFlatStructure(vm.entityViewerDataService)





		var root = flatList[0]

		var column_key = vm.componentData.settings.grand_total_column

		var val = root.subtotal[column_key]



		vm.grandTotalNegative = false

		if (vm.componentData.settings.number_format) {
			if (
				vm.componentData.settings.number_format.negative_color_format_id === 1
			) {
				if (val % 1 === 0) {
					// check whether number is float or integer
					if (parseInt(val) < 0) {
						vm.grandTotalNegative = true
					}
				} else {
					if (parseFloat(val) < 0) {
						vm.grandTotalNegative = true
					}
				}
			}

			vm.grandTotalValue = renderHelper.formatValue(
				{
					value: val,
				},
				{
					key: 'value',
					report_settings: vm.componentData.settings.number_format,
				}
			)
		} else {
			vm.grandTotalValue = val
		}

		// if (vm.grandTotalValue == null || isNaN(vm.grandTotalValue)) {
		//     vm.grandTotalError = true
		// }



		// $scope.$apply();
	}

	vm.getOptionsFromDependencies = function () {
		var reportOptions = {}


		if (
			!vm.componentData ||
			!vm.componentData.settings ||
			!vm.componentData.settings.linked_components ||
			!vm.componentData.settings.linked_components.report_settings
		) {
			return reportOptions
		}

		Object.keys(
			vm.componentData.settings.linked_components.report_settings
		).forEach(function (property) {
			var componentId =
				vm.componentData.settings.linked_components.report_settings[property]

			var componentOutput =
				vm.dashboardDataService.getComponentOutput(componentId)

			if (
				!componentOutput ||
				!componentOutput.data ||
				!componentOutput.data.value
			) {
				return reportOptions
			}

			if (
				[
					'accounts',
					'portfolios',
					'strategies1',
					'strategies2',
					'strategies3',
				].includes(property) &&
				!Array.isArray(componentOutput.data.value)
			) {
				reportOptions[property] = [componentOutput.data.value]
			} else if (
				['report_currency', 'pricing_policy'].includes(property) &&
				Array.isArray(componentOutput.data.value) &&
				componentOutput.data.value.length
			) {
				reportOptions[property] = componentOutput.data.value[0]
			} else if (
				componentOutput.data.value !== null ||
				componentOutput.data.value !== undefined
			) {
				reportOptions[property] = componentOutput.data.value
			}
		})

		return reportOptions
	}

	var reportDateProperties = {
		'balance-report': [null, 'report_date'],
		'pl-report': ['pl_first_date', 'report_date'],
		'transaction-report': ['begin_date', 'end_date'],
	}

	/* var calculateReportDateExpr = function (dateExpr, reportOptions, reportDateIndex, dateExprsProms) {

			var dateProp = reportDateProperties[vm.entityType][reportDateIndex];

			var result = expressionService.getResultOfExpression({"expression": dateExpr}).then(function (data) {
				reportOptions[dateProp] = data.result
			});

			dateExprsProms.push(result);

		}; */

	var reportDateIsFromDashboard = function (dashboardReportOptions, dateIndex) {
		var dateProp = reportDateProperties[vm.entityType][dateIndex]
		var roProps = Object.keys(dashboardReportOptions)

		return roProps.includes(dateProp)
	}

	vm.setLayout = function (layout) {
		return new Promise(async function (resolve, reject) {
			if (
				typeof layout.data.reportLayoutOptions.useDateFromAbove !== 'boolean'
			) {
				layout.data.reportLayoutOptions.useDateFromAbove = true
			}

			vm.entityViewerDataService.setLayoutCurrentConfiguration(
				layout,
				uiService,
				true
			)

			var reportOptions = vm.entityViewerDataService.getReportOptions()
			var reportLayoutOptions =
				vm.entityViewerDataService.getReportLayoutOptions()




			var reportOptionsFromDependenciesComponents =
				vm.getOptionsFromDependencies()
			console.log(
				'setLayout.reportOptionsFromDependenciesComponents',
				reportOptionsFromDependenciesComponents
			)

			Object.assign(reportOptions, reportOptionsFromDependenciesComponents)

			// Check are there report datepicker expressions to solve
			if (reportLayoutOptions && reportLayoutOptions.datepickerOptions) {
				/* var firstDateExpr = reportLayoutOptions.datepickerOptions.reportFirstDatepicker.expression; // for pl_first_date, begin_date
					var secondDateExpr = reportLayoutOptions.datepickerOptions.reportLastDatepicker.expression; // for report_date, end_date

					var dateExprsProms = [];

					if (firstDateExpr && !reportDateIsFromDashboard(reportOptionsFromDependenciesComponents, 0)) {

						calculateReportDateExpr(firstDateExpr, reportOptions, 0, dateExprsProms);

					}

					if (secondDateExpr && !reportDateIsFromDashboard(reportOptionsFromDependenciesComponents, 1)) {

						calculateReportDateExpr(secondDateExpr, reportOptions, 1, dateExprsProms);

					}

					Promise.all(dateExprsProms).then(function () {
						resolve();

					}).catch(function () {
						resolve();
					}); */

				var calcReportDateOptions = {
					noDateFromExpr: reportDateIsFromDashboard(
						reportOptionsFromDependenciesComponents,
						0
					),
					noDateToExpr: reportDateIsFromDashboard(
						reportOptionsFromDependenciesComponents,
						1
					),
				}

				await sharedLogicHelper.calculateReportDatesExprs(calcReportDateOptions)

				var activeColumnSortProm = new Promise(function (resolve, reject) {
					var activeColumnSort =
						vm.entityViewerDataService.getActiveColumnSort()



					if (
						activeColumnSort &&
						activeColumnSort.options.sort_settings.layout_user_code
					) {
						uiService
							.getColumnSortDataList({
								filters: {
									user_code:
										activeColumnSort.options.sort_settings.layout_user_code,
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

								resolve()
							})
					} else {
						resolve()
					}
				})

				Promise.all([activeColumnSortProm]).then(function () {
					resolve()
				})
			} else {
				resolve()
			}
			// < Check are there report datepicker expressions to solve >
		})
	}

	vm.handleDashboardFilterLink = function (filter_link) {
		var filters = vm.entityViewerDataService.getFilters()
		var componentOutput = vm.dashboardDataService.getComponentOutput(
			filter_link.component_id
		)




		if (componentOutput && componentOutput.data) {
			var linkedFilterIndex
			var linkedFilter = filters.find(function (item, index) {
				if (
					item.type === 'filter_link' &&
					item.component_id === filter_link.component_id
				) {
					linkedFilterIndex = index
					return item
				}
			})

			if (linkedFilter) {
				linkedFilter.options.filter_values = [componentOutput.data.value]

				if (
					(linkedFilter.value_type === 100 ||
						linkedFilter.value_type !== 'empty') &&
					Array.isArray(componentOutput.data.value)
				) {
					linkedFilter.options.filter_values = componentOutput.data.value
				}

				filters[linkedFilterIndex] = linkedFilter
			} else {
				linkedFilter = {
					type: 'filter_link',
					component_id: filter_link.component_id,
					key: filter_link.key,
					name: filter_link.key,
					value_type: filter_link.value_type,
					options: {
						enabled: true,
						exclude_empty_cells: true,
						filter_values: [componentOutput.data.value],
					},
				}

				switch (filter_link.value_type) {
					case 10:
					case 30:
						linkedFilter.options.filter_type = 'contains'
						break

					case 20:
					case 40:
						linkedFilter.options.filter_type = 'equal'
						break

					case 100:
					case 'field':
						// even if component is single selector, multiselector filter will work
						//
						linkedFilter.value_type = 'field'
						linkedFilter.options.filter_type = 'multiselector'

						if (Array.isArray(componentOutput.data.value)) {
							linkedFilter.options.filter_values = componentOutput.data.value
						}

						break
				}

				filters.push(linkedFilter)
			}

			vm.entityViewerDataService.setFilters(filters)

			vm.entityViewerEventService.dispatchEvent(evEvents.FILTERS_CHANGE)
			vm.entityViewerEventService.dispatchEvent(evEvents.UPDATE_TABLE)
		}
	}

	vm.handleDashboardActiveObject = function (componentId) {
		gotActiveObjectFromLinkedDashboardComp = true
		var componentOutput =
			vm.dashboardDataService.getComponentOutput(componentId)



		//if (vm.componentData.type === 'report_viewer_split_panel' && componentOutput) {
		if (componentOutput) {
			vm.entityViewerDataService.setActiveObject(componentOutput.data)
			vm.entityViewerDataService.setActiveObjectFromAbove(componentOutput.data)

			vm.entityViewerEventService.dispatchEvent(evEvents.ACTIVE_OBJECT_CHANGE)
			vm.entityViewerEventService.dispatchEvent(
				evEvents.ACTIVE_OBJECT_FROM_ABOVE_CHANGE
			)

			var filters = vm.entityViewerDataService.getFilters()
			var useFromAboveFilterIndex = filters.findIndex(function (filter) {
				return (
					filter.options.use_from_above &&
					Object.keys(filter.options.use_from_above).length && // is use from above filter
					componentOutput.data &&
					typeof componentOutput.data === 'object' && // active object is an object
					componentOutput.data.hasOwnProperty(filter.key)
				) // active object contains data for filter
			})

			if (useFromAboveFilterIndex > -1) {
				// use from above filters will change from active object
				vm.dashboardComponentEventService.dispatchEvent(
					dashboardEvents.COMPONENT_BLOCKAGE_ON
				)
			}
		}
	}

	/* vm.applyDashboardChanges = function () {

			if (vm.componentData.settings.linked_components.hasOwnProperty('filter_links')) {

				vm.componentData.settings.linked_components.filter_links.forEach(function (filter_link) {
					vm.handleDashboardFilterLink(filter_link);
				});

			}

			if (vm.componentData.settings.linked_components.hasOwnProperty('report_settings')) {

				Object.keys(vm.componentData.settings.linked_components.report_settings).forEach(function (property) {

					var componentId = vm.componentData.settings.linked_components.report_settings[property];

					var componentOutput = vm.dashboardDataService.getComponentOutput(componentId);

					if (componentOutput && componentOutput.data) {

						var reportOptions = vm.entityViewerDataService.getReportOptions();

						// ;
						// ;
						//
						// ;
						// ;

						if (reportOptions[property] !== componentOutput.data.value) {

							reportOptions[property] = componentOutput.data.value;

							vm.entityViewerDataService.setReportOptions(reportOptions);
							vm.entityViewerDataService.dashboard.setReportDateFromDashboardProp(true);

							vm.entityViewerEventService.dispatchEvent(evEvents.REQUEST_REPORT);
							vm.entityViewerEventService.dispatchEvent(evEvents.REPORT_OPTIONS_CHANGE);

						}

					}

				})

			}

			if (vm.componentData.settings.linked_components.hasOwnProperty('active_object')) { // mark if last active object changed

				if (Array.isArray(vm.componentData.settings.linked_components.active_object)) {

					var lastActiveCompChanged = false;

					for (var i = 0; i < vm.componentData.settings.linked_components.active_object.length; i++) {

						var componentId = JSON.parse(JSON.stringify(vm.componentData.settings.linked_components.active_object[i]));

						var componentOutput = vm.dashboardDataService.getComponentOutput(componentId);

						/!*if (componentOutput && !componentOutput.recalculatedComponents) {
							componentOutput.recalculatedComponents = [];
						}

						if (componentOutput && componentOutput.changedLast &&
							componentOutput.recalculatedComponents.indexOf(vm.componentData.id) < 0) {*!/
						if (componentOutput && componentOutput.changedLast) {

							var compOutputData = componentOutput.data;

							if (lastActiveComponentId !== componentId) {

								lastActiveComponentId = componentId;
								lastActiveCompChanged = true;

							} else {

								if (compOutputData && typeof compOutputData === 'object' &&
									vm.linkedActiveObjects[lastActiveComponentId] &&
									typeof vm.linkedActiveObjects[lastActiveComponentId] === 'object') {

									if (!objectComparison.areObjectsTheSame(compOutputData, vm.linkedActiveObjects[lastActiveComponentId])) {
										lastActiveCompChanged = true;
									}

								} else if (vm.linkedActiveObjects[lastActiveComponentId] !== compOutputData) {
									lastActiveCompChanged = true;
								}

							}

							if (compOutputData !== undefined && compOutputData !== null) {
								vm.linkedActiveObjects[lastActiveComponentId] = JSON.parse(JSON.stringify(compOutputData));
							} else {
								delete vm.linkedActiveObjects[lastActiveComponentId];
							}

							/!*if (lastActiveCompChanged) {
								componentOutput.recalculatedComponents.push(vm.componentData.id);
							}*!/

							break;

						}
					}

					if (lastActiveCompChanged) {
						vm.handleDashboardActiveObject(lastActiveComponentId);
					}

				} else {

					var componentId = vm.componentData.settings.linked_components.active_object;

					vm.handleDashboardActiveObject(componentId);
				}

			}

		};*/

	var updateActiveObjectUsingDashboardData = function () {
		if (
			vm.componentData.settings.linked_components.hasOwnProperty(
				'active_object'
			)
		) {
			// mark if last active object changed

			// Now only last changed active object stored in component output

			// check which one of components (that this component is listening) changed
			if (
				Array.isArray(vm.componentData.settings.linked_components.active_object)
			) {
				var lastActiveCompChanged = false

				for (
					var i = 0;
					i < vm.componentData.settings.linked_components.active_object.length;
					i++
				) {
					var componentId = JSON.parse(
						JSON.stringify(
							vm.componentData.settings.linked_components.active_object[i]
						)
					)

					var componentOutput =
						vm.dashboardDataService.getComponentOutput(componentId)

					// if (componentOutput && componentOutput.changedLast) {
					if (componentOutput && componentOutput.changedLast) {
						var compOutputData = componentOutput.data

						// check if active objects holds new data
						if (lastActiveComponentId !== componentId) {
							lastActiveComponentId = componentId
							lastActiveCompChanged = true
						} else {
							if (
								compOutputData &&
								typeof compOutputData === 'object' &&
								vm.linkedActiveObjects[lastActiveComponentId] &&
								typeof vm.linkedActiveObjects[lastActiveComponentId] ===
									'object'
							) {
								if (
									!objectComparison.areObjectsTheSame(
										compOutputData,
										vm.linkedActiveObjects[lastActiveComponentId]
									)
								) {
									lastActiveCompChanged = true
								}
							} else if (
								vm.linkedActiveObjects[lastActiveComponentId] !== compOutputData
							) {
								lastActiveCompChanged = true
							}
						}

						if (compOutputData !== undefined && compOutputData !== null) {
							vm.linkedActiveObjects[lastActiveComponentId] = JSON.parse(
								JSON.stringify(compOutputData)
							)
						} else {
							delete vm.linkedActiveObjects[lastActiveComponentId]
						}
						// < check if active objects holds new data >
						break
					}
				}

				if (lastActiveCompChanged) {
					vm.handleDashboardActiveObject(lastActiveComponentId)
				}
			} else {
				var componentId =
					vm.componentData.settings.linked_components.active_object
				vm.handleDashboardActiveObject(componentId)
			}
		}
	}

	var updateReportSettingsUsingDashboardData = function () {
		if (
			vm.componentData.settings.linked_components.hasOwnProperty(
				'report_settings'
			)
		) {
			var reportOptionsChanged = false
			var reportOptions = vm.entityViewerDataService.getReportOptions()

			Object.keys(
				vm.componentData.settings.linked_components.report_settings
			).forEach(function (property) {
				var componentId =
					vm.componentData.settings.linked_components.report_settings[property]

				var componentOutput =
					vm.dashboardDataService.getComponentOutput(componentId)
				console.log(
					'updateReportSettingsUsingDashboardData.componentOutput',
					property,
					componentOutput
				)

				if (componentOutput && componentOutput.data) {
					if (reportOptions[property] !== componentOutput.data.value) {
						if (
							[
								'accounts',
								'portfolios',
								'strategies1',
								'strategies2',
								'strategies3',
							].includes(property) &&
							!Array.isArray(componentOutput.data.value)
						) {
							if (componentOutput.data.value) {
								reportOptions[property] = [componentOutput.data.value]
							} else {
								reportOptions[property] = []
							}
						} else if (
							['report_currency', 'pricing_policy'].includes(property) &&
							Array.isArray(componentOutput.data.value)
						) {
							if (vm.componentData.name === 'BALANCE_TYPES') {
								console.log(
									'rv matrix report_currency',
									property,
									componentOutput.data.value[0]
								)
							}
							reportOptions[property] = componentOutput.data.value[0]
						} else {
							reportOptions[property] = componentOutput.data.value
						}

						reportOptionsChanged = true
					}
				}
			})



			if (reportOptionsChanged) {
				vm.entityViewerDataService.setReportOptions(reportOptions)
				vm.entityViewerEventService.dispatchEvent(
					evEvents.REPORT_OPTIONS_CHANGE
				)

				vm.entityViewerDataService.dashboard.setReportDateFromDashboardProp(
					true
				)

				vm.entityViewerEventService.dispatchEvent(evEvents.REQUEST_REPORT)
			}
		}
	}

	var cleanComponentsOutputsToDelete = function (activeTabOnly) {
		var componentsOutputs = vm.dashboardDataService.getAllComponentsOutputs()

		Object.keys(componentsOutputs).forEach(function (compKey) {
			if (
				componentsOutputs[compKey] &&
				typeof componentsOutputs[compKey] === 'object' &&
				componentsOutputs[compKey].deleteOnChange
			) {
				/* if (activeTabOnly) {


					} else {
						vm.dashboardDataService.setComponentOutput(compKey, null);
					} */
				vm.dashboardDataService.setComponentOutput(compKey, null)
			}
		})
	}

	// TODO DEPRECATED, delete soon as dashboard will be discussed
	/* vm.oldEventExchanges = function () {

			if (vm.componentData.settings.linked_components) {

				;

				if (vm.componentData.settings.linked_components.hasOwnProperty('active_object')) {

					var componentId = vm.componentData.settings.linked_components.active_object;

					vm.dashboardEventService.addEventListener('COMPONENT_VALUE_CHANGED_' + componentId, function () {

						vm.handleDashboardActiveObject(componentId)

					})

				}

				if (vm.componentData.settings.linked_components.hasOwnProperty('report_settings')) {

					Object.keys(vm.componentData.settings.linked_components.report_settings).forEach(function (property) {

						var componentId = vm.componentData.settings.linked_components.report_settings[property];

						vm.dashboardEventService.addEventListener('COMPONENT_VALUE_CHANGED_' + componentId, function () {

							var componentOutput = vm.dashboardDataService.getComponentOutput(componentId);

							var reportOptions = vm.entityViewerDataService.getReportOptions();

							;

							reportOptions[property] = componentOutput.value;

							vm.entityViewerDataService.setReportOptions(reportOptions);

							vm.entityViewerEventService.dispatchEvent(evEvents.REQUEST_REPORT)

						})

					})

				}

				if (vm.componentData.settings.linked_components.hasOwnProperty('filter_links')) {

					vm.componentData.settings.linked_components.filter_links.forEach(function (filter_link) {

						vm.dashboardEventService.addEventListener('COMPONENT_VALUE_CHANGED_' + filter_link.component_id, function () {

							vm.handleDashboardFilterLink(filter_link)

						})
					})

				}


			}

			if (vm.componentData.type === 'report_viewer' || vm.componentData.type === 'report_viewer_matrix') {

				vm.entityViewerEventService.addEventListener(evEvents.ACTIVE_OBJECT_CHANGE, function () {

					var activeObject = vm.entityViewerDataService.getActiveObject();

					;

					vm.dashboardDataService.setComponentOutput(vm.componentData.id, activeObject);

					vm.dashboardEventService.dispatchEvent('COMPONENT_VALUE_CHANGED_' + vm.componentData.id)

					if(vm.componentData.settings.auto_refresh) {

						vm.dashboardEventService.dispatchEvent(dashboardEvents.REFRESH_ALL)

					}

				});

			}

		}; */

	vm.getCurrentMember = function () {
		return usersService.getMyCurrentMember().then(function (data) {
			vm.currentMember = data

			$scope.$apply()
		})
	}

	vm.setEventListeners = function () {
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
			evEvents.DATA_LOAD_START,
			function () {
				vm.dashboardComponentEventService.dispatchEvent(
					dashboardEvents.COMPONENT_BLOCKAGE_ON
				)

				vm.entityViewerDataService.setDataLoadStatus(false)

				if (!fillInModeEnabled) {
					vm.dashboardDataService.setComponentStatus(
						vm.componentData.id,
						dashboardComponentStatuses.PROCESSING
					)
					vm.dashboardEventService.dispatchEvent(
						dashboardEvents.COMPONENT_STATUS_CHANGE
					)
				}
			}
		)

		vm.entityViewerEventService.addEventListener(
			evEvents.DATA_LOAD_END,
			function () {
				vm.entityViewerDataService.setDataLoadStatus(true)

				if (!fillInModeEnabled) {
					vm.dashboardDataService.setComponentStatus(
						vm.componentData.id,
						dashboardComponentStatuses.ACTIVE
					)
					vm.dashboardEventService.dispatchEvent(
						dashboardEvents.COMPONENT_STATUS_CHANGE
					)
				}

				vm.dashboardComponentEventService.dispatchEvent(
					dashboardEvents.COMPONENT_BLOCKAGE_OFF
				)
			}
		)

		vm.entityViewerEventService.addEventListener(
			evEvents.COLUMNS_CHANGE,
			function () {
				var columns = vm.entityViewerDataService.getColumns()
				vm.dashboardComponentDataService.setViewerTableColumns(columns)
				//vm.dashboardComponentEventService.dispatchEvent(dashboardEvents.VIEWER_TABLE_COLUMNS_CHANGED);
			}
		)

		switch (vm.componentData.type) {
			case 'report_viewer':
				vm.entityViewerEventService.addEventListener(
					evEvents.ROWS_ACTION_FIRED,
					sharedLogicHelper.executeRowAction
				)
				break

			case 'report_viewer_grand_total':
				vm.entityViewerEventService.addEventListener(
					evEvents.DATA_LOAD_END,
					function () {
						vm.updateGrandTotalComponent()
					}
				)

				break

			case 'report_viewer_matrix':
				vm.entityViewerEventService.addEventListener(
					evEvents.DASHBOARD_COMPONENT_DATA_CHANGED,
					function () {
						vm.componentData.settings.abscissa = vm.matrixSettings.abscissa
						vm.componentData.settings.ordinate = vm.matrixSettings.ordinate
						vm.componentData.settings.value_key = vm.matrixSettings.value_key
					}
				)

				break

			case 'report_viewer_table_chart':
				vm.entityViewerEventService.addEventListener(
					evEvents.DASHBOARD_COMPONENT_DATA_CHANGED,
					function () {
						vm.componentData.settings.title_column =
							vm.tableChartSettings.title_column
						vm.componentData.settings.value_column =
							vm.tableChartSettings.value_column
					}
				)

				vm.entityViewerEventService.addEventListener(
					evEvents.TABLE_CHART_COLUMN_RESIZE_END,
					function () {
						vm.componentData.settings.column_1_width =
							vm.tableChartSettings.column_1_width
						vm.componentData.settings.column_2_width =
							vm.tableChartSettings.column_2_width
						vm.componentData.settings.column_3_width =
							vm.tableChartSettings.column_3_width

						var showNotification = false
						dashboardHelper.saveComponentSettingsFromDashboard(
							vm.dashboardDataService,
							vm.componentData,
							showNotification
						)
					}
				)

				break
		}

		// if (componentsForLinking.indexOf(vm.componentData.type) !== -1) {

		vm.entityViewerEventService.addEventListener(
			evEvents.ACTIVE_OBJECT_CHANGE,
			function () {
				console.log(
					'ACTIVE_OBJECT_CHANGE vm.componentData.type',
					vm.componentData.type
				)
				console.log(
					'ACTIVE_OBJECT_CHANGE vm.componentData.type',
					gotActiveObjectFromLinkedDashboardComp
				)

				var activeObject = vm.entityViewerDataService.getActiveObject()

				if (!gotActiveObjectFromLinkedDashboardComp) {
					var componentsOutputs =
						vm.dashboardDataService.getAllComponentsOutputs()
					var compsKeys = Object.keys(componentsOutputs)

					if (compsKeys.length > 0) {
						compsKeys.forEach(function (compKey) {
							if (componentsOutputs[compKey]) {
								componentsOutputs[compKey].changedLast = false
							}
						})

						vm.dashboardDataService.setAllComponentsOutputs(componentsOutputs)
					}

					if (activeObject) {
						activeObject = JSON.parse(JSON.stringify(activeObject))
						var reportOptions = vm.entityViewerDataService.getReportOptions()

						// used by dashboardButtonsSetDirective
						activeObject.reportOptions = {
							pricing_policy: reportOptions.pricing_policy,
							pricing_policy_object: reportOptions.pricing_policy_object,
						}

						if (vm.entityType === 'balance-report') {
							activeObject.reportOptions.report_date = reportOptions.report_date
						} else if (vm.entityType === 'pl-report') {
							activeObject.reportOptions.pl_first_date =
								reportOptions.pl_first_date
							activeObject.reportOptions.report_date = reportOptions.report_date
						} else if (vm.entityType === 'transaction-report') {
							activeObject.reportOptions.end_date = reportOptions.end_date
							activeObject.reportOptions.begin_date = reportOptions.begin_date
						}
					}

					var compOutputData = {
						changedLast: true,
						deleteOnChange: true,
						data: activeObject,
					}

					vm.dashboardDataService.setComponentOutput(
						vm.componentData.id,
						compOutputData
					)

					vm.dashboardEventService.dispatchEvent(
						'COMPONENT_VALUE_CHANGED_' + vm.componentData.id
					)

					/*if (vm.componentData.settings.auto_refresh) {
						vm.dashboardEventService.dispatchEvent(dashboardEvents.REFRESH_ALL)
					}*/
					vm.dashboardEventService.dispatchEvent(
						dashboardEvents.COMPONENT_OUTPUT_ACTIVE_OBJECT_CHANGE
					)
				} else {
					gotActiveObjectFromLinkedDashboardComp = false // reset variable indicator
				}

				if (vm.componentData.type === 'report_viewer_grand_total') {
					gFiltersHelper.insertActiveObjectDataIntoFilters(
						vm.entityViewerDataService,
						vm.entityViewerEventService
					)
					vm.updateGrandTotalComponent()
				}
			}
		)

		// }

		if (fillInModeEnabled) {
			if (
				vm.componentData.type === 'report_viewer' ||
				vm.componentData.type === 'report_viewer_split_panel'
			) {
				vm.entityViewerEventService.addEventListener(
					evEvents.OPEN_DASHBOARD_COMPONENT_EDITOR,
					function () {
						vm.dashboardComponentEventService.dispatchEvent(
							dashboardEvents.OPEN_COMPONENT_EDITOR
						)
					}
				)
			}
		} else {
			vm.entityViewerEventService.addEventListener(
				evEvents.COLUMNS_CHANGE,
				function () {
					var columns = vm.entityViewerDataService.getColumns()

					if (
						vm.componentData.type === 'report_viewer' ||
						vm.componentData.type === 'report_viewer_split_panel'
					) {
						vm.userSettings.columns = JSON.parse(angular.toJson(columns))
					}
				}
			)

			vm.entityViewerEventService.addEventListener(
				evEvents.RESIZE_COLUMNS_END,
				function () {
					var columns = vm.entityViewerDataService.getColumns()

					if (
						vm.componentData.type === 'report_viewer' ||
						vm.componentData.type === 'report_viewer_split_panel'
					) {
						vm.userSettings.columns = JSON.parse(angular.toJson(columns))
					}
				}
			)
		}

		/* vm.entityViewerEventService.addEventListener(evEvents.ACTIVE_OBJECT_CHANGE, function () {

				var activeObject = vm.entityViewerDataService.getActiveObject();
				var action = vm.entityViewerDataService.getActiveObjectAction();
				var actionData = vm.entityViewerDataService.getActiveObjectActionData();
				var reportOptions = vm.entityViewerDataService.getReportOptions();

				var currencies = reportOptions.item_currencies;

				var getCurrencyObject = function (currencyKey) {
					var currencyObj = {};

					currencies.forEach(function (item) {

						if (item.id === activeObject[currencyKey]) {

							currencyObj.id = item.id;
							currencyObj.name = item.name;
							currencyObj.short_name = item.short_name;
							currencyObj.user_code = item.user_code;

						}

					});

					return currencyObj;
				};

				;
				;
				;

				var contextData = getContextData(reportOptions, activeObject);

				if (activeObject) {

					if (action === 'edit_instrument') {

						var locals = {
							entityType: 'instrument',
							entityId: activeObject['instrument.id'],
							data: {
								contextData: contextData
							}
						};

						editEntity(activeObject, locals);

					}

					if (action === 'edit_account') {

						var locals = {
							entityType: 'account',
							entityId: activeObject['account.id'],
							data: {
								contextData: contextData
							}
						};

						editEntity(activeObject, locals);

					}

					if (action === 'edit_portfolio') {

						var locals = {
							entityType: 'portfolio',
							entityId: activeObject['portfolio.id'],
							data: {
								contextData: contextData
							}
						};

						editEntity(activeObject, locals);

					}

					if (action === 'edit_currency') {

						var locals = {
							entityType: 'currency',
							entityId: activeObject['currency.id'],
							data: {
								contextData: contextData
							}
						};

						editEntity(activeObject, locals);

					}

					if (action === 'edit_pricing_currency') {

						var locals = {
							entityType: 'currency',
							entityId: activeObject['instrument.pricing_currency.id'],
							data: {
								contextData: contextData
							}
						};

						editEntity(activeObject, locals);

					}

					if (action === 'edit_accrued_currency') {

						var locals = {
							entityType: 'currency',
							entityId: activeObject['instrument.accrued_currency.id'],
							data: {
								contextData: contextData
							}
						};

						editEntity(activeObject, locals);

					}

					if (action === 'edit_price') {

						var filters = {
							instrument: activeObject['instrument.id'],
							pricing_policy: reportOptions.pricing_policy,
							date_after: reportOptions.report_date,
							date_before: reportOptions.report_date
						};

						priceHistoryService.getList({filters: filters}).then(function (data) {

							if (data.results.length) {

								var item = data.results[0];

								var locals = {
									entityType: 'price-history',
									entityId: item.id,
									data: {
										contextData: contextData
									}
								};

								editEntity(activeObject, locals);

							} else {

								var warningDescription = 'No corresponding record in Price History. Do you want to add the record?';
								var createEntityLocals = {
									entityType: 'price-history',
									entity: {
										instrument: activeObject['instrument.id'],
										instrument_object: {
											id: activeObject['instrument.id'],
											name: activeObject['instrument.name'],
											user_code: activeObject['instrument.user_code'],
											short_name: activeObject['instrument.short_name']
										},
										pricing_policy: reportOptions.pricing_policy,
										pricing_policy_object: reportOptions.pricing_policy_object,
										date: reportOptions.report_date
									},
									data: {}
								};

								offerToCreateEntity(activeObject, warningDescription, createEntityLocals);

							}

						})


					}

					if (action === 'edit_fx_rate') {

						var filters = {
							instrument: activeObject['instrument.id'],
							pricing_policy: reportOptions.pricing_policy,
							date_0: reportOptions.report_date,
							date_1: reportOptions.report_date
						};

						currencyHistoryService.getList({filters: filters}).then(function (data) {

							if (data.results.length) {

								var item = data.results[0];

								var locals = {
									entityType: 'currency-history',
									entityId: item.id,
									data: {
										contextData: contextData
									}
								};

								editEntity(activeObject, locals);

							} else {

								var warningDescription = 'No corresponding record in FX Rates History. Do you want to add the record?';
								var createEntityLocals = {
									entityType: 'currency-history',
									entity: {
										currency: activeObject['currency.id'],
										currency_object: {
											id: activeObject['currency.id']
										},
										pricing_policy: reportOptions.pricing_policy,
										pricing_policy_object: reportOptions.pricing_policy_object,
										date: reportOptions.report_date
									},
									data: {}
								};

								offerToCreateEntity(activeObject, warningDescription, createEntityLocals);

							}

						})

					}

					if (action === 'edit_pricing_currency_price' && activeObject.id) {

						;

						var filters = {
							currency: activeObject['instrument.pricing_currency'],
							instrument: activeObject['instrument.id'],
							pricing_policy: reportOptions.pricing_policy,
							date_0: reportOptions.report_date,
							date_1: reportOptions.report_date
						};

						currencyHistoryService.getList({filters: filters}).then(function (data) {

							if (data.results.length) {

								var item = data.results[0];

								var locals = {
									entityType: 'currency-history',
									entityId: item.id,
									data: {
										contextData: contextData
									}
								};

								editEntity(activeObject, locals);

							} else {

								var warningDescription = 'No corresponding record in FX Rates History. Do you want to add the record?';

								var currency_object = getCurrencyObject('instrument.pricing_currency');
								var createEntityLocals = {
									entityType: 'currency-history',
									entity: {
										currency: activeObject['instrument.pricing_currency'],
										currency_object: currency_object,
										pricing_policy: reportOptions.pricing_policy,
										pricing_policy_object: reportOptions.pricing_policy_object,
										date: reportOptions.report_date
									},
									data: {}
								};

								offerToCreateEntity(activeObject, warningDescription, createEntityLocals);

							}

						})

					}

					if (action === 'edit_accrued_currency_fx_rate' && activeObject.id) {

						var filters = {
							currency: activeObject['instrument.accrued_currency'],
							instrument: activeObject['instrument.id'],
							pricing_policy: reportOptions.pricing_policy,
							date_0: reportOptions.report_date,
							date_1: reportOptions.report_date
						};

						currencyHistoryService.getList({filters: filters}).then(function (data) {

							if (data.results.length) {

								var item = data.results[0];

								var locals = {
									entityType: 'currency-history',
									entityId: item.id,
									data: {
										contextData: contextData
									}
								};

								editEntity(activeObject, locals);

							} else {

								var warningDescription = 'No corresponding record in FX Rates History. Do you want to add the record?';

								var currency_object = getCurrencyObject('instrument.accrued_currency');
								var createEntityLocals = {
									entityType: 'currency-history',
									entity: {
										currency: activeObject['instrument.accrued_currency'],
										currency_object: currency_object,
										pricing_policy: reportOptions.pricing_policy,
										pricing_policy_object: reportOptions.pricing_policy_object,
										date: reportOptions.report_date
									},
									data: {}
								};

								offerToCreateEntity(activeObject, warningDescription, createEntityLocals);


							}

						})

					}

					if (action === 'book_transaction') {

						var locals = {
							entityType: 'complex-transaction',
							entity: {},
							data: {}
						};

						if (vm.entityType === 'transaction-report') {

							locals.entity.transaction_type = activeObject['complex_transaction.transaction_type.id'];
							locals.data.contextData = contextData;

						}

						createEntity(activeObject, locals);

					}

					if (action === 'book_transaction_specific') {

						var locals = {
							entityType: 'complex-transaction',
							entity: {},
							data: {
								contextData: contextData
							}
						};

						if (actionData && actionData.id) {
							locals.entity.transaction_type = actionData.id
						}

						createEntity(activeObject, locals);

					}

					if (action === 'rebook_transaction') {

						var locals = {
							entityType: 'complex-transaction',
							entityId: activeObject['complex_transaction.id'],
							data: {}
						};

						editEntity(activeObject, locals);

					}
				}

			}); */

		vm.entityViewerEventService.addEventListener(
			evEvents.TOGGLE_SHOW_FROM_ABOVE_FILTERS,
			function () {
				vm.dashboardComponentEventService.dispatchEvent(
					dashboardEvents.TOGGLE_SHOW_FROM_ABOVE_FILTERS
				)
			}
		)
	}

	vm.initDashboardExchange = function () {
		// initialize only for components that are not in filled in mode

		// vm.oldEventExchanges()
		var clearUseFromAboveFilters = function () {
			vm.entityViewerDataService.setActiveObject(null)
			vm.entityViewerDataService.setActiveObjectFromAbove(null)

			console.log(
				'CLEARED ACTIVE OBJECT ',
				vm.entityViewerDataService.getActiveObject()
			)
			console.log(
				'CLEARED ACTIVE OBJECT FROM ABOVE ',
				vm.entityViewerDataService.getActiveObjectFromAbove()
			)

			vm.entityViewerEventService.dispatchEvent(
				evEvents.CLEAR_USE_FROM_ABOVE_FILTERS
			)
		}

		//<editor-fold desc="Dashboard events">
		vm.dashboardEventService.addEventListener(
			dashboardEvents.REFRESH_ALL,
			function () {
				//vm.applyDashboardChanges();
				updateReportSettingsUsingDashboardData()
				cleanComponentsOutputsToDelete()
				clearUseFromAboveFilters()
			}
		)

		vm.dashboardEventService.addEventListener(
			dashboardEvents.REFRESH_ACTIVE_TAB,
			function () {
				var activeTab = vm.dashboardDataService.getActiveTab()




				if (activeTab.tab_number === $scope.$parent.vm.tabNumber) {
					//vm.applyDashboardChanges();
					updateReportSettingsUsingDashboardData()
					cleanComponentsOutputsToDelete()
					clearUseFromAboveFilters()
				}
			}
		)

		vm.dashboardEventService.addEventListener(
			dashboardEvents.COMPONENT_OUTPUT_ACTIVE_OBJECT_CHANGE,
			function () {
				// update report filters from dashboard component

				/*if (vm.componentData.settings.auto_refresh) {
					updateReportSettingsUsingDashboardData();
				}*/

				updateActiveObjectUsingDashboardData()
			}
		)

		vm.dashboardEventService.addEventListener(
			dashboardEvents.COMPONENT_OUTPUT_CHANGE,
			function () {
				// add linked to filter from dashboard component
				if (
					vm.componentData.settings.linked_components.hasOwnProperty(
						'filter_links'
					)
				) {
					vm.componentData.settings.linked_components.filter_links.forEach(
						function (filter_link) {
							vm.handleDashboardFilterLink(filter_link)
						}
					)
				}
				// < add linked to filter from dashboard component >

				if (vm.componentData.settings.auto_refresh) {
					updateReportSettingsUsingDashboardData()
				}
			}
		)

		vm.dashboardEventService.addEventListener(
			dashboardEvents.CLEAR_ACTIVE_TAB_USE_FROM_ABOVE_FILTERS,
			function () {
				var activeTab = vm.dashboardDataService.getActiveTab()

				if (activeTab.tab_number === $scope.$parent.vm.tabNumber) {
					clearUseFromAboveFilters()
				}
			}
		)
		//</editor-fold>

		//<editor-fold desc="Dashboard component events">
		vm.dashboardComponentEventService.addEventListener(
			dashboardEvents.UPDATE_VIEWER_TABLE_COLUMNS,
			function () {
				var columns = vm.dashboardComponentDataService.getViewerTableColumns()
				vm.entityViewerDataService.setColumns(columns)

				vm.entityViewerEventService.dispatchEvent(evEvents.COLUMNS_CHANGE)
				vm.entityViewerEventService.dispatchEvent(evEvents.REDRAW_TABLE)
			}
		)

		vm.dashboardComponentEventService.addEventListener(
			dashboardEvents.SAVE_VIEWER_TABLE_CONFIGURATION,
			function () {
				var currentLayoutConfig =
					vm.entityViewerDataService.getLayoutCurrentConfiguration(true)
				// revert options that were change because of dashboard
				currentLayoutConfig.data.interfaceLayout = savedInterfaceLayout
				currentLayoutConfig.data.additions = savedAddtions

				if (currentLayoutConfig.hasOwnProperty('id')) {
					uiService
						.updateListLayout(currentLayoutConfig.id, currentLayoutConfig)
						.then(function (layoutData) {
							var listLayout = vm.entityViewerDataService.getListLayout()

							listLayout.modified_at = layoutData.modified_at
							currentLayoutConfig.modified_at = layoutData.modified_at
							vm.entityViewerDataService.setActiveLayoutConfiguration({
								layoutConfig: currentLayoutConfig,
							})
						})
				}

				$mdDialog.show({
					controller: 'SaveLayoutDialogController as vm',
					templateUrl: 'views/save-layout-dialog-view.html',
					clickOutsideToClose: false,
				})
			}
		)

		vm.dashboardComponentEventService.addEventListener(
			dashboardEvents.CLEAR_USE_FROM_ABOVE_FILTERS,
			clearUseFromAboveFilters
		)

		vm.dashboardComponentEventService.addEventListener(
			dashboardEvents.RELOAD_COMPONENT,
			function () {
				vm.getView()
			}
		)

		vm.dashboardComponentEventService.addEventListener(
			dashboardEvents.TOGGLE_FILTER_BLOCK,
			function () {
				vm.entityViewerEventService.dispatchEvent(
					dashboardEvents.TOGGLE_FILTER_BLOCK
				)
			}
		)
		//</editor-fold>
	}

	/* vm.downloadAttributes = function () {

			return new Promise(function (resolve, reject) {

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
					// $scope.$apply();

					resolve();

				}).catch(function (error) {

					resolve({errorObj: error, errorCause: 'dynamicAttributes'});

				})

			})

		}; */

	var setDataFromDashboard = function () {
		vm.entityType = $scope.$parent.vm.entityType
		vm.componentData = $scope.$parent.vm.componentData
		vm.userSettings = vm.componentData.user_settings
		vm.dashboardComponentElement = $scope.$parent.vm.componentElement

		vm.dashboardDataService = $scope.$parent.vm.dashboardDataService
		vm.dashboardEventService = $scope.$parent.vm.dashboardEventService
		vm.dashboardComponentDataService =
			$scope.$parent.vm.dashboardComponentDataService
		vm.dashboardComponentEventService =
			$scope.$parent.vm.dashboardComponentEventService

		if (
			(vm.componentData.type === 'report_viewer' ||
				vm.componentData.type === 'report_viewer_split_panel') &&
			vm.userSettings
		) {
			// Set attributes available for columns addition
			if (
				vm.userSettings.manage_columns &&
				vm.userSettings.manage_columns.length > 0
			) {
				vm.attributeDataService.setAttributesAvailableForColumns(
					vm.userSettings.manage_columns
				)
			}

			if (
				vm.componentData.settings.styles &&
				vm.componentData.settings.styles.cell.text_align
			) {
				vm.entityViewerDataService.dashboard.setColumnsTextAlign(
					vm.componentData.settings.styles.cell.text_align
				)
			}
		}

		if (vm.componentData.type === 'report_viewer_matrix') {
			vm.matrixSettings = {
				top_left_title: vm.componentData.settings.top_left_title,

				abscissa: vm.componentData.settings.abscissa,
				ordinate: vm.componentData.settings.ordinate,
				value_key: vm.componentData.settings.value_key,
				available_abscissa_keys:
					vm.componentData.user_settings.available_abscissa_keys,
				available_ordinate_keys:
					vm.componentData.user_settings.available_ordinate_keys,
				available_value_keys:
					vm.componentData.user_settings.available_value_keys,

				number_format: vm.componentData.settings.number_format,
				subtotal_formula_id: vm.componentData.settings.subtotal_formula_id,

				matrix_view: vm.componentData.settings.matrix_view, // DEPRECATED possibly

				styles: vm.componentData.settings.styles,
				auto_scaling: vm.componentData.settings.auto_scaling,
				calculate_name_column_width:
					vm.componentData.settings.calculate_name_column_width,
				hide_empty_lines: vm.componentData.settings.hide_empty_lines,
			}
		}

		if (vm.componentData.type === 'report_viewer_table_chart') {
			console.log(
				'DasboardReportViewer.report_viewer_table_chart.vm.componentData',
				vm.componentData
			)

			vm.tableChartSettings = {
				title_column: vm.componentData.settings.title_column,
				value_column: vm.componentData.settings.value_column,

				column_1_width: vm.componentData.settings.column_1_width,
				column_2_width: vm.componentData.settings.column_2_width,
				column_3_width: vm.componentData.settings.column_3_width,

				title_column_name: vm.componentData.settings.title_column_name,
				value_column_name: vm.componentData.settings.value_column_name,

				available_title_column_keys:
					vm.componentData.user_settings.available_title_column_keys,
				available_value_column_keys:
					vm.componentData.user_settings.available_value_column_keys,

				number_format: vm.componentData.settings.number_format,
			}
		}

		if (vm.componentData.type === 'report_viewer_bars_chart') {
			vm.rvChartsSettings = {
				bar_name_key: vm.componentData.settings.bar_name_key,
				bar_number_key: vm.componentData.settings.bar_number_key,
				bars_direction: vm.componentData.settings.bars_direction,
				group_number_calc_formula:
					vm.componentData.settings.group_number_calc_formula,
				min_bar_width: vm.componentData.settings.min_bar_width,
				max_bar_width: vm.componentData.settings.max_bar_width,
				sorting_value_type: vm.componentData.settings.sorting_value_type,
				sorting_type: vm.componentData.settings.sorting_type,
				autocalc_ticks_number: vm.componentData.settings.autocalc_ticks_number,
				ticks_number: vm.componentData.settings.ticks_number,
				crop_tick_text: vm.componentData.settings.crop_tick_text,
				tooltip_font_size: vm.componentData.settings.tooltip_font_size,
				number_format: vm.componentData.settings.number_format,
				abscissa_position: vm.componentData.settings.abscissa_position,
				ordinate_position: vm.componentData.settings.ordinate_position,
			}

			if (
				vm.componentData.settings.abscissa ||
				vm.componentData.settings.ordinate
			) {
				vm.rvChartsSettings.bar_name_key = vm.componentData.settings.abscissa
				vm.rvChartsSettings.bar_number_key = vm.componentData.settings.ordinate
			}
		}

		if (vm.componentData.type === 'report_viewer_pie_chart') {
			vm.rvChartsSettings = {
				group_attr: vm.componentData.settings.group_attr,
				number_attr: vm.componentData.settings.number_attr,
				group_number_calc_formula:
					vm.componentData.settings.group_number_calc_formula,
				show_legends: vm.componentData.settings.show_legends,
				legends_font_size: vm.componentData.settings.legends_font_size,
				legends_position: vm.componentData.settings.legends_position,
				legends_columns_number:
					vm.componentData.settings.legends_columns_number,
				number_format: vm.componentData.settings.number_format,
				tooltip_font_size: vm.componentData.settings.tooltip_font_size,
				chart_form: vm.componentData.settings.chart_form,
				pie_size_percent: vm.componentData.settings.pie_size_percent,
			}
		}
	}

	let getLayoutById = function (layoutId) {
		return new Promise(function (resolve, reject) {
			let actualLayoutsIds = vm.dashboardDataService.getActualRvLayoutsInCache()

			if (actualLayoutsIds.includes(layoutId)) {
				let cachedLayout = localStorageService.getCachedLayout(layoutId)
				resolve(cachedLayout)
			} else {
				uiService
					.getListLayoutByKey(layoutId)
					.then(function (layoutData) {
						vm.dashboardDataService.pushToActualRvLayoutsInCache(layoutId)
						resolve(layoutData)
					})
					.catch(function (error) {
						reject(error)
					})
			}
		})
	}

	vm.getView = function () {
		// middlewareService.setNewSplitPanelLayoutName(false); // reset split panel layout name

		vm.readyStatus.layout = false

		vm.entityViewerDataService = new EntityViewerDataService(reportHelper)
		vm.entityViewerEventService = new EntityViewerEventService()
		vm.attributeDataService = new AttributeDataService(
			metaContentTypesService,
			customFieldService,
			attributeTypeService,
			uiService
		)

		//;

		setDataFromDashboard()

		vm.entityViewerDataService.setViewContext('dashboard')

		var downloadAttrsPromise = sharedLogicHelper.downloadAttributes()
		vm.setEventListeners()



		/* vm.entityViewerDataService.setEntityType(vm.entityType);
			vm.entityViewerDataService.setContentType($scope.$parent.vm.contentType);
			vm.entityViewerDataService.setRootEntityViewer(true);
			vm.entityViewerDataService.setRowHeight(36);
			vm.entityViewerDataService.setVirtualScrollStep(500);
			vm.entityViewerDataService.setCurrentMember(vm.currentMember);

			if (vm.componentData.type === 'report_viewer_split_panel') {
				vm.entityViewerDataService.setUseFromAbove(true);
			} */
		sharedLogicHelper.setLayoutDataForView()
		vm.entityViewerDataService.setRootEntityViewer(true)
		vm.entityViewerDataService.setUseFromAbove(true)

		var layoutId = vm.componentData.settings.layout

		var setLayoutPromise = new Promise(function (resolve, reject) {
			// uiService.getListLayoutByKey(layoutId).then(function (data) {
			getLayoutById(layoutId)
				.then(function (data) {
					// vm.layout = data;

					vm.setLayout(data).then(function () {
						// needed to prevent saving layout as collapsed when saving it from dashboard
						var interfaceLayout =
							vm.entityViewerDataService.getInterfaceLayout()
						savedInterfaceLayout = JSON.parse(JSON.stringify(interfaceLayout))

						var additions = vm.entityViewerDataService.getAdditions()
						savedAddtions = JSON.parse(JSON.stringify(additions))

						// rvDataProviderService.requestReport(vm.entityViewerDataService, vm.entityViewerEventService);

						if (
							vm.componentData.type === 'report_viewer' ||
							vm.componentData.type === 'report_viewer_split_panel'
						) {
							var evComponents = vm.entityViewerDataService.getComponents()

							Object.keys(vm.componentData.settings.components).forEach(
								(key) => {
									evComponents[key] = vm.componentData.settings.components[key]
								}
							)

							vm.entityViewerDataService.setComponents(evComponents)

							//<editor-fold desc="Set dashboard columns list for small rv table">
							if (
								vm.userSettings &&
								vm.userSettings.columns &&
								vm.userSettings.columns.length
							) {
								if (fillInModeEnabled) {
									var listLayout = vm.entityViewerDataService.getListLayout()
									var columns = listLayout.data.columns
								} else {
									var columns = JSON.parse(
										JSON.stringify(vm.userSettings.columns)
									)

									var listLayout = vm.entityViewerDataService.getListLayout()
									var layoutColumns = listLayout.data.columns
									var layoutGroups = listLayout.data.grouping
									var groupColumns = []

									if (layoutGroups.length) {
										groupColumns = layoutColumns.slice(0, layoutGroups.length)
									}

									layoutColumns.forEach((layoutColumn) => {
										var groupColumn = layoutGroups.find(
											(group) => group.key === layoutColumn.key
										)

										if (groupColumn) {
											// remove groups column

											var groupColIndex = columns.findIndex(
												(column) => column.key === layoutColumn.key
											)
											if (groupColIndex > -1) columns.splice(groupColIndex, 1)
										} else {
											var column = columns.find(function (itemColumn) {
												return itemColumn.key === layoutColumn.key
											})

											if (column && !column.layout_name) {
												column.layout_name = layoutColumn.layout_name
											}
										}
									})

									columns = groupColumns.concat(columns)
								}

								vm.entityViewerDataService.setColumns(columns)
							}
							//</editor-fold desc="Set dashboard columns list for small rv table">
						}

						vm.initDashboardExchange()

						vm.entityViewerEventService.dispatchEvent(
							evEvents.UPDATE_TABLE_VIEWPORT
						)

						/* vm.readyStatus.layout = true;

						$scope.$apply(); */
						sharedLogicHelper.onSetLayoutEnd()

						resolve()
					})
				})
				.catch(function (error) {
					reject({ errorObj: error, errorCause: 'layout' })
				})
		})

		var crossEntityAttributeExtensionProm = new Promise(function (
			resolve,
			reject
		) {
			uiService
				.getCrossEntityAttributeExtensionList({
					filters: {
						context_content_type: $scope.$parent.vm.contentType,
					},
				})
				.then(function (data) {
					vm.entityViewerDataService.setCrossEntityAttributeExtensions(
						data.results
					)
					resolve()
				})
				.catch((error) => reject(error))
		})

		Promise.all([
			downloadAttrsPromise,
			setLayoutPromise,
			crossEntityAttributeExtensionProm,
		])
			.then(function () {
				vm.dashboardComponentDataService.setEntityViewerDataService(
					vm.entityViewerDataService
				)
				vm.dashboardComponentDataService.setEntityViewerEventService(
					vm.entityViewerEventService
				)

				vm.dashboardComponentDataService.setAttributeDataService(
					vm.attributeDataService
				)
				vm.dashboardComponentEventService.dispatchEvent(
					dashboardEvents.ATTRIBUTE_DATA_SERVICE_INITIALIZED
				)
				vm.dashboardComponentEventService.dispatchEvent(
					dashboardEvents.REPORT_VIEWER_DATA_SERVICE_SET
				)

				var columns = vm.entityViewerDataService.getColumns()
				vm.dashboardComponentDataService.setViewerTableColumns(columns)

				$scope.$apply()
				//vm.dashboardComponentEventService.dispatchEvent(dashboardEvents.VIEWER_TABLE_COLUMNS_CHANGED);
			})
			.catch(function (error) {
				if (error.errorCause === 'layout') {
					vm.dashboardDataService.setComponentError(vm.componentData.id, {
						displayMessage: 'failed to load report layout',
					})
				}

				vm.dashboardDataService.setComponentStatus(
					vm.componentData.id,
					dashboardComponentStatuses.ERROR
				)
				vm.dashboardEventService.dispatchEvent(
					dashboardEvents.COMPONENT_STATUS_CHANGE
				)
				console.error(
					'Dashboard component that uses report viewer error',
					error
				)
			})
	}

	var applySettingsForFilledInMode = function () {
		var listLayout = vm.entityViewerDataService.getListLayout()
		var columns = listLayout.data.columns
		vm.entityViewerDataService.setColumns(columns)

		var components = vm.entityViewerDataService.getComponents()
		components.sidebar = true
		components.topPart = true
	}

	var getViewInsideFilledInComponent = function () {
		vm.entityViewerDataService = $scope.$parent.vm.entityViewerDataService
		vm.entityViewerEventService = new EntityViewerEventService()
		vm.attributeDataService = $scope.$parent.vm.attributeDataService

		setDataFromDashboard()
		vm.setEventListeners()

		applySettingsForFilledInMode()

		vm.readyStatus.layout = true
		vm.readyStatus.attributes = true

		vm.entityViewerEventService.dispatchEvent(evEvents.UPDATE_TABLE_VIEWPORT)
		vm.entityViewerEventService.dispatchEvent(evEvents.DATA_LOAD_END)

		vm.dashboardComponentDataService.setAttributeDataService(
			vm.attributeDataService
		)
		vm.dashboardComponentEventService.dispatchEvent(
			dashboardEvents.ATTRIBUTE_DATA_SERVICE_INITIALIZED
		)
	}

	vm.init = function () {
		if (fillInModeEnabled) {
			getViewInsideFilledInComponent()
		} else {
			vm.getCurrentMember().then(function () {
				vm.getView()
			})
		}
	}

	vm.init()
}
