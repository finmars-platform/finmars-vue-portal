<template>
	<div class="wrap">
		<div class="title flex aic sb">
			<div>Balance (USD)</div>
			<div>{{ total }}</div>
		</div>

		<div v-if="status == 100" class="content">
			<canvas :id="wid"><p>Chart</p></canvas>
		</div>
		<div class="content flex-column aic jcc" v-else>
			<div class="flex aic">
				<FmIcon v-if="status > 100" class="m-r-8" icon="report_problem" />
				{{ STATUSES[status] }}
			</div>

			<FmLoaderData v-if="status < 100" />
		</div>
	</div>
</template>

<script setup>
	import dayjs from 'dayjs'

	import {
		Chart,
		ArcElement,
		DoughnutController,
		PieController,
		Filler,
		Legend,
		Tooltip,
	} from 'chart.js';

	Chart.register(
		ArcElement,
		DoughnutController,
		PieController,
		Filler,
		Legend,
		Tooltip,
	);
	let props = defineProps({
		wid: {
			type: String,
			required: true
		}
	})

	const STATUSES = {
		0: 'Waiting [barchart] data',
		101: 'Data are not available',
		202: 'No [Date] property',
		203: 'No [Category type] property',
	}
	let status = ref(0)

	const COLORS = [
		'#577590CC',
		'#43AA8BCC',
		'#F9AB4B',
		'#FA6769',
		'#F9C74F',
		'#979BFF',
		'#D9ED92',
		'#C8D7F9',
		'#96B5B4',
		'#AB7967',
		'#577590CC',
		'#43AA8BCC',
		'#F9AB4B',
		'#FA6769',
		'#F9C74F',
		'#979BFF',
		'#D9ED92',
		'#C8D7F9',
		'#96B5B4',
		'#AB7967',
		'#577590CC',
		'#43AA8BCC',
		'#F9AB4B',
		'#FA6769',
		'#F9C74F',
		'#979BFF',
		'#D9ED92',
		'#C8D7F9',
		'#96B5B4',
		'#AB7967'
	]
	let dashStore = useStoreDashboard()
	let widget = dashStore.getWidget(props.wid)

	let inputs = computed(() => {
		let props = dashStore.scope.filter((prop) => prop.cid == widget.id && prop.direct == 'input')
		let obj = {}

		props.forEach((prop) => {
			obj[prop.name] = prop.__val
		})
		return obj
	})

	let outputs = computed(() => {
		let props = dashStore.scope.filter((prop) => prop.cid == widget.id && prop.direct == 'output')
		let obj = {}

		props.forEach((prop) => {
			obj[prop.name] = prop.__val
		})
		return obj
	})

	let total = ref('0 USD')
	let active = ref(null)
	let myChart
	let data = ref({
		labels: [],
		datasets: [
			{
				data: [],
				hoverOffset: 4
			},
			{
				data: [],
				circumference: 180
			}
		],
	})

	onMounted(() => {
		prepareData()
	})

	function createChart() {
		myChart = new Chart(props.wid, {
			type: 'doughnut',
			data: data.value,
			options: {
				cutout: '35%',
				responsive: true,
				maintainAspectRatio: false,
				onResize(chart, size) {
					let { position } = chart.options.plugins.legend

					if ( size.width < 500 && position == 'right' ) {
						chart.options.plugins.legend.position = 'bottom'
						chart.options.plugins.legend.labels.padding = 10

					} else if ( size.width > 500 && position == 'bottom') {

						chart.options.plugins.legend.position = 'right'
						chart.options.plugins.legend.labels.padding = 0
					}
				},
				plugins: {
					legend: {
						position: 'right',
						align: 'center',
						labels: {
							padding: 0,
							color: '#404040',
							boxWidth: 30,
							boxHeight: 30,
							maxWidth: 300,
							font: {
								size: 16
							},
							generateLabels: function(chart) {
								const original = Chart.overrides.pie.plugins.legend.labels.generateLabels;
           			let labelsOriginal = original.call(this, chart);

								labelsOriginal.forEach((item, i) => {
									item.datasetIndex = 0
									item.fillStyle = dashStore.instrColors[inputs.value.category_type + item.text]

									if ( data.value.datasets[0].data.length <= i ) {
										item.datasetIndex = 1
										item.index = i - data.value.datasets[0].data.length
									}
									let percent = Math.round(
										data.value.datasets[item.datasetIndex].data[item.index]
										/ parseFloat(total.value.replaceAll(',', ''))
										* 10000
									) / 100
									item.text = percent + '% | ' + item.text
								})

								return labelsOriginal
							}
						},
						onClick: function(mouseEvent, legendItem, legend) {

						},
					},

					tooltip: {
						callbacks: {
							label: function(context) {
								let labelIndex = context.dataIndex
								if ( context.datasetIndex === 1 ) {
									labelIndex = context.chart.data.datasets[0].data.length
								}

								return context.chart.data.labels[labelIndex] + ': ' + context.formattedValue;
							}
						}
					}
				},
				onClick: (evt) => {
					const points = myChart.getElementsAtEventForMode(evt, 'nearest', { intersect: false, axis: 'x' }, true);

					if (points.length) {
						const firstPoint = points[0];
						console.log('firstPoint:', firstPoint)
						const label = myChart.data.labels[firstPoint.index];
						const value = myChart.data.datasets[firstPoint.datasetIndex].data[firstPoint.index];

					}
        }
			},
		});
	}
	if ( dayjs(inputs.value.date_to).diff(dayjs(), 'day') >= 0 ) {
		status.value = 101
	}
	watch(
		inputs,
		() => prepareData()
	)
	async function prepareData() {
		if ( !inputs.value.date ) {
			status.value = 202
			return false
		}
		if ( !inputs.value.category_type ) {
			status.value = 203
			return false
		}

		if ( dayjs(inputs.value.date).diff(dayjs(), 'day') >= 0 ) {
			status.value = 101
			return false
		}

		let nav = await dashStore.getHistoryNav({
			date: inputs.value.date,
			category: inputs.value.category_type
		})

		if ( !nav || nav.error ) {
			status.value = 101

			return false
		}

		if ( !nav.items ) {
			status.value = 102

			return false
		}

		total.value = new Intl.NumberFormat('en-US', {
			maximumFractionDigits: 2
		}).format(nav.total) + ' USD';

		let items = Object.entries(nav.items)
		items = items
			.filter((item) => item[1] != 0 && item[1] != null)
			.sort( (a, b) => b[1] - a[1])

		let plusColors = []
		let plus = items
			.filter(item => item[1] >= 0)
			.map(item => {
				plusColors.push( dashStore.instrColors[inputs.value.category_type + item[0]] )
				return item[1]
			})

		let totalPlus = plus.length ? plus.reduce((a,b)=> a + b) : 0

		let minusColors = []
		let minus = items
			.filter(item => item[1] < 0)
			.map(item => {
				minusColors.push( dashStore.instrColors[inputs.value.category_type + item[0]] )
				return item[1]
			})

		let totalMinus = Math.abs(minus.length ? minus.reduce((a,b) => a + b) : 1)

		data.value.labels = items.map(item => item[0])
		data.value.datasets = [
			{
				data: plus,
				backgroundColor: plusColors,
				hoverOffset: 4
			},
			{
				data: minus,
				backgroundColor: minusColors,
				circumference: totalPlus == 0
					? 360
					: Math.floor(totalMinus / totalPlus * 360)
			}
		]
		status.value = 100
		await nextTick()

		if ( !myChart ) {
			createChart()
		}

		myChart.update()
	}
	function precisionTick(value) {
		return new Intl.NumberFormat('en-US', {
			notation: "compact",
			maximumFractionDigits: 2
		}).format(value);
	}
</script>

<style lang="scss" scoped>
	.wrap {
		border-radius: 5px;
		border: 1px solid $border;
	}
	.title {
		height: 36px;
		line-height: 36px;
		background: $main-darken;
		padding: 0 20px;
	}
	.content {
		height: calc(100% - 38px);
	}
</style>
