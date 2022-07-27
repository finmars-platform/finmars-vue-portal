<template>
	<div class="fm_container">
		<FmExpansionPanel title="Period Returns">
			<BaseTable
				:headers="preriodHeaders"
				:items="preriodItems"
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
					/>
				</div>
				<div class="coll_total">
					<div class="coll_item t_header">TOTAL</div>
					<div class="coll_item" v-for="(item, i) in portfolioYears" :key="i">0.1</div>
				</div>
			</div>
		</FmExpansionPanel>

		<FmExpansionPanel :title="detailPortfolio + '-' + detailYear">
			<canvas id="myChart" width="800" height="300"><p>Chart</p></canvas>
		</FmExpansionPanel>
	</div>
</template>

<script setup>
	import moment from 'moment'
	import Chart from 'chart.js/auto';

	definePageMeta({
		bread: [
			{
				text: 'Performance Report',
				to: '/reports/performance',
				disabled: false
			}
		],
	});
	const store = useStore()

	let panels = ref(['period', 'detail', 'diagram'])
	let porfolios = []
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

	let detailPortfolio = ref('')
	let detailYear = ref('')
	let chart

	async function choosePortfolio(id) {
		detailPortfolio.value = preriodItems.value[id].name

		await getMonthDetails( preriodItems.value[id].name )
		detailYear.value = portfolioYears.value[0]

		updateChart( portfolioItems.value[0], portfolioItemsCumm.value[0] )
	}

	async function chooseMonth(id) {
		detailYear.value = portfolioYears.value[id]
		updateChart( portfolioItems.value[id], portfolioItemsCumm.value[id] )
	}

	async function init() {
		await fetchPortolios()

		if ( !porfolios.length ) {
			return false
		}
		detailPortfolio.value = porfolios[0].user_code

		await getMonthDetails()

		detailYear.value = portfolioYears.value[0]

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
				plugins: {
					legend: {
						position: 'top',
						reverse: true
					}
				},
				scales: {
					y: {
						grace: '5%'
					}
				}
			},
		});
	}

	async function fetchPortolios() {
		let res = await useApi('portfolioRegister.post', {
			body: '{"groups_types":[],"page":1,"groups_values":[],"groups_order":"asc","page_size":60,"ev_options":{"entity_filters":["enabled","disabled","active","inactive"]},"filter_settings":[],"global_table_search":"","is_enabled":"any"}'
		})
		porfolios = res.results

		porfolios.forEach( portfolio => {
			preriodItems.value.push({
				name: portfolio.user_code,
			})

			let row = preriodItems.value[ preriodItems.value.length - 1 ]

			row.daily = null
			getDay( [portfolio.linked_instrument] ).then(day => {
				row.daily = Math.round(day * 100 * 100) / 100 + '%'
			})

			row.month = null
			getMonth( [portfolio.linked_instrument] ).then(month => {
				row.month = Math.round(month * 100 * 100) / 100 + '%'
			})

			row.q = null
			getQ( [portfolio.linked_instrument] ).then(q => {
				row.q = Math.round(q * 100 * 100) / 100 + '%'
			})

			row.year = null
			getYear( [portfolio.linked_instrument] ).then(year => {
				row.year = Math.round(year * 100 * 100) / 100 + '%'
			})

			row.last = null
			getLastYear( [portfolio.linked_instrument] ).then(last => {
				row.last = Math.round(last * 100 * 100) / 100 + '%'
			})

			row.beforeLast = null
			getYearBeforeLast( [portfolio.linked_instrument] ).then(beforeLast => {
				row.beforeLast = Math.round(beforeLast * 100 * 100) / 100 + '%'
			})

			row.incept = 0.1
		})
	}

	async function getMonthDetails( name ) {
		portfolioYears.value = []
		portfolioItems.value = []
		portfolioItemsCumm.value = []

		let instr_id = name
			? porfolios.find(item => item.name == name).linked_instrument
			: porfolios[0].linked_instrument

		let allMonths = await useApi('performanceReport.post', {
			body: {
				"save_report": false,
				"begin_date": "2019-12-31",
				"end_date": null,
				"calculation_type": "time_weighted",
				"segmentation_type": 'months',
				"registers": [ instr_id ]
			}
		})

		let yearsBuffer = {}
		let yearsBufferCumm = []

		allMonths.items.forEach(item => {
			let parseDate = item.date_to.split('-')
			let defaultMonth = {
				'01': [0, 0],
				'02': [0, 0],
				'03': [0, 0],
				'04': [0, 0],
				'05': [0, 0],
				'06': [0, 0],
				'07': [0, 0],
				'08': [0, 0],
				'09': [0, 0],
				'10': [0, 0],
				'11': [0, 0],
				'12': [0, 0]
			}

			if ( !yearsBuffer[parseDate[0]] ) {
				yearsBuffer[ parseDate[0] ] = defaultMonth
			}

			yearsBuffer[parseDate[0]][ parseDate[1] ] = [
				Math.round(item.instrument_return * 10000) / 10000,
				Math.round(item.cumulative_return * 10000) / 10000
			]
		})

		for ( let prop in yearsBuffer ) {
			portfolioYears.value.push( prop )

			portfolioItems.value.push( Object.values(yearsBuffer[prop]).map(item => item[0]))
			portfolioItemsCumm.value.push( Object.values(yearsBuffer[prop]).map(item => item[1]) )
		}

		portfolioYears.value.reverse()
		portfolioItems.value.reverse()
		portfolioItemsCumm.value.reverse()
	}

	function updateChart( datasetMonth, datasetLine ) {
		chart.data.datasets[0].data = datasetMonth
		chart.data.datasets[0].backgroundColor =
			datasetMonth.map(item => item > 0 ? '#a5d9c9' : '#fac878')

		chart.data.datasets[1].data = datasetLine

		chart.update()
	}

	async function getDay( ids ) {
		let day = moment().add(-1, 'd').format('YYYY-MM-DD')

		return await getReports({start: day, end: day, ids, type: 'days'})
	}

	async function getMonth( ids ) {
		let end = moment().add(-1, 'd').format('YYYY-MM-DD')
		let start = moment().set('date', 1).add(-1, 'd').format('YYYY-MM-DD')

		return await getReports({start, end, ids})
	}

	async function getQ( ids ) {
		let start = moment()
			.quarter(moment().quarter())
			.set('date', 1)
			.add(-1, 'd')
			.format('YYYY-MM-DD')
		let end = moment().add(-1, 'd').format('YYYY-MM-DD')

		return await getReports({start, end, ids})
	}

	async function getYear( ids ) {
		let start = moment()
			.set({date: 1, month: 1})
			.add(-1, 'd')
			.format('YYYY-MM-DD')

		let end = moment().add(-1, 'd').format('YYYY-MM-DD')

		return await getReports({start, end, ids})
	}

	async function getLastYear( ids ) {
		let start = `${moment().year() - 2}-12-31`
		let end = `${moment().year() - 1}-12-30`

		return await getReports({start, end, ids})
	}

	async function getYearBeforeLast( ids ) {
		let start = `${moment().year() - 3}-12-31`
		let end = `${moment().year() - 2}-12-30`

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
				"registers": ids
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
