<template>
    <FmExpansionPanel title="Period Returns">
        <div class="performance-holder">

            <BaseTable
                    :headers="periodHeaders"
                    :items="periodItems"
                    :active="activePeriod"
                    colls="repeat(9, 1fr)"
                    :cb="chooseBundle"
                    :rightClickCallback="showPerformanceDetail"
                    :is-disabled="isDisabled || !readyStatus"
            />

<!--			<FmBasicTable selectableRows>

			</FmBasicTable>-->
        </div>

        <RvPerformanceCellDetailModal
                :title="performanceDetailsColumnName === 'name' ? 'Bundle Portfolios' : 'Performance Details'"
                v-model="performanceDetailIsOpen"
                :performanceDetails="performanceDetails"
                :performanceDetailsColumnName="performanceDetailsColumnName"
        />

    </FmExpansionPanel>
</template>

<script setup>
import dayjs from 'dayjs'
import quarterOfYear from 'dayjs/plugin/quarterOfYear'
import {useLoadAllPages} from "~/composables/useApi";

dayjs.extend(quarterOfYear)

const props = defineProps({
	/** Used to filter bundles. Can be `undefined` or `null`. */
	bundlesIds: Array,

    end_date: {
        type: String,
    },
    calculation_type: {
        type: String,
    },
    report_currency: {
        type: [Number, String],
    },
    performance_unit: String,
	isDisabled: Boolean,
})
const emits = defineEmits(['setBundle']);

let readyStatus = ref(false);
let periodHeaders = computed(() => {
    return [
        'Bundles',
        'Daily',
        'MTD',
        'QTD',
        'YTD',
        dayjs(props.end_date).year() - 1,
        dayjs(props.end_date).year() - 2,
        'Incept',
        'Annualized',
    ]
})
let periodItems = ref([])
let periodItemsRaw = ref([])
/**
 * Index of bundle
 * @type {ref<Number|null>}
 * */
let performanceDetailIsOpen = ref(false)
let activePeriod = ref(null)
let bundles = ref([])
let performanceDetails = ref(null)
let performanceDetailsColumnName = ref(null)

//# region Calculate reports
let abortController = null;

function formatNumber(num) {
    return Intl.NumberFormat('en-EN', {
        // maximumSignificantDigits: 3
    }).format(num)
}

function getValueForPeriod(performanceResult) {

    if (props.performance_unit === 'percent') {

        let value = Math.round(performanceResult.grand_return * 100 * 100) / 100

        return value ? `${value}%` : ''
    } else {
        return performanceResult.grand_absolute_pl ? `${formatNumber(performanceResult.grand_absolute_pl)}` : ''
    }

}


async function calcDayForBundle(bundleId, row, rowRaw, abortSignal) {

    row.daily = null
    let res

    try {
        res = await getDay(bundleId, abortSignal);

    } catch (e) {
        throw e;
    }


    if (res._$error) {
        return res;
    }

    rowRaw.daily_performance_report = res;

    row.daily = getValueForPeriod(res);

	return {key: 'calcDayForBundle'};

}

async function calcMonthForBundle(bundleId, row, rowRaw, abortSignal) {

    row.month = null;

    let res;
    try {
        res = await getMonth(bundleId, abortSignal);

    } catch (e) {
        throw e;
    }

    if (res._$error) {
        return res;
    }

    rowRaw.month_performance_report = res

    row.month = getValueForPeriod(res);

	return {key: 'calcMonthForBundle'};

}

async function calcQuarterForBundle(bundleId, row, rowRaw, abortSignal) {

    row.q = null

    let res;

    try {
        res = await getQ(bundleId, abortSignal);

    } catch (e) {
        throw e;
    }

    if (res._$error) {
        return res;
    }

    rowRaw.q_performance_report = res;

    row.q = getValueForPeriod(res);

	return {key: 'calcQuarterForBundle'}

}

