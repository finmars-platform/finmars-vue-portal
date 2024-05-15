<template>
    <FmExpansionPanel title="Period Returns">
        <div class="performance-holder">

<!--            <BaseTable
                    :headers="periodHeader"
                    :items="periodItems"
                    :active="activeBundle"
                    colls="repeat(9, 1fr)"
                    :cb="chooseBundle"
                    :rightClickCallback="showPerformanceDetail"
                    :is-disabled="isDisabled || !readyStatus"
            />-->

			<FmBasicTable selectableRows>
                <template #header>
                    <FmBasicTableRow
                        class="grid width-100"
                        :style="`grid-template-columns: ${tableGridTemplateCols}`"
                    >
                        <FmBasicTableCell
                            v-for="(column, index) in periodHeader"
                            :sorting="column.sorting"
                            @toggleSorting="toggleSorting(column.key)"
                        >
                            {{ column.name }}
                        </FmBasicTableCell>
                    </FmBasicTableRow>
                </template>

                <FmBasicTableRow
                    v-for="row in tableRowsComp"
                    @click="chooseBundle(row.key)"
                    :key="row.key"
                    :active="row.key === activeBundleId"
					:disabled="row.error"
                    class="grid width-100"
                    :style="`grid-template-columns: ${tableGridTemplateCols}`">

                    <FmBasicTableCell
                        v-for="cell in row.columns"
                        :key="cell.key"
                        :valueType="cell.key !== 'user_code' ? 20 : null"
						:empty="!cell.error && !cell.value && cell.value !== 0"
                        @contextmenu.prevent="showPerformanceDetail(row.key, cell.key, cell.error)"
                    >
						<span v-if="!cell.error">{{ cell.value }}</span>
                        <div v-else
                             v-fm-tooltip:error="'Error occurred while calculating performance report'"
                             class="flex-row flex-center">
                            <FmIcon icon="error" error />
                        </div>
					</FmBasicTableCell>

                </FmBasicTableRow>
			</FmBasicTable>

			<div v-show="!readyStatus"
				 class="flex-row flex-center p-16">
				<FmLoader :size="40" />
			</div>
        </div>

        <RvPerformanceCellDetailModal
                :title="performanceDetailsColumnKey === 'user_code' ? 'Bundle Portfolios' : 'Performance Details'"
                v-model="performanceDetailIsOpen"
                :performanceDetails="performanceDetails"
                :columnKey="performanceDetailsColumnKey"
        />

		<ModalMessage
			v-model="errorModalIsOpen"
			title="Performance Details"
			:description="errorModalDescription"/>
    </FmExpansionPanel>
</template>

<script setup>
import dayjs from 'dayjs'
import quarterOfYear from 'dayjs/plugin/quarterOfYear'
import {useToggleSorting} from "~/composables/useTable";
import {utilSortTextWithDash} from "~/utils/commonHelper";

dayjs.extend(quarterOfYear)

/**
 * @typedef {
 * [
 *     { status: String, value?: Object, reason?: Object }, // calcDayForBundle 0
 *     { status: String, value?: Object, reason?: Object }, // calcMonthForBundle 1
 *     { status: String, value?: Object, reason?: Object }, // calcQuarterForBundle 2
 *     { status: String, value?: Object, reason?: Object }, // calcYearForBundle 3
 *     { status: String, value?: Object, reason?: Object }, // calcLastYearForBundle 4
 *     { status: String, value?: Object, reason?: Object }, // calcBeforeLastYearForBundle 5
 *     { status: String, value?: Object, reason?: Object }, // calcInceptYearForBundle 6
 *     { status: String, value?: Object, reason?: Object }, // calcAnnualForBundle 7
 * ]
 * } promiseSettledResultForRow
 *
 * @private
 */

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
const tableGridTemplateCols = 'repeat(9, 1fr)';

// error modal
let errorModalIsOpen = ref(false);
let errorModalDescription= ref('');

// end error modal


