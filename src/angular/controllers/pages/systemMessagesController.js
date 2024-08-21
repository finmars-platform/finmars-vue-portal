/**
 * Created by mevstratov on 30.10.2020.
 */

// import systemMessageService from '../../services/systemMessageService';

export default function systemMEssagesController(
	$scope,
	$mdDialog,
	systemMessageService
) {
	var vm = this

	vm.currentPage = 1

	vm.pages = []

	vm.systemMessages = []

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

	vm.downloadFile = function ($event, item) {
		systemMessageService.viewFile(item.file_report).then(function (data) {


			$mdDialog.show({
				controller: 'FilePreviewDialogController as vm',
				templateUrl: 'views/dialogs/file-preview-dialog-view.html',
				parent: angular.element(document.body),
				targetEvent: $event,
				clickOutsideToClose: false,
				preserveScope: true,
				autoWrap: true,
				skipHide: true,
				multiple: true,
				locals: {
					data: {
						content: data,
						info: item,
					},
				},
			})
		})
	}

	vm.searchMessages = function () {
		vm.currentPage = 1
		vm.getData()
	}

	vm.getData = function () {
		var filters = {}

		if (vm.query) {
			filters.text = vm.query
		}

		systemMessageService
			.getList({
				pageSize: 40,
				page: vm.currentPage,
				filters: filters,
				sort: {
					direction: 'DESC',
					key: 'created_at',
				},
			})
			.then(function (data) {
				vm.systemMessages = data.results

				vm.generatePages(data)

				vm.systemMessages = vm.systemMessages.map(function (item) {
					item.verbose_created = moment(new Date(item.created_at)).format(
						'DD-MM-YYYY HH:mm'
					)

					if (item.type === 1) {
						item.verbose_type = 'Information'
					} else if (item.type === 2) {
						item.verbose_type = 'Warning'
					} else if (item.type === 3) {
						item.verbose_type = 'Error'
					} else if (item.type === 4) {
						item.verbose_type = 'Success'
					}



					if (item.section === 0) {
						item.verbose_section = 'General'
					} else if (item.section === 1) {
						item.verbose_section = 'Events'
					} else if (item.section === 2) {
						item.verbose_section = 'Transactions'
					} else if (item.section === 3) {
						item.verbose_section = 'Instruments'
					} else if (item.section === 4) {
						item.verbose_section = 'Data'
					} else if (item.section === 5) {
						item.verbose_section = 'Prices'
					} else if (item.section === 6) {
						item.verbose_section = 'Report'
					} else if (item.section === 7) {
						item.verbose_section = 'Import'
					} else if (item.section === 8) {
						item.verbose_section = 'Activity Log'
					} else if (item.section === 9) {
						item.verbose_section = 'Schedules'
					}

					return item
				})

				// newest at the bottom
				vm.systemMessages = vm.systemMessages.reverse()

				vm.systemMessagesReady = true

				$scope.$apply()
			})
	}

	vm.init = function () {
		vm.getData()
	}

	vm.init()
}
