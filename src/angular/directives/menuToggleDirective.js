/**
 * Created by szhitenev on 05.05.2016.
 */

export default function () {
	return {
		scope: {
			section: '=',
		},
		templateUrl: 'views/directives/menu-toggle-view.html',
		link: function (scope, elem) {
			var controller = elem.parent().controller()
			scope.isOpen = function () {
				return controller.isOpen(scope.section)
			}

			scope.toggle = function ($event) {
				controller.toggleOpen($event, scope.section)
			}
		},
	}
}
