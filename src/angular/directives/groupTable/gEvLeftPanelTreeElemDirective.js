/**
 * Created by szhitenev on 25.05.2021.
 * */

import evEvents from '../../services/entityViewerEvents'

import evDomManager from '../../services/ev-dom-manager/ev-dom.manager'

export default function ($mdDialog, $state) {
	return {
		restrict: 'E',
		templateUrl:
			'views/directives/groupTable/g-ev-left-panel-tree-elem-view.html',
		scope: {
			evDataService: '=',
			evEventService: '=',
			item: '=',
			evContentElement: '=',
		},
		link: function (scope) {
			scope.loading = false

			scope.unfoldGroup = function ($event) {
				scope.item.___is_open = true

				scope.evDataService.setData(scope.item)

				const hasUnloadedChildren =
					scope.item.___items_count > 0 && !scope.item.results.length

				if (hasUnloadedChildren) {
					scope.loading = true

					const dataLoadEndIndex = scope.evEventService.addEventListener(
						evEvents.DATA_LOAD_END,
						function () {
							scope.loading = false
							scope.evEventService.removeEventListener(
								evEvents.DATA_LOAD_END,
								dataLoadEndIndex
							)
						}
					)
				}

				evDomManager.requestGroups(
					scope.item.___id,
					scope.item.___parentId,
					scope.evDataService,
					scope.evEventService
				)

				// scope.evEventService.dispatchEvent(evEvents.UPDATE_TABLE)
			}

			scope.foldGroup = function ($event) {
				scope.item.___is_open = false
				scope.evDataService.setData(scope.item)
				scope.evEventService.dispatchEvent(evEvents.UPDATE_TABLE)
			}

			var deselectChildrenObjs = function (item) {
				item.results.forEach(function (child) {
					// deactivate objects from previously selected group

					if (child.___type === 'object') {
						child.___is_activated = false
					}
				})

				return item
			}

			scope.loadMore = function ($event) {
				var groupHashId = scope.item.___id

				var requestParameters =
					scope.evDataService.getRequestParameters(groupHashId)



				scope.total_pages = Math.ceil(
					requestParameters.pagination.count /
						requestParameters.pagination.page_size
				)

				if (requestParameters.body.page < scope.total_pages) {
					if (!requestParameters.body.page) {
						requestParameters.body.page = 1
						requestParameters.requestedPages = [1]
					}

					requestParameters.body.page = requestParameters.body.page + 1
					requestParameters.pagination.page =
						requestParameters.pagination.page + 1
					requestParameters.requestedPages.push(requestParameters.body.page)

					scope.evDataService.setRequestParameters(requestParameters)
					scope.evDataService.setActiveRequestParametersId(requestParameters.id)

					scope.currentPage = requestParameters.body.page
				}

				scope.evEventService.dispatchEvent(evEvents.UPDATE_TABLE)
			}

			scope.loadAll = function ($event) {
				var groupHashId = scope.item.___id

				var requestParameters =
					scope.evDataService.getRequestParameters(groupHashId)



				scope.total_pages = Math.ceil(
					requestParameters.pagination.count /
						requestParameters.pagination.page_size
				)

				if (requestParameters.body.page < scope.total_pages) {
					if (!requestParameters.body.page) {
						requestParameters.body.page = 1
						requestParameters.requestedPages = [1]
					}

					requestParameters.loadAll = true

					requestParameters.body.page = requestParameters.body.page + 1
					requestParameters.pagination.page =
						requestParameters.pagination.page + 1
					requestParameters.requestedPages.push(requestParameters.body.page)

					scope.evDataService.setRequestParameters(requestParameters)

					scope.currentPage = requestParameters.body.page
				}
				scope.evEventService.dispatchEvent(evEvents.UPDATE_TABLE)
			}

			scope.toggleGroupSelection = function ($event) {
				if (!scope.isLastLevel) {
					return
				}

				var selectedGroups = []

				scope.multiselectIsActive =
					scope.evDataService.getSelectedGroupsMultiselectState()

				if (!scope.multiselectIsActive) {
					var selected = scope.item.___is_selected
					var items = scope.evDataService.getDataAsList()

					items.forEach(function (item) {
						item.___is_selected = false

						if (item.results && item.results.length) {
							item = deselectChildrenObjs(item)
						}

						scope.evDataService.setData(item)
					})

					scope.evDataService.setSelectedGroups([])

					scope.item.___is_selected = selected // return ___is_selected status of clicked group after resetting statuses of all groups
				}

				selectedGroups = scope.evDataService.getSelectedGroups()

				if (scope.item.___is_selected) {
					if (scope.item.results && scope.item.results.length) {
						var item = scope.evDataService.getData(scope.item.___id)
						item = deselectChildrenObjs(item)

						scope.evDataService.setData(item)
					}

					selectedGroups = selectedGroups.filter(function (group) {
						return group.___id !== scope.item.___id
					})
				} else {
					evDomManager.requestObjects(
						scope.item.___id,
						scope.item.___parentId,
						scope.evDataService,
						scope.evEventService
					)

					selectedGroups.push(scope.item)
				}

				scope.item.___is_selected = !scope.item.___is_selected

				scope.evDataService.setData(scope.item)

				scope.evDataService.setSelectedGroups(selectedGroups)

				scope.evContentElement.scrollTop = 0

				scope.evDataService.setSelectAllRowsState(false)

				scope.evEventService.dispatchEvent(evEvents.ROW_ACTIVATION_CHANGE)
				scope.evEventService.dispatchEvent(evEvents.HIDE_BULK_ACTIONS_AREA)

				scope.evEventService.dispatchEvent(evEvents.UPDATE_TABLE)
			}

			scope.getPrettyName = function () {
				scope.item.___group_name_pretty = scope.item.___group_name

				if (
					scope.groupType &&
					scope.groupType.entity === 'complex-transaction'
				) {
					if (scope.groupType.key === 'status') {
						if (scope.item.___group_name === 1) {
							scope.item.___group_name_pretty = 'Booked'
						} else if (scope.item.___group_name === 2) {
							scope.item.___group_name_pretty = 'Pending'
						} else if (scope.item.___group_name === 3) {
							scope.item.___group_name_pretty = 'Ignored'
						}
					}
				}

				return scope.item.___group_name_pretty
			}

			scope.getGroupType = function () {
				//

				var groups = scope.evDataService.getGroups()

				scope.groupType = groups[scope.item.___level - 1]

				if (scope.item.___level === groups.length) {
					scope.isLastLevel = true
				}

				//
				//
			}

			var init = async function () {
				scope.getGroupType()

				scope.evEventService.addEventListener(
					evEvents.REDRAW_TABLE,
					function () {
						scope.getGroupType()
					}
				)

				scope.evEventService.addEventListener(
					evEvents.DATA_LOAD_END,
					function () {
						scope.getGroupType()

						var groupHashId = scope.item.___id

						var requestParameters =
							scope.evDataService.getRequestParameters(groupHashId)

						scope.total_pages = Math.ceil(
							requestParameters.pagination.count /
								requestParameters.pagination.page_size
						)

						if (!requestParameters.body.page) {
							requestParameters.body.page = 1
							requestParameters.requestedPages = [1]
						}

						scope.currentPage = requestParameters.body.page




					}
				)
			}

			init()
		},
	}
}
