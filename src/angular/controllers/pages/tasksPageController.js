/**
 * Created by szhitenev on 22.03.2023.
 */

import tasksService from '../../services/tasksService'

import baseUrlService from '../../services/baseUrlService'
import utilsService from '../../services/utilsService'
import complexTransactionService from '../../services/transaction/complexTransactionService'
import masterUserService from '../../services/masterUserService'
import downloadFileHelper from '../../helpers/downloadFileHelper'
import toastNotificationService from '@/angular/core/services/toastNotificationService'

var baseUrl = baseUrlService.resolve()

export default function tasksPageController(
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
	vm.pageSize = 20

	vm.pages = []

	var priorDate = new Date(new Date().setDate(new Date().getDate() - 30))

	vm.filters = {
		date_from: priorDate.toISOString().split('T')[0],
		date_to: new Date().toISOString().split('T')[0],
	}

	vm.activeTask = null
	vm.activeTaskProcessing = false

	vm.selectActiveTask = function ($event, item) {
		vm.items.forEach(function (_item) {
			_item.active = false
		})

		item.active = true
		vm.activeTask = item
	}

	// TODO move to separate service to keep it DRY
	vm.alphabets = [
		'#357EC7', // A
		'#C11B17', // B
		'#008080', // C
		'#728C00', // D
		'#0020C2', // E
		'#347C17', // F
		'#D4A017', // G
		'#7D0552', // H
		'#9F000F', // I
		'#E42217', // J
		'#F52887', // K
		'#571B7E', // L
		'#1F45FC', // M
		'#C35817', // N
		'#F87217', // O
		'#41A317', // P
		'#4C4646', // Q
		'#4CC417', // R
		'#C12869', // S
		'#15317E', // T
		'#AF7817', // U
		'#F75D59', // V
		'#FF0000', // W
		'#000000', // X
		'#E9AB17', // Y
		'#8D38C9', // Z
	]

	vm.getAvatar = function (char) {
		let charCode = char.charCodeAt(0)
		let charIndex = charCode - 65

		let colorIndex = charIndex % vm.alphabets.length

		return vm.alphabets[colorIndex]
	}

	vm.openPreviousPage = function () {
		vm.currentPage = vm.currentPage - 1

		$state.go(
			'app.portal.tasks-page',
			{
				page: vm.currentPage,
				date_from: vm.filters.date_from,
				date_to: vm.filters.date_to,
				query: vm.filters.query,
			},
			{ notify: false }
		)

		vm.getData()
	}

	vm.openNextPage = function () {
		vm.currentPage = vm.currentPage + 1

		$state.go(
			'app.portal.tasks-page',
			{
				page: vm.currentPage,
				date_from: vm.filters.date_from,
				date_to: vm.filters.date_to,
				query: vm.filters.query,
			},
			{ notify: false }
		)

		vm.getData()
	}

	vm.openPage = function (page) {
		if (page.number) {
			vm.currentPage = page.number

			$state.go(
				'app.portal.tasks-page',
				{
					page: vm.currentPage,
					date_from: vm.filters.date_from,
					date_to: vm.filters.date_to,
					query: vm.filters.query,
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
			'app.portal.tasks-page',
			{
				page: vm.currentPage,
				date_from: vm.filters.date_from,
				date_to: vm.filters.date_to,
				query: vm.filters.query,
			},
			{ notify: false }
		)

		vm.getData()
	}

	vm.toPrettyTime = function (sec) {
		var sec_num = parseInt(sec, 10) // don't forget the second param
		var hours = Math.floor(sec_num / 3600)
		var minutes = Math.floor((sec_num - hours * 3600) / 60)
		var seconds = sec_num - hours * 3600 - minutes * 60

		if (hours < 10) {
			hours = '0' + hours
		}
		if (minutes < 10) {
			minutes = '0' + minutes
		}
		if (seconds < 10) {
			seconds = '0' + seconds
		}
		return hours + ':' + minutes + ':' + seconds
	}

	vm.refreshTask = function ($event) {
		vm.activeTaskProcessing = true

		tasksService.getByKey(vm.activeTask.id).then(function (data) {
			vm.activeTask = vm.formatTask(data)

			vm.activeTaskProcessing = false
			$scope.$apply()
		})
	}

	vm.formatTask = function (item) {
		if (item.finished_at) {
			const date1 = new Date(item.created)
			const date2 = new Date(item.finished_at)
			const diffTime = Math.abs(date2 - date1)

			item.execution_time_pretty = vm.toPrettyTime(Math.floor(diffTime / 1000))
			item.finished_at_pretty = moment(new Date(item.finished_at)).format(
				'HH:mm:ss'
			)
		}

		item.options_object = JSON.stringify(item.options_object, null, 4)
		item.result_object = JSON.stringify(item.result_object, null, 4)
		item.progress_object = JSON.stringify(item.progress_object, null, 4)

		return item
	}

	vm.getData = function () {
		tasksService
			.getList({
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

				if (!vm.activeTask) {
					if (vm.items.length) {
						vm.activeTask = vm.items[0]
						vm.items[0].active = true
					}
				}

				vm.items = vm.items.map(function (item) {
					item = vm.formatTask(item)

					return item
				})

				// vm.items[0].status = 'P'

				vm.readyStatus.data = true
				$scope.$apply()
			})
			.catch(function (error) {
				vm.readyStatus.data = true
				$scope.$apply()
			})
	}

	vm.init = function () {
		// vm.readyStatus.data = false;

		if ($stateParams.date_from) {
			vm.filters.date_from = $stateParams.date_from
		}

		if ($stateParams.date_to) {
			vm.filters.date_to = $stateParams.date_to
		}

		if ($stateParams.query) {
			vm.filters.query = $stateParams.query
		}

		vm.getData()

		setInterval(function () {
			vm.getData()
		}, 1000 * 30)
	}

	vm.init()
}
