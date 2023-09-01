/**
 * Created by mevstratov on 31.03.2019.
 */

export default function () {
	return {
		restrict: 'E',
		scope: {
			elemToResize: '=',
			onResizeCallback: '&?',
			onResizeEndCallback: '&?',
		},
		templateUrl: 'views/directives/dialog-window-resizer-view.html',
		link: function (scope, elem, attrs) {
			var dialogElemWidth = 0
			var dialogElemHeight = 0
			var initXPos = 0
			var initYPos = 0
			var xPos = 0
			var yPos = 0

			var resizeDialogWindow = function (event) {
				xPos = event.pageX
				yPos = event.pageY

				scope.elemToResize.style.width =
					dialogElemWidth + xPos - initXPos + 'px'
				scope.elemToResize.style.height =
					dialogElemHeight + yPos - initYPos + 'px'

				if (scope.onResizeCallback) {
					scope.onResizeCallback()
				}
			}

			var endDialogWindowResize = function () {
				if (scope.onResizeEndCallback) {
					scope.onResizeEndCallback()
				}

				window.removeEventListener('mousemove', resizeDialogWindow)
			}

			scope.startDialogWindowResize = function ($event) {
				dialogElemWidth = JSON.parse(
					JSON.stringify(scope.elemToResize.clientWidth)
				)
				dialogElemHeight = JSON.parse(
					JSON.stringify(scope.elemToResize.clientHeight)
				)

				initXPos = $event.clientX
				initYPos = $event.clientY

				window.addEventListener('mousemove', resizeDialogWindow)
				window.addEventListener('mouseup', endDialogWindowResize, {
					once: true,
				})
			}

			// Prevents element from moving while resizing modal window
			scope.elemToResize.style.left = scope.elemToResize.offsetLeft + 'px'
			scope.elemToResize.style.top = scope.elemToResize.offsetTop + 'px'
		},
	}
}
