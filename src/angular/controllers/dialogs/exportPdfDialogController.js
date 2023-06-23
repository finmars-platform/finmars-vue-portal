import exportPdfService from '../../services/exportPdfService'
import rvRenderer from '../../services/rv-renderer/rv.renderer'
import evEvents from '../../services/entityViewerEvents'

import downloadFileHelper from '../../helpers/downloadFileHelper'

export default function (
	$scope,
	$mdDialog,
	globalDataService,
	uiService,
	reportHelper,
	evDataService,
	evEventService,
	data
) {
	var vm = this

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
		// console.log('fit layout columns', columns);

		var widthLimit = pageSize - pageMargins * 8.2
		// console.log('fit layout layoutWidth, limitWidth', layoutWidth, widthLimit);
		while (layoutWidth * scale > widthLimit) {
			scale = (scale - 0.01).toFixed(2)
		}

		vm.zoomPercent = parseInt(scale * 100)
		// console.log('fit layout final zoom', vm.zoomPercent);
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
		console.log('vm.settings', vm.settings)

		vm.settings.data.reportOptions = JSON.parse(
			JSON.stringify(evDataService.getReportOptions())
		)

		/*delete vm.settings.data.reportOptions.items;
            delete vm.settings.data.reportOptions.item_complex_transactions;
            delete vm.settings.data.reportOptions.item_counterparties;
            delete vm.settings.data.reportOptions.item_responsibles;
            delete vm.settings.data.reportOptions.item_strategies3;
            delete vm.settings.data.reportOptions.item_strategies2;
            delete vm.settings.data.reportOptions.item_strategies1;
            delete vm.settings.data.reportOptions.item_portfolios;
            delete vm.settings.data.reportOptions.item_instruments;
            delete vm.settings.data.reportOptions.item_instrument_pricings;
            delete vm.settings.data.reportOptions.item_instrument_accruals;
            delete vm.settings.data.reportOptions.item_currency_fx_rates;
            delete vm.settings.data.reportOptions.item_currencies;
            delete vm.settings.data.reportOptions.item_accounts;*/
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

		console.log('export pdf content', vm.settings.data.content)
		console.log('vm.settings.zoom', vm.settings.zoom)

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
}
