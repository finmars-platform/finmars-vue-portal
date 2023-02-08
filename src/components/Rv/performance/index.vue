<template>
	<div>
		<PagesReportsPerformanceDialogSettings
			v-model="showSettingsDialog"
			v-model:externalReadyStatus="dsReadyStatus"
			:bundles="bundles"
			@save="showSettingsDialog = false, [viewerData.reportOptions, viewerData.reportLayoutOptions, viewerData.components] = $event"
			@cancel="showSettingsDialog = false"
		/>

		<ModalPortfolioRegister
			title="Add portfolio register"
			v-model="addRegisterIsOpen"
			@save="onPrtfRegisterCreate"
			@cancel="addRegisterIsOpen = false"
		/>

		<EvBaseTopPanel
			height="50"
			:loadingLayout="!readyStatusData.layout"
			@saveListLayout="saveLayout()"
			@openSettings="showSettingsDialog = true;"
		>
			<template #rightActions>
				<div class="flex-row fc-end">

					<div style="flex-basis: 175px;">
						<FmUnifiedDataSelect
							v-model="viewerData.reportOptions.report_currency"
							v-model:itemObject="viewerData.reportOptions.report_currency_object"
							noBorders
							content_type="currencies.currency"
						/>
					</div>

					<div style="flex-basis: 120px;">

						<FmInputDateComplex
							v-if="readyStatusData.layout"
							v-model:firstDate="viewerData.reportOptions.end_date"
							v-model:firstDatepickerOptions="viewerData.reportLayoutOptions.datepickerOptions.reportLastDatepicker"
							noBorders
						/>

						<FmLoader v-if="!readyStatusData.layout" />

					</div>

				</div>

			</template>
		</EvBaseTopPanel>

		<FmHorizontalPanel height="initial" class="ev_toolbar">

			<template #leftActions>
				<FmMenu>
					<template #btn>
						<FmIcon class="add_ev_btn" btnPrimary icon="add" />
					</template>

					<template #default="{ close }">
						<div class="fm_list" @click="close()">
							<div class="fm_list_item" @click="addRegisterIsOpen = true">
								Add Portfolio register
							</div>
							<div class="fm_list_item">
								<div
									v-if="readyStatusData.portfolioRegisters"
									@click="isOpenAddBundle = true"
								>
									Add bundle
								</div>
								<FmLoader v-if="!readyStatusData.portfolioRegisters" />
							</div>
						</div>
					</template>
				</FmMenu>

<!--				<BaseModal
					v-model="isOpenAddBundle"
					title="Add Bundle"
					@update:modelValue="isOpenAddBundle = false"
				>

					<FmInputText
						title="Name"
						v-model="newBundle.name"
					/>

					<BaseMultiSelectTwoAreas
						class="p-b-16"
						v-model="newBundle.registers"
						:items="registersItems"
						item_id="id"
						item_title="user_code"
						@update:modelValue="newValue => newBundle.registers = newValue"
					/>

					<template #controls>
						<div class="flex sb">
							<FmBtn type="basic" @click="resetNewBundle(); isOpenAddBundle = false">cancel</FmBtn>
							<FmBtn @click="createBundle(), isOpenAddBundle = false">create</FmBtn>
						</div>
					</template>
				</BaseModal> -->
				<ModalPortfolioBundleAddEdit v-model="isOpenAddBundle"
																		 :registers="registersItems"
																		 @save="createBundle" />
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

				<template #rightActions>
					<FmBtn
						v-if="!showBundleActions"
						class="primaryIcon"
						type="iconBtn"
						icon="lock"
						@click.stop="showBundleActions = true"
					/>

					<div v-if="showBundleActions" class="flex-row">

						<FmBtn
							:disabled="!activePeriod && activePeriod !== 0"
							class="primaryIcon m-r-8"
							type="iconBtn"
							icon="edit"
							@click.stop="editBundleIsOpened = true"
						/>

						<FmBtn
							:disabled="!activePeriod && activePeriod !== 0"
							class="primaryIcon"
							type="iconBtn"
							icon="delete"
							@click.stop="showBundleDeletionWarning = true"
						/>

					</div>

					<ModalPortfolioBundleAddEdit v-model="editBundleIsOpened"
																			 actionType="edit"
																			 :name="activePeriodData.user_code"
																			 :bundleRegisters="activePeriodData.registers"
																			 :registers="registersItems"
																			 @save="updateBundle" />

				</template>

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

		<EvModalSaveLayoutAs
			v-model="openSaveAsModal"
			@layoutSaved="layoutsStore.getListLayoutsLight(viewerData.content_type)"
		/>

		<ModalInfo title="Warning"
							 :description="`Are you sure you want to delete period: ${activePeriodData.user_code}?`"
							 v-model="showBundleDeletionWarning">

			<template #controls="{ cancel }">
				<div class="flex-row fc-space-between">
					<FmBtn type="basic" @click="cancel">CANCEL</FmBtn>

					<FmBtn type="basic" @click="deleteBundle(), cancel()">YES</FmBtn>
				</div>
			</template>

		</ModalInfo>
	</div>
