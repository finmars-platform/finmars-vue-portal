<template>
	<!--Victor 2020.11.02 This view implements new design for all entities.-->
	<!--Now I develop new design for: instruments, ... -->
	<!--When all entities will have new design, we can rename entity-viewer-universal-edit-drawer-view.html to  entity-viewer-edit-drawer-view.html -->
	<div class="big-drawer-content universal-editor">
		<div class="big-drawer-header">

			<div v-if="vm.checkReadyStatus()"
					 :class="{'disabled-input-form': !vm.hasEditPermission}">

				<h2 v-if="vm.hasEditPermission" class="big-drawer-header-h">Edit {{vm.entityTypeSlug()}}: {{vm.getShowByDefaultEntityValue()}}</h2>
				<h2 v-if="!vm.hasEditPermission" class="big-drawer-header-h">View {{vm.entityTypeSlug()}}: {{vm.getShowByDefaultEntityValue()}}</h2>

				<span v-if="!vm.hasEditPermission" style="margin-left: 12px;">
                <ng-md-icon icon="lock" size="24">
                        <md-tooltip md-direction="bottom">You don't have permission to edit this form</md-tooltip>
                </ng-md-icon>
            </span>

				<div v-if="vm.processing" layout="row" class="m-l-16 big-drawer-header-processing">
					<div layout="row" layout-sm="column" layout-align="space-around" class="m-r-8">
						<progress-circular diameter="20"></progress-circular>
					</div>
					— Processing
				</div>

				<div v-if="vm.entityType == 'instrument'">
					<div class="instrument-refresh-from-database-button" v-if="vm.entity.instrument_type_object.user_code == 'stocks' || vm.entity.instrument_type_object.user_code == 'bonds'">
						<span class="material-icons  {{vm.processing ? 'disabled-btn' : ''}}" @click="vm.updateLocalInstrument()">autorenew</span>
						<md-tooltip md-direction="bottom">Refresh Instrument from Finmars© Database</md-tooltip>
					</div>

				</div>

			</div>

		</div>

		<div class="big-drawer-main"
		>
			<!--				 data-ng-include="'views/entity-viewer/entity-viewer-edit-content-view.html'"-->
			<EntityViewerEditContentView>
			</EntityViewerEditContentView>
		</div>

		<div class="big-drawer-footer big-drawer-actions flex-row fc-space-between"
				>
			<EntityViewerEditFooterView></EntityViewerEditFooterView>
<!--			 data-ng-include="'views/entity-viewer/entity-viewer-edit-footer-view.html'"-->
		</div>

	</div>
</template>

<script>
import EntityViewerEditContentView from "~/components/Angular/DrawerService/EntityViewerEditContentView.vue";
import EntityViewerEditFooterView from "~/components/Angular/DrawerService/EntityViewerEditFooterView.vue";

export default {
	components: {EntityViewerEditFooterView, EntityViewerEditContentView}

}
</script>

<style lang="scss" scoped>

</style>
