<template>
	<FmExpansionPanel title="Period Returns">
		<div class="performance-holder">
			<BaseTable

				:headers="preriodHeaders"
				:items="preriodItems"
				:active="activePeriod"
				colls="repeat(8, 1fr)"
				:cb="chooseBundle"
				:rightClickCallback="showPerformanceDetail"
			/>
		</div>

		<ModalPerformanceDetail
			title="Performance Details"
			v-model="performanceDetailIsOpen"
			:performanceDetails="performanceDetails"
			@cancel="performanceDetailIsOpen = false"
		/>

	</FmExpansionPanel>
</template>

<script setup>
import dayjs from 'dayjs'
import quarterOfYear from 'dayjs/plugin/quarterOfYear'
import {useLoadAllPages} from "~/composables/useApi";

dayjs.extend(quarterOfYear)

const props = defineProps({
	reportOptions: {
		type: Object,
	},
	end_date: {
		type: String,
	},
	calculation_type: {
		type: String,
	},
	report_currency: {
		type: [Number, String],
	},
})
const emits = defineEmits(['setBundle', 'refreshFunc'])

let preriodHeaders = computed(() => {
	return [
		'',
		'Daily',
		'MTD',
		'QTD',
		'YTD',
		dayjs(props.end_date).year() - 1,
		dayjs(props.end_date).year() - 2,
		'Incept',
	]
})
let preriodItems = ref([])
/**
 * Index of bundle
 * @type {ref<Number|null>}
 * */
let performanceDetailIsOpen = ref(false)
let activePeriod = ref(null)
let bundles = ref([])
let performanceDetails = ref(null)

watch(props, () => init())

emits('refreshFunc', init)
init()

function init() {

	emits('setBundle', null);

	// проверка на корректность всех свойств, если что выдать ошибку
	if (!props.end_date) {
		console.log('No end_date:', props.end_date)
		return false
	}

	fetchPortfolioBundles()
}

function formatNumber(num) {
	return Intl.NumberFormat('en-EN', {
		// maximumSignificantDigits: 3
	}).format(num)
}

async function fetchPortfolioBundles() {
	// readyStatusData.bundles = false;

	let res = await useLoadAllPages('portfolioBundleList.get', {
		filters: {page: 1, page_size: 1000}
	});

	const delUserCodeRe = /^del\d{17}$/;

	bundles.value = res.filter(
		bundle => !bundle.user_code.match(delUserCodeRe)
	);

	if (props.reportOptions?.bundles?.length) {

		bundles.value = bundles.value.filter(
			bundle => props.reportOptions.bundles.includes(bundle.id)
		)

	}
	// readyStatusData.bundles = true;

	preriodItems.value = []

	bundles.value.forEach((bundle) => {

		preriodItems.value.push({
			name: bundle.user_code,
		})

		let row = preriodItems.value[preriodItems.value.length - 1]

		row.daily = null
		getDay(bundle.id).then((performanceReport) => {

			row.daily_performance_report = performanceReport

			if (props.reportOptions.performance_unit === 'percent') {

				let value = Math.round(performanceReport.grand_return * 100 * 100) / 100

				row.daily = value ? `${value}%` : ''
			} else {
				row.daily = performanceReport.grand_absolute_pl ? `${formatNumber(performanceReport.grand_absolute_pl)}` : ''
			}
		})

		row.month = null
		getMonth(bundle.id).then((performanceReport) => {

			row.month_performance_report = performanceReport

			if (props.reportOptions.performance_unit === 'percent') {

				let value = Math.round(performanceReport.grand_return * 100 * 100) / 100

				row.month = value ? `${value}%` : ''
			} else {
				row.month = performanceReport.grand_absolute_pl ? `${formatNumber(performanceReport.grand_absolute_pl)}` : ''
			}
		})

		row.q = null
		getQ(bundle.id).then((performanceReport) => {

			row.q_performance_report = performanceReport

			if (props.reportOptions.performance_unit === 'percent') {

				let value = Math.round(performanceReport.grand_return * 100 * 100) / 100

				row.q = value ? `${value}%` : ''
			} else {
				row.q = performanceReport.grand_absolute_pl ? `${formatNumber(performanceReport.grand_absolute_pl)}` : ''
			}
		})

		row.year = null
		getYear(bundle.id).then((performanceReport) => {

			row.year_performance_report = performanceReport

			if (props.reportOptions.performance_unit === 'percent') {

				let value = Math.round(performanceReport.grand_return * 100 * 100) / 100

				row.year = value ? `${value}%` : ''
			} else {
				row.year = performanceReport.grand_absolute_pl ? `${formatNumber(performanceReport.grand_absolute_pl)}` : ''
			}

		})

		row.last = null
		getLastYear(bundle.id).then((performanceReport) => {

			row.last_performance_report = performanceReport

			if (props.reportOptions.performance_unit === 'percent') {

				let value = Math.round(performanceReport.grand_return * 100 * 100) / 100

				row.last = value ? `${value}%` : ''
			} else {
				row.last = performanceReport.grand_absolute_pl ? `${formatNumber(performanceReport.grand_absolute_pl)}` : ''
			}

		})

		row.beforeLast = null
		getYearBeforeLast(bundle.id).then((performanceReport) => {

			row.beforeLast_performance_report = performanceReport

			if (props.reportOptions.performance_unit === 'percent') {

				let value = Math.round(performanceReport.grand_return * 100 * 100) / 100

				row.beforeLast = value ? `${value}%` : ''
			} else {
				row.beforeLast = performanceReport.grand_absolute_pl ? `${formatNumber(performanceReport.grand_absolute_pl)}` : ''
			}

		})

		row.incept = null
		getIncept(bundle.id).then((performanceReport) => {

			row.incept_performance_report = performanceReport

			if (props.reportOptions.performance_unit === 'percent') {

				let value = Math.round(performanceReport.grand_return * 100 * 100) / 100

				row.incept = value ? `${value}%` : ''
			} else {
				row.incept = performanceReport.grand_absolute_pl ? `${formatNumber(performanceReport.grand_absolute_pl)}` : ''
			}

		})
	})
	chooseBundle(0)
}

