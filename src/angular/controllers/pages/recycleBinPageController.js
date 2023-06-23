/**
 * Created by szhitenev on 11.03.2023.
 */

import processesService from '../../services/processesService'

import baseUrlService from '../../services/baseUrlService'
import utilsService from '../../services/utilsService'
import complexTransactionService from '../../services/transaction/complexTransactionService'
import downloadFileHelper from '../../helpers/downloadFileHelper'
import toastNotificationService from '@/angular/core/services/toastNotificationService'

var baseUrl = baseUrlService.resolve()

export default function recycleBinPageController(
	$scope,
	$state,
	$stateParams,
	$mdDialog,
	globalDataService
) {
	var vm = this

	vm.processing = false
	vm.allSelected = false

	vm.readyStatus = {
		data: false,
	}

	vm.currentPage = 1
	vm.pageSize = 100

	vm.pages = []

	var priorDate = new Date(new Date().setDate(new Date().getDate() - 30))

	vm.filters = {
		date_from: priorDate.toISOString().split('T')[0],
		date_to: new Date().toISOString().split('T')[0],
	}

	vm.openPreviousPage = function () {
		vm.currentPage = vm.currentPage - 1

		$state.go(
			'app.portal.recycle-bin',
			{
				page: vm.currentPage,
				date_from: vm.filters.date_from,
				date_to: vm.filters.date_to,
			},
			{ notify: false }
		)

		vm.getData()
	}

	vm.openNextPage = function () {
		vm.currentPage = vm.currentPage + 1

		$state.go(
			'app.portal.recycle-bin',
			{
				page: vm.currentPage,
				date_from: vm.filters.date_from,
				date_to: vm.filters.date_to,
			},
			{ notify: false }
		)

		vm.getData()
	}

	vm.openPage = function (page) {
		if (page.number) {
			vm.currentPage = page.number

			$state.go(
				'app.portal.recycle-bin',
				{
					page: vm.currentPage,
					date_from: vm.filters.date_from,
					date_to: vm.filters.date_to,
				},
				{ notify: false }
			)

			vm.getData()
		}
	}

	vm.generatePages = function (data) {
		vm.totalPages = Math.ceil(data.count / vm.pageSize)

		vm.pages = []

		for (var i = 1; i <= vm.totalPages; i = i + 1) {
			vm.pages.push({
				number: i,
				caption: i.toString(),
			})
		}

		if (vm.totalPages > 10) {
			vm.currentPageIndex = 0

			vm.pages.forEach(function (item, index) {
				if (vm.currentPage === item.number) {
					vm.currentPageIndex = index
				}
			})

			vm.pages = vm.pages.filter(function (item, index) {
				if (index < 2 || index > vm.totalPages - 3) {
					return true
				}

				if (index === vm.currentPageIndex) {
					return true
				}

				if (index > vm.currentPageIndex - 3 && index < vm.currentPageIndex) {
					return true
				}

				if (index < vm.currentPageIndex + 3 && index > vm.currentPageIndex) {
					return true
				}

				return false
			})

			for (var i = 0; i < vm.pages.length; i = i + 1) {
				var j = i + 1

				if (j < vm.pages.length) {
					if (vm.pages[j].number && vm.pages[i].number) {
						if (vm.pages[j].number - vm.pages[i].number > 1) {
							vm.pages.splice(i + 1, 0, {
								caption: '...',
							})
						}
					}
				}
			}
		}
	}

	vm.updateFilters = function () {
		vm.currentPage = 1

		$state.go(
			'app.portal.recycle-bin',
			{
				page: vm.currentPage,
				date_from: vm.filters.date_from,
				date_to: vm.filters.date_to,
			},
			{ notify: false }
		)

		vm.getData()
	}

	vm.toggleAll = function ($event) {
		vm.allSelected = !vm.allSelected

		vm.items.forEach(function (item) {
			item.selected = vm.allSelected
		})
	}

	vm.toggleSelected = function ($event, item) {
		vm.allSelected = false

		item.selected = !item.selected

		var allSelected = true

		vm.items.forEach(function (item) {
			if (!item.selected) {
				allSelected = false
			}
		})

		vm.allSelected = allSelected
	}

	vm.restoreSelected = function ($event) {
		$mdDialog
			.show({
				controller: 'WarningDialogController as vm',
				templateUrl: 'views/dialogs/warning-dialog-view.html',
				targetEvent: $event,
				locals: {
					warning: {
						title: 'Warning!',
						description:
							'Transactions could be restored if <b>Unique Transaction Code</b> is free to use. Transactions that failed restore process will stay in Recycle Bin',
					},
				},
				multiple: true,
				preserveScope: true,
				autoWrap: true,
				skipHide: true,
			})
			.then(function (res) {
				if (res.status === 'agree') {
					var ids = []

					vm.items.forEach(function (item) {
						if (item.selected) {
							ids.push(item.id)
						}
					})

					complexTransactionService
						.restoreBulk({ ids: ids })
						.then(function (data) {
							toastNotificationService.info('Transactions were restored')

							vm.getData()
						})
				}
			})
	}

	vm.destroySelected = function ($event) {
		$mdDialog
			.show({
				controller: 'WarningDialogController as vm',
				templateUrl: 'views/dialogs/warning-dialog-view.html',
				targetEvent: $event,
				locals: {
					warning: {
						title: 'Warning!',
						description:
							'Selected Transactions will be <b>Deleted</b> completely.',
					},
				},
				multiple: true,
				preserveScope: true,
				autoWrap: true,
				skipHide: true,
			})
			.then(function (res) {
				if (res.status === 'agree') {
					var ids = []

					vm.items.forEach(function (item) {
						if (item.selected) {
							ids.push(item.id)
						}
					})

					complexTransactionService
						.deleteBulk({ ids: ids })
						.then(function (data) {
							toastNotificationService.info('Transactions were deleted')

							vm.getData()
						})
				}
			})
	}

	vm.clearBin = function ($event) {
		$mdDialog
			.show({
				controller: 'WarningDialogController as vm',
				templateUrl: 'views/dialogs/warning-dialog-view.html',
				targetEvent: $event,
				locals: {
					warning: {
						title: 'Warning!',
						description:
							'Transactions from ' +
							vm.filters.date_from +
							' to ' +
							vm.filters.date_to +
							' will be <b>Deleted</b> completely.',
					},
				},
				multiple: true,
				preserveScope: true,
				autoWrap: true,
				skipHide: true,
			})
			.then(function (res) {
				if (res.status === 'agree') {
					utilsService
						.clearRecycleBin({
							date_from: vm.filters.date_from,
							date_to: vm.filters.date_to,
						})
						.then(function (data) {
							vm.getData()
						})
				}
			})
	}

	vm.getData = function () {
		vm.readyStatus.data = false

		utilsService
			.getRecycleBin({
				pageSize: vm.pageSize,
				page: vm.currentPage,
				filters: vm.filters,
				sort: {
					direction: 'DESC',
					key: 'created',
				},
			})
			.then(function (data) {
				vm.generatePages(data)

				vm.items = data.results
				vm.count = data.count

				vm.items.forEach(function (item) {
					item.modified_datetime_prettty = moment(
						new Date(item.modified)
					).format('DD-MM-YYYY HH:mm')
				})

				vm.readyStatus.data = true
				$scope.$apply()
			})
			.catch(function (error) {
				vm.readyStatus.data = true
				$scope.$apply()
			})
	}

	vm.init = function () {
		if ($stateParams.date_from) {
			vm.filters.date_from = $stateParams.date_from
		}

		if ($stateParams.date_to) {
			vm.filters.date_to = $stateParams.date_to
		}

		vm.getData()
	}

	vm.init()
}
