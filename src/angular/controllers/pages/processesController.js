/**
 * Created by mevstratov on 24.06.2019.
 */

import processesService from '../../services/processesService'

import baseUrlService from '../../services/baseUrlService'

var baseUrl = baseUrlService.resolve()

export default function processesController($scope, $mdDialog) {
	var vm = this

	vm.items = []
	vm.readyStatus = { data: false }

	vm.interval = null

	vm.currentPage = 1

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

	vm.generatePages = function (data) {
		vm.totalPages = Math.round(data.count / 40)

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

	vm.searchProcesses = function () {
		vm.currentPage = 1

		vm.getData()
	}

	vm.getRunning = function () {
		vm.readyStatus.running = false

		return new Promise(function (resolve, reject) {
			var filters = {
				status: 'P',
			}

			if (vm.query) {
				filters.query = vm.query
			}

			processesService
				.getList({
					pageSize: 40,
					page: 1,
					filters: filters,
					sort: {
						direction: 'DESC',
						key: 'created',
					},
				})
				.then(function (data) {
					vm.runningItems = data.results

					vm.runningItems = vm.runningItems.map(function (item) {
						try {
							item.options_object = JSON.stringify(item.options_object, null, 4)
							item.result_object = JSON.stringify(item.result_object, null, 4)
						} catch (error) {}

						return item
					})

					vm.readyStatus.running = true

					resolve()

					$scope.$apply()
				})
		})
	}

	vm.getFinished = function () {
		vm.readyStatus.data = false

		return new Promise(function (resolve, reject) {
			var filters = {}

			if (vm.query) {
				filters.query = vm.query
			}

			processesService
				.getList({
					pageSize: 40,
					page: vm.currentPage,
					filters: filters,
					sort: {
						direction: 'DESC',
						key: 'created',
					},
				})
				.then(function (data) {
					vm.generatePages(data)

					vm.items = data.results

					vm.items = vm.items.filter(function (item) {
						return item.status !== 'P'
					})

					vm.items = vm.items.map(function (item) {
						try {
							item.options_object = JSON.stringify(item.options_object, null, 4)
							item.result_object = JSON.stringify(item.result_object, null, 4)
						} catch (error) {}

						return item
					})

					vm.readyStatus.data = true

					resolve()

					$scope.$apply()
				})
		})
	}

	vm.getData = function () {
		vm.getRunning()
		vm.getFinished()
	}

	vm.toggleShowAll = function () {
		vm.showAll = !vm.showAll

		if (vm.showAll) {
			delete vm.options.filters.task_status
		} else {
			vm.options.filters.task_status = 'P'
		}

		vm.getData()
	}

	vm.getStatus = function (item) {
		if (item.status === 'I') {
			return 'Init'
		}

		if (item.status === 'P') {
			return 'Running'
		}

		if (item.status === 'SUCCESS' || item.status === 'D') {
			return 'Done'
		}

		if (item.status === 'E') {
			return 'Error'
		}

		if (item.status === 'T') {
			return 'Timeout'
		}

		if (item.status === 'C') {
			return 'Canceled'
		}

		return 'Unknown'
	}

	vm.getStartedAt = function (item) {
		return (
			new Date(item.created).toLocaleDateString() +
			' ' +
			new Date(item.created).toLocaleTimeString()
		)
	}

	vm.requestTaskStatus = function ($event, item) {
		processesService
			.getStatus(item.id, item.celery_task_id)
			.then(function (data) {
				item.status_object = data
				$scope.$apply()
			})
	}

	vm.cancelTask = function ($event, item) {
		processesService.cancelTask(item.id).then(function (data) {
			vm.getData()
		})
	}

	vm.abortTransactionImport = function ($event, item) {
		processesService.abortTransactionImport(item.id).then(function (data) {
			vm.getData()
		})
	}

	vm.getProcessName = function (item) {
		var result = ''

		if (item.type === 'validate_simple_import') {
			result = 'Entity Import Validation'

			if (item.data) {
				if (item.data.user_code) {
					result = result + ': ' + item.data.user_code
				}

				if (item.data.file_name) {
					result = result + '; File: ' + item.data.file_name
				}
			}
		}

		if (item.type === 'simple_import') {
			result = 'Entity Import'

			if (item.data) {
				if (item.data.user_code) {
					result = result + ': ' + item.data.user_code
				}

				if (item.data.file_name) {
					result = result + '; File: ' + item.data.file_name
				}
			}
		}

		if (item.type === 'validate_transaction_import') {
			result = 'Transaction Import Validation'

			if (item.data) {
				if (item.data.user_code) {
					result = result + ': ' + item.data.user_code
				}

				if (item.data.file_name) {
					result = result + '; File: ' + item.data.file_name
				}
			}
		}

		if (item.type === 'transaction_import') {
			result = 'Transaction Import'

			if (item.data) {
				if (item.data.user_code) {
					result = result + ': ' + item.data.user_code
				}

				if (item.data.file_name) {
					result = result + '; File: ' + item.data.file_name
				}
			}
		}

		if (item.type === 'user_download_pricing') {
			result = 'User Triggered Prices Download'
		}

		if (item.type === 'configuration_import') {
			result = 'Configuration Import'
		}

		if (item.type === 'attribute_recalculation') {
			result = 'Attribute Recalculation'
		}

		if (!result) {
			result = 'Unknown Task'
		}

		return result
	}

	vm.getFileUrl = function (id) {
		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return (
			baseUrl +
			'/' +
			prefix +
			'/' +
			apiVersion +
			'/' +
			'file-reports/file-report/' +
			id +
			'/view/'
		)
	}

	vm.init = function () {
		vm.getData()
	}

	vm.init()
}
