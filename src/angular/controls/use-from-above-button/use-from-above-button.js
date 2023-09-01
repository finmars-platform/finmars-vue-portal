export default function ($mdDialog) {
	return {
		restriction: 'AE',
		templateUrl: 'controls/use-from-above-button/use-from-above-button.html',
		scope: {
			item: '=',
			data: '<',
			attributesEntityType: '=',
			filterType: '=',
			attributeDataService: '=',
			updateFilterFn: '&',
		},
		link: function (scope, elem, attr) {
			scope.openUseFromAboveDialog = function ($event) {
				//;

				$mdDialog
					.show({
						controller: 'UseFromAboveDialogController as vm',
						templateUrl: 'views/dialogs/use-from-above-dialog-view.html',
						parent: angular.element(document.body),
						targetEvent: $event,
						preserveScope: true,
						multiple: true,
						autoWrap: true,
						skipHide: true,
						locals: {
							data: {
								item: scope.item,
								data: scope.data,
								entityType: scope.attributesEntityType,
								filterType: scope.filterType,
							},
							attributeDataService: scope.attributeDataService,
						},
					})
					.then(function (res) {



						if (res.status === 'agree') {
							if (
								scope.item !== res.data.item ||
								scope.filterType !== res.data.filterType
							) {
								scope.item = res.data.item
								scope.filterType = res.data.filterType
								scope.attributesEntityType = res.data.attrsEntityType
								scope.updateFilterFn()
							}
						}
					})
			}
		},
	}
}
