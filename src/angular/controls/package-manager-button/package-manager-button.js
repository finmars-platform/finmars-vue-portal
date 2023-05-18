export default function ($mdDialog) {
	return {
		restriction: 'A',
		scope: {
			contentType: '=',
			targetContentType: '=',
			callbackFn: '&',
		},
		link: function (scope, elem, attr) {
			scope.openExpressionDialog = function ($event) {
				$mdDialog
					.show({
						controller: 'ConfigurationPackageDialogController as vm',
						templateUrl: 'views/dialogs/configuration-package-dialog-view.html',
						parent: angular.element(document.body),
						targetEvent: $event,
						preserveScope: true,
						multiple: true,
						autoWrap: true,
						skipHide: true,
						locals: {
							data: {
								contentType: scope.contentType,
								targetContentType: scope.targetContentType,
							},
						},
					})
					.then(function (res) {
						if (res.status === 'agree') {
							scope.callbackFn()
						}
					})
			}

			elem.on('click', function ($event) {
				scope.openExpressionDialog($event)
			})
		},
	}
}
