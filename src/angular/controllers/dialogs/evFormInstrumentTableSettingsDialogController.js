import metaHelper from '../../helpers/meta.helper'

import accrualCalculationModelService from '../../services/accrualCalculationModelService'
import instrumentPeriodicityService from '../../services/instrumentPeriodicityService'

import GridTableDataService from '../../services/gridTableDataService'
import EventService from '../../services/eventService'

import gtEvents from '../../services/gridTableEvents'

export default function instrumentTablesSettingsDialogController(
	$scope,
	$mdDialog,
	gridTableHelperService,
	data
) {
	const vm = this

	/* const rowNames = {
			notes: 'Notes',
			accrual_start_date: 'Accrual start date',
			first_payment_date: 'First payment date',
			accrual_size: 'Accrual size',
			accrual_calculation_model: "Calculation model",
			periodicity: "Periodicity",
			periodicity_n: "Periodicity N",
			build_accruals_btn: '"Build Accruals" Button',
			rows_addition: '"Add" Button',
			rows_deletion: '"Delete" Button'
		};

		const defaultSettings = [
			{key: "notes", to_show: true, override_name: ""},
			{key: "accrual_start_date", to_show: true, override_name: ""},
			{key: "first_payment_date", to_show: true, override_name: ""},
			{key: "accrual_size", to_show: true, override_name: ""},
			{key: "accrual_calculation_model", to_show: true, override_name: "", options: []},
			{key: "periodicity", to_show: true, override_name: "", options: []},
			{key: "periodicity_n", to_show: true, override_name: ""},
			{key: "build_accruals_btn", to_show: true},
			{key: "rows_addition", to_show: true},
			{key: "rows_deletion", to_show: true}
		]; */

	vm.dialogLabel = data.dialogLabel

	vm.gridTableData = {
		header: {
			order: 'header',
			columns: [],
		},
		body: [],
		templateRow: {
			order: 'newRow',
			isActive: false,
			columns: [
				{
					key: 'name',
					objPath: ['name'],
					columnName: 'Name',
					order: 0,
					cellType: 'readonly_text',
					settings: {
						value: null,
					},
					styles: {
						'grid-table-cell': { width: '210px' },
					},
				},
				{
					key: 'to_show',
					objPath: ['to_show'],
					columnName: 'To show',
					order: 1,
					cellType: 'checkbox',
					settings: {
						value: false,
					},
					styles: {
						'grid-table-cell': { width: '85px' },
					},
				},
				{
					key: 'override_name',
					objPath: ['override_name'],
					columnName: 'Override name',
					order: 2,
					cellType: 'text',
					settings: {
						value: null,
						closeOnMouseOut: false,
					},
					styles: {
						'grid-table-cell': { width: '210px' },
					},
				},
				{
					key: 'options_settings',
					objPath: ['options'],
					columnName: '',
					order: 3,
					cellType: 'customPopup',
					settings: {
						value: null,
						closeOnMouseOut: false,
						cellText: '...',
						popupSettings: {
							contentHtml: {
								main: '<div ng-include src="\'views/directives/gridTable/cells/popups/instrument-selector-options-display-settings.html\'"></div>',
							},
							popupData: {
								cancel: (popupData, _$popup) => {
									popupData.option.override_name = popupData.oldValue // set value which saved before in template
									_$popup.cancel()
								},
								save: (_$popup) => {
									_$popup.cancel() // user change model directly, simple close popup
								},
							},
							classes: 'ev-instr-accruals-settings-popup',
						},
					},
					styles: {
						'grid-table-cell': { width: '65px' },
					},
				},
			],
		},
		components: {
			topPanel: false,
			rowCheckboxes: false,
		},
	}

	vm.label = ''

	let tableData = {}
	if (data.tableData) {
		tableData = JSON.parse(JSON.stringify(data.tableData))
	}

	if (data.label) {
		vm.label = data.label
	}

	const formatDataForGridTable = function (rowsList) {
		var rowObj = metaHelper.recursiveDeepCopy(
			vm.gridTableData.templateRow,
			true
		)

		//<editor-fold desc="Assemble header columns">
		vm.gridTableData.header.columns = rowObj.columns.map(function (column) {
			return {
				key: column.key,
				columnName: column.columnName,
				order: column.order,
				sorting: false,
				styles: {
					'grid-table-cell': {
						width: column.styles['grid-table-cell'].width,
					},
				},
			}
		})
		//</editor-fold>

		rowsList.forEach((rowData, rowIndex) => {
			rowObj = metaHelper.recursiveDeepCopy(vm.gridTableData.templateRow, true)

			rowObj.key = rowData.key
			rowObj.order = rowIndex

			rowObj.columns.forEach((column) => {
				const colProp = column.objPath[0]

				if (rowData.hasOwnProperty(colProp)) {
					/* if (column.key === 'options_settings') {

							column.settings.value = settings.options;

						} else {
							column.settings.value = settings[colProp];
						} */
					if (column.key === 'options_settings') {
						if (rowData.editableOptions) {
							column.settings.value = rowData[colProp]
						} else {
							column.cellType = 'empty'
							delete column.settings
						}
					} else {
						column.settings.value = rowData[colProp]
					}
				} else {
					// make cell empty if there is not corresponding property
					column.cellType = 'empty'
					delete column.settings
				}
			})

			vm.gridTableData.body.push(rowObj)
			// const nameColumn = gridTableHelperService.getCellFromRowByKey(rowObj, 'notes');
		})

		return vm.gridTableData
	}

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.save = function () {
		$mdDialog.hide({
			status: 'agree',
			data: { label: vm.label, tableData: tableData },
		})
	}

	const init = async function () {
		vm.gridTableDataService = new GridTableDataService()
		vm.gridTableEventService = new EventService()

		/* if (!data) { // get fixed default data for new entity data component

				const mapOptions = function (item) {
					return {
						user_code: item.user_code,
						name: item.name,
						to_show: true,
						override_name: "",
					};
				};

				/!* accrualCalculationModelService.getList().then(accrualModelsData => {
					defaultOpts.accrualModels = accrualModelsData.map(mapOptions);
				});

				instrumentPeriodicityService.getList().then(function (periodicityData) {
					defaultOpts.periodicity = periodicityData.map(mapOptions);
				}); *!/
				const defaultCalculationModelIndex = defaultSettings.findIndex(settings => settings.key === 'accrual_calculation_model');
				const defaultPeriodicityIndex = defaultSettings.findIndex(settings => settings.key === 'periodicity');

				try {

					let accrualCalcModels = await accrualCalculationModelService.getList();
					defaultSettings[defaultCalculationModelIndex].options = accrualCalcModels.map(mapOptions);

				} catch (error) {}

				try {

					const periodicityItems = await instrumentPeriodicityService.getList();
					defaultSettings[defaultPeriodicityIndex].options = periodicityItems.map(mapOptions);

				} catch (error) {}

			} */

		vm.gridTableData = formatDataForGridTable(tableData)
		vm.gridTableDataService.setTableData(vm.gridTableData)

		vm.gridTableEventService.addEventListener(
			gtEvents.CELL_VALUE_CHANGED,
			(argObj) => {
				const changedCell = vm.gridTableDataService.getCell(
					argObj.row.order,
					argObj.column.order
				)
				const dataKey = changedCell.objPath[0]

				if (
					changedCell.settings.value &&
					typeof changedCell.settings.value === 'object'
				) {
					tableData[argObj.row.order][dataKey] = JSON.parse(
						angular.toJson(changedCell.settings.value)
					)
				} else {
					tableData[argObj.row.order][dataKey] = changedCell.settings.value
				}
			}
		)
	}

	init()
}