let readyStatus = ref(false);
/*let periodHeader = computed(() => {
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
})*/
let periodHeader = ref([
    {key: 'user_code', name: 'Bundles', sorting: ''},
    {key: 'daily', name: 'Daily', sorting: ''},
    {key: 'month', name: 'MTD', sorting: ''},
    {key: 'q', name: 'QTD', sorting: ''},
    {key: 'year', name: 'YTD', sorting: ''},

    {
        key: 'last',
        name: computed(() => {

            if (props.end_date) {
                return dayjs(props.end_date).year() - 1;
            }

            return '';

        }),
        sorting: ''
    },
    {
        key: 'beforeLast',
        name: computed(() => {

            if (props.end_date) {
                return dayjs(props.end_date).year() - 2;
            }

            return '';

        }),
        sorting: ''
    },

    {key: 'incept', name: 'Incept', sorting: ''},
    {key: 'annualized', name: 'Annualized', sorting: ''},
]);

let periodItems = ref([])
let periodItemsRaw = ref([])
/**
 * Index of bundle
 * @type {ref<Number|null>}
 * */
let performanceDetailIsOpen = ref(false)
let activeBundleId = ref(null)
let bundles = ref([])
let performanceDetails = ref(null)
let performanceDetailsColumnKey = ref(null)

let tableRowsComp = computed(() => {

    if (!periodItems.value.length) {
        return []
    }

    let rows = periodItems.value.map(item => {

        const row = {
            key: item.id, // using `id` as key because `user_code` of a bundle can change
        };

        if (item.error) row.error = JSON.parse(JSON.stringify( item.error )); // in case of an object with error data will be passed

        row.columns = periodHeader.value.map(col => {

            const colObj = {
                key: col.key,
                value: item[col.key],
            }

			const rawData = periodItemsRaw.value.find(rData => rData.id === item.id);
			const errorData = rawData[col.key + 'Error'];

			// in case of less_than_year for annualized column, cell must not go into error mode
            if (errorData && !errorData.lessThanYear) {

				colObj.error = JSON.parse(JSON.stringify( errorData.data ));

			}

            return colObj;

        })

        return row;
        // portfolioItems.value = sortYears(portfolioItems.value);

    });

    rows = sortBundles(rows);

    return rows;

});

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

        return value ? `${value}%` : '-';

    } else {

        if (performanceResult.grand_absolute_pl) {

            return `${formatNumber(performanceResult.grand_absolute_pl)}`;

        }

        return '-';
    }

}


async function calcDayForBundle(bundleId, row, rowRaw, abortSignal) {

    row.daily = null
    let res

    try {
        res = await getDay(bundleId, abortSignal);

    } catch (e) {

        rowRaw.dailyError = {
            data: e
        }

        throw e;

    }

    rowRaw.daily_performance_report = res;

    row.daily = getValueForPeriod(res);

	return 'calcDayForBundle';

}

async function calcMonthForBundle(bundleId, row, rowRaw, abortSignal) {

    row.month = null;

    let res;
    try {
        res = await getMonth(bundleId, abortSignal);

    } catch (e) {
        rowRaw.monthError = {
            data: e
        };

        throw e;
    }

    rowRaw.month_performance_report = res

    row.month = getValueForPeriod(res);

	return 'calcMonthForBundle';

}

async function calcQuarterForBundle(bundleId, row, rowRaw, abortSignal) {

    row.q = null

    let res;

    try {
        res = await getQ(bundleId, abortSignal);

    } catch (e) {

        rowRaw.qError = {
            data: e
        };

        throw e;
    }

    rowRaw.q_performance_report = res;

    row.q = getValueForPeriod(res);

	return 'calcQuarterForBundle';

}

async function calcYearForBundle(bundleId, row, rowRaw, abortSignal) {

    row.year = null

    let res;
    try {
        res = await getYear(bundleId, abortSignal);

    } catch (e) {

        rowRaw.yearError = {
            data: e
        };

        throw e;
    }

    rowRaw.year_performance_report = res;

    row.year = getValueForPeriod(res);

	return 'calcYearForBundle';

}

async function calcLastYearForBundle(bundleId, row, rowRaw, abortSignal) {

    row.last = null

    let res
    try {
        res = await getLastYear(bundleId, abortSignal);

    } catch (e) {

        rowRaw.lastError = {
            data: e
        };

        throw e;
    }

    rowRaw.last_performance_report = res;

    row.last = getValueForPeriod(res);

	return 'calcLastYearForBundle';

}

