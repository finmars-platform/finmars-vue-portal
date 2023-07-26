import transactionImportSchemeService from '@/angular/services/import/transactionImportSchemeService'
/**
 * Created by szhitenev on 17.08.2016.
 */

import transactionImportSchemeService from '@/angular/services/import/transactionImportSchemeService'

export default function settingsGeneralTransactionImportController(
	$scope,
	$mdDialog
) {
	var vm = this

	vm.readyStatus = { schemes: false }
	vm.schemes = []

	vm.currentPage = 1
	vm.pageSize = 40

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

	vm.getData = function () {
		vm.readyStatus.schemes = false

		transactionImportSchemeService
			.getListLight({
				pageSize: vm.pageSize,
				page: vm.currentPage,
			})
			.then(function (data) {
				vm.generatePages(data)

				vm.schemes = data.results
				vm.readyStatus.schemes = true
				$scope.$apply()
			})
	}

	vm.addScheme = function ($event) {
		$mdDialog
			.show({
				controller: 'TransactionImportSchemeAddDialogController as vm',
				templateUrl:
					'views/dialogs/transaction-import/transaction-import-scheme-dialog-view.html',
				targetEvent: $event,
				locals: {
					data: {},
				},
			})
			.then(function (res) {
				if (res.status === 'agree') {

					vm.getData()
				}
			})
	}

	vm.editScheme = function ($event, item) {
		$mdDialog
			.show({
				controller: 'TransactionImportSchemeEditDialogController as vm',
				templateUrl:
					'views/dialogs/transaction-import/transaction-import-scheme-dialog-view.html',
				targetEvent: $event,
				locals: {
					schemeId: item.id,
				},
			})
			.then(function (res) {
				if (res.status === 'agree') {
					vm.getData()
				} else if (res.status === 'copy') {
					res.dialogPromise.then(function (copyRes) {
						if (copyRes.status === 'agree') {
							vm.getData()
						}
					})
				}
			})
	}

	vm.editSchemeV2 = function ($event, item) {
		$mdDialog
			.show({
				controller: 'TransactionImportSchemeV2EditDialogController as vm',
				templateUrl:
					'views/dialogs/transaction-import/transaction-import-scheme-v2-dialog-view.html',
				locals: {
					schemeId: item.id,
				},
				targetEvent: $event,
				preserveScope: true,
				multiple: true,
				autoWrap: true,
				skipHide: true,
			})
			.then(function (res) {
				if (res.status === 'agree') {
					vm.getData()
				} else if (res.status === 'copy') {
					res.dialogPromise.then(function (copyRes) {
						if (copyRes.status === 'agree') {
							vm.getData()
						}
					})
				}
			})
	}

	vm.deleteScheme = function ($event, item) {
		$mdDialog
			.show({
				controller: 'WarningDialogController as vm',
				templateUrl: 'views/dialogs/warning-dialog-view.html',
				targetEvent: $event,
				locals: {
					warning: {
						title: 'Warning!',
						description: 'Are you sure to delete ' + item.user_code,
					},
				},
				preserveScope: true,
				autoWrap: true,
				skipHide: true,
				multiple: true,
			})
			.then(function (res) {
				if (res.status === 'agree') {
					transactionImportSchemeService.deleteByKey(item.id).then(function () {
						vm.getData()
					})
				}
			})
	}

	vm.init = function () {
		vm.getData()
	}

	vm.init()
}
