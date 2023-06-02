/**
 * Created by szhitenev on 04.05.2016.
 */

import evEditorEvents from './ev-editor/entityViewerEditorEvents'
import InstrumentRepository from '../repositories/instrumentRepository'

export default function (
	cookieService,
	xhrService,
	uiService,
	gridTableHelperService,
	multitypeFieldService
) {
	const instrumentRepository = new InstrumentRepository(
		cookieService,
		xhrService
	)

	const getList = function (options) {
		return instrumentRepository.getList(options)
	}

	const getListLight = function (options) {
		return instrumentRepository.getListLight(options)
	}

	const getListForSelect = function (options) {
		return instrumentRepository.getListForSelect(options)
	}

	const getByKey = function (id) {
		return instrumentRepository.getByKey(id)
	}

	const create = function (instrument) {
		return instrumentRepository.create(instrument)
	}

	const update = function (id, instrument) {
		return instrumentRepository.update(id, instrument)
	}

	const patch = function (id, data) {
		return instrumentRepository.patch(id, data)
	}

	const deleteByKey = function (id) {
		return instrumentRepository.deleteByKey(id)
	}

	const updateBulk = function (instruments) {
		return instrumentRepository.updateBulk(instruments)
	}

	const deleteBulk = function (data) {
		return instrumentRepository.deleteBulk(data)
	}

	/**
	 * Used for grid tables of accruals and events schedules
	 *
	 * @param argObj {{row: Object, column: Object}} - arguments passed when dispatching grid table event CELL_VALUE_CHANGED
	 * @param entity {Object}
	 * @param gridTableDataService {Object}
	 * @param evEditorEventService {Object}
	 * @param tableKey {String}
	 */
	const onGtCellChange = function (
		argObj,
		entity,
		gridTableDataService,
		evEditorEventService,
		tableKey
	) {
		var rowOrder = argObj.row.order,
			colOrder = argObj.column.order

		gridTableHelperService.onGridTableCellChange(
			entity[tableKey],
			gridTableDataService,
			rowOrder,
			colOrder
		)

		/*if (cell.cellType === 'multitypeField') {

			var activeType = cell.settings.fieldTypesData.find(type => type.isActive);
			if (!activeType) activeType = cell.settings.fieldTypesData.find(type => type.isDefault);

			metaHelper
			entity.accrual_calculation_schedules[rowOrder][cell.key + '_value_type'] = activeType.value_type;

		}*/

		evEditorEventService.dispatchEvent(evEditorEvents.TABLE_INSTANCE_CHANGED, {
			key: tableKey,
		})
	}

	/**
	 * Used for grid tables of accruals and events schedules
	 *
	 * @param argObj {Object} - arguments passed when dispatching grid table event ROW_DELETED
	 * @param entity {{deletedRowsKeys: array}}
	 * @param evEditorEventService {Object}
	 * @param tableKey {String}
	 */
	const onGtRowDeletion = function (
		argObj,
		entity,
		evEditorEventService,
		tableKey
	) {
		entity[tableKey] = entity[tableKey].filter((item) => {
			var scheduleId = item.id || item.frontOptions.gtKey
			return !argObj.deletedRowsKeys.includes(scheduleId)
		})

		evEditorEventService.dispatchEvent(evEditorEvents.TABLE_INSTANCE_CHANGED, {
			key: tableKey,
		})
	}

	/**
	 *
	 * @param userCodes {Array<string>}
	 * @returns {Promise<Object>}
	 */
	const getEditLayoutBasedOnUserCodes = function (userCodes) {
		if (userCodes && userCodes.length) {
			var userCodesList =
				typeof userCodes === 'string' ? userCodes.split(',') : userCodes

			return new Promise(async (resolve, reject) => {
				var userCode
				var editLayoutData

				for (userCode of userCodesList) {
					try {
						editLayoutData = await uiService.getEditLayoutByUserCode(
							'instrument',
							userCode
						)
					} catch (error) {
						reject(error)
						break
					}

					if (editLayoutData.results.length) {
						resolve(editLayoutData)
						break
					}
				}

				if (!editLayoutData.results.length) {
					uiService
						.getDefaultEditLayout('instrument')
						.then((data) => {
							resolve(data)
						})
						.catch((error) => reject(error))
				}
			})
		}

		return uiService.getDefaultEditLayout('instrument')
	}

	const getInstrumentAccrualsMultitypeFieldsData = () => {
		return {
			accrual_start_date: {
				value_type: 40, // used to filter instrument user attributes options for dropdownSelect
				fieldTypesList: [
					{
						model: '',
						fieldType: 'dateInput',
						isDefault: true,
						isActive: false,
						sign: '<div class="multitype-field-type-letter type-with-constant">D</div>',
						value_type: 40,
						fieldData: {
							smallOptions: { dialogParent: '.dialog-containers-wrap' },
						},
					},
					{
						model: null,
						fieldType: 'dropdownSelect',
						isDefault: false,
						isActive: false,
						sign: '<div class="multitype-field-type-letter">L</div>',
						value_type: 70,
						fieldData: {
							menuOptions: [],
							smallOptions: { dialogParent: '.dialog-containers-wrap' },
						},
					},
				],
			},
			first_payment_date: {
				value_type: 40, // used to filter instrument user attributes options for dropdownSelect
				fieldTypesList: [
					{
						model: null,
						fieldType: 'dateInput',
						isDefault: true,
						isActive: false,
						sign: '<div class="multitype-field-type-letter type-with-constant">D</div>',
						value_type: 40,
						fieldData: {
							smallOptions: { dialogParent: '.dialog-containers-wrap' },
						},
					},
					{
						model: null,
						fieldType: 'dropdownSelect',
						isDefault: false,
						isActive: false,
						sign: '<div class="multitype-field-type-letter">L</div>',
						value_type: 70,
						fieldData: {
							menuOptions: [],
							smallOptions: { dialogParent: '.dialog-containers-wrap' },
						},
					},
				],
			},
			accrual_size: {
				value_type: 20, // used to filter instrument user attributes options for dropdownSelect
				fieldTypesList: [
					{
						model: null,
						fieldType: 'numberInput',
						isDefault: true,
						isActive: false,
						sign: '<div class="multitype-field-type-letter type-with-constant">N</div>',
						value_type: 20,
						fieldData: {
							smallOptions: { dialogParent: '.dialog-containers-wrap' },
						},
					},
					{
						model: null,
						fieldType: 'dropdownSelect',
						isDefault: false,
						isActive: false,
						sign: '<div class="multitype-field-type-letter">L</div>',
						value_type: 70,
						fieldData: {
							menuOptions: [],
							smallOptions: { dialogParent: '.dialog-containers-wrap' },
						},
					},
				],
			},
			periodicity_n: {
				value_type: 20, // used to filter instrument user attributes options for dropdownSelect
				fieldTypesList: [
					{
						model: null,
						fieldType: 'numberInput',
						isDefault: true,
						isActive: false,
						sign: '<div class="multitype-field-type-letter type-with-constant">N</div>',
						value_type: 20,
						fieldData: {
							smallOptions: { dialogParent: '.dialog-containers-wrap' },
						},
					},
					{
						model: null,
						fieldType: 'dropdownSelect',
						isDefault: false,
						isActive: false,
						sign: '<div class="multitype-field-type-letter">L</div>',
						value_type: 70,
						fieldData: {
							menuOptions: [],
							smallOptions: { dialogParent: '.dialog-containers-wrap' },
						},
					},
				],
			},
		}
	}

	const getInstrumentEventsMultitypeFieldsData = () => {
		return {
			effective_date: {
				value_type: 40, // used to filter instrument user attributes options for dropdownSelect
				fieldTypesList: [
					{
						model: '',
						fieldType: 'dateInput',
						isDefault: true,
						isActive: true,
						sign: '<div class="multitype-field-type-letter type-with-constant">D</div>',
						value_type: 40,
						fieldData: {
							smallOptions: { dialogParent: '.dialog-containers-wrap' },
						},
					},
					{
						model: null,
						fieldType: 'dropdownSelect',
						isDefault: false,
						isActive: false,
						sign: '<div class="multitype-field-type-letter">L</div>',
						value_type: 70,
						fieldData: {
							smallOptions: { dialogParent: '.dialog-containers-wrap' },
						},
					},
				],
			},
			final_date: {
				value_type: 40, // used to filter instrument user attributes options for dropdownSelect
				fieldTypesList: [
					{
						model: '',
						fieldType: 'dateInput',
						isDefault: true,
						isActive: true,
						sign: '<div class="multitype-field-type-letter type-with-constant">D</div>',
						value_type: 40,
						fieldData: {
							smallOptions: { dialogParent: '.dialog-containers-wrap' },
						},
					},
					{
						model: null,
						fieldType: 'dropdownSelect',
						isDefault: false,
						isActive: false,
						sign: '<div class="multitype-field-type-letter">L</div>',
						value_type: 70,
						fieldData: {
							smallOptions: { dialogParent: '.dialog-containers-wrap' },
						},
					},
				],
			},
			periodicity_n: {
				value_type: 20, // used to filter instrument user attributes options for dropdownSelect
				fieldTypesList: [
					{
						model: null,
						fieldType: 'numberInput',
						isDefault: true,
						isActive: true,
						sign: '<div class="multitype-field-type-letter type-with-constant">N</div>',
						value_type: 20,
						fieldData: {
							smallOptions: { dialogParent: '.dialog-containers-wrap' },
						},
					},
					{
						model: null,
						fieldType: 'dropdownSelect',
						isDefault: false,
						isActive: false,
						sign: '<div class="multitype-field-type-letter">L</div>',
						value_type: 70,
						fieldData: {
							smallOptions: { dialogParent: '.dialog-containers-wrap' },
						},
					},
				],
			},
		}
	}

	const getInstrumentFactorsMultitypeFieldsData = () => {
		return {
			effective_date: {
				value_type: 40,
				fieldTypesList: [
					{
						model: '',
						fieldType: 'dateInput',
						isDefault: true,
						isActive: true,
						sign: '<div class="multitype-field-type-letter type-with-constant">D</div>',
						value_type: 40,
						fieldData: {
							smallOptions: { dialogParent: '.dialog-containers-wrap' },
						},
					},
					{
						model: null,
						fieldType: 'dropdownSelect',
						isDefault: false,
						isActive: false,
						sign: '<div class="multitype-field-type-letter">L</div>',
						value_type: 70,
						fieldData: {
							smallOptions: { dialogParent: '.dialog-containers-wrap' },
						},
					},
				],
			},
			position_factor_value: {
				value_type: 20,
				fieldTypesList: [
					{
						model: '',
						fieldType: 'numberInput',
						isDefault: true,
						isActive: true,
						sign: '<div class="multitype-field-type-letter type-with-constant">D</div>',
						value_type: 20,
						fieldData: {
							smallOptions: { dialogParent: '.dialog-containers-wrap' },
						},
					},
					{
						model: null,
						fieldType: 'dropdownSelect',
						isDefault: false,
						isActive: false,
						sign: '<div class="multitype-field-type-letter">L</div>',
						value_type: 70,
						fieldData: {
							smallOptions: { dialogParent: '.dialog-containers-wrap' },
						},
					},
				],
			},
			factor_value1: {
				value_type: 20,
				fieldTypesList: [
					{
						model: '',
						fieldType: 'numberInput',
						isDefault: true,
						isActive: true,
						sign: '<div class="multitype-field-type-letter type-with-constant">D</div>',
						value_type: 20,
						fieldData: {
							smallOptions: { dialogParent: '.dialog-containers-wrap' },
						},
					},
					{
						model: null,
						fieldType: 'dropdownSelect',
						isDefault: false,
						isActive: false,
						sign: '<div class="multitype-field-type-letter">L</div>',
						value_type: 70,
						fieldData: {
							smallOptions: { dialogParent: '.dialog-containers-wrap' },
						},
					},
				],
			},
			factor_value2: {
				value_type: 20,
				fieldTypesList: [
					{
						model: '',
						fieldType: 'numberInput',
						isDefault: true,
						isActive: true,
						sign: '<div class="multitype-field-type-letter type-with-constant">D</div>',
						value_type: 20,
						fieldData: {
							smallOptions: { dialogParent: '.dialog-containers-wrap' },
						},
					},
					{
						model: null,
						fieldType: 'dropdownSelect',
						isDefault: false,
						isActive: false,
						sign: '<div class="multitype-field-type-letter">L</div>',
						value_type: 70,
						fieldData: {
							smallOptions: { dialogParent: '.dialog-containers-wrap' },
						},
					},
				],
			},
			factor_value3: {
				value_type: 20,
				fieldTypesList: [
					{
						model: '',
						fieldType: 'numberInput',
						isDefault: true,
						isActive: true,
						sign: '<div class="multitype-field-type-letter type-with-constant">D</div>',
						value_type: 20,
						fieldData: {
							smallOptions: { dialogParent: '.dialog-containers-wrap' },
						},
					},
					{
						model: null,
						fieldType: 'dropdownSelect',
						isDefault: false,
						isActive: false,
						sign: '<div class="multitype-field-type-letter">L</div>',
						value_type: 70,
						fieldData: {
							smallOptions: { dialogParent: '.dialog-containers-wrap' },
						},
					},
				],
			},
		}
	}

	const updateMultitypeFieldSelectorOptionsInsideGridTable = function (
		instrumentAttributeTypes,
		multitypeFieldsObj,
		gridTableData
	) {
		multitypeFieldService.fillSelectorOptionsBasedOnValueType(
			instrumentAttributeTypes,
			multitypeFieldsObj
		)

		gridTableData.body.forEach((row) => {
			row.columns.forEach((cell) => {
				if (cell.cellType === 'multitypeField') {
					let selectorData = cell.settings.fieldTypesData.find(
						(type) => type.fieldType === 'dropdownSelect'
					)
					const defaultSelectorData = multitypeFieldsObj[
						cell.key
					].fieldTypesList.find((type) => type.fieldType === 'dropdownSelect')

					selectorData.fieldData.menuOptions =
						defaultSelectorData.fieldData.menuOptions
				}
			})
		})
	}

	const exposureCalculationModelsList = [
		{ id: 1, name: 'Market Value' },
		{ id: 2, name: 'Price exposure' },
		{ id: 3, name: 'Delta adjusted price exposure' },
		{ id: 4, name: 'Underlying long short exposure net' },
		{ id: 5, name: 'Underlying long short exposure split' },
	]

	const longUnderlyingExposureList = [
		{ id: 1, name: 'Zero' },
		{ id: 2, name: 'Long Underlying Instrument Price Exposure' },
		{ id: 3, name: 'Long Underlying Instrument Price Delta' },
		{ id: 4, name: 'Long Underlying Currency FX Rate Exposure' },
		{ id: 5, name: 'Long Underlying Currency FX Rate Delta-adjusted Exposure' },
	]

	const shortUnderlyingExposureList = [
		{ id: 1, name: 'Zero' },
		{ id: 2, name: 'Short Underlying Instrument Price Exposure' },
		{ id: 3, name: 'Short Underlying Instrument Price Delta' },
		{ id: 4, name: 'Short Underlying Currency FX Rate Exposure' },
		{
			id: 5,
			name: 'Short Underlying Currency FX Rate Delta-adjusted Exposure',
		},
	]

	const positionReportingList = [
		{
			id: 1,
			name: 'Direct Position',
		},
		{
			id: 2,
			name: 'Factor-adjusted Position',
		},
		{
			id: 3,
			name: 'Do not show',
		},
	]

	return {
		getList: getList,
		getListLight: getListLight,
		getListForSelect: getListForSelect,
		getByKey: getByKey,
		create: create,
		update: update,
		patch: patch,
		deleteByKey: deleteByKey,

		updateBulk: updateBulk,
		deleteBulk: deleteBulk,

		onGtCellChange: onGtCellChange,
		onGtRowDeletion: onGtRowDeletion,
		getInstrumentAccrualsMultitypeFieldsData:
			getInstrumentAccrualsMultitypeFieldsData,
		getInstrumentEventsMultitypeFieldsData:
			getInstrumentEventsMultitypeFieldsData,
		getInstrumentFactorsMultitypeFieldsData:
			getInstrumentFactorsMultitypeFieldsData,

		updateMultitypeFieldSelectorOptionsInsideGridTable:
			updateMultitypeFieldSelectorOptionsInsideGridTable,

		getEditLayoutBasedOnUserCodes: getEditLayoutBasedOnUserCodes,

		exposureCalculationModelsList: exposureCalculationModelsList,
		longUnderlyingExposureList: longUnderlyingExposureList,
		shortUnderlyingExposureList: shortUnderlyingExposureList,
		positionReportingList: positionReportingList,
	}
}
