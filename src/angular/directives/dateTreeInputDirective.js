/**
 * Created by mevstratov on 31.05.2019.
 */

export default function ($mdDialog) {
	return {
		restrict: 'E',
		scope: {
			title: '@',
			datesList: '=',
			datesTree: '=',
			nothingSelectedText: '@',
			callbackMethod: '&',
		},
		templateUrl: 'views/directives/date-tree-input-view.html',
		link: function (scope, elem, attrs) {
			if (!scope.title) {
				scope.title = 'Date tree'
			}

			var dialogParent = document.querySelector('.dialog-containers-wrap')

			var setInputText = function () {
				var datesSelected = 0

				scope.datesTree.map(function (yearGroup) {
					yearGroup.items.map(function (monthGroup) {
						monthGroup.items.map(function (day) {
							if (day.active) {
								datesSelected = datesSelected + 1
							}
						})
					})
				})

				if (datesSelected === 0 && scope.nothingSelectedText) {
					scope.inputText = scope.nothingSelectedText
				} else {
					scope.inputText = datesSelected + ' ' + 'dates selected'
				}
			}

			setInputText()

			var dialogParent = document.querySelector('.dialog-containers-wrap')

			$(elem).click(function (event) {
				event.preventDefault()
				event.stopPropagation()

				$mdDialog
					.show({
						controller: 'DateTreeDialogController as vm',
						templateUrl: 'views/dialogs/date-tree-dialog-view.html',
						parent: dialogParent,
						targetEvent: event,
						bindToController: false,
						preserveScope: false,
						locals: {
							data: {
								title: scope.title,
								datesList: scope.datesList,
								datesTree: scope.datesTree,
							},
						},
					})
					.then(function (res) {
						if (res.status === 'agree') {
							scope.datesTree = res.data.datesTree
							setInputText()

							setTimeout(function () {
								scope.callbackMethod()
							}, 500)
						}
					})
			})
		},
	}
}
