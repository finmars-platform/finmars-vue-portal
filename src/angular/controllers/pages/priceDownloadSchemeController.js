/**
 * Created by szhitenev on 26.06.2019.
 */

import logService from '@/angular/core/services/logService'

import importPriceDownloadSchemeService from '../../services/import/importPriceDownloadSchemeService'
import dataProvidersService from '../../services/import/dataProvidersService'

export default function ($scope, $mdDialog) {
	logService.controller('PriceDownloadSchemeController', 'initialized')

	var vm = this

	vm.readyStatus = { scheme: true, providers: false }

	vm.dataProviders = []

	dataProvidersService.getList().then(function (data) {
		vm.dataProviders = data
		vm.readyStatus.providers = true
		vm.getList()
		$scope.$apply()
	})

	vm.toggleQuery = function () {
		vm.queryStatus = !vm.queryStatus
		vm.query = {}
	}

	vm.setSort = function (propertyName) {
		vm.direction = vm.sort === propertyName ? !vm.direction : false
		vm.sort = propertyName
	}

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.editItem = function (item) {
		item.editStatus = true
	}

	vm.saveItem = function (item) {
		importPriceDownloadSchemeService.update(item.id, item).then(function () {
			item.editStatus = false
			vm.getList()
		})
	}

	vm.deleteItem = function (item, index) {
		importPriceDownloadSchemeService.deleteByKey(item.id)
		setTimeout(function () {
			vm.getList()
		}, 100)
	}

	vm.items = []

	vm.getList = function () {
		importPriceDownloadSchemeService.getList().then(function (data) {
			vm.items = data.results

			vm.items.forEach(function (item) {
				vm.dataProviders.forEach(function (provider) {
					if (item.provider == provider.id) {
						item.provider_name = provider.name
					}
				})
			})

			$scope.$apply()
		})
	}

	vm.addRow = function () {
		importPriceDownloadSchemeService.create(vm.newItem).then(function () {
			vm.newItem = {
				user_code: null,
				provider: null,
				bid0: '',
				/*"bid1": '',
                    "bid2": '',*/
				bid_multiplier: '',
				ask0: '',
				/*"ask1": "",
                    "ask2": "",*/
				ask_multiplier: '',
				last: '',
				last_multiplier: '',
				mid: '',
				mid_multiplier: '',
				bid_history: '',
				ask_history: '',
				last_history: '',
				mid_history: '',
				bid_history_multiplier: '',
				mid_history_multiplier: '',
				last_history_multiplier: '',
				ask_history_multiplier: '',
				currency_fxrate: '',
				currency_fxrate_multiplier: '',
			}

			vm.getList()
		})
	}

	vm.agree = function () {}
}
