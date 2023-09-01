/**
 * Created by vzubr on 19.02.2021.
 */

import metaService from '@/angular/services/metaService'
import GridTableDataService from '@/angular/services/gridTableDataService'
import GridTableEventService from '@/angular/services/gridTableEventService'

import gridTableEvents from '@/angular/services/gridTableEvents'
import evEditorEvents from '@/angular/services/ev-editor/entityViewerEditorEvents'

import metaHelper from '@/angularlpers/meta.helper'

import instrumentPeriodicityService from '@/angular/services/instrumentPeriodicityService'
import accrualCalculationModelService from '@/angular/services/accrualCalculationModelService'

import instrumentAttributeTypeService from '@/angular/services/instrument/instrumentAttributeTypeService'

export default function instrumentTypeAccrualsTabController(
	$scope,
	$mdDialog,
	instrumentService,
	fieldResolverService,
	multitypeFieldService,
	gridTableHelperService
) {
	var vm = this
	// const gridTableHelperService = new GridTableHelperService();

	vm.entity = $scope.$parent.vm.entity

	if (!vm.entity.accruals) vm.entity.accruals = []

	vm.evEditorDataService = $scope.$parent.vm.evEditorDataService
	vm.evEditorEventService = $scope.$parent.vm.evEditorEventService

	vm.readyStatus = {
		periodicityItems: false,
		accrualModels: false,

		topPart: false,
		accrualsAccordions: false,
	}

	vm.evEditorFieldEvent = {}

	//<editor-fold desc="Accordion actions menu">
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
		accrual_calculation_model: [],
		periodicity: [],
	}

	const findAccrualById = (accrual, accrualId) => {
		if (accrual.id || accrual.id === 0) return accrual.id === accrualId

		return accrual.frontOptions.id === accrualId
	}

	const getPaymentSizeDetailFields = function () {
		return new Promise((res) => {
			fieldResolverService
				.getFields('payment_size_detail', {
					entityType: 'instrument',
					key: 'payment_size_detail',
					pageSize: 1000,
				})
				.then((fieldsData) => {
					vm.dailyPricingModelFields = metaHelper.textWithDashSort(
						fieldsData.data
					)

					res()
				})
				.catch((error) => {
					console.error('getPaymentSizeDetailFields', error)
					res()
				})
		})
	}

	const getCurrencyFields = function () {
		return new Promise((res) => {
			fieldResolverService
				.getFields('accrued_currency', {
					entityType: 'instrument',
					key: 'accrued_currency',
					pageSize: 1000,
				})
				.then((fieldsData) => {
					vm.currencyFields = metaHelper.textWithDashSort(fieldsData.data)
					vm.currencyFields = vm.currencyFields.map((field) => {
						return { id: field.id, name: field.short_name }
					})

					res()
				})
				.catch((error) => {
					console.error('getCurrencyFields', error)
					res()
				})
		})
	}

	vm.onNameFocus = function (event) {
		var textAreaElement = event.target

		textAreaElement.addEventListener('keydown', function (evt) {
			// TODO Must I remove listeners? And what event?
			evt.stopPropagation()
		})
	}

	var onAccrualTableCellChange = function (
		data,
		gtDataService,
		gtEventService
	) {
		const tableData = gtDataService.getTableData()

		const cell = gtDataService.getCellByKey(data.row.order, data.column.key)
		const path = cell.objPath[0]
		let accrual = vm.entity.accruals.find((accrual) =>
			findAccrualById(accrual, tableData.accrualId)
		)

		accrual.data.items[data.row.order][path] = cell.settings.value

		vm.onRequiredFieldChange('accruals')

		if (cell.key === 'default_value' && cell.cellType === 'multitypeField') {
			const activeType = cell.settings.fieldTypesData.find(
				(type) => type.isActive
			)
			accrual.data.items[data.row.order].default_value_type =
				activeType.value_type
		}
	}

	var getAccrualsGridTableData = function (item) {
		var rows = item.data.items

		const accrualsGridTableData = {
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
		}

		const rowObj = metaHelper.recursiveDeepCopy(
			accrualsGridTableData.templateRow,
			true
		)
		accrualsGridTableData.header.columns = rowObj.columns.map((column) => {
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

		accrualsGridTableData.body = rows.map((row, index) => {
			const rowObj = metaHelper.recursiveDeepCopy(
				accrualsGridTableData.templateRow,
				true
			)

			rowObj.order = index
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

				/* const fieldTypesList = JSON.parse(JSON.stringify(multitypeFieldsForRows[rowObj.key].fieldTypesList));
                    multitypeFieldService.setActiveTypeByValueType(fieldTypesList, row.default_value, row.default_value_type);

					rowObj.columns[2].settings = {
                        value: row.default_value,
                        fieldTypesData: fieldTypesList
                    }; */
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

		return accrualsGridTableData
	}

	vm.createInstrumentTypeAccrual = function () {
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
		// var accrualModelsSelectorOptions = vm.accrualModels.map(mapOptions)
		var accrualModelsSelectorOptions =
			vm.selectorOptionsMap.accrual_calculation_model.map(mapOptions)

		var accrual = {
			accrualsGridTableDataService: new GridTableDataService(),
			accrualsGridTableEventService: new GridTableEventService(),
			name: '',
			frontOptions: {
				id: metaHelper.generateUniqueId(vm.entity.accruals.length),
			},
			order: vm.entity.accruals.length,
			autogenerate: true,
			data: {
				form_message: '',
				items: [
					{
						key: 'notes',
						name: 'Notes',
						to_show: true,
						defaultValueType: 'text',
					},
					{
						key: 'accrual_start_date',
						name: 'First accrual date',
						to_show: true,
						defaultValueType: 'multitypeField',
					},
					{
						key: 'first_payment_date',
						name: 'First payment date',
						to_show: true,
						defaultValueType: 'multitypeField',
					},
					{
						key: 'accrual_size',
						name: 'Accrual size',
						to_show: true,
						defaultValueType: 'multitypeField',
					},
					{
						key: 'periodicity',
						name: 'Periodicity',
						to_show: true,
						defaultValueType: 'selector',
						selectorOptions: vm.selectorOptionsMap.periodicity,
						options_settings: periodicitySelectorOptions,
					},
					{
						key: 'accrual_calculation_model',
						name: 'Accrual model',
						to_show: true,
						defaultValueType: 'selector',
						selectorOptions: vm.selectorOptionsMap.accrual_calculation_model,
						options_settings: accrualModelsSelectorOptions,
					},
					{
						key: 'periodicity_n',
						name: 'Periodic N',
						to_show: true,
						defaultValueType: 'multitypeField',
					},
				],
			},
		}

		accrual.accrualsGridTableEventService.addEventListener(
			gridTableEvents.CELL_VALUE_CHANGED,
			function (argumentsObj) {
				onAccrualTableCellChange(
					argumentsObj,
					accrual.accrualsGridTableDataService,
					accrual.accrualsGridTableEventService
				)
			}
		)

		var accrualGridTableData = getAccrualsGridTableData(accrual)

		accrualGridTableData.accrualId = accrual.frontOptions.id
		accrual.accrualsGridTableDataService.setTableData(accrualGridTableData)

		vm.entity.accruals.push(accrual)
	}

	vm.toggleItem = function ($pane, item, $event) {
		$event.stopPropagation()

		var isTextInputElement = $event.target.closest(
			'.instrument-type-accrual-name-input'
		)

		if (!isTextInputElement) {
			$pane.toggle()
			item.isPaneExpanded = !item.isPaneExpanded
		}
	}

	vm.moveDown = function (item, $event) {
		$event.stopPropagation()

		if (vm.entity.accruals[item.order + 1]) {
			const swap = item

			vm.entity.accruals[item.order] = vm.entity.accruals[item.order + 1]
			vm.entity.accruals[item.order].order = item.order

			vm.entity.accruals[item.order + 1] = swap
			vm.entity.accruals[item.order + 1].order = item.order + 1
		}
	}

	vm.moveUp = function (item, $event) {
		$event.stopPropagation()

		if (vm.entity.accruals[item.order - 1]) {
			const swap = item

			vm.entity.accruals[item.order] = vm.entity.accruals[item.order - 1]
			vm.entity.accruals[item.order].order = item.order

			vm.entity.accruals[item.order - 1] = swap
			vm.entity.accruals[item.order - 1].order = item.order - 1
		}
	}

	vm.deletePane = function (item, $event, _$popup) {
		$event.stopPropagation()

		var description = 'Are you sure to delete this accrual?'

		$mdDialog
			.show({
				controller: 'WarningDialogController as vm',
				templateUrl: 'views/dialogs/warning-dialog-view.html',
				parent: angular.element(document.body),
				targetEvent: $event,
				multiple: true,
				locals: {
					warning: {
						title: 'Warning',
						description: description,
					},
				},
			})
			.then((res) => {
				if (res.status === 'agree') {
					vm.entity.accruals.splice(item.order, 1)
					vm.entity.accruals.forEach(
						(accrual, index) => (accrual.order = index)
					)
				}
			})

		_$popup.cancel()
	}

	vm.makeCopy = function (accrualToCopy, _$popup) {
		_$popup.cancel()
		vm.accrualsAccordion.collapseAll()

		const accrualOrder = accrualToCopy.order
		const accrualCopy = JSON.parse(angular.toJson(accrualToCopy))

		delete accrualCopy.id
		if (!accrualCopy.frontOptions) accrualCopy.frontOptions = {}
		accrualCopy.frontOptions.id = metaHelper.generateUniqueId(accrualOrder)

		let accrualCopyName = accrualToCopy.name + ' (Copy)'

		let a = 0,
			nameOccupied = true
		while (nameOccupied) {
			// check that copy name is unique

			nameOccupied = false

			const copyWithSameName = vm.entity.accruals.find(
				(accrual) => accrual.name === accrualCopyName
			)

			if (copyWithSameName) {
				a++

				accrualCopyName = accrualToCopy.name + ' (Copy ' + a + ')'
				nameOccupied = true
			}
		}

		accrualCopy.name = accrualCopyName

		formatExistingAccrual(accrualCopy)

		vm.entity.accruals.splice(accrualOrder + 1, 0, accrualCopy)
		vm.entity.accruals.forEach((accrual, index) => (accrual.order = index))
	}

	vm.onRequiredFieldChange = function (fieldKey) {
		const locsWithErrors = vm.evEditorDataService.getLocationsWithErrors()

		if (locsWithErrors['system_tab'].hasOwnProperty('accruals')) {
			$scope.$parent.vm.onEntityChange(fieldKey)
		}
	}

	let instrumentAttrTypes

	const multitypeFieldsForRows =
		instrumentService.getInstrumentAccrualsMultitypeFieldsData()
	/* {
            'accrual_start_date': {
            	value_type: 40, // used to filter instrument user attributes options for dropdownSelect
                fieldDataList: [
                    {
                        'model': "",
                        'fieldType': 'dateInput',
                        'isDefault': true,
                        'isActive': true,
                        'sign': '<div class="multitype-field-type-letter type-with-constant">D</div>',
						'value_type': 40,
                        'fieldData': {
                            'smallOptions': {'dialogParent': '.dialog-containers-wrap'}
                        }
                    },
                    {
                        'model': null,
                        'fieldType': 'dropdownSelect',
                        'isDefault': false,
                        'isActive': false,
                        'sign': '<div class="multitype-field-type-letter">L</div>',
						'value_type': 70,
                        'fieldData': {
                            'smallOptions': {'dialogParent': '.dialog-containers-wrap'}
                        }
                    }
                ]
            },
            'first_payment_date': {
				value_type: 40, // used to filter instrument user attributes options for dropdownSelect
                fieldDataList: [
                    {
                        'model': "",
                        'fieldType': 'dateInput',
                        'isDefault': true,
                        'isActive': true,
                        'sign': '<div class="multitype-field-type-letter type-with-constant">D</div>',
						'value_type': 40,
                        'fieldData': {
                            'smallOptions': {'dialogParent': '.dialog-containers-wrap'}
                        }
                    },
                    {
                        'model': null,
                        'fieldType': 'dropdownSelect',
                        'isDefault': false,
                        'isActive': false,
                        'sign': '<div class="multitype-field-type-letter">L</div>',
						'value_type': 70,
                        'fieldData': {
                            'smallOptions': {'dialogParent': '.dialog-containers-wrap'}
                        }
                    }
                ]
            },
            'accrual_size': {
            	value_type: 20, // used to filter instrument user attributes options for dropdownSelect
                fieldDataList: [
                    {
                        'model': null,
                        'fieldType': 'numberInput',
                        'isDefault': true,
                        'isActive': true,
                        'sign': '<div class="multitype-field-type-letter type-with-constant">N</div>',
						'value_type': 20,
                        'fieldData': {
                            'smallOptions': {'dialogParent': '.dialog-containers-wrap'}
                        }
                    },
                    {
                        'model': null,
                        'fieldType': 'dropdownSelect',
                        'isDefault': false,
                        'isActive': false,
                        'sign': '<div class="multitype-field-type-letter">L</div>',
						'value_type': 70,
                        'fieldData': {
                            'smallOptions': {'dialogParent': '.dialog-containers-wrap'}
                        }
                    }
                ]
            },
            'periodicity_n': {
				value_type: 20, // used to filter instrument user attributes options for dropdownSelect
                fieldDataList: [
                    {
                        'model': null,
                        'fieldType': 'numberInput',
                        'isDefault': true,
                        'isActive': true,
                        'sign': '<div class="multitype-field-type-letter type-with-constant">N</div>',
						'value_type': 20,
                        'fieldData': {
                            'smallOptions': {'dialogParent': '.dialog-containers-wrap'}
                        }
                    },
                    {
                        'model': null,
                        'fieldType': 'dropdownSelect',
                        'isDefault': false,
                        'isActive': false,
                        'sign': '<div class="multitype-field-type-letter">L</div>',
						'value_type': 70,
                        'fieldData': {
                            'smallOptions': {'dialogParent': '.dialog-containers-wrap'}
                        }
                    }
                ]
            }
        } */

	const periodicityItemsPromise = new Promise((res) => {
		instrumentPeriodicityService.getList().then((data) => {
			// vm.periodicityItems = data;
			vm.selectorOptionsMap.periodicity = data
			res()
		})
	})

	const accrualModelsPromise = new Promise((res) => {
		accrualCalculationModelService.getList().then((data) => {
			// vm.accrualModels = data;
			vm.selectorOptionsMap.accrual_calculation_model = data
			res()
		})
	})

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

	const formatExistingAccrual = function (accrual) {
		accrual.accrualsGridTableDataService = new GridTableDataService()
		accrual.accrualsGridTableEventService = new GridTableEventService()

		var accrualsGridTableData = getAccrualsGridTableData(accrual)

		accrualsGridTableData.accrualId =
			accrual.id || accrual.id === 0 ? accrual.id : accrual.frontOptions.id

		accrual.accrualsGridTableDataService.setTableData(accrualsGridTableData)

		accrual.accrualsGridTableEventService.addEventListener(
			gridTableEvents.CELL_VALUE_CHANGED,
			function (argumentsObj) {
				onAccrualTableCellChange(
					argumentsObj,
					accrual.accrualsGridTableDataService,
					accrual.accrualsGridTableEventService
				)
			}
		)
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

			vm.entity.accruals.forEach(function (item, index) {
				if (item.data) formatExistingAccrual(item)
			})
		}
	)

	const init = function () {
		const dataPromises = [
			getInstrumentAttrTypes(),
			periodicityItemsPromise,
			accrualModelsPromise,
			getPaymentSizeDetailFields(),
			getCurrencyFields(),
		]

		Promise.all(dataPromises).then((data) => {
			instrumentAttrTypes = data[0] || []

			/* Object.keys(multitypeFieldsForRows).forEach(key => {

                    const fieldTypeObj = multitypeFieldsForRows[key];
					const selType = fieldTypeObj.fieldTypesList.find(type => type.fieldType === 'dropdownSelect');

                    const formattedAttrTypes = instrumentAttrTypes
                        .filter(attrType => attrType.value_type === fieldTypeObj.value_type)
                        .map(attrType => {
                            return {id: attrType.user_code, name: attrType.short_name};
                        });

					selType.fieldData = {
                        menuOptions: formattedAttrTypes || []
                    };

                }); */
			multitypeFieldService.fillSelectorOptionsBasedOnValueType(
				instrumentAttrTypes,
				multitypeFieldsForRows
			)

			vm.entity.accruals.forEach(function (item, index) {
				if (item.data) formatExistingAccrual(item)
			})

			vm.readyStatus.topPart = true
			vm.readyStatus.accrualsAccordions = true

			$scope.$apply()
		})
	}

	init()
}
