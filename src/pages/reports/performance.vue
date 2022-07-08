<template>
	<v-container fluid>
		<v-expansion-panels v-model="panels" multiple>
      <v-expansion-panel value="period">
        <v-expansion-panel-title>
					Period Returns
        </v-expansion-panel-title>
        <v-expansion-panel-text class="pa-0">
          <BaseTable
						:headers="preriodHeaders"
						:items="preriodItems"
						colls="repeat(8, 1fr)"
					/>
        </v-expansion-panel-text>
      </v-expansion-panel>
			<v-expansion-panel value="detail">
        <v-expansion-panel-title>
					{{ detailPortfolio }}
        </v-expansion-panel-title>
        <v-expansion-panel-text class="pa-0">
          <div class="flex">
						<div class="coll_years">
							<div class="coll_item t_header">Years</div>
							<div class="coll_item" v-for="(item, i) in portfolioYears" :key="i">{{item}}</div>
						</div>
						<div class="coll_months">
							<BaseTable
								:headers="portfolioHeaders"
								:items="portfolioItems"
								colls="repeat(12, 1fr)"
							/>
						</div>
						<div class="coll_total">
							<div class="coll_item t_header">TOTAL</div>
							<div class="coll_item">2022</div>
							<div class="coll_item">2021</div>
						</div>
					</div>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
	</v-container>
</template>

<script setup>
	import moment from 'moment'

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

	let panels = ref(['period', 'detail'])
	let porfolios = []
	let preriodHeaders = ref(
		['', 'Daily', 'MTD', 'QTD', 'YTD', +moment().year() - 1, +moment().year() - 2, 'Incept']
	)
	let preriodItems = ref([])

	let portfolioHeaders = ref(
		['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
	)
	let portfolioItems = reactive([])
	let portfolioYears = reactive([])
	let detailPortfolio = ref('')

	async function init() {
		let res = await useApi('portfolioRegister.post', {
			body: '{"groups_types":[],"page":1,"groups_values":[],"groups_order":"asc","page_size":60,"ev_options":{"entity_filters":["enabled","disabled","active","inactive"]},"filter_settings":[],"global_table_search":"","is_enabled":"any"}'
		})
		porfolios = res.results

		porfolios.forEach( async portfolio => {
			let row = {
				name: portfolio.user_code,
			}

			let day = await getDay( [portfolio.linked_instrument] )
			row.daily = Math.round(day * 100 * 100) / 100 + '%'

			let month = await getMonth( [portfolio.linked_instrument] )
			row.month = Math.round(month * 100 * 100) / 100 + '%'

			let q = await getQ( [portfolio.linked_instrument] )
			row.q = Math.round(q * 100 * 100) / 100 + '%'

			let year = await getYear( [portfolio.linked_instrument] )
			row.year = Math.round(year * 100 * 100) / 100 + '%'

			let last = await getLastYear( [portfolio.linked_instrument] )
			row.last = Math.round(last * 100 * 100) / 100 + '%'

			let beforeLast = await getYearBeforeLast( [portfolio.linked_instrument] )
			row.beforeLast = Math.round(beforeLast * 100 * 100) / 100 + '%'

			preriodItems.value.push(row)
		})

		detailPortfolio.value = porfolios[0].user_code

		let allMonths = await useApi('performanceReport.post', {
			body: {
				 "save_report": false,
				"begin_date": "2010-12-31",
				"end_date": null,
				"calculation_type": "time_weighted",
				"segmentation_type": 'months',
				"registers": [porfolios[0].linked_instrument]
			}
		})

		let yearsBuffer = {}

		allMonths.items.forEach(item => {
			let parseDate = item.date_to.split('-')
			let defaultMonth = {
				'01': 0 + '%',
				'02': 0 + '%',
				'03': 0 + '%',
				'04': 0 + '%',
				'05': 0 + '%',
				'06': 0 + '%',
				'07': 0 + '%',
				'08': 0 + '%',
				'09': 0 + '%',
				'10': 0 + '%',
				'11': 0 + '%',
				'12': 0 + '%'
			}

			if ( !yearsBuffer[parseDate[0]] ) yearsBuffer[ parseDate[0] ] = defaultMonth

			yearsBuffer[parseDate[0]][ parseDate[1] ] = Math.round(item.instrument_return * 100 * 100) / 100 + '%'
		})

		for ( let prop in yearsBuffer ) {
			portfolioYears.push( prop )
			portfolioItems.push( Object.values(yearsBuffer[prop]) )
		}

		portfolioYears.reverse()
		portfolioItems.reverse()
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

	if ( store.current.base_api_url ) {
		init()
	} else {
		watch( () => store.current, async () => {
			init()
		})
	}
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
</style>