async function calcYearForBundle(bundleId, row, rowRaw, abortSignal) {

    row.year = null

    let res;
    try {
        res = await getYear(bundleId, abortSignal);

    } catch (e) {
        throw e;
    }
    if (res._$error) {
        return res;
    }

    rowRaw.year_performance_report = res;

    row.year = getValueForPeriod(res);

	return {key: 'calcYearForBundle'};

}

async function calcLastYearForBundle(bundleId, row, rowRaw, abortSignal) {

    row.last = null

    let res
    try {
        res = await getLastYear(bundleId, abortSignal);

    } catch (e) {
        throw e;
    }

	if (res._$error) {
        return res;
    }

    rowRaw.last_performance_report = res;

    row.last = getValueForPeriod(res);

	return {key: 'calcLastYearForBundle'};

}

async function calcBeforeLastYearForBundle(bundleId, row, rowRaw, abortSignal) {

    row.beforeLast = null

    let res;
    try {
        res = await getYearBeforeLast(bundleId, abortSignal);

    } catch (e) {
        throw e;
    }
    if (res._$error) {
        return res;
    }

    rowRaw.beforeLast_performance_report = res;

    row.beforeLast = getValueForPeriod(res);

	return {key: 'calcBeforeLastYearForBundle'};

}

async function calcInceptYearForBundle(bundleId, row, rowRaw, abortSignal) {

    row.incept = null

    let res;
    try {
        res = await getIncept(bundleId, abortSignal);

    } catch (e) {
        throw e;
    }
    if (res._$error) {
        return res;
    }

    rowRaw.incept_performance_report = res;

    row.incept = getValueForPeriod(res);

	return {key: 'calcInceptYearForBundle'};
}

async function calcAnnualForBundle(bundleId, row, rowRaw, abortSignal) {

	row.annualized = null

	let res;
    try {
        res = await getIncept(bundleId, abortSignal);

    } catch (e) {
        throw e;
    }
	if (res._$error) {
		return res;
	}

	rowRaw.annualized_performance_report = res

	let start = dayjs(res.begin_date)
    let end = dayjs(res.end_date)

    /* *
     * `.diff(start, 'years', true)` are not used
     * because it is required to divide by 365 for all years
     * including leap years.
     * */
    let diffInYears = end.diff(start, 'days', true);
    diffInYears = diffInYears / 365;

    if (diffInYears < 1) {
        console.error(`Cannot calculate annualize for bundle ${bundleId}. There are less than 365 day in period.`)
    }

    if (res.grand_return < -1) {
        console.error(`Cannot calculate annualize for bundle ${bundleId}. Inception less than 100%.`)
    }

    const endDateLessThanBegin = diffInYears < 1;
    // invalid value inside res.end_date and/or res.begin_date
    const invalidDates = diffInYears === null;
    // if grand_return less than -100%, do not calculate annualized
    const invalidGrandReturn = !res.grand_return || res.grand_return < -1;

	if (endDateLessThanBegin || invalidDates || invalidGrandReturn ) {

        if (res) {
            rowRaw.annualized_performance_report.grand_return = null;
        }

		row.annualized = "";

	} else{

        // formula to calculate annualized return
        // `(return_since_inception+1)^(1/number_of_years_since_inception) - 1`
        let value = utilsPower(res.grand_return + 1, 1 / diffInYears) - 1;

        rowRaw.annualized_performance_report.grand_return = value;

        value = Math.round(value * 100 * 100) / 100; // convert to percentages

		row.annualized = value ? `${value}%` : '';

	}

	return {key: 'calcAnnualForBundle'};
}

/**
 * Fetch performance report data for the bundle.
 *
 * @param bundle {Object} - A portfolio bundle.
 * @param row {Array} - formatted values for row of the table with bundles
 * @param rowRaw {Array} - values for row of the table with bundles without formatting
 * @param abortSignal {null|abortSignal}
 * @return {Promise<{-readonly [P in keyof Promise<void>[]]: PromiseSettledResult<Awaited<Promise<void>[][P]>>}>}
 * @private
 */
