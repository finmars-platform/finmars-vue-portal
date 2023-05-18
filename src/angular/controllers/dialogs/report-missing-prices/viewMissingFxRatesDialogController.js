/**
 * Created by szhitenev on 10.11.2020.
 */

export default function ($scope, $mdDialog, data) {
	console.log('data', data)

	var vm = this

	vm.data = data

	vm.evDataService = vm.data.evDataService
	vm.items = vm.data.items

	vm.viewCurrency = function ($event, item) {
		$mdDialog.show({
			controller: 'EntityViewerEditDialogController as vm',
			templateUrl: 'views/entity-viewer/entity-viewer-edit-dialog-view.html',
			parent: angular.element(document.body),
			targetEvent: $event,
			multiple: true,
			locals: {
				entityType: 'currency',
				entityId: item.id,
				data: {},
			},
		})
	}

	vm.addFXRate = function ($event, item) {
		$mdDialog.show({
			controller: 'EntityViewerAddDialogController as vm',
			templateUrl: 'views/entity-viewer/entity-viewer-add-dialog-view.html',
			parent: angular.element(document.body),
			targetEvent: $event,
			multiple: true,
			locals: {
				entityType: 'currency-history',
				entity: {
					currency: item.id,
					currency_object: item.currency_object,
					pricing_policy: vm.reportOptions.pricing_policy,
					pricing_policy_object: vm.reportOptions.pricing_policy_object,
					date: vm.reportOptions.report_date,
				},
				data: {},
			},
		})
	}

	vm.init = function () {
		vm.reportOptions = vm.evDataService.getReportOptions()
		vm.entityType = vm.evDataService.getEntityType()
		vm.layout = vm.evDataService.getListLayout()
	}

	vm.init()

	vm.agree = function () {
		$mdDialog.hide({ status: 'agree' })
	}
}
