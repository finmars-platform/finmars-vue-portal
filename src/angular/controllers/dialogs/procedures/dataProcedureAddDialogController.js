/**
 * Created by szhitenev on 25.09.2020.
 */

import dataProcedureService from '@/angular/services/procedures/dataProcedureService'
import dataProvidersService from '@/angular/services/import/dataProvidersService'

import transactionImportSchemeService from '@/angular/services/import/transactionImportSchemeService'
import csvImportSchemeService from '@/angular/services/import/csvImportSchemeService'

import entityResolverService from '@/angular/services/entityResolverService'

export default function ($scope, $mdDialog, data) {
	var vm = this

	vm.item = {}

	vm.schemes = []
	vm.providers = []

	vm.toggleStatus = {
		date_from: 'datepicker',
		date_to: 'datepicker',
	}

	vm.toggle = function (key) {
		if (vm.toggleStatus[key] === 'datepicker') {
			vm.toggleStatus[key] = 'expr'
		} else {
			vm.toggleStatus[key] = 'datepicker'
		}

		vm.item[key] = null
		vm.item[key + '_expr'] = null
	}

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.getTransactionImportSchemes = function () {
		transactionImportSchemeService.getListLight().then(function (data) {
			vm.transactionImportSchemes = data.results

			$scope.$apply()
		})
	}

	vm.getSimpleImportSchemes = function () {
		csvImportSchemeService.getListLight().then(function (data) {
			vm.simpleImportSchemes = data.results

			$scope.$apply()
		})
	}

	vm.getProviders = function () {
		dataProvidersService.getPersonalProvidersList().then(function (data) {
			vm.providers = data

			$scope.$apply()
		})
	}

	vm.getCurrencyCodes = function () {
		entityResolverService.getListLight('currency').then(function (data) {
			vm.currencyCodes = data.results.map(function (item) {
				item.id = item.user_code

				return item
			})
		})
	}

	vm.agree = function () {
		vm.item.data = JSON.parse(vm.item.data_string)

		dataProcedureService.create(vm.item).then(function (data) {
			$mdDialog.hide({ status: 'agree', data: { item: data } })
		})
	}

	vm.providerChange = function () {
		if (vm.item.provider === 6) {
			vm.item.data_string = JSON.stringify({}, 0, 4)
		}
	}

	vm.universalOptionsChange = function () {
		vm.item.data = JSON.parse(vm.item.data_string)
	}

	vm.universalFieldChange = function () {
		vm.item.data_string = JSON.stringify(vm.item.data, 0, 4)
	}

	vm.init = function () {
		vm.getTransactionImportSchemes()
		vm.getSimpleImportSchemes()
		vm.getProviders()

		vm.getCurrencyCodes()
	}

	vm.init()
}
