export default function () {
	return {
		restrict: 'E',
		scope: {
			options: '<',
			data: '=',
		},
		templateUrl: 'views/directive/pop-up-view.html',
		link: function (scope, elem, attrs) {
			scope.cellValue = ''
		},
	}
}
