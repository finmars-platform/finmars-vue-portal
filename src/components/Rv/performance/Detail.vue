<template>
	<FmExpansionPanel
		:title="currentBundle ? currentBundle.user_code : 'No bundle'"
	>
		<template #rightActions>
			<FmBtn
				v-if="!showBundleActions"
				class="primaryIcon"
				type="icon"
				icon="lock"
				@click.stop="showBundleActions = true"
			/>

			<div v-if="showBundleActions" class="flex-row">
				<FmBtn
					:disabled="!bundleId"
					class="primaryIcon m-r-8"
					type="icon"
					icon="edit"
					@click.stop="editBundleIsOpened = true"
				/>

				<FmBtn
					:disabled="!bundleId"
					class="primaryIcon"
					type="icon"
					icon="delete"
					@click.stop="deleteBundle()"
				/>
			</div>
		</template>

		<ModalPortfolioBundleAddEdit
			v-if="editBundleIsOpened"
			v-model="editBundleIsOpened"
			actionType="edit"
			:name="currentBundle.user_code"
			:bundleRegisters="currentBundle.registers"
			@save="updateBundle"
		/>

		<div
            class="table_wrap flex"
        >
<!--			<div class="coll_years">
				<div class="coll_item t_header">Years</div>
				<div class="coll_item" v-for="(item, i) in portfolioYears" :key="i">
					{{ item }}
				</div>
			</div>-->

            <div
                class="coll_months"
            >
			<!-- <BaseTable
					:headers="portfolioHeaders"
					:items="portfolioItems"
					colls="repeat(12, 1fr)"
					:active="activeYear"
					:rightClickCallback="showCellDetails"
                    :is-disabled="detailsLoading"
					:is-readonly="true"
				/> -->
				<FmBasicTable
					type="highlightedEdges"
					selectableRows
				>

                    <template #header>
                        <FmBasicTableRow
                            class="grid width-100"
                            :style="`grid-template-columns: ${tableGridTemplateCols}`"
                        >
                            <FmBasicTableCell
                                v-for="(column, index) in tableHeader"
								:sorting="column.sorting"
                                @toggleSorting="toggleSorting(column.key)"
                            >
                                {{ column.name }}
                            </FmBasicTableCell>
                        </FmBasicTableRow>
                    </template>

                    <FmBasicTableRow
                        v-for="row in tableRowsComp"
                        @click="chooseYear(row.key)"
                        :key="row.key"
                        :active="row.key === selectedYear"
                        class="grid width-100"
                        :style="`grid-template-columns: ${tableGridTemplateCols}`">

                        <FmBasicTableCell
                            v-for="cell in row.columns"
                            :key="cell.key"
                            :valueType="cell.key !== 'year' ? 20 : null"
                            :disabled="cell.error && !cell.error.noErrorMode"
                            :empty="!cell.error && !cell.value && cell.value !== 0"
                            @contextmenu.prevent="showCellDetails(row.key, cell.key, cell.error)"
                        >
							<span v-if="!cell.error || cell.error.noErrorMode">{{ cell.value }}</span>
							<div v-else
								 v-tooltip="{ content: 'Error. Click with right mouse button to see details.', theme: 'error-tooltip' }"
								 class="flex-row flex-center">
								<FmIcon icon="error" error />
							</div>
						</FmBasicTableCell>

                    </FmBasicTableRow>
				</FmBasicTable>
			</div>

<!--			<div class="coll_total">
				<div class="coll_item t_header">TOTAL</div>
				<div class="coll_item" v-for="(item, i) in portfolioTotals" :key="i">

					<span v-if="reportOptions.performance_unit === 'percent'">
						{{ Math.round(item * 100) / 100 }}%
					</span>
					<span v-if="reportOptions.performance_unit === 'absolute'">
						{{ item }}
					</span>
				</div>
			</div>-->
		</div>

        <div v-show="detailsLoading"
             class="flex-row flex-center p-16">
            <FmLoader :size="40" />
        </div>

        <!-- No data after loading -->
        <div v-show="!detailsLoading && !tableRowsComp.length"
             class="flex-row flex-center p-16" style="font-weight: 500;">
			{{ getTextForEmptyTable() }}
        </div>

		<RvPerformanceCellDetailModal
			title="Performance Details"
			v-model="cellDetailsIsOpen"
			:details-data="cellDetails"
            @close="onCellDetailsClose"
		/>
		<RvPerformanceCellErrorModal
			v-model="cellErrorIsOpen"
			:error-data="cellDetails"
		/>
	</FmExpansionPanel>
</template>

<script setup>
import dayjs from 'dayjs'
import {getEndOfYearDate} from "~/components/Rv/performance/helper";

/**
 * @typedef { {} } MonthReportObject
 * @property displayValue {String} - value displayed inside table's cell
 *
 * @property [reportData] {Object|null} - Contains whole object of report
 * for a month
 *
 * @property [error] {Object|null}
 *
 * @property [data] {Object} - Information for special months.
 * E.g. month outside dates range for performance
 *
 * @private
 */

