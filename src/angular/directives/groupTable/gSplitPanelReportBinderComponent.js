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
	$transitions,
	metaContentTypesService
) {
	return {
		scope: {
			evDataService: '=',
			evEventService: '=',
			spExchangeService: '=',
		},
		restrict: 'AE',
		template: '<div class="split-panel-controller-container"></div>',
		link: function (scope, elem, attrs) {
			var container = $(elem).find('.split-panel-controller-container')

			function createController() {
				var additions = scope.evDataService.getAdditions()

				console.log('create report Controller', additions)

				var editorTemplateUrl
				var tpl
				var templateScope
				var ctrl

				$(container).html('')

				editorTemplateUrl =
					'views/entity-viewer/split-panel-report-viewer-view.html'
				tpl = $templateCache.get(editorTemplateUrl)

				templateScope = scope.$new()

				templateScope.$parent.vm = {}
				templateScope.$parent.vm.entityType = additions.type
				// templateScope.$parent.vm.contentType = metaContentTypesService.findContentTypeByEntity( additions.type);
				templateScope.$parent.vm.contentType = additions.layoutData.content_type

				ctrl = $controller('SplitPanelReportViewerController as vm', {
					$scope: templateScope,
					$mdDialog: $mdDialog,
					$transitions: $transitions,
					parentEntityViewerDataService: scope.evDataService,
					parentEntityViewerEventService: scope.evEventService,
					splitPanelExchangeService: scope.spExchangeService,
				})

				container.html(tpl)
				container.children().data('$ngControllerController', ctrl)

				console.log('container', container)

				$compile(elem.contents())(templateScope)
			}

			createController()
		},
	}
}
