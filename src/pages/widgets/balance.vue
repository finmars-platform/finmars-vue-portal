<template>
	<div class="wrap">
		<div class="title flex aic sb">
			<div>Balance (USD)</div>
			<div>{{ total }}</div>
		</div>

		<div class="content" v-show="status == 100">
			<canvas id="myChart"><p>Chart</p></canvas>
		</div>
		<div class="content flex-column aic jcc" v-if="status > 100">
			<div class="flex aic">
				<FmIcon v-if="status > 100" class="m-r-8" icon="report_problem" />
				{{ STATUSES[status] }}
			</div>
		</div>
	</div>
</template>

<script setup>

	import dayjs from 'dayjs'

	import {
  Chart,
  ArcElement,
  LineElement,
  BarElement,
  PointElement,
  BarController,
  BubbleController,
  DoughnutController,
  LineController,
  PieController,
  PolarAreaController,
  RadarController,
  ScatterController,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  RadialLinearScale,
  TimeScale,
  TimeSeriesScale,
  Decimation,
  Filler,
  Legend,
  Title,
  Tooltip,
  SubTitle
} from 'chart.js';
// Stores the controller so that the chart initialization routine can look it up
	Chart.register(
		ArcElement,
		LineElement,
		BarElement,
		PointElement,
		BarController,
		BubbleController,
		DoughnutController,
		LineController,
		PieController,
		PolarAreaController,
		RadarController,
		ScatterController,
		CategoryScale,
		LinearScale,
		LogarithmicScale,
		RadialLinearScale,
		TimeScale,
		TimeSeriesScale,
		Decimation,
		Filler,
		Legend,
		Title,
		Tooltip,
		SubTitle
	);

	definePageMeta({
		layout: 'auth'
	});

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

	const STATUSES = {
		0: 'Waiting data',
		101: 'Data are not available',
		102: 'Data are missing',
		103: 'Bad/incomplete input data',
		104: 'Data display error',
	}
	let status = ref(0)

	let route = useRoute()
	let wId = route.query.wId
	let portfolioId = route.query.portfolioId
	let client = route.query.workspace
	let date_to = route.query.date_to

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
	function precisionTick(value) {
		return new Intl.NumberFormat('en-US', {
			notation: "compact",
			maximumFractionDigits: 2
		}).format(value);
	}
	onMounted(() => {
		initPostMessageBus()

		if ( status.value == 100 ) {
			createChart()
		}

		setTimeout(() => {
			if ( status.value == 0 ) status.value = 101
		}, 1000 * 5)
	})

	function createChart() {
		myChart = new Chart('myChart', {
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
									item.fillStyle = inheritColors[item.text]

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

	let inheritColors = {}

	function initPostMessageBus() {
		if ( window == top ) return false

		send({
			action: 'init'
		})

		window.addEventListener("message", async (e) => {
			if ( 'clickOnChart' == e.data.action ) {
				if ( dayjs(e.data.date?.date).diff(dayjs(), 'day') >= 0 ) {
					status.value = 101

					return false
				}
				let i = 0
				for ( let prop in e.data.data ) {
					inheritColors[prop] = COLORS[i]
					i++
				}
				let nav = await useApi('widgetsHistory.get', {
					params: {type: 'nav', client},
					filters: {
						portfolio: portfolioId,
						date_from: e.data.date?.date,
						date_to: e.data.date?.date,
					},
					headers: {
						Authorization: 'Token ' + route.query.token
					},
					provider: null
				})

				if ( nav.error ) {
					status.value = 101

					return false
				}

				if ( !nav.items || nav.items.length == 0  ) {
					status.value = 102

					return false
				}

				let currentDate = nav.items.find(item => item.date == e.data.date?.date)

				if ( !currentDate ) return false

				total.value = new Intl.NumberFormat('en-US', {
					maximumFractionDigits: 2
				}).format(currentDate.nav) + ' USD';

				let currentCategory = currentDate.categories.find(item => item.name == e.data.category)
				if ( !currentCategory ) return false
				let items = currentCategory.items
					.filter((item) => item.value != 0)
					.sort( (a, b) => b.value - a.value)

				let plusColors = []
				let plus = items
					.filter(item => item.value >= 0)
					.map(item => {
						plusColors.push( inheritColors[item.name] )
						return item.value
					})

				let totalPlus = plus.length ? plus.reduce((a,b)=> a + b) : 0

				let minusColors = []
				let minus = items
					.filter(item => item.value < 0)
					.map(item => {
						minusColors.push( inheritColors[item.name] )
						return item.value
					})

				let totalMinus = Math.abs(minus.length ? minus.reduce((a,b) => a + b) : 1)

				data.value.labels = items.map(item => item.name)
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
			if ( 'updateOpts' == e.data.action ) {
				portfolioId = e.data.data.portfolioId
				date_to = e.data.data.date_to

				status.value = 0
			}
		});
	}
	function send( data, source = window.parent ) {
		let dataObj = Object.assign(data, {
			wId,
		})
		source.postMessage( dataObj, "*" )
	}
</script>

<style lang="scss" scoped>
	.wrap {
		border-radius: 5px;
		border: 1px solid var(--table-border-color);
	}
	.title {
		height: 36px;
		line-height: 36px;
		background: var(--table-header-background-color);
		padding: 0 20px;
	}
	.content {
		height: calc(100vh - 38px);
	}
</style>