/**
 * Storing raw values in a separate property `monthsRawValues`
 * makes it easier to access them inside chooseYear.
 * No need to call Array.map().
 *
 * @typedef {Map<
 *	 String,
 *	 {
 *		 Months: [MonthReportObject|null],
 *		 monthsRawValues: [String],
 *		 total: {displayValue},
 *		 [error]: {}|null,
 *
 *	 } > } ReportsMap
 *	 @private
 */

const props = defineProps({

    /** Id of a bundle or a whole object of a bundle. */
	bundle: {
		type: [Number, Object],
	},

	/** If empty, 'transaction_date'
	 * of earliest transaction in bundle will be used  */
    begin_date: {
		type: String,
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
    performance_unit: String,

})

const emits = defineEmits(['setYear', 'refresh'])

const tableGridTemplateCols = '75px repeat(12, 1fr) 80px';

let detailsLoading = ref(false);
let detailsLoadingError = ref('');

let showBundleActions = ref(false)
let editBundleIsOpened = ref(false)

let cellDetailsIsOpen = ref(false)
let cellDetails = ref(null)
let cellErrorIsOpen = ref(false);

/**
 *
 * @type {Ref<UnwrapRef< ReportsMap|Map<any, any> >>}
 */
let reportsMapRef = ref( new Map() );

let selectedYear = ref('');

let tableHeader = ref([
    {key: 'year', name: 'Years', sorting: ''},
	{key: 0, name: 'Jan', sorting: ''},
	{key: 1, name: 'Feb', sorting: ''},
	{key: 2, name: 'Mar', sorting: ''},
	{key: 3, name: 'Apr', sorting: ''},
	{key: 4, name: 'May', sorting: ''},
	{key: 5, name: 'Jun', sorting: ''},
	{key: 6, name: 'Jul', sorting: ''},
	{key: 7, name: 'Aug', sorting: ''},
	{key: 8, name: 'Sep', sorting: ''},
	{key: 9, name: 'Oct', sorting: ''},
	{key: 10, name: 'Nov', sorting: ''},
	{key: 11, name: 'Dec', sorting: ''},
    {key: 'total', name: 'TOTAL', sorting: ''},
])

let currentBundle = computed(() => {

    if (!props.bundle) return null;

    if (typeof props.bundle == 'object') return props.bundle

    return {id: props.bundle, user_code: 'Need name id: ' + props.bundle}
})

let bundleId = computed(() => {

    if (!props.bundle) return null;

    if (typeof props.bundle == 'object' && props.bundle.id) {
        return props.bundle.id
    }

    if (typeof props.bundle == 'number') return props.bundle

})

let tableRowsComp = computed(() => {

    if (!reportsMapRef.value.size) {
        return []
	}

    let rows = [];

    for (const [year, yearData] of reportsMapRef.value.entries()) {

        const row = {
            key: year,
			columns: [],
		};

        row.columns.push({
            key: 'year',
            value: year,
        })

        const monthsCols = yearData.months.map((month, i) => {

			if (month.error) {
				//this structure for ErrorModal
				return {
					key: i,
					value: month.displayValue,
					error: JSON.parse(JSON.stringify(month.error)),
				};
			}

            return {
                key: i, // month index
                value: month.displayValue,
            };
        });

        row.columns = row.columns.concat(monthsCols);

        row.columns.push({
			key: 'total',
			value: yearData.total.displayValue,
		})

        rows.push(row);

        // portfolioItems.value = sortYears(portfolioItems.value);

    }

    rows = sortYears(rows);

    return rows;

});

/**
 * Because model window always opened from outside.
 * emit('update:modelValue') and onCellDetailsClose() called
 * only when closing RvPerformanceCellDetailModal.
 */
function onCellDetailsClose () {
    cellDetailsIsOpen.value = false;
    cellDetails.value = null;
}

function resetData() {
    reportsMapRef.value = new Map();
    selectedYear.value = '';
}

function formatNumber(num) {
    return Intl.NumberFormat('en-EN', {
        // maximumSignificantDigits: 3
    }).format(num)
}

function getTextForEmptyTable() {

    if (detailsLoadingError.value) return detailsLoadingError.value;

    return bundleId.value ? "There is no data for selected period" : "Select period";
}

/**
 *
 * @param index {Number} - index of year inside refs
 * portfolioYears, portfolioItems, portfolioItemsRaw
 *
 */
function chooseYear(year) {

    const yearData = reportsMapRef.value.get(year);

    if (!yearData || typeof year !== 'string') {
        throw `[RvPerformanceDetail.chooseYear] invalid value selected: ${year}`
    }

	if (yearData.error) {

        emits('setYear', {
            portfolioMonthsEndsRaw: null,
            datasetCumulative: null,
            detailYear: null
        })

	}

    if (selectedYear.value === year || yearData.error) {
		return;
	}

	selectedYear.value = year;
	// const detailYear = portfolioYears.value.find(year => year === year);

    /*const portfolioMonthsEndsRaw = portfolioPerformanceReports[year].map(yearData => {

        if (yearData[2] && yearData[2].end_date) {
            return yearData[2].end_date;
        }

        return null;

    })*/
    const portfolioMonthsEndsRaw = yearData.months
        .map(monthsData => {

            if (monthsData.reportData?.frontOptions.monthEndDate) {
                return monthsData.reportData.frontOptions.monthEndDate;
            }

            return null;

        })

	const emitData = JSON.parse(JSON.stringify(
        {
			// datasetCumulative: portfolioItems.value[id],
			portfolioMonthsEndsRaw: portfolioMonthsEndsRaw,
			datasetCumulative: yearData.monthsRawValues,
			// detailYear: detailYear,
            detailYear: year
    	}
    ));

	emits('setYear', emitData)
}

async function showCellDetails(year, cellKey, error) {
    if ( ['year', 'total'].includes(cellKey) ) {
        return;
	}

	if (error) {
		cellDetails.value = error;
		cellErrorIsOpen.value = true;
		return;
	}

    // cell with data for month was right-clicked

    // `cellKey` is index of a month
	// const monthReportData = portfolioPerformanceReports[year][cellKey][2];
    const monthReportData = reportsMapRef.value.get(year).months[cellKey].reportData;

    if (monthReportData) { // cell is not empty and without errors

        cellDetails.value = JSON.parse(JSON.stringify(monthReportData));

        cellDetailsIsOpen.value = true;

    }

}

/**
 * Function to call inside Array.sort()
 *
 * @param yearsList { [{}] } - portfolioItems.value
 * @return { [{}] } - sorted array
 */
function sortYears(yearsList) {

	let sortCol = tableHeader.value.find(col => col.sorting);

	if (!sortCol) {
		// return yearsList;

		// if there is no active sorting, sort by year in descending order
        sortCol = {
            key: 'year',
			sorting: 'asc',
		}
	}

	const descending = sortCol.sorting === 'desc';

	yearsList.sort((a, b) => {

        const aSortCol = a.columns.find(col => col.key === sortCol.key);
        const bSortCol = b.columns.find(col => col.key === sortCol.key);

        return useSortRowsByNumber(aSortCol, bSortCol, descending);

    });

    return yearsList;

}

/**
 * Sort by month's value
 *
 * @param columnKey {String}
 */
function toggleSorting(columnKey) {
    tableHeader.value = useToggleSorting(tableHeader.value, columnKey)
}

/**
 * Returns dates that will be used to calculate performance report
 * on backend.
 *
 * @param begin_date
 * @param end_date
 * @return {[Date]} - Months between begin_date and end_date.
 * Dates for all months in range except the last are days that fit criteria - last not weekend day of a month.
 *
 */
function getLastBusinessDayOfMonth(begin_date, end_date) {

    const begin = new Date(begin_date);

    const end = new Date(end_date);
    const endYear = end.getFullYear();
    const endMonth = end.getMonth();

	let current = getLastDayOfMonth(begin.getFullYear(), begin.getMonth());
	let result = [];

	while (current <= end) {

		/*result.push(new Date(current));
		current = getLastDayOfMonth(new Date(current.getFullYear(), current.getMonth() + 1, 1));*/
        result.push(new Date(current));

        const nextMonth = current.getMonth() + 1;

        current = getLastDayOfMonth(current.getFullYear(), nextMonth);

        if ( current.getFullYear() === endYear &&
            current.getMonth() === endMonth ) {

            // current contains the last date of the period.
			// apply day from `end_date` to it.
            current.setDate( end.getDate() );

        }

	}

	return result;
}

/**
 * Helper function for getLastBusinessDayOfMonth
 * @see getLastBusinessDayOfMonth
 *
 * @param year {number}
 * @param month {number} - month index
 * @return {Date} - last day of the next month
 */
function getLastDayOfMonth(year, month) {
	// let lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

	/* *
	 * `month + 1` bellow because 0 date sets month to previous
	 * relative to specified in new Date()
	 * */

	let lastDayOfMonth = new Date(year, month + 1, 0);
	return adjustForWeekend(lastDayOfMonth);
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

/* async function convertReportIntoTableRows(startDate, bundle) {

    let end = dayjs(props.end_date).endOf('year').format('YYYY-MM-DD');

    const monthEndDates = getLastBusinessDayOfMonth(startDate, end)

    console.log('begin', startDate);
    console.log('end', end);
    console.log('monthEndDates', monthEndDates);

    const promises = []

    monthEndDates.forEach((monthEndDate) => {

        monthEndDate = dayjs(monthEndDate).format('YYYY-MM-DD');

        // promises.push(getReports({ period_type: 'ytd', end: monthEndDate, ids: bundle }))
        promises.push(getReports({period_type: 'mtd', end: monthEndDate, ids: bundle}))

    })

    let yearsBuffer = new Map()

    let allMonths;

    try {
        allMonths = await Promise.all(promises)
    } catch (e) {
        console.error(e)

        resetData();
        detailsLoading.value = false;
        detailsLoadingError.value = "Failed to calculate years for period. Try again later.";

        throw "Error above occurred while trying to load and calculate data for RvPerformanceDetail";
    }

    console.log('allMonths', allMonths);
    console.log('yearsBuffer', yearsBuffer);

    allMonths.forEach((item) => {

        const parseDate = item.end_date.split('-');
        const year = parseDate[0]; // e.g. "1999", "2001", "2012".
        const month = parseDate[1]; // e.g. "1", "5", "12".

        let defaultMonth;

        if (props.reportOptions.performance_unit === 'percent') {
            defaultMonth = {
                key_01: [0 + '%', 0],
                key_02: [0 + '%', 0],
                key_03: [0 + '%', 0],
                key_04: [0 + '%', 0],
                key_05: [0 + '%', 0],
                key_06: [0 + '%', 0],
                key_07: [0 + '%', 0],
                key_08: [0 + '%', 0],
                key_09: [0 + '%', 0],
                key_10: [0 + '%', 0],
                key_11: [0 + '%', 0],
                key_12: [0 + '%', 0],
            }
        }
        else {
            defaultMonth = {
                key_01: [0, 0],
                key_02: [0, 0],
                key_03: [0, 0],
                key_04: [0, 0],
                key_05: [0, 0],
                key_06: [0, 0],
                key_07: [0, 0],
                key_08: [0, 0],
                key_09: [0, 0],
                key_10: [0, 0],
                key_11: [0, 0],
                key_12: [0, 0],
            }
        }

        if ( !yearsBuffer.has(year) ) {
            yearsBuffer.set(year, defaultMonth)
        }

        // so 0 index for raw value
        // so 1 index for formatted value
        // other is depcreated
        // todo refactor

        if (props.reportOptions.performance_unit === 'percent') {
            yearsBuffer.get( year )['key_' + month] = [
                parseFloat(item.grand_return * 100).toFixed(2),
                parseFloat(item.grand_return * 100).toFixed(2) + '%',
                item,
            ]
        } else {
            yearsBuffer.get( year )['key_' + month] = [
                item.grand_absolute_pl,
                formatNumber(item.grand_absolute_pl),
                item
            ]
        }


    })


    let dateTo = dayjs(props.end_date)
    let dateFrom = dayjs(startDate)

    for (let [year, months] of yearsBuffer) {

        portfolioPerformanceReports[0] = months // todo refactor, when we consider multiple years
        portfolioYears.value.push(year)

        // todo refactor this cursed code
        portfolioMonthsEndsRaw.value = []
        // const monthsDescending = months.reverse()

        Object.keys(months).forEach((key) => {
            try {
                portfolioMonthsEndsRaw.value.push(months[key][2].end_date)
            } catch (error) {
                portfolioMonthsEndsRaw.value.push(null);
            }
        })

        portfolioItemsRaw.value.push(
            Object.values(months).map((item, i) => {
                if (
                    (year != dateTo.year() || i <= dateTo.month()) &&
                    (year != dateFrom.year() || i >= dateFrom.month())
                )
                    return item[0]
                else return ''
            })
        )

        portfolioItems.value.push(
            Object.values(months).map((item, i) => {
                if (
                    (year != dateTo.year() || i <= dateTo.month()) &&
                    (year != dateFrom.year() || i >= dateFrom.month())
                )
                    return item[1]
                else return ''
            })
        )


        let end =
            year == dayjs(dateTo).year()
                ? dateTo.format('YYYY-MM-DD')
                : `${year}-12-31`

        let total = await getReports({
            period_type: 'ytd',
            end: end,
            ids: bundle,
        })
        if (props.reportOptions.performance_unit === 'percent') {
            portfolioTotals.value.push(parseFloat(total.grand_return * 100).toFixed(2))
        } else {
            portfolioTotals.value.push(formatNumber(total.grand_absolute_pl))
        }
    }

} */

/*function datesRangeIncludesMonth(year, monthIndex, endDate, beginDate) {

    const endDateDjs = dayjs(props.end_date);
    const beginDateDjs = dayjs(beginDate);

    return ( year != endDateDjs.year() || monthIndex <= endDateDjs.month() ) &&
        ( year != beginDateDjs.year() || monthIndex >= beginDateDjs.month() );

}*/
function datesRangeIncludesMonth(date, beginDate, endDate) {

    const year = dayjs(date).year();
    const monthIndex = dayjs(date).month();

    const beginYear = dayjs(beginDate).year();
    const beginMonthIndex = dayjs(beginDate).month();

    const moreThanBeginDate = year > beginYear ||
        ( year === beginYear && monthIndex >= beginMonthIndex );

    const endYear = dayjs(endDate).year();
    const endMonthIndex = dayjs(endDate).month();

    const lessThanEndDate = year < endYear ||
        ( year === endYear && monthIndex <= endMonthIndex );

    return moreThanBeginDate && lessThanEndDate;

}

/*
 * if newer getMonthDetails has been called
 * do not apply data loaded by the old getMonthDetails
 * */
let requestDetailsUid;

/**
 * Helper function to use inside function _calculateTotalsForYears
 * @see _calculateTotalsForYears
 *
 * @param periodEnd {String}
 * @param bundleId {Number}
 * @param yearData {
 *  {
 *      months: [MonthReportObject|null],
 *      monthsRawValues: Array,
 *      total: Object,
 *      [error]: Object|null,
 *  }
 * }
 * @param requestUid {String} - uid to check whether request is still relevant
 * @return {Promise<Object|undefined>} - resolves with yearData after
 * successfully calculating total for it
 *
 * @private
 */
async function _calcTotalForYear(periodEnd, bundleId, yearData, requestUid) {

    let totalRes;

    try {

        totalRes = await getReports({
            period_type: 'ytd',
            end: periodEnd,
            ids: bundleId,
            requestUid: requestUid,
        })

    } catch (e) {
        throw e;
    }

    if (requestUid !== requestDetailsUid) {
        return;
    }

    // const totalCol = yearRowData.columns.find(col => col.key === 'total');

    /*if (props.reportOptions.performance_unit === 'percent') {
        portfolioTotals.value.push(parseFloat(total.grand_return * 100).toFixed(2))
    } else {
        portfolioTotals.value.push(formatNumber(total.grand_absolute_pl))
    }*/
    if (props.performance_unit === 'percent') {
        yearData.total.displayValue = parseFloat(totalRes.grand_return * 100).toFixed(2) + '%';

    } else {
        yearData.total.displayValue = formatNumber(totalRes.grand_absolute_pl)
    }

    return yearData;

}

/**
 * A helper function for function getMonthDetails
 * @see getMonthDetails
 *
 * @param reportsMap { Map } - map from reportsMapRef
 * @param endDate {Date} - last date in period of dates for performance
 * @param bundleId {Number} - id of a portfolio bundle
 * @param requestUid {String} - instance of requestDetailsUid
 * @return { Promise<Map> } - reportsMap filled with years' totals
 */
async function _calculateTotalsForYears(reportsMap, endDate, bundleId, requestUid) {

    let promises = [];
    const endDateDj = dayjs(endDate);

    const yearsList = [];

    for (let [year, yearData] of reportsMap.entries() ) {

        yearsList.push(year);

        let end;

        if ( year == endDateDj.year() ) {
            end = endDateDj.format('YYYY-MM-DD');
        } else {
            end = getEndOfYearDate(year);
        }

        // yearData changed inside _calcTotalForYear
        promises.push( _calcTotalForYear(end, bundleId, yearData, requestUid) )

	}

    const responses = await Promise.allSettled(promises);

    responses.forEach((res, index) => {

        const year = yearsList[index];

        if (res.status === 'fulfilled') {

            reportsMap.set( year, res.value );

		} else { // rejected

            let yearData = reportsMap.get( yearsList[index], );

            yearData.error = true;
            yearData.total.error = res.reason;

            reportsMap.set(year, yearData);

		}

	})

	return reportsMap;

}

/**
 *
 * @param requestOptions
 * @param beginDate {String} - 'YYYY-MM-DD'
 * @param endDate {String} - 'YYYY-MM-DD'
 * @return {Promise<*>}
 */
async function getReportForMonth(requestOptions, beginDate, endDate) {

	Object.keys(requestOptions).forEach(key => {
		if ( !requestOptions[key] ) {
			console.error(`[RvPerformanceDetail.getReportForMonth] invalid value inside requestOptions.${key}: ${requestOptions[key]}`)
		}
	})

    const opts = {
        period_type: 'mtd',
        ...requestOptions
    };

    if ( !datesRangeIncludesMonth(opts.end, beginDate, endDate) ) {
        // date is outside of dates range of performance report
        return {
			end_date: requestOptions.end,
			outside_of_dates_range: true,
		}
	}

    let res;

    try {
        res = await getReports(opts);

    } catch (e) {

        if (!e.error?.details?.errors) {
            // not a typical back-end error
            console.error(e);
        }

        throw {
            monthEndDate: requestOptions.end,
            data: e
        }
    }

	res.frontOptions = {
        monthEndDate: requestOptions.end
    };

    return res;

}

/**
 * Helper function to use inside function _assembleReportsMap
 * @see _assembleReportsMap
 *
 * @param reportData {Object}
 * @param yearData {Object}
 * @param monthIndex
 * @return { {} }
 * @private
 */
function _applyMonthReport(reportData, yearData, monthIndex) {

    if (reportData.outside_of_dates_range) { // e.g. date outside of dates range for performance report

        yearData.months[monthIndex] = {
            displayValue: "-",
            reportData: reportData,
            error: {
                noErrorMode: true,
                description: "Month is outside of range of dates for a performance report",
            }
        };

        yearData.monthsRawValues[monthIndex] = null;

		return yearData;

	}

    let displayVal = "-", rawVal;

    if (props.performance_unit === 'percent') {
        /*yearsMap.get(year)[monthIndex] = [
            parseFloat(reportData.grand_return * 100).toFixed(2),
            parseFloat(reportData.grand_return * 100).toFixed(2) + '%',
            reportData,
        ]*/

		if (reportData.grand_return) {
            displayVal = parseFloat(reportData.grand_return * 100).toFixed(2) + '%';
		}

		rawVal = parseFloat(reportData.grand_return * 100).toFixed(2);

    } else {
        /*yearsMap.get( year )[month] = [
            reportData.grand_absolute_pl,
            formatNumber(reportData.grand_absolute_pl),
            reportData
        ]*/

		if (reportData.grand_absolute_pl) {
            displayVal = formatNumber(reportData.grand_absolute_pl);
		}

        rawVal = reportData.grand_absolute_pl;

    }

    yearData.months[monthIndex] = {
        displayValue: displayVal,
        reportData: reportData,
    };

    yearData.monthsRawValues[monthIndex] = rawVal;

    return yearData;

}


function getDefaultDataForYear(year, beginDate, endDate) {

    //# region Default data for months
    /*let defaultMonth = [
        [0, 0],
        [0, 0],
        [0, 0],
        [0, 0],
        [0, 0],
        [0, 0],
        [0, 0],
        [0, 0],
        [0, 0],
        [0, 0],
        [0, 0],
        [0, 0],
    ];*/
    /**
     * @type {Object}
     * @property months { [MonthReportObject] }
     *
     */
    let defaultYearData = {
        // error: false,
        months: [
            {
                displayValue: '-',
                // reportData: {},
                // error: {},
                // data: {},
            },
            {
                displayValue: '-',
            },
            {
                displayValue: '-',
            },
            {
                displayValue: '-',
            },
            {
                displayValue: '-',
            },
            {
                displayValue: '-',
            },
            {
                displayValue: '-',
            },
            {
                displayValue: '-',
            },
            {
                displayValue: '-',
            },
            {
                displayValue: '-',
            },
            {
                displayValue: '-',
            },
            {
                displayValue: '-',
            },
        ],
        /*
        Storing raw values in a separate property makes it easier to access
        them inside chooseYear. No need to call Array.map().
        */
        monthsRawValues: [
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
        ],

        total: {
            displayValue: ''
            // error: null
        }

    };

    // apply number formats to default data
    /*if (props.reportOptions.performance_unit === 'percent') {

        defaultYearData.months = defaultYearData.months.map(month => {
            month.displayValue = '0.00%';
            return month;
        });

    } else {

        defaultYearData.months = defaultYearData.months.map(month => {
            month.displayValue = formatNumber( month.formattedValue );
            return month;
        });

    }*/

    defaultYearData.months = defaultYearData.months.map( (month, monthIndex) => {

        const monthStr = `${monthIndex + 1}`.padStart(2, "0");
        const date = `${year}-${monthStr}-01`;

        if ( !datesRangeIncludesMonth(date, beginDate, endDate) ) {

            month.error = {
                noErrorMode: true,
                description: "Month is outside of range of dates for a performance report",
            }

        }

        return month;

    })

	return defaultYearData;

}

/**
 * Helper function to use inside function getMonthDetails()
 * @see getMonthDetails
 *
 * @param monthsList
 * @param yearsMap {Map}
 * @param beginDate {String} - first date in range of dates for a performance report
 * @param endDate {String} - last date in range of dates for a performance report
 * @return {ReportsMap} - map filled with data of reports for months
 * @private
 */
function _assembleReportsMap(monthsList, yearsMap, beginDate, endDate) {

    const getMonthEndDate = responseData => {

        if (responseData.value) {
            return responseData.value.frontOptions.monthEndDate;
		}

        return responseData.reason.monthEndDate;

	}

    // sort months by `.end_date` years in descending order
    monthsList.sort((a, b) => {

        // const aEndDate = a.value ? a.value.end_date : a.reason.end_date;
        const aEndDate = getMonthEndDate(a);
        let aYear = null;

        if ( dayjs(aEndDate, 'YYYY-MM-DD').isValid() ) {
            aYear = dayjs(aEndDate).year();

        } else {
            console.error(`[RvPerformanceDetail] wrong end_date format ${a}`)
        }

        // const bEndDate = b.value ? b.value.end_date : b.reason.end_date;
        const bEndDate = getMonthEndDate(b);
        let bYear = null;

        if ( dayjs(bEndDate, 'YYYY-MM-DD').isValid() ) {
            bYear = dayjs(bEndDate).year();

        } else {
            console.error(`[RvPerformanceDetail] wrong end_date format ${b}`)
        }

        if (aYear > bYear) {
            return -1;

        } else if (aYear < bYear) {
            return 1;
        }

        return 0;

    })

    // Group months by years
    monthsList.forEach((item) => {

        // let endDate = item.value ? item.value.end_date : item.reason.end_date;
        let endDate = getMonthEndDate(item);

        if ( !dayjs(endDate, 'YYYY-MM-DD').isValid() ) {
            console.error(`[RvPerformanceDetail._assembleReportsMap] response with invalid endDate: ${item}`);
            throw `[RvPerformanceDetail._assembleReportsMap] invalid endDate: ${endDate}`;
		}

        endDate = endDate.split('-');

        const year = endDate[0]; // e.g. "1999", "2001", "2012".
        let monthIndex = endDate[1]; // e.g. "01", "05", "12".
        monthIndex = parseInt(monthIndex) - 1; // month index

        if ( !yearsMap.has(year) ) {
            yearsMap.set( year, getDefaultDataForYear(year, beginDate, endDate) )
        }

        let yearData = yearsMap.get(year);

        if (item.status === 'fulfilled') {

            yearData = _applyMonthReport(item.value, yearData, monthIndex);

        }
        else { // promise rejected

            yearData.error = true;
            yearData.months[monthIndex].error = item.reason;

		}

        yearsMap.set(year, yearData)

    })

    /*columnsForYear.push({
        key: 'total',
        value: '-',
    });

    portfolioItemsList.push({
        key: year,
        columns: columnsForYear,
        isActive: false,
    })*/

	return yearsMap;

}

async function getMonthDetails() {

    requestDetailsUid = useGenerateUniqueId();
    const requestUid = requestDetailsUid;
	/* portfolioYears.value = [];
    portfolioTotals.value = [];
    portfolioItems.value = [];
    portfolioItemsRaw = {}; */
    detailsLoading.value = true;
	resetData();

	let bundle = bundleId.value;

	let begin
	let firstTransaction = {}
	if (!props.begin_date) {
		firstTransaction = await useApi('performanceFirstTransaction.get', {
			params: { id: bundle },
		})
		begin = firstTransaction.transaction_date
	} else {
		begin = dayjs(props.begin_date).format('YYYY-MM-DD')
	}

	// let end = dayjs(props.end_date).endOf('year').format('YYYY-MM-DD');
    let end = props.end_date;

	const monthEndDates = getLastBusinessDayOfMonth(begin, end);

	console.log('begin', begin);
	console.log('end', end);
	console.log('monthEndDates', monthEndDates);

	const promises = []

    // get performance report for months
	monthEndDates.forEach(monthEndDate => {

		// promises.push(getReports({ period_type: 'ytd', end: monthEndDate, ids: bundle }))
		if ( monthEndDate < new Date(props.end_date) ) {

            monthEndDate = dayjs(monthEndDate).format('YYYY-MM-DD');

            const getReportOpts = {
                end: monthEndDate,
                ids: bundle,
                requestUid: requestUid,
            };

            promises.push( getReportForMonth(getReportOpts, begin, props.end_date) );

		}

	})


    let allMonths = await Promise.allSettled(promises);

    // Check that requested data is still relevant
    if (requestUid !== requestDetailsUid) {
		return;
	}

    /*
     * Not using `reportsMapRef` in case while calculating data became
	 * irrelevant and must be
	 * discarded (i.e. reportsMap will not be assigned to reportsMapRef)
	 */
	let reportsMap = new Map();

	console.log('allMonths', allMonths);
	console.log('yearsBuffer', reportsMap);

    // Structure of arrays with months' data inside yearsBuffer
    //
    // index 0 - raw value
    // index 1 - formatted value
    // index 2 - contains whole response object from backend with data about month
    // todo refactor

    reportsMap = _assembleReportsMap(allMonths, reportsMap, begin, props.end_date);

	/*let dateTo = dayjs(props.end_date)
	let dateFrom = dayjs(begin)*/

	/* for (let [year, yearData] of reportsMapRef.value) {
        // @type {String} - e.g. "1999", "2001", "2012".
        // year
        //
        // @type { [Array] } - an array of arrays with data for each month
        // months

        // portfolioPerformanceReports[year] = months;

		// portfolioItemsRaw.value.push(
		// 	Object.values(months).map((item, i) => {
		// 		if (
		// 			(year != dateTo.year() || i <= dateTo.month()) &&
		// 			(year != dateFrom.year() || i >= dateFrom.month())
		// 		)
		// 			return item[0]
		// 		else return ''
		// 	})
		// )

		// portfolioItems.value.push(
		// 	Object.values(months).map((item, i) => {
		// 		if (
		// 			(year != dateTo.year() || i <= dateTo.month()) &&
		// 			(year != dateFrom.year() || i >= dateFrom.month())
		// 		)
		// 			return item[1]
		// 		else return ''
		// 	})
		// )

        // portfolioItemsRawData[year] = monthsRawList;

        let columnsForYear = [{
            key: 'year',
            value: year,
        }]

        const monthsCols = yearData.months.map((month, i) => {

            let val = "-";

            if ( _datesRangeIncludesMonth(year, i, begin) ) {
                val = month[1];
            }

            return {
                key: i, // month index
                value: val,
            };

        });

        columnsForYear = columnsForYear.concat(monthsCols);

        // let end;
		//
        // if ( year == dayjs(dateTo).year() ) {
        //     end = dateTo.format('YYYY-MM-DD');
        // } else {
        //     end = `${year}-12-31`;
        // }
		//
		// let total = await getReports({
		// 	period_type: 'ytd',
		// 	end: end,
		// 	ids: bundle,
		// })
		//
        // let totalCol = {
        //     key: 'total',
        //     value: '-',
        // }
		//
        // if (props.reportOptions.performance_unit === 'percent') {
        //     totalCol.value = parseFloat(total.grand_return * 100).toFixed(2) + '%';
		//
        // } else {
        //     totalCol.value = formatNumber(total.grand_absolute_pl)
        // }
		//
        // columnsForYear.push(totalCol);

        columnsForYear.push({
            key: 'total',
            value: '-',
        });

        portfolioItemsList.push({
            key: year,
            columns: columnsForYear,
            isActive: false,
        })

        // portfolioItems.value = sortYears(portfolioItems.value);
	}*/
    /*
     * if it is not necessary to use '.end_date' from response
     * of getReports() above
     * consider calling _calculateTotalsForYears() alongside getReports()
     */
    reportsMap = await _calculateTotalsForYears(
        reportsMap, props.end_date, bundle, requestUid
	);

    // Check that requested totals are still relevant
    if (requestUid !== requestDetailsUid) {
        return;
    }

    // if data is actual - use it
    // portfolioItems.value = portfolioItemsList;
    // portfolioItemsRaw = portfolioItemsRawData;
    reportsMapRef.value = reportsMap;
    detailsLoading.value = false;

	if ( reportsMapRef.value.size ) {

        const latestYearKey = reportsMapRef.value.keys().next().value;

		chooseYear(latestYearKey);

	}

}

async function updateBundle(bundleData) {
	let updatedData = JSON.parse(JSON.stringify(currentBundle.value))

	updatedData = {...updatedData, ...bundleData}
	updatedData.short_name = bundleData.name
	updatedData.user_code = bundleData.name
	updatedData.public_name = bundleData.name

	const opts = {
		params: {
			id: updatedData.id,
		},
		body: updatedData,
	}

	let res = await useApi('portfolioBundle.put', opts)

	if (!res._$error) {
		useNotify({
			type: 'success',
			title: 'Bundle updated successfully',
		})

		emits('refresh')
	}
}

async function deleteBundle() {
	let isConfirm = await useConfirm({
		title: 'Delete bundle',
		text: `Do you want to delete the bundle “${currentBundle.value.user_code}” permanently?`,
	})

	if (!isConfirm) return false

	const res = await useApi('portfolioBundle.delete', {
		params: {id: bundleId.value},
	})

	if (!res._$error) {
		useNotify({
			type: 'success',
			title: `Bundle ${currentBundle.value.user_code} was successfully deleted.`,
		})
		emits('refresh')
	}
}

// double
async function getReports({period_type, end, ids, type = 'months', requestUid}) {

	let res = await useApi('performanceReport.post', {
		body: {
			save_report: false,
			period_type: period_type,
			end_date: end,
			calculation_type: props.calculation_type,
			segmentation_type: type,
			report_currency: props.report_currency,
			bundle: ids,
		},
		notifyError: false,
	})

	if (requestUid && requestUid !== requestDetailsUid) {
        return null;
	}

    if ( res.hasOwnProperty('_$error') ) {

        useNotify({
            group: 'server_error',
            title: 'Server Error',
            text: res._$error.error,
            duration: 20000
        })

		throw res._$error;

    }

	return res
}

function init() {
    if (bundleId.value) getMonthDetails()
}

watch(
    () => props.bundle,
    async (newVal, oldVal) => {

        if (!newVal) {

            if (oldVal) { // value changed from something to nothing

                resetData();
            }

        }

    },
    {deep: true}
)

watch(
    () => [
        props.bundle,
        props.calculation_type,
        props.report_currency,
    ],
    async () => {

        if (props.bundle) {
            await getMonthDetails();

        } else {
            console.error(`[RvPerformanceDetail] no bundle passed: ${props.bundle}`);
        }

    },
    {deep: true},
)

</script>

<style lang="scss">
.coll_years {
	border-top: 1px solid var(--table-border-color);
	border-left: 1px solid var(--table-border-color);
}

.coll_item {
	height: 36px;
	line-height: 36px;
	padding: 0 14px;
	white-space: nowrap;
	background: var(--table-header-background-color);
	border-bottom: 2px solid var(--table-border-color);
	font-size: 14px;

	&.t_header {
		height: 50px;
		line-height: 50px;
		font-weight: 600;
	}
}

.coll_months {
	width: 100%;
}

.table_wrap {
	width: 100%;
}

.table-cell {
	text-align: right;
}

.t_header .table-cell {
	text-align: left;
}
</style>
