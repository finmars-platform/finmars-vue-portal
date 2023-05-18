/**
 * Created by vzubr on 02.12.2020.
 * */

import metaService from '../../services/metaService'
import evEvents from '../../services/entityViewerEvents'

import currencyService from '../../services/currencyService'

export default function (
	$mdDialog,
	$state,
	usersService,
	ecosystemDefaultService,
	globalDataService,
	evRvLayoutsHelper,
	reportHelper
) {
	return {
		restrict: 'E',
		templateUrl: 'views/directives/groupTable/g-top-part-view.html',
		scope: {
			evDataService: '=',
			evEventService: '=',
			attributeDataService: '=',
			spExchangeService: '=',
		},
		link: function (scope) {
			scope.entityType = scope.evDataService.getEntityType()
			scope.isReport = metaService.isReport(scope.entityType) || false
			scope.reportOptions = scope.evDataService.getReportOptions()
			scope.isRootEntityViewer = scope.evDataService.isRootEntityViewer()
			scope.viewContext = scope.evDataService.getViewContext()

			scope.globalTableSearch = ''

			scope.layoutData = {
				name: '',
			}

			let listLayout = scope.evDataService.getListLayout()

			let dateFromKey
			let dateToKey

			if (listLayout && listLayout.name) {
				scope.layoutData.name = listLayout.name
			}

			scope.popupData = {
				entityType: scope.entityType,
				evDataService: scope.evDataService,
				evEventService: scope.evEventService,
				spExchangeService: scope.spExchangeService,
			}

			scope.onGlobalTableSearchChange = function () {
				scope.evDataService.setGlobalTableSearch(scope.globalTableSearch)

				if (!scope.isReport) {
					scope.evDataService.resetTableContent(false)
				}

				scope.evEventService.dispatchEvent(evEvents.UPDATE_TABLE)
			}

			scope.saveLayoutList = function ($event) {
				var isNewLayout = scope.evDataService.isLayoutNew()

				if (isNewLayout) {
					evRvLayoutsHelper.saveAsLayoutList(
						scope.evDataService,
						scope.evEventService,
						scope.isReport,
						$mdDialog,
						scope.entityType,
						$event
					)
				} else {
					evRvLayoutsHelper.saveLayoutList(
						scope.evDataService,
						scope.isReport,
						usersService,
						globalDataService
					)
				}
			}

			scope.openMissingPricesDialog = function ($event) {
				$mdDialog.show({
					controller: 'ReportPriceCheckerDialogController as vm',
					templateUrl:
						'views/dialogs/report-missing-prices/report-price-checker-dialog-view.html',
					parent: angular.element(document.body),
					targetEvent: $event,
					locals: {
						data: {
							missingPricesData: scope.missingPricesData,
							evDataService: scope.evDataService,
						},
					},
				})
			}

			scope.toggleFilterBlock = function ($event) {
				const elem = $event.currentTarget
				elem.classList.contains('active')
					? elem.classList.remove('active')
					: elem.classList.add('active')

				scope.evEventService.dispatchEvent(evEvents.TOGGLE_FILTER_BLOCK)
			}

			var openReportSettings = function ($event) {
				// var reportOptions = scope.evDataService.getReportOptions();

				$mdDialog
					.show({
						controller: 'GReportSettingsDialogController as vm',
						templateUrl: 'views/dialogs/g-report-settings-dialog-view.html',
						parent: angular.element(document.body),
						targetEvent: $event,
						multiple: true,
						locals: {
							/*reportOptions: reportOptions,
                            options: {
                                entityType: scope.entityType
                            }*/
							data: {
								evDataService: scope.evDataService,
								evEventService: scope.evEventService,
								attributeDataService: scope.attributeDataService,
							},
						},
					})
					.then(function (res) {
						if (res.status === 'agree') {
							scope.evDataService.setReportLayoutOptions(
								res.data.reportLayoutOptions
							)
							scope.evDataService.setReportOptions(res.data.reportOptions)

							scope.evEventService.dispatchEvent(evEvents.REPORT_OPTIONS_CHANGE)
						}
					})
			}

			var openEntityViewerSettings = function ($event) {
				$mdDialog
					.show({
						controller: 'GEntityViewerSettingsDialogController as vm',
						templateUrl:
							'views/dialogs/g-entity-viewer-settings-dialog-view.html',
						parent: angular.element(document.body),
						targetEvent: $event,
						locals: {
							entityViewerDataService: scope.evDataService,
							entityViewerEventService: scope.evEventService,
						},
					})
					.then(function (res) {
						if (res.status === 'agree') {
							scope.evEventService.dispatchEvent(
								evEvents.ENTITY_VIEWER_SETTINGS_CHANGED
							)
						}
					})
			}

			scope.onSettingsClick = scope.isReport
				? openReportSettings
				: openEntityViewerSettings

			var datesKeysData = [
				{
					'pl-report': 'pl_first_date',
					'transaction-report': 'begin_date',
				},
				{
					'balance-report': 'report_date',
					'pl-report': 'report_date',
					'transaction-report': 'end_date',
				},
			]

			var prepareReportLayoutOptions = function () {
				scope.reportLayoutOptions = scope.evDataService.getReportLayoutOptions()

				// preparing data for complexZhDatePickerDirective
				if (!scope.reportLayoutOptions.hasOwnProperty('datepickerOptions')) {
					scope.reportLayoutOptions.datepickerOptions = {}
				}

				if (
					!scope.reportLayoutOptions.datepickerOptions.hasOwnProperty(
						'reportFirstDatepicker'
					)
				) {
					scope.reportLayoutOptions.datepickerOptions.reportFirstDatepicker = {}
				}

				if (
					!scope.reportLayoutOptions.datepickerOptions.hasOwnProperty(
						'reportLastDatepicker'
					)
				) {
					scope.reportLayoutOptions.datepickerOptions.reportLastDatepicker = {}
				}

				/*scope.reportLayoutOptions.datepickerOptions.reportFirstDatepicker.dateKey = datesKeysData[0][scope.entityType];
                    scope.reportLayoutOptions.datepickerOptions.reportLastDatepicker.dateKey = datesKeysData[1][scope.entityType];*/

				/* if (scope.entityType === 'pl-report' || scope.entityType === 'transaction-report') {

                        if (scope.entityType === 'transaction-report') {
                            scope.datepickerFromDisplayOptions = {
                                position: 'left',
                                labelName: 'Date from (incl)'
                            };
                        }

                        scope.datepickerToDisplayOptions = {
                            position: 'left',
                            labelName: 'Date to (incl)',
                            modes: {
                                inception: false
                            }
                        }
                    } */
				/* < preparing data for complexZhDatePickerDirective > */

				if (typeof scope.reportLayoutOptions.useDateFromAbove !== 'boolean') {
					scope.reportLayoutOptions.useDateFromAbove = true
				}
			}

			const getCurrencies = function () {
				const currencyOptions = {
					pageSize: 1000,
					page: 1,
				}

				new Promise(function (resolve, reject) {
					currencyService
						.getListLight(currencyOptions)
						.then(async function (data) {
							scope.currencies = scope.currencies.concat(data.results)

							if (!scope.currencies.length) {
								const ecosystemDefaultData = await ecosystemDefaultService
									.getList()
									.then((res) => res.results[0])
								scope.currencies.push(ecosystemDefaultData.currency_object)
								scope.reportOptions.report_currency =
									ecosystemDefaultData.currency_object.id
							}

							if (data.next) {
								currencyOptions.page = currencyOptions.page + 1
								// Victor 2020.12.03 may be not need
								//getPricingPolicies(resolve, reject);
							} else {
								scope.$apply()
								resolve(true)
							}
						})
						.catch(function (error) {
							reject(error)
						})
				})
			}

			const updateReportLayoutOptions = function () {
				const reportLayoutOptions = scope.evDataService.getReportLayoutOptions()
				const newReportLayoutOptions = {
					...reportLayoutOptions,
					...scope.reportLayoutOptions,
				}

				scope.evDataService.setReportLayoutOptions(newReportLayoutOptions)
			}

			if (scope.isReport) {
				scope.currencies = []
				/*scope.dateFrom = scope.reportOptions[dateFromKey];
                    scope.dateTo = scope.reportOptions[dateToKey];*/
				scope.onReportDateChange = function () {
					if (
						scope.viewContext !== 'split_panel' ||
						!scope.reportLayoutOptions.useDateFromAbove
					) {
						if (dateFromKey) {
							scope.reportOptions[dateFromKey] = scope.datesData.from
						}

						scope.reportOptions[dateToKey] = scope.datesData.to
					}

					scope.updateReportOptions()
				}

				scope.toggleUseDateFromAbove = function () {
					// reportLayoutOptions.useDateFromAbove updated inside entityViewerDataService by mutation
					updateReportLayoutOptions()

					scope.evEventService.dispatchEvent(
						evEvents.TOGGLE_USE_REPORT_DATE_FROM_ABOVE
					)

					// event REPORT_OPTIONS_CHANGE dispatched from splitPanelReportViewerController as reaction to TOGGLE_USE_REPORT_DATE_FROM_ABOVE
					if (scope.viewContext !== 'split_panel') {
						scope.evEventService.dispatchEvent(evEvents.REPORT_OPTIONS_CHANGE)
					}
				}

				scope.useDateFromAboveName =
					scope.entityType === 'balance-report' ? 'Link date' : 'Link date'
			}

			scope.updateReportOptions = function () {
				var reportOptions = scope.evDataService.getReportOptions()
				// delete reportLayoutOptions.datepickerOptions.reportFirstDatepicker.secondDate;
				var newReportOptions = Object.assign(
					{},
					reportOptions,
					scope.reportOptions
				)

				scope.evDataService.setReportOptions(newReportOptions)

				updateReportLayoutOptions()

				scope.evEventService.dispatchEvent(evEvents.REPORT_OPTIONS_CHANGE)

				setTimeout(function () {
					scope.$apply()
				}, 200)
			}

			/*scope.toggleUseDateFromAbove = scope.updateReportOptions;

                if (!scope.isRootEntityViewer) {

                    scope.toggleUseDateFromAbove = function () {

                        if (!scope.reportLayoutOptions.useDateFromAbove) {

                            if (dateFromKey) {
                                scope.reportOptions[dateFromKey] = scope.reportLayoutOptions.datepickerOptions.reportFirstDatepicker.date;
                            }

                            scope.reportOptions[dateToKey] = scope.reportLayoutOptions.datepickerOptions.reportLastDatepicker.date;

                        }

                        scope.updateReportOptions();

                    };

                }*/

			var initEventListeners = function () {
				scope.evEventService.addEventListener(
					evEvents.LAYOUT_NAME_CHANGE,
					function () {
						listLayout = scope.evDataService.getListLayout()

						if (listLayout && listLayout.name) {
							scope.layoutData.name = listLayout.name
						}
					}
				)

				scope.evEventService.addEventListener(
					evEvents.MISSING_PRICES_LOAD_END,
					function () {
						scope.missingPricesData = scope.evDataService.getMissingPrices()
					}
				)

				if (scope.isReport) {
					scope.evEventService.addEventListener(
						evEvents.REPORT_OPTIONS_CHANGE,
						function () {
							scope.reportOptions = scope.evDataService.getReportOptions()
							scope.reportLayoutOptions =
								scope.evDataService.getReportLayoutOptions()

							if (dateFromKey) {
								scope.datesData.from = scope.reportOptions[dateFromKey]
							}

							scope.datesData.to = scope.reportOptions[dateToKey]
						}
					)
				}
			}

			const init = async function () {
				scope.missingPricesData = scope.evDataService.getMissingPrices()

				if (scope.isReport) {
					getCurrencies()

					prepareReportLayoutOptions()
					;[dateFromKey, dateToKey] = reportHelper.getDateProperties(
						scope.entityType
					)

					scope.datesData = {
						to: scope.reportOptions[dateToKey],
					}

					if (dateFromKey)
						scope.datesData.from = scope.reportOptions[dateFromKey]
				}

				initEventListeners()
			}

			init()
		},
	}
}
