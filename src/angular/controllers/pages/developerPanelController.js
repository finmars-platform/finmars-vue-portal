// import {embedDashboard} from "@/angular/core/superset";

/**
 * Created by mevstratov on 24.06.2019.
 */

import instrumentDownloadSchemeService from '../../services/import/instrumentDownloadSchemeService'
import instrumentEventService from '../../services/instrumentEventService'
import supersetService from '../../services/supersetService'
import embeddedsdk from '@superset-ui/embedded-sdk'

export default function ($scope, $mdDialog) {
	var vm = this

	vm.complexImport = function ($event) {
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

	vm.importEntity = function ($event) {
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

	vm.instrumentDownload = function ($event) {
		$mdDialog.show({
			controller: 'InstrumentDownloadDialogController as vm',
			templateUrl:
				'views/dialogs/instrument-download/instrument-download-dialog-view.html',
			targetEvent: $event,
			locals: {
				data: {},
			},
		})
	}

	vm.importTransaction = function ($event) {
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

	vm.fillPriceHistory = function ($event) {
		$mdDialog.show({
			controller: 'FillPriceHistoryDialogController as vm',
			templateUrl: 'views/dialogs/fill-price-history-dialog-view.html',
			targetEvent: $event,
		})
	}

	vm.eventScheduleConfig = function ($event) {
		$mdDialog.show({
			controller: 'EventScheduleConfigDialogController as vm',
			templateUrl: 'views/dialogs/event-schedule-config-dialog-view.html',
			targetEvent: $event,
		})
	}

	vm.openMapping = function ($event, mapItem) {
		$mdDialog.show({
			controller: 'EntityTypeMappingDialogController as vm',
			templateUrl: 'views/dialogs/entity-type-mapping-dialog-view.html',
			parent: angular.element(document.body),
			targetEvent: $event,
			preserveScope: true,
			autoWrap: true,
			skipHide: true,
			locals: {
				mapItem: mapItem,
			},
		})
	}

	vm.addScheme = function ($event) {
		$mdDialog
			.show({
				controller: 'InstrumentDownloadSchemeAddDialogController as vm',
				templateUrl:
					'views/dialogs/instrument-download/instrument-download-scheme-dialog-view.html',
				targetEvent: $event,
			})
			.then(function (res) {
				if (res.status === 'agree') {

					instrumentDownloadSchemeService.create(res.data).then(function () {
						vm.getList()
					})
				}
			})
	}

	vm.addPriceDownloadScheme = function ($event) {
		$mdDialog.show({
			controller: 'PriceDownloadSchemeAddDialogController as vm',
			templateUrl: 'views/dialogs/price-download-scheme-dialog-view.html',
			targetEvent: $event,
		})
	}

	vm.checkForEvents = function ($event) {
		$mdDialog.show({
			controller: 'CheckEventsDialogController as vm',
			templateUrl: 'views/dialogs/events/check-events-dialog-view.html',
			targetEvent: $event,
			preserveScope: true,
			autoWrap: true,
			skipHide: true,
		})
	}

	vm.eventsAsSystem = function ($event) {
		instrumentEventService.generateAndProcessAsSystem().then(function (value) {
			$mdDialog.show({
				controller: 'SuccessDialogController as vm',
				templateUrl: 'views/dialogs/success-dialog-view.html',
				targetEvent: $event,
				autoWrap: true,
				locals: {
					success: {
						title: 'System Event Generation',
						description: 'Signal to generate and process sent.',
					},
				},
			})
		})
	}

	vm.defaultPricingConfig = function ($event) {
		$mdDialog.show({
			controller: 'DefaultPricingConfigDialogController as vm',
			templateUrl: 'views/dialogs/default-pricing-config-dialog-view.html',
			targetEvent: $event,
			autoWrap: true,
		})
	}

	vm.notificationsSettings = function ($event) {
		$mdDialog
			.show({
				controller: 'ActionsNotificationsSettingsDialogController as vm',
				templateUrl:
					'views/dialogs/actions-notifications-settings-dialog-view.html',
				targetEvent: $event,
				autoWrap: true,
			})
			.then(function (data) {
				if (data.status === 'success') {
					$mdDialog.show({
						controller: 'SuccessDialogController as vm',
						templateUrl: 'views/dialogs/success-dialog-view.html',
						targetEvent: $event,
						autoWrap: true,
						locals: {
							success: {
								title: '',
								description: 'Changes saved',
							},
						},
					})
				} else {
					$mdDialog.show({
						controller: 'WarningDialogController as vm',
						templateUrl: 'views/dialogs/warning-dialog-view.html',
						targetEvent: $event,
						clickOutsideToClose: false,
						locals: {
							warning: {
								title: 'Error',
								description: 'Failed to save changes',
							},
						},
					})
				}
			})
	}

	setTimeout(() => {


		embeddedsdk.embedDashboard({
			id: '3f4dfb00-93be-4969-ab37-2f4476067973', // given by the Superset embedding UI
			supersetDomain: 'https://superset.finmars.com',
			mountPoint: document.getElementById('my-superset-container'), // any html element that can contain an iframe
			fetchGuestToken: function () {
				return new Promise(function (resolve, reject) {
					supersetService
						.getSecurityToken('3f4dfb00-93be-4969-ab37-2f4476067973')
						.then((data) => {
							resolve(data.token)
						})
				})
			},
			dashboardUiConfig: { hideTitle: true }, // dashboard UI config: hideTitle, hideTab, hideChartControls (optional)
			debug: false,
		})
	}, 1000)
}
