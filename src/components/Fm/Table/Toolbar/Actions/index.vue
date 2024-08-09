<template>

	<slot name="leftPart" />

	<FmMenu v-if="isRootEntityViewer">
		<template #btn>
			<FmIcon btn icon="view_stream" v-tooltip="'Split'" />
		</template>

		<template #default="{ close }">
			<div class="fm_list" @click="close()">

				<div
					v-for="option in splitPanelOptions"
					class="fm_list_item g-settings-option-btn"
					@click="toggleSplitPanel(option.type)"
				>
					<FmIcon
						:class="{
							'visibility-hidden': scope.currentAdditions?.type !== option.type
						}"
						icon="done"
					/>

					<span>{{ option.name }}</span>
				</div>

<!--				<div
					class="fm_list_item g-settings-option-btn"
					@click="toggleSplitPanel('balance-report')"
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
					@click="toggleSplitPanel('balance-report')"
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
					@click="toggleSplitPanel('transaction-report')"
				>
					<FmIcon
						:class="{
							'visibility-hidden': scope.currentAdditions?.type !== 'transaction-report'
						}"
						icon="done"
					/>

					<span>Open Transaction Report view panel</span>
				</div>-->

			</div>
		</template>
	</FmMenu>

	<FmMenu>
		<template #btn>
			<FmIcon btn icon="upgrade" v-tooltip="'Export'" />
		</template>

		<template #default="{ close }">
			<div class="fm_list" @click="close()">

                <div
                    v-for="option in exportOptsList"
                    class="fm_list_item"
                    @click="option.onClick()"
                >
                    {{ option.name }}
                </div>

<!--                <div
					class="fm_list_item"
					v-if="scope.isReport"
					@click="exportAsPdf"
				>
					Export to PDF
				</div>

				<div
					class="fm_list_item"
					@click="emit('exportAsCSV')"
				>
					Export to CSV
				</div>

				<div
					class="fm_list_item"
					@click="emit('exportAsExcel')"
				>
					Export to Excel
				</div>

				<div
					class="fm_list_item"
					@click="emit('copyAllToBuffer')"
				>
					Copy all to buffer
				</div>

				<div
					class="fm_list_item"
					@click="emit('copySelectedToBuffer')"
				>
					Copy selected to buffer
				</div>-->
			</div>
		</template>
	</FmMenu>

	<FmMenu>
		<template #btn>
			<FmIcon btn icon="more_vert" v-tooltip="'More'" />
		</template>

		<template #default="{ close }">
			<div class="fm_list" @click="close()">
                <div
                    v-for="option in moreMenuOptsList"
                    class="fm_list_item"
                    @click="option.onClick()"
                >
                    {{ option.name }}
                </div>
<!--				<div class="fm_list_item" @click="openViewConstructor">
					View Constructor
				</div>

				<div
					class="fm_list_item"
					v-if="scope.entityType !== 'complex-transaction'"
					@click="openCustomFieldsManager"
				>
					Custom Columns
				</div>

				<div
					class="fm_list_item"
					v-if="!scope.isReport"
					@click="openInputFormEditor"
				>
					Edit form
				</div>-->
			</div>
		</template>
	</FmMenu>

</template>

<script setup>
/* *
 * Supporting component for
 * components/Fm/Table/Toolbar/Actions/Rv.vue,
 * components/Fm/Table/Toolbar/Actions/Ev.vue.
 * Must always have one of them as the direct parent.
 * */
import convertReportHelper from "~/angular/helpers/converters/convertReportHelper";
import downloadFileHelper from "~/angular/helpers/downloadFileHelper";
import exportExcelService from "~/angular/services/exportExcelService";
import evEvents from "~/angular/services/entityViewerEvents";

// stores
// props, emits
let props = defineProps({
	/* *
	 * [{type: String, name: String}]
	 *
	 * type - type of split panel. E.g. balance-report, permission-editor etc.
	 * name - name of an option
	 * */
	splitPanelOptions: {
		type: Array,
		required: true,
	},
    /* Unshift to exportOptsList */
    extraMoreOptions: Array,
    isReport: Boolean,
});

//# region variables, refs, computed
let {evDataService, evEventService} = inject('fmTableData');

let scope = reactive({
	currentAdditions: structuredClone( evDataService.getAdditions() ),
});

const isRootEntityViewer = evDataService.isRootEntityViewer();

let moreMenuOptsList = [
    {
        onClick: function () {},
        name: 'View Constructor',
    }
]

if (props.extraMoreOptions?.length) {
    moreMenuOptsList = moreMenuOptsList.concat(props.extraMoreOptions);
}
//# endregion

//# region hooks
//# endregion

// watchers

