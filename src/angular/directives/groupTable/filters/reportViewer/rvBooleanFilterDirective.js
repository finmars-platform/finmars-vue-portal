import popupEvents from '@/angular/services/events/popupEvents'

export default function (gFiltersHelper) {
	return {
		require: '^^rvFilter',
		restrict: 'E',
		scope: {},
		templateUrl:
			'views/directives/groupTable/filters/ev-rv-boolean-filter-view.html',
		link: function (scope, elem, attrs, rvFilterVm) {
			scope.filter = rvFilterVm.filter
			scope.isReport = true
			scope.activeFilter = {
				type: null,
			}

			scope.filterTypes = [
				{ name: 'Select', value: 'selector' },
				{ name: 'Multiple Select', value: 'multiselector' },
			]

			scope.readyStatus = true

			scope.changeFilterType = function (filterType) {
				if (filterType !== 'use_from_above') {
					scope.filter.options.use_from_above = {}
					// openUseFromAboveSettings() responsible for setting 'use_from_above' into scope.activeFilterType

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
				}
			}

			scope.openUseFromAboveSettings = async function () {
				/*scope.activeFilter.type = await rvFilterVm.openUseFromAboveSettings();

					if (scope.activeFilter.type === 'use_from_above') {

						scope.filter.options.use_from_above = {};
						scope.filter.options.filter_type = scope.activeFilter.type;
						scope.filter.options.filter_values = [];

					}*/
				;[scope.activeFilter.type, scope.filter.options] =
					await gFiltersHelper.openUseFromAboveSettings(
						rvFilterVm.openUseFromAboveSettings(),
						scope.filter.options
					)
				scope.$apply()
			}

			scope.getMultiselectorName = function () {
				return (
					scope.filter.name +
					'. ' +
					'Regime = ' +
					scope.filter.options.filter_type
				)
			}

			const getDataForSelects = function () {
				scope.columnRowsContent = [
					{
						id: true, // for text multiselector
						value: 'True', // for text selector
						active: false, // for date multiselector
					},
					{
						id: false, // for text multiselector
						value: 'False', // for text selector
						active: false, // for date multiselector
					},
				]
			}

			const init = function () {
				scope.activeFilter.type = rvFilterVm.getActiveFilterType(
					scope.filterTypes
				)

				getDataForSelects()
			}

			init()

			rvFilterVm.popupEventService.addEventListener(
				popupEvents.CLOSE_POPUP,
				function () {
					scope.$destroy()
				}
			)
		},
	}
}
