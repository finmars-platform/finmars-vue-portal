import logService from '@/angular/core/services/logService'

export default function () {
	return {
		restrict: 'A',
		scope: {
			rows: '=',
			columnsNames: '=',
			columns: '=',
		},
		templateUrl: 'views/directives/members-groups-table-view.html',
	}
}