</template>

<script setup>
import moment from 'moment'
import dayjs from 'dayjs'
import quarterOfYear from 'dayjs/plugin/quarterOfYear'
import Chart from 'chart.js/auto';
import getPerformanceViewerData from "./viewerData";
import {useCalculateReportDatesExprs} from "../../../composables/useReportHelper";
dayjs.extend(quarterOfYear)
const store = useStore();
const layoutsStore = useLayoutsStore();
const route = useRoute();

const viewerData = getPerformanceViewerData();
provide('viewerData', viewerData);

let openSaveAsModal = ref(false);
let showSettingsDialog = ref(false);

let isOpenAddBundle = ref(false)
let newBundle = ref({
	name: '',
	short_name: computed(() => newBundle.value.name),
	user_code: computed(() => newBundle.value.name),
	public_name: computed(() => newBundle.value.name),
	registers: [],
})

let editBundleIsOpened = ref(false);

let showBundleActions = ref(false);
let showBundleDeletionWarning = ref(false);

let addRegisterIsOpen = ref(false);

let registersItems = ref([]);

function addPrtfRegisterItem(newRegister) {
	registersItems.value.push({
		user_code: newRegister.user_code,
		id: newRegister.id,
	})
}



async function fetchPrtfRegistersList() {

	readyStatusData.portfolioRegisters = false;

	const res = await useApi('portfolioRegisterEvFiltered.post', {
		body: '{"groups_types":[],"page":1,"groups_values":[],"groups_order":"asc","page_size":60,"ev_options":{"entity_filters":["enabled","disabled","active","inactive"]},"filter_settings":[],"global_table_search":"","is_enabled":"any"}'
	});

	if (!res.error) {

		res.results.forEach(addPrtfRegisterItem);

		readyStatusData.portfolioRegisters = true;

	}

}

function onPrtfRegisterCreate(newRegister) {

	addPrtfRegisterItem(newRegister);
	addRegisterIsOpen.value = false;

	refresh();

}

let currencyListLight = ref([]);

async function fetchCurrenciesLightList() {
	const res = await useApi('currencyListLight.get');

	if (!res.error) {
		currencyListLight.value = res.results;
	}
}

let pricingPolicyListLight = ref([]);

async function fetchPricingPoliciesOpts() {
	const res = await useApi('currencyListLight.get');

	if (!res.error) {
		pricingPolicyListLight.value = res.results;
	}
}

/*function resetNewBundle () {

	newBundle.value = {
		name: '',
		short_name: computed(() => newBundle.value.name),
		user_code: computed(() => newBundle.value.name),
		public_name: computed(() => newBundle.value.name),
		registers: [],
	};

}*/

