/**
 * Created by szhitenev on 25.08.2016.
 */

// DEPRECATED SINCE 29.04.2020

import logService from '@/angular/../core/services/logService'
import pricingPolicyService from '@/angular/services/pricingPolicyService'

export default function ($scope, fieldResolverService) {
	logService.controller('ManualPricingFormulasTabController', 'initialized')

	var vm = this

	vm.readyStatus = { content: false }

	vm.entity = $scope.$parent.vm.entity

	vm.currencyFields = []
	vm.dailyPricingModelFields = []
	vm.priceDownloadSchemeFields = []

	vm.newItem = { pricing_policy: '', expr: '', notes: '' }

	pricingPolicyService.getList().then(function (data) {
		vm.policies = data.results
		vm.readyStatus.content = true
		$scope.$apply()
	})

	vm.bindPricingPolicy = function (policy) {
		var name
		vm.policies.forEach(function (item) {
			if (policy.pricing_policy == item.id) {
				policy.policy_name = item.name
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

	vm.editItem = function (item) {
		item.editStatus = true
	}

	vm.saveItem = function (item) {
		item.editStatus = false
	}

	vm.deleteItem = function (item, index) {
		vm.entity.manual_pricing_formulas.splice(index, 1)
	}

	vm.addRow = function () {
		vm.entity.manual_pricing_formulas.push({
			pricing_policy: vm.newItem.pricing_policy,
			expr: vm.newItem.expr,
			notes: vm.newItem.notes,
		})

		vm.newItem.pricing_policy = null
		vm.newItem.expr = null
		vm.newItem.notes = null
	}

	vm.getCurrencyFields = function () {
		fieldResolverService
			.getFields('pricing_currency', {
				entityType: 'instrument',
				key: 'pricing_currency',
			})
			.then(function (res) {
				vm.currencyFields = res.data

				$scope.$apply()
			})
	}

	vm.getDailyPricingModelFields = function () {
		fieldResolverService
			.getFields('daily_pricing_model', {
				entityType: 'instrument',
				key: 'daily_pricing_model',
			})
			.then(function (res) {
				vm.dailyPricingModelFields = res.data

				$scope.$apply()
			})
	}

	vm.getPriceDownloadSchemeFields = function () {
		fieldResolverService
			.getFields('price_download_scheme', {
				entityType: 'instrument',
				key: 'price_download_scheme',
			})
			.then(function (res) {


				vm.priceDownloadSchemeFields = res.data

				$scope.$apply()
			})
	}

	vm.setDefaultCurrencyFields = function () {
		var item_object = vm.entity.pricing_currency_object

		if (item_object) {
			if (Array.isArray(item_object)) {
				vm.currencyFields = item_object
			} else {
				vm.currencyFields.push(item_object)
			}
		}
	}

	vm.setDefaultDailyPricingModelFields = function () {
		var item_object = vm.entity.daily_pricing_model_object

		if (item_object) {
			if (Array.isArray(item_object)) {
				vm.dailyPricingModelFields = item_object
			} else {
				vm.dailyPricingModelFields.push(item_object)
			}
		}
	}

	vm.setDefaultPriceDownloadSchemeFields = function () {
		var item_object = vm.entity.price_download_scheme_object

		if (item_object) {
			if (Array.isArray(item_object)) {
				vm.priceDownloadSchemeFields = item_object
			} else {
				vm.priceDownloadSchemeFields.push(item_object)
			}
		}
	}

	vm.init = function () {
		vm.setDefaultCurrencyFields()
		vm.setDefaultDailyPricingModelFields()
		vm.setDefaultPriceDownloadSchemeFields()
	}

	vm.init()
}
