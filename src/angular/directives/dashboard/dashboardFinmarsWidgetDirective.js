/**
 * Created by mevstratov on 07.10.2022.
 */

import cookieService from '@/angular/core/services/cookieService'

import dashboardEvents from '../../services/dashboard/dashboardEvents'
import dashboardComponentStatuses from '../../services/dashboard/dashboardComponentStatuses'

import transactionTypeService from '../../services/transactionTypeService'
import csvImportSchemeService from '../../services/import/csvImportSchemeService'
import transactionImportSchemeService from '../../services/import/transactionImportSchemeService'
import complexImportSchemeService from '../../services/import/complexImportSchemeService'

import instrumentDownloadSchemeService from '../../services/import/instrumentDownloadSchemeService'

import pricingProcedureService from '../../services/procedures/pricingProcedureService'
import supersetService from '../../services/supersetService'

import toastNotificationService from '@/angular/core/services/toastNotificationService'
// import embeddedsdk from "@superset-ui/embedded-sdk";
import baseUrlService from '../../services/baseUrlService'

var baseUrl = baseUrlService.resolve()

export default function dashboardFinmarsWidgetDirective(
	$mdDialog,
	$state,
	globalDataService
) {
	return {
		restriction: 'E',
		templateUrl:
			'views/directives/dashboard/dashboard-finmars-widget-view.html',
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

			scope.date_to = null
			scope.portfolio = null

			scope.widgetCreated = false

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

				scope.dashboardEventService.addEventListener(
					dashboardEvents.COMPONENT_OUTPUT_CHANGE,
					function () {
						var componentsOutputs =
							scope.dashboardDataService.getAllComponentsOutputs()

						console.log('componentsOutputs', componentsOutputs)

						Object.keys(componentsOutputs).forEach(function (compKey) {
							if (componentsOutputs[compKey]) {
								try {
									if (componentsOutputs[compKey].name.indexOf('ate') !== -1) {
										if (componentsOutputs[compKey].data) {
											scope.date_to = componentsOutputs[compKey].data.value
										}
									}

									if (
										componentsOutputs[compKey].name.indexOf('ortfolio') !== -1
									) {
										if (componentsOutputs[compKey].data) {
											scope.portfolio = componentsOutputs[compKey].data.value
										}
									}
								} catch (error) {
									console.log('could not fetch value')
								}
							}
						})

						scope.updateWidgetSettings()
					}
				)
			}

			scope.updateWidgetSettings = function () {
				setTimeout(function () {
					scope.createWidgetIfNotExists()
				}, 0)

				if (window.finmarsWidgetsInstance) {
					if (scope.portfolio && scope.date_to) {
						window.finmarsWidgetsInstance.setOptions({
							portfolioId: scope.portfolio, // Readme
							date_to: scope.date_to, // Readme
							date_from: undefined, // Readme
							benchmark: 'sp_500', // Readme
						})
					}
				} else {
					console.warn('finmarsWidgetsInstance is not defined')
				}

				// setTimeout(() => {

				// document.querySelector(scope.containerId).innerHTML = '';

				// console.log('scope.portfolio ', scope.portfolio)
				// console.log('scope.data ',scope.date_to )

				// let FinmarsWidgets2 = new window.FinmarsWidgets({
				//     apiUrl: baseUrl + '/v/',
				//     workspace: scope.currentMasterUser.base_api_url,
				//     apiToken: cookieService.getCookie('access_token'),
				//     // websocketUrl: "wss://finmars.com/",
				//     options: {
				//         portfolioId: scope.portfolio, // Readme
				//         date_to: scope.date_to, // Readme
				//         date_from: undefined, // Readme
				//         benchmark: 'sp_500', // Readme
				//     },
				//     widgets: [
				//         {
				//             name: scope.name,
				//             container: scope.containerId// e.g. finmarsChart1
				//         },
				//         // {
				//         //     name: "balance",
				//         //     container: "#balance_datail" // e.g. finmarsChart1
				//         // },
				//         // {
				//         //     name: "pl",
				//         //     container: "#balance_pl" // e.g. finmarsChart1
				//         // },
				//         // {
				//         //     name: "nav",
				//         //     container: "#balance_nav" // e.g. finmarsChart1
				//         // }
				//     ]
				// })

				// }, 500)
			}

			// TODO do a great refactor, this code so awful
			// TODO Need Default values to widgets init
			// TODO refactor values receiving - Calculation Tab in constructor?
			// TODO remove setTimeouts
			scope.createWidgetIfNotExists = function () {
				if (!scope.widgetCreated) {
					if (scope.portfolio && scope.date_to) {
						console.log('createWidgetIfNotExists going to create widget')

						scope.componentData = scope.dashboardDataService.getComponentById(
							scope.item.data.id
						)

						scope.id = scope.componentData.settings.id
						scope.name = scope.componentData.settings.name

						scope.currentMasterUser = globalDataService.getMasterUser()
						scope.containerId = '#finmars-widget-container-' + scope.id

						console.log(document.querySelector(scope.containerId))

						if (document.querySelector(scope.containerId)) {
							console.log('createWidgetIfNotExists div exists, initing widget')

							scope.componentName = scope.componentData.custom_component_name

							if (!window.finmarsWidgetsInstance) {
								window.finmarsWidgetsInstance = new window.FinmarsWidgets({
									apiUrl: baseUrl + '/v/',
									workspace: scope.currentMasterUser.base_api_url,
									apiToken: cookieService.getCookie('access_token'),
								})
							}

							window.finmarsWidgetsInstance.setOptions({
								portfolioId: scope.portfolio, // Readme
								date_to: scope.date_to, // Readme
								date_from: undefined, // Readme
								benchmark: 'sp_500', // Readme
							})

							window.finmarsWidgetsInstance.addWidget({
								name: scope.name,
								container: scope.containerId, // e.g. finmarsChart1
							})

							scope.widgetCreated = true

							scope.updateWidgetSettings()
						}
					}
				}
			}

			scope.init = function () {
				scope.dashboardDataService.setComponentStatus(
					scope.item.data.id,
					dashboardComponentStatuses.INIT
				)
				scope.dashboardEventService.dispatchEvent(
					dashboardEvents.COMPONENT_STATUS_CHANGE
				)

				scope.componentData = scope.dashboardDataService.getComponentById(
					scope.item.data.id
				)

				scope.id = scope.componentData.settings.id
				scope.name = scope.componentData.settings.name

				scope.initEventListeners()

				setTimeout(function () {
					scope.createWidgetIfNotExists()
				}, 100)
			}

			scope.getSelectedText = function () {
				return scope.componentName
			}

			scope.init()
		},
	}
}
