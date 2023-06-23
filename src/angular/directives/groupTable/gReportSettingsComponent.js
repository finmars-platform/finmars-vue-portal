/**
 * Created by szhitenev on 05.05.2016.
 */

export default function () {
	return {
		restrict: 'AE',
		templateUrl: 'views/directives/groupTable/report-settings-view.html',
		link: function (scope, elem, attrs) {
			console.log('Report settings component')
		},
	}
}
