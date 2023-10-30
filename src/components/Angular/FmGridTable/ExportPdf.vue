<template>
	<BaseModal title="Export to PDF" style="min-width: 80vw" @close="vm.cancel()">
		<div class="flex aic m-b-10">
			<BaseInput class="m-b-0" v-model="vm.settings.title" label="Title" />

			<BaseInput
				class="m-l-10 m-b-0"
				style="width: 250px"
				v-model="vm.settings.logoURL"
				label="Logo (URL)"
			/>

			<FmSelect
				v-model="vm.settings.layout"
				class="m-l-10 m-b-0"
				label="Layout"
				prop_id="value"
				:items="vm.layouts"
			/>
			<FmSelect
				v-model="vm.settings.fontSize"
				class="m-l-10 m-b-0"
				label="Font Size"
				:items="vm.fontSizes"
				prop_id="value"
				@update:modelValue="vm.generatePreview()"
			/>

			<FmCheckbox
				class="m-l-10 m-b-0"
				v-model="vm.settings.splitLongWords"
				label="Split Long Words"
				@change="vm.generatePreview()"
			/>

			<FmBtn
				class="m-l-10 m-t-10"
				@click="vm.toggleCssEditor = !vm.toggleCssEditor"
			>
				<span v-show="!vm.toggleCssEditor">Show CSS Editor</span>
				<span v-show="vm.toggleCssEditor">Hide CSS Editor</span>
			</FmBtn>
		</div>

		<v-ace-editor
			v-show="vm.toggleCssEditor"
			v-model:value="vm.settings.customCSS"
			@init="vm.editorInit"
			style="height: 200px"
			lang="css"
			theme="monokai"
		/>

		<div class="flex aic">
			<BaseInput
				style="width: 100%"
				class="m-b-0 m-r-10"
				v-model="vm.settings.notes"
				label="Notes"
			/>
		</div>

		<div v-if="!vm.previewReady">
			<FmLoader></FmLoader>
		</div>

		<div v-show="vm.previewReady && !vm.error">
			<canvas id="pdf-container" class="pdf-container"></canvas>
		</div>

		<div v-show="vm.previewReady && vm.error">
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

		<template #controls>
			<div class="flex sb">
				<FmBtn type="text" @click="vm.cancel()"> Cancel </FmBtn>

				<div class="flex">
					<FmBtn type="action" @click="vm.generatePreview()">Preview</FmBtn>
					<FmBtn class="m-l-10" @click="vm.agree()"> Download </FmBtn>
				</div>
			</div>
		</template>
	</BaseModal>
</template>

