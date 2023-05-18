/**
 * Created by mevstratov on 5.04.2019.
 */

export default function () {
	return {
		restrict: 'E',
		scope: {
			labelTitle: '@',
			model: '=',
			loadRelation: '&',
			relationItems: '=',
			propertyName: '@',
			// propertyValue: '@',
			// selectedValue: '<',
			selectedName: '<',
			isDisabled: '<',
		},
		templateUrl: 'views/directives/ttype-actions-relations-select-view.html',
		link: function (scope, elem, attrs) {
			/* if (!scope.propertyValue) {
                    scope.propertyValue = "id";
                }

                if (!scope.propertyName) {
                    scope.propertyName = "name";
                } */

			elem[0].title = scope.labelTitle

			scope.loadRelationsOnOpen = function () {
				return new Promise(function (resolve) {
					if (!scope.relationItems) {
						/* scope.loadRelation().then(function () {
								scope.$apply();
							}); */
						scope.loadRelation().then(function (data) {
							scope.relationItems = data
							resolve(scope.relationItems)
						})
					} else {
						resolve(scope.relationItems)
					}
				})
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