function _calcReportForBundle(bundle, row, rowRaw, abortSignal) {
    // Here you can process responses from calculating report
	// for a single portfolio bundle.
	// The bundle passed whole instead of its id only
	// to ease processing of responses.
    console.log("testing458.RvPerformanceBundles " +
        "_calcReportForBundle results ");
	try {
		return Promise.all([
			calcDayForBundle(bundle.id, row, rowRaw, abortSignal),
			calcMonthForBundle(bundle.id, row, rowRaw, abortSignal),
			calcQuarterForBundle(bundle.id, row, rowRaw, abortSignal),
			calcYearForBundle(bundle.id, row, rowRaw, abortSignal),
			calcLastYearForBundle(bundle.id, row, rowRaw, abortSignal),
			calcBeforeLastYearForBundle(bundle.id, row, rowRaw, abortSignal),
			calcInceptYearForBundle(bundle.id, row, rowRaw, abortSignal),
			calcAnnualForBundle(bundle.id, row, rowRaw, abortSignal),
		]);

	} catch (e) {
		console.log("testing458.RvPerformanceBundles " +
			"_calcReportForBundle 2 ");
		throw e;
	}

}

/**
 * Process Promise.allSettled()
 * for calculating all portfolio bundles inside report
 *
 * @param calculationPromises { [Promise<[Promise]>] } - each promise contains
 * an array of promises for calculation of reports for bundle
 *
 * @return {Promise<Boolean>} - true if calculations for all bundles succeeded
 * @private
 */
async function _processReportCalculationPromises(calculationPromises) {

	const bundlesWithClientError = new Set();

    /*responses.find(bundleResponses => {
        return
    })*/
    let results;

    try {
        results = await Promise.all(calculationPromises);
        console.log("testing458.RvPerformanceBundles " +
            "_processReportCalculationPromises results ",
            results);
    } catch (e) {
		console.log("testing458.RvPerformanceBundles " +
			"_processReportCalculationPromises catch ",
			e);
        if ( e === 'ABORTED_BY_CLIENT' ) { // AbortController.abort()
            return false;

        }
        else { // unprocessed error
            console.error(
                '[RvPerformanceBundle._processReportCalculationPromises] ' +
                'error while calculating reports',
                e
            );
            throw e;
        }

    }
    console.log(
        "testing458.RvPerformanceBundles results " +
        "_processReportCalculationPromises",
        results
    );
    results.forEach((bundleRes, index) => {

		/*
		 * bundleRes content
		 * [
		 *  calcDayForBundle, 0
		 *	calcMonthForBundle, 1
		 *	calcQuarterForBundle, 2
		 *	calcYearForBundle, 3
		 *	calcLastYearForBundle, 4
		 *	calcBeforeLastYearForBundle, 5
		 *	calcInceptYearForBundle, 6
		 *	calcAnnualForBundle, 7
		 * ]
		 */

        // filter out empty fullfilment values
        /*bundleWithError = bundleResponses.value.find(
            res => res.status === "rejected"
        )*/

        /*bundleRes.value.find(res => {

            if (res.status === "rejected" &&
                res.reason.error?.details?.errors[0] &&
                res.reason.error.details.errors[0].error_key) {

                    bundlesWithClientError.add( bundles.value[index].user_code );

                return true;

			}

            return false;

		});*/

        bundleRes.find(res => {

            if (res._$error?.details?.errors[0] &&
                res._$error.details.errors[0].error_key) {

                bundlesWithClientError.add( bundles.value[index].user_code );

                return true;

            }

            return false;

        });

	});

	if (bundlesWithClientError.size) {

		const bundlesUserCodes = [...bundlesWithClientError].join(", ");

        useNotify({
            group: "fm_warning",
            title: 'Warning',
            text: {
                title: 'Client Error',
                details: `Check that calculations are correct for portfolio bundles: ${bundlesUserCodes}`,
            },
            ignoreDuplicates: true, // TODO: remove after fixing duplicated calls of init()
            duration: 20000
        })

	}

    return true;

}

