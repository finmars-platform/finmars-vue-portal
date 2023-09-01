/**
 * Created by szhitenev on 28.06.2016.
 */

export default function ($mdDialog) {
	return {
		restrict: 'E',
		templateUrl: 'views/directives/context-menu-constructor-option-view.html',
		replace: true,
		transclude: true,
		scope: {
			item: '=',
			parent: '=',
			index: '=',
			addCallback: '&',
			editCallback: '&',
			deleteCallback: '&',
			moveUpCallback: '&',
			moveDownCallback: '&',
		},
		link: function (scope, elem, attrs, ngModelCtrl) {
			scope.editOption = function ($event, item) {


				scope.editCallback({ event: $event, item: item })
			}

			scope.moveUp = function (itemIndex) {
				scope.moveUpCallback({ itemIndex: itemIndex })
			}

			scope.moveDown = function (itemIndex) {
				scope.moveDownCallback({ itemIndex: itemIndex })
			}

			scope.addOption = function ($event, item) {


				scope.addCallback({ event: $event, item: item })
			}

			scope.moveChildUp = function (itemIndex) {
				var prevItemIndex = itemIndex - 1

				if (prevItemIndex >= 0) {
					var itemToMove = JSON.parse(
						JSON.stringify(scope.item.items[itemIndex])
					)
					itemToMove.order = itemToMove.order - 1

					scope.item.items[itemIndex] = scope.item.items[prevItemIndex]
					scope.item.items[itemIndex].order += 1
					scope.item.items[prevItemIndex] = itemToMove
				}
			}

			scope.moveChildDown = function (itemIndex) {
				var nextItemIndex = itemIndex + 1

				if (scope.item.items[nextItemIndex]) {
					var itemToMove = JSON.parse(
						JSON.stringify(scope.item.items[itemIndex])
					)
					itemToMove.order = itemToMove.order + 1

					scope.item.items[itemIndex] = scope.item.items[nextItemIndex]
					scope.item.items[itemIndex].order -= 1
					scope.item.items[nextItemIndex] = itemToMove
				}
			}

			scope.deleteOption = function ($event, item, $index) {
				scope.deleteCallback({ event: $event, item: item, index: $index })
			}
		},
	}
}
