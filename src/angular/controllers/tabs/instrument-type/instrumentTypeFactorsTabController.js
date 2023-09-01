/**
 * Created by vzubr on 11.06.2021.
 */

import GridTableDataService from '@/angular/services/gridTableDataService'
import GridTableEventService from '@/angular/services/gridTableEventService'
import gridTableEvents from '@/angular/services/gridTableEvents'

import metaHelper from '@/angularlpers/meta.helper'
import metaService from '@/angular/services/metaService'

import instrumentAttributeTypeService from '@/angular/services/instrument/instrumentAttributeTypeService'

export default function instrumentTypeFactorsTabController(
	$scope,
	$mdDialog,
	instrumentService,
	multitypeFieldService,
	gridTableHelperService
) {
	var vm = this
	vm.entity = $scope.$parent.vm.entity

	vm.readyStatus = {
		factors: false,
	}

	// One set of multi type fields for both grid tables
	const multitypeFieldsForRows =
		instrumentService.getInstrumentFactorsMultitypeFieldsData()

	const getFactorsData = () => {
		if (vm.entity.instrument_factor_schedule_data) {
			return JSON.parse(vm.entity.instrument_factor_schedule_data)
		}

		const defaultFactorsScheduleData = [
			{
				key: 'effective_date',
				name: 'Date',
				to_show: true,
				override_name: '',
				tooltip: '',
				default_value_type: 40,
				default_value: '',
			},
			{
				key: 'position_factor_value',
				name: 'Position factor',
				to_show: true,
				override_name: '',
				tooltip: '',
				default_value_type: 20,
				default_value: '',
			},
			{
				key: 'factor_value1',
				name: 'Factor 1',
				to_show: true,
				override_name: '',
				tooltip: '',
				default_value_type: 20,
				default_value: '',
			},
			{
				key: 'factor_value2',
				name: 'Factor 2',
				to_show: true,
				override_name: '',
				tooltip: '',
				default_value_type: 20,
				default_value: '',
			},
			{
				key: 'factor_value3',
				name: 'Factor 3',
				to_show: true,
				override_name: '',
				tooltip: '',
				default_value_type: 20,
				default_value: '',
			},
		]

		return defaultFactorsScheduleData
	}

	// Victor 2021.06.17 fist static grid table
	const getFactorsDataGridTableData = (rows) => {
		const factorsDataGridTableData = {
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
						classes: 'grid-table-cell-right-border',
						styles: {
							'grid-table-cell': { width: '318px' },
						},
					},
					{
						key: 'to_show',
						objPath: ['to_show'],
						columnName: 'Show',
						order: 1,
						cellType: 'checkbox',
						settings: {
							value: null,
						},
						styles: {
							'grid-table-cell': { width: '68px' },
						},
					},
					{
						key: 'override_name',
						objPath: ['override_name'],
						columnName: 'Override Name',
						order: 2,
						cellType: 'text',
						settings: {
							value: null,
							closeOnMouseOut: false,
							isDisabled: false,
						},
						styles: {
							'grid-table-cell': { width: '266px' },
						},
					},
					{
						key: 'tooltip',
						objPath: ['tooltip'],
						columnName: 'Tooltip',
						order: 3,
						cellType: 'text',
						settings: {
							value: null,
							closeOnMouseOut: false,
							isDisabled: false,
						},
						styles: {
							'grid-table-cell': { width: '266px' },
						},
					},
					{
						key: 'default_value',
						objPath: ['default_value'],
						columnName: 'Default Value',
						order: 4,
						cellType: 'multitypeField',
						settings: {
							value: [null, null],
							fieldTypesData: null,
						},
						styles: {
							'grid-table-cell': { width: '266px' },
						},
					},
				],
			},
			components: {
				topPanel: false,
				rowCheckboxes: false,
			},
		}

		const rowObj = metaHelper.recursiveDeepCopy(
			factorsDataGridTableData.templateRow,
			true
		)

		factorsDataGridTableData.header.columns = rowObj.columns.map((column) => {
			const headerCol = {
				key: column.key,
				columnName: column.columnName,
				order: column.order,
				styles: {
					'grid-table-cell': {
						width: column.styles['grid-table-cell'].width,
					},
				},
			}

			if (column.classes) {
				let columnClasses = column.classes
				if (Array.isArray(column.classes))
					columnClasses = [...[], ...columnClasses]

				headerCol.classes = columnClasses
			}

			if (column.key === 'to_show') headerCol.styles['text-align'] = 'center'

			return headerCol
		})

		factorsDataGridTableData.body = rows.map((row, index) => {
			const rowObj = metaHelper.recursiveDeepCopy(
				factorsDataGridTableData.templateRow,
				true
			)

			rowObj.order = index
			rowObj.key = row.key

			const nameCell = gridTableHelperService.getCellFromRowByKey(
				rowObj,
				'name'
			)
			nameCell.settings.value = row.name

			const toShowCell = gridTableHelperService.getCellFromRowByKey(
				rowObj,
				'to_show'
			)
			toShowCell.settings.value = row.to_show

			const overrideNameCell = gridTableHelperService.getCellFromRowByKey(
				rowObj,
				'override_name'
			)
			overrideNameCell.settings.value = row.override_name

			const tooltipCell = gridTableHelperService.getCellFromRowByKey(
				rowObj,
				'tooltip'
			)
			tooltipCell.settings.value = row.tooltip

			const defaultValueCell = gridTableHelperService.getCellFromRowByKey(
				rowObj,
				'default_value'
			)

			if (
				multitypeFieldsForRows[row.key] &&
				multitypeFieldsForRows[row.key].fieldTypesList
			) {
				const cellValue = row.default_value
				const cellValueType = row.default_value_type
				const fields = multitypeFieldsForRows[row.key].fieldTypesList
				const defaultValueCellData =
					gridTableHelperService.getMultitypeFieldDataForCell(
						fields,
						defaultValueCell,
						cellValue,
						cellValueType
					)

				Object.assign(defaultValueCell, defaultValueCellData)
			}

			return rowObj
		})

		return factorsDataGridTableData
	}

	const onFactorsDataTableCellChange = (data) => {
		const cell = vm.factorsDataGridTableDataService.getCellByKey(
			data.row.order,
			data.column.key
		)
		const path = cell.objPath[0]

		vm.factorsData[data.row.order][path] = cell.settings.value

		if (cell.key === 'default_value' && cell.cellType === 'multitypeField') {
			const activeType = cell.settings.fieldTypesData.find(
				(type) => type.isActive
			)
			vm.factorsData[data.row.order].default_value_type = activeType.value_type
		}

		vm.entity.instrument_factor_schedule_data = JSON.stringify(vm.factorsData)
	}

	const createFactorsDataGridTable = (factorsData) => {
		vm.factorsDataGridTableDataService = new GridTableDataService()
		vm.factorsDataGridTableEventService = new GridTableEventService()

		const factorsDataGridTableData = getFactorsDataGridTableData(factorsData)
		vm.factorsDataGridTableDataService.setTableData(factorsDataGridTableData)

		vm.factorsDataGridTableEventService.addEventListener(
			gridTableEvents.CELL_VALUE_CHANGED,
			onFactorsDataTableCellChange
		)
	}
	// <Victor 2021.06.17 fist static grid table>

	// Victor 2021.06.17 second grid table (dynamic)
	const onFactorsOrderChange = (rowData, gtDataService, gtEventService) => {
		const sortedFactors = []

		const tableData = gtDataService.getTableData()
		tableData.body.forEach((row, index) => {
			const factor = vm.entity.instrument_factor_schedules.find(
				({ id }) => id === row.key
			)

			if (factor) {
				factor.button_position = index
				sortedFactors.push(factor)
			} else {
				throw new Error('On factors order change: not found factor ' + row.key)
			}
		})

		vm.entity.instrument_factor_schedules = sortedFactors
	}

	const getFactorsGridTableData = (rows) => {
		const COLUMN_WIDTH = '200px'

		const factorsGridTableData = {
			header: {
				order: 'header',
				columns: [],
			},
			body: [],
			templateRow: {
				isActive: false,
				columns: [
					{
						key: 'effective_date',
						objPath: ['effective_date'],
						columnName: 'Date',
						order: 0,
						cellType: 'multitypeField',
						settings: {
							value: [null, null],
							fieldTypesData: null,
						},
						styles: {
							'grid-table-cell': { width: COLUMN_WIDTH },
						},
					},
					{
						key: 'position_factor_value',
						objPath: ['position_factor_value'],
						columnName: 'Position factor',
						order: 1,
						cellType: 'multitypeField',
						settings: {
							value: [null, null],
							fieldTypesData: null,
						},
						styles: {
							'grid-table-cell': { width: COLUMN_WIDTH },
						},
					},
					{
						key: 'factor_value1',
						objPath: ['factor_value1'],
						columnName: 'Factor 1',
						order: 2,
						cellType: 'multitypeField',
						settings: {
							value: [null, null],
							fieldTypesData: null,
						},
						styles: {
							'grid-table-cell': { width: COLUMN_WIDTH },
						},
					},
					{
						key: 'factor_value2',
						objPath: ['factor_value2'],
						columnName: 'Factor 2',
						order: 3,
						cellType: 'multitypeField',
						settings: {
							value: [null, null],
							fieldTypesData: null,
						},
						styles: {
							'grid-table-cell': { width: COLUMN_WIDTH },
						},
					},
					{
						key: 'factor_value3',
						objPath: ['factor_value3'],
						columnName: 'Factor 3',
						order: 3,
						cellType: 'multitypeField',
						settings: {
							value: [null, null],
							fieldTypesData: null,
						},
						styles: {
							'grid-table-cell': { width: COLUMN_WIDTH },
						},
					},
				],
				methods: {
					onOrderChange: onFactorsOrderChange,
				},
			},

			components: {
				topPanel: {
					filters: false,
					columns: false,
					search: false,
				},
				dragAndDropElement: true,
				rowCheckboxes: true,
			},
		}

		const rowObj = metaHelper.recursiveDeepCopy(
			factorsGridTableData.templateRow,
			true
		)

		// Assemble header
		factorsGridTableData.header.columns = rowObj.columns.map((column) => {
			const headerCol = {
				key: column.key,
				columnName: column.columnName,
				order: column.order,
				styles: {
					'grid-table-cell': {
						width: column.styles['grid-table-cell'].width,
					},
				},
			}

			if (column.classes) {
				let columnClasses = column.classes
				if (Array.isArray(column.classes))
					columnClasses = [...[], ...columnClasses]

				headerCol.classes = columnClasses
			}

			return headerCol
		})

		// Assemble body
		factorsGridTableData.body = rows.map((row, index) => {
			const rowObj = metaHelper.recursiveDeepCopy(
				factorsGridTableData.templateRow,
				true
			)

			rowObj.order = index
			rowObj.key = row.id

			rowObj.columns.forEach((cell) => {
				const { key } = cell
				const fields = multitypeFieldsForRows[key].fieldTypesList
				const cellValue = row[key]
				const cellValueType = row[`${key}_value_type`]
				const { cell: cellData, value_type } =
					gridTableHelperService.getMultitypeFieldDataForCell(
						fields,
						cell,
						cellValue,
						cellValueType
					)

				Object.assign(cell, cellData, value_type)
			})

			return rowObj
		})

		vm.entity.instrument_factor_schedules.forEach(function (factor, index) {
			factor.button_position = index
			factorsGridTableData.body[index].order = index
		})

		vm.factorsGridTableDataService.setTableData(factorsGridTableData)

		return factorsGridTableData
	}

	const onFactorsTableCellChange = (data) => {
		const cell = vm.factorsGridTableDataService.getCellByKey(
			data.row.order,
			data.column.key
		)
		const path = cell.objPath[0]
		const activeType = cell.settings.fieldTypesData.find(
			(type) => type.isActive
		)

		vm.entity.instrument_factor_schedules[data.row.order][path] =
			cell.settings.value
		vm.entity.instrument_factor_schedules[data.row.order][
			`${path}_value_type`
		] = activeType.value_type
	}

	const onFactorsTableAddRow = () => {
		const gridTableData = vm.factorsGridTableDataService.getTableData()
		const newRow = gridTableData.body[0]

		const newFactor = {
			effective_date: null,
			effective_date_value_type: 40,
			position_factor_value: null,
			position_factor_value_value_type: 20,
			factor_value1: null,
			factor_value1_value_type: 20,
			factor_value2: null,
			factor_value2_value_type: 20,
			factor_value3: null,
			factor_value3_value_type: 20,
			button_position: '',
			frontOptions: {
				newRow: true,
				gtKey: metaHelper.generateUniqueId('instrumentTypeFactorId'),
			},
		}

		vm.entity.instrument_factor_schedules.unshift(newFactor)

		newRow.columns.forEach((cell) => {
			const { key } = cell
			const fields = multitypeFieldsForRows[key].fieldTypesList
			const cellValue = newRow[key]
			const cellValueType = newRow[`${key}_value_type`]
			const { cell: cellData, value_type } =
				gridTableHelperService.getMultitypeFieldDataForCell(
					fields,
					cell,
					cellValue,
					cellValueType
				)

			Object.assign(cell, cellData, value_type)
		})

		vm.entity.instrument_factor_schedules.forEach(function (factor, index) {
			factor.button_position = index
			gridTableData.body[index].order = index
		})

		vm.factorsGridTableDataService.setTableData(gridTableData)
	}

	const onFactorsTableDeleteRow = (data) => {
		const gridTableData = vm.factorsGridTableDataService.getTableData()
		vm.entity.instrument_factor_schedules =
			vm.entity.instrument_factor_schedules.filter((factor) => {
				const factorId = factor.id || factor.frontOptions.gtKey
				return !data.deletedRowsKeys.includes(factorId)
			})

		vm.entity.instrument_factor_schedules.forEach(function (factor, index) {
			factor.button_position = index
			gridTableData.body[index].order = index
		})
	}

	const createFactorsGridTable = (factors) => {
		vm.factorsGridTableDataService = new GridTableDataService()
		vm.factorsGridTableEventService = new GridTableEventService()

		const factorsGridTableData = getFactorsGridTableData(factors)
		vm.factorsGridTableDataService.setTableData(factorsGridTableData)

		vm.factorsGridTableEventService.addEventListener(
			gridTableEvents.CELL_VALUE_CHANGED,
			onFactorsTableCellChange
		)
		vm.factorsGridTableEventService.addEventListener(
			gridTableEvents.ROW_ADDED,
			onFactorsTableAddRow
		)
		vm.factorsGridTableEventService.addEventListener(
			gridTableEvents.ROW_DELETED,
			onFactorsTableDeleteRow
		)
	}
	// <Victor 2021.06.17 second grid table (dynamic)>

	const getInstrumentAttrTypes = function () {
		let options = {
			pageSize: 1000,
			page: 1,
		}

		return metaService.loadDataFromAllPages(
			instrumentAttributeTypeService.getList,
			[options]
		)
	}

	const init = function () {
		vm.factorsData = getFactorsData()

		if (!vm.entity.instrument_factor_schedule_data) {
			vm.entity.instrument_factor_schedule_data = JSON.stringify(vm.factorsData)
		}

		if (!vm.entity.instrument_factor_schedules) {
			vm.entity.instrument_factor_schedules = []
		}

		getInstrumentAttrTypes().then((data) => {
			// inject instrument attributes to menu options in multitype fields
			const instrumentAttrTypes = data
			multitypeFieldService.fillSelectorOptionsBasedOnValueType(
				instrumentAttrTypes,
				multitypeFieldsForRows
			)

			createFactorsDataGridTable(vm.factorsData) // First table (static)
			createFactorsGridTable(vm.entity.instrument_factor_schedules) // Second table (dynamic)

			vm.readyStatus.factors = true
		})
	}

	init()
}
