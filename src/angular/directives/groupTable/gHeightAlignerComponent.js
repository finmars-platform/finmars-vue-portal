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
			scope.isRootEntityViewer = scope.evDataService.isRootEntityViewer()

			var lastMouseMoveEvent = null

			var verticalSPElem = document.querySelector('.verticalSplitPanelWrapper')

			function activateHeightSlider() {


				var splitPanelResizer = $('.g-height-slider')

				$(splitPanelResizer).bind('mousedown', function (e) {
					e.stopPropagation()
					e.preventDefault()

					var interfaceLayout = scope.evDataService.getInterfaceLayout()

					var mouseMoveY
					var bodyHeight = document.body.clientHeight

					// var wrapperElem = $('.g-wrapper');
					// var sidebarElem = $('.g-filter-sidebar.main-sidebar').first();
					var splitPanelElem = scope.rootWrapElem.querySelector('.g-additions')
					var splitPanelWrapperElem =
						splitPanelElem.querySelector('.g-content-wrap')

					var headerHeight = interfaceLayout.headerToolbar.height

					var splitPanelHeight

					var handler = function (e) {
						mouseMoveY = e.clientY
						lastMouseMoveEvent = e

						splitPanelHeight = bodyHeight - mouseMoveY

						interfaceLayout.splitPanel.height = splitPanelHeight

						splitPanelElem.style.height = splitPanelHeight + 'px'
						if (splitPanelWrapperElem) {
							splitPanelWrapperElem.style.height = splitPanelHeight + 'px'
						}

						// scope.contentWrapElem.style.height = (bodyHeight - headerHeight - splitPanelHeight) + 'px';

						if (verticalSPElem) {
							var rootWrapHeight = scope.rootWrapElem.clientHeight
							verticalSPElem.style.height =
								rootWrapHeight - splitPanelHeight + 'px'
						}

						scope.evDataService.setInterfaceLayout(interfaceLayout)

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

			function setDefaultHeights() {
				var interfaceLayout = scope.evDataService.getInterfaceLayout()
				interfaceLayout.splitPanel.height = 0
				scope.evDataService.setInterfaceLayout(interfaceLayout)

				if (verticalSPElem) {
					verticalSPElem.style.height = ''
				}

				scope.evEventService.dispatchEvent(evEvents.UPDATE_TABLE_VIEWPORT)
				scope.evEventService.dispatchEvent(
					evEvents.UPDATE_SPLIT_PANEL_TABLE_VIEWPORT
				)
			}

			function setSplitHeights() {
				var interfaceLayout = scope.evDataService.getInterfaceLayout()

				// var headerToolbarHeight = interfaceLayout.headerToolbar.height;
				// var bodyHeight = document.body.clientHeight;
				var rootWrapHeight = scope.rootWrapElem.clientHeight
				var splitPanelHeight = interfaceLayout.splitPanel.height

				if (!splitPanelHeight || splitPanelHeight === 0) {
					splitPanelHeight = Math.floor(rootWrapHeight / 2)
				}

				var splitPanelElem = scope.rootWrapElem.querySelector('.g-additions')

				interfaceLayout.splitPanel.height = splitPanelHeight

				// scope.contentWrapElem.style.height = (bodyHeight - headerToolbarHeight - splitPanelHeight) + 'px';
				splitPanelElem.style.height = splitPanelHeight + 'px'

				if (verticalSPElem) {
					var rootWrapHeight = scope.rootWrapElem.clientHeight
					verticalSPElem.style.height = rootWrapHeight - splitPanelHeight + 'px'
				}

				scope.evDataService.setInterfaceLayout(interfaceLayout)
			}

			function onWindowResize() {
				var rootWrapElemHeight = scope.rootWrapElem.clientHeight
				var interfaceLayout = scope.evDataService.getInterfaceLayout()

				if (verticalSPElem) {
					verticalSPElem.style.height =
						rootWrapElemHeight - interfaceLayout.splitPanel.height + 'px'
				}
			}

			var additionsChangeCallbackIndex = scope.evEventService.addEventListener(
				evEvents.ADDITIONS_CHANGE,
				function () {
					scope.additions = scope.evDataService.getAdditions()
					/* if (verticalSPElem) {
                        scope.verticalAdditions = scope.evDataService.getVerticalAdditions();



                        if (!scope.additions.isOpen) {
                            verticalSPElem.style.height = '100%'
                        }

                    } else {
                        setSplitHeights()
                    } */
					setSplitHeights()
				}
			)

			var verticalAdditionsChangeCallbackIndex =
				scope.evEventService.addEventListener(
					evEvents.VERTICAL_ADDITIONS_CHANGE,
					function () {
						setTimeout(function () {
							// wait for angular to remove or add vertical split panel
							verticalSPElem = document.querySelector(
								'.verticalSplitPanelWrapper'
							)
						}, 100)
					}
				)

			scope.init = function () {
				window.addEventListener('resize', onWindowResize)

				setSplitHeights()

				scope.evEventService.dispatchEvent(evEvents.UPDATE_TABLE_VIEWPORT)
				scope.evEventService.dispatchEvent(
					evEvents.UPDATE_SPLIT_PANEL_TABLE_VIEWPORT
				)

				activateHeightSlider()
			}

			scope.init()

			scope.$on('$destroy', function () {
				// window.removeEventListener('resize', onWindowResize);
				scope.evEventService.removeEventListener(
					evEvents.ADDITIONS_CHANGE,
					additionsChangeCallbackIndex
				)
				scope.evEventService.removeEventListener(
					evEvents.VERTICAL_ADDITIONS_CHANGE,
					verticalAdditionsChangeCallbackIndex
				)

				setDefaultHeights()
			})
		},
	}
}
