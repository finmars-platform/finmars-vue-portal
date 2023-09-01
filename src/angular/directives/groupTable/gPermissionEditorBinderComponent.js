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
		},
		restrict: 'AE',
		template: '<div class="permission-editor-controller-container"></div>',
		link: function (scope, elem, attrs) {
			var container = $(elem).find('.permission-editor-controller-container')

			function createController() {
				var additions = scope.evDataService.getAdditions()



				var editorTemplateUrl
				var tpl
				var templateScope
				var ctrl

				$(container).html('')

				editorTemplateUrl = 'views/entity-viewer/permission-editor-view.html'
				tpl = $templateCache.get(editorTemplateUrl)

				templateScope = scope.$new()

				templateScope.$parent.vm = {}
				templateScope.$parent.vm.entityType = additions.type

				ctrl = $controller('EntityViewerPermissionEditorController as vm', {
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

			createController()
		},
	}
}
