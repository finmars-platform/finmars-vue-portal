import gtEvents from '@/angular/services/gridTableEvents'
;('use strict')

export default function () {
	return {
		restrict: 'E',
		scope: {
			column: '=',
			gtDataService: '=',
			gtEventService: '=',
			onLoadEnd: '&?',
		},
		template:
			'<div class="gt-cell-text-container" ng-class="{\'gt-header-sorting-cell\': column.sorting}">' +
			'<div class="gt-cell-text">' +
			'<span data-ng-bind="column.columnName"' +
			'class="sortingOnClick">' +
			'</span>' +
			'</div>' +
			'</div>',
		link: function (scope, elem, attrs) {
			scope.sortRowsReverse = false
			scope.sortingOn = false

			if (scope.column.sorting) {
				var sortOnClickElem = elem[0].querySelector('.sortingOnClick')

				sortOnClickElem.addEventListener('click', function () {
					var options

					if (typeof scope.column.sorting === 'object') {
						options = scope.column.sorting
					}

					scope.gtDataService.setSortingSettings(scope.column.order, options)
					scope.gtEventService.dispatchEvent(gtEvents.SORTING_SETTINGS_CHANGED)
				})
			}

			var sortSettingsChangeIndex = scope.gtEventService.addEventListener(
				gtEvents.SORTING_SETTINGS_CHANGED,
				function () {
					scope.sortingOn = false
					scope.sortRowsReverse = false

					var sortSettings = scope.gtDataService.getSortingSettings()

					if (sortSettings.column === scope.column.order) {
						scope.sortingOn = true
						scope.sortRowsReverse = sortSettings.reverse
					}

					scope.$apply()
				}
			)

			if (scope.onLoadEnd) {
				scope.onLoadEnd()
			}

			scope.$on('$destroy', function () {
				scope.gtEventService.removeEventListener(
					gtEvents.SORTING_SETTINGS_CHANGED,
					sortSettingsChangeIndex
				)
			})
		},
	}
}