/* async function createBundle() {
	let res = await useApi('portfolioBundles.post', {body: newBundle.value})

	if ( res ) {
		resetNewBundle();

		refresh()

		useNotify({
			type: 'success',
			title: 'Bundle created successfully'
		})
	}
} */
async function createBundle(bundleData) {

	const newBundleData = {
		name: bundleData.name,
		short_name: bundleData.name,
		user_code: bundleData.name,
		public_name: bundleData.name,
		registers: bundleData.registers,
	};

	let res = await useApi('portfolioBundles.post', {body: newBundleData})

	if ( res ) {

		refresh()

		useNotify({
			type: 'success',
			title: 'Bundle created successfully'
		})

	}
}

async function updateBundle(bundleData) {

	let updatedData = JSON.parse(JSON.stringify( activePeriodData.value ));
	updatedData = {...updatedData, ...bundleData};
	updatedData.short_name = bundleData.name;
	updatedData.user_code = bundleData.name;
	updatedData.public_name = bundleData.name;

	const opts = {
		params: {
			id: updatedData.id,
		},
		body: updatedData,
	};

	let res = await useApi('portfolioBundles.put', opts);

	if (!res.error) {

		useNotify({
			type: 'success',
			title: 'Bundle updated successfully'
		});

		refresh();

	}

}

//#region Main
let panels = ref(['period', 'detail', 'diagram'])
let bundles = ref([])

let preriodHeaders = computed(() => {
	return ['', 'Daily', 'MTD', 'QTD', 'YTD', dayjs(viewerData.reportOptions?.end_date).year() - 1, dayjs(viewerData.reportOptions?.end_date).year() - 2, 'Incept']
})
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
/** Index of selected bundle **/
let activePeriod = ref(0)
/** Object of selected bundle **/
let activePeriodData = computed(() => {

	if (!activePeriod.value && activePeriod.value !== 0) {
		return null;
	}

	return bundles.value[activePeriod.value] || null;

})

/*let activePeriodName = computed(() => {

	if (!activePeriod.value && activePeriod.value !== 0) {
		return '';
	}

	const activePeriodData = bundles.value[activePeriod.value];

	return activePeriodData ? activePeriodData.name : '';

})*/

let activeYear = ref(0)

let readyStatusData = reactive({
	layout: false,
	bundles: false,
	portfolioRegisters: false,
});

let readyStatus = computed(() => {

	let ready = true;

	Object.keys(readyStatusData).forEach(rStatus => {
		ready = ready && readyStatusData[rStatus];
	});

	return ready;

});

let dsReadyStatus = computed(() => readyStatusData.layout && readyStatusData.bundles);

/*#endregion */

watch(
	() => route.query.layout,
	async () => {
		await fetchListLayout();
		refresh();
	}
)

watch(
	() => viewerData.layoutToOpen,
	async () => {

		if (viewerData.layoutToOpen) {

			await fetchListLayout();
			viewerData.layoutToOpen = null;

			refresh();

		}

	},
)

