export default function () {
	return {
		restrict: 'A',
		scope: {
			rowIsLast: '=', // for parent ng-repeat $last
			callback: '&',
		},
		link: function (scope, element, attr) {
			if (scope.rowIsLast === undefined) {
				if (scope.$parent.$last === true) {
					scope.callback()
				}
			} else {
				if (scope.$parent.$last === true && scope.rowIsLast === true) {
					scope.callback()
				}
			}
		},
	}
}
