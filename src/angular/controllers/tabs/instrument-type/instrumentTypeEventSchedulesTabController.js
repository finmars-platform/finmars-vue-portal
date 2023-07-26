/**
 * Created by szhitenev on 18.02.2021.
 */

import metaService from '@/angular/services/metaService'
import metaNotificationClassService from '@/angular/services/metaNotificationClassService'
import metaEventClassService from '@/angular/services/metaEventClassService'
import instrumentPeriodicityService from '@/angular/services/instrumentPeriodicityService'
import GridTableDataService from '@/angular/services/gridTableDataService'
import EventService from '@/angular/services/eventService'
// import GridTableEventService from '@/angular/services/gridTableEventService';
import instrumentAttributeTypeService from '@/angular/services/instrument/instrumentAttributeTypeService'

import gridTableEvents from '@/angular/services/gridTableEvents'
// import popupEvents from '@/angular/services/events/popupEvents';
import evEditorEvents from '@/angular/services/ev-editor/entityViewerEditorEvents'

import metaHelper from '@/angularlpers/meta.helper'

/* const eventObj = {
        "name": '',
        "description": "",
        "notification_class": '',
        "notify_in_n_days": '',
        "periodicity": '',
        "periodicity_n": '',
        "action_is_sent_to_pending": null,
        "action_is_book_automatic": null,
        "actions": [],
        "effective_date": null,
        "final_date": null,
        "event_class": null
    }; */

