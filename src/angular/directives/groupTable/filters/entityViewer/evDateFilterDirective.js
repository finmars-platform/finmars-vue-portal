import specificDataService from '@/angular/services/specificDataService'
import userFilterService from '@/angular/services/rv-data-provider/user-filter.service'
import evEvents from '@/angular/services/entityViewerEvents'
import popupEvents from '@/angular/services/events/popupEvents'

export default function (gFiltersHelper) {
	return {
		require: '^^evFilter',
		restrict: 'E',
		scope: {},
		templateUrl:
			'views/directives/groupTable/filters/ev-rv-date-filter-view.html',
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
				{ name: 'Out of range (incl)', id: 'out_of_range' },
				{ name: 'Empty cells', id: 'empty' },
				{ name: 'Date tree', id: 'date_tree' },
			]

			scope.columnRowsContent = null

			scope.readyStatus = true

			const contentType = filterVm.evDataService.getContentType()

			const getDataForSelects = function () {
				scope.readyStatus = false

				specificDataService
					.getValuesForSelect(
						contentType,
						scope.filter.key,
						scope.filter.value_type
					)
					.then(function (data) {
						scope.columnRowsContent = data.results.map((cRowsContent) => {
							return { value: cRowsContent }
						})

						scope.readyStatus = true

						scope.$apply()
					})
			}

			scope.dateTreeChanged = function (dateTree) {
				scope.filter.options.filter_values =
					gFiltersHelper.convertDatesTreeToFlatList(dateTree)
			}

			scope.changeFilterType = function (filterType) {
				const resultList = gFiltersHelper.emptyDateFilter(
					filterType,
					scope.filter.options
				)
				scope.activeFilter.type = resultList[0]
				scope.filter.options = resultList[1]

				if (
					scope.filter.options.filter_type === 'date_tree' &&
					!scope.columnRowsContent
				) {
					getDataForSelects()
				}
			}

			const initEventListeners = function () {
				filterVm.popupEventService.addEventListener(
					popupEvents.CLOSE_POPUP,
					function () {
						// filterVm.evEventService.removeEventListener(evEvents.DATA_LOAD_END, dataLoadEndId);
						scope.$destroy()
					}
				)
			}

			const init = function () {
				scope.activeFilter.type = filterVm.getActiveFilterType(
					scope.filterTypes
				)

				initEventListeners()

				if (scope.filter.options.filter_type === 'date_tree') {
					getDataForSelects()
				}
			}

			init()
		},
	}
}
