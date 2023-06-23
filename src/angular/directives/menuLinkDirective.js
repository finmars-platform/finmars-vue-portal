/**
 * Created by szhitenev on 05.05.2016.
 */

export default function () {
	return {
		scope: {
			section: '=',
		},
		templateUrl: 'views/directives/menu-link-view.html',
		link: function (scope, elem) {
			var controller = elem.parent().controller()

			scope.focusSection = function () {
				$('.side-nav-dropdown').remove()
				controller.autoFocusContent = true
			}
		},
	}
}