<script setup>
	import { VAceEditor } from 'vue3-ace-editor'
	import 'ace-builds/src-noconflict/mode-css'
	import 'ace-builds/src-noconflict/theme-monokai'

	import exportPdfService from '@/angular/services/exportPdfService'
	import rvRenderer from '@/angular/services/rv-renderer/rv.renderer'
	import evEvents from '@/angular/services/entityViewerEvents'

	import rvDataHelper from '@/angular/helpers/rv-data.helper'
	import renderHelper from '@/angular/helpers/render.helper'
	import pdfjsLib from 'pdfjs-dist'

	import downloadFileHelper from '@/angular/helpers/downloadFileHelper'

	// 	$scope,
	// 	globalDataService,
	// 	uiService,
	// 	reportHelper,

	const props = defineProps(['payload'])
	var vm = reactive({})

	// const { evDataService, attributeDataService } = inject('ngDependace')
	const $mdDialog = inject('$mdDialog')
	const { resolve, reject, data, evDataService, evEventService } = props.payload

	vm.settings = reactive({
		data: {},
		customCSS: '',
		fontSize: '10px',
		logoURL: 'https://landing.finmars.com/wp-content/uploads/2023/06/logo.png',
		notes: '',
		splitLongWords: false,
	})

	vm.previewReady = false

	function splitLongWords(sentence) {
		const words = sentence.split(' ')
		const maxLength = 10

		const splitWords = words.map((word) => {
			if (word.length > maxLength) {
				const splitParts = []
				let currentIndex = 0

				while (currentIndex < word.length) {
					splitParts.push(word.substr(currentIndex, maxLength))
					currentIndex += maxLength
				}

				return splitParts.join(' ')
			}

			return word
		})

		return splitWords.join(' ')
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

	vm.fontSizes = [
		{
			value: '8px',
			name: '8',
		},
		{
			value: '9px',
			name: '9',
		},
		{
			value: '10px',
			name: '10',
		},
		{
			value: '11px',
			name: ' 11',
		},
		{
			value: '12px',
			name: ' 12',
		},
		{
			value: '13px',
			name: ' 13',
		},
		{
			value: '14px',
			name: ' 14',
		},
		{
			value: '15px',
			name: ' 15',
		},
		{
			value: '16px',
			name: ' 16',
		},
		{
			value: '17px',
			name: ' 17',
		},
		{
			value: '18px',
			name: ' 18',
		},
	]

	vm.cancel = function () {
		resolve({ status: 'disagree' })
		delete $mdDialog.modals['ExportPdfDialogController']
	}

	vm.generatePreview = function () {
		vm.error = null

		vm.previewReady = false

		vm.resultHTML = vm.getHTMLContent()

		exportPdfService
			.generatePdf({
				orientation: vm.settings.layout,
				html: vm.resultHTML,
			})
			.then(function (blob) {
				var _OBJECT_URL = URL.createObjectURL(blob)

				// send the object url of the pdf to the PDF preview function
				vm.previewPDF(_OBJECT_URL)
			})
			.catch(function (error) {
				vm.error = error

				vm.previewReady = true
			})
	}

	vm.previewPDF = function (pdf_url) {
		pdfjsLib
			.getDocument({ url: pdf_url })
			.promise.then(function (pdf_doc) {
				vm.pdf_document = pdf_doc

				// show the first page of PDF
				vm.showPage(1)

				// destroy previous object url
				URL.revokeObjectURL(pdf_url)
			})
			.catch(function (error) {
				// error reason
				console.error('previewPDF.error', error)
			})
	}

	vm.showPage = function (pageNumber) {
		vm.pdf_document.getPage(pageNumber).then(function (page) {
			var scale = 1.5
			var viewport = page.getViewport({ scale: scale })
			// Support HiDPI-screens.
			var outputScale = window.devicePixelRatio || 1

			var canvas = document.querySelector('#pdf-container')
			if (canvas) {
				canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
			}
			var context = canvas.getContext('2d')

			canvas.width = Math.floor(viewport.width * outputScale)
			canvas.height = Math.floor(viewport.height * outputScale)
			canvas.style.width = Math.floor(viewport.width) + 'px'
			canvas.style.height = Math.floor(viewport.height) + 'px'

			var transform =
				outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null

			var renderContext = {
				canvasContext: context,
				transform: transform,
				viewport: viewport,
			}
			page.render(renderContext)

			vm.previewReady = true
		})
	}

	vm.agree = async function () {
		let data = await vm.pdf_document?.getData()

		downloadFileHelper.downloadFile(data, 'application/pdf', 'report.pdf')

		resolve({ status: 'agree' })
		delete $mdDialog.modals['ExportPdfDialogController']
	}

	vm.getHTMLContent = function () {
		var flatList = rvDataHelper.getFlatStructure(
			evDataService,
			globalDataService
		)
		flatList.shift() // remove root group

		flatList = flatList.filter(function (item) {
			return item.___type !== 'group'
		})

		var index = 0
		flatList = flatList.map(function (item, i) {
			item.___flat_list_index = i

			if (item.___type === 'object' || item.___type === 'blankline') {
				item.___flat_list_offset_top_index = index
				index = index + 1
			}

			if (item.___type === 'subtotal') {
				if (item.___subtotal_type !== 'proxyline') {
					item.___flat_list_offset_top_index = index
					index = index + 1
				}
			}

			return item
		})

		var columns = evDataService.getColumns()

		var theadContent = columns
			.map(function (column) {
				var result = '<th>'

				if (column.layout_name) {
					result = result + column.layout_name
				} else {
					result = result + column.name
				}

				result = result + '</th>'

				return result
			})
			.join('')

		console.log('getHTMLContent.columns', columns)
		console.log('getHTMLContent.flatList', flatList)

		var tbodyContent = flatList
			.map(function (item) {
				var classes = [item.___type, 'level-' + (item.___level - 1)].join(' ')

				var result = '<tr class="' + classes + '">'

				columns.forEach(function (column, index) {
					if (item.___group_name && index === 0 && item.___level === 0) {
						result =
							result +
							'<td style="white-space: pre; border-right: 0">GRAND TOTAL</td>'
					} else if (
						item.___group_name &&
						item.___type === 'subtotal' &&
						index === item.___level - 2
					) {
						// one because index, another of because of root group
						result = result + '<td>' + item.___group_name + '</td>'
					} else if (
						item.___group_name &&
						item.___type === 'subtotal' &&
						index < item.___level - 2
					) {
						// one because index, another of because of root group
						result = result + '<td style="background: #fff;">&nbsp;</td>'
					} else if (item[column.key] && index > item.___level - 2) {
						if (column.value_type === 20) {
							var value = renderHelper.formatValue(item, column)

							var colorNegative = renderHelper.getColorNegativeNumber(
								item[column.key],
								column
							)

							var td_classes = [colorNegative, 'text-right']

							result =
								result +
								'<td class="' +
								td_classes.join(' ') +
								'">' +
								value +
								'</td>'
						} else {
							var td_classes = []

							if (index <= item.___level - 2 && index !== 0) {
								td_classes.push('no-border-left')
							}

							var value = item[column.key]

							if (vm.settings.splitLongWords) {
								value = splitLongWords(value)
							}

							result =
								result +
								'<td class="' +
								td_classes.join(' ') +
								'">' +
								value +
								'</td>'
						}
					} else {
						var td_classes = []

						if (index <= item.___level - 2 && index !== 0) {
							td_classes.push('no-border-left')
						}

						result =
							result + '<td class="' + td_classes.join(' ') + '">&nbsp;</td>'
					}
				})

				result = result + '</tr>'

				return result
			})
			.join('')

		var css = `
			@page {
							size: letter ${vm.settings.layout};
							margin: 2cm;

			}

			.logo {
					width: 140px;
					margin-bottom: 6px;
					display: block;
			}

			table {
					font-size: ${vm.settings.fontSize};
					margin-top: 4px;
					margin-bottom: 4px;
			}
			.title {
					display: block;
			}

			th {
					background: #f2f2f2;
					padding-top: 4px;
			}

			footer {

					padding-top: 2px;

			}


			.subtotal {
					background: #f2f2f2
			}

			.subtotal td {
					border: none;
			}
			.negative-red {
					color: red;
			}
			.text-right {
					text-align: right;
			}
			table {
					border-collapse: collapse;
					border: 1px solid #e0e0e0;
			}
			td {
					padding: 2px;
			}
			td.no-border-left {
					border-left-color: #fff;
			}
			.title {
					font-size: 16px;
			}
			`
		vm.settings.customCSS = css

		const html = `
			<!DOCTYPE html>
			<html>
			<head>
				<title>Finmars Report</title>
				<style>
					${css}
				</style>
			</head>
			<body>
				<div class="header">
					<div><img src="${vm.settings.logoURL}" class="logo" alt="logo"></div>
					<span class="title">${vm.settings.title}</span>
					<span class="report-info">${vm.settings.reportInfo} ${vm.settings.notes}</span>
				</div>
				<table>
					<thead>
							<tr>${theadContent}</tr>
					</thead>
					<tbody>${tbodyContent}</tbody>
				</table>
				<div class="footer text-right">Generated by Finmars</div>
			</body>
			</html>
		`

		return html
	}

	vm.editorInit = function (editor) {
		editor.getSession().setUseWorker(false)
		editor.setHighlightActiveLine(false)
		editor.setShowPrintMargin(false)
		editor.setFontSize(14)
		editor.setBehavioursEnabled(true)
	}

	vm.init = function () {
		vm.entityType = evDataService.getEntityType()
		vm.reportOptions = evDataService.getReportOptions()

		if (vm.entityType == 'reports.balancereport') {
			vm.settings.title = 'Balance Report'

			vm.settings.reportInfo =
				'Currency: ' +
				vm.reportOptions.report_currency +
				' | ' +
				'Date: ' +
				vm.reportOptions.report_date
		}
		console.log('vm.entityType:', vm.entityType)

		if (vm.entityType === 'reports.plreport') {
			vm.settings.title = 'P&L Report'

			vm.settings.reportInfo =
				'Currency: ' +
				vm.reportOptions.report_currency +
				' | ' +
				'From: ' +
				vm.reportOptions.pl_first_date +
				' | ' +
				'To: ' +
				vm.reportOptions.report_date
		}
		if (vm.entityType === 'reports.transactionreport') {
			vm.settings.title = 'Transaction Report'

			vm.settings.reportInfo =
				'From: ' +
				vm.reportOptions.pl_first_date +
				' | ' +
				'To: ' +
				vm.reportOptions.report_date
		}

		vm.generatePreview()
	}

	vm.init()
</script>

<style lang="scss" scoped></style>
