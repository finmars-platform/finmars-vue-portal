/**
 * Created by szhitenev on 29.01.2020.
 */

import pricingPolicyService from '../../services/pricingPolicyService'

export default function ($scope, $mdDialog) {
	var vm = this

	vm.readyStatus = { content: false }
	vm.items = []

	vm.getList = function () {
		pricingPolicyService.getList().then(function (data) {
			vm.items = data.results

			vm.readyStatus.content = true

			$scope.$apply()
		})
	}

	vm.editPricingPolicy = function ($event, item) {
		$mdDialog
			.show({
				controller: 'PricingPolicyEditDialogController as vm',
				templateUrl:
					'views/dialogs/pricing/pricing-policy-edit-dialog-view.html',
				parent: angular.element(document.body),
				targetEvent: $event,
				clickOutsideToClose: false,
				preserveScope: true,
				autoWrap: true,
				skipHide: true,
				multiple: true,
				locals: {
					data: {
						item: item,
					},
				},
			})
			.then(function (res) {
				if (res.status === 'agree') {
					vm.getList()
				}
			})
	}

	vm.addPricingPolicy = function ($event) {
		$mdDialog
			.show({
				controller: 'PricingPolicyAddDialogController as vm',
				templateUrl:
					'views/dialogs/pricing/pricing-policy-add-dialog-view.html',
				parent: angular.element(document.body),
				targetEvent: $event,
				clickOutsideToClose: false,
				preserveScope: true,
				autoWrap: true,
				skipHide: true,
				multiple: true,
				locals: {
					data: {},
				},
			})
			.then(function (res) {
				if (res.status === 'agree') {
					vm.getList()
				}
			})
	}

	vm.deletePricingPolicy = function ($event, item, $index) {
		$mdDialog
			.show({
				controller: 'WarningDialogController as vm',
				templateUrl: 'views/dialogs/warning-dialog-view.html',
				parent: angular.element(document.body),
				targetEvent: $event,
				clickOutsideToClose: false,
				locals: {
					warning: {
						title: 'Warning',
						description:
							'<p>Are you sure you want to delete Pricing Policy <b>' +
							item.name +
							'</b>?</p><p>All Settings for instruments and currencies will be also deleted.</p>',
					},
				},
				preserveScope: true,
				autoWrap: true,
				skipHide: true,
				multiple: true,
			})
			.then(function (res) {
				if (res.status === 'agree') {
					pricingPolicyService.deleteByKey(item.id).then(function (value) {
						vm.getList()
					})
				}
			})
	}

	vm.init = function () {
		vm.getList()
	}

	vm.init()
}
