/**
 * Created by szhitenev on 10.11.2020.
 */

export default function ($scope, $mdDialog, data) {


	var vm = this

	vm.data = data

	vm.evDataService = vm.data.evDataService
	vm.items = vm.data.items

	vm.init = function () {
		vm.reportOptions = vm.evDataService.getReportOptions()
		vm.entityType = vm.evDataService.getEntityType()
		vm.layout = vm.evDataService.getListLayout()

		vm.items = vm.items.map(function (item) {
			item.instrument_object.pricing_policies.forEach(function (policy) {
				if (policy.pricing_policy === vm.reportOptions.pricing_policy) {
					if (policy.pricing_scheme_object) {
						item.pricing_user_code = policy.pricing_scheme_object.name
					}

					item.pricing_scheme = policy.pricing_scheme
				}
			})

			return item
		})
	}

	vm.viewPositions = function ($event, item) {
		$mdDialog.show({
			controller: 'ViewMissingPriceHistoryViewPositionsDialogController as vm',
			templateUrl:
				'views/dialogs/report-missing-prices/view-missing-price-history-view-positions-dialog-view.html',
			parent: angular.element(document.body),
			targetEvent: $event,
			multiple: true,
			locals: {
				data: {
					item: item,
					items: vm.missingHistoryPrices,
					evDataService: vm.evDataService,
				},
			},
		})
	}

	vm.viewInstrument = function ($event, item) {
		$mdDialog.show({
			controller: 'EntityViewerEditDialogController as vm',
			templateUrl: 'views/entity-viewer/entity-viewer-edit-dialog-view.html',
			parent: angular.element(document.body),
			targetEvent: $event,
			multiple: true,
			locals: {
				entityType: 'instrument',
				entityId: item.id,
				data: {},
			},
		})
	}

	vm.addPriceHistory = function ($event, item) {
		$mdDialog.show({
			controller: 'EntityViewerAddDialogController as vm',
			templateUrl: 'views/entity-viewer/entity-viewer-add-dialog-view.html',
			parent: angular.element(document.body),
			targetEvent: $event,
			multiple: true,
			locals: {
				entityType: 'price-history',
				entity: {
					instrument: item.id,
					instrument_object: item.instrument_object,
					pricing_policy: vm.reportOptions.pricing_policy,
					pricing_policy_object: vm.reportOptions.pricing_policy_object,
					date: vm.reportOptions.report_date,
				},
				data: {},
			},
		})
	}

	vm.init()

	vm.agree = function () {
		$mdDialog.hide({ status: 'agree' })
	}
}
