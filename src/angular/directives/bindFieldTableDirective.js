import metaHelper from '../helpers/meta.helper'
import md5Helper from '../helpers/md5.helper'

import accrualCalculationModelService from '../services/accrualCalculationModelService'
import instrumentPeriodicityService from '../services/instrumentPeriodicityService'
import metaEventClassService from '../services/metaEventClassService'
import metaNotificationClassService from '../services/metaNotificationClassService'

import GridTableDataService from '../services/gridTableDataService'
import EventService from '../services/eventService'
import gridTableEvents from '../services/gridTableEvents'

import gtEvents from '../services/gridTableEvents'
import popupEvents from '../services/events/popupEvents'
import instrumentTypeService from '../services/instrumentTypeService'

import evEditorEvents from '../services/ev-editor/entityViewerEditorEvents'

export default function (
	$mdDialog,
	instrumentService,
	gridTableHelperService,
	multitypeFieldService
) {
	return {
		require: '^^bindFieldControl',
		restrict: 'E',
		scope: {
			item: '=',
			entity: '=',
		},
		templateUrl: 'views/directives/bind-field-table-view.html',
		link: function (scope, elem, attr, bfcVm) {
			scope.readyStatus = false
			scope.entityType = bfcVm.entityType
			/* Scheme object: {form_message: string, items: Array} */
			scope.rowAdditionSchemes = []

			scope.popupX = { value: null }
			scope.popupY = { value: null }
			scope.addBtnPopupTemplate = `<div class="ev-user-tab-add-row-popup-container">
						<div data-ng-repeat="item in popupData.items | orderBy: 'order'"
							 class="add-row-item"
							 data-ng-click="popupData.onAddBtnClick(item)">{{item.name}}</div>
						<div ng-if="popupData.buttons.length" class="buttons-holder">
							<div ng-repeat="button in popupData.buttons"
							 	 ng-bind="button.name"
							 	 ng-click="button.onClick($event, _$popup)" class="add-row-item"></div>
						</div>
					</div>`
			// <div data-ng-if="popupData.showBuildButton" class="add-row-item build-accruals">Build accruals</div>

			const minTableColWidth = 50
			const maxTableColWidth = 400
			let columnsNumber = 0
			const generalCellTypes = []
			const useIdForOptions = [
				'periodicity',
				'accrual_calculation_model',
				'event_class',
				'notification_class',
			]
			/** Helps to determine which of multiple tables changed */
			let thisTableChanged = false
			// let thisTableChanged = {value: false}
			let entitySpecificData
			let tableTopPanelIsOn = false
			let tableColumnsList
			/** Assembles header and templateRow */
			let assembleGridTable
			/**
			 * Fill each grid table row's cell with data from entity. Used inside function convertDataForGridTable.
			 *
			 * @param item {Object} - matching to row data from entity
			 * @param row {Object} - grid table row data
			 */
			let fillGridTableRowCells
			let tableKey = scope.item.key

			const gridTableData = {
				header: {
					order: 'header',
					columns: [],
				},
				templateRow: {
					isActive: false,
					columns: [],
				},
				body: [],
				components: {},
			}

			const loadInstrumentPeriodicity = function () {
				return new Promise((res, rej) => {
					instrumentPeriodicityService
						.getList()
						.then((data) => {
							entitySpecificData.selectorOptions.periodicity = data.map(
								(periodicity) => {
									return {
										id: periodicity.id,
										name: periodicity.name,
									}
								}
							)

							res()
						})
						.catch((error) => rej(error))
				})
			}

			const loadInstrumentType = function () {
				return new Promise((res, rej) => {
					if (
						scope.entity.instrument_type ||
						scope.entity.instrument_type === 0
					) {
						instrumentTypeService
							.getByKey(scope.entity.instrument_type)
							.then((instrTypeData) => {
								const resData = instrTypeData || []
								res(resData)
							})
							.catch((error) => rej(error))
					} else {
						res()
					}
				})
			}

			//region Instrument accruals
			const instrumentAccrualsColumns = {
				notes: {
					key: 'notes',
					objPath: ['notes'],
					cellType: 'text',
					settings: {
						value: null,
						closeOnMouseOut: false,
					},
				},
				accrual_start_date: {
					key: 'accrual_start_date',
					objPaths: [['accrual_start_date'], ['accrual_start_date_value_type']],
					cellType: 'multitypeField',
					settings: {
						value: [null, null],
						fieldTypesData: null,
					},
				},
				first_payment_date: {
					key: 'first_payment_date',
					objPaths: [['first_payment_date'], ['first_payment_date_value_type']],
					cellType: 'multitypeField',
					settings: {
						value: [null, null],
						fieldTypesData: null,
					},
				},
				accrual_size: {
					key: 'accrual_size',
					objPaths: [['accrual_size'], ['accrual_size_value_type']],
					cellType: 'multitypeField',
					settings: {
						value: [null, null],
						fieldTypesData: null,
					},
				},
				accrual_calculation_model: {
					key: 'accrual_calculation_model',
					objPath: ['accrual_calculation_model'],
					cellType: 'selector',
					settings: {
						value: null,
					},
				},
				periodicity: {
					key: 'periodicity',
					objPath: ['periodicity'],
					cellType: 'selector',
					settings: {
						value: null,
					},
				},
				periodicity_n: {
					key: 'periodicity_n',
					objPaths: [['periodicity_n'], ['periodicity_n_value_type']],
					cellType: 'multitypeField',
					settings: {
						value: [null, null],
						fieldTypesData: null,
					},
				},
			}

			let multitypeFieldsForRows

			const loadDataForInstrumentAccruals = function () {
				entitySpecificData = {
					selectorOptions: {
						accrual_calculation_model: [],
						periodicity: [],
					},
				}

				const calcModelProm = new Promise((res, rej) => {
					accrualCalculationModelService
						.getList()
						.then((data) => {
							entitySpecificData.selectorOptions.accrual_calculation_model =
								data.map((cModel) => {
									return {
										id: cModel.id,
										name: cModel.name,
									}
								})
							res()
						})
						.catch((error) => rej(error))
				})

				const periodicityProm = loadInstrumentPeriodicity()

				const instrTypeAccrualsProm = new Promise((res, rej) => {
					loadInstrumentType()
						.then((instrTypeData) => {
							const accrualsScheme = instrTypeData.accruals || []

							scope.rowAdditionSchemes = accrualsScheme.map((scheme) => {
								return {
									id: scheme.id,
									name: scheme.name,
									order: scheme.order,
									data: scheme.data,
								}
							})

							res()
						})
						.catch((error) => rej(error))

					/* if (scope.entity.instrument_type || scope.entity.instrument_type === 0) {

							instrumentTypeService.getByKey(scope.entity.instrument_type).then(instrTypeData => {

								scope.accrualsShemes = instrTypeData.accruals || [];
								res();

							}).catch(error => rej(error));

						} else {
							res();
						} */
				})

				return Promise.allSettled([
					calcModelProm,
					periodicityProm,
					instrTypeAccrualsProm,
				])
			}
			//endregion

			//region Instrument events
			const openInstrumentEventActionParametersManager = function (
				$event,
				row
			) {
				const event = JSON.parse(
					angular.toJson(scope.entity[bfcVm.fieldKey][row.order])
				)
				const instrAttrTypes =
					bfcVm.evEditorDataService.getEntityAttributeTypes()

				$mdDialog
					.show({
						controller: 'InstrumentEventParameterDialogController as vm',
						templateUrl:
							'views/dialogs/instrument-event-parameter-dialog-view.html',
						parent: angular.element(document.body),
						targetEvent: $event,
						multiple: true,
						locals: {
							data: {
								instrumentAttrTypes: instrAttrTypes,
								item: event,
								changeOnlyValue: true,
							},
						},
					})
					.then((res) => {
						if (res.status === 'agree') {
							scope.entity[bfcVm.fieldKey][row.order] = res.data.item
						}
					})
			}

			const instrumentEventsColumns = {
				name: {
					key: 'name',
					objPath: ['name'],
					cellType: 'text',
					settings: {
						value: null,
					},
				},
				event_class: {
					key: 'event_class',
					objPath: ['event_class'],
					cellType: 'selector',
					settings: {
						value: null,
						selectorOptions: [],
					},
				},
				effective_date: {
					key: 'effective_date',
					objPaths: [['effective_date'], ['effective_date_value_type']],
					cellType: 'multitypeField',
					settings: {
						value: [null, null],
						fieldTypesData: null,
					},
				},
				final_date: {
					key: 'final_date',
					objPaths: [['final_date'], ['final_date_value_type']],
					cellType: 'multitypeField',
					settings: {
						value: [null, null],
						fieldTypesData: null,
					},
				},
				description: {
					key: 'description',
					objPath: ['description'],
					cellType: 'text',
					settings: {
						value: null,
					},
				},
				periodicity: {
					key: 'periodicity',
					objPath: ['periodicity'],
					cellType: 'selector',
					settings: {
						value: null,
						selectorOptions: [],
					},
				},
				periodicity_n: {
					key: 'periodicity_n',
					objPaths: [['periodicity_n'], ['periodicity_n_value_type']],
					cellType: 'multitypeField',
					settings: {
						value: [null, null],
						fieldTypesData: null,
					},
				},
				notification_class: {
					key: 'notification_class',
					objPath: ['notification_class'],
					cellType: 'selector',
					settings: {
						value: null,
						selectorOptions: [],
					},
				},
				notify_in_n_days: {
					key: 'notify_in_n_days',
					objPath: ['notify_in_n_days'],
					cellType: 'number',
					settings: {
						value: null,
					},
				},
				parameters: {
					key: 'parameters',
					objPath: ['data', 'parameters'],
					cellType: 'button',
					settings: {
						buttonContent: '<span class="material-icons">more_horiz</span>',
					},
					methods: {
						onClick: openInstrumentEventActionParametersManager,
					},
					classes: ['gt-more-btn'],
				},
			}

			const loadDataForInstrumentEvents = function () {
				entitySpecificData = {
					selectorOptions: {
						event_class: [],
						periodicity: [],
						notification_class: [],
					},
				}

				const eventClassProm = new Promise(async (res, rej) => {
					metaEventClassService
						.getList()
						.then((data) => {
							entitySpecificData.selectorOptions.event_class = data
							res()
						})
						.catch((error) => rej(error))
				})

				const periodicityProm = loadInstrumentPeriodicity()

				const notifClassProm = new Promise(async (res, rej) => {
					metaNotificationClassService
						.getList()
						.then((data) => {
							entitySpecificData.selectorOptions.notification_class = data
							res()
						})
						.catch((error) => rej(error))
				})

				const instrTypeEventsProm = new Promise((res, rej) => {
					loadInstrumentType()
						.then((instrTypeData) => {
							const eventsSchemes = instrTypeData.events || []

							scope.rowAdditionSchemes = eventsSchemes.map((scheme) => {
								let fields = scheme.data.items

								/*if (!scheme.data.items_blocked) {
									fields = fields.concat(scheme.data.blockableItems);
								}*/
								fields = fields.concat(scheme.data.items2)

								return {
									id: scheme.id,
									name: scheme.name,
									order: scheme.order,
									data: {
										actions: scheme.data.actions,
										form_message: scheme.data.form_message,
										event_class: scheme.data.event_class,
										items: fields,
										parameters: scheme.data.parameters,
									},
								}
							})

							res()
						})
						.catch((error) => rej(error))
				})

				return Promise.allSettled([
					eventClassProm,
					periodicityProm,
					notifClassProm,
					instrTypeEventsProm,
				])
			}
			//endregion

			const addSelectedHiddenOption = function (column) {
				const columnSelector =
					entitySpecificData.selectorOptions.hasOwnProperty(column.key)
				const optionSelectedInCustomizableSelector =
					(column.settings.value || column.settings.value === 0) &&
					columnSelector
				const idProp = useIdForOptions.includes(column.key) ? 'id' : 'user_code'

				if (optionSelectedInCustomizableSelector) {
					const optionIndex = column.settings.selectorOptions.findIndex(
						(option) => option.id === column.settings.value
					)

					if (optionIndex < 0) {
						// if selected option hidden, add it until another selected

						const optionData = entitySpecificData.selectorOptions[
							column.key
						].find((option) => {
							return option[idProp] === column.settings.value
						})

						column.settings.selectorOptions.push({
							id: optionData[idProp],
							name: optionData.name,
						})
					}
				}
			}

			const openRowAdditionDialog = async function (
				scheme,
				templateUrl,
				multitypeFieldsData
			) {
				const instrAttrTypes =
					bfcVm.evEditorDataService.getEntityAttributeTypes()

				return $mdDialog.show({
					controller: 'AddRowToTableInsideEvUserTabDialogController as vm',
					templateUrl: templateUrl,
					parent: angular.element(document.body),
					clickOutsideToClose: false,
					multiple: true,
					locals: {
						data: {
							// accrualScheme: scheme,
							schemeData: scheme.data,
							entity: scope.entity,
							multitypeFieldsData: multitypeFieldsData,
							attributeTypes: instrAttrTypes,
						},
					},
				})
			}

			/* const onAccrualsTableChangeCell = function (rowOrder, colKey) {

					const cell = scope.gridTableDataService.getCellByKey(rowOrder, colKey);

					if (cell.cellType === 'multitypeField') {

						const typeKey = `${colKey}_value_type`;
						const activeType = cell.settings.fieldTypesData.find(type => type.isActive);

						scope.entity[bfcVm.fieldKey][rowOrder][typeKey] = activeType.value_type;

					}

				}; */

			const addNewRow = function (rowData) {
				const newRowKey = metaHelper.generateUniqueId('user_tabs_' + tableKey)

				rowData.frontOptions = { newRow: true, gtKey: newRowKey }

				const rowObj = metaHelper.recursiveDeepCopy(gridTableData.templateRow)

				rowObj.key = newRowKey
				rowObj.newRow = true

				/* rowObj.columns.forEach(column => {

						column.settings.value = metaHelper.getObjectNestedPropVal(accrual, column.objPath);

						if (column.cellType === 'selector') {
							/!* const optionIndex = column.settings.selectorOptions.findIndex(option => option.id === column.settings.value);

							if (optionIndex < 0) { // if selected option hidden, add it until another selected

								const optionData = entitySpecificData.selectorOptions[column.key].find(option => {
									return option.id === column.settings.value;
								});

								if (optionData) {

									column.settings.selectorOptions.push({
										id: optionData.id,
										name: optionData.name
									});

								}

							} *!/
							addSelectedHiddenOption(column);
						}

						else if (column.cellType === 'multitypeField') {
							makeMultitypeFieldCell(column, accrual);
						}

					}); */
				fillGridTableRowCells(rowData, rowObj)

				scope.entity[bfcVm.fieldKey].unshift(rowData)
				gridTableData.body.unshift(rowObj)

				// Update rows in grid table
				scope.entity[bfcVm.fieldKey].forEach(function (item, itemIndex) {
					gridTableData.body[itemIndex].order = itemIndex
				})

				thisTableChanged = true
				bfcVm.evEditorEventService.dispatchEvent(
					evEditorEvents.TABLE_INSTANCE_CHANGED,
					{ key: tableKey }
				)

				scope.$apply()
			}

			const onTableAddRow = async function (
				gtDataService,
				gtEventService,
				$event
			) {
				scope.popupX.value = $event.pageX
				scope.popupY.value = $event.pageY

				scope.gridTableEventService.dispatchEvent(popupEvents.OPEN_POPUP, {
					doNotUpdateScope: true,
				})
			}

			/* const makeMultitypeFieldCell = function (rowData, column) {

					const fieldTypesList = JSON.parse(JSON.stringify(multitypeFieldsForRows[column.key].fieldTypesList));
					const multitypeFieldData = multitypeFieldService.setActiveTypeByValueType(fieldTypesList, rowData.default_value, rowData.default_value_type);

					column.settings = {
						value: rowData.default_value,
						fieldTypesData: multitypeFieldData
					}

				} */

			assembleGridTable = function () {
				const tableData = scope.item.options.tableData
				if (scope.item.options.label)
					gridTableData.name = scope.item.options.label

				let shownColIndex = 0

				tableData.forEach((column) => {
					var columnData = tableColumnsList[column.key]

					if (column.to_show && columnData) {
						columnData.columnName = column.override_name
							? column.override_name
							: column.name
						columnData.order = shownColIndex
						shownColIndex = shownColIndex + 1

						if (column.options) {
							const idProp = useIdForOptions.includes(column.key)
								? 'id'
								: 'user_code'
							columnData.settings.selectorOptions = []

							column.options.forEach((option) => {
								if (option.to_show) {
									let convertedOpt = {}
									convertedOpt.id = option[idProp]
									convertedOpt.name = option.override_name
										? option.override_name
										: option.name

									columnData.settings.selectorOptions.push(convertedOpt)
								}
							})
						}

						gridTableData.header.columns.push({
							key: columnData.key,
							columnName: columnData.columnName,
							order: columnData.order,
							sorting: true,
						})

						gridTableData.templateRow.columns.push(columnData)
					}
				})

				columnsNumber = gridTableData.templateRow.columns.length

				//region Set widths for columns
				if (columnsNumber) {
					const averageWidth = (100 / columnsNumber).toFixed(1)

					gridTableData.templateRow.columns.forEach((column, colIndex) => {
						const colStyles = {
							'grid-table-cell-elem': {
								'min-width': minTableColWidth + 'px',
								width: averageWidth + '%',
								'max-width': maxTableColWidth + 'px',
							},
						}

						gridTableData.header.columns[colIndex].styles = colStyles
						column.styles = colStyles
					})
				}
				//endregion

				const rowsAddition = tableData.find(
					(item) => item.key === 'rows_addition'
				)
				const rowsDeletion = tableData.find(
					(item) => item.key === 'rows_deletion'
				)

				if (rowsAddition.to_show) {
					gridTableData.tableMethods = {
						addRow: onTableAddRow,
					}
				}

				if (
					rowsAddition.to_show ||
					rowsDeletion.to_show ||
					rowsDeletion.to_show ||
					tableTopPanelIsOn
				) {
					gridTableData.components.topPanel = {}

					gridTableData.components.topPanel.addButton = !!rowsAddition.to_show
					gridTableData.components.topPanel.rowsDeletionPanel =
						!!rowsDeletion.to_show

					gridTableData.components.rowCheckboxes = !!rowsDeletion.to_show
				}
			}

			/* if (scope.entityType === 'instrument' && scope.item.key === "event_schedules") {

					fillGridTableRowCells = function (item, row) {

						row.columns.forEach((cell, index) => {

							if (['event_class', 'periodicity', 'notification_class'].includes(cell.key)) {

								const itemProp = cell.objPath[0] + '_object';
								const selectedOptionName = item[itemProp].name;

								cell.settings.value = selectedOptionName;

							} else {
								cell.settings.value = metaHelper.getObjectNestedPropVal(item, cell.objPath);
							}

						});

					};

				}
				else {

					fillGridTableRowCells = function (item, row) {

						row.columns.forEach((cell, index) => {

							if (cell.cellType === 'multitypeField') {

								/!* const fieldTypesList = multitypeFieldsForRows[cell.key].fieldTypesList;

								let valueTypePath = [...[], ...cell.objPath];
								let valueTypeLastProp = valueTypePath.pop();

								valueTypeLastProp = valueTypeLastProp + '_value_type';
								valueTypePath.push(valueTypeLastProp);

								const valueType = metaHelper.getObjectNestedPropVal(item, valueTypePath); *!/
								if (cell.hasOwnProperty('objPaths')) {

									const fieldTypesList = multitypeFieldsForRows[cell.key].fieldTypesList;

									const cellValuePath = cell.objPaths[0];
									const cellValueTypePath = cell.objPaths[1];

									const cellValue = metaHelper.getObjectNestedPropVal(item, cellValuePath);
									const valueType = metaHelper.getObjectNestedPropVal(item, cellValueTypePath);

									const cellData = gridTableHelperService.getMultitypeFieldDataForCell(fieldTypesList, cell, cellValue, valueType);
									row.columns[index] = cellData.cell;

									// for existing accruals without _value_type
									if (!valueType && !isNaN(valueType)) {
										metaHelper.setObjectNestedPropVal(item, cellValueTypePath, cellData.valueType);
									}

								}

							}
							else {

								cell.settings.value = metaHelper.getObjectNestedPropVal(item, cell.objPath);

								if (cell.cellType === 'selector') {
									/!* const optionIndex = column.settings.selectorOptions.findIndex(option => option.id === column.settings.value);

									if (optionIndex < 0) { // if selected option hidden, add it until another selected

										const optionData = entitySpecificData.selectorOptions[column.key].find(option => {
											return option.id === column.settings.value;
										});

										if (optionData) {

											column.settings.selectorOptions.push({
												id: optionData.id,
												name: optionData.name
											});

										}

									} *!/
									addSelectedHiddenOption(cell);
								}

							}

						});

					};

				} */
			/**
			 *
			 * @param item {Object} - data of event or accrual
			 * @param row {Object} - grid table row
			 */
			const fillGridTableRowCellsMethod1 = function (item, row) {
				row.columns.forEach((cell, index) => {
					if (cell.cellType === 'multitypeField') {
						/* const fieldTypesList = multitypeFieldsForRows[cell.key].fieldTypesList;

							let valueTypePath = [...[], ...cell.objPath];
							let valueTypeLastProp = valueTypePath.pop();

							valueTypeLastProp = valueTypeLastProp + '_value_type';
							valueTypePath.push(valueTypeLastProp);

							const valueType = metaHelper.getObjectNestedPropVal(item, valueTypePath); */
						if (cell.hasOwnProperty('objPaths')) {
							const fieldTypesList =
								multitypeFieldsForRows[cell.key].fieldTypesList

							const cellValuePath = cell.objPaths[0]
							const cellValueTypePath = cell.objPaths[1]

							const cellValue = metaHelper.getObjectNestedPropVal(
								item,
								cellValuePath
							)
							const valueType = metaHelper.getObjectNestedPropVal(
								item,
								cellValueTypePath
							)

							const cellData =
								gridTableHelperService.getMultitypeFieldDataForCell(
									fieldTypesList,
									cell,
									cellValue,
									valueType
								)
							row.columns[index] = cellData.cell

							// for existing accruals without _value_type
							if (!valueType && !isNaN(valueType)) {
								metaHelper.setObjectNestedPropVal(
									item,
									cellValueTypePath,
									cellData.valueType
								)
							}
						}
					} else if (cell.cellType !== 'button') {
						cell.settings.value = metaHelper.getObjectNestedPropVal(
							item,
							cell.objPath
						)

						if (cell.cellType === 'selector') {
							/* const optionIndex = column.settings.selectorOptions.findIndex(option => option.id === column.settings.value);

								if (optionIndex < 0) { // if selected option hidden, add it until another selected

									const optionData = entitySpecificData.selectorOptions[column.key].find(option => {
										return option.id === column.settings.value;
									});

									if (optionData) {

										column.settings.selectorOptions.push({
											id: optionData.id,
											name: optionData.name
										});

									}

								} */
							addSelectedHiddenOption(cell)
						}
					}
				})
			}

			fillGridTableRowCells = fillGridTableRowCellsMethod1

			const convertDataForGridTable = function () {
				if (!scope.entity[bfcVm.fieldKey]) scope.entity[bfcVm.fieldKey] = []

				gridTableData.body = []

				scope.entity[bfcVm.fieldKey].forEach((rowData, rowIndex) => {
					const rowObj = metaHelper.recursiveDeepCopy(
						gridTableData.templateRow,
						true
					)

					rowObj.key = rowData.hasOwnProperty('id')
						? rowData.id
						: rowData.frontOptions.gtKey
					rowObj.newRow = !!(
						rowData.frontOptions && rowData.frontOptions.newRow
					)
					rowObj.order = rowIndex

					/*rowObj.columns.forEach(column => {

							column.settings.value = metaHelper.getObjectNestedPropVal(rowData, column.objPath);

							if (column.cellType === 'selector') {
								addSelectedHiddenOption(column);
							}

							if (column.cellType === 'multitypeField') {
								makeMultitypeFieldCell(rowData, column);
							}

						});*/
					fillGridTableRowCells(rowData, rowObj)

					gridTableData.body.push(rowObj)
				})

				scope.gridTableDataService.setTableData(gridTableData)
			}

			const setTableMinWidth = function () {
				const element = elem[0].querySelector('.bind-field-table-content')
				element.style['min-width'] = minTableColWidth * columnsNumber + 'px'
			}

			const init = async function () {
				let asyncOperation = false

				scope.gridTableDataService = new GridTableDataService()
				scope.gridTableEventService = new EventService()

				/* scope.gridTableEventService.addEventListener(gridTableEvents.CELL_VALUE_CHANGED, argumentsObj => {

						if (scope.entityType === 'instrument') {
							onAccrualsTableChangeCell(argumentsObj.row.order, argumentsObj.column.key);
						}

					}) */

				if (scope.entityType === 'instrument') {
					if (tableKey === 'accrual_calculation_schedules') {
						tableColumnsList = instrumentAccrualsColumns
						multitypeFieldsForRows =
							instrumentService.getInstrumentAccrualsMultitypeFieldsData()

						await loadDataForInstrumentAccruals()

						let buttonsList = []
						const buildBtn = scope.item.options.tableData.find(
							(item) => item.key === 'build_accruals_btn'
						)

						if (buildBtn.to_show) {
							tableTopPanelIsOn = true

							buttonsList.push({
								key: buildBtn.key,
								name: 'Build accruals',
								onClick: function ($event, _$popup) {
									_$popup.cancel()

								},
							})
						}

						scope.popupData = {
							items: scope.rowAdditionSchemes,
							buttons: buttonsList,
							// showBuildButton: scope.item.options.tableData.find(item => item.key === 'build_accruals_btn').to_show,
							onAddBtnClick: async (item) => {
								scope.gridTableEventService.dispatchEvent(
									popupEvents.CLOSE_POPUP
								)
								const accrMultitypeFieldsData =
									instrumentService.getInstrumentAccrualsMultitypeFieldsData()
								const templateUrl =
									'views/dialogs/bindFieldTable/bft-add-accrual-row-dialog-view.html'

								const res = await openRowAdditionDialog(
									item,
									templateUrl,
									accrMultitypeFieldsData
								)

								if (res.status === 'agree') {
									const accrual = res.data.item

									addNewRow(accrual)
								}
							},
						}
					} else if (tableKey === 'event_schedules') {
						tableColumnsList = instrumentEventsColumns
						multitypeFieldsForRows =
							instrumentService.getInstrumentEventsMultitypeFieldsData()

						await loadDataForInstrumentEvents()

						let buttonsList = []

						const parametersBtn = scope.item.options.tableData.find(
							(item) => item.key === 'parameters'
						)

						if (parametersBtn && parametersBtn.to_show) {
							fillGridTableRowCells = function (item, row) {
								fillGridTableRowCellsMethod1(item, row)

								const parametersCell = row.columns.find(
									(cell) => cell.key === 'parameters'
								)

								const eventHasNoParameters =
									!item.data ||
									!item.data.parameters ||
									item.data.parameters.length === 0

								if (eventHasNoParameters) {
									parametersCell.cellType = 'empty'
									delete parametersCell.settings
								}
							}
						}

						const buildBtn = scope.item.options.tableData.find(
							(item) => item.key === 'build_events_btn'
						)

						if (buildBtn.to_show) {
							tableTopPanelIsOn = true

							buttonsList.push({
								key: buildBtn.key,
								name: 'Build events',
								onClick: function ($event, _$popup) {
									_$popup.cancel()

								},
							})
						}

						scope.popupData = {
							items: scope.rowAdditionSchemes,
							buttons: buttonsList,
							// showBuildButton: scope.item.options.tableData.find(item => item.key === 'build_events_btn').to_show,
							onAddBtnClick: async (item) => {
								scope.gridTableEventService.dispatchEvent(
									popupEvents.CLOSE_POPUP
								)
								const eventsMultitypeFieldsData =
									instrumentService.getInstrumentEventsMultitypeFieldsData()
								const templateUrl =
									'views/dialogs/bindFieldTable/bft-add-event-row-dialog-view.html'

								const res = await openRowAdditionDialog(
									item,
									templateUrl,
									eventsMultitypeFieldsData
								)

								if (res.status === 'agree') {
									const event = res.data.item
									event.data = {
										parameters: item.data.parameters,
									}
									event.event_class = item.data.event_class
									event.actions = item.data.actions || []

									event.actions.forEach((action) => {
										action.frontOptions = {
											gtKey: metaHelper.generateUniqueId(
												'eventScheduleAction' + action.button_position
											),
										}
									})

									addNewRow(event)
								}
							},
						}
					}

					if (multitypeFieldsForRows) {
						const instrumentAttrTypes =
							bfcVm.evEditorDataService.getEntityAttributeTypes()
						multitypeFieldService.fillSelectorOptionsBasedOnValueType(
							instrumentAttrTypes,
							multitypeFieldsForRows
						)
					}

					// Update selector options after dynamic attributes change
					bfcVm.evEditorEventService.addEventListener(
						evEditorEvents.DYNAMIC_ATTRIBUTES_CHANGE,
						() => {
							const instrumentAttrTypes =
								bfcVm.evEditorDataService.getEntityAttributeTypes()
							instrumentService.updateMultitypeFieldSelectorOptionsInsideGridTable(
								instrumentAttrTypes,
								multitypeFieldsForRows,
								gridTableData
							)
						}
					)

					asyncOperation = true
				}

				assembleGridTable()
				setTableMinWidth()
				convertDataForGridTable()

				scope.readyStatus = true
				if (asyncOperation) scope.$apply()

				scope.gridTableEventService.addEventListener(
					gridTableEvents.CELL_VALUE_CHANGED,
					function (argObj) {
						thisTableChanged = true
						instrumentService.onGtCellChange(
							argObj,
							scope.entity,
							scope.gridTableDataService,
							bfcVm.evEditorEventService,
							tableKey
						)
					}
				)

				scope.gridTableEventService.addEventListener(
					gridTableEvents.ROW_DELETED,
					function (argObj) {
						thisTableChanged = true
						instrumentService.onGtRowDeletion(
							argObj,
							scope.entity,
							bfcVm.evEditorEventService,
							tableKey
						)
					}
				)

				bfcVm.evEditorEventService.addEventListener(
					evEditorEvents.TABLE_INSTANCE_CHANGED,
					(argObj) => {
						if (argObj && argObj.key === tableKey && !thisTableChanged) {
							convertDataForGridTable()
							// const tableData = scope.gridTableDataService.getTableData();

							scope.gridTableEventService.dispatchEvent(gtEvents.REDRAW_TABLE)
						}

						thisTableChanged = false
					}
				)
			}

			init()
		},
	}
}
