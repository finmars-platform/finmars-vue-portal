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
					:rightClickCallback="showPerformanceDetail"
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
                        v-for="row in portfolioItems"
                        @click="chooseYear(row.key)"
                        :key="row.key"
                        :active="row.isActive"
                        class="grid width-100"
                        :style="`grid-template-columns: ${tableGridTemplateCols}`">

                        <FmBasicTableCell
                            v-for="cell in row.columns"
                            :key="cell.key"
                            :valueType="cell.key !== 'year' ? 20 : null"
                            @contextmenu.prevent="showPerformanceDetail(row.key, cell.key)"
                        >{{ cell.value }}</FmBasicTableCell>

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
        <div v-show="!detailsLoading && !portfolioItems.length"
             class="flex-row flex-center p-16" style="font-weight: 500;">
			{{ getTextForEmptyTable() }}
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
import {useSortRowsByNumber} from "~/composables/useTable";

const props = defineProps({
	reportOptions: {
		type: Object,
	},

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

})

/* *
 * remove 'loadingDataStart', 'loadingDataEnd' after implementing
 * discarding of result of old requests
 * */
const emits = defineEmits(['setYear', 'refresh', 'loadingDataStart', 'loadingDataEnd'])

function formatNumber(num) {
	return Intl.NumberFormat('en-EN', {
		// maximumSignificantDigits: 3
	}).format(num)
}

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
/** Years with formatted values for months */
let portfolioItems = ref([])

/** Years with values without formatting for months.
 *
 * @type { {} } - key - a year as a string. value - array with strings */
let portfolioItemsRaw = {};
let portfolioYears = ref([])
let portfolioTotals = ref([])
let detailsLoading = ref(false);
let detailsLoadingError = ref('');

let performanceDetailIsOpen = ref(false)
let performanceDetails = ref(null)

let showBundleActions = ref(false)
let editBundleIsOpened = ref(false)
const tableGridTemplateCols = '75px repeat(12, 1fr) 80px';

/* *
 * portfolioPerformanceReports
 *
 * key - a year as a string. e.g. "1970"
 *
 * value - an array that contains 12 arrays for each month.
 *
 * Structure of month's array:
 * index 0 - raw value
 * index 1 - formatted value
 * index 2 - contains whole response object from backend with data about month
 *
 * portfolioPerformanceReports = {
 *  "1970": [
 *      [
 *          0: "17.48",
 *          1: "17.48%",
 *          2: {}
 *      ],
 *      [],[],[],[],[],[],[],[],[],[],[],
 *  ]
 * }
 *
 * */
let portfolioPerformanceReports = {};

/*{name: 'Jan'},
{key: 'february', name: 'Feb'},
{key: 'march', name: 'Mar'},
{name: 'Jan'},
{name: 'Jan'},
{name: 'Jan'},
{name: 'Jan'},
{name: 'Jan'},
{name: 'Jan'},
{name: 'Jan'},
{name: 'Jan'},
{name: 'Jan'},*/

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

function resetData() {

    portfolioYears.value = [];
    portfolioTotals.value = [];
    portfolioItems.value = [];
    portfolioItemsRaw = {};

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
            await getMonthDetails()
        }
    },
    {deep: true},
)

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

    const yearData = portfolioItems.value.find(yItem => yItem.key === year);

    if (!yearData) {
        throw `RvPerformanceDetail.chooseYear: unavailable value selected: ${year}`
    }

    if (yearData.isActive) {
		return;
	}

	const prevActiveYear = portfolioItems.value.find(yItem => yItem.isActive);

    if (prevActiveYear) {
        prevActiveYear.isActive = false;
	}

    yearData.isActive = true;

	const detailYear = portfolioYears.value.find(year => year === year);

    if (!detailYear) {
        throw `RvPerformanceDetail.chooseYear: invalid year: ${year}`
    }

    const portfolioMonthsEndsRaw = portfolioPerformanceReports[year].map(yearData => {

        if (yearData[2] && yearData[2].end_date) {
            return yearData[2].end_date
        }

        return null;

    })

	const emitData = JSON.parse(JSON.stringify(
        {
			// datasetCumulative: portfolioItems.value[id],
			portfolioMonthsEndsRaw: portfolioMonthsEndsRaw,
			datasetCumulative: portfolioItemsRaw[year],
			detailYear: detailYear,
    	}
    ));

	emits('setYear', emitData)
}

async function showPerformanceDetail(year, cellKey) {

	console.log('portfolioPerformanceReports', portfolioPerformanceReports);

    if ( ['year', 'total'].includes(cellKey) ) {
        return;
	}

    // cell with data for month was right-clicked

	const monthReportData = portfolioPerformanceReports[year][cellKey][2];

    if (monthReportData) { // cell is not empty and without errors
        // `cellKey` is index of a month
        performanceDetails.value = portfolioPerformanceReports[year][cellKey][2];

        performanceDetailIsOpen.value = true;

    }

}

/**
 * Function to call inside Array.sort()
 *
 * @param yearsList { [{}] } - portfolioItems.value
 * @return {number} - 1, -1, 0
 */
