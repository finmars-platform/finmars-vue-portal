/**
 * Created by mevstratov on 02.08.2019.
 */

import metaService from '../../services/metaService'

export default function (
	$scope,
	$mdDialog,
	metaContentTypesService,
	uiService,
	options
) {


	var vm = this

	var layoutsToLoad = options.entityType || 'all'

	vm.items = []

	vm.dialogTitle = options.dialogTitle || 'Select layout'

	vm.noFolding = options.noFolding

	vm.collapsingGroups = {
		'reports.balancereport': false,
		'reports.plreport': false,
		'reports.transactionreport': false,
		'portfolios.portfolio': false,
		'accounts.account': false,
		'accounts.accounttype': false,
		'instruments.instrument': false,
		'instruments.instrumenttype': false,
		'instruments.pricingpolicy': false,
		'instruments.pricehistory': false,
		'transactions.transaction': false,
		'transactions.complextransaction': false,
		'transactions.transactiontype': false,
		'transactions.transactiontypegroup': false,
		'counterparties.responsible': false,
		'counterparties.responsiblegroup': false,
		'counterparties.counterparty': false,
		'counterparties.counterpartygroup': false,
		'currencies.currency': false,
		'strategies.strategy1': false,
		'strategies.strategy1subgroup': false,
		'strategies.strategy2': false,
		'strategies.strategy2subgroup': false,
		'strategies.strategy3': false,
		'strategies.strategy3subgroup': false,
	}

	function contentTypeToState(contentType) {
		var result = ''

		metaContentTypesService.getListForUi().forEach(function (item) {
			if (item.key == contentType) {
				if (contentType.indexOf('reports') == 0) {
					result = 'app.portal.reports.' + item.entity
				} else {
					result = 'app.portal.data.' + item.entity
				}
			}
		})

		return result
	}

	var setAttributeManagerContainersHeight = function () {
		// for collapse animation

		var resizableLayoutsWrapList =
			document.querySelectorAll('.cb1-resizing-wrap')

		for (var i = 0; i < resizableLayoutsWrapList.length; i++) {
			var layoutsWrap = resizableLayoutsWrapList[i]
			var layoutsHolder = layoutsWrap.querySelector(
				'.select-layouts-layouts-holder'
			)

			var layoutsHolderHeight = layoutsHolder.clientHeight + 'px'
			layoutsWrap.style.height = layoutsHolderHeight
		}
	}

	metaService.getContentGroups('entityLayoutsGroups').then(function (data) {
		vm.groups = data
	})

	vm.readyStatus = { content: false }

	var loadOptions = {
		pageSize: 1000,
		page: 1,
		sort: {
			key: 'content_type',
			direction: 'DSC',
		},
	}

	vm.selectedLayoutId = null

	vm.expandAll = function () {
		var keys = Object.keys(vm.collapsingGroups)

		keys.forEach(function (key) {
			vm.collapsingGroups[key] = false
		})
	}

	vm.collapseAll = function () {
		var keys = Object.keys(vm.collapsingGroups)

		keys.forEach(function (key) {
			vm.collapsingGroups[key] = true
		})
	}

	var getLayouts = function () {
		uiService.getListLayout(layoutsToLoad, loadOptions).then(function (data) {
			vm.items = vm.items.concat(data.results)

			if (data.next) {
				loadOptions.page = loadOptions.page + 1
				getLayouts()
			} else {
				var i, c
				for (i = 0; i < vm.items.length; i++) {
					var item = vm.items[i]

					if (Array.isArray(item.data.filters)) {
						var f
						for (f = 0; f < item.data.filters.length; f++) {
							var filter = item.data.filters[f]

							if (filter.options.hasOwnProperty('use_from_above')) {
								item.hasUseFromAboveFilter = true
								break
							}
						}
					}

					for (c = 0; c < vm.groups.length; c++) {
						if (item.content_type === vm.groups[c].key) {
							vm.groups[c].content.push(item)
							break
						}
					}
				}

				vm.readyStatus.content = true
				$scope.$apply()
				setAttributeManagerContainersHeight()
			}
		})
	}

	vm.setLRWHeight = function () {
		setTimeout(function () {
			setAttributeManagerContainersHeight()
		}, 100)
	}

	vm.selectLayout = function (item) {
		vm.selectedLayoutId = item.id
		vm.selectedContentType = item.content_type
		vm.selectedLayoutName = item.name
	}

	vm.isSelectedLayout = function (layoutId) {
		if (vm.selectedLayoutId === layoutId) {
			return true
		}

		return false
	}

	vm.agree = function () {
		$mdDialog.hide({
			status: 'agree',
			data: {
				listLayoutId: vm.selectedLayoutId,
				state: contentTypeToState(vm.selectedContentType),
				name: vm.selectedLayoutName,
				content_type: vm.selectedContentType,
			},
		})
	}

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	var init = function () {
		getLayouts()

		vm.setLRWHeight()
	}

	init()
}
