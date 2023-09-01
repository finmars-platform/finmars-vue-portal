import accrualCalculationModelService from '../accrualCalculationModelService'
import instrumentPeriodicityService from '../instrumentPeriodicityService'
import metaEventClassService from '../metaEventClassService'
import metaNotificationClassService from '../metaNotificationClassService'
;('use strict')

export default function () {
	const fullRowUserInputsList = ['accrual_calculation_schedules']

	const dataOfAttributes = {
		instrument: {
			accrual_calculation_schedules: {
				label: '',
				tableData: [
					{
						key: 'notes',
						name: 'Notes',
						to_show: true,
						override_name: '',
					},
					{
						key: 'accrual_start_date',
						name: 'Accrual start date',
						to_show: true,
						override_name: '',
					},
					{
						key: 'first_payment_date',
						name: 'First payment date',
						to_show: true,
						override_name: '',
					},
					{
						key: 'accrual_size',
						name: 'Accrual size',
						to_show: true,
						override_name: '',
					},
					{
						key: 'accrual_calculation_model',
						name: 'Calculation model',
						to_show: true,
						override_name: '',
						editableOptions: true,
						options: [],
					},
					{
						key: 'periodicity',
						name: 'Periodicity',
						to_show: true,
						override_name: '',
						editableOptions: true,
						options: [],
					},
					{
						key: 'periodicity_n',
						name: 'Periodicity N',
						to_show: true,
						override_name: '',
					},
					{
						key: 'build_accruals_btn',
						name: '"Build Accruals" Button',
						to_show: true,
					},
					{
						key: 'rows_addition',
						name: '"Add" Button',
						to_show: true,
					},
					{
						key: 'rows_deletion',
						name: '"Delete" Button',
						to_show: true,
					},
				],
			},
			event_schedules: {
				label: '',
				tableData: [
					{
						key: 'name',
						name: 'Name',
						to_show: true,
						override_name: '',
					},
					{
						key: 'event_class',
						name: 'Event class',
						to_show: true,
						override_name: '',
						editableOptions: false,
						options: [],
					},
					{
						key: 'effective_date',
						name: 'Effective date',
						to_show: true,
						override_name: '',
					},
					{
						key: 'final_date',
						name: 'Final date',
						to_show: true,
						override_name: '',
					},
					{
						key: 'description',
						name: 'Description',
						to_show: true,
						override_name: '',
					},
					{
						key: 'periodicity',
						name: 'Periodicity',
						to_show: true,
						override_name: '',
						editableOptions: true,
						options: [],
					},
					{
						key: 'periodicity_n',
						name: 'Periodicity N',
						to_show: true,
						override_name: '',
					},
					{
						key: 'notification_class',
						name: 'Notification class',
						to_show: true,
						override_name: '',
						editableOptions: true,
						options: [],
					},
					{
						key: 'notify_in_n_days',
						name: 'Notify in N days',
						to_show: true,
						override_name: '',
					},
					{
						key: 'parameters',
						name: '"Parameters" Button',
						to_show: true,
					},
					{
						key: 'build_events_btn',
						name: '"Build Events" Button',
						to_show: true,
					},
					{
						key: 'rows_addition',
						name: '"Add" Button',
						to_show: true,
					},
					{
						key: 'rows_deletion',
						name: '"Delete" Button',
						to_show: true,
					},
				],
			},
		},
	}

	const mapOptions = function (item) {
		return {
			user_code: item.user_code,
			id: item.id,
			name: item.name,
			to_show: true,
			override_name: '',
		}
	}

	const loadOptionsForAccrualsTable = async function () {
		const accrualsTable =
			dataOfAttributes.instrument.accrual_calculation_schedules.tableData

		const calcModelIndex = accrualsTable.findIndex(
			(row) => row.key === 'accrual_calculation_model'
		)
		const periodicityIndex = accrualsTable.findIndex(
			(row) => row.key === 'periodicity'
		)

		const accrualCalcModelsProm = new Promise(async (res, rej) => {
			accrualCalculationModelService
				.getList()
				.then((data) => {
					accrualsTable[calcModelIndex].options = data.map(mapOptions)
					res()
				})
				.catch((error) =>
					rej('error on getting accrual calculation models happened')
				)
		})

		const periodicityProm = new Promise(async (res, rej) => {
			instrumentPeriodicityService
				.getList()
				.then((data) => {
					accrualsTable[periodicityIndex].options = data.map(mapOptions)
					res()
				})
				.catch((error) =>
					rej('error on getting instrument periodicity happened')
				)
		})

		return Promise.all([accrualCalcModelsProm, periodicityProm])
	}

	const loadOptionsForEventsTable = async function () {
		const eventsTable = dataOfAttributes.instrument.event_schedules.tableData

		const eventClassIndex = eventsTable.findIndex(
			(row) => row.key === 'event_class'
		)
		const notifClassIndex = eventsTable.findIndex(
			(row) => row.key === 'notification_class'
		)
		const periodicityIndex = eventsTable.findIndex(
			(row) => row.key === 'periodicity'
		)

		const eventClassProm = new Promise(async (res, rej) => {
			metaEventClassService
				.getList()
				.then((data) => {
					eventsTable[eventClassIndex].options = data.map(mapOptions)
					res()
				})
				.catch((error) =>
					rej('error on getting accrual calculation models happened')
				)
		})

		const notifClassProm = new Promise(async (res, rej) => {
			metaNotificationClassService
				.getList()
				.then((data) => {
					eventsTable[notifClassIndex].options = data.map(mapOptions)
					res()
				})
				.catch((error) =>
					rej('error on getting accrual calculation models happened')
				)
		})

		const periodicityProm = new Promise(async (res, rej) => {
			instrumentPeriodicityService
				.getList()
				.then((data) => {
					eventsTable[periodicityIndex].options = data.map(mapOptions)
					res()
				})
				.catch((error) =>
					rej('error on getting instrument periodicity happened')
				)
		})

		return Promise.all([eventClassProm, notifClassProm, periodicityProm])
	}

	return {
		fullRowUserInputsList: fullRowUserInputsList,

		dataOfAttributes: dataOfAttributes,

		loadOptionsForAccrualsTable: loadOptionsForAccrualsTable,
		loadOptionsForEventsTable: loadOptionsForEventsTable,
	}
}
