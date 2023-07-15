/**
 * Created by szhitenev on 10.11.2020.
 */

export default function (
	$scope,
	$mdDialog,
	toastNotificationService,
	currencyHistoryService,
	data
) {


	var vm = this

	vm.data = data

	vm.evDataService = vm.data.evDataService
	vm.items = vm.data.items

	vm.groupedItems = []

	vm.viewCurrency = function ($event, item) {
		$mdDialog.show({
			controller: 'EntityViewerEditDialogController as vm',
			templateUrl: 'views/entity-viewer/entity-viewer-edit-dialog-view.html',
			parent: angular.element(document.body),
			targetEvent: $event,
			multiple: true,
			locals: {
				entityType: 'currency',
				entityId: item.transaction_currency_id,
				data: {},
			},
		})
	}

	vm.saveGroup = function ($event, group) {


		var promises = []

		group.processing = true

		group.items.forEach(function (item) {
			if (item.fx_rate) {
				promises.push(
					currencyHistoryService.create({
						currency: group.transaction_currency_id,
						pricing_policy: vm.reportOptions.pricing_policy,
						date: item.date,
						fx_rate: item.fx_rate,
					})
				)
			}
		})

		Promise.all(promises).then(function (data) {
			toastNotificationService.success('FX Rates are updated')



			vm.items = vm.items.filter(function (item) {
				var result = true

				data.forEach(function (dataItem) {
					if (
						dataItem.date === item.accounting_date &&
						dataItem.currency === item.transaction_currency_id &&
						dataItem.pricing_policy_object.user_code ===
							item.pricing_policy_user_code
					) {
						result = false
					}
				})

				return result
			})

			vm.generateGroupItems()

			group.processing = false

			$scope.$apply()
		})
	}

	vm.generateGroupItems = function () {
		vm.groupedItems = []
		vm.groupedItemsObj = {}

		vm.items.forEach(function (item) {
			var key =
				item.transaction_currency_id + '_' + item.pricing_policy_user_code

			if (!vm.groupedItemsObj.hasOwnProperty(key)) {
				vm.groupedItemsObj[key] = Object.assign({}, item)
				vm.groupedItemsObj[key].items = []
				vm.groupedItemsObj[key].folded = true
			}

			vm.groupedItemsObj[key].items.push({
				date: item.accounting_date,
				fx_rate: null,
			})
		})

		Object.keys(vm.groupedItemsObj).forEach(function (key) {
			vm.groupedItems.push(vm.groupedItemsObj[key])
		})
	}

	vm.init = function () {
		vm.reportOptions = vm.evDataService.getReportOptions()
		vm.entityType = vm.evDataService.getEntityType()
		vm.layout = vm.evDataService.getListLayout()

		vm.generateGroupItems()


	}

	vm.init()

	vm.agree = function () {
		$mdDialog.hide({ status: 'agree' })
	}
}
