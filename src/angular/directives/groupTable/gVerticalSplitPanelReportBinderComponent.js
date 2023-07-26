/**
 * Created by szhitenev on 30.06.2016.
 */

import evEvents from '../../services/entityViewerEvents'

export default function (
	$templateCache,
	$compile,
	$controller,
	$mdDialog,
	$state,
	$transitions
) {
	return {
		scope: {
			evDataService: '=',
			evEventService: '=',
			spExchangeService: '=',
			rootWrapElem: '=',
		},
		restrict: 'AE',
		template: '<div class="vertical-split-panel-controller-container"></div>',
		link: function (scope, elem, attrs) {
			var container = $(elem).find('.vertical-split-panel-controller-container')

			function createController() {
				var additions = scope.evDataService.getAdditions()



				var editorTemplateUrl
				var tpl
				var templateScope
				var ctrl

				$(container).html('')

				editorTemplateUrl =
					'views/entity-viewer/reconciliation-viewer-view.html'
				tpl = $templateCache.get(editorTemplateUrl)

				templateScope = scope.$new()

				templateScope.$parent.vm = {}
				templateScope.$parent.vm.entityType = additions.type

				ctrl = $controller('ReconciliationViewerController as vm', {
					$scope: templateScope,
					$mdDialog: $mdDialog,
					$transitions: $transitions,
					parentEntityViewerDataService: scope.evDataService,
					parentEntityViewerEventService: scope.evEventService,
					splitPanelExchangeService: scope.spExchangeService,
				})

				container.html(tpl)
				container.children().data('$ngControllerController', ctrl)



				$compile(elem.contents())(templateScope)
			}

			var init = function () {
				var splitPanelIsActive = scope.evDataService.isSplitPanelActive()

				if (splitPanelIsActive) {
					var verticalSPWrapper = document.querySelector(
						'.verticalSplitPanelWrapper'
					)
					var interfaceLayout = scope.evDataService.getInterfaceLayout()
					var verticalSPHeight =
						scope.rootWrapElem.clientHeight - interfaceLayout.splitPanel.height

					verticalSPWrapper.style.height = verticalSPHeight + 'px'
				}

				createController()
			}

			init()
		},
	}
}
