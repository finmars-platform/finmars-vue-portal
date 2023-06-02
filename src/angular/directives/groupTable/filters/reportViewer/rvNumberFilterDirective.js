import popupEvents from '@/angular/services/events/popupEvents'
import metaHelper from '@/angular/helpers/meta.helper'
;('use strict')

export default function (gFiltersHelper) {
	return {
		require: '^^rvFilter',
		restrict: 'E',
		scope: {},
		templateUrl:
			'views/directives/groupTable/filters/ev-rv-number-filter-view.html',
		link: function (scope, elem, attrs, rvFilterVm) {
			scope.filter = rvFilterVm.filter
			scope.isReport = true
			scope.activeFilter = {
				type: null,
			}

			const openUseFromAboveSettings = async function () {
				;[scope.activeFilter.type, scope.filter.options] =
					await gFiltersHelper.openUseFromAboveSettings(
						rvFilterVm.openUseFromAboveSettings(),
						scope.filter.options
					)
				scope.$apply()
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

				{
					name: 'Linked',
					id: 'use_from_above',
					onClick: openUseFromAboveSettings,
				},
			]

			scope.readyStatus = true

			scope.changeFilterType = function (filterType) {
				/* scope.filter.options.filter_type = scope.activeFilter.type;

					if (scope.activeFilter.type === 'from_to' || scope.activeFilter.type === 'out_of_range') {

						scope.filter.options.filter_values = {}

					} else {

						if (scope.activeFilter.type === 'empty') {
							scope.filter.options.exclude_empty_cells = false;
						}

						scope.filter.options.filter_values = [];

					} */

				if (filterType !== 'use_from_above') {
					scope.filter.options.use_from_above = {}

					const resultList = gFiltersHelper.emptyNumberFilter(
						filterType,
						scope.filter.options
					)
					scope.activeFilter.type = resultList[0]
					scope.filter.options = resultList[1]
				}
			}

			const initEventListeners = function () {
				rvFilterVm.popupEventService.addEventListener(
					popupEvents.CLOSE_POPUP,
					function () {
						scope.$destroy()
					}
				)
			}

			const init = function () {
				scope.activeFilter.type = rvFilterVm.getActiveFilterType(
					scope.filterTypes
				)

				initEventListeners()
			}

			init()
		},
	}
}