async function chooseBundle(bundleIndex, cellIndex) {

	console.log('bundleIndex', bundleIndex)
	console.log('cellIndex', cellIndex)
	console.log('bundles.value', bundles.value);

	activePeriod.value = bundleIndex
	emits('setBundle', bundles.value[bundleIndex])

}

async function showPerformanceDetail(bundleIndex, cellIndex) {

	console.log('bundleIndex', bundleIndex)
	console.log('cellIndex', cellIndex)

	if (cellIndex && cellIndex !== 'name') {

		performanceDetailIsOpen.value = true;

		console.log('performanceDetailIsOpen', performanceDetailIsOpen);
		console.log('bundles.value[bundleIndex]', bundles.value[bundleIndex]);

		performanceDetails.value = preriodItems.value[bundleIndex][`${cellIndex}_performance_report`]

		console.log('performanceDetails', performanceDetails.value)

	}

}

async function getDay(ids) {
	let endDate = dayjs(props.end_date)

	let day = dayjs(endDate).format('YYYY-MM-DD')

	return await getReports({period_type: "daily", end: day, ids, type: 'days'})
}

async function getMonth(ids) {
	let endDate = dayjs(props.end_date)

	let start = dayjs(endDate).set('date', 1).format('YYYY-MM-DD')
	let end = dayjs(endDate).format('YYYY-MM-DD')

	return await getReports({period_type: "mtd", end, ids})
}

async function getQ(ids) {
	let endDate = dayjs(props.end_date)

	let start = dayjs('2022-01-01')
		.year(endDate.year())
		.quarter(endDate.quarter())
		.format('YYYY-MM-DD')

	let end = dayjs(endDate).format('YYYY-MM-DD')

	return await getReports({period_type: "qtd", end, ids})
}

async function getYear(ids) {
	let endDate = dayjs(props.end_date)

	let start = `${dayjs(endDate).year()}-01-01`
	let end = dayjs(endDate).format('YYYY-MM-DD')

	return await getReports({period_type: "ytd", end, ids})
}

async function getLastYear(ids) {
	let endDate = dayjs(props.end_date)

	let start = `${dayjs(endDate).year() - 1}-01-01`
	let end = `${dayjs(endDate).year() - 1}-12-31`

	return await getReports({period_type: "ytd", end, ids})
}

async function getYearBeforeLast(ids) {
	let endDate = dayjs(props.end_date)

	let start = `${dayjs(endDate).year() - 2}-01-01`

	let end = `${dayjs(endDate).year() - 2}-12-31`

	return await getReports({period_type: "ytd", end, ids})
}

async function getIncept(ids) {
	let res = await useApi('performanceFirstTransaction.get', {
		params: {id: ids},
	})

	let start = res.transaction_date
	if (!start) return false

	let endDate = dayjs(props.end_date)

	let end = dayjs(endDate).format('YYYY-MM-DD')

	return await getReports({period_type: "inception", end, ids})
}

async function getReports({period_type, end, ids, type = 'months'}) {
	let res = await useApi('performanceReport.post', {
		body: {
			save_report: false,
			period_type: period_type,
			// begin_date: start, // deprecated, rn Backend handles all date range based on end_date + period_type
			end_date: end,
			calculation_type: props.calculation_type,
			segmentation_type: type,
			report_currency: props.report_currency,
			bundle: ids,
		},
	})

	return res


}

// rework
async function getEndDate() {
	if (viewerData.reportOptions?.end_date) {
		return viewerData.reportOptions?.end_date
	}

	const roCopy = viewerData.reportOptions
		? JSON.parse(JSON.stringify(viewerData.reportOptions))
		: viewerData.reportOptions
	console.error('No end_date set for performance report ', roCopy)

	// if there is expression for end_date, calculate it
	if (
		viewerData.reportLayoutOptions?.datepickerOptions?.reportLastDatepicker
			.datepickerMode !== 'datepicker' &&
		viewerData.reportLayoutOptions.datepickerOptions.reportLastDatepicker
			.expression
	) {
		const opts = {
			body: {
				is_eval: true,
				expression:
				viewerData.reportLayoutOptions.datepickerOptions
					.reportLastDatepicker.expression,
			},
		}

		const res = await useApi('expression.post', opts)

		viewerData.reportOptions.end_date = res.result

		return viewerData.reportOptions.end_date
	}

	const opts = {
		body: {
			is_eval: true,
			expression: 'last_business_day(now())',
		},
	}

	const res = await useApi('expression.post', opts)

	if (res.error) throw new Error(res.error)

	viewerData.reportOptions.end_date = res.result

	return viewerData.reportOptions.end_date
}
</script>

<style lang="scss">

.performance-holder {
	.table-cell {
		text-align: right;
	}

	.t_header .table-cell {
		text-align: left;
	}

}
</style>