async function calcBeforeLastYearForBundle(bundleId, row, rowRaw, abortSignal) {

    row.beforeLast = null

    let res;
    try {
        res = await getYearBeforeLast(bundleId, abortSignal);

    } catch (e) {

        rowRaw.beforeLastError = {
            data: e
        };

        throw e;
    }

    rowRaw.beforeLast_performance_report = res;

    row.beforeLast = getValueForPeriod(res);

	return 'calcBeforeLastYearForBundle';

}

async function calcInceptYearForBundle(bundleId, row, rowRaw, abortSignal) {

    row.incept = null

    let res;
    try {
        res = await getIncept(bundleId, abortSignal);

    } catch (e) {

        rowRaw.inceptError = {
            data: e
        };

        throw e;
    }

    rowRaw.incept_performance_report = res;

    row.incept = getValueForPeriod(res);

	return 'calcInceptYearForBundle';
}

async function getPortfolioRegisterList(){
	return await useApi('portfolioRegisterList.get');
}

async function buildErrorModalDescription(bundleId) {
	const portfolioRegisterList = await getPortfolioRegisterList();
	const currentBundleRegisters = bundles.value.find(item => item.id === bundleId)?.registers;
	let registerNames = '';
	for (const id of currentBundleRegisters) {
		registerNames += `${portfolioRegisterList?.results.find(item => item.id === id).user_code} `;
	}
	return `Return period of ${registerNames} is less than a year (<365 days) (must not be annualized)`;
}


