export default function () {
	return {
		restriction: 'E',
		templateUrl: 'views/directives/dashboard/dashboard-input-form-view.html',
		scope: {
			tabNumber: '=',
			rowNumber: '=',
			columnNumber: '=',
			item: '=',
			dashboardDataService: '=',
			dashboardEventService: '=',
		},
		link: function (scope, elem, attr) {},
	}
}
