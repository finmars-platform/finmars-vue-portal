/**
 * Created by szhitenev on 30.01.2020.
 */

import pricingPolicyService from '@/angular/services/pricingPolicyService'

import currencyPricingSchemeService from '@/angular/services/pricing/currencyPricingSchemeService'
var instrumentPricingSchemeService = require('@/angular/services/pricing/instrumentPricingSchemeService')

export default function ($scope, $mdDialog, data) {
	var vm = this

	vm.itemId = data.item.id

	vm.item = {}

	vm.currencyPricingSchemes = []
	vm.instrumentPricingSchemes = []

	vm.readyStatus = {
		policy: false,
		currencyPricingSchemes: false,
		instrumentPricingSchemes: false,
	}

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

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.agree = function () {
		pricingPolicyService.update(vm.item.id, vm.item).then(function (data) {
			vm.item = data

			$mdDialog.hide({ status: 'agree', data: { item: vm.item } })
		})
	}

	vm.getItem = function () {
		pricingPolicyService.getByKey(vm.itemId).then(function (data) {
			vm.item = data

			vm.readyStatus.policy = true

			$scope.$apply()
		})
	}

	vm.init = function () {
		vm.getCurrencyPricingSchemesList()
		vm.getInstrumentPricingSchemesList()

		vm.getItem()
	}

	vm.init()
}