export default function instrumentTypeEventSchedulesTabController(
	$scope,
	$mdDialog,
	instrumentService,
	transactionTypeService,
	multitypeFieldService,
	gridTableHelperService
) {
	let vm = this
	// const gridTableHelperService = new GridTableHelperService();

	vm.entity = $scope.$parent.vm.entity
	vm.entityType = 'instrument-type'
	if (!vm.entity.events) vm.entity.events = []

	vm.evEditorDataService = $scope.$parent.vm.evEditorDataService
	vm.evEditorEventService = $scope.$parent.vm.evEditorEventService
	vm.onEntityChange = $scope.$parent.vm.onEntityChange

	vm.readyStatus = {
		notificationClasses: false,
		eventClasses: false,
		eventSchedulesReady: false,
		gritTable: false,
	}

	vm.evEditorFieldEvent = {}
	vm.transactionTypes = []

	//<editor-fold desc="Accordiion actions menu">
	vm.accordionActionsMenu =
		'<div class="ev-editor-tabs-popup-content popup-menu">' +
		'<md-button class="entity-tabs-menu-option popup-menu-option" ' +
		'ng-click="popupData.deletePane(popupData.item, $event, _$popup)">DELETE</md-button>' +
		'</div>' +
		'<div class="ev-editor-tabs-popup-content popup-menu">' +
		'<md-button class="entity-tabs-menu-option popup-menu-option" ' +
		'ng-click="popupData.makeCopy(popupData.item, _$popup)">MAKE COPY</md-button>' +
		'</div>'
	//</editor-fold>

	vm.selectorOptionsMap = {
		notification_class: [],
		periodicity: [],
	}

	const entityAttrs = $scope.$parent.vm.entityAttrs
	vm.maturityDateAttr = entityAttrs.find(
		(eAttr) => eAttr.key === 'maturity_date'
	)
	vm.maturityPriceAttr = entityAttrs.find(
		(eAttr) => eAttr.key === 'maturity_price'
	)

	const getTransactionTypes = function () {
		let options = {
			pageSize: 1000,
			page: 1,
		}

		return metaService.loadDataFromAllPages(
			transactionTypeService.getListLight,
			[options]
		)
	}

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

	var getNotificationClasses = metaNotificationClassService
		.getList()
		.then(function (data) {
			// vm.notificationClasses = data;
			vm.selectorOptionsMap.notification_class = data
			vm.readyStatus.notificationClasses = true
		})

	var getEventClasses = metaEventClassService.getList().then(function (data) {
		vm.eventClasses = data
		vm.readyStatus.eventClasses = true
	})

	var getInstrumentPeriodicityItems = instrumentPeriodicityService
		.getList()
		.then(function (data) {
			// vm.periodicityItems = data;
			vm.selectorOptionsMap.periodicity = data
			vm.readyStatus.periodicityItems = true
		})

	let instrumentAttrTypes

	const multitypeFieldsForRows =
		instrumentService.getInstrumentEventsMultitypeFieldsData()

	/* const getMultitypeFieldDataForDefaultValue = (rowKey, value, valueType) => {

			const multitypeData = JSON.parse(JSON.stringify(multitypeFieldsForRows[rowKey].fieldDataList));

			if (valueType) {

				multitypeData.forEach((type) => {

					if (type.value_type === valueType) {

						type.model = value;
						type.isActive = true;

					} else {
						type.isActive = false;
					}

				});

			}

			return multitypeData;

		}; */

	vm.checkReadyStatus = function () {
		return (
			vm.readyStatus.notificationClasses &&
			vm.readyStatus.eventClasses &&
			vm.readyStatus.eventSchedulesReady
		)
	}

	/* const onDefaultValueMultitypeFieldChange = function (rowData, colData, gtDataService) {

			const changedCell = gtDataService.getCell(rowData.order, colData.order);
			const activeType = changedCell.settings.fieldTypesData.find(type => type.isActive);

			const tableData = gtDataService.getTableData();

			vm.entity.events[tableData.order].data[tableData.eventItemsType][rowData.order].default_value_type = activeType.value_type;

		}; */

	const findEventById = (event, eventId) => {
		if (event.id || event.id === 0) return event.id === eventId

		return event.frontOptions.id === eventId
	}

	/**
	 *
	 * @param data {{row: Object, column: Object}} - data about changed cell
	 * @param gtDataService {Object}
	 * @param gtEventService {Object}
	 * @param eventItemsType {string} - can be 'items' or 'blockedItems'.
	 */
	const onEventTableCellChange = function (
		data,
		gtDataService,
		gtEventService,
		eventItemsType
	) {
		const tableData = gtDataService.getTableData()
		const cell = gtDataService.getCellByKey(data.row.order, data.column.key)
		const path = cell.objPath[0]

		let event = vm.entity.events.find((event) =>
			findEventById(event, tableData.eventId)
		)

		event.data[eventItemsType][data.row.order][path] = cell.settings.value

		vm.onRequiredFieldChange('events')

		if (cell.key === 'default_value' && cell.cellType === 'multitypeField') {
			const activeType = cell.settings.fieldTypesData.find(
				(type) => type.isActive
			)
			event.data[eventItemsType][data.row.order].default_value_type =
				activeType.value_type
		}
	}

	const getEventsGridTableData = function (rows, eventItemsType) {
		// const rows = item.data.items;

		const eventsGridTableData = {
			header: false,
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
						key: 'default_value',
						objPath: ['default_value'],
						columnName: 'Default Value',
						order: 2,
						cellType: 'selector',
						settings: {
							value: null,
							selectorOptions: [],
						},
						styles: {
							'grid-table-cell': { width: '266px' },
						},
					},
					{
						key: 'override_name',
						objPath: ['override_name'],
						columnName: 'Override Name',
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
						key: 'tooltip',
						objPath: ['tooltip'],
						columnName: 'Tooltip',
						order: 4,
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
						key: 'options_settings',
						columnName: '',
						order: 5,
						cellType: 'empty',
						styles: {
							'grid-table-cell': { width: '48px' },
						},
					},
				],
			},
			components: {
				topPanel: false,
				rowCheckboxes: false,
			},
		}

		var optionsColumn = {
			key: 'options_settings',
			objPath: ['options_settings'],
			columnName: '',
			order: 5,
			cellType: 'customPopup',
			settings: {
				value: null,
				closeOnMouseOut: false,
				// cellText: '<span class="material-icons three-dots-btn">more_horiz</span>',
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
		}

		if (eventItemsType === 'items') {
			eventsGridTableData.header = {
				order: 'header',
				columns: [],
			}

			const rowObj = metaHelper.recursiveDeepCopy(
				eventsGridTableData.templateRow,
				true
			)

			eventsGridTableData.header.columns = rowObj.columns.map((column) => {
				const headerCol = {
					key: column.key,
					columnName: column.columnName,
					order: column.order,
					classes: column.classes,
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
		}

		eventsGridTableData.body = rows.map((row, index) => {
			const rowObj = metaHelper.recursiveDeepCopy(
				eventsGridTableData.templateRow,
				true
			)

			rowObj.order = index
			rowObj.newRow = !!(rowObj.frontOptions && rowObj.frontOptions.newRow)
			rowObj.key = row.key

			rowObj.columns[0].settings.value = row.name
			rowObj.columns[1].settings.value = row.to_show

			rowObj.columns[2].cellType = row.defaultValueType
			rowObj.columns[2].settings.value = row.default_value

			if (row.defaultValueType === 'selector') {
				rowObj.columns[2].settings.selectorOptions =
					vm.selectorOptionsMap[row.key]
			} else if (row.defaultValueType === 'multitypeField') {
				rowObj.columns[2].cellType = 'multitypeField'
				/*
					// const multitypeFieldData = getMultitypeFieldDataForDefaultValue(rowObj.key, row.default_value, row.default_value_type);
					const fieldTypesList = JSON.parse(JSON.stringify(multitypeFieldsForRows[rowObj.key].fieldTypesList));
					const fieldTypesData = multitypeFieldService.setActiveTypeByValueType(fieldTypesList, row.default_value, row.default_value_type);

					rowObj.columns[2].settings = {
						value: row.default_value,
						fieldTypesData: fieldTypesData
					};
					*/

				// const fieldTypesList = JSON.parse(JSON.stringify(multitypeFieldsForRows[rowObj.key].fieldTypesList));
				const cellData = gridTableHelperService.getMultitypeFieldDataForCell(
					multitypeFieldsForRows[rowObj.key].fieldTypesList,
					rowObj.columns[2],
					row.default_value,
					row.default_value_type
				)

				rowObj.columns[2] = cellData.cell
				row.default_value_type = cellData.value_type
			}

			rowObj.columns[3].settings.value = row.override_name
			rowObj.columns[4].settings.value = row.tooltip

			if (row.options_settings) {
				const optionsCell = metaHelper.recursiveDeepCopy(optionsColumn, false)

				rowObj.columns[5] = optionsCell
				rowObj.columns[5].settings.value = row.options_settings
			}

			return rowObj
		})

		return eventsGridTableData
	}

	const getTTypesAsSelectorOptions = (ttype) => {
		return { id: ttype.user_code, name: ttype.short_name }
	}

	const openEventActionParametersManager = function (
		$event,
		row,
		column,
		gtDataService
	) {
		var tableData = gtDataService.getTableData()

		let event = vm.entity.events.find((event) =>
			findEventById(event, tableData.eventId)
		)
		var action = event.data.actions[row.order]



		if (!event.data) {
			event.data = {}
		}

		if (!event.data.parameters) {
			event.data.parameters = []
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
						eventParameters: event.data['parameters'],
						item: action,
					},
				},
			})
			.then((res) => {


				if (res.status === 'agree') {
					event.data.actions[row.order] = res.data.item
				}
			})
	}

	const getEventsActionGridTableData = function (item) {
		const rows = item.data.actions

		const eventActionsGridTableData = {
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
							// selectorOptions: vm.transactionTypes,
							selectorOptions: [],
						},
						styles: {
							'grid-table-cell': { width: '365px' },
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
							'grid-table-cell': { width: '387px' },
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
							gtDataService: item.eventActionsGridTableDataService, // TODO maybe a crutch
						},
						methods: {
							onClick: openEventActionParametersManager,
						},
						styles: {
							'grid-table-cell': { width: '158px' },
						},
					},
					/* {
                            key: 'button_position',
                            objPath: ['button_position'],
                            columnName: 'Button position',
                            order: 4,
                            cellType: 'selector',
                            settings: {
                                value: null,
                                selectorOptions: getRangeOfNumbers(item.data.actions.length),
                            },
                            styles: {
                                'grid-table-cell': {'width': '130px'}
                            }
                        }, */
				],
				methods: {
					onOrderChange: onActionsOrderChange,
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
			eventActionsGridTableData.templateRow,
			true
		)
		eventActionsGridTableData.header.columns = rowObj.columns.map((column) => {
			return {
				key: column.key,
				columnName: column.columnName,
				order: column.order,
				styles: {
					'grid-table-cell': {
						width: column.styles['grid-table-cell'].width,
					},
				},
			}
		})

		eventActionsGridTableData.body = rows.map((row, index) => {
			const rowObj = metaHelper.recursiveDeepCopy(
				eventActionsGridTableData.templateRow,
				true
			)

			rowObj.order = index
			rowObj.key = index // instrument type event actions don't have id
			if (row.frontOptions && row.frontOptions.gtKey)
				rowObj.key = row.frontOptions.gtKey

			rowObj.columns[0].settings.value = row.transaction_type
			rowObj.columns[0].settings.selectorOptions = vm.transactionTypes.map(
				getTTypesAsSelectorOptions
			)

			// rowObj.columns[1].settings.value = row.text;
			let textCol = gridTableHelperService.getCellFromRowByKey(rowObj, 'text')
			textCol.settings.value = row.text

			textCol.settings.exprData = {
				groups: [],
				functions: [],
			}

			rowObj.columns[2].settings.value = row.is_sent_to_pending
			rowObj.columns[3].settings.value = row.is_book_automatic
			// rowObj.columns[4].settings.value = row.button_position;

			return rowObj
		})

		return eventActionsGridTableData
	}

	vm.moveDown = function (item, $event) {
		$event.stopPropagation()

		if (vm.entity.events[item.order + 1]) {
			var swap = item

			vm.entity.events[item.order] = vm.entity.events[item.order + 1]
			vm.entity.events[item.order].order = item.order

			vm.entity.events[item.order + 1] = swap
			vm.entity.events[item.order + 1].order = item.order + 1
		}
	}

	vm.moveUp = function (item, $event) {
		$event.stopPropagation()

		if (vm.entity.events[item.order - 1]) {
			const swap = item

			vm.entity.events[item.order] = vm.entity.events[item.order - 1]
			vm.entity.events[item.order].order = item.order

			vm.entity.events[item.order - 1] = swap
			vm.entity.events[item.order - 1].order = item.order - 1
		}
	}

	vm.deletePane = function (item, $event, _$popup) {
		$event.stopPropagation()

		var description = 'Are you sure to delete this action?'

		$mdDialog
			.show({
				controller: 'WarningDialogController as vm',
				templateUrl: 'views/dialogs/warning-dialog-view.html',
				parent: angular.element(document.body),
				targetEvent: $event,
				preserveScope: true,
				autoWrap: true,
				multiple: true,
				skipHide: true,
				locals: {
					warning: {
						title: 'Warning',
						description: description,
					},
				},
			})
			.then((res) => {
				if (res.status === 'agree') {
					vm.entity.events.splice(item.order, 1)
					vm.entity.events.forEach(
						(eventItem, index) => (eventItem.order = index)
					)
				}
			})

		_$popup.cancel()
	}

	vm.makeCopy = function (eventToCopy, _$popup) {
		_$popup.cancel()
		vm.eventsAccordion.collapseAll()

		const eventOrder = eventToCopy.order
		const eventCopy = JSON.parse(angular.toJson(eventToCopy))

		delete eventCopy.id
		if (!eventCopy.frontOptions) eventCopy.frontOptions = {}
		eventCopy.frontOptions.id = metaHelper.generateUniqueId(eventOrder)

		let eventCopyName = eventToCopy.name + ' (Copy)'

		let a = 0,
			nameOccupied = true
		while (nameOccupied) {
			// check that copy name is unique

			nameOccupied = false

			const copyWithSameName = vm.entity.events.find(
				(event) => event.name === eventCopyName
			)

			if (copyWithSameName) {
				a++

				eventCopyName = eventToCopy.name + ' (Copy ' + a + ')'
				nameOccupied = true
			}
		}

		eventCopy.name = eventCopyName

		formatExistingEvent(eventCopy, eventCopy.order)

		vm.entity.events.splice(eventOrder + 1, 0, eventCopy)
		vm.entity.events.forEach((event, index) => (event.order = index))
	}

	/** @param fieldKey {string} - property inside entity object, that was changed */
	vm.onRequiredFieldChange = function (fieldKey) {
		const locsWithErrors = vm.evEditorDataService.getLocationsWithErrors()

		if (locsWithErrors['system_tab'].hasOwnProperty('events')) {
			vm.onEntityChange(fieldKey)
		}
	}

	/**
	 *
	 * @param event {Object} - event data for frontend
	 * @param rows {Array} - event data from backend
	 * @param gtDataService {Object}
	 * @param gtEventService {Object}
	 * @param eventItemsType {String} - can be "items" or "blockedItems"
	 */
	const formatDataForEventGridTable = function (
		event,
		rows,
		gtDataService,
		gtEventService,
		eventItemsType
	) {
		const gridTableData = getEventsGridTableData(rows, eventItemsType)

		gridTableData.eventId =
			event.id || event.id === 0 ? event.id : event.frontOptions.id
		gridTableData.eventItemsType = eventItemsType

		gtDataService.setTableData(gridTableData)

		gtEventService.addEventListener(
			gridTableEvents.CELL_VALUE_CHANGED,
			(argumentsObj) => {
				onEventTableCellChange(
					argumentsObj,
					gtDataService,
					gtEventService,
					eventItemsType
				)
			}
		)
	}

	const formatDataForEventActionsGridTable = function (event) {
		const eventsActionGridTableData = getEventsActionGridTableData(event)
		eventsActionGridTableData.eventId =
			event.id || event.id === 0 ? event.id : event.frontOptions.id

		event.eventActionsGridTableDataService.setTableData(
			eventsActionGridTableData
		)

		event.eventActionsGridTableEventService.addEventListener(
			gridTableEvents.ROW_ADDED,
			function () {
				onActionsTableAddRow(
					event,
					event.eventActionsGridTableDataService,
					event.eventActionsGridTableEventService
				)
			}
		)

		event.eventActionsGridTableEventService.addEventListener(
			gridTableEvents.CELL_VALUE_CHANGED,
			function (data) {
				onActionsTableCellValueChanged(
					data,
					event,
					event.eventActionsGridTableDataService,
					event.eventActionsGridTableEventService
				)
			}
		)

		event.eventActionsGridTableEventService.addEventListener(
			gridTableEvents.ROW_DELETED,
			function (data) {
				onActionsTableDeleteRows(
					data,
					event,
					event.eventActionsGridTableDataService,
					event.eventActionsGridTableEventService
				)
			}
		)
	}

	/* vm.toggleEventBlockableItems = function (item) {

			const tableData = item.eventItems2GridTableDataService.getTableData();

			tableData.body.forEach(row => {

				row.columns.forEach(col => {
					if (col.settings) col.settings.isDisabled = item.data.items_blocked;
				});

			});

			item.eventItems2GridTableDataService.setTableData(tableData);

		}; */
	vm.onAutogenerateToggle = function ($event, item) {
		if (!item.autogenerate) item.data.get_items2_from_accruals = false
	}

	vm.createInstrumentTypeEvent = function () {
		const mapOptions = function (item) {
			return {
				user_code: item.user_code,
				id: item.id,
				name: item.name,
				to_show: true,
				override_name: '',
			}
		}

		// var periodicitySelectorOptions = vm.periodicityItems.map(mapOptions);
		var periodicitySelectorOptions =
			vm.selectorOptionsMap.periodicity.map(mapOptions)
		// var notificationClassesSelectorOptions = vm.notificationClasses.map(mapOptions)
		var notificationClassesSelectorOptions =
			vm.selectorOptionsMap.notification_class.map(mapOptions)

		var event = {
			eventItemsGridTableDataService: new GridTableDataService(),
			eventItemsGridTableEventService: new EventService(),

			eventItems2GridTableDataService: new GridTableDataService(),
			eventItems2GridTableEventService: new EventService(),

			eventActionsGridTableDataService: new GridTableDataService(),
			eventActionsGridTableEventService: new EventService(),

			frontOptions: {
				id: metaHelper.generateUniqueId(vm.entity.events.length),
			},
			order: vm.entity.events.length,
			autogenerate: true,
			data: {
				form_message: '',
				event_class: null,
				items: [
					{
						key: 'name',
						name: 'Title',
						to_show: true,
						defaultValueType: 'text',
					},
					{
						key: 'description',
						name: 'Message text',
						to_show: true,
						defaultValueType: 'text',
					},
					{
						key: 'notification_class',
						name: 'Notification Class',
						to_show: true,
						defaultValueType: 'selector',
						options_settings: notificationClassesSelectorOptions,
					},
					{
						key: 'notify_in_n_days',
						name: 'Notify in N days',
						to_show: true,
						defaultValueType: 'number',
					},
				],
				// blockableItems: [
				items2: [
					{
						key: 'effective_date',
						name: 'Effective Date',
						to_show: true,
						defaultValueType: 'multitypeField',
					},
					{
						key: 'final_date',
						name: 'Final Date',
						to_show: true,
						defaultValueType: 'multitypeField',
					},
					{
						key: 'periodicity',
						name: 'Periodicity',
						to_show: true,
						defaultValueType: 'selector',
						options_settings: periodicitySelectorOptions,
					},
					{
						key: 'periodicity_n',
						name: 'Periodicity N',
						to_show: true,
						defaultValueType: 'multitypeField',
					},
				],
				// items_blocked: false,
				get_items2_from_accruals: false,
				actions: [],
			},
		}

		/* var eventsGridTableData = getEventsGridTableData(event);

            eventsGridTableData.index = vm.entity.events.length;

            event.eventsGridTableDataService.setTableData(eventsGridTableData);

			event.eventsGridTableEventService.addEventListener(gridTableEvents.CELL_VALUE_CHANGED, function (argumentsObj) {
				onEventTableCellChange(argumentsObj, event.eventsGridTableDataService, event.eventsGridTableEventService);
			}); */
		// for event ordinary rows
		formatDataForEventGridTable(
			event,
			event.data.items,
			event.eventItemsGridTableDataService,
			event.eventItemsGridTableEventService,
			'items'
		)

		// for event blockable rows
		formatDataForEventGridTable(
			event,
			event.data.items2,
			event.eventItems2GridTableDataService,
			event.eventItems2GridTableEventService,
			'items2'
		)

		/* var eventsActionGridTableData = getEventsActionGridTableData(event);
            event.eventActionsGridTableDataService.setTableData(eventsActionGridTableData);

            event.eventActionsGridTableEventService.addEventListener(gridTableEvents.ROW_ADDED, function () {
                onActionsTableAddRow(event, event.eventActionsGridTableDataService, event.eventActionsGridTableEventService);
            });

            event.eventActionsGridTableEventService.addEventListener(gridTableEvents.CELL_VALUE_CHANGED, function (data){
                onActionsTableCellValueChanged(data, event, event.eventActionsGridTableDataService, event.eventActionsGridTableEventService);
            });

            event.eventActionsGridTableEventService.addEventListener(gridTableEvents.ROW_DELETED, function (data) {
                onActionsTableDeleteRows(data, event, event.eventActionsGridTableDataService, event.eventActionsGridTableEventService);
            }); */

		formatDataForEventActionsGridTable(event)

		vm.entity.events.push(event)
	}

	vm.toggleItem = function (pane, item, $event) {
		$event.stopPropagation()

		if (!$event.target.classList.contains('ttype-action-notes-input')) {
			pane.toggle()
			item.isPaneExpanded = !item.isPaneExpanded
		}
	}

	/* var getRangeOfNumbers = function (number) {
            var buttonPositions = [{id: 1, name: 1}];

            for (var i = 2; i <= number; i++) {
                buttonPositions.push({id: i, name: i});
            }

            return buttonPositions;
        }; */

	const onActionsTableAddRow = function (
		item,
		eventActionsGridTableDataService,
		eventActionsGridTableEventService
	) {


		var gridTableData = eventActionsGridTableDataService.getTableData()

		var newRow = gridTableData.body[0]


		var newAction = {
			transaction_type: '',
			text: '',
			is_sent_to_pending: false,
			is_book_automatic: false,
			button_position: 0,
			frontOptions: { newRow: true, gtKey: newRow.key },
		}

		item.data.actions.unshift(newAction)

		var transactionType = gridTableHelperService.getCellFromRowByKey(
			newRow,
			'transaction_type'
		)
		transactionType.settings.selectorOptions = vm.transactionTypes.map(
			getTTypesAsSelectorOptions
		)

		/* var buttonPosition = gridTableHelperService.getCellFromRowByKey(newRow, 'button_position');
            buttonPosition.settings.selectorOptions = getRangeOfNumbers(item.data.actions.length); */

		// Update rows in actions grid table
		item.data.actions.forEach((action, actionIndex) => {
			action.button_position = actionIndex
			gridTableData.body[actionIndex].order = actionIndex
		})
	}

	const onActionsTableDeleteRows = function (
		data,
		item,
		eventActionsGridTableDataService,
		eventActionsGridTableEventService
	) {
		var gridTableData = eventActionsGridTableDataService.getTableData()

		item.data.actions = item.data.actions.filter(function (action) {
			var actionId = action.id || action.frontOptions.gtKey
			return data.deletedRowsKeys.indexOf(actionId) === -1
		})

		// Update rows in actions grid table
		item.data.actions.forEach(function (action, actionIndex) {
			action.button_position = actionIndex
			gridTableData.body[actionIndex].order = actionIndex
		})
	}

	const onActionsTableCellValueChanged = function (
		data,
		item,
		eventActionsGridTableDataService,
		eventActionsGridTableEventService
	) {
		var rowOrder = data.row.order,
			colOrder = data.column.order

		gridTableHelperService.onGridTableCellChange(
			item.data.actions,
			eventActionsGridTableDataService,
			rowOrder,
			colOrder
		)
	}

	const onActionsOrderChange = function (
		rowData,
		gtDataService,
		gtEventService
	) {
		const tableData = gtDataService.getTableData()
		const item = vm.entity.events.find((event) =>
			findEventById(event, tableData.eventId)
		)

		const sortedActions = []

		tableData.body.forEach((row, rowIndex) => {
			const action = item.data.actions.find((action) => {
				// if (action.id || action.id === 0) return row.key === action.id;

				return row.key === action.frontOptions.gtKey
			})

			if (action) {
				action.button_position = rowIndex
				sortedActions.push(action)
			}
		})

		item.data.actions = sortedActions
	}

	/* const getOptionsForMultitypeFields = function () {

        	Object.keys(multitypeFieldsForRows).forEach(key => {

				const fieldTypeObj = multitypeFieldsForRows[key];
				const selType = fieldTypeObj.fieldDataList.find(type => type.fieldType === 'dropdownSelect');

				const formattedAttrTypes = [];

				instrumentAttrTypes.forEach(attrType => {

					if (attrType.value_type === fieldTypeObj.value_type) {

						formattedAttrTypes.push({id: attrType.user_code, name: attrType.short_name});

					}

				});

				// fieldTypeObj[selTypeIndex].fieldData = {
				selType.fieldData = {
					menuOptions: formattedAttrTypes
				};

			});

		}; */

	const formatExistingEvent = function (event, eventIndex) {
		//<editor-fold desc="Events grid table">

		// for event ordinary rows
		event.eventItemsGridTableDataService = new GridTableDataService()
		event.eventItemsGridTableEventService = new EventService()

		formatDataForEventGridTable(
			event,
			event.data.items,
			event.eventItemsGridTableDataService,
			event.eventItemsGridTableEventService,
			'items'
		)

		// for event blockable rows
		event.eventItems2GridTableDataService = new GridTableDataService()
		event.eventItems2GridTableEventService = new EventService()

		if (!event.data.items2) event.data.items2 = []

		formatDataForEventGridTable(
			event,
			event.data.items2,
			event.eventItems2GridTableDataService,
			event.eventItems2GridTableEventService,
			'items2'
		)
		//</editor-fold>

		//<editor-fold desc="Actions grid table">
		event.eventActionsGridTableDataService = new GridTableDataService()
		event.eventActionsGridTableEventService = new EventService()

		if (!event.data.actions) event.data.actions = []

		event.data.actions.forEach((action, index) => {
			// add gtKey to use while mapping actions from grid table to entity

			if (!action.frontOptions) action.frontOptions = {}
			if (!action.frontOptions.newRow)
				action.frontOptions = { gtKey: metaHelper.generateUniqueId(index) }
		})

		formatDataForEventActionsGridTable(event)
		//</editor-fold>
	}

	vm.evEditorEventService.addEventListener(
		evEditorEvents.MARK_FIELDS_WITH_ERRORS,
		() => {
			vm.evEditorFieldEvent = { key: 'mark_not_valid_fields' }
		}
	)

	vm.evEditorEventService.addEventListener(
		evEditorEvents.ENTITY_UPDATED,
		() => {
			vm.entity = $scope.$parent.vm.entity

			vm.entity.events.forEach((item, index) => {
				if (item.data) formatExistingEvent(item, index)
			})
		}
	)

	vm.openEventParametersManager = function ($event, item) {
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
						instrumentAttrTypes: instrumentAttrTypes,
						item: item,
					},
				},
			})
			.then((res) => {


				if (res.status === 'agree') {
					item.data.parameters = res.data.item.data.parameters
				}
			})
	}

	vm.init = function () {
		vm.popupEventService = new EventService()

		const dataPromises = [
			getTransactionTypes(),
			getInstrumentAttrTypes(),
			getNotificationClasses,
			getEventClasses,
			getInstrumentPeriodicityItems,
		]

		if (!Array.isArray(vm.entity.events)) vm.entity.events = []

		Promise.all(dataPromises).then(function (data) {
			vm.transactionTypes = data[0]
			instrumentAttrTypes = data[1] || []

			// getOptionsForMultitypeFields();
			multitypeFieldService.fillSelectorOptionsBasedOnValueType(
				instrumentAttrTypes,
				multitypeFieldsForRows
			)

			vm.entity.events.forEach((item, index) => {
				if (item.data) formatExistingEvent(item, index)
			})

			vm.readyStatus.gridTable = true

			$scope.$apply()
		})
	}

	vm.init()
}
