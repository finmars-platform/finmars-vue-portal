/**
 * Created by szhitenev on 25.08.2016.
 */

import metaHelper from '@/angularlpers/meta.helper'

import accrualCalculationModelService from '@/angular/services/accrualCalculationModelService'
import instrumentPeriodicityService from '@/angular/services/instrumentPeriodicityService'

import instrumentEventScheduleService from '@/angular/services/instrument/instrumentEventScheduleService'

import GridTableDataService from '@/angular/services/gridTableDataService'
import EventService from '@/angular/services/eventService'
import gridTableEvents from '@/angular/services/gridTableEvents'

import evEditorEvents from '@/angular/services/ev-editor/entityViewerEditorEvents'

export default function accrualCalculationSchedulesController(
	$scope,
	$mdDialog,
	instrumentService,
	gridTableHelperService,
	multitypeFieldService
) {
	var vm = this

	vm.entity = $scope.$parent.vm.entity
	vm.entityType = 'instrument'
	vm.entityAttrs = $scope.$parent.vm.entityAttrs

	vm.evEditorDataService = $scope.$parent.vm.evEditorDataService
	vm.evEditorEventService = $scope.$parent.vm.evEditorEventService
	vm.onEntityChange = $scope.$parent.vm.onEntityChange

	/* vm.currencyFields = [];
        vm.dailyPricingModelFields = []; */

	vm.readyStatus = {
		accrualModals: false,
		periodicityItems: false,
		accrualSchedules: false,
	}

	/** Helps to determine which of multiple accrual schedules tables changed */
	var schedulesTableChangedHere = false

	var accrualCalcModelPromise = new Promise(function (resolve, reject) {
		vm.accrualModels = []

		accrualCalculationModelService
			.getList()
			.then(function (data) {
				vm.accrualModels = data
				vm.readyStatus.accrualModals = true
				resolve()
			})
			.catch(() => resolve())
	})

	var instrumentPeriodicPromise = new Promise(function (resolve) {
		vm.periodicityItems = []

		instrumentPeriodicityService
			.getList()
			.then(function (data) {
				vm.periodicityItems = data
				vm.readyStatus.periodicityItems = true

				resolve()
			})
			.catch(() => resolve())
	})

	/*var onScheduleGridTableCellChange = function () {

            vm.entity.accrual_calculation_schedules.forEach(function (schedule, scheduleIndex) {

                var row = vm.schedulesGridTableData.body[scheduleIndex];

                row.columns.forEach(function (column) {

                    if (column.objPath) {
                        metaHelper.setObjectNestedPropVal(schedule, column.objPath, column.settings.value);

                    } else {

                        column.objPaths.forEach(function (objPath, index) {
                            metaHelper.setObjectNestedPropVal(schedule, objPath, column.settings.value[index]);
                        });

                    }

                });

            });

        };*/

	var getAttributeByKey = function (key) {
		for (var i = 0; i < vm.entityAttrs.length; i++) {
			if (vm.entityAttrs[i].key === key) {
				return vm.entityAttrs[i]
			}
		}
	}

	vm.accruedCurrencyAttr = getAttributeByKey('accrued_currency')
	vm.paymentSizeDetailAttr = getAttributeByKey('payment_size_detail')

	vm.checkReadyStatus = function () {
		// return vm.readyStatus.accrualModals === true && vm.readyStatus.periodicityItems === true && vm.readyStatus.accrualSchedules;

		for (var status in vm.readyStatus) {
			if (!vm.readyStatus[status]) {
				return false
			}
		}

		return true
	}

	vm.toggleQuery = function () {
		vm.queryStatus = !vm.queryStatus
		vm.query = {}
	}

	vm.setSort = function (propertyName) {
		vm.direction = vm.sort === propertyName ? !vm.direction : false
		vm.sort = propertyName
	}

	vm.bindCalculationModel = function (row) {
		var name
		vm.accrualModels.forEach(function (item) {
			if (row.accrual_calculation_model == item.id) {
				row.calculation_model_name = item.name
				name = item.name
			}
		})
		return name
	}

	vm.bindPeriodicity = function (row) {
		var name
		vm.periodicityItems.forEach(function (item) {
			// if (row.periodicity == item.user_code) {
			if (row.periodicity == item.id) {
				row.periodicity_name = item.name
				name = item.name
			}
		})
		return name
	}

	/* vm.newItem = {
            "accrual_start_date": new Date(),
            "first_payment_date": new Date(),
            "accrual_size": '',
            "accrual_calculation_model": '',
            "periodicity": '',
            "periodicity_n": '',
            "notes": ""
        };

        vm.editItem = function (item) {
            item.editStatus = true;
        };

        vm.saveItem = function (item) {
            item.editStatus = false;
        };

        vm.deleteItem = function (item, index) {
            vm.entity.accrual_calculation_schedules.splice(index, 1);
        };

        vm.addRow = function () {

            vm.entity.accrual_calculation_schedules.push({
                "accrual_start_date": moment(new Date(vm.newItem.accrual_start_date)).format('YYYY-MM-DD'),
                "first_payment_date": moment(new Date(vm.newItem.first_payment_date)).format('YYYY-MM-DD'),
                "accrual_size": vm.newItem.accrual_size,
                "accrual_calculation_model": vm.newItem.accrual_calculation_model,
                "periodicity": vm.newItem.periodicity,
                "periodicity_n": vm.newItem.periodicity_n,
                "notes": vm.newItem.notes
            });

            vm.newItem = {
                "accrual_start_date": new Date(),
                "first_payment_date": new Date(),
                "accrual_size": '',
                "accrual_calculation_model": '',
                "periodicity": '',
                "periodicity_n": '',
                "notes": ""
            };

        }; */

	/* vm.getCurrencyFields = function () {

			fieldResolverService.getFields('accrued_currency', {
				entityType: 'instrument',
				key: 'accrued_currency',
				pageSize: 1000
			}).then(function (res) {
				vm.currencyFields = metaHelper.textWithDashSort(res.data);
			});

		};

		vm.getPaymentSizeDetailFields = function () {

			fieldResolverService.getFields('payment_size_detail', {
				entityType: 'instrument',
				key: 'payment_size_detail',
				pageSize: 1000
			}).then(function (res) {

				vm.dailyPricingModelFields = metaHelper.textWithDashSort(res.data);

			});

		};

        vm.setDefaultCurrencyFields = function () {

            var item_object = vm.entity.accrued_currency_object;

            if (item_object) {

                if (Array.isArray(item_object)) {
                    vm.currencyFields = item_object;
                } else {
                    vm.currencyFields.push(item_object);
                }
            }

        };

        vm.setDefaultPaymentSizeDetailFields = function () {

            var item_object = vm.entity.payment_size_detail_object;

            if (item_object) {

                if (Array.isArray(item_object)) {
                    vm.dailyPricingModelFields = item_object;
                } else {
                    vm.dailyPricingModelFields.push(item_object);
                }
            }

        }; */

	vm.generateEventsSchedule = function ($event) {
		$mdDialog
			.show({
				controller: 'WarningDialogController as vm',
				templateUrl: 'views/dialogs/warning-dialog-view.html',
				parent: angular.element(document.body),
				targetEvent: $event,
				clickOutsideToClose: false,
				locals: {
					warning: {
						title: 'Warning',
						description: 'All changes will be saved, OK?',
					},
				},
				multiple: true,
				preserveScope: true,
				autoWrap: true,
				skipHide: true,
			})
			.then(function (res) {
				if (res.status === 'agree') {
					vm.readyStatus.eventSchedulesReady = false

					console.log('rebuild Events', $scope)

					$scope.$parent.vm.updateItem().then(function (value) {
						console.log('rebuild Events')

						instrumentEventScheduleService
							.rebuildEvents(vm.entity.id, vm.entity)
							.then(function (data) {
								$scope.$parent.vm.getItem().then(function (getItemData) {
									vm.entity = $scope.$parent.vm.entity
									convertDataForSchedulesGridTable()
									vm.readyStatus.eventSchedulesReady = true
								})
							})
					})
				}
			})
	}

	//<editor-fold desc="Schedules grid table">
	let accrualMultitypeFieldsData =
		instrumentService.getInstrumentAccrualsMultitypeFieldsData()

	const instrumentAttrTypes = vm.evEditorDataService.getEntityAttributeTypes()
	multitypeFieldService.fillSelectorOptionsBasedOnValueType(
		instrumentAttrTypes,
		accrualMultitypeFieldsData
	)

	vm.schedulesGridTableData = {
		header: {
			order: 'header',
			columns: [],
		},
		body: [],
		templateRow: {
			isActive: false,
			columns: [
				{
					key: 'accrual_start_date',
					objPaths: [['accrual_start_date'], ['accrual_start_date_value_type']],
					columnName: 'Accrual start date',
					order: 0,
					cellType: 'multitypeField',
					settings: {
						value: [null, null],
						fieldTypesData: null,
					},
					styles: {
						'grid-table-cell': { width: '210px' },
					},
				},
				{
					key: 'first_payment_date',
					objPaths: [['first_payment_date'], ['first_payment_date_value_type']],
					columnName: 'First payment date',
					order: 1,
					cellType: 'multitypeField',
					settings: {
						value: [null, null],
						fieldTypesData:
							accrualMultitypeFieldsData['first_payment_date'].fieldTypesList,
					},
					styles: {
						'grid-table-cell': { width: '160px' },
					},
				},
				{
					key: 'accrual_size',
					objPaths: [['accrual_size'], ['accrual_size_value_type']],
					columnName: 'Accrual size',
					order: 2,
					cellType: 'multitypeField',
					settings: {
						value: [null, null],
						fieldTypesData:
							accrualMultitypeFieldsData['accrual_size'].fieldTypesList,
					},
					styles: {
						'grid-table-cell': { width: '210px' },
					},
				},
				{
					key: 'periodicity',
					objPaths: [
						['periodicity'],
						['periodicity_n'],
						['accrual_calculation_model'],
					],
					columnName: 'Periodicity',
					order: 3,
					cellType: 'customPopup',
					settings: {
						value: [
							null, // for periodicity
							null, // for periodicity_n
							null, // for accrual_calculation_model
						],
						cellText: '',
						closeOnMouseOut: false,
						popupSettings: {
							contentHtml: {
								main: '<div ng-include src="\'views/directives/gridTable/cells/popups/instrument-accrual-schedules-periodicity-view.html\'"></div>',
							},
							popupData: [
								{ selectorOptions: vm.periodicityItems },
								{ fieldTypesData: null },
								{ selectorOptions: vm.accrualModels },
							],
						},
					},
					methods: {
						onChange: function (
							rowData,
							colData,
							gtDataService,
							gtEventService
						) {
							var periodicityCell = gtDataService.getCellByKey(
								rowData.order,
								'periodicity'
							)

							periodicityCell.settings.cellText = ''

							if (periodicityCell.settings.value[0]) {
								const selectedPeriodicity = vm.periodicityItems.find((item) => {
									// return item.user_code === periodicityCell.settings.value[2];
									return item.id === periodicityCell.settings.value[0]
								})
								periodicityCell.settings.cellText = selectedPeriodicity.name
							}

							//<editor-fold desc="Process data from periodicity_n multitypeField ">
							var typesList =
								periodicityCell.settings.popupSettings.popupData[1]
									.fieldTypesData
							var activeType = typesList.find((type) => type.isActive)

							if (!activeType)
								activeType = typesList.find((type) => type.isDefault)

							periodicityCell.settings.value[1] = activeType.model
							vm.entity.accrual_calculation_schedules[rowData.order][
								'periodicity_n_value_type'
							] = activeType.value_type
							//</editor-fold>

							/* for (var i = 0; i < vm.periodicityItems.length; i++) {

                                    if (vm.periodicityItems[i].id === periodicityCell.settings.value[2]) {

                                        periodicityCell.settings.cellText = vm.periodicityItems[i].name
                                        break;

                                    }

                                } */
						},
					},
					styles: {
						'grid-table-cell': { width: '115px' },
					},
				},
				{
					key: 'notes',
					objPath: ['notes'],
					columnName: 'Notes',
					order: 4,
					cellType: 'text',
					settings: {
						value: null,
					},
					styles: {
						'grid-table-cell': { width: '210px' },
					},
				},
			],
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

	var assembleGridTableBody = function (rowObj) {
		vm.schedulesGridTableData.body = []

		vm.entity.accrual_calculation_schedules.forEach(function (
			schedule,
			scheduleIndex
		) {
			var rowObj = metaHelper.recursiveDeepCopy(
				vm.schedulesGridTableData.templateRow,
				true
			)

			rowObj.key = schedule.hasOwnProperty('id')
				? schedule.id
				: schedule.frontOptions.gtKey
			rowObj.newRow = !!(schedule.frontOptions && schedule.frontOptions.newRow)
			rowObj.order = scheduleIndex

			var insertMultitypeFieldDataIntroCell = function (columnKey, label) {
				var cell = gridTableHelperService.getCellFromRowByKey(rowObj, columnKey)

				var valueProp = cell.objPaths[0],
					valueTypeProp = cell.objPaths[1],
					value = schedule[valueProp],
					valueType = schedule[valueTypeProp]

				var typesList = accrualMultitypeFieldsData[columnKey].fieldTypesList
				typesList.forEach((type) => (type.label = label))

				var cellData = gridTableHelperService.getMultitypeFieldDataForCell(
					typesList,
					cell,
					value,
					valueType
				)
				rowObj.columns[cell.order] = cellData.cell
				schedule[valueTypeProp] = cellData.value_type // for existing accruals without _value_type
			}

			// rowObj.columns[0].settings.value = schedule.accrual_start_date;

			/*var startDateTypesList = accrualMultitypeFieldsData[rowObj.columns[0].key].fieldTypesList;
				startDateTypesList.forEach(type => type.label = 'Accrual start date');

				cellData = gridTableHelperService.getMultitypeFieldDataForCell(startDateTypesList, rowObj.columns[0], schedule.accrual_start_date, schedule.accrual_start_date_value_type);
				rowObj.columns[0] = cellData.cell;
				schedule.accrual_start_date_value_type = cellData.value_type; // for existing accruals without _value_type*/
			insertMultitypeFieldDataIntroCell(
				'accrual_start_date',
				'Accrual start date'
			)

			// rowObj.columns[1].settings = schedule.first_payment_date;
			/*var firstPayDateTypesList = accrualMultitypeFieldsData[rowObj.columns[1].key].fieldTypesList;
				firstPayDateTypesList.forEach(type => type.label = 'First payment date');

				cellData = gridTableHelperService.getMultitypeFieldDataForCell(firstPayDateTypesList, rowObj.columns[1], schedule.first_payment_date, schedule.first_payment_date_value_type);
				rowObj.columns[1] = cellData.cell;
				schedule.first_payment_date_value_type = cellData.value_type; // for existing accruals without _value_type*/
			insertMultitypeFieldDataIntroCell(
				'first_payment_date',
				'First payment date'
			)

			// rowObj.columns[2].settings.value = schedule.accrual_size;
			/* var accrualSizeTypesList = accrualMultitypeFieldsData[rowObj.columns[2].key].fieldTypesList;
				accrualSizeTypesList.forEach(type => type.label = 'Accrual size');

				cellData = gridTableHelperService.getMultitypeFieldDataForCell(accrualSizeTypesList, rowObj.columns[2], schedule.accrual_size, schedule.accrual_size_value_type);
				rowObj.columns[2] = cellData.cell;
				schedule.accrual_size_value_type = cellData.value_type; // for existing accruals without _value_type */
			insertMultitypeFieldDataIntroCell('accrual_size', 'First payment date')

			rowObj.columns[3].settings.value = [
				schedule.periodicity,
				schedule.periodicity_n,
				schedule.accrual_calculation_model,
			]

			var periodicityNTypesList = JSON.parse(
				JSON.stringify(
					accrualMultitypeFieldsData['periodicity_n'].fieldTypesList
				)
			)

			schedule.periodicity_n_value_type =
				multitypeFieldService.setActiveTypeByValueType(
					periodicityNTypesList,
					schedule.periodicity_n,
					schedule.periodicity_n_value_type
				)
			periodicityNTypesList.forEach((type) => (type.label = 'Number of days'))

			rowObj.columns[3].settings.popupSettings.popupData[1].fieldTypesData =
				periodicityNTypesList

			for (var i = 0; i < vm.periodicityItems.length; i++) {
				// if (vm.periodicityItems[i].user_code === schedule.periodicity) {
				if (vm.periodicityItems[i].id === schedule.periodicity) {
					rowObj.columns[3].settings.cellText = vm.periodicityItems[i].name
					break
				}
			}

			rowObj.columns[4].settings.value = schedule.notes

			vm.schedulesGridTableData.body.push(rowObj)
		})
	}

	var convertDataForSchedulesGridTable = function () {
		var templateRow = vm.schedulesGridTableData.templateRow

		var insertMultitypeFieldDataIntroCell = function (columnKey, label) {
			var cell = gridTableHelperService.getCellFromRowByKey(
				templateRow,
				columnKey
			)
			var typesList = JSON.parse(
				JSON.stringify(accrualMultitypeFieldsData[columnKey].fieldTypesList)
			)
			typesList.forEach((type) => (type.label = label))

			var activeValueType = multitypeFieldService.setActiveTypeByValueType(
				typesList,
				null,
				null
			)

			cell.settings.value[1] = activeValueType
			cell.settings.fieldTypesData = typesList
			// gridTableHelperService.setCellInsideRow(templateRow, cell);
		}

		insertMultitypeFieldDataIntroCell(
			'accrual_start_date',
			'Accrual start date'
		)

		/*var firstPayDateCell = gridTableHelperService.getCellFromRowByKey(templateRow, 'first_payment_date');
			var firstPayDateTypesList = accrualMultitypeFieldsData['first_payment_date'].fieldTypesList;
			firstPayDateTypesList.forEach(type => type.label = 'First payment date');

			multitypeFieldService.setActiveTypeByValueType(firstPayDateTypesList, null, null);
			gridTableHelperService.setCellInsideRow(templateRow, firstPayDateCell);*/

		insertMultitypeFieldDataIntroCell(
			'first_payment_date',
			'First payment date'
		)

		/* var accrualSizeCell = gridTableHelperService.getCellFromRowByKey(templateRow, 'accrual_size');
			var accrualSizeTypesList = accrualMultitypeFieldsData['accrual_size'].fieldTypesList;
			accrualSizeTypesList.forEach(type => type.label = 'Accrual size');

			multitypeFieldService.setActiveTypeByValueType(accrualSizeTypesList, null, null);
			gridTableHelperService.setCellInsideRow(templateRow, accrualSizeCell); */

		insertMultitypeFieldDataIntroCell('accrual_size', 'Accrual size')

		//<editor-fold desc="Periodicity column">

		// Set multitype field data for periodicity_n inside periodicity
		var periodicityNTypesList = JSON.parse(
			JSON.stringify(accrualMultitypeFieldsData['periodicity_n'].fieldTypesList)
		)
		multitypeFieldService.setActiveTypeByValueType(
			periodicityNTypesList,
			null,
			null
		)
		periodicityNTypesList.forEach((type) => (type.label = 'Number of days'))

		var periodicityCell = gridTableHelperService.getCellFromRowByKey(
			templateRow,
			'periodicity'
		)
		periodicityCell.settings.popupSettings.popupData[1].fieldTypesData =
			periodicityNTypesList

		// Needed to update data after downloading it from server
		var tmplRowPeriodicityPopup = periodicityCell.settings.popupSettings

		tmplRowPeriodicityPopup.popupData[0].selectorOptions =
			vm.periodicityItems.map(function (pItem) {
				return {
					// id: pItem.user_code,
					id: pItem.id,
					name: pItem.name,
				}
			})

		tmplRowPeriodicityPopup.popupData[2].selectorOptions = vm.accrualModels.map(
			function (aModel) {
				return {
					// id: aModel.user_code,
					id: aModel.id,
					name: aModel.name,
				}
			}
		)
		//</editor-fold>

		//<editor-fold desc="Assemble header columns">
		var rowObj = metaHelper.recursiveDeepCopy(
			vm.schedulesGridTableData.templateRow,
			true
		)

		vm.schedulesGridTableData.header.columns = rowObj.columns.map(function (
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

			if (column.key === 'periodicity') {
				headerData.sorting = { valueOrder: 0 }
			}

			return headerData
		})
		//</editor-fold>

		assembleGridTableBody()

		vm.schedulesGridTableDataService.setTableData(vm.schedulesGridTableData)
	}
	//</editor-fold>

	/* var addAccrualCalcSchedule = function () {

			var newRow = vm.schedulesGridTableData.body[0];

			var newSchedule = {
				"accrual_start_date": '',
				"first_payment_date": '',
				"accrual_size": '',
				"accrual_calculation_model": '',
				"periodicity": '',
				"periodicity_n": '',
				"notes": '',
				frontOptions: {newRow: true, gtKey: newRow.key}
			};

			vm.entity.accrual_calculation_schedules.unshift(newSchedule);

			// Update rows in schedules grid table
			vm.entity.accrual_calculation_schedules.forEach(function (schedule, scheduleIndex) {
				vm.schedulesGridTableData.body[scheduleIndex].order = scheduleIndex
			});

		};

        var deleteSchedules = function (deletedRowsKeys) {

            vm.entity.accrual_calculation_schedules = vm.entity.accrual_calculation_schedules.filter(function (schedule) {

                var scheduleId = schedule.id || schedule.frontOptions.gtKey;
                return deletedRowsKeys.indexOf(scheduleId) === -1;

            });

        };

        var initGridTableEvents = function () {

            vm.schedulesGridTableEventService.addEventListener(gtEvents.ROW_ADDED, function () {
                addAccrualCalcSchedule();
            });

            vm.schedulesGridTableEventService.addEventListener(gtEvents.CELL_VALUE_CHANGED, function (argObj) {

                var rowOrder = argObj.row.order,
                    colOrder = argObj.column.order;

                gridTableHelperService.onGridTableCellChange(
                    vm.entity.accrual_calculation_schedules,
                    vm.schedulesGridTableDataService,
                    rowOrder, colOrder
				);

            });

            vm.schedulesGridTableEventService.addEventListener(gtEvents.ROW_DELETED, function (argObj) {
                deleteSchedules(argObj.deletedRowsKeys);
            });

        }; */

	var initEventListeners = function () {
		//<editor-fold desc="Accruals grid table">

		vm.schedulesGridTableEventService.addEventListener(
			gridTableEvents.CELL_VALUE_CHANGED,
			function (argObj) {
				schedulesTableChangedHere = true
				instrumentService.onGtCellChange(
					argObj,
					vm.entity,
					vm.schedulesGridTableDataService,
					vm.evEditorEventService,
					'accrual_calculation_schedules'
				)
			}
		)

		vm.schedulesGridTableEventService.addEventListener(
			gridTableEvents.ROW_DELETED,
			function (argObj) {
				schedulesTableChangedHere = true
				instrumentService.onGtRowDeletion(
					argObj,
					vm.entity,
					vm.evEditorEventService,
					'accrual_calculation_schedules'
				)
			}
		)

		vm.schedulesGridTableEventService.addEventListener(
			gridTableEvents.ROW_ADDED,
			() => {
				const gridTableData = vm.schedulesGridTableDataService.getTableData()

				const newRow = gridTableData.body[0]
				const newSchedule = {
					accrual_start_date: '',
					accrual_start_date_value_type: 40,
					first_payment_date: '',
					first_payment_date_value_type: 40,
					accrual_size: '',
					accrual_calculation_model: '',
					periodicity: '',
					periodicity_n: '',
					periodicity_n_value_type: 20,
					notes: '',
					frontOptions: { newRow: true, gtKey: newRow.key },
				}

				vm.entity.accrual_calculation_schedules.unshift(newSchedule)

				// Update rows in schedules grid table
				vm.entity.accrual_calculation_schedules.forEach(
					(schedule, scheduleIndex) => {
						gridTableData.body[scheduleIndex].order = scheduleIndex
					}
				)

				schedulesTableChangedHere = true
				vm.evEditorEventService.dispatchEvent(
					evEditorEvents.TABLE_INSTANCE_CHANGED,
					{ key: 'accrual_calculation_schedules' }
				)
			}
		)
		//</editor-fold>

		vm.evEditorEventService.addEventListener(
			evEditorEvents.TABLE_INSTANCE_CHANGED,
			(argObj) => {
				if (
					argObj &&
					argObj.key === 'accrual_calculation_schedules' &&
					!schedulesTableChangedHere
				) {
					assembleGridTableBody()
					vm.schedulesGridTableEventService.dispatchEvent(
						gridTableEvents.REDRAW_TABLE
					)
				}

				schedulesTableChangedHere = false
			}
		)

		vm.evEditorEventService.addEventListener(
			evEditorEvents.DYNAMIC_ATTRIBUTES_CHANGE,
			() => {
				const instrumentAttrTypes =
					vm.evEditorDataService.getEntityAttributeTypes()
				instrumentService.updateMultitypeFieldSelectorOptionsInsideGridTable(
					instrumentAttrTypes,
					accrualMultitypeFieldsData,
					vm.schedulesGridTableData
				)
			}
		)

		vm.evEditorEventService.addEventListener(
			evEditorEvents.ENTITY_UPDATED,
			function () {
				vm.entity = $scope.$parent.vm.entity

				convertDataForSchedulesGridTable()
				vm.schedulesGridTableEventService.dispatchEvent(
					gridTableEvents.REDRAW_TABLE
				)
			}
		)
	}

	vm.init = function () {
		// vm.setDefaultCurrencyFields();

		// Victor 19.10.2020
		// vm.setDefaultPaymentSizeDetailFields();
		// vm.getPaymentSizeDetailFields();

		if (!vm.entity.accrual_calculation_schedules) {
			vm.entity.accrual_calculation_schedules = []
		}

		vm.schedulesGridTableDataService = new GridTableDataService()
		vm.schedulesGridTableEventService = new EventService()

		initEventListeners()

		var initPromises = [
			accrualCalcModelPromise,
			instrumentPeriodicPromise,
			// vm.getPaymentSizeDetailFields(),
			// vm.getCurrencyFields()
		]

		Promise.all(initPromises).then(function () {
			convertDataForSchedulesGridTable()
			vm.readyStatus.accrualSchedules = true

			$scope.$apply()
		})
	}

	vm.init()
}
