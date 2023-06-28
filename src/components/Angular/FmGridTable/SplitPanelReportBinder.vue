<template>
	<div class="report-viewer-holder">
		<div class="height-100">
			<div v-if="vm.readyStatus.attributes && vm.readyStatus.layout" class="g-group-table-holder">
				<group-table
					attribute-data-service="vm.attributeDataService"
					v-bind="vm.entityViewerDataService"
					@click="vm.entityViewerEventService"
				></group-table>
			</div>
			<div v-if="!vm.readyStatus.attributes || !vm.readyStatus.layout">
				<div class="e-data-loader" layout="row" layout-sm="column" layout-align="space-around">
					<!--<md-progress-circular md-diameter="100" md-mode="indeterminate"></md-progress-circular>-->
					<!--					ProgressCircular.vue  -->
					<progress-circular diameter="100"></progress-circular>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
/**
 * Created by szhitenev on 30.06.2016.
 */

import evEvents from '../../services/entityViewerEvents'

// export default function (
// 	$templateCache,
// 	$compile,
// 	$controller,
// 	$mdDialog,
// 	$state,
// 	$transitions,
// 	metaContentTypesService
// ) {
// 	return {

		const props = defineProps([
			'evDataService',
			'evEventService',
			'spExchangeService'
		])

		// link: function (scope, elem, attrs) {
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
// 		},
// 	}
// }

</script>

<style lang="scss" scoped>

</style>
