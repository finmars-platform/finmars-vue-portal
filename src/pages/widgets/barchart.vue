<template>
	<div class="wrap">
		<div class="title">Balance (time) </div>

		<div class="filters flex">
			<div class="filter_item"
				v-for="(item, i) in categories"
				:key="i"
				:class="{active: categoryName == item}"
				@click="categoryName = item, updateData()"
			>
				{{ item }}
			</div>
		</div>

		<div class="content">
			<canvas id="myChart"><p>Chart</p></canvas>
		</div>
	</div>
</template>

<script setup>

	import moment from 'moment'
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

	let route = useRoute()
	let wId = route.query.wId
	let portfolioId = route.query.portfolioId
	let client = route.query.workspace
	let date_to = route.query.date_to

	let historyStats = await useApi('widgetsHistory.get', {
		params: {
			type: 'nav',
			client,
		},
		filters: {
			portfolio: portfolioId,
			date_to,
		},
		headers: {
			Authorization: 'Token ' + route.query.token
		}
	})
	let active = ref(null)
	let last = ref({})

	let categoryName = ref('Asset Types')
	let categories = reactive(new Set())

	let data = {
		labels: [],
		datasets: [],
	}
	let myChart
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
	]

	function updateData() {
		data.labels = []
		data.datasets = []

		createData()

		send({
			action: 'clickOnChart',
			data: {...last.value},
			date: historyStats.items[historyStats.items.length - 1],
			category: categoryName.value
		})
		myChart.update()
	}


	function createData() {
		historyStats.items.forEach((date) => {
			data.labels.push(moment(date.date).format('MMM YY'))

			date.categories.forEach((category) => {
				categories.add( category.name )
				if ( category.name != categoryName.value ) return false

				category.items.forEach((instrument, key) => {
					if ( !data.datasets[key] ) {
						data.datasets[key] = {
							data: [],
							total: 0
						}
					}

					data.datasets[key].label = instrument.name
					data.datasets[key].data.push(instrument.value)
					data.datasets[key].total += instrument.value
				})
			})
		})
		data.datasets = data.datasets
			.filter((item) => item.total != 0)
			.sort( (a, b) => b.total - a.total)

		last.value = {}

		data.datasets.forEach((item, key) => {
			item.backgroundColor = COLORS[key]

			last.value[item.label] = item.data[item.data.length - 1]
		})
	}

	onMounted(() => {
		initPostMessageBus()

		createData()

		myChart = new Chart('myChart', {
			type: 'bar',
			data: data,
			plugins: [{
				id: 'custom_canvas_background_color',
				afterDraw: (chart, args, options) => {
					if ( !active.value ) return;
					const {ctx} = chart;
					ctx.save();
					ctx.globalCompositeOperation = 'destination-over';
					ctx.fillStyle = options.color;
					ctx.fillRect(
						active.value.element.x - active.value.element.width * 1.25 / 2,
						chart.chartArea.top,
						active.value.element.width * 1.25,
						chart.chartArea.height
					);
					ctx.restore();
				},
				defaults: {
					color: 'rgba(243, 123, 78, 0.2)'
				}
			}],
			options: {
				barPercentage: 0.8,
				categoryPercentage: 1.0,
				borderRadius: 3,
				responsive: true,
				maintainAspectRatio: false,
				scales: {
					x: {
						stacked: true,
					},
					y: {
						stacked: true,
						position: 'right',
						grace: '5%',
						ticks: {
							callback: function(value) {
								var suffixes = ["", "K", "M", "B","T"];
								var suffixNum = Math.floor((""+value).length/3);
								var shortValue = parseFloat((suffixNum != 0 ? (value / Math.pow(1000,suffixNum)) : value).toPrecision(2));
								if (shortValue % 1 != 0) {
										var shortNum = shortValue.toFixed(1);
								}
								return shortValue+suffixes[suffixNum];
							}
						},
						grid: {
							tickWidth: 1,
							tickLength: 1,
						}
					}
				},
				plugins: {
					legend: {
						position: 'bottom',
						align: 'start',
						labels: {
							padding: 20,
							color: '#404040',
							boxWidth: 26,
							boxHeight: 26,
							font: {
								size: 16
							}
						}
					}
				},
				interaction: {
					mode: 'nearest',
					axis: 'x'
				},
				onClick: (evt) => {
					const points = myChart.getElementsAtEventForMode(evt, 'nearest', { intersect: false, axis: 'x' }, true);

					if (points.length) {
						let data = {}

						points.forEach((item, i) => {
							data[myChart.data.datasets[item.datasetIndex].label] = myChart.data.datasets[item.datasetIndex].data[item.index]
						})
						active.value = points[0]
						myChart.update()

						send({
							action: 'clickOnChart',
							data,
							date: historyStats.items[points[0].index],
							category: categoryName.value
						})
					}
        }
			},
		});
	})

	function initPostMessageBus() {
		if ( window == top ) return false

		send({
			action: 'init'
		})

		window.addEventListener("message", (e) => {
			if ( e.data.action == 'ready' ) {
				e.source.postMessage({
					action: 'clickOnChart',
					data: {...last.value},
					date: historyStats.items[historyStats.items.length - 1],
					category: categoryName.value
				}, '*')
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
		height: calc(100vh - 100px);
	}
	.filters {
		margin-top: 12px;
		margin-left: 12px;
		overflow-x: auto;
    overflow-y: hidden;
	}
	.filter_item {
		height: 25px;
		line-height: 25px;
		padding: 0 15px;
		background: $main-darken;
		border-radius: 5px;
		cursor: pointer;

		&.active {
			background: $primary;
			color: $separ;
		}

		&+& {
			margin-left: 20px;
		}
	}
</style>
