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
        </div>

        <ModalPerformanceDetail
                :title="performanceDetailsColumnName === 'name' ? 'Bundle Portfolios' : 'Performance Details'"
                v-model="performanceDetailIsOpen"
                :performanceDetails="performanceDetails"
                :performanceDetailsColumnName="performanceDetailsColumnName"
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
	isDisabled: Boolean,
})
const emits = defineEmits(['setBundle', 'refreshFunc'])

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

watch(
    () => [
        props.reportOptions,
        props.end_date,
        props.calculation_type,
        props.report_currency,
    ],
    () => { init() }
)

emits('refreshFunc', init)
init()

function init() {

    activePeriod.value = null;
    emits('setBundle', null);

    // проверка на корректность всех свойств, если что выдать ошибку
    if (!props.end_date) {
        console.log('No end_date:', props.end_date)
        return false
    }

    fetchPortfolioBundles()
}

//# region Calculate period
function formatNumber(num) {
    return Intl.NumberFormat('en-EN', {
        // maximumSignificantDigits: 3
    }).format(num)
}

function getValueForPeriod(performanceResult) {

    if (props.reportOptions.performance_unit === 'percent') {

        let value = Math.round(performanceResult.grand_return * 100 * 100) / 100

        return value ? `${value}%` : ''
    } else {
        return performanceResult.grand_absolute_pl ? `${formatNumber(performanceResult.grand_absolute_pl)}` : ''
    }

}
async function calcDayForBundle(bundleId, row, rowRaw) {

    row.daily = null

    let res = await getDay(bundleId);

    if (res.error) {
        row.daily = '-';
        throw res.error;
    }

    rowRaw.daily_performance_report = res;

    row.daily = getValueForPeriod(res);

}

async function calcMonthForBundle(bundleId, row, rowRaw) {

    row.month = null
    const res = await getMonth(bundleId);

    if (res.error) {
        row.month = '-';
        throw res.error;
    }

    rowRaw.month_performance_report = res

    row.month = getValueForPeriod(res);

}

async function calcQuarterForBundle(bundleId, row, rowRaw) {

    row.q = null

    const res = await getQ(bundleId);

    if (res.error) {
        row.q = '-';
        throw res.error;
    }

    rowRaw.q_performance_report = res;

    row.q = getValueForPeriod(res);

}

async function calcYearForBundle(bundleId, row, rowRaw) {

    row.year = null

    const res = await getYear(bundleId);

    if (res.error) {
        row.year = '-';
        throw res.error;
    }

    rowRaw.year_performance_report = res;

    row.year = getValueForPeriod(res);

}

async function calcLastYearForBundle(bundleId, row, rowRaw) {

    row.last = null

    const res = await getLastYear(bundleId);

    if (res.error) {
        row.last = '-';
        throw res.error;
    }

    rowRaw.last_performance_report = res;

    row.last = getValueForPeriod(res);

}

async function calcBeforeLastYearForBundle(bundleId, row, rowRaw) {

    row.beforeLast = null

    const res = await getYearBeforeLast(bundleId);

    if (res.error) {
        row.beforeLast = '-';
        throw res.error;
    }

    rowRaw.beforeLast_performance_report = res;

    row.beforeLast = getValueForPeriod(res);

}

async function calcInceptYearForBundle(bundleId, row, rowRaw) {

    row.incept = null

    const res = await getIncept(bundleId);

    if (res.error) {
        row.incept = "-"
        throw res.error;
    }

    rowRaw.incept_performance_report = res;

    row.incept = getValueForPeriod(res);

}

async function calcAnnualForBundle(bundleId, row, rowRaw) {

	row.annualized = null

	const res = await getIncept(bundleId)

	if (res.error) {
        row.annualized = "-"
		throw res.error;
	}

	rowRaw.annualized_performance_report = res

	var start = dayjs(res.begin_date)
	var end = dayjs(res.end_date)
	var diffInYears = end.diff(start, 'year');

	if (diffInYears === 0 || diffInYears === null) {
		res.grand_return = null;
		res.grand_absolute_pl = null;
	}else{
		res.grand_return = (res.grand_return + 1) ** (1 / diffInYears) - 1;
	}

	var value = Math.round(res.grand_return * 100 * 100) / 100

	row.annualized = value ? `${value}%` : ''

}

async function fetchPortfolioBundles() {
    // readyStatusData.bundles = false;
    readyStatus.value = false;

    let res = await useLoadAllPages('portfolioBundleList.get', {
        filters: {page: 1, page_size: 1000}
    });

    if (res.error) {
        return;
    }

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
	activePeriod.value = null;
    periodItems.value = [];
    periodItemsRaw.value = [];

    let promises = [];

    bundles.value.forEach(bundle => {

        periodItems.value.push({
            name: bundle.user_code,
        })
        periodItemsRaw.value.push({
            name: bundle.user_code,
        })

        let row = periodItems.value[periodItems.value.length - 1]
        let rowRaw = periodItemsRaw.value[periodItems.value.length - 1]
        rowRaw.id = bundle.id

        promises.push(
            Promise.all([
                calcDayForBundle(bundle.id, row, rowRaw),
                calcMonthForBundle(bundle.id, row, rowRaw),
                calcQuarterForBundle(bundle.id, row, rowRaw),
                calcYearForBundle(bundle.id, row, rowRaw),
                calcLastYearForBundle(bundle.id, row, rowRaw),
                calcBeforeLastYearForBundle(bundle.id, row, rowRaw),
                calcInceptYearForBundle(bundle.id, row, rowRaw),
                calcAnnualForBundle(bundle.id, row, rowRaw),
            ])
        );

    })

    try {
        await Promise.all(promises);


    } catch(e) {
        console.error(e)
        throw "Error above occurred while trying to load and calculate data for RvPerformanceBundles";
    }

    readyStatus.value = true;
    // chooseBundle(0)

}
//# endregion Calculate period

async function chooseBundle(bundleIndex, cellIndex) {

    if (activePeriod.value === bundleIndex) {
        return;
    }

    activePeriod.value = bundleIndex
    emits('setBundle', JSON.parse(JSON.stringify( bundles.value[bundleIndex] )) );

}

function showPerformanceDetail(bundleIndex, cellIndex) {

	if (!cellIndex) {
		return;
	}

    if (cellIndex === 'name') {

		performanceDetailsColumnName.value = cellIndex
		performanceDetails.value = periodItemsRaw.value[bundleIndex]['id']

	} else {

		performanceDetailIsOpen.value = true;

		performanceDetailsColumnName.value = cellIndex
		performanceDetails.value = periodItemsRaw.value[bundleIndex][`${cellIndex}_performance_report`]

	}

	performanceDetailIsOpen.value = true;

}

async function getDay(ids) {
    let endDate = dayjs(props.end_date)

    let day = dayjs(endDate).format('YYYY-MM-DD')

    return await getReports({period_type: "daily", end: day, ids, type: 'days'})
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

async function getMonth(ids) {
    let endDate = dayjs(props.end_date)

    let start = dayjs(endDate).set('date', 1).format('YYYY-MM-DD')
    let end = dayjs(adjustForWeekend(new Date(endDate))).format('YYYY-MM-DD')

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
