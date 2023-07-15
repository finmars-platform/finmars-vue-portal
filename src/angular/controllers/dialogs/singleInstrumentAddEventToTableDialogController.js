/**
 * Created by vzubr on 01.10.2020.
 */

import gridTableEvents from '../../services/gridTableEvents'

import GridTableDataService from '../../services/gridTableDataService'
import GridTableEventService from '../../services/gridTableEventService'

import metaHelper from '../../helpers/meta.helper'
// import gridTableHelperService from '../../helpers/gridTableHelperService';

export default function singleInstrumentAddEventToTableDialogController(
	$scope,
	$mdDialog,
	instrumentService,
	transactionTypeService,
	gridTableHelperService,
	multitypeFieldService,
	data
) {
	let vm = this

	vm.readyStatus = {
		actionsGridTable: false,
	}

	vm.event = data.event

	var eventHasId =
		vm.event.hasOwnProperty('id') ||
		(vm.event.frontOptions && vm.event.frontOptions.hasOwnProperty('gtKey'))
	vm.regime = eventHasId ? 'edition' : 'addition'

	vm.eventClasses = data.eventClasses
	vm.notificationClasses = data.notificationClasses
	vm.periodicityItems = data.periodicityItems

	vm.transactionTypes = []

	const instrAttrTypes = data.instrumentAttrTypes
	let multitypeFieldsData =
		instrumentService.getInstrumentEventsMultitypeFieldsData()

	const getRangeOfNumbers = function (number) {
		var buttonPositions = [
			{
				id: 1,
				name: 1,
			},
		]

		for (var i = 2; i <= number; i++) {
			buttonPositions.push({ id: i, name: i })
		}

		return buttonPositions
	}

	const onActionsTableAddRow = function () {
		var newRow = vm.eventActionsGridTableData.body[0]

		var newAction = {
			transaction_type: '',
			text: '',
			is_sent_to_pending: false,
			is_book_automatic: false,
			button_position: '',
			frontOptions: { newRow: true, gtKey: newRow.key },
		}

		vm.event.actions.unshift(newAction)

		var transactionType = gridTableHelperService.getCellFromRowByKey(
			newRow,
			'transaction_type'
		)
		transactionType.settings.selectorOptions = vm.transactionTypes.map(
			getTTypesAsSelectorOptions
		)

		// Update rows in actions grid table
		vm.event.actions.forEach(function (action, actionIndex) {
			action.button_position = actionIndex
			vm.eventActionsGridTableData.body[actionIndex].order = actionIndex
		})
	}

	const onActionsTableDeleteRows = function (data) {
		vm.event.actions = vm.event.actions.filter(function (action) {
			var actionId = action.id || action.frontOptions.gtKey
			return data.deletedRowsKeys.indexOf(actionId) === -1
		})

		// Update rows in actions grid table
		vm.event.actions.forEach(function (action, actionIndex) {
			action.button_position = actionIndex
			vm.eventActionsGridTableData.body[actionIndex].order = actionIndex
		})
	}

	const onActionsTableCellValueChanged = function (argObj) {
		var rowOrder = argObj.row.order,
			colOrder = argObj.column.order

		gridTableHelperService.onGridTableCellChange(
			vm.event.actions,
			vm.eventActionsGridTableDataService,
			rowOrder,
			colOrder
		)
	}

	const openEventActionParametersManager = function ($event, row) {
		var action = vm.event.actions[row.order]



		if (!vm.event.data) {
			vm.event.data = {}
		}

		if (!vm.event.data.parameters) {
			vm.event.data.parameters = []
		}

		$mdDialog
			.show({
				controller: 'InstrumentEventActionParameterDialogController as vm',
				templateUrl:
					'views/dialogs/instrument-event-action-parameter-dialog-view.html',
				parent: angular.element(document.body),
				targetEvent: $event,
				preserveScope: true,
				autoWrap: true,
				multiple: true,
				skipHide: true,
				locals: {
					data: {
						eventParameters: vm.event.data['parameters'],
						item: action,
					},
				},
			})
			.then((res) => {
				if (res.status === 'agree') {
					vm.event.actions[row.order] = res.data.item
				}
			})
	}

	const onActionsOrderChange = function (
		rowData,
		gtDataService,
		gtEventService
	) {
		const tableData = gtDataService.getTableData()
		const sortedActions = []

		tableData.body.forEach((row, rowIndex) => {
			const action = vm.event.actions.find((action) => {
				if (action.id || action.id === 0) return row.key === action.id

				return row.key === action.frontOptions.gtKey
			})

			if (action) {
				action.button_position = rowIndex
				sortedActions.push(action)
			}
		})

		vm.event.actions = sortedActions
	}

	const getTTypesAsSelectorOptions = (ttype) => {
		return { id: ttype.user_code, name: ttype.short_name }
	}

	// Event actions grid table
	vm.eventActionsGridTableData = {
		header: {
			order: 'header',
			columns: [],
		},
		body: [],
		templateRow: {
			isActive: false,
			columns: [
				{
					key: 'transaction_type',
					objPath: ['transaction_type'],
					columnName: 'Transaction type',
					order: 0,
					cellType: 'selector',
					settings: {
						value: null,
						selectorOptions: [],
					},
					methods: {
						onChange: function (
							rowData,
							colData,
							gtDataService,
							gtEventService
						) {
							let paramsCell = gtDataService.getCellByKey(
								rowData.order,
								'parameters'
							)
							paramsCell.settings.isDisabled = false
						},
					},
					styles: {
						'grid-table-cell': { width: '342px' },
					},
				},
				{
					key: 'text',
					objPath: ['text'],
					columnName: 'Text',
					order: 1,
					cellType: 'expression',
					settings: {
						value: null,
						exprData: null,
						closeOnMouseOut: false,
					},
					styles: {
						'grid-table-cell': { width: '280px' },
					},
				},
				{
					key: 'is_sent_to_pending',
					objPath: ['is_sent_to_pending'],
					columnName: 'Sent to pending',
					order: 2,
					cellType: 'checkbox',
					settings: {
						value: null,
					},
					styles: {
						'grid-table-cell': { width: '130px' },
					},
				},
				{
					key: 'is_book_automatic',
					objPath: ['is_book_automatic'],
					columnName: 'Book automatic',
					order: 3,
					cellType: 'checkbox',
					settings: {
						value: null,
					},
					styles: {
						'grid-table-cell': { width: '130px' },
					},
				},
				{
					key: 'parameters',
					order: 3,
					cellType: 'button',
					settings: {
						buttonContent: 'OPEN MANAGER',
						isDisabled: true,
					},
					methods: {
						onClick: openEventActionParametersManager,
					},
					styles: {
						'grid-table-cell': { width: '158px' },
					},
				},
			],
			methods: {
				onOrderChange: onActionsOrderChange,
			},
		},

		components: {
			topPanel: {
				addButton: true,
				filters: false,
				columns: false,
				search: false,
			},
			dragAndDropElement: true,
			rowCheckboxes: true,
		},
	}

	const formatDataForActionsGridTable = function () {
		//region Assemble header columns
		var rowObj = metaHelper.recursiveDeepCopy(
			vm.eventActionsGridTableData.templateRow,
			true
		)

		vm.eventActionsGridTableData.header.columns = rowObj.columns.map(function (
			column
		) {
			var headerData = {
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

			if (
				column.key === 'is_sent_to_pending' ||
				column.key === 'is_book_automatic'
			) {
				// Object.assign(headerData.styles['grid-table-cell'], {'text-align': 'center'});
				headerData.styles['grid-table-cell']['text-align'] = 'center'
			}

			return headerData
		})
		//endregion

		//region assemble body rows
		vm.event.actions.forEach(function (action, actionIndex) {
			action.button_position = actionIndex

			rowObj = metaHelper.recursiveDeepCopy(
				vm.eventActionsGridTableData.templateRow,
				true
			)
			rowObj.key = action.id || action.frontOptions.gtKey
			rowObj.newRow = !!(rowObj.frontOptions && rowObj.frontOptions.newRow)
			rowObj.order = actionIndex

			var transactionType = gridTableHelperService.getCellFromRowByKey(
				rowObj,
				'transaction_type'
			)
			transactionType.settings.value = action.transaction_type
			transactionType.settings.selectorOptions = vm.transactionTypes.map(
				getTTypesAsSelectorOptions
			)

			var text = gridTableHelperService.getCellFromRowByKey(rowObj, 'text')

			text.settings.exprData = {
				groups: [],
				functions: [],
			}

			text.settings.value = action.text

			var isSendToPending = gridTableHelperService.getCellFromRowByKey(
				rowObj,
				'is_sent_to_pending'
			)
			isSendToPending.settings.value = action.is_sent_to_pending

			var isBookAutomatic = gridTableHelperService.getCellFromRowByKey(
				rowObj,
				'is_book_automatic'
			)
			isBookAutomatic.settings.value = action.is_book_automatic

			var parameters = gridTableHelperService.getCellFromRowByKey(
				rowObj,
				'parameters'
			)
			parameters.settings.isDisabled = false

			vm.eventActionsGridTableData.body.push(rowObj)
		})
		//endregion
	}
	// < Event actions grid table >

	const initGridTableEvents = function () {
		vm.eventActionsGridTableEventService.addEventListener(
			gridTableEvents.ROW_ADDED,
			onActionsTableAddRow
		)

		vm.eventActionsGridTableEventService.addEventListener(
			gridTableEvents.CELL_VALUE_CHANGED,
			onActionsTableCellValueChanged
		)

		vm.eventActionsGridTableEventService.addEventListener(
			gridTableEvents.ROW_DELETED,
			onActionsTableDeleteRows
		)
	}

	const collectDataFromMultitypeFields = function () {
		Object.keys(multitypeFieldsData).forEach((fieldKey) => {
			const fieldData = multitypeFieldsData[fieldKey]
			const activeType = fieldData.fieldTypesList.find((type) => type.isActive)

			vm.event[fieldKey] = activeType.model
			vm.event[fieldKey + '_value_type'] = activeType.value_type
		})
	}

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.agree = function () {
		collectDataFromMultitypeFields()

		$mdDialog.hide({
			status: 'agree',
			data: {
				event: vm.event,
			},
		})
	}

	const getTransactionTypes = function () {
		let ttypeList = []

		let options = {
			pageSize: 1000,
			page: 1,
		}

		const loadAllPages = (resolve, reject) => {
			transactionTypeService
				.getListLight(options)
				.then(function (data) {
					ttypeList = ttypeList.concat(data.results)

					if (data.next) {
						options.page = options.page + 1
						loadAllPages(resolve, reject)
					} else {
						resolve(ttypeList)
					}
				})
				.catch((error) => reject(error))
		}

		return new Promise((resolve, reject) => {
			loadAllPages(resolve, reject)
		})
	}

	vm.openParametersManager = function ($event) {
		$mdDialog
			.show({
				controller: 'InstrumentEventParameterDialogController as vm',
				templateUrl:
					'views/dialogs/instrument-event-parameter-dialog-view.html',
				parent: angular.element(document.body),
				targetEvent: $event,
				preserveScope: true,
				autoWrap: true,
				multiple: true,
				skipHide: true,
				locals: {
					data: {
						instrumentAttrTypes: instrAttrTypes,
						item: vm.event,
					},
				},
			})
			.then((res) => {
				if (res.status === 'agree') {
					vm.event = res.data.item
				}
			})
	}

	vm.init = function () {
		multitypeFieldService.fillSelectorOptionsBasedOnValueType(
			instrAttrTypes,
			multitypeFieldsData
		)

		vm.effectiveDateFieldTypes =
			multitypeFieldsData.effective_date.fieldTypesList
		multitypeFieldService.setActiveTypeByValueType(
			vm.effectiveDateFieldTypes,
			vm.event.effective_date,
			vm.event.effective_date_value_type
		)

		vm.finalDateFieldTypes = multitypeFieldsData.final_date.fieldTypesList
		multitypeFieldService.setActiveTypeByValueType(
			vm.finalDateFieldTypes,
			vm.event.final_date,
			vm.event.final_date_value_type
		)

		vm.periodicityNFieldTypes = multitypeFieldsData.periodicity_n.fieldTypesList
		multitypeFieldService.setActiveTypeByValueType(
			vm.periodicityNFieldTypes,
			vm.event.periodicity_n,
			vm.event.periodicity_n_value_type
		)

		vm.eventActionsGridTableDataService = new GridTableDataService()
		vm.eventActionsGridTableEventService = new GridTableEventService()

		initGridTableEvents()

		// transactionTypeService.getListLight({pageSize: 1000}).then(function (data) {
		getTransactionTypes().then((data) => {
			// vm.transactionTypes = data.results;
			vm.transactionTypes = data || []

			formatDataForActionsGridTable()

			vm.eventActionsGridTableDataService.setTableData(
				vm.eventActionsGridTableData
			)

			vm.readyStatus.actionsGridTable = true

			$scope.$apply()
		})
	}

	vm.init()
}
