<template>
	<BaseModal title="Export to PDF">
		<div class="flex">
			<FmSelect
				v-model="vm.settings.layout"
				label="Layout"
				:items="vm.layouts"
			/>
			<FmSelect
				v-model="vm.settings.fontSize"
				label="Font Size"
				:items="vm.fontSizes"
				@update:modelValue="vm.generatePreview()"
			/>
			<BaseInput v-model="vm.settings.title" label="Title" />

			<BaseInput v-model="vm.settings.logoURL" label="Logo (URL)" />

			<div>
				<md-button data-ng-click="vm.toggleCssEditor = !vm.toggleCssEditor">
					<span data-ng-if="!vm.toggleCssEditor">Show CSS Editor</span>
					<span data-ng-if="vm.toggleCssEditor">Hide CSS Editor</span>
				</md-button>

				<!-- <div
					class="ace-editor css-editor"
					id="aceEditor"
					style="height: 200px"
					data-ng-show="vm.toggleCssEditor"
				></div> -->
			</div>

			<md-button data-ng-click="vm.generatePreview()">Preview</md-button>
		</div>

		<div layout="row">
			<md-input-container>
				<label for="">Notes</label>
				<input type="text" data-ng-model="vm.settings.notes" />
			</md-input-container>

			<md-input-container style="width: 160px">
				<md-checkbox
					ng-model="vm.settings.splitLongWords"
					ng-change="vm.generatePreview()"
					aria-label=""
				>
					Split Long Words
				</md-checkbox>
			</md-input-container>
		</div>

		<div data-ng-if="!vm.previewReady">
			<div
				layout="row"
				layout-sm="column"
				layout-align="space-around"
				class="m-large"
			>
				<progress-circular diameter="100"></progress-circular>
			</div>
		</div>

		<div data-ng-show="vm.previewReady && !vm.error">
			<canvas id="pdf-container" class="pdf-container"></canvas>
		</div>

		<div data-ng-show="vm.previewReady && vm.error">
			<div
				style="
					max-width: 300px;
					margin: 10px auto;
					color: red;
					white-space: pre;
					background: #ddd;
					border: grey;
				"
			>
				{{ vm.error }}
			</div>
		</div>

		<div layout="row" class="m-t-16">
			<div>
				<md-button class="md-raised" ng-click="vm.fitLayoutOnAPage()"
					>Autocalculate zoom for layout</md-button
				>
			</div>
		</div>

		<template #controls>
			<div class="flex sb">
				<FmBtn type="text" @click="vm.cancel()"> Cancel </FmBtn>

				<FmBtn @click="vm.agree()"> Download </FmBtn>
				<!-- <md-button class="md-primary md-raised" ng-click="vm.saveExportOptions()">
				Apply
			</md-button> -->
			</div>
		</template>
	</BaseModal>
</template>

<script setup>
	import exportPdfService from '@/angular/services/exportPdfService'
	import rvRenderer from '@/angular/services/rv-renderer/rv.renderer'
	import evEvents from '@/angular/services/entityViewerEvents'

	import downloadFileHelper from '@/angular/helpers/downloadFileHelper'

	// 	$scope,
	// 	globalDataService,
	// 	uiService,
	// 	reportHelper,
	// 	evDataService,
	// 	evEventService,
	// 	data

	const props = defineProps(['payload'])
	var vm = reactive({})

	// const { evDataService, attributeDataService } = inject('ngDependace')
	const $mdDialog = inject('$mdDialog')
	const { resolve, reject, data, evDataService, evEventService } = props.payload

	vm.settings = {
		data: {},
	}

	vm.entityType = data.entityType

	vm.zoomPercent = 100

	vm.settings.layout = 'landscape'
	vm.settings.margin = 4

	var exportOptions = evDataService.getExportOptions()

	if (exportOptions && exportOptions.hasOwnProperty('pdf')) {
		if (exportOptions.pdf.zoom) {
			vm.zoomPercent = exportOptions.pdf.zoom
		}

		if (exportOptions.pdf.layout) {
			vm.settings.layout = exportOptions.pdf.layout
		}

		if (exportOptions.pdf.margin) {
			vm.settings.margin = exportOptions.pdf.margin
		}
	}

	vm.settings.data.groups = evDataService.getGroups()
	vm.settings.data.columns = evDataService.getColumns()
	vm.settings.data.content = evDataService.getFlatList()

	vm.layouts = [
		{
			value: 'portrait',
			name: 'Portrait',
		},
		{
			value: 'landscape',
			name: ' Landscape',
		},
	]

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.fitLayoutOnAPage = function () {
		var pageType = vm.settings.layout
		var pageMargins = vm.settings.margin
		var scale = 1

		var pageSize = null
		if (pageType === 'portrait') {
			pageSize = 833
		} else {
			pageSize = 1173
		}

		var columns = evDataService.getColumns()
		var layoutWidth = 0
		columns.map(function (column) {
			layoutWidth = layoutWidth + parseInt(column.style.width)
		})
		// ;

		var widthLimit = pageSize - pageMargins * 8.2
		// ;
		while (layoutWidth * scale > widthLimit) {
			scale = (scale - 0.01).toFixed(2)
		}

		vm.zoomPercent = parseInt(scale * 100)
		// ;
	}

	vm.saveExportOptions = function () {
		var exportOptions = {}

		exportOptions.pdf = {}
		exportOptions.pdf.zoom = vm.zoomPercent
		exportOptions.pdf.layout = vm.settings.layout
		exportOptions.pdf.margin = vm.settings.margin

		evDataService.setExportOptions(exportOptions)
		evEventService.dispatchEvent(evEvents.REPORT_EXPORT_OPTIONS_CHANGED)

		$mdDialog.show({
			controller: 'SuccessDialogController as vm',
			templateUrl: 'views/dialogs/success-dialog-view.html',
			multiple: true,
			locals: {
				success: {
					title: 'Success',
					description: 'Export settings have been saved',
				},
			},
			autoWrap: true,
			skipHide: true,
		})
	}

	vm.agree = function () {
		vm.settings.data.reportOptions = JSON.parse(
			JSON.stringify(evDataService.getReportOptions())
		)

		vm.settings.data.reportOptions =
			reportHelper.cleanReportOptionsFromTmpProps(
				vm.settings.data.reportOptions
			)

		var elem = {}

		rvRenderer.render(
			elem,
			vm.settings.data.content,
			globalDataService,
			evDataService,
			evEventService
		)

		vm.settings.data.content = evDataService.getFlatList()

		vm.settings.zoom = parseInt(vm.zoomPercent, 10) / 100

		uiService.getDefaultListLayout(vm.entityType).then(function (res) {
			var contentSettings = vm.settings.data

			if (res.results.length) {
				contentSettings.layoutName = res.results[0].name
			} else {
				contentSettings.layoutName = 'Default'
			}

			var data = {
				entityType: vm.entityType,
				settings: {
					zoom: parseInt(vm.zoomPercent, 10) / 100,
					layout: vm.settings.layout,
					margin: vm.settings.margin,
				},
				contentSettings: contentSettings,
				content: evDataService.getFlatList(),
			}

			exportPdfService.generatePdf(data).then(function (blob) {
				downloadFileHelper.downloadFile(blob, 'application/pdf', 'report.pdf')

				$mdDialog.hide()
			})
		})
	}
</script>

<style lang="scss" scoped></style>