let counter = 0;

async function fetchPortfolioBundles(abortSignal) {
	counter++;
    let localCounter = counter;
	console.log(
		`testing458.RvPerformanceBundles called ${localCounter}`);
    // readyStatusData.bundles = false;
    readyStatus.value = false;

    let res = await useLoadAllPages('portfolioBundleList.get', {
        filters: {page: 1, page_size: 1000}
    });

    if (res._$error) {
        return;
    }

    const delUserCodeRe = /^del\d{17}$/;

    bundles.value = res.filter(
        bundle => !bundle.user_code.match(delUserCodeRe)
    );

    if (props.bundlesIds?.length) {

        bundles.value = bundles.value.filter(
            bundle => props.bundlesIds.includes(bundle.id)
        )

    }
    // readyStatusData.bundles = true;
	activePeriod.value = null;
    periodItems.value = [];
    /* *
     * TODO: add `let periodItems`, `let periodItemsRaw`.
     * Use it in calculations of report (create `row`, `rowRaw`).
     * Assign them to refs `periodItems` and `periodItems`
     * at the end of fetchPortfolioBundles() only if a request that is used
     * to calculate them is still relevant. Otherwise discard them.
     * */
    periodItemsRaw.value = [];

    /*
     * Using `periodItemsList`, `periodItemsRawList` in case
     * while calculating data became irrelevant and must be
	 * discarded (i.e. `periodItemsList`, `periodItemsRawList`
	 * will not be assigned to `periodItems` and `periodItems`)
	 */
    let periodItemsList = [];
    let periodItemsRawList = [];

    let promises = [];

    bundles.value.forEach(bundle => {

        periodItemsList.push({
            name: bundle.user_code,
        })
        periodItemsRawList.push({
            name: bundle.user_code,
        })

        let row = periodItemsList.at(-1);
        let rowRaw = periodItemsRawList.at(-1);
        rowRaw.id = bundle.id;

		/*
		 * `periodItemsList` and `periodItemsRawList` changed inside
		 * `_calcReportForBundle` by mutation by changing `row`, `rowRaw`
		 */
        promises.push(
            _calcReportForBundle(bundle, row, rowRaw, abortSignal)
        );

    })

    // const reportCalcPromises = Promise.all(promises);
    console.log(
        "testing458.RvPerformanceBundles fetchBundles promises",
        promises);
	const reportsCalculated = await _processReportCalculationPromises( promises );
	console.log(`testing458.RvPerformanceBundles fetchBundles ${localCounter} end`,
		reportsCalculated)
    if (reportsCalculated) {

        periodItems.value = periodItemsList;
        periodItemsRaw.value = periodItemsRawList

        readyStatus.value = true;

    }
    // chooseBundle(0)

}
//# endregion Calculate reports

async function chooseBundle(bundleIndex, cellIndex) {

    if (activePeriod.value === bundleIndex) {
        return;
    }

    activePeriod.value = bundleIndex
    emits('setBundle', JSON.parse(JSON.stringify( bundles.value[bundleIndex] )) );

}

function showPerformanceDetail(rowIndex, cellIndex) {

	console.log('showPerformanceDetail.rowIndex', rowIndex);
	console.log('showPerformanceDetail.cellIndex', cellIndex);
	console.log('showPerformanceDetail.periodItemsRaw', periodItemsRaw.value);

	if (!cellIndex) {
		return;
	}

    if (cellIndex === 'name') {

		performanceDetailsColumnName.value = cellIndex
		performanceDetails.value = {bundle: periodItemsRaw.value[rowIndex]['id']}

	} else {

		performanceDetailIsOpen.value = true;

		performanceDetailsColumnName.value = cellIndex
		performanceDetails.value = periodItemsRaw.value[rowIndex][`${cellIndex}_performance_report`]

	}

	performanceDetailIsOpen.value = true;

}

async function getDay(ids, abortSignal) {
    let endDate = dayjs(props.end_date)

    let day = dayjs(endDate).format('YYYY-MM-DD')

    return await getReports({
			period_type: "daily",
			end: day,
			ids,
			type: 'days',
			abortSignal: abortSignal
    })
}