function sortYears(yearsList) {

	let sortCol = tableHeader.value.find(col => col.sorting);

	if (!sortCol) {
		// return yearsList;

		// if there is no active sorting, sort by year in descending order
        sortCol = {
            key: 'year',
			sorting: 'desc',
		}
	}

	const descending = sortCol.sorting === 'desc';

	yearsList.sort((a, b) => {

        /*let aVal = portfolioItemsRaw[a.key][colData.key];
        let bVal = portfolioItemsRaw[b.key][colData.key];*/
        let aSortColVal = a.columns.find(col => col.key === sortCol.key).value;
        let bSortColVal = b.columns.find(col => col.key === sortCol.key).value;

        return useSortRowsByNumber(aSortColVal, bSortColVal, descending);

    });

    return yearsList;

}

/**
 * Sort by month's value
 *
 * @param monthIndex {Number}
 */
function toggleSorting(columnKey) {

    const activeSortCol = tableHeader.value.find(
        col => col.sorting
	);

    const colData = tableHeader.value.find(col => col.key === columnKey);

    if (activeSortCol && activeSortCol.key !== colData.key) {
        // if there is active sorting by another column, turn it off
        activeSortCol.sorting = '';
	}

	if ( colData.sorting === 'desc' ) {
        colData.sorting = 'asc';

	} else { // `.sorting` === 'asc' or '';
        colData.sorting = 'desc';
	}

	portfolioItems.value = sortYears(portfolioItems.value);

}

