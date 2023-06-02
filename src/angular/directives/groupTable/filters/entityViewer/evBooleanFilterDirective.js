import specificDataService from '@/angular/services/specificDataService'
import evEvents from '@/angular/services/entityViewerEvents'
import popupEvents from '@/angular/services/events/popupEvents'

export default function (gFiltersHelper) {
	return {
		require: '^^evFilter',
		restrict: 'E',
		scope: {},
		templateUrl:
			'views/directives/groupTable/filters/ev-rv-boolean-filter-view.html',
		link: function (scope, elem, attrs, filterVm) {
			scope.filter = filterVm.filter
			scope.isReport = false
			scope.activeFilter = {
				type: null,
			}

			scope.filterTypes = [
				{ name: 'Select', value: 'selector' },
				{ name: 'Multiple Select', value: 'multiselector' },
			]

			scope.columnRowsContent = null

			scope.readyStatus = true

			const contentType = filterVm.evDataService.getContentType()

			const getDataForSelects = function () {
				scope.columnRowsContent = [
					{
						id: true, // for text multiselector
						name: 'True', // for text selector
						active: false, // for date multiselector
					},
					{
						id: false, // for text multiselector
						name: 'False', // for text selector
						active: false, // for date multiselector
					},
				]
			}

			scope.changeFilterType = function (filterType) {
				/* scope.activeFilter.type = filterType;
					scope.filter.options.filter_type = scope.activeFilter.type;

					if (scope.activeFilter.type === 'empty') {
						scope.filter.options.exclude_empty_cells = false;
					}

					scope.filter.options.filter_values = []; */
				const resultList = gFiltersHelper.emptyTextFilter(
					filterType,
					scope.filter.options
				)
				scope.activeFilter.type = resultList[0]
				scope.filter.options = resultList[1]

				if (
					['selector', 'multiselector'].includes(
						scope.filter.options.filter_type
					) &&
					!scope.columnRowsContent
				) {
					getDataForSelects()
				}
			}

			const initEventListeners = function () {
				/* if (!dataLoadEndId) {
						dataLoadEndId = filterVm.evEventService.addEventListener(evEvents.DATA_LOAD_END, getDataForSelects);
					} */

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

				/*if (!scope.columnRowsContent || scope.columnRowsContent.length === 0) {
						setTimeout(() => {
							getDataForSelects();
						}, 500);
					}*/

				if (
					['selector', 'multiselector'].includes(
						scope.filter.options.filter_type
					)
				) {
					getDataForSelects()
				}
			}

			init()
		},
	}
}
