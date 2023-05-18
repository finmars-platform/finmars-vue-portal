/**
 * Created by szhitenev on 28.06.2016.
 */

import entityResolverService from '../../services/entityResolverService'

export default function ($scope, $mdDialog, data) {
	var vm = this

	vm.entityType = data.entityType
	vm.itemsCount = null

	vm.readyStatus = { data: false }
	vm.processing = false

	var selectedRow = data.selectedItem

	var page = 1
	var pageSize = 40
	var getEntitiesProm
	// var lastPageReached = false;

	vm.search = {
		instrument: {
			user_code: '',
			name: '',
			short_name: '',
			user_text_1: '',
			user_text_2: '',
			user_text_3: '',
		},
		account: {
			user_code: '',
			name: '',
			short_name: '',
		},
		portfolio: {
			user_code: '',
			name: '',
			short_name: '',
		},
		responsible: {
			user_code: '',
			name: '',
			short_name: '',
		},
		counterparty: {
			user_code: '',
			name: '',
			short_name: '',
		},
		currency: {
			user_code: '',
			name: '',
			short_name: '',
		},
		'strategy-1': {
			user_code: '',
			name: '',
			short_name: '',
		},
		'strategy-2': {
			user_code: '',
			name: '',
			short_name: '',
		},
		'strategy-3': {
			user_code: '',
			name: '',
			short_name: '',
		},
	}

	vm.columns = {
		instrument: [
			{
				key: 'user_code',
				name: 'User code',
			},
			{
				key: 'name',
				name: 'Name',
			},
			{
				key: 'short_name',
				name: 'Short name',
			},
			{
				key: 'user_text_1',
				name: 'User text 1',
			},
			{
				key: 'user_text_2',
				name: 'User text 2',
			},
			{
				key: 'user_text_3',
				name: 'User text 3',
			},
			{
				key: 'instrument_type_object.name',
				name: 'Instrument type',
			},
		],
		account: [
			{
				key: 'user_code',
				name: 'User code',
			},
			{
				key: 'name',
				name: 'Name',
			},
			{
				key: 'short_name',
				name: 'Short name',
			},
		],
		portfolio: [
			{
				key: 'user_code',
				name: 'User code',
			},
			{
				key: 'name',
				name: 'Name',
			},
			{
				key: 'short_name',
				name: 'Short name',
			},
		],
		responsible: [
			{
				key: 'user_code',
				name: 'User code',
			},
			{
				key: 'name',
				name: 'Name',
			},
			{
				key: 'short_name',
				name: 'Short name',
			},
		],
		counterparty: [
			{
				key: 'user_code',
				name: 'User code',
			},
			{
				key: 'name',
				name: 'Name',
			},
			{
				key: 'short_name',
				name: 'Short name',
			},
		],
		currency: [
			{
				key: 'user_code',
				name: 'User code',
			},
			{
				key: 'name',
				name: 'Name',
			},
			{
				key: 'short_name',
				name: 'Short name',
			},
		],
		'strategy-1': [
			{
				key: 'user_code',
				name: 'User code',
			},
			{
				key: 'name',
				name: 'Name',
			},
			{
				key: 'short_name',
				name: 'Short name',
			},
		],
		'strategy-2': [
			{
				key: 'user_code',
				name: 'User code',
			},
			{
				key: 'name',
				name: 'Name',
			},
			{
				key: 'short_name',
				name: 'Short name',
			},
		],
		'strategy-3': [
			{
				key: 'user_code',
				name: 'User code',
			},
			{
				key: 'name',
				name: 'Name',
			},
			{
				key: 'short_name',
				name: 'Short name',
			},
		],
	}

	vm.items = []
	vm.recentlyCreatedItems = []
	vm.selectedItem = {}

	vm.agree = function () {
		if (itemsToDelete.length > 0) {
			itemsToDelete.forEach(function (itemId) {
				entityResolverService.deleteByKey(vm.entityType, itemId)
			})
		}

		$mdDialog.hide({
			status: 'agree',
			data: { item: vm.selectedItem, items: vm.items },
		})
	}

	vm.cancel = function () {
		$mdDialog.hide('disagree')
	}

	vm.getTdValue = function (item, columnKey) {
		// check if value positioned on a deeper level of an object
		if (columnKey.indexOf('.') !== -1) {
			var objectPathToValue = columnKey.split('.') // an array of properties leading to a needed value inside of the object
			var currentPath = item // current nesting level in the object

			var i
			for (i = 0; i < objectPathToValue.length; i++) {
				if (!currentPath[objectPathToValue[i]]) {
					break
				} else {
					currentPath = currentPath[objectPathToValue[i]]
				}
			}

			return currentPath
		} else {
			return item[columnKey]
		}
	}

	vm.selectRow = function (item) {
		vm.items.forEach(function (item) {
			item.active = false
		})

		if (item) {
			vm.selectedItem = item
			item.active = true
			vm.recentlyCreatedSelectRow(null)
		}
	}

	vm.recentlyCreatedSelectRow = function (item) {
		vm.recentlyCreatedItems.forEach(function (item) {
			item.active = false
		})

		if (item) {
			vm.selectedItem = item
			item.active = true
			vm.selectRow(null)
		}
	}

	vm.selectAndSave = function (item) {
		$mdDialog.hide({
			status: 'agree',
			data: { item: item, items: vm.items },
		})
	}

	vm.sort
	vm.sortDescending = true
	vm.sortingOptions = undefined

	vm.sortBy = function (sortParameter) {
		var sortOrder = 'DSC'
		if (vm.sort === sortParameter) {
			vm.sortDescending = !vm.sortDescending

			if (vm.sortDescending) {
				sortOrder = 'DSC'
			} else {
				sortOrder = 'ASC'
			}
		} else {
			vm.sort = sortParameter
			vm.sortDescending = true
		}

		vm.sortingOptions = {
			key: sortParameter,
			direction: sortOrder,
		}

		vm.getEntityItems('reloadTable')
	}

	vm.editItem = function (itemId, $event) {
		$mdDialog
			.show({
				controller: 'EntityViewerEditDialogController as vm',
				templateUrl: 'views/entity-viewer/entity-viewer-edit-dialog-view.html',
				parent: $(''),
				targetEvent: $event,
				multiple: true,
				autoWrap: true,
				skipHide: true,
				locals: {
					entityType: vm.entityType,
					entityId: itemId,
					data: {},
				},
			})
			.then(function (data) {
				if (data.res === 'agree') {
					vm.getEntityItems('reloadTable')
				}
			})
	}

	var itemsToDelete = []

	vm.deleteItem = function (item, index) {
		vm.items.splice(index, 1)
		itemsToDelete.push(item.id)
	}

	vm.loadOnScroll = function () {
		var scrollAtTheEnd = false
		var scrollElem = document.querySelector('.entity-search-scroll-container')
		var elemScrollHeight = scrollElem.scrollHeight
		var scrollPositionToLoadItems = scrollElem.clientHeight * 1.5 // start item loading when scroll almost at the end

		scrollElem.addEventListener('scroll', function () {
			// Call function when scroll reaches specified position
			if (
				elemScrollHeight - scrollElem.scrollTop < scrollPositionToLoadItems &&
				!scrollAtTheEnd
			) {
				scrollAtTheEnd = true

				if (vm.itemsCount && vm.itemsCount > vm.items.length) {
					page = page + 1

					vm.getEntityItems().then(function (data) {
						// refreshing of scroll height after loading new page of items
						elemScrollHeight = scrollElem.scrollHeight
						scrollPositionToLoadItems = elemScrollHeight / 3
						scrollAtTheEnd = false
					})
				}
			}
		})
	}

	var getTableOptions = function () {
		var options = {}

		options.page = page
		options.pageSize = pageSize

		if (vm.sortingOptions) {
			//options.sort = new Object();
			options.sort = vm.sortingOptions
		}

		options.filters = vm.search[vm.entityType]

		return options
	}

	vm.getEntityItems = function (reloadTable) {
		vm.processing = true
		//$scope.$apply();

		return new Promise(function (resolve, reject) {
			// if reloadTable parameter exist, reset options and vm.items
			if (reloadTable) {
				page = 1
				vm.itemsCount = null
				$('.entity-search-scroll-container').scrollTop(0)
			}

			if (vm.entityType === 'instrument') {
				// instruments in light list lack instrument_type property
				getEntitiesProm = entityResolverService.getList(
					vm.entityType,
					getTableOptions()
				)
			} else {
				getEntitiesProm = entityResolverService.getListLight(
					vm.entityType,
					getTableOptions()
				)
			}

			getEntitiesProm.then(function (data) {
				if (data.hasOwnProperty('count')) {
					vm.itemsCount = data.count
				}

				if (reloadTable) {
					vm.items = data.results
				} else {
					vm.items = vm.items.concat(data.results)
				}

				setTimeout(function () {
					vm.processing = false

					$scope.$apply()
					resolve({ status: 'loaded' })
				}, 2000)
			})
		})
	}

	vm.init = function () {
		setTimeout(function () {
			vm.dialogElemToResize = document.querySelector(
				'.entityEditorElemToResize'
			)
		}, 100)

		if (vm.entityType === 'instrument') {
			// instruments in light list lack instrument_type property
			getEntitiesProm = entityResolverService.getList(
				vm.entityType,
				getTableOptions()
			)
		} else {
			getEntitiesProm = entityResolverService.getListLight(
				vm.entityType,
				getTableOptions()
			)
		}

		getEntitiesProm.then(function (data) {
			vm.readyStatus.data = true

			if (data.hasOwnProperty('count')) {
				vm.itemsCount = data.count
			}

			vm.items = data.results

			if (selectedRow) {
				vm.items = vm.items.map(function (item) {
					if (item.id === selectedRow) {
						item.active = true
					}

					return item
				})
			}

			$scope.$apply()
			vm.loadOnScroll()
		})
	}

	// Victor 09.10.2020
	vm.createEntity = function ($event) {
		$event.stopPropagation() // The closeDDMenuOnClick handler should not be called if pressed Create button

		$mdDialog
			.show({
				controller: 'EntityViewerAddDialogController as vm',
				templateUrl: 'views/entity-viewer/entity-viewer-add-dialog-view.html',
				parent: angular.element(document.body),
				targetEvent: $event,
				multiple: true,
				locals: {
					entityType: vm.entityType,
					entity: {
						accrual_calculation_schedules: [],
					},
					data: {},
				},
			})
			.then(function (res) {
				if (res.status === 'agree') {
					vm.getEntityItems('reloadTable')
					var item = res.data
					vm.recentlyCreatedItems.push(item)
					vm.recentlyCreatedSelectRow(item)
				}
			})
	}

	// Victor 09.10.2020
	vm.downloadEntity = function ($event) {
		$mdDialog
			.show({
				controller: 'InstrumentDownloadDialogController as vm',
				templateUrl:
					'views/dialogs/instrument-download/instrument-download-dialog-view.html',
				targetEvent: $event,
				multiple: true,
				locals: {
					data: {},
				},
			})
			.then(function (res) {
				vm.getEntityItems('reloadTable')
				var item = res.data
				vm.recentlyCreatedItems.push(item)
				vm.recentlyCreatedSelectRow(item)
			})
	}

	vm.init()
}