/**
 * Returns dates that will be used to calculate performance report
 * on backend.
 *
 * @param begin_date
 * @param end_date
 * @return {[Date]} - Months between begin_date and end_date.
 * Days for all months except last are last not weekend days.
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
        // May be problem in selected bundle.
        // Let use ability to select another.
        emits('loadingDataEnd');

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

async function getMonthDetails() {

	if (detailsLoading.value) return false;

    emits("loadingDataStart");

    detailsLoading.value = true
	portfolioYears.value = []
	portfolioTotals.value = []
	portfolioItems.value = []
	portfolioItemsRaw = {}

	let bundle = bundleId.value

    function _datesRangeIncludesMonth(year, monthIndex) {
        return ( year != dateTo.year() || monthIndex <= dateTo.month() ) &&
        ( year != dateFrom.year() || monthIndex >= dateFrom.month() );
    }

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

	monthEndDates.forEach(monthEndDate => {

		// promises.push(getReports({ period_type: 'ytd', end: monthEndDate, ids: bundle }))
		if ( monthEndDate < new Date(props.end_date) ) {

            monthEndDate = dayjs(monthEndDate).format('YYYY-MM-DD');

            promises.push(getReports({period_type: 'mtd', end: monthEndDate, ids: bundle}));

		}

	})

	let yearsBuffer = new Map()

    let allMonths;

    try {
        allMonths = await Promise.all(promises);
    } catch (e) {
        console.error(e)

		resetData();
        detailsLoading.value = false;
        detailsLoadingError.value = "Failed to calculate years for period. Try again later.";
		// May be problem in selected bundle.
		// Let use ability to select another.
        emits('loadingDataEnd');

        throw "Error above occurred while trying to load and calculate data for RvPerformanceDetail";
    }

    // sort months by `.end_date` years in descending order
    allMonths.sort((a, b) => {

        let aYear = null;

        if ( dayjs(a.end_date, 'YYYY-MM-DD').isValid() ) {
            aYear = dayjs(a.end_date).year();

        } else {
            console.error(`RvPerformanceDetail: wrong end_date format ${a}`)
        }

        let bYear = null;

        if ( dayjs(b.end_date, 'YYYY-MM-DD').isValid() ) {
            bYear = dayjs(b.end_date).year();

        } else {
            console.error(`RvPerformanceDetail: wrong end_date format ${b}`)
        }

        if (aYear > bYear) {
            return -1;

        } else if (aYear < bYear) {
            return 1;
        }

        return 0;

    })

	console.log('allMonths', allMonths);
	console.log('yearsBuffer', yearsBuffer);

    // Structure of arrays with months' data inside yearsBuffer
    //
    // index 0 - raw value
    // index 1 - formatted value
    // index 2 - contains whole response object from backend with data about month
    // todo refactor

    //# region Default data for months
    let defaultMonth = [
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
    ];

    // apply number formats to default data
    if (props.reportOptions.performance_unit === 'percent') {
        defaultMonth.forEach((month, index) => {
            defaultMonth[index][1] = '0.00%';
        });


    } else {
        defaultMonth.forEach((month, index) => {
            defaultMonth[index][1] = formatNumber( defaultMonth[index][1] );
        });
    }
    //# endregion

	allMonths.forEach((item) => {

		const parseDate = item.end_date.split('-');
        const year = parseDate[0]; // e.g. "1999", "2001", "2012".
        let month = parseDate[1]; // e.g. "01", "05", "12".
        month = parseInt(month) - 1; // month index

		/*if (props.reportOptions.performance_unit === 'percent') {
			defaultMonth = {
				key_01: [0, 0 + '%'],
				key_02: [0, 0 + '%'],
				key_03: [0, 0 + '%'],
				key_04: [0, 0 + '%'],
				key_05: [0, 0 + '%'],
				key_06: [0, 0 + '%'],
				key_07: [0, 0 + '%'],
				key_08: [0, 0 + '%'],
				key_09: [0, 0 + '%'],
				key_10: [0, 0 + '%'],
				key_11: [0, 0 + '%'],
				key_12: [0, 0 + '%'],
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
		}*/

		if ( !yearsBuffer.has(year) ) {
			yearsBuffer.set(year, JSON.parse(JSON.stringify(defaultMonth)) )
		}

		if (props.reportOptions.performance_unit === 'percent') {
			yearsBuffer.get( year )[month] = [
				parseFloat(item.grand_return * 100).toFixed(2),
				parseFloat(item.grand_return * 100).toFixed(2) + '%',
				item,
			]
		} else {
			yearsBuffer.get( year )[month] = [
				item.grand_absolute_pl,
				formatNumber(item.grand_absolute_pl),
				item
			]
		}


	})

	let dateTo = dayjs(props.end_date)
	let dateFrom = dayjs(begin)

	let index = 0;

	for (let [year, months] of yearsBuffer) {
        // @type {String} - e.g. "1999", "2001", "2012".
        // year
        //
        // @type { [Array] } - an array of arrays with data for each month
        // months

        portfolioPerformanceReports[year] = months;
		index = index + 1;
		portfolioYears.value.push(year)

		/*portfolioItemsRaw.value.push(
			Object.values(months).map((item, i) => {
				if (
					(year != dateTo.year() || i <= dateTo.month()) &&
					(year != dateFrom.year() || i >= dateFrom.month())
				)
					return item[0]
				else return ''
			})
		)*/
        const monthsRawList = months.map((month, i) => {
            if ( _datesRangeIncludesMonth(year, i) ) {
                return month[0]
            }

            return '';
        });

        portfolioItemsRaw[year] = monthsRawList;
		/*portfolioItems.value.push(
			Object.values(months).map((item, i) => {
				if (
					(year != dateTo.year() || i <= dateTo.month()) &&
					(year != dateFrom.year() || i >= dateFrom.month())
				)
					return item[1]
				else return ''
			})
		)*/
        /*const monthsRow = months.map((month, i) => {

			let val = null;

            if ( _datesRangeIncludesMonth(year, i) ) {
				val = month[1];
            }

			return {
				key: i, // month index
				value: val,
			};

        });*/
        let columnsForYear = [{
            key: 'year',
            value: year,
        }]

        const monthsCols = months.map((month, i) => {

            let val = "-";

            if ( _datesRangeIncludesMonth(year, i) ) {
                val = month[1];
            }

            return {
                key: i, // month index
                value: val,
            };

        });

        columnsForYear = columnsForYear.concat(monthsCols);

        /*portfolioItems.value.push({
            key: year,
            columns: monthsRow,
            isActive: false,
        })

        portfolioItems.value = sortYears(portfolioItems.value);*/

        let end;

        if ( year == dayjs(dateTo).year() ) {
            end = dateTo.format('YYYY-MM-DD');
        } else {
            end = `${year}-12-31`;
        }

		let total = await getReports({
			period_type: 'ytd',
			end: end,
			ids: bundle,
		})

        let totalCol = {
            key: 'total',
            value: '-',
        }

        /*if (props.reportOptions.performance_unit === 'percent') {
			portfolioTotals.value.push(parseFloat(total.grand_return * 100).toFixed(2))
		} else {
			portfolioTotals.value.push(formatNumber(total.grand_absolute_pl))
		}*/
        if (props.reportOptions.performance_unit === 'percent') {
            totalCol.value = parseFloat(total.grand_return * 100).toFixed(2) + '%';

        } else {
            totalCol.value = formatNumber(total.grand_absolute_pl)
        }

        columnsForYear.push(totalCol);

        portfolioItems.value.push({
            key: year,
            columns: columnsForYear,
            isActive: false,
        })

        // portfolioItems.value = sortYears(portfolioItems.value);


	}

    emits('loadingDataEnd');

    detailsLoading.value = false

	if (portfolioYears.value.length) {
		const latestYearKey = portfolioItems.value[0].key;
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

	if (!res.error) {
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

	if (!res.error) {
		useNotify({
			type: 'success',
			title: `Bundle ${currentBundle.value.user_code} was successfully deleted.`,
		})
		emits('refresh')
	}
}

// double
async function getReports({period_type, end, ids, type = 'months'}) {

	// console.log('getReports.period_type', period_type)
	// console.log('getReports.end', end)
	// console.log('getReports.type', type)
	// console.log('getReports.ids', ids)
	// console.log('getReports.====')

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
	})

    if (res.error) {
        throw res.error;
    }

	return res
}

function init() {
    if (bundleId.value) getMonthDetails()
}

</script>

<style lang="scss">
.coll_years {
	border-top: 1px solid $border;
	border-left: 1px solid $border;
}

.coll_item {
	height: 36px;
	line-height: 36px;
	padding: 0 14px;
	white-space: nowrap;
	background: #f2f2f2;
	border-bottom: $basic-table-border;
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
