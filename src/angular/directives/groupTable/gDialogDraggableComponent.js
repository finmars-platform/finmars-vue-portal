/**
 * Created by sergey on 11.05.16.
 */

import logService from '@/angular/core/services/logService'

export default function () {
	return {
		restrict: 'A',
		link: function (scope, elem, attrs) {
			logService.component('gDialogDraggable', 'initialized')

			var dragger = $(elem).find('.md-toolbar-tools')
			var parent = $(elem).parent()

			//set md-dialog-contaner overflow to visible
			var dialogContainer = $(elem).parent('.md-dialog-container')
			dialogContainer.addClass('viewConstructorDialog')

			var posY = 0,
				posX = 0
			var elemLeft = 0,
				elemTop = 0
			var initMouseX = 0,
				initMouseY = 0

			$(parent).width(400)
			$(parent).height($(elem).height())
			$(parent).css({ left: '65%' })

			function mousemove(e) {
				posX = document.all ? window.event.clientX : e.pageX
				posY = document.all ? window.event.clientY : e.pageY
				//;
				//;
				//;
				//;
				//;

				// parent[0].style.left = (posX - elemLeft + 8) + 'px';
				// parent[0].style.top = (posY - elemTop - 8 - 150) + 'px';
				parent[0].style.left = posX + elemLeft - initMouseX + 'px'
				parent[0].style.top = posY + elemTop - initMouseY + 'px'
				// parent[0].style.left = ()
			}

			dragger.bind('mousedown', function (e) {
				e.preventDefault()
				e.stopPropagation()
				//;
				initMouseX = e.clientX
				initMouseY = e.clientY
				// if (elemLeft !== 0) {
				elemLeft = parent[0].offsetLeft
				elemTop = parent[0].offsetTop
				// elemLeft = posX - parent[0].offsetLeft;
				// elemTop = posY - parent[0].offsetTop;
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
