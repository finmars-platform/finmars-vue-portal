// TO DELETE: probably deprecated

import logService from '@/angular/core/services/logService'

return {
	restrict: 'A',
	scope: {},
	link: function (scope, elem, attr) {
		logService.component('viewSectionResizer', 'initialized')

		var workAreaElem = elem.parents('.g-workarea')
		var filterSidebarWidth = 246

		workAreaElem.width(
			$(window).width() - filterSidebarWidth - $('md-sidenav').width()
		)

		var wrapperWidth =
			$('.g-columns-component.g-thead').width() -
			$('.g-cell-select.all').width()
		$('.g-scroll-wrapper').width(wrapperWidth)
		$('.g-scrollable-area').width(wrapperWidth)

		window.addEventListener('resize', function () {
			workAreaElem.width(
				$(window).width() - filterSidebarWidth - $('md-sidenav').width()
			)
			var wrapperWidth =
				$('.g-columns-component.g-thead').width() -
				$('.g-cell-select.all').width()
			$('.g-scroll-wrapper').width(wrapperWidth)
			$('.g-scrollable-area').width(wrapperWidth)

			resizeScrollableArea()
			resize()
		})
	},
}
