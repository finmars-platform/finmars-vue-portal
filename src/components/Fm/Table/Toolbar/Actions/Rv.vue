<template>

	<FmTableToolbarActions
		:splitPanelOptions="spOpts"
		:extraMoreOptions="moreMenuOptsList"
		:isReport="true"
	>
		<template #leftPart>
			<FmIcon
				icon="refresh"
				@click="scope.refreshTable()"
				v-tooltip="'Refresh Database Filters'"
				btn
			/>

			<FmMenu v-if="scope.isRootEntityViewer">
				<template #btn>
					<FmIcon btn icon="view_stream" v-tooltip="'Split'" />
				</template>

				<template #default="{ close }">
					<div class="fm_list" @click="close()">

						<div
							class="fm_list_item g-settings-option-btn"
							@click="emit('toggleSplitPanel', 'balance-report')"
						>
							<FmIcon
								:class="{
							'visibility-hidden': scope.currentAdditions?.type !== 'balance-report'
						}"
								icon="done"
							/>

							<span>Open Balance Report view panel</span>
						</div>

						<div
							class="fm_list_item g-settings-option-btn"
							@click="emit('toggleSplitPanel', 'balance-report')"
						>
							<FmIcon
								:class="{
							'visibility-hidden': scope.currentAdditions?.type !== 'pl-report'
						}"
								icon="done"
							/>

							<span>Open P&L Report view panel</span>
						</div>

						<div
							class="fm_list_item g-settings-option-btn"
							@click="emit('toggleSplitPanel', 'transaction-report')"
						>
							<FmIcon
								:class="{
							'visibility-hidden': scope.currentAdditions?.type !== 'transaction-report'
						}"
								icon="done"
							/>

							<span>Open Transaction Report view panel</span>
						</div>

					</div>
				</template>
			</FmMenu>

			<FmMenu v-if="scope.isRootEntityViewer">
				<template #btn>
					<FmIcon
						btn
						icon="view_module"
						:disabled="true"
						v-tooltip="'Matrix'"
					/>
				</template>

				<template #default="{ close }">
					<div class="fm_list" @click="close()">
						<div class="fm_list_item" @click="scope.toggleMatrix">
							<FmIcon
								icon="matrix"
							/>
							<span>Open Matrix</span>
						</div>
					</div>
				</template>
			</FmMenu>
		</template>

	</FmTableToolbarActions>

<!--	<AngularFmGridTableMatrixSettingsM
		v-if="$mdDialog.modals['ReportViewerMatrixSettingsDialogController']"
		:payload="$mdDialog.modals['ReportViewerMatrixSettingsDialogController']"
		:modelValue="true"
	/>-->

</template>

<script setup>
import evEvents from "@/angular/services/entityViewerEvents";
// stores
// props, emits
let props = defineProps()

let emit = defineEmits([
]);

//# region variables, refs, computed
let {evDataService, evEventService} = inject('fmTableData')

let scope = reactive({});

scope.isRootEntityViewer = evDataService.isRootEntityViewer();

const spOpts = [
    {
        type: 'balance-report',
        name: 'Open Balance Report view panel',
    },
    {
        type: 'pl-report',
        name: 'Open P&L Report view panel',
    },
    {
        type: 'transaction-report',
        name: 'Open Transaction Report view panel',
    },
]

const moreMenuOptsList = [
    {
		onClick: function () {},
        name: 'Custom Columns',
	},
]
//# endregion

//# region hooks
//# endregion

// watchers

scope.refreshTable = function () {
	scope.processing = true;
	scope.evEventService.dispatchEvent(evEvents.REQUEST_REPORT);
};

</script>

<style scoped lang="scss">

</style>
