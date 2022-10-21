<template>
	<div class="wrap">
		<div class="title flex aic sb">
			<div>Balance (USD)</div>
			<div>{{ total }}</div>
		</div>

		<div class="content">
			<canvas id="myChart"><p>Chart</p></canvas>
		</div>
	</div>
</template>

<script setup>
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
	})

	let inheritColors = {}

	function initPostMessageBus() {
		if ( window == top ) return false

		send({
			action: 'init'
		})

		window.addEventListener("message", (e) => {
			if ( 'clickOnChart' == e.data.action ) {
				let i = 0
				for ( let prop in e.data.data ) {
					inheritColors[prop] = COLORS[i]
					i++
				}
				let rawData = Object
					.entries(e.data.data)
					.filter(item => item[1] != 0)
					.sort((a,b) => b[1] - a[1])

				let plusColors = []
				let plus = rawData
					.filter(item => item[1] >= 0)
					.map(item => {
						plusColors.push( inheritColors[item[0]] )
						return item[1]
					})

				let totalPlus = plus.length ? plus.reduce((a,b)=> a + b) : 0

				let minusColors = []
				let minus = rawData
					.filter(item => item[1] < 0)
					.map(item => {
						minusColors.push( inheritColors[item[0]] )
						return item[1]
					})

				let totalMinus = Math.abs(minus.length ? minus.reduce((a,b) => a + b) : 1)
				total.value = new Intl.NumberFormat('en-US', {
					maximumFractionDigits: 2
				}).format(totalMinus + totalPlus) + ' USD';
				data.value.labels = rawData.map(item => item[0])
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

				myChart.update()
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
		border: 1px solid $border;
	}
	.title {
		height: 36px;
		line-height: 36px;
		background: $main-darken;
		padding: 0 20px;
	}
	.content {
		height: calc(100vh - 38px);
	}
</style>
