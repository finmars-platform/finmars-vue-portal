<template>
	<div class="entity-viewer-holder">
		<!--<div data-ng-if="vm.readyStatus.attributes" class="g-group-table-holder">-->
		<div class="g-group-table-holder height-100">
			<group-table
				attribute-data-service="vm.attributeDataService"
				ev-data-service="vm.entityViewerDataService"
				ev-event-service="vm.entityViewerEventService"></group-table>
		</div>

		<!--<div data-ng-if="!vm.readyStatus.attributes">-->
		<!--<div class="e-data-loader" layout="row" layout-sm="column" layout-align="space-around">-->
		<!--&lt;!&ndash;<md-progress-circular md-diameter="100" md-mode="indeterminate"></md-progress-circular>&ndash;&gt;-->
		<!--<progress-circular diameter="100"></progress-circular>-->
		<!--</div>-->
		<!--</div>-->
	</div>
</template>

<script>
// $templateCache,
// 	$compile,
// 	$controller,
// 	$mdDialog,
// 	$state,
// 	$transitions
const props = defineProps([
	'evDataService',
	'evEventService',
	'spExchangeService',
	'rootWrapElem'
])

	// restrict: 'AE',
	// template: '<div class="vertical-split-panel-controller-container"></div>',
	// link: function (scope, elem, attrs) {
		var container = $(elem).find('.vertical-split-panel-controller-container')

		function createController() {
			var additions = scope.evDataService.getAdditions()

			console.log('create report Controller', additions)

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

			console.log('container', container)

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
	// },

</script>

<style lang="scss" scoped>

</style>
