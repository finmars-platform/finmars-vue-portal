export default function ($mdDialog) {
	return {
		restriction: 'AE',
		templateUrl:
			'controls/expression-editor-button/expression-editor-button.html',
		scope: {
			item: '=',
			data: '=',
			buttonText: '@',
		},
		link: function (scope, elem, attr) {
			if (scope.buttonText === undefined) {
				scope.buttonText = '...'
			}

			var openExpressionDialog = function () {
				$mdDialog
					.show({
						controller: 'ExpressionEditorDialogController as vm',
						templateUrl: 'views/dialogs/expression-editor-dialog-view.html',
						parent: document.querySelector('.dialog-containers-wrap'),
						multiple: true,
						locals: {
							item: { expression: scope.item },
							data: scope.data,
						},
					})
					.then(function (res) {
						if (res.status === 'agree') {
							scope.item = res.data.item.expression
						}
					})
			}

			var openCodeEditorDialog = function () {
				$mdDialog
					.show({
						controller: 'AceEditorDialogController as vm',
						templateUrl: 'views/dialogs/ace-editor-dialog-view.html',
						parent: document.querySelector('.dialog-containers-wrap'),
						multiple: true,
						locals: {
							item: { expression: scope.item },
							data: scope.data,
						},
					})
					.then(function (res) {
						if (res.status === 'agree') {
							scope.item = res.data.item.expression
						}
					})
			}

			scope.exprEditorSelData = {
				options: [
					{
						key: 'expression_builder',
						name: 'Expression Builder',
					},
					{
						key: 'code_editor',
						name: 'Code Editor',
					},
				],
				selectOption: function (option, _$popup, $event) {
					_$popup.cancel()

					if (option.key === 'expression_builder') {
						openExpressionDialog()
					} else {
						openCodeEditorDialog()
					}
				},
			}
		},
	}
}
