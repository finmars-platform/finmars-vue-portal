import specificDataService from '@/angular/services/specificDataService'
import evEvents from '@/angular/services/entityViewerEvents'
import popupEvents from '@/angular/services/events/popupEvents'

export default function (gFiltersHelper) {
	return {
		require: '^^evFilter',
		restrict: 'E',
		scope: {},
		templateUrl:
			'views/directives/groupTable/filters/ev-rv-number-filter-view.html',
		link: function (scope, elem, attrs, filterVm) {
			scope.filter = filterVm.filter
			scope.isReport = false
			scope.activeFilter = {
				type: null,
			}

			scope.filterTypes = [
				{ name: 'Equal', id: 'equal' },
				{ name: 'Not equal', id: 'not_equal' },
				{ name: 'Greater than', id: 'greater' },
				{ name: 'Greater or equal to', id: 'greater_equal' },
				{ name: 'Less than', id: 'less' },
				{ name: 'Less or equal to', id: 'less_equal' },
				{ name: 'From ... to ... (incl)', id: 'from_to' },
				{ name: 'Empty cells', id: 'empty' },
			]

			scope.changeFilterType = function (filterType) {
				scope.filter.options.use_from_above = {}

				const resultList = gFiltersHelper.emptyNumberFilter(
					filterType,
					scope.filter.options
				)
				scope.activeFilter.type = resultList[0]
				scope.filter.options = resultList[1]
			}

			const initEventListeners = function () {
				filterVm.popupEventService.addEventListener(
					popupEvents.CLOSE_POPUP,
					function () {
						scope.$destroy()
					}
				)
			}

			const init = function () {
				scope.activeFilter.type = filterVm.getActiveFilterType(
					scope.filterTypes
				)

				initEventListeners()
				scope.readyStatus = true
			}

			init()
		},
	}
}
