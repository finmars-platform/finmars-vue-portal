/**
 * Created by mevstratov on 08.10.2019.
 */

export default function ($mdDialog) {
	return {
		restrict: 'E',
		scope: {
			title: '@',
			dialogTitle: '@',
			availableAttrs: '<',
			item: '=',
			isReport: '@', // whether available attributes are from report ['true', 'false']
			isDisabled: '=',
			onChangeCallback: '&?',
		},
		templateUrl: 'views/directives/table-attribute-selector-view.html',
		link: function (scope, elem, attr) {
			scope.isReport = !!scope.isReport

			var getInputText = function () {
				if (scope.item) {
					for (var i = 0; i < scope.availableAttrs.length; i++) {
						if (scope.availableAttrs[i].key === scope.item) {
							scope.inputText = scope.availableAttrs[i].name
							break
						}
					}
				} else {
					scope.inputText = ''
				}
			}

			scope.$watch('item', function () {
				getInputText()
			})

			var dialogParent = document.querySelector('.dialog-containers-wrap')

			$(elem).click(function (event) {
				event.preventDefault()
				event.stopPropagation()

				if (scope.isDisabled) {
					return
				}

				var availableAttrs = null
				if (scope.availableAttrs) {
					availableAttrs = JSON.parse(JSON.stringify(scope.availableAttrs))
				}

				$mdDialog
					.show({
						controller: 'TableAttributeSelectorDialogController as vm',
						templateUrl:
							'views/dialogs/table-attribute-selector-dialog-view.html',
						parent: dialogParent,
						targetEvent: event,
						multiple: true,
						locals: {
							data: {
								availableAttrs: availableAttrs,
								title: scope.dialogTitle,
								isReport: scope.isReport,
							},
						},
					})
					.then(function (res) {
						if (res && res.status === 'agree') {
							if (res.data.items.length) {
								scope.inputText = res.data.items[0].name
								scope.item = res.data.items[0].key
							}

							if (scope.onChangeCallback) {
								setTimeout(function () {
									scope.onChangeCallback()
								})
							}
						}
					})
			})
		},
	}
}
