/**
 * Created by szhitenev on 15.04.2022.
 */

import toastNotificationService from '@/angular/core/services/toastNotificationService'
import entityResolverService from '../../services/entityResolverService'

import unifiedDataService from '../../services/unifiedDataService'
import importUnifiedDataService from '../../services/import/importUnifiedDataService'
import importCurrencyCbondsService from '../../services/import/importCurrencyCbondsService'
import currencyDatabaseSearchService from '../../services/currency/currencyDatabaseSearchService'

export default function ($scope, $mdDialog, data) {
	var vm = this

	vm.title = data.title || 'Select entity'

	vm.localItemsTotal = 0
	vm.databaseItemsTotal = 0
	vm.hoverItem = null

	vm.databaseItems = []
	vm.localItems = []

	// vm.inputText = data.inputText;
	vm.inputText = ''

	vm.globalPage = 1
	vm.totalPages = 1
	vm.actionType = 'default'

	vm.entityType = data.entityType

	vm.instrumentTypeOptions = [
		{ id: 'bonds', name: 'Bonds' },
		{ id: 'stocks', name: 'Stocks' },
	]

	vm.clearHoverItem = function () {
		setTimeout(function () {
			vm.hoverItem = null


			$scope.$apply()
		}, 0)
	}

	vm.setHoverItem = function ($event, option) {
		setTimeout(function () {
			vm.hoverItem = option


			$scope.$apply()
		}, 0)
	}

	vm.agree = function () {
		new Promise(function (resolve, reject) {
			vm.localItems.forEach(function (item) {
				if (item.selected) {
					vm.selectedItem = item
					resolve()
				}
			})

			var selectedDatabaseItem

			vm.databaseItems.forEach(function (item) {
				if (item.selected) {
					selectedDatabaseItem = item
				}
			})

			if (selectedDatabaseItem) {
				if (vm.entityType === 'currency') {
					var config = {
						currency_code: selectedDatabaseItem.code,
						mode: 1,
					}

					importCurrencyCbondsService.download(config).then(function (data) {
						if (data.errors.length) {
							vm.isDisabled = false

							vm.selectedItem = null

							toastNotificationService.error(data.errors[0])

							$scope.$apply()

							resolve()
						} else {
							vm.selectedItem = {
								id: data.result_id,
								name: selectedDatabaseItem.name,
								user_code: selectedDatabaseItem.code,
							}

							resolve()
						}
					})
				} else {
					var config = {
						id: selectedDatabaseItem.id,
						entity_type: vm.entityType,
					}

					importUnifiedDataService.download(config).then(function (data) {
						if (data.errors.length) {
							vm.isDisabled = false

							vm.selectedItem = null

							toastNotificationService.error(data.errors[0])

							$scope.$apply()

							resolve()
						} else {
							vm.selectedItem = {
								id: data.result_id,
								name: selectedDatabaseItem.name,
								user_code: selectedDatabaseItem.user_code,
							}

							resolve()
						}
					})
				}
			}
		}).then(function (data) {
			if (vm.selectedItem) {
				$mdDialog.hide({ status: 'agree', data: { item: vm.selectedItem } })
			}
		})
	}

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.onInputTextChange = function () {
		vm.getList()
	}

	vm.selectLocalItem = function (item) {
		vm.databaseItems = vm.databaseItems.map(function (item) {
			item.selected = false
			return item
		})

		vm.localItems = vm.localItems.map(function (item) {
			item.selected = false
			return item
		})

		item.selected = true
	}

	vm.getHighlighted = function (value) {
		var inputTextPieces = vm.inputText.split(' ')

		var resultValue

		// Regular expression for multiple highlighting case insensitive results
		var reg = new RegExp('(?![^<]+>)(' + inputTextPieces.join('|') + ')', 'ig')

		resultValue = value.replace(reg, '<span class="highlight">$1</span>')

		return resultValue
	}

	vm.selectDatabaseItem = function (item) {
		vm.databaseItems = vm.databaseItems.map(function (item) {
			item.selected = false
			return item
		})

		vm.localItems = vm.localItems.map(function (item) {
			item.selected = false
			return item
		})

		item.selected = true
	}

	vm.addEntity = function ($event) {
		var dialogParent = document.querySelector('.dialog-containers-wrap')

		$mdDialog
			.show({
				controller: 'EntityViewerAddDialogController as vm',
				templateUrl: 'views/entity-viewer/entity-viewer-add-dialog-view.html',
				parent: dialogParent,
				targetEvent: $event,
				multiple: true,
				locals: {
					entityType: vm.entityType,
					entity: {},
					data: {},
				},
			})
			.then(function (res) {
				if (res.status === 'agree') {
					vm.getList()
				}
			})
	}

	vm.loadMoreGlobalItems = function () {
		vm.globalProcessing = true

		vm.globalPage = vm.globalPage + 1

		try {
			if (vm.entityType === 'currency') {
				currencyDatabaseSearchService
					.getList(vm.inputText, vm.globalPage - 1)
					.then(function (data) {
						vm.globalProcessing = false

						vm.databaseItemsTotal = data.resultCount

						vm.databaseItems = data.foundItems

						vm.totalPages = Math.round(data.resultCount / 40)

						$scope.$apply()
					})
					.catch(function (error) {
						vm.globalProcessing = false

						vm.databaseItems = []



						$scope.$apply()
					})
			} else {
				unifiedDataService
					.getList(vm.entityType, {
						filters: {
							query: vm.inputText,
						},
					})
					.then(function (data) {
						vm.globalProcessing = false

						vm.databaseItemsTotal = data.count

						vm.databaseItems = data.results

						vm.totalPages = Math.round(data.count / 40)

						$scope.$apply()
					})
					.catch(function (error) {
						vm.globalProcessing = false

						vm.databaseItems = []



						$scope.$apply()
					})
			}
		} catch (e) {
			vm.globalProcessing = false

			vm.databaseItems = []
		}
	}

	vm.getList = function () {
		vm.processing = true

		var promises = []

		promises.push(
			new Promise(function (resolve, reject) {
				if (vm.entityType === 'currency') {
					currencyDatabaseSearchService
						.getList(vm.inputText, vm.globalPage - 1)
						.then(function (data) {
							vm.databaseItemsTotal = data.resultCount

							vm.databaseItems = data.foundItems

							vm.totalPages = Math.round(data.resultCount / 40)

							resolve()
						})
						.catch(function (error) {


							vm.databaseItems = []

							resolve()
						})
				} else {
					unifiedDataService
						.getList(vm.entityType, {
							filters: {
								query: vm.inputText,
							},
						})
						.then(function (data) {
							vm.databaseItemsTotal = data.count

							vm.databaseItems = data.results

							resolve()

							vm.totalPages = Math.round(data.count / 40)
						})
						.catch(function (error) {


							vm.databaseItems = []

							resolve()
						})
				}
			})
		)

		promises.push(
			new Promise(function (resolve, reject) {
				entityResolverService
					.getListLight(vm.entityType, {
						pageSize: 500,
						filters: {
							user_code: vm.inputText,
						},
					})
					.then(function (data) {
						vm.localItemsTotal = data.count

						vm.localItems = data.results

						vm.localItems = vm.localItems.map(function (item) {
							item.pretty_date = moment(item.modified).format('DD.MM.YYYY')

							return item
						})

						resolve()
					})
			})
		)

		Promise.allSettled(promises).then(function (data) {
			vm.processing = false

			vm.databaseItems = vm.databaseItems.filter(function (databaseItem) {
				var exist = false

				if (vm.entityType === 'currency') {
					vm.localItems.forEach(function (localItem) {
						if (localItem.user_code === databaseItem.code) {
							exist = true
						}
					})
				} else {
					vm.localItems.forEach(function (localItem) {
						if (localItem.user_code === databaseItem.user_code) {
							exist = true
						}
					})
				}

				return !exist
			})

			$scope.$apply()

			setTimeout(function () {
				$('.instrument-select-options-group-title').on('click', function () {
					$(this)
						.next()[0]
						.scrollIntoView({ block: 'start', behavior: 'smooth' })
				})
			}, 100)
		})
	}

	vm.init = function () {
		vm.getList()

		if (data.context) {
			if (data.context.action) {
				vm.actionType = data.context.action
			}
		}
	}

	vm.init()
}
