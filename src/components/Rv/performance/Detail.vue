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
			<div class="coll_years">
				<div class="coll_item t_header">Years</div>
				<div class="coll_item" v-for="(item, i) in portfolioYears" :key="i">
					{{ item }}
				</div>
			</div>
			<div
                class="coll_months"
            >
				<BaseTable
					:headers="portfolioHeaders"
					:items="portfolioItems"
					colls="repeat(12, 1fr)"
					:active="activeYear"
					:rightClickCallback="showPerformanceDetail"
                    :is-disabled="detailsLoading"
					:is-readonly="true"
				/>
			</div>

			<div class="coll_total">
				<div class="coll_item t_header">TOTAL</div>
				<div class="coll_item" v-for="(item, i) in portfolioTotals" :key="i">

					<span v-if="reportOptions.performance_unit === 'percent'">
						{{ Math.round(item * 100) / 100 }}%
					</span>
					<span v-if="reportOptions.performance_unit === 'absolute'">
						{{ item }}
					</span>
				</div>
			</div>
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
let portfolioMonthsEndsRaw = ref([])
/** Years with values without formatting for months */
let portfolioItemsRaw = ref([])
let portfolioYears = ref([])
let portfolioTotals = ref([])
let activeYear = ref(null)
let detailsLoading = ref(false);
let detailsLoadingError = ref('');

let performanceDetailIsOpen = ref(false)
let performanceDetails = ref(null)

let detailYear = ref('')

let showBundleActions = ref(false)
let editBundleIsOpened = ref(false)
let portfolioPerformanceReports = ref({})

let portfolioHeaders = ref([
	'Jan',
	'Feb',
	'Mar',
	'Apr',
	'May',
	'Jun',
	'Jul',
	'Aug',
	'Sep',
	'Oct',
	'Nov',
	'Dec',
])

function resetData() {

    portfolioYears.value = [];
    portfolioTotals.value = [];
    portfolioItems.value = [];
    portfolioItemsRaw.value = [];
    portfolioMonthsEndsRaw.value = [];

    activeYear.value = null;
    detailYear.value = '';

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
 * @return {Promise<void>}
 */
async function chooseYear(index) {

    if (activeYear.value === index) {
		return;
	}

	activeYear.value = index
	detailYear.value = portfolioYears.value[index]

	console.log('portfolioYears', portfolioYears.value);
	console.log('chooseYear index', index);
	console.log('portfolioItems', portfolioItems.value);
	console.log('portfolioItemsRaw', portfolioItemsRaw.value);
	console.log('portfolioMonthsEndsRaw', portfolioMonthsEndsRaw.value);

	console.log('detailYear', detailYear.value);

	const yearData = JSON.parse(JSON.stringify(
        {
			// datasetCumulative: portfolioItems.value[id],
			portfolioMonthsEndsRaw: portfolioMonthsEndsRaw.value,
			datasetCumulative: portfolioItemsRaw.value[index],
			detailYear: detailYear.value,
    	}
    ));

	emits('setYear', yearData)
}

async function showPerformanceDetail(rowIndex, cellIndex) {

	console.log('rowIndex', rowIndex)
	console.log('cellIndex', cellIndex)

	console.log('portfolioPerformanceReports', portfolioPerformanceReports);

	try {
		performanceDetailIsOpen.value = true;

		let keyNum = String(cellIndex + 1).padStart(2, '0');

		performanceDetails.value = portfolioPerformanceReports[rowIndex][`key_${keyNum}`][2]

	} catch (error) {
		console.log('error', error);
		performanceDetailIsOpen.value = false;
	}

	console.log('performanceDetails', performanceDetails.value)

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

    activeYear.value = null;
    detailsLoading.value = true
	portfolioYears.value = []
	portfolioTotals.value = []
	portfolioItems.value = []
	portfolioItemsRaw.value = []

	let bundle = bundleId.value

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

	const monthEndDates = getLastBusinessDayOfMonth(begin, end)

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

    // Structure of array with month's data
    //
    // so 0 index for raw value
    // so 1 index for formatted value
    // 2 index - optional. Contains whole response object from backend with data about month
    // todo refactor

    //# region Default data for months
    let defaultMonth = {
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

    // apply number formats to default data
    if (props.reportOptions.performance_unit === 'percent') {
        Object.keys(defaultMonth).forEach(monthKey => {
            defaultMonth[monthKey][1] = '0.00%';
        });


    } else {
        Object.keys(defaultMonth).forEach(monthKey => {
            defaultMonth[monthKey][1] = formatNumber( defaultMonth[monthKey][1] );
        });
    }
    //# endregion

	allMonths.forEach((item) => {

		const parseDate = item.end_date.split('-');
        const year = parseDate[0]; // e.g. "1999", "2001", "2012".
        const month = parseDate[1]; // e.g. "01", "05", "12".

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
	let dateFrom = dayjs(begin)

	let index = 0;

	for (let [year, months] of yearsBuffer) {

		portfolioPerformanceReports[index] = months // todo refactor, when we consider multiple years
		index = index + 1;
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

        /* *
         * Total for year that matches to "end_date"
         * should not be calculated fully.
         * Calculate it only until end_date.
         * */
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

        if (props.reportOptions.performance_unit === 'percent') {
			portfolioTotals.value.push(parseFloat(total.grand_return * 100).toFixed(2))
		} else {
			portfolioTotals.value.push(formatNumber(total.grand_absolute_pl))
		}

	}

    emits('loadingDataEnd');

    detailsLoading.value = false

	if (portfolioYears.value.length) {
		await chooseYear( portfolioYears.value.length - 1 )
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
	border-bottom: 1px solid $border;
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
