<template>
	<div layout="row">
		<!-- <md-button class="link-button" @click="vm.cancel()">
			<span v-if="vm.entityType !== 'transaction'">Cancel</span>
			<span v-if="vm.entityType === 'transaction'">Close</span>
		</md-button> -->
		<FmBtn type="text" class="link-button" @click="vm.cancel()">
			<span v-if="vm.entityType !== 'transaction'">Cancel</span>
			<span v-if="vm.entityType === 'transaction'">Close</span>
		</FmBtn>
		<!-- <md-button
			class="link-button"
			v-if="vm.entity.is_deleted"
			@click="vm.restoreDeleted()"
		>
			<span>Restore</span>
		</md-button> -->
		<FmBtn type="text" 	
			class="link-button"
			v-if="vm.entity.is_deleted"
			@click="vm.restoreDeleted()">
			Restore
		</FmBtn>
	</div>

	<div style="margin-right: 10px">
		<!--<md-menu md-position-mode="target-right target">

				<md-button class="outline-button" ng-click="$mdOpenMenu($event)">
						<div class="flex-row flex-c-center">
								<ng-md-icon icon="more_vert" class="flex-row"></ng-md-icon>
						</div>
				</md-button>

				<md-menu-content class="universal-editor-menu-content optional-entity-menu" width="3">

						<md-menu-item data-ng-if="vm.entityType != 'price-history' && vm.entityType != 'currency-history' && vm.entityType != 'transaction'">
								<md-button ng-click="vm.copy(vm.openedIn)"
													 data-ng-class="{'disabled-btn': !vm.checkReadyStatus() || !vm.entity.is_enabled || !vm.hasEditPermission || vm.processing}">
										<div class="flex-row flex-i-center">
												<ng-md-icon icon="content_copy" class="flex-row"></ng-md-icon>
												<span class="m-l-16">Duplicate</span>
										</div>

								</md-button>
						</md-menu-item>

						<md-menu-item data-ng-if="vm.entityType == 'price-history' || vm.entityType == 'currency-history' && vm.entityType != 'transaction'">
								<md-button ng-click="vm.copy('big-drawer')"
													 data-ng-class="{'disabled-btn': !vm.checkReadyStatus() || !vm.hasEditPermission || vm.processing}">
										<div class="flex-row flex-i-center">
												<ng-md-icon icon="content_copy" class="flex-row"></ng-md-icon>
												<span class="m-l-16">Duplicate</span>
										</div>

								</md-button>
						</md-menu-item>

						<md-menu-divider></md-menu-divider>

						<md-menu-item ng-if="vm.allowFormLayoutEdition">
								<md-button ng-click="vm.editLayout($event)">
										<div class="flex-row flex-i-center">
												<ng-md-icon icon="edit" class="flex-row"></ng-md-icon>
												<span class="m-l-16">Edit Form</span>
										</div>

								</md-button>
						</md-menu-item>

						<md-menu-item>
								<md-button ng-click="vm.editAsJson($event)">
										<div class="flex-row flex-i-center">
												<ng-md-icon icon="edit" class="flex-row"></ng-md-icon>
												<span class="m-l-16">Edit as JSON</span>
										</div>

								</md-button>
						</md-menu-item>

						<md-menu-item data-ng-if="vm.entityType != 'transaction'">
								<md-button ng-click="vm.manageAttrs($event)">
										<div class="flex-row flex-i-center">
												<ng-md-icon icon="list" class="flex-row"></ng-md-icon>
												<span class="m-l-16">Manage Attributes</span>
										</div>

								</md-button>
						</md-menu-item>

						<md-menu-item data-ng-if="vm.hasEnabledStatus && vm.entityType != 'transaction'">
								<md-button ng-click="vm.toggleEnableStatus()"
													 data-ng-class="{'disabled-btn': !vm.hasEditPermission || vm.processing}">

										<div class="flex-row flex-i-center" data-ng-if="vm.entity.is_enabled">
												<ng-md-icon icon="not_interested" class="flex-row"></ng-md-icon>
												<span class="m-l-16">Disable</span>
										</div>

										<div class="flex-row flex-i-center"  data-ng-if="!vm.entity.is_enabled">
												<ng-md-icon icon="check_circle" class="flex-row"></ng-md-icon>
												<span class="m-l-16">Enable</span>
										</div>

								</md-button>
						</md-menu-item>



						<md-menu-divider></md-menu-divider>

						<md-menu-item data-ng-if="vm.entityType != 'transaction'">
								<md-button ng-click="vm.delete($event)"
													 data-ng-class="{'disabled-btn': !vm.hasEditPermission || vm.processing}">
										<div class="flex-row flex-i-center color-delete">
												<ng-md-icon icon="delete" class="flex-row"></ng-md-icon>
												<span class="m-l-16">Delete</span>
										</div>

								</md-button>
						</md-menu-item>

				</md-menu-content>
		</md-menu>-->
		<md-button
			v-if="vm.footerPopupData !== undefined"
			custom-popup
			popup-template-url="'views/popups/selector2-popup-view.html'"
			popup-data="vm.footerPopupData"
			open-on="click"
			position-relative-to="element"
			relative-position-y="top"
			ng-disabled="!vm.checkReadyStatus() || vm.processing"
			class="outline-button"
		>
			<div class="flex-row flex-c-center">
				<ng-md-icon icon="more_vert" class="flex-row"></ng-md-icon>
			</div>
		</md-button>

		<md-button
			class="outline-button"
			v-if="vm.entityType !== 'transaction'"
			:disabled="vm.saveBtnDisabled()"
			@click="vm.save($event, false)"
		>
			Save
		</md-button>

		<md-button
			v-if="vm.entityType !== 'transaction'"
			:disabled="vm.saveBtnDisabled()"
			@click="vm.save($event, true)"
			class="m-r-24 primary-button"
		>
			Save and Exit
		</md-button>
	</div>
</template>

<script>
	export default {}
</script>

<style lang="scss" scoped></style>
