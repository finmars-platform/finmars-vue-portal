import logService from '@/angular/core/services/logService'

export default function () {
	return {
		restrict: 'A',
		scope: {
			elementDragger: '=',
		},
		link: function (scope, elem, attrs) {
			var dragger

			if (scope.elementDragger) {
				dragger = scope.elementDragger
			} else {
				dragger = $(elem).find('md-toolbar')
			}

			var elemToMove = $(elem)

			var posY = 0,
				posX = 0
			var elemLeft = 0,
				elemTop = 0
			var initMouseX = 0,
				initMouseY = 0

			function mousemove(e) {
				// posX = document.all ? window.event.clientX : e.pageX;
				// posY = document.all ? window.event.clientY : e.pageY;
				posX = e.pageX
				posY = e.pageY
				//;
				//;
				//;
				//;
				//;

				// elemToMove[0].style.left = (posX - elemLeft + 8) + 'px';
				// elemToMove[0].style.top = (posY - elemTop - 8 - 150) + 'px';
				elemToMove[0].style.left = posX + elemLeft - initMouseX + 'px'
				elemToMove[0].style.top = posY + elemTop - initMouseY + 'px'
				// elemToMove[0].style.left = ()
			}

			dragger.bind('mousedown', function (e) {
				e.preventDefault()
				e.stopPropagation()

				initMouseX = e.clientX
				initMouseY = e.clientY
				// if (elemLeft !== 0) {
				elemLeft = elemToMove[0].offsetLeft
				elemTop = elemToMove[0].offsetTop
				// elemLeft = posX - elemToMove[0].offsetLeft;
				// elemTop = posY - elemToMove[0].offsetTop;
				// }
				//;
				$(window).bind('mousemove', mousemove)

				$(window).bind('mouseup', function (e) {
					//;
					$(window).unbind('mousemove')
				})
				return false
			})
		},
	}
}
