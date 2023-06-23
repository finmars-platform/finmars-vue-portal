/**
 * Created by mevstratov on 5.04.2019.
 */

export default function () {
	return {
		restrict: 'E',
		scope: {
			labelTitle: '@',
			model: '=',
			findInputs: '&',
			isDisabled: '<',
		},
		templateUrl: 'views/directives/ttype-actions-inputs-select-view.html',
		link: function (scope, elem, attrs) {
			if (!scope.labelTitle) {
				scope.labelTitle = ''
			}

			elem[0].title = scope.labelTitle

			scope.inputs = scope.findInputs()
		},
	}
}
