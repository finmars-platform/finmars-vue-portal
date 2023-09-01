export default function () {
	return {
		restriction: 'E',
		templateUrl:
			'views/directives/dashboard/dashboard-entity-viewer-split-panel-view.html',
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
