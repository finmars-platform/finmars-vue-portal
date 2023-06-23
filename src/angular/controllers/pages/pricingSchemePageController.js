/**
 * Created by szhitenev on 29.01.2020.
 */

import pricingPolicyService from '../../services/pricingPolicyService'

import currencyPricingSchemeService from '../../services/pricing/currencyPricingSchemeService'
import instrumentPricingSchemeService from '../../services/pricing/instrumentPricingSchemeService'

export default function ($scope, $mdDialog) {
	var vm = this

	vm.readyStatus = {
		currencyPricingSchemes: false,
		instrumentPricingSchemes: false,
	}

	vm.currencyPricingSchemes = []
	vm.instrumentPricingSchemes = []

	vm.getCurrencyPricingSchemesList = function () {
		currencyPricingSchemeService.getList().then(function (data) {
			vm.currencyPricingSchemes = data.results

			vm.readyStatus.currencyPricingSchemes = true

			$scope.$apply()
		})
	}

	vm.getInstrumentPricingSchemesList = function () {
		instrumentPricingSchemeService.getList().then(function (data) {
			vm.instrumentPricingSchemes = data.results

			vm.readyStatus.instrumentPricingSchemes = true

			$scope.$apply()
		})
	}

	vm.addCurrencyPricingScheme = function ($event) {
		$mdDialog
			.show({
				controller: 'CurrencyPricingSchemeAddDialogController as vm',
				templateUrl:
					'views/dialogs/pricing/currency-pricing-scheme-add-dialog-view.html',
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
					vm.getCurrencyPricingSchemesList()
				}
			})
	}

	vm.addInstrumentPricingScheme = function ($event) {
		$mdDialog
			.show({
				controller: 'InstrumentPricingSchemeAddDialogController as vm',
				templateUrl:
					'views/dialogs/pricing/instrument-pricing-scheme-add-dialog-view.html',
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
					vm.getInstrumentPricingSchemesList()
				}
			})
	}

	vm.editCurrencyPricingScheme = function ($event, item) {
		$mdDialog
			.show({
				controller: 'CurrencyPricingSchemeEditDialogController as vm',
				templateUrl:
					'views/dialogs/pricing/currency-pricing-scheme-edit-dialog-view.html',
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
					vm.getCurrencyPricingSchemesList()
				}
			})
	}

	vm.editInstrumentPricingScheme = function ($event, item) {
		$mdDialog
			.show({
				controller: 'InstrumentPricingSchemeEditDialogController as vm',
				templateUrl:
					'views/dialogs/pricing/instrument-pricing-scheme-edit-dialog-view.html',
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
					vm.getInstrumentPricingSchemesList()
				}
			})
	}

	vm.deleteCurrencyPricingScheme = function ($event, item) {
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
							'<p>Are you sure you want to delete Currency Pricing Scheme <b>' +
							item.name +
							'</b>?</p>',
					},
				},
				preserveScope: true,
				autoWrap: true,
				skipHide: true,
				multiple: true,
			})
			.then(function (res) {
				if (res.status === 'agree') {
					currencyPricingSchemeService
						.deleteByKey(item.id)
						.then(function (value) {
							vm.getCurrencyPricingSchemesList()
						})
				}
			})
	}

	vm.deleteInstrumentPricingScheme = function ($event, item) {
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
							'<p>Are you sure you want to delete Instrument Pricing Scheme <b>' +
							item.name +
							'</b>?</p>',
					},
				},
				preserveScope: true,
				autoWrap: true,
				skipHide: true,
				multiple: true,
			})
			.then(function (res) {
				if (res.status === 'agree') {
					instrumentPricingSchemeService
						.deleteByKey(item.id)
						.then(function (value) {
							vm.getInstrumentPricingSchemesList()
						})
				}
			})
	}

	vm.getErrorHandler = function (item) {
		if (item.error_handler === 1) {
			return 'Add to Error Table and notify in the End'
		}

		if (item.error_handler === 2) {
			return 'Add to Error Table, no notification'
		}

		if (item.error_handler === 3) {
			return 'Add to Error Table, notify directly'
		}

		if (item.error_handler === 3) {
			return 'Notify Directly and request Prices'
		}
	}

	vm.init = function () {
		vm.getCurrencyPricingSchemesList()
		vm.getInstrumentPricingSchemesList()
	}

	vm.init()
}