async function calcAnnualForBundle(bundleId, row, rowRaw, abortSignal) {

	row.annualized = null

	let res;

	try {
        res = await getIncept(bundleId, abortSignal, "annualized");

    } catch (e) {

		rowRaw.annualizedError = {
            data: e
        };

		const eKey = errorWithErrorKey(e);

		if (eKey === "less_than_year") {


			rowRaw.annualizedError.lessThanYear = true;
			rowRaw.annualizedError.description = await buildErrorModalDescription(bundleId);
			row.annualized = "-";

			return 'calcAnnualForBundle';

		}

        throw e;

    }

	// `res` can be equal to {key: "less_than_year"}

	rowRaw.annualized_performance_report = res;

	if (!res.grand_return || res.grand_return <= -1) {
		row.annualized = "-";
		rowRaw.annualized_performance_report.description = 'Return since inception is less than -100% (can’t calculate the geometric mean)';
	} else if (res.grand_return) {
		row.annualized = `${Math.round(res.grand_return * 100 * 100) / 100}%`;

	} else { // null, undefined
		row.annualized = null;
	}

	return 'calcAnnualForBundle';
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
async function _calcReportForBundle(bundle, row, rowRaw, abortSignal) {
    // Here you can process responses from calculating report
	// for a single portfolio bundle.
	// The bundle passed whole instead of its id only
	// to ease processing of responses.

    /**
	 *
     * @type {promiseSettledResultForRow}
     */
	const responses = await Promise.allSettled([
		calcDayForBundle(bundle.id, row, rowRaw, abortSignal),
		calcMonthForBundle(bundle.id, row, rowRaw, abortSignal),
		calcQuarterForBundle(bundle.id, row, rowRaw, abortSignal),
		calcYearForBundle(bundle.id, row, rowRaw, abortSignal),
		calcLastYearForBundle(bundle.id, row, rowRaw, abortSignal),
		calcBeforeLastYearForBundle(bundle.id, row, rowRaw, abortSignal),
		calcInceptYearForBundle(bundle.id, row, rowRaw, abortSignal),
		calcAnnualForBundle(bundle.id, row, rowRaw, abortSignal),
	]);

	const rejectedRes = responses.find(res => res.status === "rejected");

	if (rejectedRes) {
		row.error = true;
	}

    return responses;

}

/**
 * Process Promise.allSettled()
 * with calculations for all portfolio bundles - rows.
 *
 * DO NOT use this function for processing calculation of individual rows.
 * Use _calcReportForBundle for that purpose instead.
 * @see _calcReportForBundle
 *
 * @param calculationPromises { [Promise<promiseSettledResultForRow>] } - each promise contains
 * an array of promises for calculation of reports for bundle
 * @param abortSignal {abortSignal}
 *
 * @return {Promise<Boolean>} - true if calculations for all bundles succeeded
 * @private
 */
async function _processReportCalculationPromises(calculationPromises, abortSignal) {

	const bundlesWithNftdError = new Set();

    /*responses.find(bundleResponses => {
        return
    })*/
    let results;

    /*try {
        results = await Promise.allSettled(calculationPromises);

    } catch (e) {

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

    }*/

	results = await Promise.allSettled(calculationPromises);

    if (abortSignal.aborted) {
        return false;
    }

	/**
	 *
	 * @param { PromiseSettledResult } bundleResponses
	 * @param {Number} index
	 */
	const processProms = (bundleResponses, index) => {

        bundleResponses.value.forEach(res => {

            if (res.status === "rejected") {

                const eKey = errorWithErrorKey(res.reason);

                if (eKey === "no_first_transaction_date") {

                    bundlesWithNftdError.add( bundles.value[index].user_code );

                }

			}
            // else { process fullfilled rows}


		});


		/*bundleRes.find(res => {

			if (res._$error?.details?.errors[0] &&
				res._$error.details.errors[0].error_key) {

				bundlesWithNftdError.add( bundles.value[index].user_code );

				return true;

			}

			return false;

		});*/

	}

    results.forEach(processProms);

	if (bundlesWithNftdError.size) {

		const bundlesUserCodes = [...bundlesWithNftdError].join(", ");

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

function resetTableData() {
	periodItems.value = [];
	periodItemsRaw.value = [];
}

async function fetchPortfolioBundles(abortSignal) {

    // readyStatusData.bundles = false;
	resetTableData();
	activeBundleId.value = null;

    readyStatus.value = false;

    let res = await useLoadAllPages('portfolioBundleList.get', {
        filters: {page: 1, page_size: 1000}
    });

    if (res._$error) {
        return;
    }

    // At this point `res` is a list of objects (bundles)

	const delUserCodeRe = /^del\d{17}$/;

    res = res.filter(
        bundle => !bundle.user_code.match(delUserCodeRe)
    );

    res.sort( (a,b) => utilSortTextWithDash(a.user_code, b.user_code) );

    if (props.bundlesIds?.length) {

        res = res.filter(
            bundle => props.bundlesIds.includes(bundle.id)
        )

    }

    bundles.value = res;

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
            id: bundle.id,
            user_code: bundle.user_code, // value of this property displayed inside table
        })

        periodItemsRawList.push({
            id: bundle.id,
        })

        let row = periodItemsList.at(-1);
        let rowRaw = periodItemsRawList.at(-1);

		/*
		 * `periodItemsList` and `periodItemsRawList` changed inside
		 * `_calcReportForBundle` by mutation by changing `row`, `rowRaw`
		 */
        promises.push(
            _calcReportForBundle(bundle, row, rowRaw, abortSignal)
        );

    })

    // const reportCalcPromises = Promise.all(promises);

	const reportsCalculated = await _processReportCalculationPromises( promises, abortSignal );

    if (reportsCalculated) {

        periodItems.value = periodItemsList;
        periodItemsRaw.value = periodItemsRawList

        readyStatus.value = true;

        if (periodItems.value.length) chooseBundle( periodItems.value[0].id );

    }

}
//# endregion Calculate reports

//# region Sorting
/**
 * Function to call inside Array.sort()
 *
 * @param bundlesList { [{}] } - periodItems.value
 * @return { [{}] } - sorted array
 */
function sortBundles(bundlesList) {

    let sortCol = periodHeader.value.find(col => col.sorting);

    if (!sortCol) {
        // return yearsList;

        // if there is no active sorting, sort by year in descending order
        sortCol = {
            key: 'user_code',
            sorting: 'asc',
        }
    }

    const descending = sortCol.sorting === 'desc';

    if (sortCol.key === 'user_code') {

        bundlesList.sort((a, b) => {

            let aSortColVal = a.columns.find(col => col.key === sortCol.key).value;
            let bSortColVal = b.columns.find(col => col.key === sortCol.key).value;
            // must be different from useSortRowsByNumber
            if (aSortColVal > bSortColVal) {
                return descending ? -1 : 1;

            } else if (aSortColVal < bSortColVal) {

                return descending ? 1 : -1;

            }

            return 0;

        })

    }
    else {

        bundlesList.sort((a, b) => {

            /*let aVal = portfolioItemsRaw[a.key][colData.key];
            let bVal = portfolioItemsRaw[b.key][colData.key];*/
            let aSortColVal = a.columns.find(col => col.key === sortCol.key).value;
            let bSortColVal = b.columns.find(col => col.key === sortCol.key).value;

            return useSortRowsByNumber(aSortColVal, bSortColVal, descending);

        });

    }

    return bundlesList;

}