async function saveLayout () {

	if (viewerData.newLayout) {

		/*const layoutToSave = viewerData.getLayoutCurrentConfiguration();
		layoutToSave.name = "default";
		layoutToSave.user_code = "default";
		layoutToSave.is_default = true;

		let res = await useApi('listLayout.post', {body: layoutToSave});

		if (!res.error) {
			viewerData.newLayout = false;
			viewerData.listLayout = res;
			useNotify({type: 'success', title: 'Success. Page was saved.'})
		}*/
		openSaveAsModal.value = true;


	} else {
		useSaveEvRvLayout(store, viewerData);
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

async function fetchListLayout () {

	/*const resData = await useApi('defaultListLayout.get', {params: {contentType: viewerData.contentType}});

	if (resData.error) {
		throw new Error('Failed to fetch default performance layout');
	}

	const defaultListLayout = (resData.results.length) ? resData.results[0] : null;

	if (defaultListLayout.data.reportOptions.pricing_policy) {

		defaultListLayout.data.reportOptions.pricing_policy_object = pricingPolicyListLight.value.find(item => {
			return item.id === defaultListLayout.data.reportOptions.pricing_policy;
		});

	}

	if (defaultListLayout.data.reportOptions.report_currency) {

		defaultListLayout.data.reportOptions.report_currency_object = currencyListLight.value.find(item => {
			return item.id === defaultListLayout.data.reportOptions.report_currency;
		});

	}*/
	readyStatusData.layout = false;

	const layoutRes = await useFetchEvRvLayout(layoutsStore, viewerData, route.query.layout);

	viewerData.setLayoutCurrentConfiguration(layoutRes, store.ecosystemDefaults);

	const reportOptionsRes = await useCalculateReportDatesExprs(viewerData.content_type, viewerData.reportOptions, viewerData.reportLayoutOptions);

	if (reportOptionsRes.error) throw reportOptionsRes.error;

	viewerData.reportOptions = reportOptionsRes;

	readyStatusData.layout = true;

}

async function init() {

	fetchPrtfRegistersList();
	await Promise.all([fetchCurrenciesLightList(), fetchPricingPoliciesOpts()]);

	await fetchListLayout();
	await refresh()


	chart = new Chart('myChart', {
		type: 'bar',
		data: {
			labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
			datasets: [
				{
					label: 'Monthly Returns',
					data: portfolioItems.value[0],
					backgroundColor: portfolioItems.value[0]?.map(item => item > 0 ? '#a5d9c9' : '#fac878'),
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
	await fetchPortfolioBundles()

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

provide('refreshReport', refresh);

async function fetchPortfolioBundles() {

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
			let value = Math.round(day * 100 * 100) / 100
			row.daily = value ? `${value}%` : ''
		})

		row.month = null
		getMonth( bundle.id ).then(month => {
			let value = Math.round(month * 100 * 100) / 100
			row.month = value ? `${value}%` : ''
		})

		row.q = null
		getQ( bundle.id ).then(q => {
			let value = Math.round(q * 100 * 100) / 100
			row.q = value ? `${value}%` : ''
		})

		row.year = null
		getYear( bundle.id ).then(year => {
			let value = Math.round(year * 100 * 100) / 100
			row.year = value ? `${value}%` : ''
		})

		row.last = null
		getLastYear( bundle.id ).then(last => {
			let value = Math.round(last * 100 * 100) / 100
			row.last = value ? `${value}%` : ''
		})

		row.beforeLast = null
		getYearBeforeLast( bundle.id ).then(beforeLast => {
			let value = Math.round(beforeLast * 100 * 100) / 100
			row.beforeLast = value ? `${value}%` : ''
		})

		row.incept = null
		getIncept( bundle.id ).then(incept => {
			let value = Math.round(incept * 100 * 100) / 100
			row.incept = value ? `${value}%` : ''
		})
	})
}

async function deleteBundle() {

	const bundleToDelete = bundles.value[activePeriod.value];

	const res = await useApi( 'portfolioBundles.delete', {params: {id: bundleToDelete.id}} );

	if (!res.error) {

		useNotify({type: 'success', title: `Bundle ${bundleToDelete.name} was successfully deleted.`})

		refresh()

	}

}

let detailsLoading = false
async function getEndDate() {

	if (viewerData.reportOptions?.end_date) {
		return viewerData.reportOptions?.end_date;
	}

	const roCopy = viewerData.reportOptions ? JSON.parse(JSON.stringify(viewerData.reportOptions)) : viewerData.reportOptions;
	console.error("No end_date set for performance report ", roCopy);

	// if there is expression for end_date, calculate it
	if (
		viewerData.reportLayoutOptions?.datepickerOptions?.reportLastDatepicker.datepickerMode !== 'datepicker' &&
		viewerData.reportLayoutOptions.datepickerOptions.reportLastDatepicker.expression
	) {

		const opts = {
			body: {
				is_eval: true,
				expression: viewerData.reportLayoutOptions.datepickerOptions.reportLastDatepicker.expression,
			}
		}

		const res = await useApi('expression.post', opts);

		viewerData.reportOptions.end_date = res.result;

		return viewerData.reportOptions.end_date;

	}

	const opts = {
		body: {
			is_eval: true,
			expression: 'last_business_day(now())',
		}
	}

	const res = await useApi('expression.post', opts);

	if (res.error) throw new Error(res.error);

	viewerData.reportOptions.end_date = res.result;

	return viewerData.reportOptions.end_date;

}

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

	let begin
	let firstTransaction
	if ( !viewerData.reportOptions?.begin_date ) {
		firstTransaction = await useApi('performanceFirstTransaction.get', {
			params: { id: bundleId }
		})
		begin = firstTransaction.transaction_date
	} else {
		begin = moment(viewerData.reportOptions?.end_date).add(-1, 'd').format('YYYY-MM-DD')
	}
	const endDate = await getEndDate();

	let end = moment(endDate).add(-1, 'd').format('YYYY-MM-DD')

	let allMonths = await useApi('performanceReport.post', {
		body: {
			"save_report": false,
			"begin_date": begin,
			"end_date": end,
			"calculation_type": viewerData.reportOptions?.calculation_type,
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

		let end = year == dayjs(dateTo).year() ? dateTo.add(-1, 'd').format('YYYY-MM-DD') : `${year}-12-30`

		let total = await getReports({start: `${year - 1}-12-31`, end: end, ids: bundleId})
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
	const endDate = await getEndDate();

	let day = moment(endDate).add(-1, 'd').format('YYYY-MM-DD')

	return await getReports({start: day, end: day, ids, type: 'days'})
}

async function getMonth( ids ) {

	const endDate = await getEndDate();

	let start = dayjs(endDate).set('date', 1).add(-1, 'd').format('YYYY-MM-DD')
	let end = dayjs(endDate).add(-1, 'd').format('YYYY-MM-DD')

	return await getReports({start, end, ids})

}

async function getQ( ids ) {
	// let endDate = dayjs(viewerData.reportOptions?.end_date)
	let endDate = await getEndDate();
	endDate = dayjs(endDate);

	let start = dayjs('2022-01-01')
		.year(endDate.year())
		.quarter( endDate.quarter() )
		.add(-1, 'd')
		.format('YYYY-MM-DD')

	let end = dayjs(endDate).add(-1, 'd').format('YYYY-MM-DD')

	return await getReports({start, end, ids})
}

async function getYear( ids ) {

	const endDate = await getEndDate();

	let start = `${dayjs(endDate).year() - 1}-12-31`
	let end = dayjs(endDate).add(-1, 'd').format('YYYY-MM-DD')

	return await getReports({start, end, ids})
}

async function getLastYear( ids ) {
	const endDate = await getEndDate();

	let start = `${dayjs(endDate).year() - 2}-12-31`
	let end = `${dayjs(endDate).year() - 1}-12-30`

	return await getReports({start, end, ids})
}

async function getYearBeforeLast( ids ) {

	const endDate = await getEndDate();

	let start = `${dayjs(endDate).year() - 3}-12-31`

	let end = `${dayjs(endDate).year() - 2}-12-30`

	return await getReports({start, end, ids})
}

async function getIncept( ids ) {
	let res = await useApi('performanceFirstTransaction.get', {
		params: { id: ids }
	})

	let start = res.transaction_date

	const endDate = await getEndDate();

	let end = moment(endDate).add(-1, 'd').format('YYYY-MM-DD')

	return await getReports({start, end, ids})
}

async function getReports({start, end, ids, type = 'months'}) {
	let res = await useApi('performanceReport.post', {
		body: {
			"save_report": false,
			"begin_date": start,
			"end_date": end,
			"calculation_type": viewerData.reportOptions?.calculation_type,
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
