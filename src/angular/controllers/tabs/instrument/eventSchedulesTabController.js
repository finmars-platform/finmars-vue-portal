/**
 * Created by szhitenev on 25.08.2016.
 */

import metaNotificationClassService from '@/angular/services/metaNotificationClassService'
import metaEventClassService from '@/angular/services/metaEventClassService'
import instrumentPeriodicityService from '@/angular/services/instrumentPeriodicityService'

import GridTableDataService from '@/angular/services/gridTableDataService'
import GridTableEventService from '@/angular/services/gridTableEventService'

import gridTableEvents from '@/angular/services/gridTableEvents'
import evEditorEvents from '@/angular/services/ev-editor/entityViewerEditorEvents'

import metaHelper from '@/angularlpers/meta.helper'

var eventObj = {
	name: '',
	description: '',
	notification_class: '',
	notify_in_n_days: '',
	periodicity: '',
	periodicity_n: '',
	action_is_sent_to_pending: null,
	action_is_book_automatic: null,
	actions: [],
	effective_date: null,
	final_date: null,
	event_class: null,
}

export default function eventSchedulesTabController(
	$scope,
	$mdDialog,
	instrumentService,
	gridTableHelperService
) {
	var vm = this

	vm.entity = $scope.$parent.vm.entity
	vm.contextData = $scope.$parent.vm.contextData
	vm.entityType = 'instrument'
	vm.entityAttrs = $scope.$parent.vm.entityAttrs

	vm.evEditorDataService = $scope.$parent.vm.evEditorDataService
	vm.evEditorEventService = $scope.$parent.vm.evEditorEventService
	vm.onEntityChange = $scope.$parent.vm.onEntityChange
	// Victor 06.10.2020 Not used after switching to grid table
	// var activeItemOriginal = null;

	vm.readyStatus = {
		notificationClasses: false,
		eventClasses: false,
		eventSchedulesReady: false,
	}

	/** Helps to determine which of multiple events schedules tables changed */
	var eventsTableChangedHere = false

	var getNotificationClasses = metaNotificationClassService
		.getList()
		.then(function (data) {
			vm.notificationClasses = data
			vm.readyStatus.notificationClasses = true
			$scope.$apply()
		})

	var getEventClasses = metaEventClassService.getList().then(function (data) {
		vm.eventClasses = data
		vm.readyStatus.eventClasses = true
		$scope.$apply()
	})

	var getInstrumentPeriodicityItems = instrumentPeriodicityService
		.getList()
		.then(function (data) {
			vm.periodicityItems = data
			vm.readyStatus.periodicityItems = true
			$scope.$apply()
		})

	if (!vm.entity.event_schedules) {
		vm.entity.event_schedules = []
	}

	// vm.readyStatus.eventSchedulesReady = true;

	var getAttributeByKey = function (key) {
		for (var i = 0; i < vm.entityAttrs.length; i++) {
			if (vm.entityAttrs[i].key === key) {
				return vm.entityAttrs[i]
			}
		}
	}

	vm.maturityDateAttr = getAttributeByKey('maturity_date')
	vm.maturityPriceAttr = getAttributeByKey('maturity_price')

	vm.checkReadyStatus = function () {
		return (
			vm.readyStatus.notificationClasses &&
			vm.readyStatus.eventClasses &&
			vm.readyStatus.eventSchedulesReady
		)
	}

	// Victor 06.10.2020 Not used after switching to grid table

	// vm.toggleQuery = function () {
	//     vm.queryStatus = !vm.queryStatus;
	//     vm.query = {};
	// };

	// vm.setSort = function (propertyName) {
	//     vm.direction = (vm.sort === propertyName) ? !vm.direction : false;
	//     vm.sort = propertyName;
	// };

	// vm.bindNotificationClass = function (row) {
	//     var name;
	//     vm.notificationClasses.forEach(function (item) {
	//         if (row.notification_class == item.id) {
	//             row.notification_class_name = item.name;
	//             name = item.name
	//         }
	//     });
	//     return name;
	// };

	vm.bindEventClass = function (row) {
		var name
		vm.eventClasses.forEach(function (item) {
			if (row.event_class == item.id) {
				row.event_class_name = item.name
				name = item.name
			}
		})
		return name
	}

	// Victor 06.10.2020 Not used after switching to grid table
	/* vm.bindPeriodicity = function (row) {
            var name;
            if (vm.periodicityItems) {
                vm.periodicityItems.forEach(function (item) {
                    if (row.periodicity == item.id) {
                        row.periodicity_name = item.name;
                        name = item.name
                    }
                });
            }

            return name;
        }; */

	// vm.newItem = JSON.parse(JSON.stringify(eventObj));

	// Victor 01.10.2020 I use EVENT_INIT_OBJECT
	/* vm.newItem = {
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
        };

        Victor 06.10.2020 Not used after switching to grid table

        vm.editItem = function (item) {
            item.editStatus = true;

            activeItemOriginal = JSON.stringify(item)
        };

        vm.saveItem = function (item) {

            if (activeItemOriginal !== JSON.stringify(item)) {
                item.is_auto_generated = false;
            }

            item.editStatus = false;
        };

        vm.deleteItem = function (item, index) {
            vm.entity.event_schedules.splice(index, 1);
        };

        vm.createActions = function ($event, actions) {
            $mdDialog.show({
                controller: 'InstrumentEventActionsDialogController as vm',
                templateUrl: 'views/dialogs/instrument-event-actions-dialog-view.html',
                targetEvent: $event,
                preserveScope: true,
                autoWrap: true,
                multiple: true,
                clickOutsideToClose: false,
                locals: {
                    eventActions: actions
                }
            });
        };

        vm.addRow = function () {
            vm.entity.event_schedules.push({
                "name": vm.newItem.name,
                "description": vm.newItem.description,
                "notification_class": vm.newItem.notification_class,
                "notify_in_n_days": vm.newItem.notify_in_n_days,
                "action_text": vm.newItem.action_text,
                "event_class": vm.newItem.event_class,
                "action_is_sent_to_pending": vm.newItem.action_is_sent_to_pending,
                "action_is_book_automatic": vm.newItem.action_is_book_automatic,
                "actions": vm.newItem.actions,
                "effective_date": vm.newItem.effective_date,
                "final_date": vm.newItem.final_date,
                "periodicity": vm.newItem.periodicity,
                "periodicity_n": vm.newItem.periodicity_n
            });

            vm.newItem = JSON.parse(JSON.stringify(EVENT_INIT_OBJECT));

            // Victor 01.10.2020 I use EVENT_INIT_OBJECT
            // vm.newItem = {
            //     "name": '',
            //     "description": "",
            //     "notification_class": '',
            //     "notify_in_n_days": '',
            //     "periodicity": '',
            //     "periodicity_n": '',
            //     "action_is_sent_to_pending": null,
            //     "action_is_book_automatic": null,
            //     "actions": [],
            //     "effective_date": null,
            //     "final_date": null,
            //     // "event_class": null
            // };
        } */

	vm.generateEventInstrument = function ($event) {
		console.log('Generate Events')

		$mdDialog
			.show({
				controller: 'SingleInstrumentGenerateEventDialogController as vm',
				templateUrl:
					'views/dialogs/single-instrument-generate-event-dialog-view.html',
				parent: angular.element(document.body),
				targetEvent: $event,
				clickOutsideToClose: false,
				preserveScope: true,
				autoWrap: true,
				skipHide: true,
				multiple: true,
				locals: {
					data: {
						instrument: vm.entity,
						contextData: vm.contextData,
					},
				},
			})
			.then(function (res) {
				if (res.status === 'agree') {
					$mdDialog.show({
						controller: 'InfoDialogController as vm',
						templateUrl: 'views/info-dialog-view.html',
						parent: angular.element(document.body),
						targetEvent: $event,
						clickOutsideToClose: false,
						preserveScope: true,
						autoWrap: true,
						skipHide: true,
						multiple: true,
						locals: {
							info: {
								title: 'Success',
								description: res.data.events.length + ' Events were generated.',
							},
						},
					})
				}
			})
	}

	vm.openEventEditDialog = function (event) {
		const attrTypes = vm.evEditorDataService.getEntityAttributeTypes()

		return $mdDialog.show({
			controller: 'SingleInstrumentAddEventToTableDialogController as vm',
			templateUrl:
				'views/dialogs/single-instrument-add-event-to-table-dialog-view.html',
			parent: angular.element(document.body),
			// targetEvent: $event,
			clickOutsideToClose: false,
			multiple: true,
			locals: {
				data: {
					instrumentAttrTypes: attrTypes,
					eventClasses: vm.eventClasses,
					notificationClasses: vm.notificationClasses,
					periodicityItems: vm.periodicityItems,
					event: JSON.parse(JSON.stringify(event)),
				},
			},
		})
	}

	//<editor-fold desc="Event grid table">
	var newRowsKeys = []
	var eventsMultitypeFields =
		instrumentService.getInstrumentEventsMultitypeFieldsData()

	var setGridTableCellsValues = function (rowObj, event) {
		var attrTypes = vm.evEditorDataService.getEntityAttributeTypes()

		var getMultitypeFieldCellValue = (key) => {
			var valueTypeKey = key + '_value_type'

			if (event.hasOwnProperty(valueTypeKey)) {
				if (event[valueTypeKey] === 70) {
					var selAttrType = attrTypes.find(
						(type) => type.user_code === event[key]
					)
					return selAttrType.short_name || ''
				} else {
					return event[key]
				}
			} else {
				// set value_type property for events created earlier

				var defaultType = eventsMultitypeFields[key].fieldTypesList.find(
					(type) => type.isDefault
				)
				event[valueTypeKey] = defaultType.value_type

				return event[key]
			}
		}

		var name = gridTableHelperService.getCellFromRowByKey(rowObj, 'name')
		name.settings.value = event.name

		var effectiveDate = gridTableHelperService.getCellFromRowByKey(
			rowObj,
			'effective_date'
		)
		effectiveDate.settings.value = getMultitypeFieldCellValue('effective_date')

		var finalDate = gridTableHelperService.getCellFromRowByKey(
			rowObj,
			'final_date'
		)
		finalDate.settings.value = getMultitypeFieldCellValue('final_date')

		var isAutoGenerated = gridTableHelperService.getCellFromRowByKey(
			rowObj,
			'is_auto_generated'
		)
		isAutoGenerated.settings.value = event.is_auto_generated

		var eventClass = gridTableHelperService.getCellFromRowByKey(
			rowObj,
			'event_class'
		)
		eventClass.settings.value = vm.bindEventClass(event)
	}

	var onEventsTableAddRow = function () {
		var newEventData = JSON.parse(JSON.stringify(eventObj))

		vm.openEventEditDialog(newEventData).then(function (res) {
			if (res.status !== 'agree') {
				return
			}

			// vm.newItem = JSON.parse(JSON.stringify(eventObj));

			var event = res.data.event

			var newRowKey = metaHelper.generateUniqueId('eventsScheduelsGridTable')
			newRowsKeys.push(newRowKey)

			event.frontOptions = { gtKey: newRowKey }

			var rowObj = metaHelper.recursiveDeepCopy(
				vm.eventsGridTableData.templateRow,
				true
			)
			rowObj.key = newRowKey

			/* var name = gridTableHelperService.getCellFromRowByKey(rowObj, 'name');
				name.settings.value = event.name;

				var effectiveDate = gridTableHelperService.getCellFromRowByKey(rowObj, 'effective_date');
				effectiveDate.settings.value = event.effective_date;

				var finalDate = gridTableHelperService.getCellFromRowByKey(rowObj, 'final_date');
				finalDate.settings.value = event.final_date;

				var isAutoGenerated = gridTableHelperService.getCellFromRowByKey(rowObj, 'is_auto_generated');
				isAutoGenerated.settings.value = event.is_auto_generated;

				var eventClass = gridTableHelperService.getCellFromRowByKey(rowObj, 'event_class');
				eventClass.settings.value = vm.bindEventClass(event); */
			setGridTableCellsValues(rowObj, event)

			vm.entity.event_schedules.unshift(event)
			vm.eventsGridTableData.body.unshift(rowObj)

			// Update rows in grid table
			vm.entity.event_schedules.forEach(function (item, itemIndex) {
				vm.eventsGridTableData.body[itemIndex].order = itemIndex
			})
		})
	}

	var onEventsTableRowClick = function (
		rowData,
		gtDataService,
		gtEventService
	) {
		var event = vm.entity.event_schedules[rowData.order]

		vm.openEventEditDialog(event).then(function (res) {
			if (res.status !== 'agree') {
				return
			}

			var event = res.data.event

			var rowObj = vm.eventSchedulesGridTableDataService.getRow(rowData.order)

			/* var name = gridTableHelperService.getCellFromRowByKey(rowObj, 'name');
                name.settings.value = event.name;

                var effectiveDate = gridTableHelperService.getCellFromRowByKey(rowObj, 'effective_date');
                effectiveDate.settings.value = event.effective_date;

                var finalDate = gridTableHelperService.getCellFromRowByKey(rowObj, 'final_date');
                finalDate.settings.value = event.final_date;

                var isAutoGenerated = gridTableHelperService.getCellFromRowByKey(rowObj, 'is_auto_generated');
                isAutoGenerated.settings.value = event.is_auto_generated;

                var eventClass = gridTableHelperService.getCellFromRowByKey(rowObj, 'event_class');
                eventClass.settings.value = vm.bindEventClass(event); */
			setGridTableCellsValues(rowObj, event)

			vm.entity.event_schedules[rowData.order] = event
			vm.evEditorEventService.dispatchEvent(
				evEditorEvents.TABLE_INSTANCE_CHANGED,
				{ key: 'event_schedules' }
			)
		})
	}

	var onEventsTableDeleteRows = function (argObj) {
		vm.entity.event_schedules = vm.entity.event_schedules.filter(function (
			event
		) {
			console.log('deletedRowsKeys', argObj.deletedRowsKeys)

			var eventId = event.id || event.frontOptions.gtKey
			return argObj.deletedRowsKeys.indexOf(eventId) === -1
		})

		// Update rows in grid table
		vm.entity.event_schedules.forEach(function (item, itemIndex) {
			vm.eventsGridTableData.body[itemIndex].order = itemIndex
		})
	}

	vm.eventsGridTableData = {
		header: {
			order: 'header',
			columns: [],
		},
		body: [],
		templateRow: {
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
						'grid-table-cell': { width: '260px' },
					},
				},
				{
					key: 'effective_date',
					objPath: ['effective_date'],
					columnName: 'Effective date',
					order: 1,
					cellType: 'readonly_text',
					settings: {
						value: null,
					},
					styles: {
						'grid-table-cell': { width: '130px' },
					},
				},
				{
					key: 'final_date',
					objPath: ['final_date'],
					columnName: 'Final date',
					order: 2,
					cellType: 'readonly_text',
					settings: {
						value: null,
					},
					styles: {
						'grid-table-cell': { width: '130px' },
					},
				},
				{
					key: 'is_auto_generated',
					objPath: ['is_auto_generated'],
					columnName: 'Auto generated',
					order: 2,
					cellType: 'checkbox',
					settings: {
						value: null,
						readonly: true,
					},
					styles: {
						'grid-table-cell': { width: '130px' },
					},
				},
				{
					key: 'event_class',
					objPath: ['event_class'],
					columnName: 'Event class',
					order: 0,
					cellType: 'readonly_text',
					settings: {
						value: null,
					},
					styles: {
						'grid-table-cell': { width: '200px' },
					},
				},
			],
			methods: {
				onClick: onEventsTableRowClick,
			},
			styles: { 'grid-table-row': { cursor: 'pointer' } },
		},
		tableMethods: {
			addRow: onEventsTableAddRow,
		},
		components: {
			topPanel: {
				addButton: true,
				filters: false,
				columns: false,
				search: false,
			},
			rowCheckboxes: true,
		},
	}

	var assembleEventsGTBody = function () {
		vm.eventsGridTableData.body = []

		vm.entity.event_schedules.forEach(function (event, eventIndex) {
			var rowObj = metaHelper.recursiveDeepCopy(
				vm.eventsGridTableData.templateRow,
				true
			)

			rowObj.key = event.id
			rowObj.newRow = !!(rowObj.frontOptions && rowObj.frontOptions.newRow)
			rowObj.order = eventIndex

			/* var name = gridTableHelperService.getCellFromRowByKey(rowObj, 'name');
				name.settings.value = event.name;

				var effectiveDate = gridTableHelperService.getCellFromRowByKey(rowObj, 'effective_date');
				effectiveDate.settings.value = event.effective_date;

				var finalDate = gridTableHelperService.getCellFromRowByKey(rowObj, 'final_date');
				finalDate.settings.value = event.final_date;

				var isAutoGenerated = gridTableHelperService.getCellFromRowByKey(rowObj, 'is_auto_generated');
				isAutoGenerated.settings.value = event.is_auto_generated;

				var eventClass = gridTableHelperService.getCellFromRowByKey(rowObj, 'event_class');
				eventClass.settings.value = vm.bindEventClass(event); */

			setGridTableCellsValues(rowObj, event)

			vm.eventsGridTableData.body.push(rowObj)
		})
	}

	var formatDataForEventsGridTable = function () {
		// assemble header columns
		var rowObj = metaHelper.recursiveDeepCopy(
			vm.eventsGridTableData.templateRow,
			true
		)

		vm.eventsGridTableData.header.columns = rowObj.columns.map(function (
			column
		) {
			var headerData = {
				key: column.key,
				columnName: column.columnName,
				order: column.order,
				sorting: true,
				styles: {
					'grid-table-cell': {
						width: column.styles['grid-table-cell'].width,
					},
				},
			}

			return headerData
		})
		// < assemble header columns >

		assembleEventsGTBody()

		vm.eventSchedulesGridTableDataService.setTableData(vm.eventsGridTableData)
	}

	var initGridTableEvents = function () {
		vm.eventSchedulesGridTableEventService.addEventListener(
			gridTableEvents.ROW_DELETED,
			onEventsTableDeleteRows
		)

		vm.eventSchedulesGridTableEventService.addEventListener(
			gridTableEvents.CELL_VALUE_CHANGED,
			function (argObj) {
				eventsTableChangedHere = true
				instrumentService.onGtCellChange(
					argObj,
					vm.entity,
					vm.eventSchedulesGridTableDataService,
					vm.evEditorEventService,
					'event_schedules'
				)
			}
		)

		vm.eventSchedulesGridTableEventService.addEventListener(
			gridTableEvents.ROW_DELETED,
			function (argObj) {
				eventsTableChangedHere = true
				instrumentService.onGtRowDeletion(
					argObj,
					vm.entity,
					vm.evEditorEventService,
					'event_schedules'
				)
			}
		)

		vm.evEditorEventService.addEventListener(
			evEditorEvents.TABLE_INSTANCE_CHANGED,
			(argObj) => {
				if (
					argObj &&
					argObj.key === 'event_schedules' &&
					!eventsTableChangedHere
				) {
					assembleEventsGTBody()
					vm.eventSchedulesGridTableEventService.dispatchEvent(
						gridTableEvents.REDRAW_TABLE
					)
				}

				eventsTableChangedHere = false
			}
		)

		vm.evEditorEventService.addEventListener(
			evEditorEvents.ENTITY_UPDATED,
			function () {
				vm.entity = $scope.$parent.vm.entity
				formatDataForEventsGridTable()

				vm.eventSchedulesGridTableEventService.dispatchEvent(
					gridTableEvents.REDRAW_TABLE
				)
			}
		)
	}
	//</editor-fold>

	vm.init = function () {
		vm.eventSchedulesGridTableDataService = new GridTableDataService()
		vm.eventSchedulesGridTableEventService = new GridTableEventService()

		initGridTableEvents()

		Promise.all([
			getNotificationClasses,
			getEventClasses,
			getInstrumentPeriodicityItems,
		]).then(function () {
			formatDataForEventsGridTable()
			vm.readyStatus.eventSchedulesReady = true
		})
	}

	vm.init()
}