function toggleSorting(columnKey) {
    periodHeader.value = useToggleSorting(periodHeader.value, columnKey)
}
//# endregion

function chooseBundle(bundleId) {

	const bundleRow = periodItems.value.find(item => item.id === bundleId);

    if (activeBundleId.value === bundleId || bundleRow.error) {
        return;
    }

    activeBundleId.value = bundleId;
    const bundle = bundles.value.find(bundle => bundle.id === activeBundleId.value);

    emits('setBundle', JSON.parse(JSON.stringify( bundle )) );

}


async function showPerformanceDetail(bundleId, cellKey, errorData) {

	const bundleRawData = periodItemsRaw.value.find(item => item.id === bundleId);
	if (!cellKey) {
		return;
	}

	performanceDetailsColumnKey.value = cellKey;

	// error modal show/hide function and error text set

	if (errorData) {
		errorModalDescription.value = `Error message: ${errorData.error.details.errors[0].detail}`;
		errorModalIsOpen.value = true;
	}
	else if (cellKey === 'annualized') {
		const modalErrorAnnualized = bundleRawData?.annualizedError?.data?.error?.details?.errors;
		const currentBundleRawData = bundleRawData['annualized_performance_report'];

		performanceDetails.value = {
			...currentBundleRawData,
			annualization_method: props.calculation_type === 'modified_dietz' ? "simple average" : "geometric average"
		};

		if (modalErrorAnnualized?.length) {
			errorModalDescription.value = bundleRawData?.annualizedError?.description;
			errorModalIsOpen.value = true;
		} else {
			errorModalDescription.value = currentBundleRawData.description;
			performanceDetailIsOpen.value = true;
		}
	}
	// end error modal function


    else if (cellKey === 'user_code') {
		// performanceDetails.value = {bundle: periodItemsRaw.value[rowIndex]['id']}
        performanceDetails.value = {bundle: bundleId};
	}
	else {
		performanceDetails.value = bundleRawData[`${cellKey}_performance_report`];
		performanceDetailIsOpen.value = true;
	}
}

let noNotificationErrorKeys = ["no_first_transaction_date", "less_than_year"];

function errorWithErrorKey(errorObj) {
    if ( errorObj && errorObj.error?.details?.errors[0] && errorObj.error.details.errors[0].error_key ) {
        return errorObj.error.details.errors[0].error_key;
	}

    return false;
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

async function getIncept(ids, abortSignal, adjustment_type = "original") {
	let endDate = dayjs(props.end_date)

    let end = dayjs(endDate).format('YYYY-MM-DD')

    return getReports({
        period_type: "inception",
        end,
        ids,
        adjustment_type,
        abortSignal
    })
}

async function getReports({period_type, end, ids, type = 'months', adjustment_type = 'original', abortSignal}) {

    let res = await useApi('performanceReport.post', {
        body: {
            save_report: false,
            period_type: period_type,
            // begin_date: start, // deprecated, rn Backend handles all date range based on end_date + period_type
            end_date: end,
            calculation_type: props.calculation_type,
            segmentation_type: type,
            adjustment_type: adjustment_type,
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

        const errorKey = errorWithErrorKey(res._$error);

        if ( !noNotificationErrorKeys.includes(errorKey) ) {

            useNotify({
                group: 'server_error',
                title: 'Server Error',
                text: res._$error.error,
                duration: 20000
            })

        }


		throw res._$error;

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
        abortController.abort({key: "ABORTED_BY_CLIENT"})
	}

    abortController = new AbortController();
    const abortSignal = abortController.signal;

    activeBundleId.value = null;
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
