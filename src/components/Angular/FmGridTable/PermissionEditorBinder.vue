<template>
	<div>

		<div layout="row" layout-align="center center">
			<h3>Groups Permission Manager</h3>
		</div>

		<div style="margin-bottom: 16px; margin-left: 8px;">

			<div style="margin-right: 8px; background: lightblue; display: inline-block; width: 16px; height: 16px">

			</div>

			You are a member of this group

		</div>

		<div layout="row" layout-align="space-between center" style="margin-bottom: 8px; padding: 0 16px">
			<div layout="row" layout-align="begin center">
				Group Name
			</div>
			<div layout="row" layout-align="center center">
				<div layout="row" layout-align="center center" style="width: 210px">
					<b>Manage</b>
					<md-tooltip class="tooltip_1" md-direction="top">Allow/forbid change the Access Rights</md-tooltip>
				</div>
				<div layout="row" layout-align="center center" style="width: 210px">
					<b>Edit</b>
					<md-tooltip class="tooltip_1" md-direction="top">Allow/forbid to make changes to the Object</md-tooltip>
				</div>
				<div layout="row" layout-align="center center" style="width: 210px">
					<b>View</b>
					<md-tooltip class="tooltip_1" md-direction="top">Reveal/conceal to object to the Group</md-tooltip>
				</div>
			</div>
		</div>

		<div layout="column" class="ev-permission-editor-item">

			<div layout="row" layout-align="space-between"
					 class="m-b-8 {{group.current_member_in_group ? 'member-in-group' : ''}}"
					 v-for="group in vm.groups"
					 style="height: 48px;">

				<div layout="row" layout-align="begin center">
					<span v-bind="group.name"></span>
					</span>
				</div>


				<div layout="row" layout-align="center center">

					<div style="width: 210px">

						<md-checkbox class="permission-checkbox"
												 :checked="group.isManageChecked"
												 md-indeterminate="group.isManageIndeterminate == true"
												 @click="vm.toggleManage($event, group)">
						</md-checkbox>

					</div>

					<div style="width: 210px">

						<md-checkbox class="permission-checkbox"
												 :checked="group.isChangeChecked"
												 md-indeterminate="group.isChangeIndeterminate == true"
												 @click="vm.toggleChange($event, group)">
						</md-checkbox>

					</div>

					<div style="width: 210px">

						<md-checkbox class="permission-checkbox"
												 :checked="group.isViewChecked"
												 md-indeterminate="group.isViewIndeterminate == true"
												 @click="vm.toggleView($event, group)">
						</md-checkbox>

					</div>

				</div>


			</div>

		</div>

		<div layout="row">

			<md-button @click="vm.save()"
								 class="md-raised md-primary"
								 :class="{'disabled-btn': !vm.selectedRows.length}">Save

				<span data-ng-if="vm.selectedRows.length > 1">for All Objects</span>

			</md-button>


			<div data-ng-if="vm.entityType == 'portfolio' || vm.entityType == 'account' || vm.entityType == 'transaction-type'">

				<md-button @click="vm.recalculateTransactionPermissions()"
									 :class="{'disabled-btn': !vm.isSaved}"
									 class="md-raised md-primary">Apply new Permissions to Transactions
				</md-button>

			</div>

			<div data-ng-if="vm.entityType == 'instrument-type'">

				<md-button @click="vm.recalculateInstrumentPermissions()"
									 :class="{'disabled-btn': !vm.isSaved}"
									 class="md-raised md-primary">Apply new Permissions to Instruments
				</md-button>

			</div>

			<div data-ng-if="vm.entityType == 'account-type'" layout="row">

				<md-button @click="vm.recalculateAccountPermissions()"
									 :class="{'disabled-btn': !vm.isSaved}"
									 class="md-raised md-primary">Apply new Permissions to Accounts
				</md-button>

				<md-button @click="vm.recalculateAccountAndTransactionsPermissions()"
									 :class="{'disabled-btn': !vm.isSaved}"
									 class="md-raised md-primary">Apply new Permissions to Accounts and Transactions
				</md-button>

			</div>


			<progress-circular diameter="20" v-if="vm.recalculating" class="m-t-8"></progress-circular>

		</div>

	</div>
</template>

<script>
// export default function (
// 	$templateCache,
// 	$compile,
// 	$controller,
// 	$mdDialog,
// 	$state,
// 	$transitions
// ) {
const props = defineProps([
	'evDataService',
	'evEventService',
	'spExchangeService'
])

		// link: function (scope, elem, attrs) {
			var container = $(elem).find('.permission-editor-controller-container')

			function createController() {
				var additions = scope.evDataService.getAdditions()

				console.log('create report Controller', additions)

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
