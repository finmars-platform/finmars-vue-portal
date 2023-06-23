import dashboardEvents from '../../services/dashboard/dashboardEvents'
import dashboardComponentStatuses from '../../services/dashboard/dashboardComponentStatuses'

import transactionTypeService from '../../services/transactionTypeService'
import csvImportSchemeService from '../../services/import/csvImportSchemeService'
import transactionImportSchemeService from '../../services/import/transactionImportSchemeService'
import complexImportSchemeService from '../../services/import/complexImportSchemeService'

import instrumentDownloadSchemeService from '../../services/import/instrumentDownloadSchemeService'

import pricingProcedureService from '../../services/procedures/pricingProcedureService'

import toastNotificationService from '@/angular/core/services/toastNotificationService'

import rvHelper from '../../helpers/rv.helper'

export default function dashboardButtonSetDirective($mdDialog, $state) {
	return {
		restriction: 'E',
		templateUrl: 'views/directives/dashboard/dashboard-button-set-view.html',
		scope: {
			tabNumber: '=',
			rowNumber: '=',
			columnNumber: '=',
			item: '=',
			dashboardDataService: '=',
			dashboardEventService: '=',
		},
		link: function (scope, elem, attr) {
			scope.itemsList = []

			scope.initEventListeners = function () {
				scope.dashboardEventService.addEventListener(
					dashboardEvents.COMPONENT_STATUS_CHANGE,
					function () {
						var status = scope.dashboardDataService.getComponentStatus(
							scope.item.data.id
						)

						if (status === dashboardComponentStatuses.START) {
							// No actual calculation happens, so set to Active state
							scope.dashboardDataService.setComponentStatus(
								scope.item.data.id,
								dashboardComponentStatuses.ACTIVE
							)
							scope.dashboardEventService.dispatchEvent(
								dashboardEvents.COMPONENT_STATUS_CHANGE
							)
						}
					}
				)
			}

			scope.init = function () {
				scope.componentData = scope.dashboardDataService.getComponentById(
					scope.item.data.id
				)

				scope.componentName = scope.componentData.custom_component_name

				scope.rows = scope.componentData.settings.rows
				scope.columns = scope.componentData.settings.columns
				scope.grid = scope.componentData.settings.grid
				scope.showAsDropdown = scope.componentData.settings.showAsDropdown

				if (scope.grid.rows && scope.grid.rows.length) {
					scope.grid.rows.forEach(function (row) {
						row.items.forEach(function (item) {
							if (item.action) {
								scope.itemsList.push(item)
							}
						})
					})
				}

				console.log('scope.grid', scope.grid)
				console.log('scope.grid', scope.columns)
				console.log('scope.itemsList', scope.itemsList)
				console.log('scope.grid', scope.rows)

				scope.dashboardDataService.setComponentStatus(
					scope.item.data.id,
					dashboardComponentStatuses.INIT
				)
				scope.dashboardEventService.dispatchEvent(
					dashboardEvents.COMPONENT_STATUS_CHANGE
				)

				scope.initEventListeners()
			}

			scope.getSelectedText = function () {
				return scope.componentName
			}

			scope.handleAction = function ($event, item) {
				setTimeout(function () {
					scope.componentName = scope.componentData.custom_component_name // important after click thing
				}, 0)

				if (item.action === 'book_transaction') {
					var contextData = {}

					if (item.options && item.options.get_context) {
						var componentsOutputs =
							scope.dashboardDataService.getAllComponentsOutputs()
						var componentsKeysList = Object.keys(componentsOutputs)
						var lastChangedCompId
						var lastOutput

						for (var i = 0; i < componentsKeysList.length; i++) {
							var cKey = componentsKeysList[i]
							var cOutput = componentsOutputs[cKey]

							if (cOutput.changedLast) {
								lastChangedCompId = cKey
								lastOutput = cOutput
								break
							}
						}

						var lastChangedComp =
							scope.dashboardDataService.getComponentById(lastChangedCompId)

						if (
							lastChangedComp.type === 'report_viewer' &&
							lastOutput &&
							lastOutput.data &&
							typeof lastOutput.data === 'object'
						) {
							var reportOptions = lastOutput.data.reportOptions
							contextData = rvHelper.getContextDataForRowAction(
								reportOptions,
								lastOutput.data,
								lastChangedComp.settings.entityType
							)
						}
					}

					if (item.target) {
						transactionTypeService
							.getListLight({
								filters: {
									user_code: item.target,
								},
							})
							.then(function (data) {
								if (data.results.length) {
									// var transactionType = data.results[0];
									var transactionType = data.results.find(function (ttype) {
										return ttype.user_code === item.target
									})

									$mdDialog.show({
										controller: 'ComplexTransactionAddDialogController as vm',
										templateUrl:
											'views/entity-viewer/complex-transaction-add-dialog-view.html',
										parent: angular.element(document.body),
										targetEvent: $event,
										locals: {
											entityType: 'complex-transaction',
											entity: {
												transaction_type: transactionType.id,
											},
											data: {
												contextData: contextData,
											},
										},
									})
								} else {
									toastNotificationService.error(
										'Transaction Type is not found'
									)

									$mdDialog.show({
										controller: 'ComplexTransactionAddDialogController as vm',
										templateUrl:
											'views/entity-viewer/complex-transaction-add-dialog-view.html',
										parent: angular.element(document.body),
										targetEvent: $event,
										locals: {
											entityType: 'complex-transaction',
											entity: {},
											data: {},
										},
									})
								}
							})
					} else {
						$mdDialog.show({
							controller: 'ComplexTransactionAddDialogController as vm',
							templateUrl:
								'views/entity-viewer/complex-transaction-add-dialog-view.html',
							parent: angular.element(document.body),
							targetEvent: $event,
							locals: {
								entityType: 'complex-transaction',
								entity: {},
								data: {},
							},
						})
					}
				} else if (item.action === 'create_new_record') {
					$mdDialog.show({
						controller: 'EntityViewerAddDialogController as vm',
						templateUrl:
							'views/entity-viewer/entity-viewer-add-dialog-view.html',
						parent: angular.element(document.body),
						targetEvent: $event,
						locals: {
							entityType: item.target,
							entity: {},
							data: { openedIn: 'dialog' },
						},
					})
				} else if (item.action === 'run_valuation_procedure') {
					pricingProcedureService
						.getList({
							filters: {
								user_code: item.target,
							},
						})
						.then(function (data) {
							if (data.results.length) {
								var procedure = data.results[0]

								pricingProcedureService
									.runProcedure(procedure.id, procedure)
									.then(function (data) {
										$mdDialog.show({
											controller: 'InfoDialogController as vm',
											templateUrl: 'views/info-dialog-view.html',
											parent: angular.element(document.body),
											targetEvent: $event,
											clickOutsideToClose: false,
											preserveScope: true,
											autoWrap: true,
											skipHide: true,
											multiple: true,
											locals: {
												info: {
													title: 'Success',
													description: 'Procedure is being processed',
												},
											},
										})
									})
							} else {
								toastNotificationService.error('Pricing Procedure is not found')
							}
						})
				} else if (item.action === 'import_data_from_file') {
					if (item.target) {
						csvImportSchemeService
							.getListLight({
								filters: {
									user_code: item.target,
								},
							})
							.then(function (data) {
								if (data.results.length) {
									var scheme = data.results[0]

									$mdDialog.show({
										controller: 'SimpleEntityImportDialogController as vm',
										templateUrl:
											'views/dialogs/simple-entity-import/simple-entity-import-dialog-view.html',
										targetEvent: $event,
										multiple: true,
										locals: {
											data: {
												scheme: scheme,
											},
										},
									})
								} else {
									toastNotificationService.error(
										'Simple Import Scheme is not found'
									)

									$mdDialog.show({
										controller: 'SimpleEntityImportDialogController as vm',
										templateUrl:
											'views/dialogs/simple-entity-import/simple-entity-import-dialog-view.html',
										targetEvent: $event,
										multiple: true,
										locals: {
											data: {},
										},
									})
								}
							})
					} else {
						$mdDialog.show({
							controller: 'SimpleEntityImportDialogController as vm',
							templateUrl:
								'views/dialogs/simple-entity-import/simple-entity-import-dialog-view.html',
							targetEvent: $event,
							multiple: true,
							locals: {
								data: {},
							},
						})
					}
				} else if (item.action === 'import_transactions_from_file') {
					if (item.target) {
						transactionImportSchemeService
							.getListLight({
								filters: {
									user_code: item.target,
								},
							})
							.then(function (data) {
								if (data.results.length) {
									var scheme = data.results.find(function (schemeData) {
										return schemeData.user_code === item.target
									})

									$mdDialog.show({
										controller: 'TransactionImportDialogController as vm',
										templateUrl:
											'views/dialogs/transaction-import/transaction-import-dialog-view.html',
										targetEvent: $event,
										locals: {
											data: {
												scheme: scheme,
											},
										},
									})
								} else {
									toastNotificationService.error(
										'Transaction Import Scheme is not found'
									)

									$mdDialog.show({
										controller: 'TransactionImportDialogController as vm',
										templateUrl:
											'views/dialogs/transaction-import/transaction-import-dialog-view.html',
										targetEvent: $event,
										locals: {
											data: {},
										},
									})
								}
							})
					} else {
						$mdDialog.show({
							controller: 'TransactionImportDialogController as vm',
							templateUrl:
								'views/dialogs/transaction-import/transaction-import-dialog-view.html',
							targetEvent: $event,
							locals: {
								data: {},
							},
						})
					}
				} else if (item.action === 'complex_import_from_file') {
					if (item.target) {
						complexImportSchemeService
							.getList({
								filters: {
									user_code: item.target,
								},
							})
							.then(function (data) {
								if (data.results.length) {
									var scheme = data.results[0]

									$mdDialog.show({
										controller: 'ComplexImportDialogController as vm',
										templateUrl:
											'views/dialogs/complex-import/complex-import-dialog-view.html',
										targetEvent: $event,
										multiple: true,
										locals: {
											data: {
												scheme: scheme,
											},
										},
									})
								} else {
									toastNotificationService.error(
										'Complex Import Scheme is not found'
									)

									$mdDialog.show({
										controller: 'ComplexImportDialogController as vm',
										templateUrl:
											'views/dialogs/complex-import/complex-import-dialog-view.html',
										targetEvent: $event,
										multiple: true,
										locals: {
											data: {},
										},
									})
								}
							})
					} else {
						$mdDialog.show({
							controller: 'ComplexImportDialogController as vm',
							templateUrl:
								'views/dialogs/complex-import/complex-import-dialog-view.html',
							targetEvent: $event,
							multiple: true,
							locals: {
								data: {},
							},
						})
					}
				} else if (item.action === 'open_dashboard') {
					if (item.target) {
						/*$state.go('app.portal.dashboard', {
                                layoutUserCode: item.target
                            }, {reload: 'app'})*/
						var dashboardUrl = $state.href('app.portal.dashboard')
						dashboardUrl = dashboardUrl + '?layout=' + item.target

						window.open(dashboardUrl, '_bland')
					} else {
						toastNotificationService.error('Dashboard Layout is not set')
					}
				} else if (item.action === 'download_instrument') {
					if (item.target) {
						instrumentDownloadSchemeService
							.getList({
								filters: {
									user_code: item.target,
								},
							})
							.then(function (data) {
								if (data.results.length) {
									var scheme = data.results[0]

									$mdDialog.show({
										controller: 'InstrumentDownloadDialogController as vm',
										templateUrl:
											'views/dialogs/instrument-download/instrument-download-dialog-view.html',
										targetEvent: $event,
										multiple: true,
										locals: {
											data: {
												scheme: scheme,
											},
										},
									})
								} else {
									toastNotificationService.error(
										'Instrument Download Scheme is not found'
									)

									$mdDialog.show({
										controller: 'InstrumentDownloadDialogController as vm',
										templateUrl:
											'views/dialogs/instrument-download/instrument-download-dialog-view.html',
										targetEvent: $event,
										multiple: true,
										locals: {
											data: {},
										},
									})
								}
							})
					} else {
						$mdDialog.show({
							controller: 'InstrumentDownloadDialogController as vm',
							templateUrl:
								'views/dialogs/instrument-download/instrument-download-dialog-view.html',
							targetEvent: $event,
							multiple: true,
							locals: {
								data: {},
							},
						})
					}
				} else if (item.action === 'go_to') {
					if (item.target) {
						location.hash = '#!' + item.target
					} else {
						toastNotificationService.error('Link is not set')
					}
				} else if (item.action === 'open_report') {
					var reportViewerRouteMap = {
						'reports.balancereport': 'app.portal.reports.balance-report',
						'reports.plreport': 'app.portal.reports.pl-report',
						'reports.transactionreport':
							'app.portal.reports.transaction-report',
					}

					if (item.target) {
						if (item.target_specific) {
							/* $state.go(reportViewerRouteMap[item.target], {
                                    layoutUserCode: item.target_specific
                                }, {reload: 'app'}) */
							var reportUrl = $state.href(reportViewerRouteMap[item.target])
							reportUrl = reportUrl + '?layout=' + item.target_specific

							window.open(reportUrl, '_bland')
						} else {
							toastNotificationService.error('Report Viewer Layout is not set')
						}
					} else {
						toastNotificationService.error('Entity is not set')
					}
				} else if (item.action === 'open_data_viewer') {
					var entityViewerRouteMap = {
						'portfolios.portfolio': 'app.portal.data.portfolio',
						'accounts.account': 'app.portal.data.account',
						'accounts.accounttype': 'app.portal.data.account-type',
						'counterparties.counterparty': 'app.portal.data.counterparty',
						'counterparties.responsible': 'app.portal.data.responsible',
						'instruments.instrument': 'app.portal.data.instrument',
						'instruments.instrumenttype': 'app.portal.data.instrument-type',
						'transactions.complextransaction':
							'app.portal.data.complex-transaction',
						'transactions.transaction': 'app.portal.data.transaction',
						'transactions.transactiontype': 'app.portal.data.transaction-type',
						'currencies.currencyhistory': 'app.portal.data.currency-history',
						'instruments.pricehistory': 'app.portal.data.price-history',
						'currencies.currency': 'app.portal.data.currency',
						'strategies.strategy1': 'app.portal.data.strategy',
						'strategies.strategy2': 'app.portal.data.strategy',
						'strategies.strategy3': 'app.portal.data.strategy',
					}

					if (item.target) {
						if (item.target_specific) {
							/* $state.go(entityViewerRouteMap[item.target], {
                                    layoutUserCode: item.target_specific
                                }, {reload: 'app'}) */
							var entityViewerUrl = $state.href(
								entityViewerRouteMap[item.target]
							)
							entityViewerUrl =
								entityViewerUrl + '?layout=' + item.target_specific

							window.open(entityViewerUrl, '_bland')
						} else {
							toastNotificationService.error('Entity Viewer Layout is not set')
						}
					} else {
						toastNotificationService.error('Entity is not set')
					}
				}
			}

			scope.init()
		},
	}
}
