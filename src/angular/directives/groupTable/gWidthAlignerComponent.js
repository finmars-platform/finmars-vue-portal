/**
 * Created by szhitenev on 20.05.2016.
 */

import evEvents from '../../services/entityViewerEvents'

export default function () {
	return {
		restrict: 'A',
		scope: {
			evDataService: '=',
			evEventService: '=',
			rootWrapElem: '=',
			contentWrapElem: '=',
		},
		link: function (scope, elem, attrs) {
			scope.additions = scope.evDataService.getAdditions()
			scope.verticalAdditions = scope.evDataService.getVerticalAdditions()
			scope.isRootEntityViewer = scope.evDataService.isRootEntityViewer()

			var vAdditionsChangeIndex

			scope.activateWidthSlider = function () {
				console.log('activateWidthSlider')

				var splitPanelResizer = $('.g-width-slider')

				$(splitPanelResizer).bind('mousedown', function (e) {
					e.stopPropagation()
					e.preventDefault()

					var interfaceLayout = scope.evDataService.getInterfaceLayout()

					var mouseMoveX

					//var verticalSplitPanelElem = $('.g-recon');
					var vSplitPanelElem = scope.rootWrapElem.querySelector('.g-recon')
					var vSplitPanelWrapperElem =
						vSplitPanelElem.querySelector('.g-content-wrap')

					var contentWrapWidth
					var verticalSplitPanelWidth

					var rootWidth = scope.rootWrapElem.clientWidth

					var windowXcorrection = document.body.clientWidth - rootWidth

					var handler = function (e) {
						mouseMoveX = e.clientX - windowXcorrection

						contentWrapWidth = rootWidth - mouseMoveX
						verticalSplitPanelWidth = rootWidth - contentWrapWidth

						interfaceLayout.verticalSplitPanel.width = verticalSplitPanelWidth

						scope.contentWrapElem.style.width = contentWrapWidth + 'px' // makes resize animation smoother
						vSplitPanelElem.style.width = verticalSplitPanelWidth + 'px'

						//contentWrapElem.style.left = (rootWidth - contentWrapWidth) + 'px';
						//$(verticalSplitPanelElem).width(rootWidth - contentWrapWidth);

						scope.evDataService.setInterfaceLayout(interfaceLayout)
						//window.dispatchEvent(new Event('resize'))
						scope.evEventService.dispatchEvent(evEvents.UPDATE_TABLE_VIEWPORT)
						scope.evEventService.dispatchEvent(
							evEvents.UPDATE_SPLIT_PANEL_TABLE_VIEWPORT
						)
					}

					$(window).bind('mousemove', function (e) {
						handler(e)
						$(window).bind('mouseup', function () {
							$(window).unbind('mousemove')
						})
					})
				})
			}

			scope.setDefaultWidths = function () {
				/*console.log('Width Aligner - Set Default Width');

                    contentWrapElem.style.width = 'initial';
                    contentWrapElem.style.left = '0px';*/

				var interfaceLayout = scope.evDataService.getInterfaceLayout()
				interfaceLayout.verticalSplitPanel.width = 0
				scope.evDataService.setInterfaceLayout(interfaceLayout)

				scope.evEventService.dispatchEvent(evEvents.UPDATE_TABLE_VIEWPORT)
			}

			scope.setSplitWidths = function () {
				/*var rootWidth = $(scope.rootWrapElem).width();

                    contentWrapElem.style.width = Math.floor(rootWidth / 2) + 'px';
                    contentWrapElem.style.left = '50%';*/

				var interfaceLayout = scope.evDataService.getInterfaceLayout()

				var vSplitPanelElem = scope.rootWrapElem.querySelector('.g-recon')

				var contentWrapWidth = scope.contentWrapElem.clientWidth
				var vSplitPanelWidth = interfaceLayout.verticalSplitPanel.width

				if (!vSplitPanelWidth) {
					vSplitPanelWidth = Math.ceil(contentWrapWidth / 2)
				}

				interfaceLayout.verticalSplitPanel.width = vSplitPanelWidth
				vSplitPanelElem.style.width = vSplitPanelWidth + 'px'
				// '-1' needed to compensate for width calculation error when zooming inside browser
				scope.contentWrapElem.style.width = vSplitPanelWidth - 1 + 'px'

				scope.evDataService.setInterfaceLayout(interfaceLayout)
			}

			/*function onWindowResize() {
                    scope.evEventService.dispatchEvent(evEvents.UPDATE_ENTITY_VIEWER_CONTENT_WRAP_SIZE);
                }*/

			scope.init = function () {
				//scope.setDefaultWidths();
				scope.setSplitWidths()
				scope.activateWidthSlider()

				vAdditionsChangeIndex = scope.evEventService.addEventListener(
					evEvents.VERTICAL_ADDITIONS_CHANGE,
					function () {
						scope.verticalAdditions = scope.evDataService.getVerticalAdditions()

						if (!scope.verticalAdditions.isOpen) {
							scope.setDefaultWidths()
						} else {
							scope.setSplitWidths()
						}
					}
				)

				// delete scope.evEventService.dispatchEvent(evEvents.UPDATE_ENTITY_VIEWER_CONTENT_WRAP_SIZE);
				scope.evEventService.dispatchEvent(evEvents.UPDATE_TABLE_VIEWPORT)
			}

			scope.init()

			scope.$on('$destroy', function () {
				//window.removeEventListener('resize', onWindowResize);
				//scope.evEventService.removeEventListener(evEvents.ADDITIONS_CHANGE, additionsChangeCallbackIndex);
				scope.evEventService.removeEventListener(
					evEvents.VERTICAL_ADDITIONS_CHANGE,
					vAdditionsChangeIndex
				)

				scope.setDefaultWidths()
			})
		},
	}
}
