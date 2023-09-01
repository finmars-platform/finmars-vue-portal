<template>
	<FmExpansionPanel
		:title="currentBundle ? currentBundle.user_code : 'No bundle'"
	>
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
					:disabled="!portfolioItems.length"
					class="primaryIcon m-r-8"
					type="iconBtn"
					icon="edit"
					@click.stop="editBundleIsOpened = true"
				/>

				<FmBtn
					:disabled="!portfolioItems.length"
					class="primaryIcon"
					type="iconBtn"
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
	import dayjs from 'dayjs'

	const props = defineProps({
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

	let currentBundle = computed(() => {
		if (typeof props.bundleId == 'object') return props.bundleId

		return { id: props.bundleId, user_code: 'Need name id: ' + props.bundleId }
	})

	let bundleId = computed(() => {
		if (typeof props.bundleId == 'object' && props.bundleId.id)
			return props.bundleId.id

		if (typeof props.bundleId == 'number') return props.bundleId

		return false
	})

	watch(props, () => {
		if (!bundleId.value) return false

		getMonthDetails()
	})

	let portfolioItems = ref([])
	let portfolioItemsCumm = ref([])
	let portfolioYears = ref([])
	let portfolioTotals = ref([])
	let activeYear = ref(0)
	let detailsLoading = false

	let detailPortfolio = ref('')
	let detailYear = ref('')

	let showBundleActions = ref(false)
	let editBundleIsOpened = ref(false)

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

	async function chooseMonth(id) {
		activeYear.value = id
		detailYear.value = portfolioYears.value[id]

		emits('setYear', {
			datasetMonth: portfolioItems.value[id],
			datasetLine: portfolioItemsCumm.value[id],
			detailYear: detailYear.value,
		})
	}
	async function getMonthDetails() {
		if (detailsLoading) return false

		detailsLoading = true
		portfolioYears.value = []
		portfolioTotals.value = []
		portfolioItems.value = []
		portfolioItemsCumm.value = []

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
		const endDate = props.end_date

		let end = dayjs(endDate).format('YYYY-MM-DD')

		let allMonths = await getReports({ start: begin, end: end, ids: bundle })

		if (allMonths.error) {
			detailsLoading = false
			return false
		}

		let yearsBuffer = new Map()
		let yearsBufferCumm = []

		allMonths.items.reverse().forEach((item) => {
			let parseDate = item.date_to.split('-')

			// key_ fix order
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

			if (!yearsBuffer.has(parseDate[0])) {
				yearsBuffer.set(parseDate[0], defaultMonth)
			}

			yearsBuffer.get(parseDate[0])['key_' + parseDate[1]] = [
				Math.round(item.instrument_return * 10000) / 100,
				Math.round(item.cumulative_return * 10000) / 100,
			]
		})

		let dateTo = dayjs(props.end_date)
		let dateFrom = dayjs(begin)

		for (let [year, months] of yearsBuffer) {
			portfolioYears.value.push(year)
			portfolioItems.value.push(
				Object.values(months).map((item, i) => {
					if (
						(year != dateTo.year() || i <= dateTo.month()) &&
						(year != dateFrom.year() || i >= dateFrom.month())
					)
						return item[0]
					else return ''
				})
			)
			portfolioItemsCumm.value.push(
				Object.values(months).map((item, i) => {
					if (year != dateTo.year() || i <= dateTo.month()) return item[1]
				})
			)

			let end =
				year == dayjs(dateTo).year()
					? dateTo.format('YYYY-MM-DD')
					: `${year}-12-31`

			let total = await getReports({
				start: `${year}-01-01`,
				end: end,
				ids: bundle,
			})
			portfolioTotals.value.push(total.grand_return * 100)
		}
		detailsLoading = false

		chooseMonth(0)
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

		let res = await useApi('portfolioBundles.put', opts)

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

		const res = await useApi('portfolioBundles.delete', {
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
	async function getReports({ start, end, ids, type = 'months' }) {
		let res = await useApi('performanceReport.post', {
			body: {
				save_report: false,
				begin_date: start,
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