function adjustForWeekend(date) {
    // If Saturday, move to Friday
    if (date.getDay() === 6) {
        date.setDate(date.getDate() - 1);
    }
    // If Sunday, move to Friday
    else if (date.getDay() === 0) {
        date.setDate(date.getDate() - 2);
    }
    return date;
}

async function getMonth(ids, abortSignal) {
    let endDate = dayjs(props.end_date)

    let end = dayjs(adjustForWeekend(new Date(endDate))).format('YYYY-MM-DD')

    return await getReports({period_type: "mtd", end, ids, abortSignal})
}

/**
 *
 * @param ids
 * @return {Promise<*>}
 */
function getQ(ids, abortSignal) {
    let endDate = dayjs(props.end_date)

    let end = dayjs(endDate).format('YYYY-MM-DD')

    return getReports({period_type: "qtd", end, ids, abortSignal})
}

/**
 *
 * @param ids
 * @return {Promise<*>}
 */
function getYear(ids, abortSignal) {
    let endDate = dayjs(props.end_date)

    let start = `${dayjs(endDate).year()}-01-01`
    let end = dayjs(endDate).format('YYYY-MM-DD')

    return getReports({
		period_type: "ytd", end, ids, abortSignal
	})
}

/**
 *
 * @param ids
 * @return {Promise<*>}
 */
function getLastYear(ids, abortSignal) {
    let endDate = dayjs(props.end_date)

    let end = `${dayjs(endDate).year() - 1}-12-31`

    return getReports({
		period_type: "ytd", end, ids, abortSignal
	})
}

/**
 *
 * @param ids
 * @return {Promise<*>}
 */
function getYearBeforeLast(ids, abortSignal) {
    let endDate = dayjs(props.end_date)

    let end = `${dayjs(endDate).year() - 2}-12-31`

    return getReports({
		period_type: "ytd", end, ids, abortSignal
	})
}

async function getIncept(ids, abortSignal) {
    let endDate = dayjs(props.end_date)

    let end = dayjs(endDate).format('YYYY-MM-DD')

    return getReports({period_type: "inception", end, ids, abortSignal})
}

async function getReports({period_type, end, ids, type = 'months', abortSignal}) {
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
        signal: abortSignal,
        notifyError: false,
    })

    if (res._$abort) {
        throw 'ABORTED_BY_CLIENT';
    }
    else if ( res.hasOwnProperty('_$error') ) {
        console.log("testing458.RvPerformanceBundles getReports res._$error",
            res._$error);

        if (!res._$error.error?.details?.errors[0] ||
            res._$error.error.details.errors[0].error_key !== 'no_first_transaction_date') {

            useNotify({
                group: 'server_error',
                title: 'Server Error',
                text: res._$error.error,
                duration: 20000
            })

        }

    }

    return res


}

// rework
/*async function getEndDate() {

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

    if (res._$error) throw new Error(res._$error)

    viewerData.reportOptions.end_date = res.result

    return viewerData.reportOptions.end_date
}*/

const reloadTableD = useDebounce(function () {

    if (abortController) {
        abortController.abort()
	}

    abortController = new AbortController();
    const abortSignal = abortController.signal;

    activePeriod.value = null;
    emits('setBundle', null);

    if (!props.end_date) {
        console.warn('[RvPerformanceBundles] No end_date:', props.end_date)
        return false
    }

    fetchPortfolioBundles(abortSignal);

}, 300);

function init() {
    reloadTableD();
}

init()

defineExpose({
	reloadTableD
})

watch(
    () => [
        props.end_date,
        props.calculation_type,
        props.report_currency,
		props.bundlesIds,
		props.performance_unit,
    ],
    () => {
		/*
		 * Using debounce to prevent calling fetchPortfolioBundles()
		 * multiple times when several props changed at once.
		 */
		reloadTableD()
	}
)

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