const toggleSplitPanel = function (type) {

	let currentAdditions = evDataService.getAdditions();

	if (currentAdditions.type === type) {

		evRvLayoutsHelper.clearSplitPanelAdditions(evDataService);

		evEventService.dispatchEvent(evEvents.ADDITIONS_CHANGE);
		evEventService.dispatchEvent(evEvents.UPDATE_TABLE_VIEWPORT);

	} else {

		var entityType = null;

		switch (type) {
			case "balance-report":
			case "pl-report":
			case "transaction-report":
				entityType = type;
				break;
		}

		if (entityType) { // in case of choosing entity viewer layout

			getListLayoutByEntity(entityType).then(function (layoutsList) {

				var layouts = evRvLayoutsHelper.getDataForLayoutSelectorWithFilters(layoutsList);

				$mdDialog.show({
					controller: "ExpandableItemsSelectorDialogController as vm",
					templateUrl: "views/dialogs/expandable-items-selector-dialog-view.html",
					multiple: true,
					locals: {
						data: {
							dialogTitle: 'Choose layout to open Split Panel with',
							items: layouts
						}
					}

				}).then(function (res) {

					if (res.status === 'agree') {

						var additions = evDataService.getAdditions();

						additions.isOpen = true;
						additions.type = type;

						if (res.selected.id) {

							if (!additions.layoutData) {
								additions.layoutData = {};
							}

							additions.layoutData.user_code = res.selected.user_code;
							additions.layoutData.layoutId = res.selected.id;
							additions.layoutData.name = res.selected.name;

							additions.layoutData.content_type = res.selected.content_type;

						} else {
							delete additions.layoutData;
						}

						evDataService.setSplitPanelStatus(true);
						evDataService.setAdditions(additions);
						evEventService.dispatchEvent(evEvents.ADDITIONS_CHANGE);
						scope.currentAdditions = evDataService.getAdditions();

					}

				});

			});

		}
		else {

			var additions = evDataService.getAdditions();

			additions.isOpen = true;
			additions.type = type;

			delete additions.layoutData;

			evDataService.setSplitPanelStatus(true);
			evDataService.setAdditions(additions);
			evEventService.dispatchEvent(evEvents.ADDITIONS_CHANGE);
			scope.currentAdditions = evDataService.getAdditions();

		}


	}

};

//# region Exports
const exportAsPdf = function ($event) {

    $mdDialog.show({
        controller: 'ExportPdfDialogController as vm',
        templateUrl: 'views/dialogs/export-pdf-dialog-view.html',
        parent: angular.element(document.body),
        targetEvent: $event,
        locals: {
            evDataService: scope.evDataService,
            evEventService: scope.evEventService,
            data: {entityType: scope.entityType}
        }
    })

};

const exportAsCSV = function () {

    var flatList = evDataService.getFlatList();
    var columns = evDataService.getColumns();
    var groups = evDataService.getGroups();

    var blobPart = convertReportHelper.convertFlatListToCSV(flatList, columns, props.isReport, groups.length);
    downloadFileHelper.downloadFile(blobPart, "text/plain", "report.csv");
};

const exportAsExcel = function () {

    var data = {
        entityType: evDataService.getEntityType(),
        contentSettings: {
            columns: evDataService.getColumns(),
            groups: evDataService.getGroups()
        },
        content: evDataService.getFlatList()
    };

    exportExcelService.generateExcel(data).then(function (blob) {

        downloadFileHelper.downloadFile(blob, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "report.xlsx");

    })

};

const copyR = function (evDataService, isReport, copyType) {

    var flatList = evDataService.getFlatList();

    if (copyType === 'selected') {

        if (isReport) {

            flatList = flatList.filter(function (row) {

                if (row.___type === 'subtotal') {

                    var parentGroup = evDataService.getData(row.___parentId);

                    if (row.___subtotal_type === "line" && parentGroup.___is_line_subtotal_activated) {
                        return true;
                    }

                    if (row.___subtotal_type === "area" && parentGroup.___is_area_subtotal_activated) {
                        return true;
                    }

                } else if (row.___is_activated) {
                    return true;
                }

                return false;

            });

        } else {

            flatList = flatList.filter(function (row) {
                return row.___is_activated;
            });

        }

    }

    if (flatList.length) {
        var columns = evDataService.getColumns();
        var groups  = evDataService.getGroups();

        var table = convertReportHelper.convertFlatListToExcel(flatList, columns, isReport, groups.length);

        var listener = function (e) {

            // console.log('covert copy selected csv', csv);

            e.clipboardData.setData('text/plain', table);

            e.preventDefault();

        };

        document.addEventListener('copy', listener, false);

        document.execCommand("copy");

        document.removeEventListener('copy', listener, false);
    }

};

const copyReport = function () {
    copyR(evDataService, props.isReport);
};

const copySelectedToBuffer = function () {
    copyR(evDataService, isReport, 'selected');
};

let exportOptsList = [
    {
        name: 'Export to CSV',
        onClick: exportAsCSV
    },
    {
        name: 'Export to Excel',
        onClick: exportAsExcel
    },
    {
        name: 'Copy all to buffer',
        onClick: copyReport
    },
    {
        name: 'Copy selected to buffer',
        onClick: copySelectedToBuffer
    },
]

if (props.isReport) {

    exportOptsList.unshift({
        name: 'Export to PDF',
        onClick: exportAsPdf
    })

}
//# endregion

</script>

<style scoped lang="scss">

</style>
