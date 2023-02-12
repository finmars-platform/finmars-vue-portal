<template>
	<FmExpansionPanel :title="detailPortfolio">

		<template #rightActions>
			<FmBtn
				v-if="!showBundleActions"
				class="primaryIcon"
				type="iconBtn"
				icon="lock"
				@click.stop="showBundleActions = true"
			/>

			<div v-if="showBundleActions">

					<FmBtn
						:disabled="!activePeriod && activePeriod !== 0"
						class="primaryIcon"
						type="iconBtn"
						icon="delete"
						@click.stop="showBundleDeletionWarning = true"
					/>

				<!--						<FmBtn
											type="iconBtn"
											icon="edit"
											@click=""
										/>-->

			</div>
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
</template>

<script setup>

	let portfolioItems = ref([])
	let portfolioItemsCumm = ref([])
	let portfolioYears = ref([])
	let portfolioTotals = ref([])
	let activeYear = ref(0)

	let detailPortfolio = ref('')
	let detailYear = ref('')

	let showBundleActions = ref(false);
		let showBundleDeletionWarning = ref(false);

	let portfolioHeaders = ref(
		['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
	)
	async function chooseMonth(id) {
		activeYear.value = id
		detailYear.value = portfolioYears.value[id]
		updateChart( portfolioItems.value[id], portfolioItemsCumm.value[id] )
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
			begin = dayjs(viewerData.reportOptions?.end_date).add(-1, 'd').format('YYYY-MM-DD')
		}
		const endDate = await getEndDate();

		let end = dayjs(endDate).add(-1, 'd').format('YYYY-MM-DD')

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

		let dateTo = dayjs(viewerData.reportOptions?.end_date)
		let dateFrom = dayjs(firstTransaction.transaction_date)

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
