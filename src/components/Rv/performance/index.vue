<template>
	<div>
		<PagesReportsPerformanceDialogSettings
			v-model="showSettingsDialog"
			v-model:layoutReadyStatus="readyStatus"
			:bundles="bundles"
			@save="showSettingsDialog = false, [viewerData.reportOptions, viewerData.components] = $event, refresh()"
			@cancel="showSettingsDialog = false"
		/>

		<ModalPortfolioRegister v-model="addRegisterIsOpen"
														@save="addRegisterIsOpen = false"
														@cancel="addRegisterIsOpen = false"/>

		<EvBaseTopPanel
			height="50"
			@saveListLayout="saveLayout()"
			@openSettings="showSettingsDialog = true;"
		>
			<template #rightActions>
				<FmSelect no_borders
									class="m-b-0"
									v-model="viewerData.reportOptions.report_currency"
									:items="currencyOpts"
									prop_name="short_name"
				/>
			</template>
		</EvBaseTopPanel>

		<FmHorizontalPanel height="initial"
											 class="ev_toolbar">
			<template #leftActions>
				<FmMenu>
					<template #btn>
						<FmIcon class="add_ev_btn" btnPrimary icon="add" />
					</template>

					<div class="fm_list">
<!--						<div class="fm_list_item"
								 @click="addRegisterIsOpen = true">
							Add Portfolio register
						</div>-->
						<div class="fm_list_item" @click="isOpenAddBundle = true">
							Add bundle
						</div>
					</div>
				</FmMenu>

				<BaseModal
					title="Add Bundle"
					v-model="isOpenAddBundle"
					@update:modelValue="isOpenAddBundle = false">

					<!--					<FmInputEntityNames
											label="Bundle name"
											v-model:name="newBundle.name"
											v-model:short_name="newBundle.short_name"
											v-model:user_code="newBundle.user_code"
											v-model:public_name="newBundle.public_name"
										/>-->
					<FmInputText title="Name"
											 v-model="newBundle.name" />

<!--					<FmSelectWindow class="p-b-16" v-model="newBundle.registers" :items="registersItems" />-->
					<BaseMultiSelectTwoAreas class="p-b-16"
																	 v-model="newBundle.registers"
																	 :items="registersItems"
																	 item_id="id"
																	 item_title="user_code"
																	 @update:modelValue="newValue => newBundle.registers = newValue" />

					<template #controls>
						<div class="flex sb">
							<FmBtn type="basic" @click="resetNewBundle(); isOpenAddBundle = false">cancel</FmBtn>
							<FmBtn @click="createBundle(), isOpenAddBundle = false">create</FmBtn>
						</div>
					</template>
				</BaseModal>
			</template>

			<template #rightActions>
				<FmIcon icon="refresh" @click="refresh()" btn />
			</template>
		</FmHorizontalPanel>

		<div class="fm_container">
			<FmExpansionPanel title="Period Returns">
				<BaseTable
					:headers="preriodHeaders"
					:items="preriodItems"
					:active="activePeriod"
					colls="repeat(8, 1fr)"
					:cb="choosePortfolio"
				/>
			</FmExpansionPanel>

			<FmExpansionPanel :title="detailPortfolio">
				<div class="table_wrap flex">
					<div class="coll_years">
						<div class="coll_item t_header">Years</div>
						<div class="coll_item" v-for="(item, i) in portfolioYears" :key="i">{{item}}</div>
					</div>
					<div class="coll_months">
						<BaseTable
							:headers="portfolioHeaders"
							:items="portfolioItems"
							colls="repeat(12, 1fr)"
							:cb="chooseMonth"
							:active="activeYear"
						/>
					</div>
					<div class="coll_total">
						<div class="coll_item t_header">TOTAL</div>
						<div class="coll_item" v-for="(item, i) in portfolioTotals" :key="i">
							{{ Math.round(item * 100) / 100 }}%
						</div>
					</div>
				</div>
			</FmExpansionPanel>

			<FmExpansionPanel :title="detailPortfolio + ' - ' + detailYear">
				<div style="height: 350px;">
					<canvas id="myChart"><p>Chart</p></canvas>
				</div>
			</FmExpansionPanel>
		</div>
	</div>
</template>

