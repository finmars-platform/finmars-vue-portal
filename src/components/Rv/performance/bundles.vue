<template>
	<div class="performance-report-content">
		<FmExpansionPanel title="Period Returns">
			<BaseTable
				:headers="preriodHeaders"
				:items="preriodItems"
				:active="activePeriod"
				colls="repeat(8, 1fr)"
				:cb="choosePortfolio"
			/>
		</FmExpansionPanel>
	</div>
</template>

<script setup>
	import dayjs from 'dayjs'
	import quarterOfYear from 'dayjs/plugin/quarterOfYear'
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
	})
	const emits = defineEmits(['setBundle', 'refreshFunc'])

	let preriodHeaders = computed(() => {
		return [
			'',
			'Daily',
			'MTD',
			'QTD',
			'YTD',
			dayjs(props.end_date).year() - 1,
			dayjs(props.end_date).year() - 2,
			'Incept',
		]
	})
	let preriodItems = ref([])
	let activePeriod = ref(0)
	let bundles = ref([])

	watch(props, () => init())

	emits('refreshFunc', init)
	init()

	function init() {
		// проверка на корректность всех свойств, если что выдать ошибку
		if (!props.end_date) {
			console.log('No end_date:', props.end_date)
			return false
		}

		fetchPortfolioBundles()
	}

	async function fetchPortfolioBundles() {
		// readyStatusData.bundles = false;

		let res = await useApi('portfolioBundles.get');

		const delUserCodeRe = /^del\d{17}$/;

		bundles.value = res.results.filter(
			bundle => !bundle.user_code.match(delUserCodeRe)
		);

		if (props.reportOptions?.bundles?.length) {

			bundles.value = bundles.value.filter(
				bundle => props.reportOptions.bundles.includes(bundle.id)
			)

		}
		// readyStatusData.bundles = true;

		preriodItems.value = []

		bundles.value.forEach((bundle) => {

			preriodItems.value.push({
				name: bundle.user_code,
			})

			let row = preriodItems.value[preriodItems.value.length - 1]

			row.daily = null
			getPeriodData(bundle.id, 'daily').then((day) => {

				console.log('daily return', day);

				let value = parseFloat(day * 100).toFixed(4)
				row.daily = value ? `${value}%` : ''
			})

			row.month = null
			getPeriodData(bundle.id, 'mtd').then((month) => {
				let value = parseFloat(month * 100).toFixed(4)
				row.month = value ? `${value}%` : ''
			})

			row.q = null
			getPeriodData(bundle.id, 'qtd').then((q) => {
				let value = parseFloat(q * 100).toFixed(4)
				row.q = value ? `${value}%` : ''
			})

			row.year = null
			getPeriodData(bundle.id, 'ytd').then((year) => {
				let value = parseFloat(year * 100).toFixed(4)
				row.year = value ? `${value}%` : ''
			})

			row.last = null
			getPeriodData(bundle.id, 'last-year').then((last) => {
				let value = parseFloat(last * 100).toFixed(4)
				row.last = value ? `${value}%` : ''
			})

			row.beforeLast = null
			getPeriodData(bundle.id, 'year-before-last').then((beforeLast) => {
				let value = parseFloat(beforeLast * 100).toFixed(4)
				row.beforeLast = value ? `${value}%` : ''
			})

			row.incept = null
			getPeriodData(bundle.id, 'inception').then((incept) => {
				let value = parseFloat(incept * 100).toFixed(4)
				row.incept = value ? `${value}%` : ''
			})

			console.log('row', row);
		})




		choosePortfolio(0)
	}

	async function choosePortfolio(id) {
		activePeriod.value = id
		emits('setBundle', bundles.value[id])
	}

	async function getPeriodData(ids, periodType, type = 'months') {
		const endDate = dayjs(props.end_date);
		switch (periodType) {
			case 'daily':
				return fetchReportData({ periodType, endDate, ids, type: 'days' });
			case 'mtd':
				return fetchReportData({ periodType, endDate, ids });
			case 'qtd':
				return fetchReportData({ periodType, endDate: endDate, ids });
			case 'ytd':
				return fetchReportData({ periodType, endDate: endDate, ids });
			case 'last-year':
				const lastYear = endDate.subtract(1, 'year').format('YYYY');
				return fetchReportData({ periodType: 'ytd', endDate: `${lastYear}-12-31`, ids });
			case 'year-before-last':
				const yearBeforeLast = endDate.subtract(2, 'years').format('YYYY');
				return fetchReportData({ periodType: 'ytd', endDate: `${yearBeforeLast}-12-31`, ids });
			case 'inception':
				return fetchReportData({ periodType, endDate: endDate, ids });

		}
	}

	function formatDate(date, format = 'YYYY-MM-DD') {
		return dayjs(date).format(format);
	}

	async function fetchReportData({ periodType, endDate, ids, type = 'months' }) {
		try {
			const res = await useApi('performanceReport.post', {
				body: {
					save_report: false,
					period_type: periodType,
					end_date: formatDate(endDate),
					calculation_type: props.calculation_type,
					segmentation_type: type,
					report_currency: props.report_currency,
					bundle: ids,
				},
			});
			return res.grand_return;
		} catch (error) {
			console.error('Error fetching report data:', error);
			return null;
		}
	}

</script>

<style lang="scss">

.performance-report-content {
	.table-row.t_body {
		text-align: right;
	}
}

</style>
