export default function ($mdDialog) {
	return {
		restriction: 'AE',
		templateUrl: 'controls/json-editor-button/json-editor-button.html',
		scope: {
			item: '=',
			data: '=',
			buttonText: '@',
			onChangeCallback: '&?',
		},
		link: function (scope, elem, attr) {
			if (!scope.buttonText) {
				scope.buttonText = 'JSON'
			}

			scope.openExpressionDialog = function ($event) {
				$mdDialog
					.show({
						controller: 'JsonEditorDialogController as vm',
						templateUrl: 'views/dialogs/json-editor-dialog-view.html',
						parent: angular.element(document.body),
						targetEvent: $event,
						preserveScope: true,
						multiple: true,
						autoWrap: true,
						skipHide: true,
						locals: {
							item: { expression: scope.item },
							data: scope.data,
						},
					})
					.then(function (res) {
						if (res.status === 'agree') {
							scope.item = res.data.item.expression

							if (scope.onChangeCallback) {
								scope.onChangeCallback()
							}
						}
					})
			}
		},
	}
}
