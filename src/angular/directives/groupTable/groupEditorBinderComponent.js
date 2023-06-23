/**
 * Created by szhitenev on 30.06.2016.
 */

import evEvents from '../../services/entityViewerEvents'

export default function (
	$templateCache,
	$compile,
	$controller,
	$mdDialog,
	$state
) {
	return {
		scope: {
			evDataService: '=',
			evEventService: '=',
		},
		restrict: 'AE',
		templateUrl:
			'views/directives/groupTable/group-editor-binder-component-view.html',
		link: function (scope, elem, attrs) {
			var container = $(elem).find('.splitPanelContentContainer')

			function createController() {
				var entityType = scope.evDataService.getEntityType()
				scope.activeObject = scope.evDataService.getActiveObject()

				var editorTemplateUrl
				var tpl
				var templateScope
				var ctrl

				if (scope.activeObject) {
					$(container).html('')

					if (entityType === 'transaction-type') {
						editorTemplateUrl =
							'views/entity-viewer/transaction-type-edit-split-panel-view.html'
						tpl = $templateCache.get(editorTemplateUrl)

						templateScope = scope.$new()

						ctrl = $controller('TransactionTypeEditDialogController as vm', {
							$scope: templateScope,
							$mdDialog: $mdDialog,
							$state: $state,
							entityType: entityType,
							entityId: scope.activeObject.id,
						})

						container.html(tpl)
						container.children().data('$ngControllerController', ctrl)

						$compile(elem.contents())(templateScope)
					} else {
						if (
							entityType === 'transaction-type' ||
							entityType === 'complex-transaction'
						) {
							editorTemplateUrl =
								'views/entity-viewer/complex-transaction-edit-split-panel-view.html'
							tpl = $templateCache.get(editorTemplateUrl)

							templateScope = scope.$new()

							ctrl = $controller(
								'ComplexTransactionEditDialogController as vm',
								{
									$scope: templateScope,
									$mdDialog: $mdDialog,
									$state: $state,
									entityType: entityType,
									entityId: scope.activeObject.id,
									data: {},
								}
							)

							container.html(tpl)
							container.children().data('$ngControllerController', ctrl)

							$compile(elem.contents())(templateScope)
						} else {
							editorTemplateUrl =
								'views/entity-viewer/entity-viewer-edit-split-panel-view.html'
							tpl = $templateCache.get(editorTemplateUrl)

							templateScope = scope.$new()

							ctrl = $controller('EntityViewerEditDialogController as vm', {
								$scope: templateScope,
								$mdDialog: $mdDialog,
								$state: $state,
								entityType: entityType,
								entityId: scope.activeObject.id,
								data: {},
							})

							container.html(tpl)
							container.children().data('$ngControllerController', ctrl)

							$compile(elem.contents())(templateScope)
						}
					}
				}
			}

			scope.evEventService.addEventListener(
				evEvents.ACTIVE_OBJECT_CHANGE,
				function () {
					createController()
				}
			)

			createController()
		},
	}
}
