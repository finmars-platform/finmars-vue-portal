/**
 * Created by mevstratov on 23.10.2019.
 */

import evEvents from '@/angular/services/entityViewerEvents'

import EventService from '@/angular/services/eventService'

export default function () {
	return {
		restrict: 'E',
		scope: {
			filterKey: '=',
			evDataService: '=',
			evEventService: '=',
			attributeDataService: '=',

			shownFiltersType: '=', // for entity viewer
		},
		templateUrl:
			'views/directives/groupTable/attributeSettingsMenus/g-filter-settings-btn-view.html',
		link: function (scope, elem, attrs) {
			const isReport = scope.evDataService.isEntityReport()
			scope.filterPopupTemplate = isReport
				? 'views/popups/groupTable/filters/rv-filter-popup-view.html'
				: 'views/popups/groupTable/filters/ev-filter-popup-view.html'

			// Victor 2021.01.12 filter setting popup
			scope.popupEventService = new EventService()
			scope.popupData = {
				evDataService: scope.evDataService,
				evEventService: scope.evEventService,
				attributeDataService: scope.attributeDataService,

				filterKey: scope.filterKey,
			}

			if (isReport) {
				scope.filterSettingsChange = function () {
					scope.evEventService.dispatchEvent(evEvents.FILTERS_CHANGE)

					scope.evDataService.resetTableContent(true)

					scope.evEventService.dispatchEvent(evEvents.UPDATE_TABLE)
				}
			} else {
				scope.filterSettingsChange = function () {
					scope.evEventService.dispatchEvent(evEvents.FILTERS_CHANGE)

					if (scope.shownFiltersType === 'frontend')
						scope.evEventService.dispatchEvent(evEvents.REDRAW_TABLE)
				}

				scope.popupData.shownFiltersType = scope.shownFiltersType
			}

			// <Victor 2021.01.12 filter setting popup>
		},
	}
}
