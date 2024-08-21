/**
 * Created by szhitenev on 07.03.2023.
 */

import historyService from '../../services/historyService'
import metaContentTypesService from '../../services/metaContentTypesService'

export default function journalPageController(
	$scope,
	$state,
	$stateParams,
	$mdDialog,
	usersService
) {
	var vm = this

	vm.items = []
	vm.readyStatus = { data: false }

	vm.filters = {}
	vm.contentTypes = []

	vm.interval = null

	vm.currentPage = 1
	vm.pageSize = 40

	vm.pages = []

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
			'app.portal.journal',
			{
				page: vm.currentPage,
				date_from: vm.filters.date_from,
				date_to: vm.filters.date_to,
				query: vm.filters.query,
				member: vm.filters.member,
				action: vm.filters.action,
				content_type: vm.filters.content_type,
			},
			{ notify: false }
		)

		vm.getData()
	}

	vm.openNextPage = function () {
		vm.currentPage = vm.currentPage + 1

		$state.go(
			'app.portal.journal',
			{
				page: vm.currentPage,
				date_from: vm.filters.date_from,
				date_to: vm.filters.date_to,
				query: vm.filters.query,
				member: vm.filters.member,
				action: vm.filters.action,
				content_type: vm.filters.content_type,
			},
			{ notify: false }
		)

		vm.getData()
	}

	vm.openPage = function (page) {
		if (page.number) {
			vm.currentPage = page.number

			$state.go(
				'app.portal.journal',
				{
					page: vm.currentPage,
					date_from: vm.filters.date_from,
					date_to: vm.filters.date_to,
					query: vm.filters.query,
					member: vm.filters.member,
					action: vm.filters.action,
					content_type: vm.filters.content_type,
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
			'app.portal.journal',
			{
				page: vm.currentPage,
				date_from: vm.filters.date_from,
				date_to: vm.filters.date_to,
				query: vm.filters.query,
				member: vm.filters.member,
				action: vm.filters.action,
				content_type: vm.filters.content_type,
			},
			{ notify: false }
		)

		vm.getData()
	}

	vm.getData = function () {
		vm.readyStatus.data = false

		return new Promise(function (resolve, reject) {
			historyService
				.getList({
					pageSize: vm.pageSize,
					page: vm.currentPage,
					filters: vm.filters,
					sort: {
						direction: 'DESC',
						key: 'created_at',
					},
				})
				.then(function (data) {
					vm.generatePages(data)

					vm.items = data.results
					vm.count = data.count

					vm.items = vm.items.map(function (item) {
						item.created_pretty = moment(new Date(item.created_at)).format(
							'DD-MM-YYYY HH:mm'
						)
						item.created_date_pretty = moment(new Date(item.created_at)).format(
							'YYYY-MM-DD'
						)
						item.created_time_pretty = moment(new Date(item.created_at)).format(
							'HH:mm'
						)
						item.content_type_pretty =
							metaContentTypesService.getEntityNameByContentType(
								item.content_type
							)

						try {
							var pieces = item.context_url.split('/api/v1')

							if (pieces.length >= 2) {
								item.context_url_pretty = pieces[1]
							} else {
								item.context_url_pretty = pieces[0] // because celery tasks do not have API URL context its has task name
							}
						} catch (e) {
							item.context_url_pretty = item.context_url
						}

						try {
							item.notes_pretty = JSON.stringify(
								JSON.parse(item.notes),
								null,
								4
							)
						} catch (e) {
							item.notes_pretty = item.notes
						}
						return item
					})

					vm.readyStatus.data = true

					resolve()

					$scope.$apply()
				})
		})
	}

	vm.previewNotes = function ($event, item) {
		var notes = {}

		try {
			notes = JSON.parse(item.notes)
		} catch (e) {
			notes = {}
		}

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
					content: notes,
					file_descriptor: {
						name: item.user_code + '.json',
					},
				},
			},
		})
	}

	vm.showRecordData = function ($event, record) {
		historyService.getRecordData(record.id).then(function (data) {
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
						file_descriptor: {
							name: record.user_code + '.json',
						},
					},
				},
			})
		})
	}

	vm.getMembers = function () {
		usersService.getMemberList().then(function (data) {
			vm.members = data.results

			$scope.$apply()
		})
	}

	vm.getAvailableContentTypes = function () {
		historyService.getAvailableContentTypes().then(function (data) {
			vm.contentTypes = data.results.map(function (item) {
				item.name = metaContentTypesService.getEntityNameByContentType(item.key)

				if (!item.name) {
					item.name = item.key
				}

				return item
			})

			$scope.$apply()
		})
	}

	vm.init = function () {


		if ($stateParams.page) {
			vm.currentPage = $stateParams.page
		}

		if ($stateParams.query) {
			vm.filters.query = $stateParams.query
		}

		if ($stateParams.date_from) {
			vm.filters.date_from = $stateParams.date_from
		}

		if ($stateParams.date_to) {
			vm.filters.date_to = $stateParams.date_to
		}

		if ($stateParams.action) {
			if (typeof $stateParams.action == 'string') {
				vm.filters.action = [$stateParams.action]
			} else {
				vm.filters.action = $stateParams.action
			}
		}

		if ($stateParams.member) {
			if (typeof $stateParams.member == 'string') {
				vm.filters.member = [$stateParams.member]
			} else {
				vm.filters.member = $stateParams.member
			}
		}

		if ($stateParams.content_type) {
			if (typeof $stateParams.content_type == 'string') {
				vm.filters.content_type = [$stateParams.content_type]
			} else {
				vm.filters.content_type = $stateParams.content_type
			}
		}

		vm.getData()
		vm.getMembers()
		vm.getAvailableContentTypes()
	}

	vm.init()
}
