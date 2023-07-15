/**
 * Created by szhitenev on 15.12.2022.
 */

import baseUrlService from '../../services/baseUrlService'
import errorRecordService from '../../services/errorRecordService'
import downloadFileHelper from '../../helpers/downloadFileHelper'
import toastNotificationService from '@/angular/core/services/toastNotificationService'

var baseUrl = baseUrlService.resolve()

export default function dataStatsController(
	$scope,
	authorizerService,
	globalDataService,
	$mdDialog
) {
	var vm = this

	vm.currentPage = 1
	vm.pageSize = 40

	vm.count = 0

	vm.pages = []

	vm.openPreviousPage = function () {
		vm.currentPage = vm.currentPage - 1

		vm.getData()
	}

	vm.openNextPage = function () {
		vm.currentPage = vm.currentPage + 1

		vm.getData()
	}

	vm.openPage = function (page) {
		if (page.number) {
			vm.currentPage = page.number

			vm.getData()
		}
	}

	vm.searchMessages = function () {
		vm.currentPage = 1
		vm.getData()
	}

	vm.generatePages = function (data) {
		vm.totalPages = Math.round(data.count / vm.pageSize)

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

				if (index > vm.currentPageIndex - 2 && index < vm.currentPageIndex) {
					return true
				}

				if (index < vm.currentPageIndex + 2 && index > vm.currentPageIndex) {
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

	vm.readyStatus = { content: false }

	vm.getData = function () {
		vm.readyStatus.content = false
		var filters = {}

		if (vm.query) {
			filters.query = vm.query
		}

		errorRecordService
			.getList({
				pageSize: vm.pageSize,
				page: vm.currentPage,
				filters: filters,
				sort: {
					direction: 'DESC',
					key: 'created',
				},
			})
			.then(function (data) {
				vm.generatePages(data)

				vm.count = data.count

				vm.items = data.results.map(function (item) {
					if (item.status_code !== 500) {
						item.details = JSON.stringify(item.details, null, 4)
					}

					var pieces = item.created.split('T')

					item.created = pieces[0] + ' ' + pieces[1].split('.')[0]

					return item
				})

				vm.readyStatus.content = true



				$scope.$apply()
			})
	}

	vm.getExportLogsUrl = function () {
		var baseUrl = baseUrlService.resolve()
		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		if (vm.query) {
			return (
				baseUrl +
				'/' +
				prefix +
				'/' +
				apiVersion +
				'/errors/error/export?query=' +
				vm.query
			)
		} else {
			return baseUrl + '/' + prefix + '/' + apiVersion + '/errors/error/export'
		}
	}

	vm.init = function () {
		vm.getData()
	}

	vm.init()
}
