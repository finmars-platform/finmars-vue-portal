import popupEvents from '@/angular/services/events/popupEvents'
import evEvents from '@/angular/services/entityViewerEvents'
;('use strict')

export default function (gFiltersHelper) {
	return {
		restrict: 'E',
		scope: {
			filterKey: '<',
			filterType: '@', // ('frontend', 'backend')
			evDataService: '=',
			evEventService: '=',
			attributeDataService: '=',
			popupEventService: '=',

			onCancel: '&',
			onSave: '&',
		},
		templateUrl:
			'views/directives/groupTable/filters/entityViewer/ev-filter-view.html',
		controllerAs: 'vm',
		controller: [
			'$scope',
			function EvFilterController($scope) {
				let vm = this

				vm.filterType = $scope.filterType
				vm.evDataService = $scope.evDataService
				vm.evEventService = $scope.evEventService
				vm.attributeDataService = $scope.attributeDataService
				vm.popupEventService = $scope.popupEventService
				vm.filterNotFound = false

				/**
				 * Frontend or backend filters
				 * @type {Array}
				 */
				let filtersList
				let filterIndex

				const findFilter = function () {
					let filtersData = vm.evDataService.getFilters()

					filtersList = JSON.parse(JSON.stringify(filtersData[vm.filterType]))

					filterIndex = filtersList.findIndex(
						(filter) => filter.key === $scope.filterKey
					)

					if (filterIndex > -1) {
						vm.filter = filtersList[filterIndex]

						vm.filter = gFiltersHelper.setFilterDefaultOptions(vm.filter)
					} else {
						vm.filterNotFound = true
					}
				}

				vm.getActiveFilterType = (filterTypesList) => {
					const activeType = filterTypesList.find((type) => {
						// return type.value === vm.filter.options.filter_type;
						return type.id === vm.filter.options.filter_type
					})

					// return activeType ? activeType.value : null;
					return activeType ? activeType.id : null
				}

				vm.save = function () {
					let filters = vm.evDataService.getFilters()
					filters[vm.filterType] = filtersList

					vm.evDataService.setFilters(filters)

					vm.evDataService.resetTableContent(false)
					vm.evEventService.dispatchEvent(evEvents.UPDATE_TABLE)

					$scope.onSave()
					$scope.$destroy()
				}

				vm.cancel = function () {
					$scope.onCancel()
					$scope.$destroy()
				}

				const init = function () {
					findFilter()

					vm.evEventService.addEventListener(
						evEvents.FILTERS_CHANGE,
						function () {
							findFilter()
						}
					)

					vm.popupEventService.addEventListener(
						popupEvents.CLOSE_POPUP,
						function () {
							$scope.$destroy()
						}
					)
				}

				init()
			},
		],
	}
}