<script setup>
import moment from 'moment'
import Chart from 'chart.js/auto';
import getPerformanceViewerData from "./viewerData";

const store = useStore();

const viewerData = getPerformanceViewerData();
provide('viewerData', viewerData);

let showSettingsDialog = ref(false);

let isOpenAddBundle = ref(false)
let newBundle = ref({
	name: '',
	short_name: computed(() => newBundle.value.name),
	user_code: computed(() => newBundle.value.name),
	public_name: computed(() => newBundle.value.name),
	registers: [],
})

let addRegisterIsOpen = ref(false);

let registersItems = ref([])

useApi('portfolioRegister.post', {
	body: '{"groups_types":[],"page":1,"groups_values":[],"groups_order":"asc","page_size":60,"ev_options":{"entity_filters":["enabled","disabled","active","inactive"]},"filter_settings":[],"global_table_search":"","is_enabled":"any"}'
}).then((res) => {
	res.results.forEach((item) => {
		registersItems.value.push({
			user_code: item.user_code,
			id: item.id,
		})
	})
})

let currencyOpts = ref([])
fetchCurrenciesOpts()
async function fetchCurrenciesOpts() {
	const ppData = await useApi("currenciesLight.get");

	if (!ppData.error) {
		currencyOpts.value = ppData.results;
	}
}

function resetNewBundle () {

	newBundle.value = {
		name: '',
		short_name: computed(() => newBundle.value.name),
		user_code: computed(() => newBundle.value.name),
		public_name: computed(() => newBundle.value.name),
		registers: [],
	};

}

async function createBundle() {
	let res = await useApi('portfolioBundles.post', {body: newBundle.value})

	if ( res ) {
		resetNewBundle();

		refresh()

		useNotify({
			type: 'success',
			title: 'Bundle created successfully'
		})
	}
}

//#region Main
let panels = ref(['period', 'detail', 'diagram'])
let bundles = ref([])
let preriodHeaders = ref(
	['', 'Daily', 'MTD', 'QTD', 'YTD', +moment().year() - 1, +moment().year() - 2, 'Incept']
)
let preriodItems = ref([])

