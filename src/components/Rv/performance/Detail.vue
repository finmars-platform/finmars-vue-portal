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

		<div class="table_wrap flex">
			<div class="coll_years">
				<div class="coll_item t_header">Years</div>
				<div class="coll_item" v-for="(item, i) in portfolioYears" :key="i">
					{{ item }}
				</div>
			</div>
			<div class="coll_months">
				<BaseTable
					:headers="portfolioHeaders"
					:items="portfolioItems"
					colls="repeat(12, 1fr)"
					:active="activeYear"
					:cb="chooseCell"
				/>
			</div>
			<div class="coll_total">
				<div class="coll_item t_header">TOTAL</div>
				<div class="coll_item" v-for="(item, i) in portfolioTotals" :key="i">

					<span v-if="reportOptions.performance_unit === 'percent'">
						{{ Math.round(item * 100) / 100 }}%
					</span>
					<span v-if="reportOptions.performance_unit === 'absolute'">
						{{item}}
					</span>
				</div>
			</div>
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
		bundleId: {
			type: [Number, Object],
		},
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
	const emits = defineEmits(['setYear', 'refresh'])

	function formatNumber(num) {
		return Intl.NumberFormat('en-EN', {
			// maximumSignificantDigits: 3
		}).format(num)
	}

	let currentBundle = computed(() => {

		if (!props.bundleId) return null;

		if (typeof props.bundleId == 'object') return props.bundleId

		return { id: props.bundleId, user_code: 'Need name id: ' + props.bundleId }
	})

	let bundleId = computed(() => {

		if (!props.bundleId) return null;

		if (typeof props.bundleId == 'object' && props.bundleId.id) {
			return props.bundleId.id
		}

		if (typeof props.bundleId == 'number') return props.bundleId

	})

	watch(props, async () => {
		if (!bundleId.value) return false

		await getMonthDetails()
	})

	let portfolioItems = ref([])
	let portfolioItemsRaw = ref([])
	let portfolioYears = ref([])
	let portfolioTotals = ref([])
	let activeYear = ref(0)
	let detailsLoading = false
	let performanceDetailIsOpen = ref(false)
	let performanceDetails = ref(null)

	let detailPortfolio = ref('')
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

	if (bundleId.value) getMonthDetails()

	async function chooseYear(id) {
		activeYear.value = id
		detailYear.value = portfolioYears.value[id]

		console.log('portfolioYears', portfolioYears.value);
		console.log('chooseYear', id);
		console.log('portfolioItems', portfolioItems.value);
		console.log('portfolioItemsRaw', portfolioItemsRaw.value);

		console.log('detailYear', detailYear.value);

		emits('setYear', {
			// datasetCumulative: portfolioItems.value[id],
			datasetCumulative: portfolioItemsRaw.value[id],
			detailYear: detailYear.value,
		})
	}

	async function chooseCell(rowIndex, cellIndex) {

		console.log('rowIndex', rowIndex)
		console.log('cellIndex', cellIndex)

		console.log('portfolioPerformanceReports', portfolioPerformanceReports);

		try {
			performanceDetailIsOpen.value = true;

			let keyNum = String(cellIndex + 1).padStart(2, '0');

			performanceDetails.value = portfolioPerformanceReports[0][`key_${keyNum}`][2]

		} catch (error) {
			console.log('error', error);
			performanceDetailIsOpen.value = false;
		}

		console.log('performanceDetails', performanceDetails.value)

	}


	function getLastBusinessDayOfMonth(begin_date, end_date) {
		const begin = new Date(begin_date);
		const end = new Date(end_date);
		let current = getLastDayOfMonth(begin);
		let result = [];

		while (current <= end) {
			result.push(new Date(current));
			current = getLastDayOfMonth(new Date(current.getFullYear(), current.getMonth() + 1, 1));
		}

		return result;
	}

	function getLastDayOfMonth(date) {
		let lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
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


	async function getMonthDetails() {

		console.log('getMonthDetails here')

		if (detailsLoading) return false

		detailsLoading = true
		portfolioYears.value = []
		portfolioTotals.value = []
		portfolioItems.value = []
		portfolioItemsRaw.value = []

		let bundle = bundleId.value

		// let begin
		// let firstTransaction = {}
		// if (!props.begin_date) {
		// 	firstTransaction = await useApi('performanceFirstTransaction.get', {
		// 		params: { id: bundle },
		// 	})
		// 	begin = firstTransaction.transaction_date
		// } else {
		// 	begin = dayjs(props.begin_date).format('YYYY-MM-DD')
		// }

		const endDate = props.end_date


		// It Insane to download whole history, lets asume only last year

		let begin = dayjs(props.end_date).startOf('year').format('YYYY-MM-DD');

		let end = dayjs(endDate).format('YYYY-MM-DD')

		const monthEndDates = getLastBusinessDayOfMonth(begin, end)

		console.log('begin', begin);
		console.log('end', end);
		console.log('monthEndDates', monthEndDates);

		const promises = []

		monthEndDates.forEach((monthEndDate) => {

			monthEndDate = dayjs(monthEndDate).format('YYYY-MM-DD');

			// promises.push(getReports({ period_type: 'ytd', end: monthEndDate, ids: bundle }))
			promises.push(getReports({ period_type: 'mtd', end: monthEndDate, ids: bundle }))

		})

		let yearsBuffer = new Map()

		const allMonths = await Promise.all(promises)

		console.log('allMonths', allMonths);
		console.log('yearsBuffer', yearsBuffer);

		allMonths.forEach((item) =>{

			let parseDate = item.end_date.split('-')

			let defaultMonth = {

			}

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
			} else {
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

			if (!yearsBuffer.has(parseDate[0])) {
				yearsBuffer.set(parseDate[0], defaultMonth)
			}

			// so 0 index for raw value
			// so 1 index for formatted value
			// other is depcreated
			// todo refactor

			if (props.reportOptions.performance_unit === 'percent') {
				yearsBuffer.get(parseDate[0])['key_' + parseDate[1]] = [
					item.grand_return,
					(Math.round(item.grand_return * 10000) / 100) + '%',
					item,
				]
			} else {
				yearsBuffer.get(parseDate[0])['key_' + parseDate[1]] = [
					item.grand_absolute_pl,
					formatNumber(item.grand_absolute_pl),
					item
				]
			}


		})


		let dateTo = dayjs(props.end_date)
		let dateFrom = dayjs(begin)


		for (let [year, months] of yearsBuffer) {
			portfolioPerformanceReports[0] = months // todo refactor, when we consider multiple years
			portfolioYears.value.push(year)

			// todo refactor this cursed code
			portfolioItemsRaw.value.push(
				Object.values(months).map((item, i) => {
					if (
						( year != dateTo.year() || i <= dateTo.month() ) &&
						( year != dateFrom.year() || i >= dateFrom.month() )
					)
						return item[0]
					else return ''
				})
			)

			portfolioItems.value.push(
				Object.values(months).map((item, i) => {
					if (
						( year != dateTo.year() || i <= dateTo.month() ) &&
						( year != dateFrom.year() || i >= dateFrom.month() )
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
				portfolioTotals.value.push(total.grand_return * 100)
			} else {
				portfolioTotals.value.push(formatNumber(total.grand_absolute_pl))
			}
		}
		detailsLoading = false

		await chooseYear(0)
	}

	async function updateBundle(bundleData) {
		let updatedData = JSON.parse(JSON.stringify(currentBundle.value))

		updatedData = { ...updatedData, ...bundleData }
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
			params: { id: bundleId.value },
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
	async function getReports({ period_type, end, ids, type = 'months' }) {

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

		return res
	}
</script>

<style lang="scss" >
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
