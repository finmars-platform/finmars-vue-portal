/**
 * Created by mevstratov on 31.03.2019.
 */

export default function () {
	return {
		restrict: 'E',
		scope: {
			labelTitle: '@',
			model: '=',
			options: '<',
			optionsValue: '@',
			optionsName: '@',
			optionsFilterBy: '<',
		},
		templateUrl: 'views/directives/common-select-view.html',
		link: function (scope, elem, attrs) {

			if (!scope.labelTitle) {
				scope.labelTitle = ''
			}

			scope.optionsFilterByProperty = 'name'
			if (!scope.optionsFilterBy) {
				scope.optionsFilterBy = scope.optionsName
			}

			scope.filterPredicateFunction = function (propertyName, searchTerm) {
				if (searchTerm) {
					return function (item) {
						return item[propertyName].indexOf(searchTerm) !== -1
					}
				}
			}
		},
	}
}
