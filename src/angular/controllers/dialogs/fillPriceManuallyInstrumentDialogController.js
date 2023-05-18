/**
 * Created by szhitenev on 25.08.2016.
 */

import logService from '@/angular/core/services/logService'
import pricingPolicyService from '../../services/pricingPolicyService'
import currencyService from '../../services/currencyService'

export default function (
	$scope,
	$mdDialog,
	instrumentService,
	priceHistoryService,
	currencyHistoryService,
	data
) {
	logService.controller(
		'FillPriceManuallyInstrumentDialogController',
		'initialized'
	)

	var vm = this

	vm.readyStatus = { instruments: false, policies: false, currencies: false }

	vm.newItem = { pricing_policy: '', expr: '', notes: '' }

	vm.instrumentsPrices = data.instruments
	vm.currenciesPrices = data.currencies

	pricingPolicyService.getList().then(function (data) {
		vm.policies = data.results
		vm.readyStatus.policies = true
		$scope.$apply()
	})

	instrumentService.getList().then(function (data) {
		vm.instruments = data.results
		vm.readyStatus.instruments = true
		$scope.$apply()
	})

	currencyService.getList().then(function (data) {
		vm.currencies = data.results
		vm.readyStatus.currencies = true
		$scope.$apply()
	})

	vm.checkReadyStatus = function () {
		if (
			vm.readyStatus.instruments == true &&
			vm.readyStatus.policies == true &&
			vm.readyStatus.currencies == true
		) {
			return true
		}
		return false
	}

	vm.bindPricingPolicy = function (priceHistory) {
		var name = ''
		vm.policies.forEach(function (item) {
			if (priceHistory.pricing_policy == item.id) {
				priceHistory.policy_name = item.name
				name = item.name
			}
		})
		return name
	}
	vm.bindInstrument = function (priceHistory) {
		var name = ''
		vm.instruments.forEach(function (item) {
			if (priceHistory.instrument == item.id) {
				priceHistory.instrument_name = item.name
				name = item.name
			}
		})
		return name
	}

	vm.bindCurrency = function (priceHistory) {
		var name = ''
		vm.currencies.forEach(function (item) {
			if (priceHistory.currency == item.id) {
				priceHistory.currency_name = item.name
				name = item.name
			}
		})
		return name
	}

	vm.toggleQuery = function () {
		vm.queryStatus = !vm.queryStatus
		vm.query = {}
	}

	vm.setSort = function (propertyName) {
		vm.direction = vm.sort === propertyName ? !vm.direction : false
		vm.sort = propertyName
	}

	vm.agree = function () {
		var promises = []

		vm.instrumentsPrices.forEach(function (item) {
			if (item.id == null) {
				promises.push(priceHistoryService.create(item))
			} else {
				promises.push(priceHistoryService.update(item.id, item))
			}
		})

		vm.currenciesPrices.forEach(function (item) {
			if (item.id == null) {
				promises.push(currencyHistoryService.create(item))
			} else {
				promises.push(currencyHistoryService.update(item.id, item))
			}
		})

		Promise.all(promises).then(function () {
			$mdDialog.hide({ status: 'agree' })
		})
	}
}