let portfolioHeaders = ref(
	['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
)
let portfolioItems = ref([])
let portfolioItemsCumm = ref([])
let portfolioYears = ref([])
let portfolioTotals = ref([])

let detailPortfolio = ref('')
let detailYear = ref('')
let chart

let activePeriod = ref(0)
let activeYear = ref(0)

let readyStatusData = reactive({
	layout: false,
	bundles: false,
});

let readyStatus = computed(() => {

	let ready = true;

	Object.keys(readyStatusData).forEach(rStatus => {
		ready = ready && readyStatusData[rStatus];
	});

	return ready;

})

/*#endregion */

async function saveLayout () {

	if (viewerData.newLayout) {

		const layoutToSave = viewerData.getLayoutCurrentConfiguration();
		layoutToSave.name = "default";
		layoutToSave.user_code = "default";
		layoutToSave.is_default = true;

		let res = await useApi('listLayout.post', {body: layoutToSave});

		if (!res.error) {
			viewerData.newLayout = false;
			viewerData.listLayout = res;
			useNotify({type: 'success', title: 'Success. Page was saved.'})
		}

	} else {
		useSaveLayoutList(store, viewerData);
	}

}

async function choosePortfolio(id) {
	activePeriod.value = id
	detailPortfolio.value = preriodItems.value[id].name

	let success = await getMonthDetails( preriodItems.value[id].name )
	if  ( success === false ) return false
	detailYear.value = portfolioYears.value[0]

	updateChart( portfolioItems.value[0], portfolioItemsCumm.value[0] )
}

async function chooseMonth(id) {
	activeYear.value = id
	detailYear.value = portfolioYears.value[id]
	updateChart( portfolioItems.value[id], portfolioItemsCumm.value[id] )
}

async function fetchDefaultListLayout () {
	const resData = await useApi('defaultListLayout.get', {params: {contentType: viewerData.contentType}});

	if (resData.error) {
		throw new Error('Failed to fetch default performance layout');

	} else {

		const defaultListLayout = resData.results.length ? resData.results[0] : null;
		viewerData.setLayoutCurrentConfiguration(defaultListLayout).then(() => {
			readyStatusData.layout = true;
		});
	}
}

async function init() {
	await fetchDefaultListLayout();
	await refresh()


	chart = new Chart('myChart', {
		type: 'bar',
		data: {
			labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
			datasets: [
				{
					label: 'Monthly Returns',
					data: portfolioItems.value[0],
					backgroundColor: portfolioItems.value[0].map(item => item > 0 ? '#a5d9c9' : '#fac878'),
					order: 1
				},
				{
					label: 'Cummulative Return',
					data: portfolioItemsCumm.value[0],
					fill: '#f05a23',
					type: 'line',
					borderColor: '#f05a23',
					tension: 0.1,
					order: 0
				}
			],
		},
		options: {
			responsive: true,
			maintainAspectRatio: false,
			plugins: {
				legend: {
					position: 'top',
					reverse: true
				}
			},
			scales: {
				y: {
					grace: '5%',
					ticks: {
						// Include a dollar sign in the ticks
						callback: function(value, index, ticks) {
							return value + '%';
						}
					}
				}
			}
		},
	});
}

async function refresh() {
	await fetchPortolios()

	if ( !bundles.value.length ) {
		return false
	}
	activePeriod.value = 0
	activeYear.value = 0

	detailPortfolio.value = bundles.value[0].user_code

	await getMonthDetails()

	detailYear.value = portfolioYears.value[0]

	if ( chart )
		updateChart( portfolioItems.value[0], portfolioItemsCumm.value[0] )
}

async function fetchPortolios() {

	readyStatusData.bundles = false;

	let res = await useApi('portfolioBundles.get');

	bundles.value = res.results;
	readyStatusData.bundles = true;

	preriodItems.value = []

	bundles.value.forEach( bundle => {
		preriodItems.value.push({
			name: bundle.user_code,
		})

		let row = preriodItems.value[ preriodItems.value.length - 1 ]

		row.daily = null
		getDay( bundle.id ).then(day => {
			row.daily = Math.round(day * 100 * 100) / 100 + '%'
		})

		row.month = null
		getMonth( bundle.id ).then(month => {
			row.month = Math.round(month * 100 * 100) / 100 + '%'
		})

		row.q = null
		getQ( bundle.id ).then(q => {
			row.q = Math.round(q * 100 * 100) / 100 + '%'
		})

		row.year = null
		getYear( bundle.id ).then(year => {
			row.year = Math.round(year * 100 * 100) / 100 + '%'
		})

		row.last = null
		getLastYear( bundle.id ).then(last => {
			row.last = Math.round(last * 100 * 100) / 100 + '%'
		})

		row.beforeLast = null
		getYearBeforeLast( bundle.id ).then(beforeLast => {
			row.beforeLast = Math.round(beforeLast * 100 * 100) / 100 + '%'
		})

		row.incept = null
		getIncept( bundle.id ).then(incept => {
			row.incept = Math.round(incept * 100 * 100) / 100 + '%'
		})
	})
}

let detailsLoading = false

async function getMonthDetails( name ) {
	if ( detailsLoading ) return false

	detailsLoading = true
	portfolioYears.value = []
	portfolioTotals.value = []
	portfolioItems.value = []
	portfolioItemsCumm.value = []

	let bundleId = name
		? bundles.value.find(item => item.user_code == name).id
		: bundles.value[0].id

	let firstTransaction = await useApi('performanceFirstTransaction.get', {
		params: { id: bundleId }
	})
	let end = moment(viewerData.reportOptions?.end_date).add(-1, 'd').format('YYYY-MM-DD')

	let allMonths = await useApi('performanceReport.post', {
		body: {
			"save_report": false,
			"begin_date": firstTransaction.transaction_date,
			"end_date": end,
			"calculation_type": "time_weighted",
			"segmentation_type": 'months',
			'report_currency': viewerData.reportOptions?.report_currency,
			"bundle": bundleId
		}
	})
	if ( allMonths.error ) {
		detailsLoading = false
		return false
	}

	let yearsBuffer = new Map()
	let yearsBufferCumm = []

	allMonths.items.reverse().forEach(item => {
		let parseDate = item.date_to.split('-')

		// key_ fix order
		let defaultMonth = {
			'key_01': [0, 0],
			'key_02': [0, 0],
			'key_03': [0, 0],
			'key_04': [0, 0],
			'key_05': [0, 0],
			'key_06': [0, 0],
			'key_07': [0, 0],
			'key_08': [0, 0],
			'key_09': [0, 0],
			'key_10': [0, 0],
			'key_11': [0, 0],
			'key_12': [0, 0]
		}

		if ( !yearsBuffer.has(parseDate[0]) ) {
			yearsBuffer.set(parseDate[0], defaultMonth)
		}

		yearsBuffer.get(parseDate[0])[ 'key_' + parseDate[1] ] = [
			Math.round(item.instrument_return * 10000) / 100,
			Math.round(item.cumulative_return * 10000) / 100
		]
	})

	let dateTo = moment(viewerData.reportOptions?.end_date)
	let dateFrom = moment(firstTransaction.transaction_date)

	for ( let [year, months] of yearsBuffer ) {
		portfolioYears.value.push( year )
		portfolioItems.value.push( Object.values(months).map((item, i) => {
			if (
				(year != dateTo.year() || i <= dateTo.month())
				&&
				(year != dateFrom.year() || i >= dateFrom.month() )
			) return item[0]
			else return ''
		}))
		portfolioItemsCumm.value.push( Object.values(months).map((item, i) => {
			if (
				(year != dateTo.year() || i <= dateTo.month())
			) return item[1]
		}))

		let total = await getReports({start: `${year - 1}-12-31`, end: `${year}-12-31`, ids: bundleId})
		portfolioTotals.value.push( total * 100 )
	}
	detailsLoading = false
}

function updateChart( datasetMonth, datasetLine ) {
	chart.data.datasets[0].data = datasetMonth
	chart.data.datasets[0].backgroundColor =
		datasetMonth.map(item => item > 0 ? '#a5d9c9' : '#fac878')

	chart.data.datasets[1].data = datasetLine

	chart.update()
}

async function getDay( ids ) {
	let day = moment(viewerData.reportOptions?.end_date).add(-1, 'd').format('YYYY-MM-DD')

	return await getReports({start: day, end: day, ids, type: 'days'})
}

async function getMonth( ids ) {
	let end = moment(viewerData.reportOptions?.end_date).add(-1, 'd').format('YYYY-MM-DD')
	let start = moment().set('date', 1).add(-1, 'd').format('YYYY-MM-DD')

	return await getReports({start, end, ids})
}

async function getQ( ids ) {
	let start = moment()
		.quarter(moment().quarter())
		.set('date', 1)
		.add(-1, 'd')
		.format('YYYY-MM-DD')
	let end = moment(viewerData.reportOptions?.end_date).add(-1, 'd').format('YYYY-MM-DD')

	return await getReports({start, end, ids})
}

async function getYear( ids ) {
	let start = moment()
		.set({date: 1, month: 1})
		.add(-1, 'd')
		.format('YYYY-MM-DD')

	let end = moment(viewerData.reportOptions?.end_date).add(-1, 'd').format('YYYY-MM-DD')

	return await getReports({start, end, ids})
}

async function getLastYear( ids ) {
	let start = `${moment().year() - 2}-12-31`
	let end = `${moment(viewerData.reportOptions?.end_date).year() - 1}-12-30`

	return await getReports({start, end, ids})
}

async function getYearBeforeLast( ids ) {
	let start = `${moment().year() - 3}-12-31`
	let end = `${moment(viewerData.reportOptions?.end_date).year() - 2}-12-30`

	return await getReports({start, end, ids})
}

async function getIncept( ids ) {
	let res = await useApi('performanceFirstTransaction.get', {
		params: { id: ids }
	})

	let start = res.transaction_date

	let end = moment(viewerData.reportOptions?.end_date).add(-1, 'd').format('YYYY-MM-DD')

	return await getReports({start, end, ids})
}

async function getReports({start, end, ids, type = 'months'}) {
	let res = await useApi('performanceReport.post', {
		body: {
			"save_report": false,
			"begin_date": start,
			"end_date": end,
			"calculation_type": "time_weighted",
			"segmentation_type": type,
			'report_currency': viewerData.reportOptions?.report_currency,
			"bundle": ids
		}
	})

	return res.grand_return
}

init()
</script>

<style lang="scss" scoped>

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

</style>
